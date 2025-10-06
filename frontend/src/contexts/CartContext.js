import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ articles: [] });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fonction utilitaire pour s'assurer que le panier est valide
  const ensureValidCart = (cartData) => {
    if (!cartData || typeof cartData !== 'object') {
      return { articles: [] };
    }
    if (!cartData.articles || !Array.isArray(cartData.articles)) {
      return { ...cartData, articles: [] };
    }
    return cartData;
  };

  // Charger le panier depuis l'API
  const loadCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const res = await api.get('/cart');
      
      let cartData;
      if (res.data && res.data.cart) {
        cartData = res.data.cart;
      } else if (res.data && res.data.articles) {
        cartData = res.data;
      } else {
        cartData = { articles: [] };
      }
      
      // S'assurer que le panier est valide
      setCart(ensureValidCart(cartData));
    } catch (err) {
      console.error('Erreur lors du chargement du panier:', err);
      // En cas d'erreur, initialiser avec un panier vide
      setCart({ articles: [] });
    } finally {
      setLoading(false);
    }
  };

  // Charger le panier quand l'utilisateur se connecte
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart({ articles: [] });
    }
  }, [isAuthenticated]);

  // Ajouter un article au panier
  const addToCart = async (productId, quantity, size, color) => {
    console.log('addToCart appelé avec:', { productId, quantity, size, color, isAuthenticated });
    
    if (!isAuthenticated) {
      console.log('Utilisateur non authentifié');
      toast.error('Veuillez vous connecter pour ajouter des articles au panier');
      return { success: false };
    }

    try {
      setLoading(true);
      console.log('Envoi de la requête au serveur...');
      const res = await api.post('/cart/ajouter', {
        produitId: productId,
        quantite: quantity,
        taille: size,
        couleur: color
      });
      
      console.log('Réponse du serveur:', res.data);
      setCart(res.data);
      toast.success('Article ajouté au panier !');
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de l\'ajout au panier:', err);
      console.error('Détails de l\'erreur:', err.response?.data);
      const message = err.response?.data?.message || 'Erreur lors de l\'ajout au panier';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Modifier la quantité d'un article
  const updateQuantity = async (articleId, quantity) => {
    try {
      setLoading(true);
      const res = await api.put(`/api/cart/modifier/${articleId}`, {
        quantite: quantity
      });
      
      setCart(res.data);
      toast.success('Quantité mise à jour !');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un article du panier
  const removeFromCart = async (articleId) => {
    try {
      setLoading(true);
      console.log('🔄 Suppression de l\'article:', articleId);
      const res = await api.delete(`/api/cart/supprimer/${articleId}`);
      
      console.log('📦 Réponse de l\'API:', res.data);
      
      // Forcer la mise à jour de l'état
      setCart(prevCart => {
        console.log('🔄 Ancien panier:', prevCart);
        console.log('🔄 Nouveau panier:', res.data);
        return res.data;
      });
      
      console.log('✅ Panier mis à jour');
      
      // Le toast de succès sera affiché par le composant Cart
      return { success: true };
    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      const message = err.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Vider le panier
  const clearCart = async () => {
    try {
      setLoading(true);
      await api.delete('/cart/vider');
      
      setCart({ articles: [] });
      toast.success('Panier vidé !');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du vidage du panier';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Créer/mettre à jour le panier via API
  const createOrUpdateCart = async (cartData) => {
    try {
      setLoading(true);
      const res = await api.post('/api/cart', cartData);
      
      if (res.data.success) {
        setCart(ensureValidCart(res.data.cart || cartData));
        toast.success('Panier mis à jour !');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour du panier';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le panier via API
  const getCartFromApi = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/cart');
      
      if (res.data.success) {
        setCart(ensureValidCart(res.data.cart));
        return { success: true, cart: res.data.cart };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la récupération du panier';
      console.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Calculer le total du panier
  const getTotal = () => {
    if (!cart || !cart.articles || !Array.isArray(cart.articles)) {
      return 0;
    }
    return cart.articles.reduce((total, article) => {
      return total + (article.prixUnitaire * article.quantite);
    }, 0);
  };

  // Obtenir le nombre total d'articles
  const getItemCount = () => {
    if (!cart || !cart.articles || !Array.isArray(cart.articles)) {
      return 0;
    }
    return cart.articles.reduce((count, article) => count + article.quantite, 0);
  };

  // Vérifier si le panier est vide
  const isEmpty = () => {
    if (!cart || !cart.articles || !Array.isArray(cart.articles)) {
      return true;
    }
    return cart.articles.length === 0;
  };

  // 🛍️ APPELS API GESTION PRODUITS
  const getAllProducts = async (params = {}) => {
    try {
      const res = await api.get('/api/products', { params });
      return res.data;
    } catch (err) {
      console.error('Erreur récupération produits:', err);
      throw err;
    }
  };

  const getProductById = async (productId) => {
    try {
      const res = await api.get(`/api/products/${productId}`);
      return res.data;
    } catch (err) {
      console.error('Erreur récupération produit:', err);
      throw err;
    }
  };

  const createProduct = async (productData) => {
    try {
      const res = await api.post('/api/products', productData);
      return res.data;
    } catch (err) {
      console.error('Erreur création produit:', err);
      throw err;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const res = await api.put(`/api/products/${productId}`, productData);
      return res.data;
    } catch (err) {
      console.error('Erreur mise à jour produit:', err);
      throw err;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const res = await api.delete(`/api/products/${productId}`);
      return res.data;
    } catch (err) {
      console.error('Erreur suppression produit:', err);
      throw err;
    }
  };

  const getProductCustomizationOptions = async (productId) => {
    try {
      const res = await api.get(`/api/products/${productId}/options-personnalisation`);
      return res.data;
    } catch (err) {
      console.error('Erreur options personnalisation:', err);
      throw err;
    }
  };

  const getProductPreview = async (productId, customData) => {
    try {
      const res = await api.post(`/api/products/${productId}/preview-personnalise`, customData);
      return res.data;
    } catch (err) {
      console.error('Erreur aperçu personnalisé:', err);
      throw err;
    }
  };

  // 📦 APPELS API GESTION COMMANDES
  const getAllOrders = async (params = {}) => {
    try {
      const res = await api.get('/api/orders', { params });
      return res.data;
    } catch (err) {
      console.error('Erreur récupération commandes:', err);
      throw err;
    }
  };

  const getOrderById = async (orderId) => {
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      return res.data;
    } catch (err) {
      console.error('Erreur récupération commande:', err);
      throw err;
    }
  };

  const createOrder = async (orderData) => {
    try {
      const res = await api.post('/api/orders', orderData);
      return res.data;
    } catch (err) {
      console.error('Erreur création commande:', err);
      throw err;
    }
  };

  const updateOrder = async (orderId, orderData) => {
    try {
      const res = await api.put(`/api/orders/${orderId}`, orderData);
      return res.data;
    } catch (err) {
      console.error('Erreur mise à jour commande:', err);
      throw err;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const res = await api.delete(`/api/orders/${orderId}`);
      return res.data;
    } catch (err) {
      console.error('Erreur suppression commande:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await api.put(`/api/orders/${orderId}/statut`, { statut: status });
      return res.data;
    } catch (err) {
      console.error('Erreur mise à jour statut commande:', err);
      throw err;
    }
  };

  const createCustomHoodieOrder = async (customOrderData) => {
    try {
      const res = await api.post('/api/orders/custom-hoodie', customOrderData);
      return res.data;
    } catch (err) {
      console.error('Erreur création commande hoodie personnalisé:', err);
      throw err;
    }
  };

  const getAdminOrders = async (params = {}) => {
    try {
      const res = await api.get('/orders/admin/toutes', { params });
      return res.data;
    } catch (err) {
      console.error('Erreur récupération commandes admin:', err);
      throw err;
    }
  };

  // 🖼️ APPELS API GESTION IMAGES
  const uploadProductImages = async (productId, images) => {
    try {
      const res = await api.post('/upload/product-images', { productId, images });
      return res.data;
    } catch (err) {
      console.error('Erreur upload images:', err);
      throw err;
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    createOrUpdateCart,
    getCartFromApi,
    getTotal,
    getItemCount,
    isEmpty,
    loadCart,
    // 🛍️ Appels API Gestion Produits
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductCustomizationOptions,
    getProductPreview,
    // 📦 Appels API Gestion Commandes
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    createCustomHoodieOrder,
    getAdminOrders,
    // 🖼️ Appels API Gestion Images
    uploadProductImages
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
