import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Configuration
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(os.path.dirname(DATA_DIR), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

class AdvancedSimulator:
    """Generates time-series sequences for training"""
    def __init__(self):
        self.dt = 15  # 15 seconds per step for training logic consistency
        
    def generate_sequence(self, condition='healthy', length=100):
        # Base parameters
        if condition == 'healthy':
            hr_base, temp_base, stress_base = 85, 38.3, 20
            hr_drift, temp_drift = 0, 0
        elif condition == 'fever_onset':
            hr_base, temp_base, stress_base = 85, 38.3, 30
            hr_drift, temp_drift = 0.5, 0.05  # Rising trends
        elif condition == 'anxiety_attack':
            hr_base, temp_base, stress_base = 110, 38.5, 80
            hr_drift, temp_drift = 0, 0
        elif condition == 'recovering':
            hr_base, temp_base, stress_base = 120, 39.5, 50
            hr_drift, temp_drift = -0.5, -0.05 # Falling trends
            
        data = []
        hr, temp, stress = hr_base, temp_base, stress_base
        
        for i in range(length):
            # Apply drift
            hr += hr_drift + np.random.normal(0, 2)
            temp += temp_drift + np.random.normal(0, 0.05)
            stress += np.random.normal(0, 5)
            
            # Clip
            hr = np.clip(hr, 40, 220)
            temp = np.clip(temp, 36, 42)
            stress = np.clip(stress, 0, 100)
            
            data.append({
                'heart_rate': hr,
                'body_temperature': temp,
                'stress_score': stress,
                'activity_level': np.random.normal(30, 10),
                'condition': condition
            })
            
        return pd.DataFrame(data)

def extract_rolling_features(df, window=5):
    """Compute rolling statistics for time-series model"""
    # Calculate rolling mean and standard deviation
    rolled = df[['heart_rate', 'body_temperature', 'stress_score']].rolling(window=window)
    
    features = pd.DataFrame()
    features['hr_mean'] = rolled['heart_rate'].mean()
    features['hr_std'] = rolled['heart_rate'].std()
    features['temp_mean'] = rolled['body_temperature'].mean()
    features['temp_std'] = rolled['body_temperature'].std()
    features['stress_mean'] = rolled['stress_score'].mean()
    
    # Calculate slope (simple differencing for trend)
    features['hr_trend'] = df['heart_rate'].diff(window)
    features['temp_trend'] = df['body_temperature'].diff(window)
    
    features = features.fillna(0)
    return features

def train_advanced_models():
    print("Generating advanced synthetic time-series data...")
    sim = AdvancedSimulator()
    
    # Generate datasets
    print("  - Simulating healthy baseline...")
    df_healthy = sim.generate_sequence('healthy', 2000)
    
    print("  - Simulating fever onset...")
    df_fever = sim.generate_sequence('fever_onset', 500)
    
    print("  - Simulating anxiety episodes...")
    df_anxiety = sim.generate_sequence('anxiety_attack', 500)
    
    # Combine
    df_all = pd.concat([df_healthy, df_fever, df_anxiety]).reset_index(drop=True)
    
    # Extract Features
    print("Extracting rolling window features...")
    X = extract_rolling_features(df_all)
    y = df_all['condition']
    
    # Train Classifier
    print("Training Random Forest Classifier...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    
    print("Model Performance:")
    print(classification_report(y_test, rf.predict(X_test)))
    
    # Save Models
    print("Saving models...")
    with open(os.path.join(MODELS_DIR, 'trend_classifier.pkl'), 'wb') as f:
        pickle.dump(rf, f)
        
    print("Done!")

if __name__ == "__main__":
    train_advanced_models()
