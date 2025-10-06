// Utilitaires pour corriger les appels API directs
import api from '../config/axios';

// Fonction pour remplacer les appels fetch par des appels api
export const fetchWithAuth = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        ...options.headers
      }
    };

    if (options.method === 'GET' || !options.method) {
      return await api.get(url, config);
    } else if (options.method === 'POST') {
      return await api.post(url, options.body, config);
    } else if (options.method === 'PUT') {
      return await api.put(url, options.body, config);
    } else if (options.method === 'DELETE') {
      return await api.delete(url, config);
    }
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// Fonction pour charger les données admin
export const loadAdminData = async () => {
  try {
    const [statsRes, productsRes, ordersRes] = await Promise.all([
      api.get('/api/admin/stats'),
      api.get('/products?limit=100'),
      api.get('/orders/admin/toutes?limit=10')
    ]);

    return {
      stats: statsRes.data,
      products: productsRes.data.products || productsRes.data.produits || [],
      orders: ordersRes.data.orders || ordersRes.data.commandes || []
    };
  } catch (error) {
    console.error('Erreur chargement données admin:', error);
    throw error;
  }
};

// Fonction pour charger les utilisateurs admin
export const loadAdminUsers = async (params = {}) => {
  try {
    const response = await api.get('/api/users/admin/tous', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur chargement utilisateurs admin:', error);
    throw error;
  }
};

// Fonction pour charger les commandes
export const loadOrders = async (params = {}) => {
  try {
    const response = await api.get('/api/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur chargement commandes:', error);
    throw error;
  }
};

// Fonction pour charger un produit
export const loadProduct = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur chargement produit:', error);
    throw error;
  }
};

// Fonction pour charger les produits similaires
export const loadSimilarProducts = async (category, brand, limit = 4) => {
  try {
    const response = await api.get(`/api/products?category=${category}&brand=${brand}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur chargement produits similaires:', error);
    throw error;
  }
};

// Fonction pour créer une commande
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Erreur création commande:', error);
    throw error;
  }
};

// Fonction pour vérifier l'admin
export const checkAdmin = async () => {
  try {
    const response = await api.get('/api/admin/check');
    return response.data;
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    throw error;
  }
};

// Fonction pour setup admin
export const setupAdmin = async (adminData) => {
  try {
    const response = await api.post('/api/admin/setup', adminData);
    return response.data;
  } catch (error) {
    console.error('Erreur setup admin:', error);
    throw error;
  }
};
