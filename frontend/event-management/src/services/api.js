import axios from 'axios';

console.log("VITE_API_URL Environment Variable:", import.meta.env.VITE_API_URL);

let API_URL = import.meta.env.VITE_API_URL;

// SAFETY CHECK: If we are in production (deployed), NEVER use localhost.
if (import.meta.env.PROD && !API_URL) {
  console.error("CRITICAL: API URL is missing in production build!");
  // Fallback to your Render URL explicitly if the env var fails
  API_URL = 'https://event-management-4avy.onrender.com/api';
}

// Fallback for local development
if (!API_URL) {
  API_URL = 'http://localhost:5000/api';
}

console.log("Using API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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