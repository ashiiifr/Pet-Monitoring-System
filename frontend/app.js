/**
 * PetVitals - Pet Health Monitoring Dashboard
 * JavaScript Application
 * 
 * Team 12: Mudit Sharma, Divyanshi Dubey, Medha Mishra, Shivangi Verma
 */

// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:5000';
const REFRESH_INTERVAL = 5000; // 5 seconds

// ==================== STATE ====================
let currentData = null;
let isConnected = false;
let refreshTimer = null;

// ==================== DOM ELEMENTS ====================
const elements = {
    // Health Score
    healthScore: document.getElementById('healthScore'),
    scoreProgress: document.getElementById('scoreProgress'),
    healthStatus: document.getElementById('healthStatus'),
    
    // Vitals
    heartRate: document.getElementById('heartRate'),
    bodyTemp: document.getElementById('bodyTemp'),
    activityLevel: document.getElementById('activityLevel'),
    stressScore: document.getElementById('stressScore'),
    
    // Trends
    heartRateTrend: document.getElementById('heartRateTrend'),
    bodyTempTrend: document.getElementById('bodyTempTrend'),
    activityTrend: document.getElementById('activityTrend'),
    stressTrend: document.getElementById('stressTrend'),
    
    // Metrics
    stepCount: document.getElementById('stepCount'),
    calories: document.getElementById('calories'),
    distance: document.getElementById('distance'),
    sleepStatus: document.getElementById('sleepStatus'),
    ambientTemp: document.getElementById('ambientTemp'),
    humidity: document.getElementById('humidity'),
    
    // Prediction
    predictionConfidence: document.getElementById('predictionConfidence'),
    probabilityBars: document.getElementById('probabilityBars'),
    
    // Alerts
    alertsList: document.getElementById('alertsList'),
    
    // Status
    connectionStatus: document.getElementById('connectionStatus'),
    
    // Buttons
    refreshBtn: document.getElementById('refreshBtn'),
    demoHealthy: document.getElementById('demoHealthy'),
    demoFever: document.getElementById('demoFever'),
    demoAnxiety: document.getElementById('demoAnxiety'),
    demoRandom: document.getElementById('demoRandom')
};

// ==================== API FUNCTIONS ====================

/**
 * Fetch data from API
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        updateConnectionStatus(false);
        throw error;
    }
}

/**
 * Get health prediction from sensor data
 */
async function getPrediction(sensorData) {
    return await fetchAPI('/api/predict', {
        method: 'POST',
        body: JSON.stringify(sensorData)
    });
}

/**
 * Get demo data
 */
async function getDemoData() {
    return await fetchAPI('/api/demo-data');
}

/**
 * Get simulated real-time data
 */
async function getSimulatedData() {
    return await fetchAPI('/api/simulate');
}

// ==================== UI UPDATE FUNCTIONS ====================

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected) {
    isConnected = connected;
    const statusEl = elements.connectionStatus;
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('.status-text');
    
    if (connected) {
        dot.style.background = 'var(--success)';
        text.textContent = 'Connected';
    } else {
        dot.style.background = 'var(--danger)';
        text.textContent = 'Disconnected';
    }
}

/**
 * Update health score ring
 */
function updateHealthScore(score, status) {
    // Update number
    elements.healthScore.textContent = Math.round(score);
    
    // Update ring progress (circumference = 2 * PI * 45 ≈ 283)
    const circumference = 283;
    const offset = circumference - (score / 100) * circumference;
    elements.scoreProgress.style.strokeDashoffset = offset;
    
    // Update ring color based on score
    let color;
    if (score >= 80) color = 'var(--success)';
    else if (score >= 60) color = 'var(--warning)';
    else color = 'var(--danger)';
    elements.scoreProgress.style.stroke = color;
    
    // Update status badge
    const statusHtml = `<span class="status-badge ${status}">${status.toUpperCase()}</span>`;
    elements.healthStatus.innerHTML = statusHtml;
}

/**
 * Update vital signs
 */
function updateVitals(data) {
    const sensorData = data.sensor_data || data;
    const prediction = data.prediction || data;
    
    // Heart Rate
    elements.heartRate.textContent = sensorData.heart_rate?.toFixed(0) || '--';
    updateTrend(elements.heartRateTrend, sensorData.heart_rate, 85, 10);
    
    // Body Temperature
    elements.bodyTemp.textContent = sensorData.body_temperature?.toFixed(1) || '--';
    updateTrend(elements.bodyTempTrend, sensorData.body_temperature, 38.3, 0.5);
    
    // Activity Level
    elements.activityLevel.textContent = sensorData.activity_level?.toFixed(0) || '--';
    updateTrend(elements.activityTrend, sensorData.activity_level, 50, 20);
    
    // Stress Score
    elements.stressScore.textContent = sensorData.stress_score?.toFixed(0) || '--';
    updateTrend(elements.stressTrend, sensorData.stress_score, 25, 15, true);
}

/**
 * Update trend indicator
 */
function updateTrend(element, value, baseline, threshold, invertColors = false) {
    if (value === undefined || value === null) {
        element.textContent = '--';
        element.className = 'vital-trend';
        return;
    }
    
    const diff = value - baseline;
    const percent = ((diff / baseline) * 100).toFixed(0);
    
    if (Math.abs(diff) < threshold * 0.2) {
        element.textContent = 'Normal';
        element.className = 'vital-trend';
    } else if (diff > 0) {
        element.textContent = `↑ ${Math.abs(percent)}%`;
        element.className = `vital-trend ${invertColors ? 'down' : 'up'}`;
    } else {
        element.textContent = `↓ ${Math.abs(percent)}%`;
        element.className = `vital-trend ${invertColors ? 'up' : 'down'}`;
    }
}

/**
 * Update activity metrics
 */
function updateMetrics(data) {
    const sensorData = data.sensor_data || data;
    
    elements.stepCount.textContent = sensorData.step_count || '--';
    elements.calories.textContent = sensorData.calories_burned?.toFixed(1) || '--';
    elements.distance.textContent = sensorData.distance_meters?.toFixed(1) || '--';
    elements.sleepStatus.textContent = sensorData.sleep_indicator ? 'Sleeping' : 'Awake';
    elements.ambientTemp.textContent = sensorData.ambient_temperature?.toFixed(1) || '--';
    elements.humidity.textContent = sensorData.humidity?.toFixed(0) || '--';
}

/**
 * Update prediction probabilities
 */
function updateProbabilities(prediction) {
    const probs = prediction.class_probabilities;
    const confidence = prediction.confidence;
    
    elements.predictionConfidence.textContent = `${confidence}% confident`;
    
    // Sort probabilities
    const sortedProbs = Object.entries(probs)
        .sort((a, b) => b[1] - a[1]);
    
    // Generate HTML
    let html = '';
    for (const [label, prob] of sortedProbs) {
        html += `
            <div class="probability-item">
                <span class="prob-label">${label}</span>
                <div class="prob-bar-container">
                    <div class="prob-bar ${label}" style="width: ${prob}%"></div>
                </div>
                <span class="prob-value">${prob}%</span>
            </div>
        `;
    }
    
    elements.probabilityBars.innerHTML = html;
}

/**
 * Update alerts list
 */
function updateAlerts(prediction) {
    const alerts = prediction.alerts || [];
    const recommendations = prediction.recommendations || [];
    
    let html = '';
    
    // Add alerts
    for (const alert of alerts) {
        const iconMap = {
            success: '✅',
            warning: '⚠️',
            danger: '🚨',
            info: 'ℹ️'
        };
        
        html += `
            <div class="alert-item ${alert.type}">
                <span class="alert-icon">${iconMap[alert.type] || 'ℹ️'}</span>
                <span>${alert.message}</span>
            </div>
        `;
    }
    
    // Add recommendations
    for (const rec of recommendations) {
        html += `
            <div class="alert-item info">
                <span class="alert-icon">💡</span>
                <span>${rec}</span>
            </div>
        `;
    }
    
    elements.alertsList.innerHTML = html || '<div class="alert-item info"><span class="alert-icon">ℹ️</span><span>No alerts</span></div>';
}

/**
 * Update entire dashboard
 */
function updateDashboard(data) {
    updateConnectionStatus(true);
    
    const prediction = data.prediction || data;
    const sensorData = data.sensor_data || data;
    
    // Store current data
    currentData = data;
    
    // Update all UI elements
    updateHealthScore(prediction.health_score || 100, prediction.health_status || 'healthy');
    updateVitals(data);
    updateMetrics(data);
    updateProbabilities(prediction);
    updateAlerts(prediction);
}

// ==================== DEMO FUNCTIONS ====================

/**
 * Load healthy demo data
 */
async function loadHealthyDemo() {
    try {
        const demoData = await getDemoData();
        const prediction = await getPrediction(demoData.healthy);
        updateDashboard({ sensor_data: demoData.healthy, prediction });
    } catch (error) {
        showError('Failed to load healthy demo data');
    }
}

/**
 * Load fever demo data
 */
async function loadFeverDemo() {
    try {
        const demoData = await getDemoData();
        const prediction = await getPrediction(demoData.fever);
        updateDashboard({ sensor_data: demoData.fever, prediction });
    } catch (error) {
        showError('Failed to load fever demo data');
    }
}

/**
 * Load anxiety demo data
 */
async function loadAnxietyDemo() {
    try {
        const demoData = await getDemoData();
        const prediction = await getPrediction(demoData.anxiety);
        updateDashboard({ sensor_data: demoData.anxiety, prediction });
    } catch (error) {
        showError('Failed to load anxiety demo data');
    }
}

/**
 * Load random simulated data
 */
async function loadRandomData() {
    try {
        const data = await getSimulatedData();
        updateDashboard(data);
    } catch (error) {
        showError('Failed to load simulated data');
    }
}

/**
 * Show error message
 */
function showError(message) {
    console.error(message);
    elements.alertsList.innerHTML = `
        <div class="alert-item danger">
            <span class="alert-icon">❌</span>
            <span>${message}. Make sure the backend server is running.</span>
        </div>
    `;
}

// ==================== EVENT LISTENERS ====================

// Refresh button
elements.refreshBtn.addEventListener('click', loadRandomData);

// Demo buttons
elements.demoHealthy.addEventListener('click', loadHealthyDemo);
elements.demoFever.addEventListener('click', loadFeverDemo);
elements.demoAnxiety.addEventListener('click', loadAnxietyDemo);
elements.demoRandom.addEventListener('click', loadRandomData);

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// ==================== INITIALIZATION ====================

/**
 * Initialize dashboard
 */
async function init() {
    console.log('🐾 PetVitals Dashboard Initializing...');
    
    // Add SVG gradient definition for the score ring
    const svg = document.querySelector('.score-ring svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1"/>
            <stop offset="100%" style="stop-color:#8b5cf6"/>
        </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);
    
    // Try to load initial data
    try {
        await loadRandomData();
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize:', error);
        showError('Cannot connect to backend server');
    }
}

// Start the app
init();
