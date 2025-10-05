import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaUndo, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../config/axios';
import '../styles/CustomHoodieDesigner.css';

const CustomHoodieDesigner = ({ product, onAddToCart, onClose }) => {
  const [customizationOptions, setCustomizationOptions] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(60);
  
  // Refs pour le scrolling
  const colorScrollRef = useRef(null);
  const logoScrollRef = useRef(null);
  const positionScrollRef = useRef(null);

  useEffect(() => {
    if (product && product.estPersonnalise && product.optionsPersonnalisation) {
      // Si les options sont déjà disponibles dans le produit, les utiliser directement
      setCustomizationOptions(product.optionsPersonnalisation);
      
      // Sélectionner les premières options par défaut
      if (product.optionsPersonnalisation?.couleursDisponibles?.length > 0) {
        setSelectedColor(product.optionsPersonnalisation.couleursDisponibles[0]);
      }
      if (product.optionsPersonnalisation?.logosDisponibles?.length > 0) {
        setSelectedLogo(product.optionsPersonnalisation.logosDisponibles[0]);
      }
      if (product.optionsPersonnalisation?.positionsLogo?.length > 0) {
        setSelectedPosition(product.optionsPersonnalisation.positionsLogo[0]);
      }
      setLoading(false);
    } else if (product && product.estPersonnalise) {
      // Sinon, charger les options via l'API
      loadCustomizationOptions();
    }
  }, [product]);

  // Appliquer la couleur initiale quand selectedColor change
  useEffect(() => {
    if (selectedColor?.code) {
      changeHoodieColor(selectedColor.code);
    }
  }, [selectedColor]);

  const loadCustomizationOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/${product._id}/options-personnalisation`);
      setCustomizationOptions(response.data);
      
      // Sélectionner les premières options par défaut
      if (response.data?.couleursDisponibles?.length > 0) {
        setSelectedColor(response.data.couleursDisponibles[0]);
      }
      if (response.data?.logosDisponibles?.length > 0) {
        setSelectedLogo(response.data.logosDisponibles[0]);
      }
      if (response.data?.positionsLogo?.length > 0) {
        setSelectedPosition(response.data.positionsLogo[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
      toast.error('Erreur lors du chargement des options de personnalisation');
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!selectedColor || !selectedLogo || !selectedPosition) {
      toast.error('Veuillez sélectionner toutes les options');
      return;
    }

    try {
      setPreviewLoading(true);
      const response = await api.post(`/api/products/${product._id}/preview-personnalise`, {
        couleur: selectedColor.nom,
        logo: selectedLogo.nom,
        position: selectedPosition.nom
      });
      
      setPreviewUrl(response.data.previewUrl);
      toast.success('Aperçu généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération de l\'aperçu:', error);
      toast.error('Erreur lors de la génération de l\'aperçu');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedLogo || !selectedPosition) {
      toast.error('Veuillez sélectionner toutes les options de personnalisation');
      return;
    }

    const customProduct = {
      ...product,
      personnalisation: {
        couleur: selectedColor,
        logo: selectedLogo,
        position: selectedPosition
      }
    };

    onAddToCart(customProduct, 'M', selectedColor.nom);
  };

  // Fonction pour changer la couleur de la capuche (comme dans votre code HTML)
  const changeHoodieColor = (colorCode) => {
    const hoodieElement = document.getElementById('hoodie');
    if (hoodieElement) {
      // Appliquer les filtres CSS directement sur l'image
      const rgb = hexToRgb(colorCode);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hoodieElement.style.filter = `hue-rotate(${hsl.h}deg) saturate(${hsl.s}%) brightness(${hsl.l}%) contrast(1.2)`;
      }
    }
  };

  // Fonction pour convertir hex en RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Fonction pour convertir RGB en HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Fonction pour générer les filtres CSS selon la couleur
  const getColorFilter = (colorCode) => {
    if (!colorCode) return 'none';
    
    // Convertir hex en RGB
    const hex = colorCode.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculer les valeurs de filtre pour changer la couleur
    const brightness = (r + g + b) / 765; // Normaliser entre 0 et 1
    const hue = getHueFromRGB(r, g, b);
    const saturation = getSaturationFromRGB(r, g, b);
    
    return `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`;
  };

  const getHueFromRGB = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max === min) return 0;
    
    const d = max - min;
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    
    return Math.round(h * 60);
  };

  const getSaturationFromRGB = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === 0) return 0;
    return Math.round(((max - min) / max) * 100);
  };

  // Fonctions simplifiées pour les filtres CSS
  const getHueFromColor = (colorCode) => {
    if (!colorCode) return 0;
    const hex = colorCode.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return getHueFromRGB(r, g, b);
  };

  const getSaturationFromColor = (colorCode) => {
    if (!colorCode) return 100;
    const hex = colorCode.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return Math.max(50, getSaturationFromRGB(r, g, b));
  };

  const getBrightnessFromColor = (colorCode) => {
    if (!colorCode) return 100;
    const hex = colorCode.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculer la luminosité relative (0-255 -> 0-200%)
    const brightness = (r + g + b) / 3;
    return Math.max(20, Math.min(200, (brightness / 255) * 200));
  };

  // Fonction pour gérer l'upload de logo
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedLogo(e.target.result);
        setSelectedLogo({
          nom: 'Logo personnalisé',
          image: e.target.result,
          position: { x: 50, y: 50 },
          taille: { largeur: logoSize, hauteur: logoSize }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour supprimer le logo uploadé
  const removeUploadedLogo = () => {
    setUploadedLogo(null);
    setSelectedLogo(customizationOptions?.logosDisponibles?.[0] || null);
  };

  if (loading) {
    return (
      <div className="custom-hoodie-designer loading">
        <div className="loading-spinner"></div>
        <p>Chargement des options de personnalisation...</p>
      </div>
    );
  }

  if (!customizationOptions) {
    return (
      <div className="custom-hoodie-designer error">
        <p>Erreur lors du chargement des options de personnalisation</p>
        <button onClick={onClose} className="btn-secondary">Fermer</button>
      </div>
    );
  }

  return (
    <div className="custom-hoodie-designer">
      <div className="designer-header">
        <h2>Personnalisez votre {product.nom}</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="designer-content">
        {/* Aperçu du produit */}
        <div className="product-preview">
          <div className="preview-container">
            <div className="hoodie-preview">
              <div className="hoodie-container" style={{ position: 'relative', textAlign: 'center' }}>
                <img 
                  id="hoodie"
                  src="/hoodie-realistic.svg" 
                  alt="Hoodie" 
                  className="hoodie"
                  style={{ 
                    width: '300px', 
                    height: 'auto',
                    maxHeight: '400px',
                    border: '2px solid #ccc',
                    borderRadius: '10px',
                    filter: `hue-rotate(${getHueFromColor(selectedColor?.code || '#FFFFFF')}deg) saturate(${getSaturationFromColor(selectedColor?.code || '#FFFFFF')}%) brightness(${getBrightnessFromColor(selectedColor?.code || '#FFFFFF')}%) contrast(1.2)`
                  }}
                />
                {selectedLogo && (
                  <img 
                    id="logo"
                    src={selectedLogo.image} 
                    alt="Logo" 
                    className="logo"
                    style={{ 
                      position: 'absolute',
                      top: '35%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${selectedLogo.taille?.largeur || 60}px`,
                      height: `${selectedLogo.taille?.hauteur || 60}px`,
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      zIndex: 3
                    }}
                  />
                )}
              </div>
            </div>
            
            {previewLoading && (
              <div className="preview-loading">
                <div className="spinner"></div>
                <p>Génération de l'aperçu...</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={generatePreview}
            className="generate-preview-btn"
            disabled={!selectedColor || !selectedLogo || !selectedPosition || previewLoading}
          >
            {previewLoading ? 'Génération...' : 'Générer l\'aperçu'}
          </button>
        </div>

        {/* Options de personnalisation */}
        <div className="customization-options">
          {/* Sélection de couleur */}
          <div className="option-section">
            <h3>Couleur</h3>
            <div className="color-picker-container">
              <label className="color-picker-label">
                Choisir couleur :
                <input 
                  type="color" 
                  value={selectedColor?.code || '#FFFFFF'}
                  onChange={(e) => {
                    const newColor = {
                      nom: 'Couleur personnalisée',
                      code: e.target.value
                    };
                    setSelectedColor(newColor);
                    changeHoodieColor(e.target.value);
                  }}
                  className="color-picker"
                />
              </label>
            </div>
            
            {/* Couleurs prédéfinies */}
            <div className="option-scroll-container">
              <button 
                className="scroll-btn left"
                onClick={() => scrollLeft(colorScrollRef)}
              >
                <FaChevronLeft />
              </button>
              
              <div className="option-scroll" ref={colorScrollRef}>
                {customizationOptions?.couleursDisponibles?.map((color, index) => (
                  <div
                    key={index}
                    className={`color-option ${selectedColor?.nom === color.nom ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedColor(color);
                      changeHoodieColor(color.code);
                    }}
                    style={{ backgroundColor: color.code }}
                    title={color.nom}
                  >
                    {selectedColor?.nom === color.nom && <FaCheck className="check-icon" />}
                  </div>
                )) || []}
              </div>
              
              <button 
                className="scroll-btn right"
                onClick={() => scrollRight(colorScrollRef)}
              >
                <FaChevronRight />
              </button>
            </div>
            {selectedColor && (
              <p className="selected-option">Couleur sélectionnée: {selectedColor.nom}</p>
            )}
          </div>

          {/* Sélection de logo */}
          <div className="option-section">
            <h3>Logo</h3>
            
            {/* Upload de logo personnalisé */}
            <div className="logo-upload-section">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="logo-upload" className="upload-btn">
                📁 Uploader votre logo
              </label>
              {uploadedLogo && (
                <button onClick={removeUploadedLogo} className="remove-upload-btn">
                  ❌ Supprimer
                </button>
              )}
            </div>

            {/* Logos prédéfinis */}
            <div className="option-scroll-container">
              <button 
                className="scroll-btn left"
                onClick={() => scrollLeft(logoScrollRef)}
              >
                <FaChevronLeft />
              </button>
              
              <div className="option-scroll" ref={logoScrollRef}>
                {customizationOptions?.logosDisponibles?.map((logo, index) => (
                  <div
                    key={index}
                    className={`logo-option ${selectedLogo?.nom === logo.nom ? 'selected' : ''}`}
                    onClick={() => setSelectedLogo(logo)}
                  >
                    <img src={logo.image} alt={logo.nom} />
                    {selectedLogo?.nom === logo.nom && <FaCheck className="check-icon" />}
                  </div>
                )) || []}
              </div>
              
              <button 
                className="scroll-btn right"
                onClick={() => scrollRight(logoScrollRef)}
              >
                <FaChevronRight />
              </button>
            </div>
            {selectedLogo && (
              <p className="selected-option">Logo sélectionné: {selectedLogo.nom}</p>
            )}
            
            {/* Contrôle de taille du logo */}
            {selectedLogo && (
              <div className="logo-size-control">
                <label>Taille du logo: {logoSize}px</label>
                <input
                  type="range"
                  min="30"
                  max="120"
                  value={logoSize}
                  onChange={(e) => {
                    setLogoSize(parseInt(e.target.value));
                    if (selectedLogo) {
                      setSelectedLogo({
                        ...selectedLogo,
                        taille: { 
                          largeur: parseInt(e.target.value), 
                          hauteur: parseInt(e.target.value) 
                        }
                      });
                    }
                  }}
                  className="size-slider"
                />
              </div>
            )}
          </div>

          {/* Sélection de position */}
          <div className="option-section">
            <h3>Position du logo</h3>
            <div className="option-scroll-container">
              <button 
                className="scroll-btn left"
                onClick={() => scrollLeft(positionScrollRef)}
              >
                <FaChevronLeft />
              </button>
              
              <div className="option-scroll" ref={positionScrollRef}>
                {customizationOptions?.positionsLogo?.map((position, index) => (
                  <div
                    key={index}
                    className={`position-option ${selectedPosition?.nom === position.nom ? 'selected' : ''}`}
                    onClick={() => setSelectedPosition(position)}
                  >
                    <div className="position-preview">
                      <div 
                        className="position-dot"
                        style={{
                          left: `${position.x}%`,
                          top: `${position.y}%`
                        }}
                      />
                    </div>
                    <span>{position.nom}</span>
                    {selectedPosition?.nom === position.nom && <FaCheck className="check-icon" />}
                  </div>
                )) || []}
              </div>
              
              <button 
                className="scroll-btn right"
                onClick={() => scrollRight(positionScrollRef)}
              >
                <FaChevronRight />
              </button>
            </div>
            {selectedPosition && (
              <p className="selected-option">Position sélectionnée: {selectedPosition.nom}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="designer-actions">
        <button 
          onClick={handleAddToCart}
          className="add-to-cart-btn"
          disabled={!selectedColor || !selectedLogo || !selectedPosition}
        >
          Ajouter au panier - {product.prix} TND
        </button>
        
        <button 
          onClick={() => {
            if (customizationOptions?.couleursDisponibles?.length > 0) {
              setSelectedColor(customizationOptions.couleursDisponibles[0]);
            }
            if (customizationOptions?.logosDisponibles?.length > 0) {
              setSelectedLogo(customizationOptions.logosDisponibles[0]);
            }
            if (customizationOptions?.positionsLogo?.length > 0) {
              setSelectedPosition(customizationOptions.positionsLogo[0]);
            }
          }}
          className="reset-btn"
        >
          <FaUndo />
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default CustomHoodieDesigner;
