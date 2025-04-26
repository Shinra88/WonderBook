//api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// 🔐 Intercepteur : ajoute automatiquement le token si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ⚠️ Intercepteur de réponse : exemple pour erreurs globales
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("🔐 Token invalide ou expiré");
      // éventuellement : redirectToLogin(), logout(), etc.
    }
    return Promise.reject(error);
  }
);

export default api;
