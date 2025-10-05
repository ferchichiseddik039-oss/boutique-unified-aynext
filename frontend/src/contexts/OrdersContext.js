import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/axios';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les commandes de l'utilisateur
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔑 Pas de token d\'authentification');
        setOrders([]);
        setLoading(false);
        setError('Veuillez vous connecter pour voir vos commandes');
        return;
      }

      // SOLUTION ROBUSTE: Utiliser uniquement fetch avec timeout court
      console.log('📤 Récupération des commandes avec fetch...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes max
      
      try {
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`📊 Réponse serveur: ${response.status}`);
        
        if (response.status === 401) {
          console.log('🔑 Token expiré ou invalide');
          localStorage.removeItem('token');
          setOrders([]);
          setLoading(false);
          setError('Session expirée - Veuillez vous reconnecter');
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ ${data.length} commande(s) récupérée(s)`);
        console.log('📋 Données reçues:', data);
        setOrders(data);
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout: Le serveur met trop de temps à répondre');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes:', error);
      
      let errorMessage = 'Erreur lors du chargement des commandes';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('Timeout')) {
        errorMessage = 'Timeout: Le serveur met trop de temps à répondre';
      } else if (error.response?.status === 404) {
        errorMessage = 'Route non trouvée';
      } else if (error.response?.status === 401) {
        errorMessage = 'Non autorisé - Veuillez vous reconnecter';
      } else if (error.response?.status === 408) {
        errorMessage = 'Timeout serveur: La requête prend trop de temps';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erreur serveur - Veuillez réessayer plus tard';
      } else if (!error.response) {
        errorMessage = 'Impossible de contacter le serveur';
      }
      
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour ajouter une nouvelle commande
  const addOrder = (newOrder) => {
    setOrders(prevOrders => [newOrder, ...prevOrders]);
  };

  // Fonction pour mettre à jour le statut d'une commande
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, statut: newStatus }
          : order
      )
    );
  };

  // Fonction pour obtenir le nombre de commandes
  const getOrdersCount = () => {
    return orders.length;
  };

  // Fonction pour obtenir les commandes par statut
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.statut === status);
  };

  // Charger les commandes au montage du composant
  useEffect(() => {
    console.log('🔄 OrdersContext - Chargement initial des commandes');
    fetchOrders();
  }, []); // Retiré fetchOrders des dépendances

  const value = {
    orders,
    loading,
    error,
    fetchOrders,
    addOrder,
    updateOrderStatus,
    getOrdersCount,
    getOrdersByStatus
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

export default OrdersContext;
