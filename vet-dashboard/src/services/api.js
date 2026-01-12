import axios from 'axios'
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api'
const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket']
});

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
})

// Add auth token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auth
export const login = (email, password) =>
    api.post('/auth/login', { email, password })

export const register = (data) =>
    api.post('/auth/register', data)

export const getMe = () =>
    api.get('/auth/me')

// Vet endpoints
export const getPatients = () =>
    api.get('/vet/patients')

export const getPatientDetail = (id) =>
    api.get(`/vet/patient/${id}`)

export const getVetAlerts = () =>
    api.get('/vet/alerts')

export const addVetNote = (petId, note) =>
    api.post(`/vet/notes/${petId}`, { note })

// Health
export const simulateReading = (petId) =>
    api.post(`/health/${petId}/simulate`)

export const getHealthHistory = (petId, limit = 50) =>
    api.get(`/health/${petId}/history?limit=${limit}`)

// Demo
export const getDemoData = () =>
    api.get('/demo/data')

export const demoPrediction = (data) =>
    api.post('/demo/predict', data)

export default api
