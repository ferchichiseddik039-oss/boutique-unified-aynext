import { useState, useEffect } from "react";
import { removeBackground, isApiKeyConfigured } from "../config/removeBg";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import api from "../config/axios";

export default function HoodieCustomizer() {
  const [color, setColor] = useState("#ff0000"); // couleur par défaut (rouge)
  const { isAuthenticated, user } = useAuth();
  const [isOrdering, setIsOrdering] = useState(false);

  // Couleurs prédéfinies
  const predefinedColors = [
    { name: "Noir", value: "#000000", emoji: "⚫" },
    { name: "Jaune", value: "#ffff00", emoji: "🟡" },
    { name: "Rouge", value: "#ff0000", emoji: "🔴" },
    { name: "Orange", value: "#ffa500", emoji: "🟠" },
    { name: "Bleu", value: "#0000ff", emoji: "🔵" },
    { name: "Blanc", value: "#ffffff", emoji: "⚪" },
    { name: "Vert", value: "#00ff00", emoji: "🟢" },
    { name: "Rose", value: "#ff69b4", emoji: "🩷" }
  ];
  const [logo, setLogo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logoPosition, setLogoPosition] = useState("chest"); // position par défaut
  const [logoSize, setLogoSize] = useState(80); // taille par défaut

  // Fonction pour nettoyer les blob URLs
  const cleanupBlobUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  // Fonction pour fermer
  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  // Gérer la touche Échap
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Nettoyer les blob URLs au démontage du composant
  useEffect(() => {
    return () => {
      cleanupBlobUrl(logo);
    };
  }, [logo]);

  // Positions disponibles pour le logo
  const logoPositions = [
    { id: "chest", name: "Poitrine", icon: "👕" },
    { id: "back", name: "Dos", icon: "🔙" },
    { id: "sleeve", name: "Manche", icon: "👋" },
    { id: "hood", name: "Capuche", icon: "🎩" },
    { id: "pocket", name: "Poche", icon: "👝" }
  ];

  // Fonction pour définir la taille recommandée selon la position
  const getRecommendedSize = (pos) => {
    switch (pos) {
      case "sleeve": return 60;
      case "hood": return 70;
      case "pocket": return 60;
      default: return 80;
    }
  };

  // Styles de positionnement pour chaque emplacement
  const getLogoStyle = (position) => {
    const baseStyle = {
      position: "absolute",
      width: `${logoSize}px`,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
    };

    switch (position) {
      case "chest":
        return { ...baseStyle, top: "40%", left: "50%" };
      case "back":
        return { ...baseStyle, top: "45%", left: "50%" }; // Position optimisée pour le dos
      case "sleeve":
        return { ...baseStyle, top: "60%", left: "25%" };
      case "hood":
        return { ...baseStyle, top: "15%", left: "50%" };
      case "pocket":
        return { ...baseStyle, top: "50%", left: "50%" };
      default:
        return { ...baseStyle, top: "40%", left: "50%" };
    }
  };

  // Mettre à jour la taille quand la position change
  const handlePositionChange = (newPosition) => {
    setLogoPosition(newPosition);
    setLogoSize(getRecommendedSize(newPosition));
  };

  // Upload du logo avec suppression d'arrière-plan
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);

      try {
        if (isApiKeyConfigured()) {
          // Avec suppression d'arrière-plan - retourne maintenant directement du base64
          const logoBase64 = await removeBackground(file);
          setLogo(logoBase64);
        } else {
          // Sans suppression d'arrière-plan (fallback) - déjà en base64
          const reader = new FileReader();
          reader.onload = (event) => {
            setLogo(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('Erreur lors du traitement du logo:', error);
        // Fallback: utiliser l'image originale en base64
        const reader = new FileReader();
        reader.onload = (event) => {
          setLogo(event.target.result);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Fonction pour passer la commande
  const handleOrderCustomHoodie = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour passer une commande');
      return;
    }

    if (!logo) {
      toast.error('Veuillez ajouter un logo avant de passer la commande');
      return;
    }

    // Vérifier que le logo est en base64
    if (!logo.startsWith('data:image/')) {
      toast.error('Erreur: Le logo n\'est pas dans le bon format. Veuillez le recharger.');
      console.error('Logo invalide:', logo.substring(0, 100));
      return;
    }

    setIsOrdering(true);

    try {
      // Créer les données de la commande personnalisée
      const customHoodieData = {
        type: 'custom_hoodie',
        couleur: color,
        couleurNom: predefinedColors.find(c => c.value === color)?.name || 'Personnalisée',
        logo: logo, // Le logo est déjà en base64 ou URL
        logoPosition: logoPosition,
        logoSize: logoSize,
        prix: 45.99, // Prix fixe pour un hoodie personnalisé
        quantite: 1,
        taille: 'M', // Taille par défaut, on pourrait ajouter un sélecteur
        notes: `Hoodie personnalisé - Couleur: ${predefinedColors.find(c => c.value === color)?.name}, Position logo: ${logoPositions.find(p => p.id === logoPosition)?.name}`
      };

      console.log('=== DONNÉES ENVOYÉES ===');
      console.log('Couleur:', color);
      console.log('Couleur nom:', predefinedColors.find(c => c.value === color)?.name);
      console.log('Logo (premiers 100 caractères):', logo ? logo.substring(0, 100) + '...' : 'AUCUN LOGO');
      console.log('Position logo:', logoPosition);
      console.log('Taille logo:', logoSize);
      console.log('Type de logo:', logo ? (logo.startsWith('data:') ? 'Base64 avec préfixe' : logo.startsWith('http') ? 'URL' : 'Base64 pur') : 'Aucun');
      console.log('========================');

      // Envoyer la commande personnalisée
      const response = await api.post('/orders/custom-hoodie', customHoodieData);
      
      toast.success('Commande de hoodie personnalisé créée avec succès !');
      
      // Fermer le customizer
      handleClose();
      
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      const message = error.response?.data?.message || 'Erreur lors de la création de la commande';
      toast.error(message);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <>
      <style>
        {`
          .hoodie-customizer::-webkit-scrollbar {
            width: 8px;
          }
          .hoodie-customizer::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .hoodie-customizer::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }
          .hoodie-customizer::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}
      </style>
      <div 
        className="hoodie-customizer"
        style={{ 
          textAlign: "center", 
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          overflowY: "auto",
          padding: "0",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          zIndex: "1000",
          // Style personnalisé pour la scrollbar Firefox
          scrollbarWidth: "thin",
          scrollbarColor: "#c1c1c1 #f1f1f1"
        }}
      >
        {/* Container principal avec design moderne */}
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)"
        }}>
          {/* Carte principale */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            maxWidth: "1200px",
            width: "100%",
            backdropFilter: "blur(20px)"
          }}>
            {/* Header avec titre et bouton fermer */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "30px",
              paddingBottom: "20px",
              borderBottom: "2px solid #f0f0f0"
            }}>
              <h2 style={{ 
                margin: "0",
                fontSize: "28px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                🎨 Personnalise ton hoodie
              </h2>
              <button
                onClick={handleClose}
                style={{
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)";
                }}
              >
                <span>✕</span>
                <span>Fermer</span>
              </button>
            </div>
        
            {/* Indicateurs de statut modernes */}
            <div style={{ 
              display: "flex", 
              gap: "10px", 
              justifyContent: "center", 
              marginBottom: "20px", 
              flexWrap: "wrap" 
            }}>
              {logoPosition === "back" && (
                <div style={{ 
                  padding: "10px 20px", 
                  background: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)", 
                  borderRadius: "25px",
                  fontSize: "14px",
                  color: "white",
                  display: "inline-block",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(116, 185, 255, 0.3)",
                  border: "none"
                }}>
                  🔙 Vue de dos activée
                </div>
              )}
              
              {color === "#000000" && (
                <div style={{ 
                  padding: "10px 20px", 
                  background: "linear-gradient(135deg, #2d3436 0%, #636e72 100%)", 
                  borderRadius: "25px",
                  fontSize: "14px",
                  color: "white",
                  display: "inline-block",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(45, 52, 54, 0.3)",
                  border: "none"
                }}>
                  ⚫ Capuche noire activée {logoPosition === "back" ? "(vue de dos)" : "(vue de face)"}
                </div>
              )}
            </div>

            {/* Layout en deux colonnes */}
            <div style={{
              display: "flex",
              gap: "30px",
              alignItems: "flex-start",
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
              {/* Colonne gauche - Image de la capuche */}
              <div style={{ 
                flex: "0 0 400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <div style={{ 
                  position: "relative", 
                  display: "inline-block",
                  background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  borderRadius: "20px",
                  padding: "30px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  marginBottom: "20px"
                }}>
                  <img
                    src={
                      color === "#000000" 
                        ? (logoPosition === "back" ? "/hoodie-dos-noir.png" : "/hoodie-noir.jpg")
                        : (logoPosition === "back" ? "/hoodie-dos.jpg" : "/hoodie-blanc.jpg")
                    }
                    alt="Hoodie"
                    style={{ 
                      maxWidth: "350px", 
                      display: "block",
                      borderRadius: "10px",
                      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)"
                    }}
                  />

                  {/* Calque couleur - seulement si ce n'est pas noir (on a déjà l'image noire) */}
                  {color !== "#000000" && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: color,
                        mixBlendMode: "multiply",
                        opacity: 1,
                        pointerEvents: "none",
                      }}
                    ></div>
                  )}

                  {/* Logo */}
                  {logo && (
                    <img
                      src={logo}
                      alt="Logo"
                      style={getLogoStyle(logoPosition)}
                    />
                  )}

                  {/* Indicateur de position (quand pas de logo) */}
                  {!logo && (
                    <div
                      style={{
                        ...getLogoStyle(logoPosition),
                        border: "2px dashed #007bff",
                        borderRadius: "50%",
                        background: "rgba(0, 123, 255, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        color: "#007bff",
                      }}
                    >
                      📍
                    </div>
                  )}

                  {/* Indicateur de traitement */}
                  {isProcessing && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(0,0,0,0.8)",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        fontSize: "14px",
                      }}
                    >
                      🔄 Traitement du logo...
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite - Contrôles */}
              <div style={{ 
                flex: "1",
                minWidth: "300px",
                maxWidth: "500px"
              }}>
                <div style={{ marginTop: "0" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                      🎨 Choisir couleur :
                    </label>
                    <div style={{ 
                      display: "flex", 
                      flexWrap: "wrap", 
                      gap: "8px", 
                      justifyContent: "center",
                      maxWidth: "500px",
                      margin: "0 auto"
                    }}>
                      {predefinedColors.map((colorOption) => (
                        <button
                          key={colorOption.value}
                          onClick={() => setColor(colorOption.value)}
                          style={{
                            padding: "10px 15px",
                            border: color === colorOption.value ? "3px solid #333" : "2px solid #ddd",
                            borderRadius: "25px",
                            background: colorOption.value,
                            color: colorOption.value === "#ffffff" || colorOption.value === "#ffff00" ? "#333" : "white",
                            cursor: "pointer",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.2s ease",
                            fontWeight: color === colorOption.value ? "bold" : "normal",
                            boxShadow: color === colorOption.value ? "0 4px 8px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
                            minWidth: "100px",
                            justifyContent: "center"
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>{colorOption.emoji}</span>
                          <span>{colorOption.name}</span>
                        </button>
                      ))}
                    </div>
                    <div style={{ 
                      marginTop: "10px", 
                      fontSize: "12px", 
                      color: "#666",
                      textAlign: "center"
                    }}>
                      Couleur sélectionnée : <strong style={{ color: color }}>{predefinedColors.find(c => c.value === color)?.name}</strong>
                    </div>
                  </div>

                  <label>
                    Ajouter logo :
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ marginLeft: "10px" }}
                      disabled={isProcessing}
                    />
                  </label>

                  {logo && (
                    <div style={{ marginTop: "15px" }}>
                      <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                        📍 Position du logo :
                      </label>
                      <div style={{ 
                        display: "flex", 
                        flexWrap: "wrap", 
                        gap: "8px", 
                        justifyContent: "center",
                        maxWidth: "400px",
                        margin: "0 auto"
                      }}>
                        {logoPositions.map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => handlePositionChange(pos.id)}
                            style={{
                              padding: "8px 12px",
                              border: logoPosition === pos.id ? "2px solid #007bff" : "1px solid #ddd",
                              borderRadius: "20px",
                              background: logoPosition === pos.id ? "#e3f2fd" : "white",
                              cursor: "pointer",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <span>{pos.icon}</span>
                            <span>{pos.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {logo && (
                    <div style={{ marginTop: "15px" }}>
                      <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                        📏 Taille du logo :
                      </label>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "10px",
                        background: "#f8f9fa",
                        padding: "10px",
                        borderRadius: "10px",
                        border: "1px solid #e9ecef"
                      }}>
                        <span style={{ fontSize: "12px", color: "#6c757d" }}>Petit</span>
                        <input
                          type="range"
                          min="40"
                          max="120"
                          value={logoSize}
                          onChange={(e) => setLogoSize(parseInt(e.target.value))}
                          style={{ 
                            width: "150px",
                            height: "6px",
                            background: "#ddd",
                            outline: "none",
                            borderRadius: "3px"
                          }}
                        />
                        <span style={{ fontSize: "12px", color: "#6c757d" }}>Grand</span>
                        <span style={{ 
                          fontSize: "12px", 
                          background: "#007bff", 
                          color: "white",
                          padding: "4px 8px", 
                          borderRadius: "15px",
                          minWidth: "50px",
                          textAlign: "center",
                          fontWeight: "bold"
                        }}>
                          {logoSize}px
                        </span>
                      </div>
                      <div style={{ 
                        marginTop: "5px", 
                        fontSize: "11px", 
                        color: "#6c757d",
                        textAlign: "center"
                      }}>
                        Taille recommandée pour {logoPositions.find(p => p.id === logoPosition)?.name}: {getRecommendedSize(logoPosition)}px
                        {logoSize !== getRecommendedSize(logoPosition) && (
                          <button
                            onClick={() => setLogoSize(getRecommendedSize(logoPosition))}
                            style={{
                              marginLeft: "10px",
                              background: "#28a745",
                              color: "white",
                              border: "none",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontSize: "10px",
                              cursor: "pointer"
                            }}
                          >
                            Réinitialiser
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!isApiKeyConfigured() && (
                    <div style={{ 
                      marginTop: "10px", 
                      padding: "10px", 
                      background: "#fff3cd", 
                      border: "1px solid #ffeaa7",
                      borderRadius: "5px",
                      fontSize: "12px",
                      color: "#856404"
                    }}>
                      ⚠️ <strong>Conseil :</strong> Pour supprimer automatiquement l'arrière-plan, 
                      utilisez des logos PNG transparents ou configurez l'API Remove.bg.
                    </div>
                  )}
                  
                  {logo && (
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        marginBottom: '10px',
                        padding: '8px',
                        background: '#e8f5e8',
                        borderRadius: '6px',
                        border: '1px solid #28a745'
                      }}>
                        <span style={{ fontSize: '14px' }}>✅</span>
                        <span style={{ fontSize: '12px', color: '#28a745', fontWeight: '600' }}>
                          Logo prêt pour la commande
                        </span>
                      </div>
                      <button
                        onClick={() => setLogo(null)}
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Supprimer le logo
                      </button>
                    </div>
                  )}

                  {/* Bouton Passer la commande */}
                  <div style={{ 
                    marginTop: "30px", 
                    padding: "20px", 
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    borderRadius: "15px",
                    border: "2px solid #28a745",
                    textAlign: "center"
                  }}>
                    <h4 style={{ 
                      margin: "0 0 15px 0", 
                      color: "#28a745",
                      fontSize: "18px",
                      fontWeight: "600"
                    }}>
                      🛒 Prêt à commander ?
                    </h4>
                    <p style={{ 
                      margin: "0 0 15px 0", 
                      color: "#6c757d",
                      fontSize: "14px"
                    }}>
                      Hoodie personnalisé - {predefinedColors.find(c => c.value === color)?.name} - {logoPositions.find(p => p.id === logoPosition)?.name}
                    </p>
                    <p style={{ 
                      margin: "0 0 20px 0", 
                      color: "#28a745",
                      fontSize: "20px",
                      fontWeight: "bold"
                    }}>
                      45,99 TND
                    </p>
                    <button
                      onClick={handleOrderCustomHoodie}
                      disabled={!logo || isOrdering}
                      style={{
                        background: isOrdering ? "#6c757d" : "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                        color: "white",
                        border: "none",
                        padding: "15px 30px",
                        borderRadius: "25px",
                        cursor: isOrdering ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        fontWeight: "600",
                        boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        margin: "0 auto",
                        opacity: !logo ? 0.6 : 1
                      }}
                      onMouseOver={(e) => {
                        if (!isOrdering && logo) {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 6px 20px rgba(40, 167, 69, 0.4)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isOrdering && logo) {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 4px 15px rgba(40, 167, 69, 0.3)";
                        }
                      }}
                    >
                      {isOrdering ? (
                        <>
                          <span>⏳</span>
                          <span>Création de la commande...</span>
                        </>
                      ) : (
                        <>
                          <span>🛒</span>
                          <span>Passer la commande</span>
                        </>
                      )}
                    </button>
                    {!logo && (
                      <p style={{ 
                        margin: "10px 0 0 0", 
                        color: "#dc3545",
                        fontSize: "12px",
                        fontStyle: "italic"
                      }}>
                        ⚠️ Veuillez ajouter un logo pour passer la commande
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}