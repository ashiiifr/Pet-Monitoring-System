import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

// API URL - use localhost for emulator/web, or public URL for real device
// const API_URL = 'http://localhost:5000/api';
// const SOCKET_URL = 'http://localhost:5000';

// HOST IP (Auto-detected): 172.16.157.153
const API_URL = 'http://172.16.157.153:5000/api';
const SOCKET_URL = 'http://172.16.157.153:5000';

// Socket Instance
export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
});

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Refresh Token Logic (Item #10)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                const res = await axios.post(`${API_URL}/auth/refresh`, {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` }
                });

                const newToken = res.data.access_token;
                await AsyncStorage.setItem('token', newToken);

                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (err) {
                // Refresh failed - clean up
                await AsyncStorage.multiRemove(['token', 'refresh_token']);
                // Navigation to login usually handled by React Context (AuthContext)
                // For now, failure propagates to component which handles logout
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (email, password) =>
    api.post('/auth/login', { email, password });

export const register = (data) =>
    api.post('/auth/register', data);

export const getMe = () =>
    api.get('/auth/me');

export const requestOtp = (email) =>
    api.post('/auth/otp/request', { email });

export const verifyOtp = (email, otp) =>
    api.post('/auth/otp/verify', { email, otp });

// Pets
export const getPets = () =>
    api.get('/pets');

export const createPet = (data) =>
    api.post('/pets', data);

export const getPet = (id) =>
    api.get(`/pets/${id}`);

export const updatePet = (id, data) =>
    api.put(`/pets/${id}`, data);

export const deletePet = (id) =>
    api.delete(`/pets/${id}`);

// Health
export const getLatestReading = (petId) =>
    api.get(`/health/${petId}/latest`);

export const getHealthHistory = (petId, limit = 20) =>
    api.get(`/health/${petId}/history?limit=${limit}`);

export const simulateReading = (petId) =>
    api.post(`/health/${petId}/simulate`);

// Alerts
export const getAlerts = () =>
    api.get('/alerts');

export const markAlertRead = (alertId) =>
    api.put(`/alerts/${alertId}/read`);

export const deleteAlert = (alertId) =>
    api.delete(`/alerts/${alertId}`);

// Emergency Contacts
export const getEmergencyContacts = () =>
    api.get('/emergency-contacts');

export const addEmergencyContact = (data) =>
    api.post('/emergency-contacts', data);

export const deleteEmergencyContact = (id) =>
    api.delete(`/emergency-contacts/${id}`);

// Documents
export const downloadDossier = (petId) =>
    api.get(`/pets/${petId}/dossier`, { responseType: 'blob' });

export default api;
