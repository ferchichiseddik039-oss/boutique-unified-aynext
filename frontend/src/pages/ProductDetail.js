import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaShare, FaStar, FaShoppingCart, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatBrand, formatCategory } from '../utils/formatUtils';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setProduct(data);
        // Charger les produits similaires
        fetchRelatedProducts(data.categorie, data.marque);
      } else {
        toast.error('Produit non trouvé');
        navigate('/products');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du produit');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category, brand) => {
    try {
      const response = await fetch(`/api/products?category=${category}&brand=${brand}&limit=4`);
      const data = await response.json();
      if (response.ok) {
        setRelatedProducts(data.products.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits similaires');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    if (!selectedSize || !selectedColor) {
      toast.error('Veuillez sélectionner une taille et une couleur');
      return;
    }

    const result = await addToCart(product._id, quantity, selectedSize, selectedColor);
    if (!result.success) {
      // Le toast d'erreur est déjà affiché dans CartContext
      console.error('Erreur ajout au panier:', result.message);
    }
  };

  const handleOrderNow = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour passer une commande');
      return;
    }

    if (!selectedSize || !selectedColor) {
      toast.error('Veuillez sélectionner une taille et une couleur');
      return;
    }

    // Ajouter au panier puis rediriger vers la page de commande
    const result = await addToCart(product._id, quantity, selectedSize, selectedColor);
    if (result.success) {
      // Rediriger vers la page de commande
      navigate('/cart');
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleImageClick = (index) => {
    setActiveImage(index);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.nom,
        text: product.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers !');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du produit...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Produit non trouvé</h2>
        <p>Le produit que vous recherchez n'existe pas.</p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Retour aux produits
        </button>
      </div>
    );
  }

  const availableSizes = product.tailles ? product.tailles.filter(taille => 
    taille.stock > 0
  ) : [];

  const availableColors = product.couleurs ? product.couleurs.map(couleur => couleur.nom) : [];
  const finalPrice = product.prixPromo || product.prix;
  const discount = product.prixPromo ? Math.round(((product.prix - product.prixPromo) / product.prix) * 100) : 0;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Galerie d'images */}
        <div className="product-gallery">
          <div className="main-image">
            <img 
              src={product.images[activeImage]?.url || '/placeholder-product.jpg'} 
              alt={product.images[activeImage]?.alt || product.nom}
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
            {product.prixPromo && (
              <div className="discount-badge">
                -{discount}%
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-images">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${index === activeImage ? 'active' : ''}`}
                  onClick={() => handleImageClick(index)}
                >
                  <img 
                    src={image?.url || image} 
                    alt={image?.alt || `${product.nom} - Image ${index + 1}`}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">{product.nom}</h1>
            <p className="product-brand">{formatBrand(product.marque)}</p>
            
            <div className="product-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <FaStar 
                    key={star} 
                    className={star <= 4 ? 'star filled' : 'star'} 
                  />
                ))}
              </div>
              <span className="rating-text">4.0 (128 avis)</span>
            </div>
          </div>

          <div className="product-price">
            {product.prixPromo ? (
              <>
                <span className="original-price">{product.prix} TND</span>
                <span className="final-price">{product.prixPromo} TND</span>
                <span className="discount-text">Économisez {product.prix - product.prixPromo} TND</span>
              </>
            ) : (
              <span className="final-price">{product.prix} TND</span>
            )}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Sélection de taille */}
          <div className="product-options">
            <div className="option-group">
              <h4>Taille</h4>
              <div className="size-options">
                {availableSizes.map(taille => (
                  <button
                    key={taille.nom}
                    className={`size-option ${selectedSize === taille.nom ? 'selected' : ''} ${taille.stock === 0 ? 'out-of-stock' : ''}`}
                    onClick={() => handleSizeChange(taille.nom)}
                    disabled={taille.stock === 0}
                  >
                    {taille.nom}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="stock-info">
                  Stock disponible: {(product.tailles?.find(t => t.nom === selectedSize)?.stock) || 0} unité(s)
                </p>
              )}
            </div>

            {/* Sélection de couleur */}
            <div className="option-group">
              <h4>Couleur</h4>
              <div className="color-options">
                {(product.couleurs || []).map(couleur => (
                  <button
                    key={couleur.nom}
                    className={`color-option ${selectedColor === couleur.nom ? 'selected' : ''}`}
                    onClick={() => handleColorChange(couleur.nom)}
                    style={{ backgroundColor: couleur.code }}
                    title={couleur.nom}
                  >
                    {selectedColor === couleur.nom && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantité */}
            <div className="option-group">
              <h4>Quantité</h4>
              <div className="quantity-selector">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Actions principales */}
          <div className="product-main-actions">
            <button
              className="order-now-btn primary"
              onClick={handleOrderNow}
              disabled={!selectedSize || !selectedColor}
            >
              <FaShoppingCart />
              Passer la commande
            </button>
            
            <button
              className="add-to-cart-btn secondary"
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
            >
              <FaShoppingCart />
              Ajouter au panier
            </button>
          </div>

          {/* Actions secondaires */}
          <div className="product-secondary-actions">
            <button className="wishlist-btn">
              <FaHeart />
              Favoris
            </button>
            
            <button className="share-btn" onClick={handleShare}>
              <FaShare />
              Partager
            </button>
          </div>

          {/* Informations supplémentaires */}
          <div className="product-features">
            <div className="feature">
              <FaTruck />
              <div>
                <h5>Livraison gratuite</h5>
                <p>Pour toute commande supérieure à 50 TND</p>
              </div>
            </div>
            
            <div className="feature">
              <FaShieldAlt />
              <div>
                <h5>Garantie 30 jours</h5>
                <p>Retour et échange sans frais</p>
              </div>
            </div>
            
            <div className="feature">
              <FaUndo />
              <div>
                <h5>Retour facile</h5>
                <p>Retour sous 30 jours</p>
              </div>
            </div>
          </div>

          {/* Détails techniques */}
          <div className="product-details">
            <h3>Détails du produit</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Référence:</span>
                <span className="value">{product._id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Catégorie:</span>
                <span className="value">{formatCategory(product.categorie)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Marque:</span>
                <span className="value">{formatBrand(product.marque)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Matériau:</span>
                <span className="value">100% Coton</span>
              </div>
              <div className="detail-item">
                <span className="label">Entretien:</span>
                <span className="value">Lavage à 30°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produits similaires */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Produits similaires</h2>
          <div className="related-products-grid">
            {relatedProducts.map(product => (
              <RelatedProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant produit similaire
const RelatedProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="related-product-card" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="product-image">
        <img 
          src={product.images[0]?.url || '/placeholder-product.jpg'} 
          alt={product.images[0]?.alt || product.nom}
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>
      <div className="product-info">
        <h4>{product.nom}</h4>
        <p className="brand">{formatBrand(product.marque)}</p>
        <div className="price">
          {product.prixPromo ? (
            <>
              <span className="original">{product.prix} TND</span>
              <span className="promo">{product.prixPromo} TND</span>
            </>
          ) : (
            <span>{product.prix} TND</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
