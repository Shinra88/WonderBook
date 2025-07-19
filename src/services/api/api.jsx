//api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// 🔐 Interceptor: automatically adds the token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ⚠️ Interceptor response: example for global errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("🔐 Token invalide ou expiré");
      // possibly: redirectToLogin(), logout(), etc.
}
    return Promise.reject(error);
  }
);

export default api;
