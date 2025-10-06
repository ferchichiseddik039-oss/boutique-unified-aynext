import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios';
import { toast } from 'react-toastify';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // ⚙️ APPELS API PARAMÈTRES
  const getSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/settings');
      if (res.data.success) {
        setSettings(res.data.settings);
        return res.data;
      }
    } catch (err) {
      console.error('Erreur récupération paramètres:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (settingsData) => {
    try {
      setLoading(true);
      const res = await api.put('/api/settings', settingsData);
      if (res.data.success) {
        setSettings(prev => ({ ...prev, ...settingsData }));
        toast.success('Paramètres mis à jour !');
        return res.data;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour des paramètres';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSettingsSection = async (section, sectionData) => {
    try {
      setLoading(true);
      const res = await api.put(`/api/settings/${section}`, sectionData);
      if (res.data.success) {
        setSettings(prev => ({ ...prev, [section]: { ...prev[section], ...sectionData } }));
        toast.success(`Section ${section} mise à jour !`);
        return res.data;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour de la section';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testSettings = async (testData) => {
    try {
      const res = await api.put('/settings/test', testData);
      return res.data;
    } catch (err) {
      console.error('Erreur test paramètres:', err);
      throw err;
    }
  };

  const resetSettings = async () => {
    try {
      setLoading(true);
      const res = await api.post('/settings/reset');
      if (res.data.success) {
        setSettings(null);
        toast.success('Paramètres réinitialisés !');
        return res.data;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la réinitialisation';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 📊 APPELS API STATISTIQUES
  const getStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        return res.data;
      }
    } catch (err) {
      console.error('Erreur récupération statistiques:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBasicStats = async () => {
    try {
      const res = await api.get('/stats');
      return res.data;
    } catch (err) {
      console.error('Erreur récupération stats de base:', err);
      throw err;
    }
  };

  const getAllData = async () => {
    try {
      const res = await api.get('/tous');
      return res.data;
    } catch (err) {
      console.error('Erreur récupération toutes les données:', err);
      throw err;
    }
  };

  // 🔧 APPELS API UTILITAIRES
  const getVersion = async () => {
    try {
      const res = await api.get('/api/version');
      return res.data;
    } catch (err) {
      console.error('Erreur récupération version:', err);
      throw err;
    }
  };

  const getStatus = async () => {
    try {
      const res = await api.get('/api/status');
      return res.data;
    } catch (err) {
      console.error('Erreur récupération statut:', err);
      throw err;
    }
  };

  const getHealth = async () => {
    try {
      const res = await api.get('/api/health');
      return res.data;
    } catch (err) {
      console.error('Erreur récupération santé:', err);
      throw err;
    }
  };

  const testApi = async () => {
    try {
      const res = await api.get('/api/test');
      return res.data;
    } catch (err) {
      console.error('Erreur test API:', err);
      throw err;
    }
  };

  const testMongoDB = async () => {
    try {
      const res = await api.get('/api/mongodb-test');
      return res.data;
    } catch (err) {
      console.error('Erreur test MongoDB:', err);
      throw err;
    }
  };

  // 📱 APPELS API PWA
  const getManifest = async () => {
    try {
      const res = await api.get('/manifest.json');
      return res.data;
    } catch (err) {
      console.error('Erreur récupération manifest:', err);
      throw err;
    }
  };

  const getServiceWorker = async () => {
    try {
      const res = await api.get('/sw.js');
      return res.data;
    } catch (err) {
      console.error('Erreur récupération service worker:', err);
      throw err;
    }
  };

  // Charger les paramètres au montage
  useEffect(() => {
    getSettings();
  }, []);

  const value = {
    settings,
    stats,
    loading,
    // ⚙️ Appels API Paramètres
    getSettings,
    updateSettings,
    updateSettingsSection,
    testSettings,
    resetSettings,
    // 📊 Appels API Statistiques
    getStats,
    getBasicStats,
    getAllData,
    // 🔧 Appels API Utilitaires
    getVersion,
    getStatus,
    getHealth,
    testApi,
    testMongoDB,
    // 📱 Appels API PWA
    getManifest,
    getServiceWorker
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;