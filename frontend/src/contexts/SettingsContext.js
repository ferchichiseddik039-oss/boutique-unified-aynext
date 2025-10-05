import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    informationsGenerales: {
      nomBoutique: 'AYNEXT',
      description: 'Boutique de vêtements tendance',
      email: 'contact@aynext.com',
      telephone: '+216 XX XXX XXX',
      adresse: {
        rue: 'Rue de la Mode',
        ville: 'Tunis',
        codePostal: '1000',
        pays: 'Tunisie'
      },
      logo: ''
    },
    livraison: {
      fraisLivraison: 5.9,
      fraisLivraisonGratuite: 100,
      delaiLivraison: '3-5 jours ouvrables',
      zonesLivraison: [],
      livraisonGratuite: true
    },
    paiement: {
      methodesActives: ['carte', 'paypal', 'virement', 'especes'],
      informationsPaiement: {
        carte: {
          active: true,
          nom: 'Carte bancaire',
          description: 'Visa, Mastercard, American Express'
        },
        paypal: {
          active: true,
          nom: 'PayPal',
          description: 'Paiement sécurisé via PayPal'
        },
        virement: {
          active: true,
          nom: 'Virement bancaire',
          description: 'Virement bancaire direct'
        },
        especes: {
          active: true,
          nom: 'Espèces à la livraison',
          description: 'Paiement en espèces lors de la livraison'
        }
      }
    },
    general: {
      devise: 'TND',
      langue: 'fr',
      maintenance: {
        active: false,
        message: 'Site en maintenance. Revenez bientôt !'
      }
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les paramètres au démarrage
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      setError('Erreur lors du chargement des paramètres');
      // Garder les paramètres par défaut en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir les méthodes de paiement actives
  const getActivePaymentMethods = () => {
    if (!settings.paiement || !settings.paiement.methodesActives) {
      return ['carte', 'paypal', 'virement', 'especes'];
    }
    
    return settings.paiement.methodesActives.map(method => ({
      value: method,
      label: settings.paiement.informationsPaiement[method]?.nom || method,
      description: settings.paiement.informationsPaiement[method]?.description || ''
    }));
  };

  // Fonction pour calculer les frais de livraison
  const calculateDeliveryFees = (subtotal) => {
    if (!settings.livraison) {
      return 5.9; // Valeur par défaut
    }

    const { fraisLivraison, fraisLivraisonGratuite, livraisonGratuite } = settings.livraison;
    
    // Si la livraison gratuite est activée et le montant atteint le seuil
    if (livraisonGratuite && subtotal >= fraisLivraisonGratuite) {
      return 0;
    }
    
    return fraisLivraison;
  };

  // Fonction pour obtenir les informations de livraison
  const getDeliveryInfo = () => {
    if (!settings.livraison) {
      return {
        frais: 5.9,
        delai: '3-5 jours ouvrables',
        livraisonGratuite: true,
        seuil: 100
      };
    }

    return {
      frais: settings.livraison.fraisLivraison,
      delai: settings.livraison.delaiLivraison,
      livraisonGratuite: settings.livraison.livraisonGratuite,
      seuil: settings.livraison.fraisLivraisonGratuite
    };
  };

  // Fonction pour vérifier si le site est en maintenance
  const isMaintenanceMode = () => {
    return settings.general?.maintenance?.active || false;
  };

  // Fonction pour obtenir le message de maintenance
  const getMaintenanceMessage = () => {
    return settings.general?.maintenance?.message || 'Site en maintenance. Revenez bientôt !';
  };

  // Fonction pour obtenir la devise
  const getCurrency = () => {
    return settings.general?.devise || 'TND';
  };

  // Fonction pour obtenir la langue
  const getLanguage = () => {
    return settings.general?.langue || 'fr';
  };

  // Fonction pour obtenir les informations de la boutique
  const getShopInfo = () => {
    return settings.informationsGenerales || {
      nomBoutique: 'AYNEXT',
      description: 'Boutique de vêtements tendance',
      email: 'contact@aynext.com',
      telephone: '+216 XX XXX XXX'
    };
  };

  // Fonction pour mettre à jour les paramètres (pour les admins)
  const updateSettings = async (newSettings) => {
    try {
      setError(null);
      const response = await api.put('/settings', newSettings);
      setSettings(response.data.settings);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      setError('Erreur lors de la mise à jour des paramètres');
      return { success: false, error: error.response?.data?.message || 'Erreur inconnue' };
    }
  };

  const value = {
    settings,
    loading,
    error,
    fetchSettings,
    getActivePaymentMethods,
    calculateDeliveryFees,
    getDeliveryInfo,
    isMaintenanceMode,
    getMaintenanceMessage,
    getCurrency,
    getLanguage,
    getShopInfo,
    updateSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
