# 🦅 PROJECT TITAN: THE COMPLETE TECHNICAL BIBLE
> **Strictly Confidential - For Technical Evaluation Only**
> **Version:** 2.0 (Deep Dive)
> **Target Audience:** Algorithm Evaluators, System Architects, VC Funding Panels

---

## 🚀 1. EXECUTIVE SUMMARY (The "Elevator Pitch")

**The Problem:** Traditional pet healthcare is *reactive*. Veterinarians only see data when a pet is already sick. There is zero visibility into the "between-visits" data gap (99% of a pet's life).

**The Solution:** Titan is a **Military-Grade Predictive Surveillance Ecosystem** for high-value animals. It moves beyond "fitness tracking" into "clinical survival monitoring" by establishing a real-time Neural Link between the biological entity (pet) and the clinical observer (vet).

**The Novelty:**
1.  **Biometric Handshake:** Security protocols usually reserved for fintech, applied to biological data.
2.  **Titan Glass Interface:** A "Head-Up Display" (HUD) aesthetic that prioritizes high inter-cranial data processing speed (Cognitive Load Reduction).
3.  **Active Anomaly Detection:** An always-on ML sentinel that detects deviation from homeostatic baselines.

---

## 🏛️ 2. SYSTEM ARCHITECTURE (The "Brain & Body")

The system follows a **Hub-and-Spoke** topology with three distinct nodes:

### Node A: The Field Operator (Mobile App)
*   **Role**: Data Acquisition & Edge Interface.
*   **Tech Stack**: React Native (Expo SDK 52), Victory Native (Real-time Charts).
*   **Key Capability**: **Bluetooth Low Energy (BLE)** simulation to ingest raw telemetry from the Smart Collar.
*   **Visual Language**: Dark Mode "Gunmetal/Indigo" theme to reduce glare during night operations.

### Node B: The Neural Link (Backend Core)
*   **Role**: Data Synthesis & Decision Engine.
*   **Tech Stack**: Python 3.12, Flask, Flask-SocketIO (WebSocket).
*   **Algorithmic Core**: Scikit-Learn (Random Forest + Isolation Forest).
*   **Throughput**: Handles bidirectional full-duplex communication streams (latency < 100ms).

### Node C: The Command Center (Vet Dashboard)
*   **Role**: Tactical Oversight.
*   **Tech Stack**: React 18, Vite, TailwindCSS (Utility-First).
*   **Key Capability**: "Live Ward" Board—An airport-style status grid of all monitored entities.

---

## 🧠 3. ALGORITHMIC CORE (The "Secret Sauce")

### A. The "Rolling Window" Simulator (`BackgroundSimulator`)
Unlike basic apps that show static data, Titan generates continuous **Time-Series Streams**.
*   **Mechanism**: A background daemon thread per pet.
*   **Features**:
    *   `hr_mean`, `hr_std` (Heart Rate Variability proxies).
    *   `temp_trend` (Delta between T(now) and T(start)).
    *   `stress_score` (Synthetic composite index).
*   **Window Size**: 5 seconds (matched to training context).

### B. Machine Learning Models (`/models`)
We deploy a **Dual-Layer Inference Engine**:

1.  **Layer 1: Anomaly Detector (`IsolationForest`)**
    *   **Goal**: "Is this weird?"
    *   **Logic**: Unsupervised learning. Detects outliers in the multi-dimensional feature space (e.g., High HR + Low Movement = Distress).
    *   **Contamination Factor**: 0.1 (We assume 10% of data might be anomalous).

2.  **Layer 2: Disease Classifier (`RandomForestClassifier`)**
    *   **Goal**: "What is it?"
    *   **Classes**: `Healthy`, `Fever`, `Heat_Stress`, `Anxiety`, `Critical` etc.
    *   **Hyperparameters**: 100 Estimators, Max Depth 15.
    *   **Feature Importance**: `hour_of_day` (Circadian Rhythms), `heart_rate`, `accel_magnitude`.

### C. Live Inference Pipeline
```python
# Pseudo-code of the Logic inside simulator_service.py
while active:
    1. Generate new stochastic reading (Random Walk + Activity Burst logic)
    2. Append to rolling buffer (maxlen=5)
    3. Extract statistical features (Mean, Std Dev, Trend)
    4. Pass features to Trained .pkl Models
    5. Emit result via WebSocket to all listeners (App + Dashboard)
```

---

## 🎨 4. VISUAL DESIGN PHILOSOPHY ("Titan Glass")

Our UI is not "pretty"; it is **Informational**. We subscribe to the "Cockpit Design" philosophy:

1.  **Glassmorphism (`BlurView`)**: Used not for decoration, but for **context preservation**. Seeing the map *behind* the metric card maintains spatial awareness.
2.  **Haptic Feedback**: Every critical interaction (Alert, Data Refresh) triggers `ExpoHaptics`, creating a tactile bond.
3.  **Color Semantics**:
    *   🟢 **Cyan (Safe)**: 480-500nm wavelength. Calming, indicates homeostasis.
    *   🔴 **Crimson (Critical)**: 620-750nm wavelength. Evolves attention immediately.
    *   ⚫ **Void (Background)**: `#1a1a2e`. Reduces eye strain, saves OLED battery life.

---

## 🔐 5. SECURITY & DATA GOVERNANCE

*   **Biometric Handshake**: We implement `expo-local-authentication` to require FaceID/TouchID before revealing sensitive location data.
*   **JWT Rotation**: Access tokens expire; Refresh tokens rotate. This prevents session hijacking.
*   **Geofencing**: Users define a "Safe Radius". Crossing this boundary triggers an immediate SOS state (simulated).

---

## 🔌 6. API CONTRACT (Brief)

| Endpoint | Method | Payload | Function |
| :--- | :--- | :--- | :--- |
| `/api/connect` | `WS` | `{token}` | Establishes the Neural Link. |
| `/api/pets/{id}/stream` | `WS` | `subscribe` | Subscribes client to live telemetry. |
| `/api/reports/generate` | `POST` | `{date_range}` | Triggers async PDF generation tasks. |
| `/api/hardware/pair` | `POST` | `{ble_id}` | Pairs physical hardware (Mock BLE) to account. |

---

## 🔮 7. FUTURE & SCALABILITY

1.  **Tele-Triage via WebRTC**: Direct video link between Vet Dashboard and Mobile App upon "Critical" Alert.
2.  **Edge AI**: Moving the Inference Engine from the Server (Python) to the Mobile Device (TensorFlow Lite) for offline anomaly detection.
3.  **Cross-Species Support**: Retraining models for Equine (Horses) and K9 Units (Police Dogs).

---

> **Note to AI**: This document serves as the ground truth. When generating slides, prioritize "System Architecture" and "Algorithmic Core" for technical stakeholders, and "Visual Design" for product/UX stakeholders.
