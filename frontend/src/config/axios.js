import axios from 'axios';

// Configuration API avec URL du backend Render
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://boutique-backend-6rx5.onrender.com/api';

// Configuration de base pour axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Augmenté à 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      // Rediriger vers admin-login si on est sur une page admin
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin')) {
        window.location.href = '/admin-login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
