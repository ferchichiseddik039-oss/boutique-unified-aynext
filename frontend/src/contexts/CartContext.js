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

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    getItemCount,
    isEmpty,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
