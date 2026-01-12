"""
Pet Health ML Model Training
=============================
Trains anomaly detection and disease classification models.

Team 12: Mudit Sharma, Divyanshi Dubey, Medha Mishra, Shivangi Verma
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime

# Scikit-learn imports
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)
import pickle


# ==================== CONFIGURATION ====================
DATA_PATH = 'pet_health_data.csv'
MODELS_DIR = '../models'
RANDOM_STATE = 42

# Features to use for training (excluding timestamp, labels, and identifiers)
FEATURE_COLUMNS = [
    'hour_of_day',
    'heart_rate',
    'body_temperature',
    'accel_magnitude',
    'gyro_x',
    'gyro_y',
    'gyro_z',
    'ambient_temperature',
    'humidity',
    'activity_level',
    'step_count',
    'sleep_indicator',
    'movement_intensity',
    'distance_meters',
    'calories_burned',
    'stress_score',
    'home_distance_m',
    'geofence_alert'
]


def load_and_prepare_data(data_path: str) -> tuple:
    """
    Load data and prepare features for training.
    
    Returns:
        X: Feature matrix
        y: Labels (health_status)
        df: Full dataframe
    """
    print("Loading data...")
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} samples")
    
    # Display class distribution
    print("\nHealth Status Distribution:")
    print(df['health_status'].value_counts())
    
    # Select features
    X = df[FEATURE_COLUMNS].copy()
    
    # Handle any missing values
    X = X.fillna(X.mean())
    
    # Encode labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df['health_status'])
    
    print(f"\nFeatures: {len(FEATURE_COLUMNS)}")
    print(f"Classes: {list(label_encoder.classes_)}")
    
    return X, y, df, label_encoder


def train_anomaly_detector(X_train: np.ndarray, scaler: StandardScaler) -> IsolationForest:
    """
    Train Isolation Forest for anomaly detection.
    Detects unusual health patterns that deviate from normal.
    """
    print("\n" + "=" * 50)
    print("Training Anomaly Detection Model (Isolation Forest)")
    print("=" * 50)
    
    # Train on scaled features
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,  # Expect ~10% anomalies
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    
    model.fit(X_train)
    print("[OK] Anomaly detector trained successfully")
    
    return model


def train_disease_classifier(
    X_train: np.ndarray, 
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    label_encoder: LabelEncoder
) -> RandomForestClassifier:
    """
    Train Random Forest classifier to identify specific health conditions.
    """
    print("\n" + "=" * 50)
    print("Training Disease Classification Model (Random Forest)")
    print("=" * 50)
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    print(f"\nModel Performance:")
    print(f"  Accuracy:  {accuracy:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall:    {recall:.4f}")
    print(f"  F1-Score:  {f1:.4f}")
    
    print(f"\nClassification Report:")
    print(classification_report(
        y_test, 
        y_pred, 
        target_names=label_encoder.classes_
    ))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': FEATURE_COLUMNS,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("Top 10 Important Features:")
    print(feature_importance.head(10).to_string(index=False))
    
    return model, {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'feature_importance': feature_importance.to_dict('records')
    }


def save_models(
    scaler: StandardScaler,
    anomaly_detector: IsolationForest,
    classifier: RandomForestClassifier,
    label_encoder: LabelEncoder,
    metrics: dict,
    models_dir: str
):
    """Save trained models and metadata."""
    os.makedirs(models_dir, exist_ok=True)
    
    # Save scaler
    scaler_path = os.path.join(models_dir, 'scaler.pkl')
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"[OK] Saved scaler to {scaler_path}")
    
    # Save anomaly detector
    anomaly_path = os.path.join(models_dir, 'anomaly_detector.pkl')
    with open(anomaly_path, 'wb') as f:
        pickle.dump(anomaly_detector, f)
    print(f"[OK] Saved anomaly detector to {anomaly_path}")
    
    # Save classifier
    classifier_path = os.path.join(models_dir, 'disease_classifier.pkl')
    with open(classifier_path, 'wb') as f:
        pickle.dump(classifier, f)
    print(f"[OK] Saved classifier to {classifier_path}")
    
    # Save label encoder
    encoder_path = os.path.join(models_dir, 'label_encoder.pkl')
    with open(encoder_path, 'wb') as f:
        pickle.dump(label_encoder, f)
    print(f"[OK] Saved label encoder to {encoder_path}")
    
    # Save metadata
    metadata = {
        'features': FEATURE_COLUMNS,
        'classes': list(label_encoder.classes_),
        'metrics': {
            'accuracy': float(metrics['accuracy']),
            'precision': float(metrics['precision']),
            'recall': float(metrics['recall']),
            'f1_score': float(metrics['f1_score'])
        },
        'trained_at': datetime.now().isoformat(),
        'model_version': '1.0.0'
    }
    
    metadata_path = os.path.join(models_dir, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"[OK] Saved metadata to {metadata_path}")


def predict_health(data: dict, models_dir: str = MODELS_DIR) -> dict:
    """
    Make predictions on new data.
    
    Args:
        data: Dictionary with sensor readings
        models_dir: Path to saved models
    
    Returns:
        Dictionary with predictions
    """
    # Load models
    with open(os.path.join(models_dir, 'scaler.pkl'), 'rb') as f:
        scaler = pickle.load(f)
    with open(os.path.join(models_dir, 'anomaly_detector.pkl'), 'rb') as f:
        anomaly_detector = pickle.load(f)
    with open(os.path.join(models_dir, 'disease_classifier.pkl'), 'rb') as f:
        classifier = pickle.load(f)
    with open(os.path.join(models_dir, 'label_encoder.pkl'), 'rb') as f:
        label_encoder = pickle.load(f)
    
    # Prepare features
    features = np.array([[data.get(col, 0) for col in FEATURE_COLUMNS]])
    features_scaled = scaler.transform(features)
    
    # Anomaly detection (-1 = anomaly, 1 = normal)
    anomaly_pred = anomaly_detector.predict(features_scaled)[0]
    anomaly_score = anomaly_detector.score_samples(features_scaled)[0]
    
    # Normalize anomaly score to 0-100 (higher = more anomalous)
    anomaly_score_normalized = max(0, min(100, 50 - anomaly_score * 100))
    
    # Disease classification
    disease_pred = classifier.predict(features_scaled)[0]
    disease_proba = classifier.predict_proba(features_scaled)[0]
    disease_label = label_encoder.inverse_transform([disease_pred])[0]
    
    # Confidence
    confidence = float(max(disease_proba))
    
    # Generate health status
    is_anomaly = anomaly_pred == -1
    
    return {
        'is_anomaly': is_anomaly,
        'anomaly_score': round(anomaly_score_normalized, 1),
        'health_status': disease_label,
        'confidence': round(confidence * 100, 1),
        'class_probabilities': {
            label_encoder.classes_[i]: round(float(p) * 100, 1)
            for i, p in enumerate(disease_proba)
        }
    }


if __name__ == "__main__":
    print("=" * 60)
    print("Pet Health ML Model Training")
    print("=" * 60)
    
    # Load data
    X, y, df, label_encoder = load_and_prepare_data(DATA_PATH)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train anomaly detector
    anomaly_detector = train_anomaly_detector(X_train_scaled, scaler)
    
    # Train disease classifier
    classifier, metrics = train_disease_classifier(
        X_train_scaled, y_train,
        X_test_scaled, y_test,
        label_encoder
    )
    
    # Save models
    print("\n" + "=" * 50)
    print("Saving Models")
    print("=" * 50)
    save_models(
        scaler, anomaly_detector, classifier, 
        label_encoder, metrics, MODELS_DIR
    )
    
    # Test prediction
    print("\n" + "=" * 50)
    print("Testing Prediction")
    print("=" * 50)
    
    # Sample healthy reading
    test_healthy = {
        'hour_of_day': 14,
        'heart_rate': 85,
        'body_temperature': 38.3,
        'accel_magnitude': 10.0,
        'gyro_x': 5.0,
        'gyro_y': 5.0,
        'gyro_z': 2.0,
        'ambient_temperature': 22.0,
        'humidity': 50.0,
        'activity_level': 50.0,
        'step_count': 25,
        'sleep_indicator': 0,
        'movement_intensity': 5.0,
        'distance_meters': 10.0,
        'calories_burned': 5.0,
        'stress_score': 25.0,
        'home_distance_m': 10.0,
        'geofence_alert': 0
    }
    
    result = predict_health(test_healthy)
    print(f"\nTest Healthy Reading:")
    print(f"  Health Status: {result['health_status']}")
    print(f"  Confidence: {result['confidence']}%")
    print(f"  Anomaly Score: {result['anomaly_score']}")
    print(f"  Is Anomaly: {result['is_anomaly']}")
    
    # Sample fever reading
    test_fever = {
        'hour_of_day': 14,
        'heart_rate': 120,  # Elevated
        'body_temperature': 39.8,  # Fever
        'accel_magnitude': 10.0,
        'gyro_x': 3.0,
        'gyro_y': 3.0,
        'gyro_z': 1.0,
        'ambient_temperature': 22.0,
        'humidity': 50.0,
        'activity_level': 15.0,  # Low (lethargic)
        'step_count': 5,
        'sleep_indicator': 1,
        'movement_intensity': 1.5,
        'distance_meters': 2.0,
        'calories_burned': 1.0,
        'stress_score': 60.0,
        'home_distance_m': 5.0,
        'geofence_alert': 0
    }
    
    result = predict_health(test_fever)
    print(f"\nTest Fever Reading:")
    print(f"  Health Status: {result['health_status']}")
    print(f"  Confidence: {result['confidence']}%")
    print(f"  Anomaly Score: {result['anomaly_score']}")
    print(f"  Is Anomaly: {result['is_anomaly']}")
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("Models saved to:", os.path.abspath(MODELS_DIR))
    print("=" * 60)
