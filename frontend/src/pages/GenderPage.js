import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaSort, FaHeart, FaShoppingCart, FaPalette, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatBrand, debugObjects } from '../utils/formatUtils';
import DebugWrapper from '../components/DebugWrapper';
import SimpleHoodieDesigner from '../components/SimpleHoodieDesigner';
import api from '../config/axios';
import '../styles/Products.css';

// Composant carte produit (réutilisé de Products.js)
const ProductCard = ({ product, onAddToCart, onCustomize }) => {
  // Débogage des données du produit
  useEffect(() => {
    debugObjects(product, 'ProductCard - product');
    if (product?.marque) {
      debugObjects(product.marque, 'ProductCard - product.marque');
    }
  }, [product]);

  const handleCardClick = () => {
    // Navigation vers la page de détail du produit
    window.location.href = `/product/${product._id}`;
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image">
        {product?.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]?.url || product.images[0]} 
            alt={product.images[0]?.alt || product.nom}
            onError={(e) => {
              e.target.src = '/hoodie-base.jpg';
            }}
          />
        ) : (
          <img 
            src="/hoodie-base.jpg" 
            alt="Image par défaut"
            className="default-image"
          />
        )}
        <div className="product-actions">
          <button 
            className="action-btn favorite"
            title="Ajouter aux favoris"
            onClick={(e) => e.stopPropagation()}
          >
            <FaHeart />
          </button>
          {product?.estPersonnalise && (
            <button 
              className="action-btn customize"
              onClick={(e) => {
                e.stopPropagation();
                onCustomize(product);
              }}
              title="Personnaliser"
            >
              <FaPalette />
            </button>
          )}
        </div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product?.nom || 'Produit sans nom'}</h3>
        <p className="product-brand">{formatBrand(product?.marque)}</p>
        
        <div className="product-price">
          {product?.prixReduit && product.prixReduit < product.prix ? (
            <div className="price-container">
              <span className="original-price">{product.prix} TND</span>
              <span className="sale-price">{product.prixReduit} TND</span>
            </div>
          ) : (
            <span className="price">{product?.prix || 0} TND</span>
          )}
        </div>
      </div>
      
    </div>
  );
};

const GenderPage = () => {
  const { genre } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('dateAjout');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Configuration des genres
  const genreConfig = {
    femme: {
      title: '👩 Collection Femme',
      description: 'Découvrez notre collection exclusive pour femme',
      emoji: '👩',
      color: '#FF6B9D'
    },
    homme: {
      title: '👨 Collection Homme',
      description: 'Style et confort pour l\'homme moderne',
      emoji: '👨',
      color: '#4A90E2'
    },
    enfant: {
      title: '👶 Collection Enfant',
      description: 'Vêtements tendance pour les petits',
      emoji: '👶',
      color: '#7ED321'
    },
    sport: {
      title: '🏃‍♂️ COLLECTION SPORT',
      description: 'Performance • Style • Innovation - Vêtements techniques pour athlètes',
      emoji: '🏃‍♂️',
      color: '#EF4444',
      gradient: 'linear-gradient(135deg, #000000 0%, #EF4444 50%, #EC4899 100%)',
      bgPattern: 'sport'
    }
  };

  const currentGenre = genreConfig[genre] || genreConfig.femme;

  useEffect(() => {
    fetchProducts();
  }, [genre, sortBy, searchTerm, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        tri: sortBy,
        genre: genre
      };
      
      if (searchTerm) params.recherche = searchTerm;

      const response = await api.get('/products', { 
        params,
        timeout: 5000
      });
      
      const data = response.data;
      const produits = data.produits || [];
      
      // Filtrer les produits pour ne garder que ceux qui sont disponibles
      const produitsDisponibles = produits.filter(product => {
        if (product.tailles && Array.isArray(product.tailles)) {
          return product.tailles.some(taille => taille.stock > 0);
        }
        return true; // Si pas de tailles définies, on garde le produit
      });
      
      setProducts(produitsDisponibles);
      setTotalPages(Math.ceil((data.total || 0) / 12));
      
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleAddToCart = async (product, selectedSize, selectedColor) => {
    console.log('handleAddToCart appelé avec:', { 
      product: product?.nom,
      selectedSize,
      selectedColor
    });
    
    try {
      const result = await addToCart(product._id, 1, selectedSize, selectedColor);
      if (result.success) {
        toast.success(`${product.nom} ajouté au panier !`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  const handleCustomize = (product) => {
    setSelectedProduct(product);
    setShowCustomizer(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <DebugWrapper name="GenderPage">
      <div className={`products-page ${genre === 'sport' ? 'sport-page' : ''}`}>
        {/* Header spécial pour la collection sport */}
        {genre === 'sport' ? (
          <div className="sport-hero-section">
            <div className="sport-hero-bg">
              <div className="sport-pattern"></div>
              <div className="sport-gradient"></div>
            </div>
            <div className="container">
              <div className="sport-hero-content">
                <div className="sport-title-container">
                  <h1 className="sport-title">
                    <span className="sport-emoji">{currentGenre.emoji}</span>
                    <span className="sport-text">{currentGenre.title}</span>
                  </h1>
                  <div className="sport-subtitle">
                    <p>{currentGenre.description}</p>
                  </div>
                  <div className="sport-features">
                    <div className="sport-feature">
                      <span className="sport-feature-icon">⚡</span>
                      <span>Performance</span>
                    </div>
                    <div className="sport-feature">
                      <span className="sport-feature-icon">🎯</span>
                      <span>Précision</span>
                    </div>
                    <div className="sport-feature">
                      <span className="sport-feature-icon">💪</span>
                      <span>Endurance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="products-header">
            <Link to="/" className="back-to-home-link">
              <FaArrowLeft />
              Retour à l'accueil
            </Link>
            <h1>{currentGenre.title}</h1>
            <p>{currentGenre.description}</p>
          </div>
        )}

        <div className="products-container">
          {/* Filtres et recherche */}
          <div className="filters-sidebar">
            <div className="filters-header">
              <h3>Filtres</h3>
            </div>

            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Rechercher dans cette collection..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            <div className="filter-section">
              <h4>Genre</h4>
              <select value={genre} disabled>
                <option value={genre}>{currentGenre.emoji} {currentGenre.title.split(' ')[1]}</option>
              </select>
            </div>

            <div className="filter-section">
              <h4>Catégorie</h4>
              <select>
                <option value="">Toutes les catégories</option>
                <option value="hoodie">Hoodie</option>
                <option value="pull">Pull</option>
                {genre === 'sport' && (
                  <>
                    <option value="training">Training</option>
                    <option value="running">Running</option>
                    <option value="fitness">Fitness</option>
                    <option value="outdoor">Outdoor</option>
                  </>
                )}
              </select>
            </div>

            <div className="filter-section">
              <h4>Marque</h4>
              <select>
                <option value="">Toutes les marques</option>
                <option value="AYNEXT">AYNEXT</option>
              </select>
            </div>

            <div className="filter-section">
              <h4>Prix</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="filter-section">
              <h4>Taille</h4>
              <select>
                <option value="">Toutes les tailles</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div className="filter-section">
              <h4>Couleur</h4>
              <select>
                <option value="">Toutes les couleurs</option>
                <option value="noir">Noir</option>
                <option value="blanc">Blanc</option>
                <option value="rouge">Rouge</option>
                <option value="bleu">Bleu</option>
                <option value="vert">Vert</option>
                <option value="jaune">Jaune</option>
                <option value="rose">Rose</option>
                <option value="gris">Gris</option>
              </select>
            </div>
          </div>

          {/* Produits */}
          <div className="products-main">
            <div className="products-toolbar">
              <div className="sort-controls">
                <FaSort />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="name">Nom A-Z</option>
                  <option value="-name">Nom Z-A</option>
                  <option value="prix">Prix croissant</option>
                  <option value="-prix">Prix décroissant</option>
                  <option value="createdAt">Plus récents</option>
                  <option value="-createdAt">Plus anciens</option>
                </select>
              </div>

              <div className="results-info">
                {products?.length || 0} produit(s) disponible(s)
                <small style={{ display: 'block', color: '#666', fontSize: '0.9em' }}>
                  Seuls les produits en stock sont affichés
                </small>
              </div>
            </div>

            <div className="products-grid">
              {products.length > 0 ? (
                products.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onCustomize={handleCustomize}
                  />
                ))
              ) : (
                <div className="no-products">
                  <div className="no-products-content">
                    <h3>Aucun produit trouvé</h3>
                    <p>Il n'y a actuellement aucun produit dans cette collection.</p>
                    <Link to="/" className="back-to-home-btn">
                      Retour à l'accueil
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Précédent
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de personnalisation */}
      {showCustomizer && selectedProduct && (
        <div className="customizer-modal">
          <div className="customizer-content">
            <button 
              className="close-customizer"
              onClick={() => setShowCustomizer(false)}
            >
              ×
            </button>
            <SimpleHoodieDesigner 
              product={selectedProduct}
              onClose={() => setShowCustomizer(false)}
            />
          </div>
        </div>
      )}
    </DebugWrapper>
  );
};

export default GenderPage;
