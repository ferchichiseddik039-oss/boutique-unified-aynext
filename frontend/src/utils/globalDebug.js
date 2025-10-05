// Débogage global pour détecter les objets rendus dans React

// Intercepter console.error pour détecter les erreurs d'objets
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('Objects are not valid as a React child')) {
    console.error('🚨 ERREUR D\'OBJET DÉTECTÉE:', ...args);
    console.trace('Stack trace complet:');
  }
  originalConsoleError.apply(console, args);
};

// Fonction pour vérifier les données avant le rendu
export const checkDataBeforeRender = (data, context = 'Unknown') => {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    console.warn(`🔍 Objet détecté avant rendu dans ${context}:`, data);
    
    // Vérifier si c'est un objet problématique
    if (data.nom || data.code || data._id) {
      console.error(`🚨 OBJET PROBLÉMATIQUE DÉTECTÉ dans ${context}:`, data);
      console.trace('Stack trace:');
      return false;
    }
  }
  return true;
};

// Fonction pour sécuriser les données avant le rendu
export const secureDataForRender = (data, context = 'Unknown') => {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    console.warn(`🔧 Sécurisation d'un objet dans ${context}:`, data);
    
    // Retourner une représentation sécurisée
    if (data.nom) return data.nom;
    if (data.code) return data.code;
    if (data._id) return data._id;
    if (data.name) return data.name;
    
    return '[Objet]';
  }
  
  return data;
};
