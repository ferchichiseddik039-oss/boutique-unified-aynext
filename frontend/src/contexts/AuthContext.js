import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configurer api avec le token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Charger les informations de l'utilisateur
  const loadUser = async () => {
    try {
      const res = await api.get('/auth/check');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        throw new Error('Erreur de chargement utilisateur');
      }
    } catch (err) {
      console.error('Erreur chargement utilisateur:', err);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['x-auth-token'];
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Test de santé de l'API
  const checkApiHealth = async () => {
    try {
      const res = await api.get('/api/health');
      return res.data;
    } catch (err) {
      console.error('Erreur test santé API:', err);
      throw err;
    }
  };

  // Test de l'API
  const testApi = async () => {
    try {
      const res = await api.get('/api/test');
      return res.data;
    } catch (err) {
      console.error('Erreur test API:', err);
      throw err;
    }
  };

  // Test MongoDB
  const testMongoDB = async () => {
    try {
      const res = await api.get('/api/mongodb-test');
      return res.data;
    } catch (err) {
      console.error('Erreur test MongoDB:', err);
      throw err;
    }
  };

  // 🔐 APPELS API AUTHENTIFICATION COMPLETS
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await api.post('/api/auth/inscription', userData);
      if (res.data.success) {
        toast.success('Inscription réussie !');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de l\'inscription';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const res = await api.post('/api/auth/connexion', credentials);
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['x-auth-token'] = newToken;
        
        toast.success('Connexion réussie !');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la connexion';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (credentials) => {
    try {
      setLoading(true);
      const res = await api.post('/api/auth/connexion-admin', credentials);
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['x-auth-token'] = newToken;
        
        toast.success('Connexion admin réussie !');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la connexion admin';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['x-auth-token'];
    toast.success('Déconnexion réussie !');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const res = await api.put('/users/profile', profileData);
      if (res.data.success) {
        toast.success('Profil mis à jour !');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const res = await api.put('/users/password', passwordData);
      if (res.data.success) {
        toast.success('Mot de passe mis à jour !');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      setToken(token);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  // 👑 APPELS API ADMINISTRATEUR
  const checkAdmin = async () => {
    try {
      const res = await api.get('/api/admin/check');
      return res.data;
    } catch (err) {
      console.error('Erreur vérification admin:', err);
      throw err;
    }
  };

  const getAdminStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      return res.data;
    } catch (err) {
      console.error('Erreur récupération stats admin:', err);
      throw err;
    }
  };

  const setupAdmin = async (adminData) => {
    try {
      const res = await api.post('/api/admin/setup', adminData);
      return res.data;
    } catch (err) {
      console.error('Erreur setup admin:', err);
      throw err;
    }
  };

  // 👥 APPELS API GESTION UTILISATEURS
  const getAllUsers = async (params = {}) => {
    try {
      const res = await api.get('/api/users', { params });
      return res.data;
    } catch (err) {
      console.error('Erreur récupération utilisateurs:', err);
      throw err;
    }
  };

  const getUserById = async (userId) => {
    try {
      const res = await api.get(`/api/users/${userId}`);
      return res.data;
    } catch (err) {
      console.error('Erreur récupération utilisateur:', err);
      throw err;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const res = await api.put(`/api/users/${userId}`, userData);
      return res.data;
    } catch (err) {
      console.error('Erreur mise à jour utilisateur:', err);
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const res = await api.delete(`/api/users/${userId}`);
      return res.data;
    } catch (err) {
      console.error('Erreur suppression utilisateur:', err);
      throw err;
    }
  };

  const getAdminUsers = async (params = {}) => {
    try {
      const res = await api.get('/api/users/admin/tous', { params });
      return res.data;
    } catch (err) {
      console.error('Erreur récupération utilisateurs admin:', err);
      throw err;
    }
  };

  const getUserStats = async (userId) => {
    try {
      const res = await api.get(`/api/users/admin/${userId}/stats`);
      return res.data;
    } catch (err) {
      console.error('Erreur récupération stats utilisateur:', err);
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    loginAdmin,
    logout,
    updateProfile,
    changePassword,
    setAuthToken,
    checkApiHealth,
    testApi,
    testMongoDB,
    // 👑 Appels API Administrateur
    checkAdmin,
    getAdminStats,
    setupAdmin,
    // 👥 Appels API Gestion Utilisateurs
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAdminUsers,
    getUserStats,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};