// Configuration pour Remove.bg API
// Obtenez votre clé API gratuite sur: https://www.remove.bg/api

export const REMOVE_BG_CONFIG = {
  // Remplacez par votre clé API Remove.bg
  API_KEY: "4LoSYpzk2HgsrWwZPiXHFUQj",
  
  // URL de l'API
  API_URL: "https://api.remove.bg/v1.0/removebg",
  
  // Options par défaut
  DEFAULT_OPTIONS: {
    size: "auto", // auto, preview, full
    format: "png", // png, jpg
    type: "auto", // auto, person, product, car
  }
};

// Fonction pour supprimer l'arrière-plan
export const removeBackground = async (file, options = {}) => {
  const config = { ...REMOVE_BG_CONFIG.DEFAULT_OPTIONS, ...options };
  
  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", config.size);
  formData.append("format", config.format);
  formData.append("type", config.type);
  
  try {
    const response = await fetch(REMOVE_BG_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": REMOVE_BG_CONFIG.API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.title || 'Erreur lors de la suppression de l\'arrière-plan');
    }

    const blob = await response.blob();
    
    // Convertir le blob en base64 pour éviter les problèmes de blob URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erreur Remove.bg:', error);
    throw error;
  }
};

// Fonction pour vérifier si la clé API est configurée
export const isApiKeyConfigured = () => {
  return REMOVE_BG_CONFIG.API_KEY !== "YOUR_REMOVE_BG_API_KEY" && 
         REMOVE_BG_CONFIG.API_KEY.length > 0;
};
