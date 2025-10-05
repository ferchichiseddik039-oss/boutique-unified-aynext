
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaSort, FaHeart, FaShoppingCart, FaPalette } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatBrand, debugObjects } from '../utils/formatUtils';
import DebugWrapper from '../components/DebugWrapper';
import SimpleHoodieDesigner from '../components/SimpleHoodieDesigner';
import api from '../config/axios';
import '../styles/Products.css';

// Composant carte produit
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
        <img 
          src={product?.images?.[0]?.url || '/placeholder-product.jpg'} 
          alt={product?.images?.[0]?.alt || product?.nom || 'Produit'}
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
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
        <h3 className="product-name">
          {product?.nom || 'Produit'}
        </h3>
        
        <p className="product-brand">{formatBrand(product?.marque)}</p>
        
        <div className="product-price">
          {product?.prixPromo ? (
            <>
              <span className="original-price">{product?.prix || 0} TND</span>
              <span className="promo-price">{product?.prixPromo || 0} TND</span>
            </>
          ) : (
            <span className="price">{product?.prix || 0} TND</span>
          )}
        </div>
      </div>

    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    genre: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    color: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Log de débogage pour vérifier l'état de connexion
  useEffect(() => {
    console.log('🔍 État de connexion dans Products:', { 
      user: !!user, 
      isAuthenticated, 
      userId: user?._id 
    });
  }, [user, isAuthenticated]);

  // Gérer les paramètres URL pour les filtres
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const genreParam = searchParams.get('genre');
    const categoryParam = searchParams.get('categorie');
    
    if (genreParam) {
      setFilters(prev => ({
        ...prev,
        genre: genreParam,
        category: '' // Réinitialiser la catégorie si on filtre par genre
      }));
    } else if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        category: categoryParam,
        genre: '' // Réinitialiser le genre si on filtre par catégorie
      }));
    }
  }, [location.search]);


  useEffect(() => {
    // Charger les produits en priorité
    fetchProducts();
    
    // Charger les catégories et marques seulement si pas encore chargées
    if (categories.length === 0) {
      fetchCategories();
    }
    if (brands.length === 0) {
      fetchBrands();
    }
  }, [filters, sortBy, searchTerm, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        tri: sortBy
      };
      
      // Mapper les filtres vers les noms attendus par le backend
      if (filters.category) params.categorie = filters.category;
      if (filters.genre) params.genre = filters.genre;
      if (filters.brand) params.marque = filters.brand;
      if (filters.minPrice) params.prixMin = filters.minPrice;
      if (filters.maxPrice) params.prixMax = filters.maxPrice;
      if (filters.size) params.taille = filters.size;
      if (filters.color) params.couleur = filters.color;
      
      if (searchTerm) params.recherche = searchTerm;

      // Ajouter un timeout pour éviter les attentes trop longues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 secondes max

      const response = await api.get('/products', { 
        params,
        signal: controller.signal,
        timeout: 2000
      });
      
      clearTimeout(timeoutId);
      const data = response.data;
      
      const produits = data.products || [];
      debugObjects(produits, 'Products - fetchProducts');
      
      // Filtrer les produits pour ne garder que ceux qui sont disponibles (en stock)
      const produitsDisponibles = produits.filter(product => {
        // Vérifier si le produit a des tailles avec du stock
        if (product.tailles && Array.isArray(product.tailles)) {
          return product.tailles.some(taille => taille.stock > 0);
        }
        // Si pas de tailles définies, considérer comme disponible
        return true;
      });
      
      console.log('Produits reçus:', produits.length);
      console.log('Produits disponibles après filtrage:', produitsDisponibles.length);
      
      setProducts(produitsDisponibles);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Timeout: Le serveur met trop de temps à répondre');
        setTimeoutError(true);
        setProducts([]);
        setTotalPages(1);
      } else {
        console.log('Aucun produit trouvé ou base de données vide');
        setTimeoutError(false);
        setProducts([]);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Utiliser des catégories statiques pour simplifier
      const staticCategories = [
        { _id: '1', nom: 'Hoodies', code: 'hoodies' },
        { _id: '2', nom: 'T-Shirts', code: 't-shirts' },
        { _id: '3', nom: 'Sweats', code: 'sweats' },
        { _id: '4', nom: 'Pantalons', code: 'pantalons' },
        { _id: '5', nom: 'Accessoires', code: 'accessoires' }
      ];
      setCategories(staticCategories);
    } catch (error) {
      console.log('Erreur chargement catégories');
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      // Utiliser des marques statiques pour simplifier
      const staticBrands = [
        { _id: '1', nom: 'Premium', code: 'premium' },
        { _id: '2', nom: 'Basique', code: 'basique' },
        { _id: '3', nom: 'Comfort', code: 'comfort' },
        { _id: '4', nom: 'Style', code: 'style' },
        { _id: '5', nom: 'Sport', code: 'sport' }
      ];
      setBrands(staticBrands);
    } catch (error) {
      console.log('Erreur chargement marques');
      setBrands([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      color: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleRetry = () => {
    setTimeoutError(false);
    setLoading(true);
    fetchProducts();
  };

  const handleAddToCart = async (product, selectedSize, selectedColor) => {
    console.log('handleAddToCart appelé avec:', { 
      product: product?.nom, 
      productId: product?._id, 
      selectedSize, 
      selectedColor, 
      user: !!user 
    });

    if (!user) {
      console.log('Utilisateur non connecté');
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    // Utiliser des valeurs par défaut si aucune taille/couleur sélectionnée
    const size = selectedSize || 'M';
    const color = selectedColor || 'Noir';

    console.log('Tentative d\'ajout au panier...');
    const result = await addToCart(product._id, 1, size, color);
    console.log('Résultat de l\'ajout au panier:', result);
    if (!result.success) {
      // Le toast d'erreur est déjà affiché dans CartContext
      console.error('Erreur ajout au panier:', result.message);
    }
  };

  const handleCustomize = (product) => {
    setSelectedProduct(product);
    setShowCustomizer(true);
  };

  const handleCloseCustomizer = () => {
    setShowCustomizer(false);
    setSelectedProduct(null);
  };

  const handleCustomAddToCart = async (customProduct, selectedSize, selectedColor) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    // Pour les produits personnalisés, on ajoute les informations de personnalisation
    const customData = {
      productId: customProduct._id,
      personnalisation: customProduct.personnalisation,
      size: selectedSize || 'M',
      color: selectedColor || customProduct.personnalisation?.couleur?.nom || 'Noir'
    };

    console.log('Ajout produit personnalisé au panier:', customData);
    
    // Ici, vous pourriez adapter la logique d'ajout au panier pour les produits personnalisés
    const result = await addToCart(customProduct._id, 1, customData.size, customData.color);
    
    if (result.success) {
      toast.success('Produit personnalisé ajouté au panier !');
      handleCloseCustomizer();
    } else {
      console.error('Erreur ajout produit personnalisé:', result.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des produits...</p>
      </div>
    );
  }

  return (
    <DebugWrapper name="Products">
      <div className="products-page">
        <div className="products-header">
          <h1>Nos Produits</h1>
          <p>Découvrez notre collection de vêtements tendance</p>
        </div>

        <div className="products-container">
          {/* Filtres et recherche */}
          <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Filtres</h3>
              <button 
                className="clear-filters"
                onClick={clearFilters}
              >
                Effacer
              </button>
            </div>

            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            {categories && categories.length > 0 && (
              <div className="filter-section">
                <h4>Catégorie</h4>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(cat => {
                    const key = typeof cat === 'object' ? (cat._id || cat.code || cat.nom || 'unknown') : cat;
                    const value = typeof cat === 'object' ? (cat.nom || cat.code || cat._id || '') : cat;
                    const display = typeof cat === 'object' ? (cat.nom || cat.code || cat._id || '') : cat;
                    return (
                      <option key={key} value={value}>
                        {display}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="filter-section">
              <h4>Genre</h4>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
              >
                <option value="">Tous les genres</option>
                <option value="homme">👨 Homme</option>
                <option value="femme">👩 Femme</option>
                <option value="enfant">👶 Enfant</option>
                <option value="sport">🏃 Sport</option>
              </select>
            </div>

            {brands && brands.length > 0 && (
              <div className="filter-section">
                <h4>Marque</h4>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                >
                  <option value="">Toutes les marques</option>
                  {brands.map(brand => {
                    const key = typeof brand === 'object' ? (brand._id || brand.code || brand.nom || 'unknown') : brand;
                    const value = typeof brand === 'object' ? (brand.nom || brand.code || brand._id || '') : brand;
                    const display = typeof brand === 'object' ? (brand.nom || brand.code || brand._id || '') : brand;
                    return (
                      <option key={key} value={value}>
                        {display}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="filter-section">
              <h4>Prix</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-section">
              <h4>Taille</h4>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
              >
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
              <select
                value={filters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
              >
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
              <button
                className="filters-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                Filtres
              </button>

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

            {!products || products.length === 0 ? (
              <div className="no-products">
                {timeoutError ? (
                  <>
                    <h3>⏱️ Délai d'attente dépassé</h3>
                    <p>Le serveur met trop de temps à répondre. Voulez-vous réessayer ?</p>
                    <button onClick={handleRetry} className="retry-button">
                      🔄 Réessayer
                    </button>
                  </>
                ) : (
                  <>
                    <h3>Aucun produit disponible</h3>
                    <p>
                      {searchTerm || Object.values(filters).some(f => f) 
                        ? "Aucun produit en stock ne correspond à vos critères. Essayez de modifier vos filtres ou votre recherche." 
                        : "Aucun produit en stock pour le moment. La boutique est en cours de préparation. Revenez bientôt !"
                      }
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products?.map(product => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onCustomize={handleCustomize}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? 'active' : ''}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Customizer Modal */}
      {showCustomizer && selectedProduct && (
        <SimpleHoodieDesigner
          onClose={handleCloseCustomizer}
        />
      )}
    </DebugWrapper>
  );
};

export default Products;