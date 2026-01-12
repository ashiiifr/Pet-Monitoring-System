import time
import threading
import numpy as np
import pandas as pd
import pickle
import os
from collections import deque
from datetime import datetime
from flask_socketio import SocketIO

# Model paths
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

class BackgroundSimulator:
    def __init__(self, socketio: SocketIO):
        self.socketio = socketio
        self.active_pets = {}  # {pet_id: {'thread': Thread, 'stop_event': Event, 'state': dict, 'history': deque}}
        self.lock = threading.Lock()
        self.model = self._load_model()

    def _load_model(self):
        try:
            with open(os.path.join(MODELS_DIR, 'trend_classifier.pkl'), 'rb') as f:
                print("[ML] Trend Classifier loaded successfully")
                return pickle.load(f)
        except Exception as e:
            print(f"[WARNING] Could not load trend classifier: {e}")
            return None

    def start_simulation(self, pet_id):
        with self.lock:
            if pet_id in self.active_pets:
                return  # Already simulating

            stop_event = threading.Event()
            # Initial state
            state = {
                'heart_rate': 80,
                'temperature': 38.5,
                'activity': 10,
                'stress_score': 20,
                'timestamp': time.time(),
                'trend_factor': 0  # Used for ML trend injection
            }
            
            # History buffer for rolling window (size 5 to match training)
            history = deque(maxlen=5)
            
            self.active_pets[pet_id] = {
                'stop_event': stop_event,
                'state': state,
                'history': history
            }
            
            thread = threading.Thread(target=self._simulation_loop, args=(pet_id, stop_event))
            thread.daemon = True
            thread.start()
            print(f"Started simulation for pet {pet_id}")

    def stop_simulation(self, pet_id):
        with self.lock:
            if pet_id in self.active_pets:
                self.active_pets[pet_id]['stop_event'].set()
                del self.active_pets[pet_id]
                print(f"Stopped simulation for pet {pet_id}")

    def _extract_features(self, history):
        """Calculate features from history buffer matches training logic"""
        if len(history) < 2:
            return None
            
        df = pd.DataFrame(list(history))
        
        # Simple rolling stats (using the whole buffer as the window)
        features = pd.DataFrame([{
            'hr_mean': df['heart_rate'].mean(),
            'hr_std': df['heart_rate'].std() if len(df) > 1 else 0,
            'temp_mean': df['temperature'].mean(),
            'temp_std': df['temperature'].std() if len(df) > 1 else 0,
            'stress_mean': df['stress_score'].mean(),
            # Simple trend: last - first
            'hr_trend': df['heart_rate'].iloc[-1] - df['heart_rate'].iloc[0],
            'temp_trend': df['temperature'].iloc[-1] - df['temperature'].iloc[0]
        }])
        
        return features.fillna(0)

    def _simulation_loop(self, pet_id, stop_event):
        """Continuous loop generating data every second"""
        while not stop_event.is_set():
            with self.lock:
                pet_data = self.active_pets.get(pet_id)
                if not pet_data: break
                current_state = pet_data['state']
                history = pet_data['history']

            # --- Data Evolution Logic (Time-Series Style) ---
            new_time = time.time()
            
            # Random Walk parameters
            hr_noise = np.random.normal(0, 2)
            current_state['heart_rate'] = np.clip(
                current_state['heart_rate'] + hr_noise, 40, 200
            )

            current_state['temperature'] = np.clip(
                current_state['temperature'] + np.random.normal(0, 0.1), 37.0, 41.0
            )
            
            current_state['stress_score'] = np.clip(
                current_state['stress_score'] + np.random.normal(0, 2), 0, 100
            )

            # Activity Bursts
            if np.random.random() > 0.95:
                current_state['activity'] = np.random.normal(50, 20)
            else:
                current_state['activity'] = max(0, current_state['activity'] - 1) # Decay

            current_state['timestamp'] = new_time

            # Update History
            history.append({
                'heart_rate': current_state['heart_rate'],
                'temperature': current_state['temperature'],
                'stress_score': current_state['stress_score']
            })

            # --- ML Inference ---
            status = "analyzing..."
            confidence = 0
            
            if self.model and len(history) >= 5:
                try:
                    features = self._extract_features(history)
                    prediction = self.model.predict(features)[0]
                    probs = self.model.predict_proba(features)[0]
                    confidence = max(probs) * 100
                    status = prediction
                except Exception as e:
                    print(f"Inference error: {e}")
                    status = "error"

            # --- Emit Data ---
            payload = {
                'pet_id': pet_id,
                'timestamp': datetime.fromtimestamp(new_time).isoformat(),
                'heart_rate': round(current_state['heart_rate'], 1),
                'temperature': round(current_state['temperature'], 2),
                'activity_level': round(current_state['activity'], 1),
                'stress_score': round(current_state['stress_score'], 1),
                'ml_status': status,
                'ml_confidence': round(confidence, 1)
            }
            
            self.socketio.emit('live_reading', payload, to=f"pet_{pet_id}")
            
            # Sleep to match "real-time"
            time.sleep(1.0)
