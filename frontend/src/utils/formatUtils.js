// Utilitaires pour formater les données des produits

/**
 * Formate une valeur qui peut être un objet ou une chaîne
 * @param {any} value - La valeur à formater
 * @param {string} fallback - Valeur de fallback si la valeur est vide
 * @returns {string} - La valeur formatée en chaîne
 */
export const formatProductValue = (value, fallback = '') => {
  if (!value) return fallback;
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object' && value !== null) {
    // Debug: Afficher un avertissement si on trouve un objet
    if (process.env.NODE_ENV === 'development') {
      console.warn('Objet détecté dans formatProductValue:', value);
    }
    return value.nom || value.name || value.code || value._id || fallback;
  }
  
  return String(value);
};

/**
 * Formate une marque de produit
 * @param {any} marque - La marque à formater
 * @returns {string} - La marque formatée
 */
export const formatBrand = (marque) => {
  return formatProductValue(marque, '');
};

/**
 * Formate une catégorie de produit
 * @param {any} categorie - La catégorie à formater
 * @returns {string} - La catégorie formatée
 */
export const formatCategory = (categorie) => {
  return formatProductValue(categorie, '');
};

/**
 * Fonction de protection globale pour éviter le rendu d'objets
 * @param {any} value - La valeur à sécuriser
 * @returns {string} - La valeur sécurisée
 */
export const safeRender = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    console.error('🚨 TENTATIVE DE RENDU D\'OBJET DÉTECTÉE:', value);
    console.trace('Stack trace:');
    return '[Objet]';
  }
  return String(value);
};

/**
 * Fonction de débogage pour détecter les objets dans les données
 * @param {any} data - Les données à vérifier
 * @param {string} context - Le contexte où les données sont utilisées
 */
export const debugObjects = (data, context = 'Unknown') => {
  // Temporairement désactivé pour le débogage du panier
  // if (typeof data === 'object' && data !== null) {
  //   console.warn(`🔍 Objet détecté dans ${context}:`, data);
  //   
  //   // Vérifier les propriétés communes problématiques
  //   if (data.nom || data.code || data._id) {
  //     console.error(`🚨 OBJET AVEC PROPRIÉTÉS PROBLÉMATIQUES dans ${context}:`, data);
  //   }
  // }
  
  return data;
};
