import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Auto-switches on deploy
});

// Add a request interceptor to include the JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchResourceStats = () => api.get('/analytics/resources');
export const fetchMonthlyActivity = () => api.get('/analytics/monthly');
export const fetchLeaderboard = () => api.get('/analytics/leaderboard');
export const getEvents = (params) => api.get('/events', { params });
// Add these to your existing api.js
export const fetchPendingEvents = () => api.get('/events/pending');
export const approveEvent = (id) => api.put(`/events/${id}/approve`);
export const rejectEvent = (id) => api.put(`/events/${id}/reject`);

export default api;