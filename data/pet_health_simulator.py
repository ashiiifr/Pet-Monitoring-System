"""
Pet Health Data Simulator
=========================
Generates realistic pet health sensor data for ML training.
Simulates 7 sensors and derives 20+ health metrics.

Team 12: Mudit Sharma, Divyanshi Dubey, Medha Mishra, Shivangi Verma
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
from typing import Literal


class PetHealthDataSimulator:
    """
    Simulates realistic pet health sensor data.
    
    Sensors Simulated:
        1. PPG Heart Rate (MAX30102)
        2. Body Temperature (DS18B20)
        3. Accelerometer (ADXL345) - X, Y, Z
        4. Gyroscope (MPU6050) - X, Y, Z
        5. GPS (NEO-6M) - Latitude, Longitude
        6. Ambient Sensor (DHT22) - Temperature, Humidity
        7. Real-Time Clock - Timestamp
    """
    
    def __init__(
        self, 
        pet_type: Literal['dog', 'cat'] = 'dog',
        pet_size: Literal['small', 'medium', 'large'] = 'medium',
        pet_weight_kg: float = 15.0,
        days: int = 30,
        home_lat: float = 28.6139,  # Default: Delhi, India
        home_long: float = 77.2090
    ):
        """
        Initialize the pet health data simulator.
        
        Args:
            pet_type: Type of pet ('dog' or 'cat')
            pet_size: Size of pet ('small', 'medium', 'large')
            pet_weight_kg: Weight in kilograms
            days: Number of days to simulate
            home_lat: Home latitude for GPS simulation
            home_long: Home longitude for GPS simulation
        """
        self.pet_type = pet_type
        self.pet_size = pet_size
        self.pet_weight_kg = pet_weight_kg
        self.days = days
        self.samples_per_day = 96  # Every 15 minutes
        self.home_lat = home_lat
        self.home_long = home_long
        
        # Set baseline parameters based on pet type and size
        self._set_baselines()
    
    def _set_baselines(self):
        """Set realistic baseline values based on pet type and size."""
        if self.pet_type == 'dog':
            # Heart rate varies by dog size
            if self.pet_size == 'small':
                self.hr_base = 100  # Small dogs: higher heart rate
                self.hr_std = 15
            elif self.pet_size == 'medium':
                self.hr_base = 90
                self.hr_std = 12
            else:  # large
                self.hr_base = 70  # Large dogs: lower heart rate
                self.hr_std = 10
            
            # Dog vital baselines
            self.temp_base = 38.3  # Normal: 37.5-39.2°C
            self.temp_std = 0.3
            self.resp_base = 20  # Normal: 10-30 breaths/min
            self.resp_std = 4
            self.sleep_hours = 13  # Dogs sleep 12-14 hours
            
        else:  # cat
            self.hr_base = 180  # Cats: 140-220 BPM
            self.hr_std = 20
            self.temp_base = 38.4  # Normal: 37.7-39.1°C
            self.temp_std = 0.3
            self.resp_base = 25  # Normal: 20-30 breaths/min
            self.resp_std = 3
            self.sleep_hours = 14  # Cats sleep 12-16 hours
    
    def _generate_circadian_pattern(self, total_samples: int, base_value: float, amplitude: float) -> np.ndarray:
        """Generate realistic circadian rhythm pattern."""
        time_points = np.linspace(0, 2 * np.pi * self.days, total_samples)
        # Shift pattern so peak is during daytime
        pattern = base_value + amplitude * np.sin(time_points - np.pi/2)
        return pattern
    
    def _generate_activity_pattern(self, total_samples: int) -> np.ndarray:
        """
        Generate realistic activity pattern.
        High during day, low at night, with nap periods.
        """
        activity = np.zeros(total_samples)
        samples_per_hour = self.samples_per_day // 24
        
        for day in range(self.days):
            day_start = day * self.samples_per_day
            
            for hour in range(24):
                hour_start = day_start + hour * samples_per_hour
                hour_end = hour_start + samples_per_hour
                
                # Activity patterns by time of day
                if 0 <= hour < 6:  # Night sleep (12am - 6am)
                    activity[hour_start:hour_end] = np.random.normal(5, 2, samples_per_hour)
                elif 6 <= hour < 9:  # Morning active (6am - 9am)
                    activity[hour_start:hour_end] = np.random.normal(70, 15, samples_per_hour)
                elif 9 <= hour < 12:  # Mid-morning moderate (9am - 12pm)
                    activity[hour_start:hour_end] = np.random.normal(50, 10, samples_per_hour)
                elif 12 <= hour < 14:  # Afternoon nap (12pm - 2pm)
                    activity[hour_start:hour_end] = np.random.normal(20, 5, samples_per_hour)
                elif 14 <= hour < 18:  # Evening active (2pm - 6pm)
                    activity[hour_start:hour_end] = np.random.normal(65, 12, samples_per_hour)
                elif 18 <= hour < 22:  # Night moderate (6pm - 10pm)
                    activity[hour_start:hour_end] = np.random.normal(40, 8, samples_per_hour)
                else:  # Pre-sleep (10pm - 12am)
                    activity[hour_start:hour_end] = np.random.normal(15, 3, samples_per_hour)
        
        # Clip to 0-100 range
        return np.clip(activity, 0, 100)
    
    def _generate_gps_data(self, total_samples: int, activity: np.ndarray) -> tuple:
        """
        Generate GPS coordinates based on activity level.
        Pet moves more when activity is high.
        """
        latitudes = np.zeros(total_samples)
        longitudes = np.zeros(total_samples)
        
        # Start at home
        current_lat = self.home_lat
        current_long = self.home_long
        
        for i in range(total_samples):
            # Movement magnitude based on activity
            if activity[i] > 60:  # Active: can move more
                max_move = 0.001  # ~100m movement possible
            elif activity[i] > 30:  # Moderate
                max_move = 0.0003  # ~30m movement
            else:  # Resting
                max_move = 0.00005  # ~5m (slight movement)
            
            # Random walk with tendency to return home
            home_pull = 0.1  # Tendency to stay near home
            
            delta_lat = np.random.normal(0, max_move) - home_pull * (current_lat - self.home_lat)
            delta_long = np.random.normal(0, max_move) - home_pull * (current_long - self.home_long)
            
            current_lat += delta_lat
            current_long += delta_long
            
            latitudes[i] = current_lat
            longitudes[i] = current_long
        
        return latitudes, longitudes
    
    def _add_health_anomaly(self, data: pd.DataFrame, anomaly_type: str, start_day: int, duration_days: int) -> pd.DataFrame:
        """
        Inject realistic health anomalies into the data.
        
        Anomaly Types:
            - fever: Elevated temperature, increased HR, reduced activity
            - anxiety: High HR, restlessness, scratching
            - arthritis: Reduced movement, low intensity
            - dehydration: Temperature changes, elevated HR
        """
        start_idx = start_day * self.samples_per_day
        end_idx = min(start_idx + (duration_days * self.samples_per_day), len(data))
        
        if anomaly_type == 'fever':
            # Gradual temperature increase (realistic fever buildup)
            temp_increase = np.linspace(0, 1.5, end_idx - start_idx)
            data.loc[start_idx:end_idx-1, 'body_temperature'] += temp_increase
            data.loc[start_idx:end_idx-1, 'heart_rate'] += temp_increase * 10
            data.loc[start_idx:end_idx-1, 'activity_level'] *= 0.5  # Lethargy
            
        elif anomaly_type == 'anxiety':
            anxiety_samples = end_idx - start_idx
            data.loc[start_idx:end_idx-1, 'heart_rate'] += np.random.normal(20, 5, anxiety_samples)
            data.loc[start_idx:end_idx-1, 'activity_level'] += np.random.normal(15, 5, anxiety_samples)
            data.loc[start_idx:end_idx-1, 'accel_magnitude'] += np.random.normal(2, 0.5, anxiety_samples)
            
        elif anomaly_type == 'arthritis':
            # Reduced activity, especially in morning (stiff joints)
            data.loc[start_idx:end_idx-1, 'activity_level'] *= 0.6
            data.loc[start_idx:end_idx-1, 'movement_intensity'] *= 0.5
            data.loc[start_idx:end_idx-1, 'step_count'] *= 0.4
            
        elif anomaly_type == 'dehydration':
            dehydration_samples = end_idx - start_idx
            data.loc[start_idx:end_idx-1, 'heart_rate'] += 15
            data.loc[start_idx:end_idx-1, 'body_temperature'] += 0.5
            data.loc[start_idx:end_idx-1, 'activity_level'] *= 0.7
        
        return data
    
    def generate_healthy_data(self) -> pd.DataFrame:
        """Generate baseline healthy pet data with all sensor readings."""
        total_samples = self.days * self.samples_per_day
        
        # ===== SENSOR 1: Timestamp (RTC) =====
        start_date = datetime.now() - timedelta(days=self.days)
        timestamps = [start_date + timedelta(minutes=15*i) for i in range(total_samples)]
        hours = np.array([ts.hour for ts in timestamps])
        
        # ===== SENSOR 2: Heart Rate (PPG) =====
        activity = self._generate_activity_pattern(total_samples)
        hr_circadian = self._generate_circadian_pattern(total_samples, self.hr_base, 10)
        # Heart rate influenced by activity
        heart_rate = hr_circadian + (activity * 0.3) + np.random.normal(0, self.hr_std, total_samples)
        heart_rate = np.clip(heart_rate, self.hr_base - 30, self.hr_base + 50)
        
        # ===== SENSOR 3: Body Temperature (Thermistor) =====
        temperature = self._generate_circadian_pattern(total_samples, self.temp_base, 0.2)
        temperature += np.random.normal(0, self.temp_std, total_samples)
        temperature = np.clip(temperature, self.temp_base - 0.8, self.temp_base + 0.6)
        
        # ===== SENSOR 4: Accelerometer (ADXL345) =====
        # Generate 3-axis acceleration based on activity
        accel_x = (activity / 20) * np.random.normal(1, 0.3, total_samples)
        accel_y = (activity / 20) * np.random.normal(1, 0.3, total_samples)
        accel_z = 9.8 + (activity / 50) * np.random.normal(0, 0.5, total_samples)  # Gravity + movement
        accel_magnitude = np.sqrt(accel_x**2 + accel_y**2 + accel_z**2)
        
        # ===== SENSOR 5: Gyroscope (MPU6050) =====
        # Angular velocity based on activity
        gyro_x = (activity / 30) * np.random.normal(0, 10, total_samples)
        gyro_y = (activity / 30) * np.random.normal(0, 10, total_samples)
        gyro_z = (activity / 30) * np.random.normal(0, 5, total_samples)
        
        # ===== SENSOR 6: GPS (NEO-6M) =====
        latitudes, longitudes = self._generate_gps_data(total_samples, activity)
        
        # ===== SENSOR 7: Ambient Sensor (DHT22) =====
        ambient_temp = self._generate_circadian_pattern(total_samples, 22, 5)
        ambient_temp += np.random.normal(0, 1, total_samples)
        ambient_temp = np.clip(ambient_temp, 15, 35)
        humidity = np.random.normal(50, 10, total_samples)
        humidity = np.clip(humidity, 20, 90)
        
        # ===== DERIVED METRICS =====
        
        # Step count (from accelerometer peaks)
        step_count = (activity * 0.5 + np.random.normal(0, 5, total_samples)).astype(int)
        step_count = np.clip(step_count, 0, 100)
        
        # Sleep detection (inverse of activity)
        sleep_indicator = (activity < 15).astype(int)
        
        # Movement intensity (0-10 scale)
        movement_intensity = (activity / 10) + np.random.normal(0, 0.5, total_samples)
        movement_intensity = np.clip(movement_intensity, 0, 10)
        
        # Movement type classification
        movement_type = np.where(activity < 15, 'resting',
                        np.where(activity < 40, 'walking',
                        np.where(activity < 70, 'active', 'running')))
        
        # Distance traveled (from GPS)
        distances = np.zeros(total_samples)
        for i in range(1, total_samples):
            # Haversine approximation (simplified for small distances)
            lat_diff = (latitudes[i] - latitudes[i-1]) * 111000  # meters
            long_diff = (longitudes[i] - longitudes[i-1]) * 111000 * np.cos(np.radians(latitudes[i]))
            distances[i] = np.sqrt(lat_diff**2 + long_diff**2)
        
        # Calories burned (simplified formula)
        calories = (activity * 0.05 * self.pet_weight_kg / 60)  # Per 15-min interval
        
        # Stress score (composite)
        stress_score = (
            ((heart_rate - self.hr_base) / self.hr_base * 30) +
            (activity * 0.2) +
            np.random.normal(20, 5, total_samples)
        )
        stress_score = np.clip(stress_score, 0, 100)
        
        # Geofence (distance from home)
        home_distance = np.sqrt(
            ((latitudes - self.home_lat) * 111000)**2 + 
            ((longitudes - self.home_long) * 111000 * np.cos(np.radians(self.home_lat)))**2
        )
        geofence_alert = (home_distance > 100).astype(int)  # Alert if >100m from home
        
        # Create DataFrame with all features
        data = pd.DataFrame({
            # Timestamp
            'timestamp': timestamps,
            'hour_of_day': hours,
            'day_of_week': [ts.weekday() for ts in timestamps],
            
            # Raw Sensor Data
            'heart_rate': heart_rate.round(1),
            'body_temperature': temperature.round(2),
            'accel_x': accel_x.round(3),
            'accel_y': accel_y.round(3),
            'accel_z': accel_z.round(3),
            'accel_magnitude': accel_magnitude.round(3),
            'gyro_x': gyro_x.round(2),
            'gyro_y': gyro_y.round(2),
            'gyro_z': gyro_z.round(2),
            'latitude': latitudes.round(6),
            'longitude': longitudes.round(6),
            'ambient_temperature': ambient_temp.round(1),
            'humidity': humidity.round(1),
            
            # Derived Metrics
            'activity_level': activity.round(1),
            'step_count': step_count,
            'sleep_indicator': sleep_indicator,
            'movement_intensity': movement_intensity.round(1),
            'movement_type': movement_type,
            'distance_meters': distances.round(2),
            'calories_burned': calories.round(2),
            'stress_score': stress_score.round(1),
            'home_distance_m': home_distance.round(1),
            'geofence_alert': geofence_alert,
            
            # Label
            'health_status': 'healthy'
        })
        
        return data
    
    def generate_unhealthy_data(
        self, 
        anomaly_type: Literal['fever', 'anxiety', 'arthritis', 'dehydration'] = 'fever',
        anomaly_start_day: int = 10,
        duration_days: int = 5
    ) -> pd.DataFrame:
        """Generate data with health anomalies injected."""
        data = self.generate_healthy_data()
        data = self._add_health_anomaly(data, anomaly_type, anomaly_start_day, duration_days)
        
        # Update health status label for anomaly period
        start_idx = anomaly_start_day * self.samples_per_day
        end_idx = min(start_idx + (duration_days * self.samples_per_day), len(data))
        data.loc[start_idx:end_idx-1, 'health_status'] = anomaly_type
        
        return data
    
    def generate_mixed_dataset(
        self, 
        num_healthy: int = 5, 
        num_unhealthy: int = 5
    ) -> pd.DataFrame:
        """
        Generate mixed dataset with multiple pets.
        Half healthy, half with various conditions.
        """
        all_data = []
        pet_sizes = ['small', 'medium', 'large']
        anomaly_types = ['fever', 'anxiety', 'arthritis', 'dehydration']
        
        # Generate healthy pet data
        for i in range(num_healthy):
            self.pet_size = random.choice(pet_sizes)
            self._set_baselines()
            
            data = self.generate_healthy_data()
            data['pet_id'] = f'pet_{i+1:03d}'
            data['pet_type'] = self.pet_type
            data['pet_size'] = self.pet_size
            all_data.append(data)
            print(f"Generated healthy data for pet_{i+1:03d} ({self.pet_size} {self.pet_type})")
        
        # Generate unhealthy pet data with different anomalies
        for i in range(num_unhealthy):
            self.pet_size = random.choice(pet_sizes)
            self._set_baselines()
            
            anomaly = anomaly_types[i % len(anomaly_types)]
            start_day = random.randint(5, 15)
            duration = random.randint(3, 7)
            
            data = self.generate_unhealthy_data(anomaly, start_day, duration)
            data['pet_id'] = f'pet_{num_healthy + i + 1:03d}'
            data['pet_type'] = self.pet_type
            data['pet_size'] = self.pet_size
            all_data.append(data)
            print(f"Generated {anomaly} data for pet_{num_healthy + i + 1:03d} ({self.pet_size} {self.pet_type})")
        
        # Combine all data
        combined_data = pd.concat(all_data, ignore_index=True)
        return combined_data


if __name__ == "__main__":
    print("=" * 60)
    print("Pet Health Data Simulator")
    print("=" * 60)
    
    # Create simulator for a medium-sized dog
    simulator = PetHealthDataSimulator(
        pet_type='dog', 
        pet_size='medium', 
        pet_weight_kg=15.0,
        days=30
    )
    
    # Generate healthy data sample
    print("\n1. Generating healthy pet data...")
    healthy_data = simulator.generate_healthy_data()
    print(f"   Generated {len(healthy_data)} samples")
    print("\n   Sample data:")
    print(healthy_data[['timestamp', 'heart_rate', 'body_temperature', 'activity_level', 'health_status']].head(5))
    
    # Generate data with fever
    print("\n2. Generating fever anomaly data...")
    fever_data = simulator.generate_unhealthy_data('fever', anomaly_start_day=10, duration_days=5)
    fever_samples = fever_data[fever_data['health_status'] == 'fever']
    print(f"   Fever samples: {len(fever_samples)}")
    
    # Show comparison
    print("\n3. Healthy vs Fever Comparison:")
    print("   Healthy - Mean values:")
    print(f"     Heart Rate: {healthy_data['heart_rate'].mean():.1f} BPM")
    print(f"     Temperature: {healthy_data['body_temperature'].mean():.2f}°C")
    print(f"     Activity: {healthy_data['activity_level'].mean():.1f}")
    print("   Fever - Mean values:")
    print(f"     Heart Rate: {fever_samples['heart_rate'].mean():.1f} BPM")
    print(f"     Temperature: {fever_samples['body_temperature'].mean():.2f}°C")
    print(f"     Activity: {fever_samples['activity_level'].mean():.1f}")
    
    # Generate full dataset
    print("\n4. Generating mixed training dataset...")
    mixed_data = simulator.generate_mixed_dataset(num_healthy=3, num_unhealthy=4)
    print(f"   Total samples: {len(mixed_data)}")
    print(f"   Unique pets: {mixed_data['pet_id'].nunique()}")
    print("\n   Health status distribution:")
    print(mixed_data['health_status'].value_counts())
    
    # Save to CSV
    output_path = 'pet_health_data.csv'
    mixed_data.to_csv(output_path, index=False)
    print(f"\n5. Data saved to '{output_path}'")
    print("=" * 60)
