import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaBox, FaShoppingCart, FaChartLine, FaCog, FaSignOutAlt, FaTimes, FaHome, FaUser, FaMapMarkerAlt, FaCity, FaMailBulk, FaGlobe, FaChartBar, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatBrand } from '../utils/formatUtils';
import SettingsTab from '../components/SettingsTab';
import api from '../config/axios';
import '../styles/Admin.css';
import '../styles/ModernDashboard.css';
import '../styles/Settings.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { user, logout } = useAuth();
  const { socket, isConnected, joinAdminRoom, leaveAdminRoom } = useSocket();
  const navigate = useNavigate();

  // Fonction pour mettre à jour les statistiques basées sur le nombre de produits
  const updateStatsFromProducts = (newProductCount) => {
    setStats(prevStats => ({
      ...prevStats,
      totalProducts: newProductCount
    }));
    console.log('📊 Statistiques mises à jour localement - Produits:', newProductCount);
  };

  // Vérifier que le token admin est valide avant les requêtes importantes
  const checkAdminToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token d\'authentification manquant');
      window.location.href = '/admin-login';
      return false;
    }

    try {
      await api.get('/auth/check');
      return true;
    } catch (error) {
      console.error('Token admin invalide:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expirée. Veuillez vous reconnecter.');
        window.location.href = '/admin-login';
      }
      return false;
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
      // Rejoindre la room admin pour les mises à jour en temps réel
      joinAdminRoom();
    }
  }, [user]); // Retiré joinAdminRoom des dépendances

  // Quitter la room admin quand le composant est démonté
  useEffect(() => {
    return () => {
      leaveAdminRoom();
    };
  }, []); // Retiré leaveAdminRoom des dépendances

  // Écouter les événements WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Événement quand un produit est supprimé
    socket.on('product-deleted', (data) => {
      console.log('Produit supprimé via WebSocket:', data);
      setProducts(prev => {
        const newProducts = prev.filter(p => p._id !== data.productId);
        // Mettre à jour les statistiques avec le nouveau nombre
        updateStatsFromProducts(newProducts.length);
        return newProducts;
      });
      toast.info(`Produit "${data.productName}" supprimé par ${data.deletedBy}`);
    });

    // Événement quand un produit est ajouté
    socket.on('product-added', (data) => {
      console.log('Produit ajouté via WebSocket:', data);
      setProducts(prev => {
        const newProducts = [data.product, ...prev];
        // Mettre à jour les statistiques avec le nouveau nombre
        updateStatsFromProducts(newProducts.length);
        return newProducts;
      });
      toast.info(`Nouveau produit "${data.product.nom}" ajouté par ${data.addedBy}`);
    });

    // Événement quand un produit est mis à jour
    socket.on('product-updated', (data) => {
      console.log('Produit mis à jour via WebSocket:', data);
      setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
      // Pas besoin de mettre à jour le nombre pour une mise à jour
      toast.info(`Produit "${data.product.nom}" mis à jour par ${data.updatedBy}`);
    });

    // Événement pour les statistiques mises à jour en temps réel
    socket.on('stats-updated', (data) => {
      console.log('📊 Statistiques reçues via WebSocket:', data);
      console.log('📦 Nombre de produits reçu:', data.totalProducts);
      console.log('💰 Chiffre d\'affaires reçu:', data.chiffreAffaires);
      console.log('👥 Nombre d\'utilisateurs reçu:', data.totalUsers);
      console.log('🛒 Nombre de commandes reçu:', data.totalOrders);
      setStats(data);
      toast.info(`Statistiques mises à jour: ${data.totalProducts} produits`, { autoClose: 2000 });
    });

    // Cleanup
    return () => {
      socket.off('product-deleted');
      socket.off('product-added');
      socket.off('product-updated');
      socket.off('stats-updated');
    };
  }, [socket, isConnected]);

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // Quitter la room admin avant de se déconnecter
      leaveAdminRoom();
      logout();
      navigate('/');
      toast.success('Déconnexion réussie');
    }
  };

  // Charger les utilisateurs quand on clique sur l'onglet Utilisateurs
  useEffect(() => {
    if (activeTab === 'users' && user && user.role === 'admin') {
      fetchUsers(1, 20, '', '');
    }
  }, [activeTab, user]);

  // Charger toutes les commandes quand on clique sur l'onglet Commandes
  useEffect(() => {
    if (activeTab === 'orders' && user && user.role === 'admin') {
      fetchAllOrders();
    }
  }, [activeTab, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('📊 Statistiques initiales chargées:', statsData);
        console.log('📦 Nombre de produits initial:', statsData.totalProducts);
        setStats(statsData);
      }

      // Charger les produits
      console.log('Chargement des produits...');
      try {
        const productsResponse = await api.get('/products?limit=100'); // Charger plus de produits pour avoir le vrai total
        console.log('Données produits reçues:', productsResponse.data);
        const loadedProducts = productsResponse.data.produits || productsResponse.data.products || [];
        console.log('Nombre de produits chargés:', loadedProducts.length);
        setProducts(loadedProducts);
        
        // Synchroniser les statistiques avec le nombre réel de produits
        if (loadedProducts.length > 0) {
          setStats(prevStats => ({
            ...prevStats,
            totalProducts: loadedProducts.length
          }));
          console.log('📊 Statistiques synchronisées - Produits:', loadedProducts.length);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      }

      // Charger les commandes récentes (toutes les commandes pour l'admin)
      try {
        const ordersResponse = await api.get('/orders/admin/toutes?limit=10');
        setOrders(ordersResponse.data.commandes || ordersResponse.data.orders || []);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
      }

      // Charger les utilisateurs récents pour le dashboard
      await fetchUsers(1, 10);

    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1, limit = 20, search = '', role = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) params.append('recherche', search);
      if (role) params.append('role', role);

      const response = await fetch(`/api/users/admin/tous?${params}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.utilisateurs);
        setUsersPagination(data.pagination);
      } else {
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/admin/toutes');
      setOrders(response.data.commandes || response.data.orders || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour voir les détails d'un utilisateur
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };


  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="access-denied">
            <h1>Accès refusé</h1>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <Link to="/" className="btn-primary">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <h2>Administration</h2>
            <p>AYNEXT</p>
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢 Temps réel' : '🔴 Hors ligne'}
              </span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button
              className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaChartLine className="sidebar-icon" />
              <span>Tableau de bord</span>
            </button>
            
            <button
              className={`sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <FaBox className="sidebar-icon" />
              <span>Produits</span>
            </button>
            
            <button
              className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaShoppingCart className="sidebar-icon" />
              <span>Commandes</span>
            </button>
            
            <button
              className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FaUsers className="sidebar-icon" />
              <span>Utilisateurs</span>
            </button>
            
            <button
              className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog className="sidebar-icon" />
              <span>Paramètres</span>
            </button>
          </nav>
          
          {/* Bouton Accueil */}
          <div className="sidebar-home">
            <Link
              to="/"
              className="sidebar-item home-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaHome className="sidebar-icon" />
              <span>Voir la boutique</span>
            </Link>
          </div>
          
          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button
              className="sidebar-item logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="sidebar-icon" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="admin-main">
          <div className="admin-content">
          {activeTab === 'dashboard' && (
            <DashboardTab stats={stats} onRefresh={fetchDashboardData} />
          )}
          
          {activeTab === 'products' && (
            <ProductsTab 
              products={products} 
              onProductAdded={(newProduct) => {
                setProducts(prev => [...(prev || []), newProduct]);
              }}
            />
          )}
          
          {activeTab === 'orders' && (
            <OrdersTab 
              orders={orders} 
              onOrdersUpdate={setOrders}
            />
          )}
          
          {activeTab === 'users' && (
            <UsersTab 
              users={users}
              pagination={usersPagination}
              onViewUser={handleViewUser}
            />
          )}
          
          {activeTab === 'settings' && (
            <SettingsTab />
          )}
          </div>
        </div>
      </div>

      {/* Modal des détails utilisateur */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

// Onglet Tableau de bord moderne
const DashboardTab = ({ stats, onRefresh }) => {
  console.log('🎯 DashboardTab - Stats reçues:', stats);
  
  // Fonction pour calculer la tendance
  const getTrend = (value, type) => {
    if (type === 'revenue' && value > 200) return 'up';
    if (type === 'users' && value > 2) return 'up';
    if (type === 'products' && value > 1) return 'up';
    if (type === 'orders' && value > 4) return 'up';
    return 'stable';
  };

  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  // Fonction pour obtenir la description
  const getDescription = (type, value) => {
    switch (type) {
      case 'users':
        return value > 5 ? 'Croissance excellente' : value > 2 ? 'Croissance stable' : 'En développement';
      case 'products':
        return value > 10 ? 'Catalogue complet' : value > 5 ? 'Catalogue en expansion' : 'Catalogue en construction';
      case 'orders':
        return value > 20 ? 'Activité élevée' : value > 10 ? 'Activité modérée' : 'Activité en croissance';
      case 'revenue':
        return value > 1000 ? 'Performances excellentes' : value > 500 ? 'Performances bonnes' : 'Performances en développement';
      default:
        return 'Données mises à jour';
    }
  };

  return (
    <div className="dashboard-tab">
      {/* En-tête moderne */}
      <div className="modern-stats-header">
        <div className="modern-header-content">
          <div>
            <h1 className="modern-header-title">Statistiques de la boutique</h1>
            <p className="modern-header-subtitle">
              Vue d'ensemble en temps réel de votre activité commerciale
            </p>
          </div>
          <div className="modern-stats-controls">
            <div className="modern-realtime-indicator">
              <div className="modern-pulse-dot"></div>
              <span>Mise à jour en temps réel</span>
            </div>
            <button 
              className="modern-refresh-btn"
              onClick={onRefresh}
              title="Rafraîchir les statistiques"
            >
              <FaChartLine />
            </button>
          </div>
        </div>
      </div>

      {/* Grille de statistiques moderne */}
      <div className="modern-stats-grid">
        {/* Utilisateurs */}
        <div className="modern-stat-card users">
          <div className="modern-stat-header">
            <div className="modern-stat-icon">
              <FaUsers />
            </div>
            <div className={`modern-stat-trend ${getTrend(stats.totalUsers, 'users')}`}>
              <span>{getTrendIcon(getTrend(stats.totalUsers, 'users'))}</span>
              <span>Tendance</span>
            </div>
          </div>
          <div className="modern-stat-content">
            <div className="modern-stat-value">{stats.totalUsers || 0}</div>
            <div className="modern-stat-label">Utilisateurs inscrits</div>
            <div className="modern-stat-description">
              {getDescription('users', stats.totalUsers)}
            </div>
          </div>
        </div>

        {/* Produits */}
        <div className="modern-stat-card products">
          <div className="modern-stat-header">
            <div className="modern-stat-icon">
              <FaBox />
            </div>
            <div className={`modern-stat-trend ${getTrend(stats.totalProducts, 'products')}`}>
              <span>{getTrendIcon(getTrend(stats.totalProducts, 'products'))}</span>
              <span>Stock</span>
            </div>
          </div>
          <div className="modern-stat-content">
            <div className="modern-stat-value">{stats.totalProducts || 0}</div>
            <div className="modern-stat-label">Produits disponibles</div>
            <div className="modern-stat-description">
              {getDescription('products', stats.totalProducts)}
            </div>
          </div>
        </div>

        {/* Commandes */}
        <div className="modern-stat-card orders">
          <div className="modern-stat-header">
            <div className="modern-stat-icon">
              <FaShoppingCart />
            </div>
            <div className={`modern-stat-trend ${getTrend(stats.totalOrders, 'orders')}`}>
              <span>{getTrendIcon(getTrend(stats.totalOrders, 'orders'))}</span>
              <span>Activité</span>
            </div>
          </div>
          <div className="modern-stat-content">
            <div className="modern-stat-value">{stats.totalOrders || 0}</div>
            <div className="modern-stat-label">Commandes totales</div>
            <div className="modern-stat-description">
              {getDescription('orders', stats.totalOrders)}
            </div>
          </div>
        </div>

        {/* Chiffre d'affaires */}
        <div className="modern-stat-card revenue">
          <div className="modern-stat-header">
            <div className="modern-stat-icon">
              <FaChartLine />
            </div>
            <div className={`modern-stat-trend ${getTrend(stats.chiffreAffaires, 'revenue')}`}>
              <span>{getTrendIcon(getTrend(stats.chiffreAffaires, 'revenue'))}</span>
              <span>Performance</span>
            </div>
          </div>
          <div className="modern-stat-content">
            <div className="modern-stat-value">{stats.chiffreAffaires || 0}</div>
            <div className="modern-stat-label">Chiffre d'affaires (TND)</div>
            <div className="modern-stat-description">
              {getDescription('revenue', stats.chiffreAffaires)}
            </div>
          </div>
        </div>
      </div>

      {/* Commandes récentes */}
      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <div className="modern-recent-section">
          <h3 className="modern-section-title">
            <FaShoppingCart />
            Commandes récentes
          </h3>
          <div className="modern-recent-orders">
            {stats.recentOrders.slice(0, 5).map((order, index) => (
              <div key={order._id || index} className="modern-order-item">
                <div className="modern-order-info">
                  <div className="modern-order-avatar">
                    {order.utilisateur?.prenom?.charAt(0) || 'U'}
                  </div>
                  <div className="modern-order-details">
                    <h4>
                      Commande #{order._id?.slice(-8)}
                    </h4>
                    <p>
                      {order.utilisateur?.prenom} {order.utilisateur?.nom}
                    </p>
                  </div>
                </div>
                <div className="modern-order-amount">
                  {order.total} TND
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Onglet Produits
const ProductsTab = ({ products, onProductAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [productsList, setProductsList] = useState(products || []);
  const { user } = useAuth();

  // Log pour débogage
  console.log('ProductsTab - Produits reçus:', products);
  console.log('ProductsTab - Nombre de produits:', products?.length || 0);

  // Mettre à jour la liste des produits quand les props changent
  useEffect(() => {
    setProductsList(products || []);
  }, [products]);

  // Fonction pour supprimer un produit
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le produit "${productName}" ?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('Tentative de suppression du produit:', productId);
      console.log('Utilisateur actuel:', user);
      console.log('Token:', localStorage.getItem('token'));
      
      await api.delete(`/api/products/${productId}`);
      
      // La mise à jour sera gérée par WebSocket
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression du produit';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // Fonction pour voir les détails d'un produit
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // Fonction pour modifier un produit
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditForm(true);
    setShowProductDetails(false);
  };

  return (
    <div className="products-tab">
      <div className="tab-header">
        <h2>Gestion des produits</h2>
        <div className="header-actions">
          <p>Total: {productsList?.length || 0} produits</p>
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <FaPlus />
            Ajouter un produit
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddProductForm 
          onClose={() => setShowAddForm(false)}
          onProductAdded={async (newProduct) => {
            // La mise à jour sera gérée par WebSocket
            setShowAddForm(false);
            toast.success('Produit ajouté avec succès');
          }}
        />
      )}

      {showEditForm && selectedProduct && (
        <EditProductForm 
          product={selectedProduct}
          onClose={() => {
            setShowEditForm(false);
            setSelectedProduct(null);
          }}
          onProductUpdated={async (updatedProduct) => {
            // La mise à jour sera gérée par WebSocket
            setShowEditForm(false);
            setSelectedProduct(null);
            toast.success('Produit modifié avec succès');
          }}
        />
      )}

      <div className="products-grid">
        {(productsList || []).map(product => {
          const totalStock = product.tailles ? 
            product.tailles.reduce((total, taille) => total + (taille.stock || 0), 0) 
            : 0;
          const mainImage = product.images && product.images.length > 0 ? product.images[0].url : null;
          
          return (
            <div key={product._id} className="product-card">
              <div className="product-image">
                {mainImage ? (
                  <img 
                    src={mainImage} 
                    alt={product.images[0].alt || product.nom}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="no-image" style={{ display: mainImage ? 'none' : 'flex' }}>
                  <FaBox />
                  <span>Aucune image</span>
                </div>
                <div className="product-badges">
                  {product.estNouveau && <span className="badge new">Nouveau</span>}
                  {product.estEnPromotion && <span className="badge promo">Promo</span>}
                  {product.estPopulaire && <span className="badge popular">Populaire</span>}
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.nom}</h3>
                <p className="product-brand">{formatBrand(product.marque)}</p>
                <p className="product-category">{product.categorie}</p>
                
                <div className="product-pricing">
                  <span className="current-price">{product.prix} TND</span>
                  {product.prixReduit && product.prixReduit < product.prix && (
                    <span className="original-price">{product.prixReduit} TND</span>
                  )}
                </div>
                
                <div className="product-stock">
                  <span className={`stock-indicator ${totalStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {totalStock > 0 ? `${totalStock} en stock` : 'Rupture de stock'}
                  </span>
                </div>
                
                {product.tailles && product.tailles.length > 0 && (
                  <div className="product-sizes">
                    <span className="sizes-label">Tailles disponibles:</span>
                    <div className="sizes-list">
                      {product.tailles
                        .filter(taille => taille.stock > 0)
                        .map(taille => (
                          <span key={taille.nom} className="size-tag">
                            {taille.nom} ({taille.stock})
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}
                
                {product.couleurs && product.couleurs.length > 0 && (
                  <div className="product-colors">
                    <span className="colors-label">Couleurs:</span>
                    <div className="colors-list">
                      {product.couleurs.slice(0, 5).map((couleur, index) => (
                        <div 
                          key={index}
                          className="color-dot" 
                          style={{ backgroundColor: couleur.code }}
                          title={couleur.nom}
                        />
                      ))}
                      {product.couleurs.length > 5 && (
                        <span className="more-colors">+{product.couleurs.length - 5}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="product-actions">
                <button 
                  className="btn-icon edit" 
                  title="Modifier le produit"
                  onClick={() => handleEditProduct(product)}
                  disabled={loading}
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn-icon view" 
                  title="Voir les détails"
                  onClick={() => handleViewProduct(product)}
                >
                  <FaEye />
                </button>
                <button 
                  className="btn-icon delete" 
                  title="Supprimer le produit"
                  onClick={() => handleDeleteProduct(product._id, product.nom)}
                  disabled={loading}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de détails du produit */}
      {showProductDetails && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowProductDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails du produit</h3>
              <button 
                className="close-btn"
                onClick={() => setShowProductDetails(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="product-details">
              <div className="product-image-section">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img 
                    src={selectedProduct.images[0].url} 
                    alt={selectedProduct.nom}
                    className="product-detail-image"
                  />
                ) : (
                  <div className="no-image">Aucune image</div>
                )}
              </div>
              
              <div className="product-info-section">
                <h4>{selectedProduct.nom}</h4>
                <p><strong>Marque:</strong> {selectedProduct.marque || 'N/A'}</p>
                <p><strong>Catégorie:</strong> {selectedProduct.categorie || 'N/A'}</p>
                <p><strong>Genre:</strong> {selectedProduct.genre || 'N/A'}</p>
                <p><strong>Prix:</strong> {selectedProduct.prix} TND</p>
                {selectedProduct.prixReduit && (
                  <p><strong>Prix réduit:</strong> {selectedProduct.prixReduit} TND</p>
                )}
                <p><strong>Description:</strong> {selectedProduct.description || 'Aucune description'}</p>
                
                {selectedProduct.tailles && selectedProduct.tailles.length > 0 && (
                  <div className="sizes-section">
                    <h5>Tailles disponibles:</h5>
                    <div className="sizes-list">
                      {selectedProduct.tailles.map((taille, index) => (
                        <span key={index} className="size-item">
                          {taille.taille}: {taille.stock || 0} en stock
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedProduct.couleurs && selectedProduct.couleurs.length > 0 && (
                  <div className="colors-section">
                    <h5>Couleurs disponibles:</h5>
                    <div className="colors-list">
                      {selectedProduct.couleurs.map((couleur, index) => (
                        <span key={index} className="color-item">
                          {couleur.nom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowProductDetails(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Onglet Commandes
const OrdersTab = ({ orders, onOrdersUpdate }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getOrderTypeIcon = (order) => {
    const hasCustomHoodie = order.articles?.some(article => article.type === 'custom_hoodie');
    return hasCustomHoodie ? '🎨' : '📦';
  };

  const getOrderTypeLabel = (order) => {
    const hasCustomHoodie = order.articles?.some(article => article.type === 'custom_hoodie');
    return hasCustomHoodie ? 'Hoodie personnalisé' : 'Commande standard';
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      'en_attente': { label: 'En attente', color: '#ffc107', bgColor: '#fff3cd', icon: '⏳' },
      'confirmee': { label: 'Confirmée', color: '#17a2b8', bgColor: '#d1ecf1', icon: '✅' },
      'en_preparation': { label: 'En préparation', color: '#fd7e14', bgColor: '#ffeaa7', icon: '🔧' },
      'expediee': { label: 'Expédiée', color: '#6f42c1', bgColor: '#e2e3f1', icon: '🚚' },
      'livree': { label: 'Livrée', color: '#28a745', bgColor: '#d4edda', icon: '📦' },
      'annulee': { label: 'Annulée', color: '#dc3545', bgColor: '#f8d7da', icon: '❌' }
    };
    return statusConfig[status] || { label: status, color: '#6c757d', bgColor: '#f8f9fa', icon: '❓' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = (orders || []).filter(order => {
    const matchesStatus = filterStatus === 'all' || order.statut === filterStatus;
    const matchesSearch = !searchTerm || 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.utilisateur?.nom} ${order.utilisateur?.prenom}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = (orders || []).reduce((acc, order) => {
    acc[order.statut] = (acc[order.statut] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="orders-tab-modern">
      {/* En-tête avec statistiques */}
      <div className="orders-header">
        <div className="orders-header-content">
          <div className="orders-title-section">
            <h2 className="orders-title">Gestion des Commandes</h2>
            <p className="orders-subtitle">Suivi et gestion de toutes les commandes clients</p>
          </div>
          <div className="orders-stats">
            <div className="orders-stat-item">
              <span className="stat-number">{orders?.length || 0}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="orders-controls">
        <div className="orders-search">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Rechercher par nom client ou numéro de commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
        
        <div className="orders-filters">
          <div className="filter-group">
            <label>Statut:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les statuts ({orders?.length || 0})</option>
              {Object.entries(statusCounts).map(([status, count]) => (
                <option key={status} value={status}>
                  {getStatusInfo(status).label} ({count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="orders-grid">
        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h3>Aucune commande trouvée</h3>
            <p>Aucune commande ne correspond aux critères de recherche</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.statut);
            return (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-type">
                    <span className="order-icon">{getOrderTypeIcon(order)}</span>
                    <span className="order-type-label">{getOrderTypeLabel(order)}</span>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge-modern"
                      style={{ 
                        color: statusInfo.color,
                        backgroundColor: statusInfo.bgColor,
                        borderColor: statusInfo.color
                      }}
                    >
                      <span className="status-icon">{statusInfo.icon}</span>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-info-row">
                    <div className="order-info-item">
                      <span className="info-label">N° Commande</span>
                      <span className="info-value">#{order._id?.slice(-8) || 'N/A'}</span>
                    </div>
                    <div className="order-info-item">
                      <span className="info-label">Client</span>
                      <span className="info-value">{order.utilisateur?.nom} {order.utilisateur?.prenom}</span>
                    </div>
                  </div>

                  <div className="order-info-row">
                    <div className="order-info-item">
                      <span className="info-label">Date</span>
                      <span className="info-value">{formatDate(order.dateCreation)}</span>
                    </div>
                    <div className="order-info-item">
                      <span className="info-label">Total</span>
                      <span className="info-value price">{order.total} TND</span>
                    </div>
                  </div>

                  <div className="order-articles">
                    <span className="info-label">Articles ({order.articles?.length || 0})</span>
                    <div className="articles-list">
                      {order.articles?.slice(0, 2).map((article, index) => (
                        <div key={index} className="article-item">
                          {article.type === 'custom_hoodie' ? (
                            <div className="custom-article">
                              <span className="custom-icon">🎨</span>
                              <span className="article-name">{article.nom}</span>
                              {article.customData?.logo && !article.customData.logo.startsWith('blob:') && (
                                <img 
                                  src={article.customData.logo} 
                                  alt="Logo"
                                  className="article-logo"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="standard-article">
                              <span className="article-name">{article.nom}</span>
                              {article.quantite > 1 && <span className="quantity">x{article.quantite}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                      {order.articles?.length > 2 && (
                        <div className="more-articles">
                          +{order.articles.length - 2} autres articles
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="order-card-footer">
                  <button 
                    className="btn-view-details"
                    onClick={() => handleViewOrder(order)}
                  >
                    <FaEye />
                    Voir détails
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de détails de commande */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => setShowOrderDetails(false)}
          onStatusUpdate={(updatedOrder) => {
            // Mettre à jour la commande dans la liste
            onOrdersUpdate(prevOrders => 
              prevOrders.map(order => 
                order._id === updatedOrder._id ? updatedOrder : order
              )
            );
            setSelectedOrder(updatedOrder);
          }}
        />
      )}
    </div>
  );
};

// Onglet Utilisateurs
const UsersTab = ({ users, pagination, onViewUser }) => {
  const [, forceUpdate] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (nom, prenom) => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
  };

  const isUserActive = (user) => {
    // Si l'utilisateur n'a jamais de dernière connexion, il est inactif
    if (!user.lastLogin) {
      return false;
    }

    // Calculer la différence en minutes entre maintenant et la dernière connexion
    const now = new Date();
    const lastLogin = new Date(user.lastLogin);
    const diffInMinutes = (now - lastLogin) / (1000 * 60);

    // Considérer l'utilisateur comme actif s'il s'est connecté dans les dernières 30 minutes
    return diffInMinutes <= 30;
  };

  // Mettre à jour le statut toutes les minutes pour refléter les changements en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="users-tab">
      <div className="tab-header">
        <div className="header-content">
          <div className="header-text">
            <h2>Gestion des utilisateurs</h2>
            <p>Gérez tous les utilisateurs de votre boutique</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">{pagination?.total || 0}</div>
              <div className="stat-label">Total utilisateurs</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{(users || []).filter(u => u.role === 'admin').length}</div>
              <div className="stat-label">Administrateurs</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{(users || []).filter(u => u.role === 'client').length}</div>
              <div className="stat-label">Clients</div>
            </div>
          </div>
        </div>
      </div>

      <div className="users-grid">
        {(users || []).map(user => (
          <div key={user._id} className="user-card">
            <div className="user-avatar">
              <div className="avatar-circle">
                {getInitials(user.nom, user.prenom)}
              </div>
              <div className={`status-indicator ${isUserActive(user) ? 'active' : 'inactive'}`}></div>
            </div>
            
            <div className="user-info">
              <h3 className="user-name">{user.nom} {user.prenom}</h3>
              <p className="user-email">{user.email}</p>
              <div className="user-meta">
                <span className="user-role">
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? 'Administrateur' : 'Client'}
                  </span>
                </span>
                <span className="user-date">
                  Créé le {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="user-actions">
              <button 
                className="action-btn view-btn" 
                title="Voir détails"
                onClick={() => onViewUser(user)}
              >
                <FaEye />
                <span>Détails</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!users || users.length === 0) && (
        <div className="empty-state">
          <div className="empty-icon">
            <FaUsers />
          </div>
          <h3>Aucun utilisateur trouvé</h3>
          <p>Il n'y a actuellement aucun utilisateur dans votre boutique.</p>
        </div>
      )}
    </div>
  );
};



// Composant formulaire d'ajout de produit
const AddProductForm = ({ onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    prixReduit: '',
    categorie: '',
    genre: '',
    sousCategorie: '',
    marque: '',
    materiau: '',
    entretien: '',
    estEnPromotion: false,
    estNouveau: false,
    estPopulaire: false,
    tags: []
  });

  const [tailles, setTailles] = useState([
    { nom: 'XS', stock: 0 },
    { nom: 'S', stock: 0 },
    { nom: 'M', stock: 0 },
    { nom: 'L', stock: 0 },
    { nom: 'XL', stock: 0 },
    { nom: 'XXL', stock: 0 }
  ]);

  const [couleurs, setCouleurs] = useState([
    { nom: '⚫ Noir', code: '#000000' },
    { nom: '🟡 Jaune', code: '#FFFF00' },
    { nom: '🔴 Rouge', code: '#FF0000' },
    { nom: '🟠 Orange', code: '#FFA500' },
    { nom: '🔵 Bleu', code: '#0000FF' },
    { nom: '⚪ Blanc', code: '#FFFFFF' },
    { nom: '🟢 Vert', code: '#00FF00' },
    { nom: '🩷 Rose', code: '#FFC0CB' }
  ]);

  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'hoodie', 'pull'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTailleChange = (index, field, value) => {
    const newTailles = [...tailles];
    newTailles[index] = { ...newTailles[index], [field]: value };
    setTailles(newTailles);
  };

  const handleCouleurChange = (index, field, value) => {
    const newCouleurs = [...couleurs];
    newCouleurs[index] = { ...newCouleurs[index], [field]: value };
    setCouleurs(newCouleurs);
  };

  const addCouleur = () => {
    setCouleurs([...couleurs, { nom: '', code: '#000000' }]);
  };

  const removeCouleur = (index) => {
    setCouleurs(couleurs.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({ 
        ...prev, 
        images: 'Seules les images de moins de 5MB sont acceptées' 
      }));
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    
    // Créer des URLs de prévisualisation
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file,
          preview: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    // Vérifier le token admin avant l'upload
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    setUploadingImages(true);
    const uploadedImages = [];

    try {
      // Upload toutes les images en une seule fois
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/upload/product-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const result = response.data;
        uploadedImages.push(...result.images.map(img => img.url));
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement des images');
      }
    } catch (error) {
      console.error('Erreur upload images:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des images';
      setErrors(prev => ({ 
        ...prev, 
        images: errorMessage
      }));
      
      // Si erreur d'authentification, rediriger vers login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/admin-login';
      }
    } finally {
      setUploadingImages(false);
    }

    return uploadedImages;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.prix || formData.prix <= 0) newErrors.prix = 'Le prix doit être supérieur à 0';
    if (!formData.categorie) newErrors.categorie = 'La catégorie est requise';
    if (!formData.marque.trim()) newErrors.marque = 'La marque est requise';

    // Vérifier qu'au moins une taille a du stock
    const hasStock = tailles.some(taille => taille.stock > 0);
    if (!hasStock) newErrors.stock = 'Au moins une taille doit avoir du stock';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Vérifier le token admin avant de continuer
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token d\'authentification manquant');
      window.location.href = '/admin-login';
      return;
    }

    setLoading(true);
    
    try {
      // Upload des images d'abord
      const uploadedImages = await uploadImages();
      
      const productData = {
        ...formData,
        prix: parseFloat(formData.prix),
        prixReduit: formData.prixReduit ? parseFloat(formData.prixReduit) : null,
        tailles: tailles.filter(taille => taille.stock > 0), // Seulement les tailles avec stock
        couleurs: couleurs.filter(couleur => couleur.nom.trim() !== ''), // Seulement les couleurs nommées
        images: uploadedImages.map(url => ({
          url: url,
          alt: formData.nom || 'Image produit'
        })) // Convertir les URLs en objets avec url et alt
      };

      const response = await api.post('/products', productData);

      if (response.status === 201) {
        const newProduct = response.data;
        onProductAdded(newProduct);
        // Reset form
        setFormData({
          nom: '',
          description: '',
          prix: '',
          prixReduit: '',
          categorie: '',
          sousCategorie: '',
          marque: '',
          materiau: '',
          entretien: '',
          estEnPromotion: false,
          estNouveau: false,
          estPopulaire: false,
          tags: []
        });
        setTailles(tailles.map(t => ({ ...t, stock: 0 })));
        setCouleurs([
          { nom: 'Noir', code: '#000000' },
          { nom: 'Blanc', code: '#FFFFFF' },
          { nom: 'Rouge', code: '#FF0000' },
          { nom: 'Bleu', code: '#0000FF' },
          { nom: 'Vert', code: '#00FF00' }
        ]);
        setImages([]);
        setImageFiles([]);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Erreur lors de l\'ajout du produit' });
      }
    } catch (error) {
      setErrors({ submit: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-form">
      <div className="form-header">
        <h3>Ajouter un nouveau produit</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h4>Informations générales</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nom du produit *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={errors.nom ? 'error' : ''}
                placeholder="Ex: T-shirt Premium"
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
            </div>

            <div className="form-group">
              <label>Marque *</label>
              <input
                type="text"
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                className={errors.marque ? 'error' : ''}
                placeholder="Ex: Nike, Adidas..."
              />
              {errors.marque && <span className="error-message">{errors.marque}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Description détaillée du produit..."
              rows="3"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prix (TND) *</label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                className={errors.prix ? 'error' : ''}
                placeholder="29.99"
                step="0.01"
                min="0"
              />
              {errors.prix && <span className="error-message">{errors.prix}</span>}
            </div>

            <div className="form-group">
              <label>Prix réduit (TND)</label>
              <input
                type="number"
                name="prixReduit"
                value={formData.prixReduit}
                onChange={handleChange}
                placeholder="19.99"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Catégorie *</label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className={errors.categorie ? 'error' : ''}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.categorie && <span className="error-message">{errors.categorie}</span>}
            </div>

            <div className="form-group">
              <label>Genre *</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className={errors.genre ? 'error' : ''}
              >
                <option value="">Sélectionner un genre</option>
                <option value="homme">👨 Homme</option>
                <option value="femme">👩 Femme</option>
                <option value="enfant">👶 Enfant</option>
                <option value="sport">🏃 Sport</option>
              </select>
              {errors.genre && <span className="error-message">{errors.genre}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sous-catégorie</label>
              <input
                type="text"
                name="sousCategorie"
                value={formData.sousCategorie}
                onChange={handleChange}
                placeholder="Ex: T-shirts, Jeans..."
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Tailles et stock</h4>
          <div className="tailles-grid">
            {tailles.map((taille, index) => (
              <div key={index} className="taille-item">
                <label>{taille.nom}</label>
                <input
                  type="number"
                  value={taille.stock}
                  onChange={(e) => handleTailleChange(index, 'stock', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          {errors.stock && <span className="error-message">{errors.stock}</span>}
        </div>

        <div className="form-section">
          <h4>Couleurs disponibles</h4>
          <div className="couleurs-list">
            {couleurs.map((couleur, index) => (
              <div key={index} className="couleur-item">
                <input
                  type="text"
                  value={couleur.nom}
                  onChange={(e) => handleCouleurChange(index, 'nom', e.target.value)}
                  placeholder="Nom de la couleur"
                />
                <input
                  type="color"
                  value={couleur.code}
                  onChange={(e) => handleCouleurChange(index, 'code', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeCouleur(index)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={addCouleur} className="add-couleur-btn">
              + Ajouter une couleur
            </button>
          </div>
        </div>

        <div className="form-section">
          <h4>Images du produit</h4>
          
          <div className="image-upload-area">
            <div className="upload-zone">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="upload-label">
                <div className="upload-icon">📷</div>
                <p>Cliquez pour ajouter des images</p>
                <small>Formats acceptés: JPG, PNG, GIF (max 5MB)</small>
              </label>
            </div>

            {images.length > 0 && (
              <div className="image-preview-grid">
                {images.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={image.preview} alt={`Preview ${index + 1}`} />
                    <div className="image-overlay">
                      <span className="image-name">{image.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                        title="Supprimer l'image"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.images && (
              <span className="error-message">{errors.images}</span>
            )}

            {uploadingImages && (
              <div className="upload-progress">
                <p>Chargement des images en cours...</p>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h4>Détails supplémentaires</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Matériau</label>
              <input
                type="text"
                name="materiau"
                value={formData.materiau}
                onChange={handleChange}
                placeholder="Ex: 100% Coton"
              />
            </div>

            <div className="form-group">
              <label>Entretien</label>
              <input
                type="text"
                name="entretien"
                value={formData.entretien}
                onChange={handleChange}
                placeholder="Ex: Lavage à 30°C"
              />
            </div>
          </div>

          <div className="checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="estEnPromotion"
                checked={formData.estEnPromotion}
                onChange={handleChange}
              />
              En promotion
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="estNouveau"
                checked={formData.estNouveau}
                onChange={handleChange}
              />
              Nouveau produit
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="estPopulaire"
                checked={formData.estPopulaire}
                onChange={handleChange}
              />
              Produit populaire
            </label>
          </div>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Ajout en cours...' : 'Ajouter le produit'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Composant modal pour les détails de commande
const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusButtons, setShowStatusButtons] = useState(false);
  
  if (!order) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadLogo = (logoData, filename) => {
    try {
      console.log('Tentative de téléchargement du logo:', {
        type: logoData.startsWith('data:') ? 'Base64 avec préfixe' : logoData.startsWith('http') ? 'URL' : 'Base64 pur',
        length: logoData.length,
        preview: logoData.substring(0, 50)
      });

      // Si c'est une URL, on la télécharge directement
      if (logoData.startsWith('http')) {
        const link = document.createElement('a');
        link.href = logoData;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Si c'est du base64 avec préfixe data:, on le télécharge directement
      if (logoData.startsWith('data:image/')) {
        const link = document.createElement('a');
        link.href = logoData;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Si c'est du base64 pur, on l'ajoute le préfixe data:image
      if (logoData.startsWith('/9j/') || logoData.startsWith('iVBORw0KGgo')) {
        const mimeType = logoData.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
        const dataUrl = `data:${mimeType};base64,${logoData}`;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      console.error('Format de logo non reconnu:', logoData.substring(0, 50));
      alert('Format de logo non supporté pour le téléchargement');
    } catch (error) {
      console.error('Erreur lors du téléchargement du logo:', error);
      alert('Erreur lors du téléchargement du logo: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'en_attente': '#ffc107',
      'confirmee': '#17a2b8',
      'en_preparation': '#fd7e14',
      'expediee': '#6f42c1',
      'livree': '#28a745',
      'annulee': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'en_preparation': 'En préparation',
      'expediee': 'Expédiée',
      'livree': 'Livrée',
      'annulee': 'Annulée'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'en_attente': '⏳',
      'confirmee': '✅',
      'en_preparation': '🔧',
      'expediee': '🚚',
      'livree': '📦',
      'annulee': '❌'
    };
    return icons[status] || '❓';
  };

  const handleStatusUpdate = async (newStatus) => {
    if (isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const response = await api.put(`/api/orders/${order._id}/statut`, {
        statut: newStatus
      });
      
      if (response.data) {
        toast.success(`Statut mis à jour: ${getStatusLabel(newStatus)}`);
        if (onStatusUpdate) {
          onStatusUpdate(response.data);
        }
        setShowStatusButtons(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getAvailableStatuses = (currentStatus) => {
    const allStatuses = [
      { value: 'en_attente', label: 'En attente', icon: '⏳' },
      { value: 'confirmee', label: 'Confirmée', icon: '✅' },
      { value: 'en_preparation', label: 'En préparation', icon: '🔧' },
      { value: 'expediee', label: 'Expédiée', icon: '🚚' },
      { value: 'livree', label: 'Livrée', icon: '📦' },
      { value: 'annulee', label: 'Annulée', icon: '❌' }
    ];
    
    // Retourner tous les statuts sauf le statut actuel
    return allStatuses.filter(status => status.value !== currentStatus);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Détails de la commande #{order._id?.slice(-6)}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Informations générales */}
          <div className="order-section">
            <h4>Informations générales</h4>
            <div className="info-grid">
              <div>
                <strong>Client:</strong> {order.utilisateur?.nom} {order.utilisateur?.prenom}
              </div>
              <div>
                <strong>Email:</strong> {order.utilisateur?.email}
              </div>
              <div>
                <strong>Date:</strong> {formatDate(order.dateCommande)}
              </div>
              <div>
                <strong>Statut:</strong> 
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                  <span 
                    style={{ 
                      color: getStatusColor(order.statut),
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 8px',
                      backgroundColor: getStatusColor(order.statut) + '20',
                      borderRadius: '4px',
                      border: `1px solid ${getStatusColor(order.statut)}`
                    }}
                  >
                    <span>{getStatusIcon(order.statut)}</span>
                    {getStatusLabel(order.statut)}
                  </span>
                  <button
                    onClick={() => setShowStatusButtons(!showStatusButtons)}
                    disabled={isUpdatingStatus}
                    style={{
                      background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: isUpdatingStatus ? 0.6 : 1
                    }}
                  >
                    <span>✏️</span>
                    Modifier
                  </button>
                </div>
                
                {/* Boutons de changement de statut */}
                {showStatusButtons && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '6px',
                    border: '1px solid #dee2e6'
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6c757d', 
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      Changer le statut vers:
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '6px' 
                    }}>
                      {getAvailableStatuses(order.statut).map(status => (
                        <button
                          key={status.value}
                          onClick={() => handleStatusUpdate(status.value)}
                          disabled={isUpdatingStatus}
                          style={{
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            opacity: isUpdatingStatus ? 0.6 : 1,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            if (!isUpdatingStatus) {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 2px 4px rgba(40, 167, 69, 0.3)';
                            }
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <span>{status.icon}</span>
                          {status.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowStatusButtons(false)}
                      style={{
                        background: 'transparent',
                        color: '#6c757d',
                        border: '1px solid #dee2e6',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        marginTop: '8px'
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
              <div>
                <strong>Méthode de paiement:</strong> {order.methodePaiement}
              </div>
              {order.numeroSuivi && (
                <div>
                  <strong>Numéro de suivi:</strong> {order.numeroSuivi}
                </div>
              )}
            </div>
          </div>

          {/* Articles */}
          <div className="order-section">
            <h4>Articles commandés</h4>
            <div className="articles-list">
              {order.articles?.map((article, index) => (
                <div key={index} className="article-item">
                  <div className="article-header">
                    <h5>
                      {article.type === 'custom_hoodie' ? '🎨 ' : '📦 '}
                      {article.nom}
                    </h5>
                    <span className="article-price">{article.prixTotal} TND</span>
                  </div>
                  
                  <div className="article-details">
                    <div><strong>Quantité:</strong> {article.quantite}</div>
                    <div><strong>Taille:</strong> {article.taille}</div>
                    <div><strong>Couleur:</strong> {article.couleur}</div>
                    <div><strong>Prix unitaire:</strong> {article.prixUnitaire} TND</div>
                  </div>

                  {/* Détails spécifiques pour les hoodies personnalisés */}
                  {article.type === 'custom_hoodie' && article.customData && (
                    <div className="custom-hoodie-details">
                      <h6>🎨 Détails de personnalisation:</h6>
                      {console.log('=== DONNÉES REÇUES DANS L\'ADMIN ===', {
                        logo: article.customData.logo ? article.customData.logo.substring(0, 100) + '...' : 'AUCUN LOGO',
                        logoType: article.customData.logo ? (article.customData.logo.startsWith('data:') ? 'Base64 avec préfixe' : article.customData.logo.startsWith('http') ? 'URL' : 'Base64 pur') : 'Aucun',
                        logoSize: article.customData.logoSize,
                        logoPosition: article.customData.logoPosition
                      })}
                      <div className="custom-details-grid">
                        <div>
                          <strong>Couleur:</strong> 
                          <span 
                            style={{ 
                              display: 'inline-block',
                              width: '20px',
                              height: '20px',
                              backgroundColor: article.customData.couleurCode,
                              border: '1px solid #ccc',
                              marginLeft: '8px',
                              verticalAlign: 'middle'
                            }}
                            title={article.customData.couleurNom}
                          ></span>
                          <span style={{ marginLeft: '8px' }}>{article.customData.couleurNom}</span>
                        </div>
                        <div>
                          <strong>Position du logo:</strong> {article.customData.logoPosition}
                        </div>
                        <div>
                          <strong>Taille du logo:</strong> {article.customData.logoSize}px
                        </div>
                        {article.customData.logo && (
                          <div>
                            <strong>Logo:</strong>
                            <div style={{ marginTop: '8px' }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                flexWrap: 'wrap'
                              }}>
                                {/* Vérifier si c'est une blob URL et l'afficher avec un message d'erreur */}
                                {article.customData.logo.startsWith('blob:') ? (
                                  <div style={{
                                    width: '120px',
                                    height: '120px',
                                    border: '2px dashed #dc3545',
                                    borderRadius: '8px',
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    gap: '5px',
                                    fontSize: '12px',
                                    textAlign: 'center'
                                  }}>
                                    <span>⚠️</span>
                                    <span>Logo non disponible</span>
                                    <span>(Blob URL expirée)</span>
                                  </div>
                                ) : (
                                  <img 
                                    src={article.customData.logo} 
                                    alt="Logo personnalisé"
                                    style={{
                                      maxWidth: '120px',
                                      maxHeight: '120px',
                                      border: '2px solid #28a745',
                                      borderRadius: '8px',
                                      padding: '8px',
                                      backgroundColor: 'white',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                      objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                )}
                                <div 
                                  style={{ 
                                    display: 'none',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '120px',
                                    height: '120px',
                                    border: '2px dashed #28a745',
                                    borderRadius: '8px',
                                    backgroundColor: '#f8f9fa',
                                    color: '#6c757d',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    flexDirection: 'column',
                                    gap: '5px'
                                  }}
                                >
                                  <span>🖼️</span>
                                  <span>Logo non disponible</span>
                                </div>
                                <button
                                  onClick={() => downloadLogo(article.customData.logo, `logo-${order._id.slice(-6)}.png`)}
                                  style={{
                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.4)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 4px rgba(40, 167, 69, 0.3)';
                                  }}
                                >
                                  <span>⬇️</span>
                                  <span>Télécharger</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totaux */}
          <div className="order-section">
            <h4>Récapitulatif</h4>
            <div className="totals">
              <div className="total-line">
                <span>Sous-total:</span>
                <span>{order.sousTotal} TND</span>
              </div>
              <div className="total-line">
                <span>Frais de livraison:</span>
                <span>{order.fraisLivraison} TND</span>
              </div>
              {order.reduction > 0 && (
                <div className="total-line">
                  <span>Réduction:</span>
                  <span>-{order.reduction} TND</span>
                </div>
              )}
              <div className="total-line total-final">
                <span><strong>Total:</strong></span>
                <span><strong>{order.total} TND</strong></span>
              </div>
            </div>
          </div>

          {/* Adresses */}
          <div className="order-section">
            <h4>Adresse de livraison</h4>
            <div className="address">
              {order.adresseLivraison?.nom} {order.adresseLivraison?.prenom}<br/>
              {order.adresseLivraison?.rue}<br/>
              {order.adresseLivraison?.codePostal} {order.adresseLivraison?.ville}<br/>
              {order.adresseLivraison?.pays}<br/>
              {order.adresseLivraison?.telephone && (
                <>Tél: {order.adresseLivraison.telephone}</>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="order-section">
              <h4>Notes</h4>
              <p className="notes">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant EditProductForm
const EditProductForm = ({ product, onClose, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    nom: product.nom || '',
    description: product.description || '',
    prix: product.prix || 0,
    prixReduit: product.prixReduit || '',
    categorie: product.categorie || '',
    genre: product.genre || '',
    marque: product.marque || '',
    materiau: product.materiau || '',
    entretien: product.entretien || '',
    tailles: product.tailles ? product.tailles.map(taille => ({
      nom: taille.nom || taille.taille || '',
      stock: taille.stock || 0
    })) : [],
    couleurs: product.couleurs ? product.couleurs.map(couleur => ({
      nom: couleur.nom || '',
      code: couleur.code || ''
    })) : []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [forceUpdate, setForceUpdate] = useState(0);
  const [localTailles, setLocalTailles] = useState([]);
  const [renderKey, setRenderKey] = useState(0);
  const [manualRender, setManualRender] = useState(0);

  // Initialiser les tailles locales
  useEffect(() => {
    setLocalTailles(formData.tailles || []);
  }, [product]);

  // Effet pour surveiller les changements de tailles
  useEffect(() => {
    console.log('🔄 Tailles mises à jour:', formData.tailles);
    console.log('📊 Nombre de tailles:', formData.tailles.length);
    console.log('🔍 Détails des tailles:', formData.tailles.map(t => `${t.nom}(${t.stock})`));
    console.log('🏠 Tailles locales:', localTailles);
  }, [formData.tailles, forceUpdate, localTailles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSizeChange = (index, field, value) => {
    const newTailles = [...formData.tailles];
    newTailles[index] = {
      ...newTailles[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      tailles: newTailles
    }));
    
    // Synchroniser avec l'état local
    setLocalTailles(newTailles);
  };

  const addSize = () => {
    console.log('Ajout d\'une nouvelle taille...');
    console.log('Tailles actuelles:', formData.tailles);
    
    setFormData(prev => {
      const newTailles = [...prev.tailles, { nom: '', stock: 0 }];
      console.log('Nouvelles tailles:', newTailles);
      return {
        ...prev,
        tailles: newTailles
      };
    });
  };

  const addSizeFromSelect = (sizeName) => {
    console.log('🚀 DÉBUT - Solution ALTERNATIVE pour:', sizeName);
    
    // Vérifier si la taille n'existe pas déjà
    const tailleExists = formData.tailles.some(taille => taille.nom === sizeName);
    
    if (tailleExists) {
      toast.warning(`La taille ${sizeName} existe déjà`);
      return;
    }
    
    const newTaille = { nom: sizeName, stock: 0 };
    console.log('➕ Nouvelle taille:', JSON.stringify(newTaille));
    
    // APPROCHE ALTERNATIVE - Manipulation directe
    const currentTailles = formData.tailles || [];
    const newTailles = [...currentTailles, newTaille];
    
    console.log('🔄 Nouvelles tailles:', JSON.stringify(newTailles));
    
    // MISE À JOUR DIRECTE - Sans dépendance sur React
    const updatedFormData = {
      ...formData,
      tailles: newTailles
    };
    
    // Mettre à jour tous les états simultanément
    setFormData(updatedFormData);
    setLocalTailles(newTailles);
    
    // FORCER LE RE-RENDU MULTIPLE
    setManualRender(prev => prev + 1);
    setRenderKey(prev => prev + 1);
    setForceUpdate(prev => prev + 1);
    
    // MANIPULATION DOM DIRECTE (solution de secours)
    setTimeout(() => {
      const sizesContainer = document.querySelector('[data-sizes-container]');
      if (sizesContainer) {
        const currentCount = sizesContainer.querySelector('.sizes-count');
        if (currentCount) {
          currentCount.textContent = newTailles.length;
        }
        
        // Ajouter la nouvelle taille au DOM si React ne le fait pas
        const sizesList = sizesContainer.querySelector('.sizes-list');
        if (sizesList && !sizesList.querySelector(`[data-size="${sizeName}"]`)) {
          const newSizeElement = document.createElement('div');
          newSizeElement.className = 'size-color-item';
          newSizeElement.setAttribute('data-size', sizeName);
          newSizeElement.innerHTML = `
            <span class="size-label">${sizeName}</span>
            <input type="number" placeholder="Stock" value="0" min="0" class="stock-input">
            <button type="button" class="remove-btn">×</button>
          `;
          sizesList.appendChild(newSizeElement);
          console.log('🔧 Taille ajoutée manuellement au DOM:', sizeName);
        }
      }
    }, 100);
    
    toast.success(`Taille ${sizeName} ajoutée !`);
    console.log('🏁 FIN - Solution alternative terminée');
  };

  const removeSize = (index) => {
    const newTailles = formData.tailles.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      tailles: newTailles
    }));
    
    // Synchroniser avec l'état local
    setLocalTailles(newTailles);
  };

  const handleColorChange = (index, field, value) => {
    const newCouleurs = [...formData.couleurs];
    newCouleurs[index] = {
      ...newCouleurs[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      couleurs: newCouleurs
    }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      couleurs: [...prev.couleurs, { nom: '', code: '' }]
    }));
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      couleurs: prev.couleurs.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.prix || formData.prix <= 0) newErrors.prix = 'Le prix doit être positif';
    if (!formData.categorie) newErrors.categorie = 'La catégorie est requise';
    if (!formData.marque.trim()) newErrors.marque = 'La marque est requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Préparer les données pour l'API
      const submitData = {
        ...formData,
        prix: parseFloat(formData.prix),
        prixReduit: formData.prixReduit ? parseFloat(formData.prixReduit) : null
      };

      console.log('Mise à jour du produit:', product._id, submitData);
      
      const response = await api.put(`/api/products/${product._id}`, submitData);
      
      if (response.status === 200) {
        console.log('Produit mis à jour avec succès:', response.data);
        onProductUpdated(response.data);
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      toast.error('Erreur lors de la mise à jour du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modifier le produit</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom du produit *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={errors.nom ? 'error' : ''}
                required
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="marque">Marque *</label>
              <input
                type="text"
                id="marque"
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                className={errors.marque ? 'error' : ''}
                required
              />
              {errors.marque && <span className="error-message">{errors.marque}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prix">Prix (TND) *</label>
              <input
                type="number"
                id="prix"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={errors.prix ? 'error' : ''}
                required
              />
              {errors.prix && <span className="error-message">{errors.prix}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="prixReduit">Prix réduit (TND)</label>
              <input
                type="number"
                id="prixReduit"
                name="prixReduit"
                value={formData.prixReduit}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categorie">Catégorie *</label>
              <select
                id="categorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className={errors.categorie ? 'error' : ''}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="hoodie">Hoodie</option>
                <option value="pull">Pull</option>
              </select>
              {errors.categorie && <span className="error-message">{errors.categorie}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre *</label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className={errors.genre ? 'error' : ''}
                required
              >
                <option value="">Sélectionner un genre</option>
                <option value="homme">👨 Homme</option>
                <option value="femme">👩 Femme</option>
                <option value="enfant">👶 Enfant</option>
                <option value="sport">🏃 Sport</option>
              </select>
              {errors.genre && <span className="error-message">{errors.genre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="materiau">Matière</label>
              <input
                type="text"
                id="materiau"
                name="materiau"
                value={formData.materiau}
                onChange={handleChange}
                placeholder="Ex: Coton, Polyester..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={errors.description ? 'error' : ''}
              required
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="entretien">Instructions d'entretien</label>
            <input
              type="text"
              id="entretien"
              name="entretien"
              value={formData.entretien}
              onChange={handleChange}
              placeholder="Ex: Lavage machine 30°C..."
            />
          </div>

          {/* Gestion des tailles */}
          <div 
            className="form-group" 
            key={`sizes-container-${renderKey}-${manualRender}`}
            data-sizes-container
          >
            <label>Tailles disponibles (<span className="sizes-count">{localTailles.length}</span>)</label>
            
            {/* Liste des tailles actuelles */}
            <div 
              key={`sizes-list-${renderKey}-${forceUpdate}-${manualRender}`}
              className="sizes-list"
            >
              {localTailles.map((taille, index) => (
                <div 
                  key={`taille-${index}-${taille.nom || 'new'}-${renderKey}-${forceUpdate}-${manualRender}-${Date.now()}`} 
                  className="size-color-item"
                  data-size={taille.nom}
                >
                  <span className="size-label">{taille.nom || 'Nouvelle taille'}</span>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={taille.stock || 0}
                    onChange={(e) => handleSizeChange(index, 'stock', parseInt(e.target.value) || 0)}
                    min="0"
                    className="stock-input"
                  />
                  <button type="button" onClick={() => removeSize(index)} className="remove-btn">
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Sélecteur de nouvelles tailles */}
            <div className="size-selector">
              <label>Ajouter une taille :</label>
              <select 
                id="newSizeSelect" 
                className="size-select"
                onChange={(e) => {
                  if (e.target.value) {
                    addSizeFromSelect(e.target.value);
                    e.target.value = ''; // Reset le select
                  }
                }}
              >
                <option value="">Choisir une taille...</option>
                <option value="XXS">XXS</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
                <option value="28">28</option>
                <option value="30">30</option>
                <option value="32">32</option>
                <option value="34">34</option>
                <option value="36">36</option>
                <option value="38">38</option>
                <option value="40">40</option>
                <option value="42">42</option>
                <option value="44">44</option>
                <option value="46">46</option>
                <option value="48">48</option>
                <option value="50">50</option>
                <option value="52">52</option>
              </select>
              
              {/* Bouton de débogage */}
              <button 
                type="button" 
                onClick={() => {
                  console.log('🔍 ÉTAT ACTUEL DES TAILLES:');
                  console.log('📋 formData.tailles:', JSON.stringify(formData.tailles));
                  console.log('🏠 localTailles:', JSON.stringify(localTailles));
                  console.log('🔑 renderKey:', renderKey);
                  console.log('🔄 forceUpdate:', forceUpdate);
                  toast.info('État des tailles affiché dans la console');
                }}
                className="debug-btn"
                style={{
                  marginTop: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🔍 Debug Tailles
              </button>
            </div>
          </div>

          {/* Gestion des couleurs */}
          <div className="form-group">
            <label>Couleurs disponibles</label>
            {formData.couleurs.map((couleur, index) => (
              <div key={index} className="size-color-item">
                <input
                  type="text"
                  placeholder="Nom de la couleur"
                  value={couleur.nom}
                  onChange={(e) => handleColorChange(index, 'nom', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Code couleur (ex: #000000)"
                  value={couleur.code}
                  onChange={(e) => handleColorChange(index, 'code', e.target.value)}
                />
                <button type="button" onClick={() => removeColor(index)} className="remove-btn">
                  <FaTimes />
                </button>
              </div>
            ))}
            <button type="button" onClick={addColor} className="add-btn">
              <FaPlus /> Ajouter une couleur
            </button>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Modification...' : 'Modifier le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal des détails utilisateur
const UserDetailsModal = ({ user, onClose }) => {
  const [, forceUpdate] = useState({});
  const [userStats, setUserStats] = useState({
    nombreCommandes: 0,
    totalDepense: 0,
    loading: true
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (nom, prenom) => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (user) => {
    return isUserActive(user) ? '#10b981' : '#ef4444';
  };

  const getStatusText = (user) => {
    return isUserActive(user) ? 'Actif' : 'Inactif';
  };

  const isUserActive = (user) => {
    // Si l'utilisateur n'a jamais de dernière connexion, il est inactif
    if (!user.lastLogin) {
      return false;
    }

    // Calculer la différence en minutes entre maintenant et la dernière connexion
    const now = new Date();
    const lastLogin = new Date(user.lastLogin);
    const diffInMinutes = (now - lastLogin) / (1000 * 60);

    // Considérer l'utilisateur comme actif s'il s'est connecté dans les dernières 30 minutes
    return diffInMinutes <= 30;
  };

  // Fonction pour récupérer les statistiques de l'utilisateur
  const fetchUserStats = async () => {
    try {
      setUserStats(prev => ({ ...prev, loading: true }));
      
      const response = await api.get(`/api/users/admin/${user._id}/stats`);
      
      setUserStats({
        nombreCommandes: response.data.statistiques.nombreCommandes,
        totalDepense: response.data.statistiques.totalDepense,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques utilisateur:', error);
      setUserStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Charger les statistiques au montage du composant
  useEffect(() => {
    if (user && user._id) {
      fetchUserStats();
    }
  }, [user]);

  // Mettre à jour le statut toutes les minutes pour refléter les changements en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="modal-overlay user-details-overlay">
      <div className="modal-content user-details-modal-modern">
        <div className="modal-header-modern">
          <div className="header-content">
            <div className="user-avatar-large">
              <div className="avatar-circle-large">
                {getInitials(user.nom, user.prenom)}
              </div>
              <div 
                className="status-indicator-large"
                style={{ backgroundColor: getStatusColor(user) }}
              ></div>
            </div>
            <div className="header-info">
              <h3>{user.nom} {user.prenom}</h3>
              <p className="user-email-header">{user.email}</p>
              <div className="header-badges">
                <span className={`role-badge-modern ${user.role}`}>
                  {user.role === 'admin' ? 'Administrateur' : 'Client'}
                </span>
                <span 
                  className="status-badge-modern"
                  style={{ backgroundColor: getStatusColor(user) }}
                >
                  {getStatusText(user)}
                </span>
              </div>
            </div>
          </div>
          <button 
            className="close-btn-modern"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="user-details-modern">
          <div className="details-grid">
            <div className="detail-section">
              <div className="section-header">
                <div className="section-icon">
                  <FaUser />
                </div>
                <h4>Informations personnelles</h4>
              </div>
              <div className="info-cards">
                <div className="info-card">
                  <div className="info-label">Nom complet</div>
                  <div className="info-value">{user.nom} {user.prenom}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Email</div>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Date de création</div>
                  <div className="info-value">{formatDate(user.createdAt)}</div>
                </div>
                <div className="info-card">
                  <div className="info-label">Dernière connexion</div>
                  <div className="info-value">{formatDate(user.lastLogin)}</div>
                </div>
              </div>
            </div>

            {user.adresse && (
              <div className="detail-section">
                <div className="section-header">
                  <div className="section-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <h4>Adresse</h4>
                </div>
                <div className="address-card">
                  <div className="address-line">
                    <FaHome className="address-icon" />
                    <span>{user.adresse.rue || 'N/A'}</span>
                  </div>
                  <div className="address-line">
                    <FaCity className="address-icon" />
                    <span>{user.adresse.ville || 'N/A'}</span>
                  </div>
                  <div className="address-line">
                    <FaMailBulk className="address-icon" />
                    <span>{user.adresse.codePostal || 'N/A'}</span>
                  </div>
                  <div className="address-line">
                    <FaGlobe className="address-icon" />
                    <span>{user.adresse.pays || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="detail-section">
              <div className="section-header">
                <div className="section-icon">
                  <FaChartBar />
                </div>
                <h4>Statistiques</h4>
              </div>
              <div className="stats-cards">
                <div className="stat-card-modern">
                  <div className="stat-icon">
                    <FaShoppingCart />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {userStats.loading ? (
                        <span style={{ fontSize: '0.8em', color: '#666' }}>Chargement...</span>
                      ) : (
                        userStats.nombreCommandes
                      )}
                    </div>
                    <div className="stat-label">Commandes</div>
                  </div>
                </div>
                <div className="stat-card-modern">
                  <div className="stat-icon">
                    <FaMoneyBillWave />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">
                      {userStats.loading ? (
                        <span style={{ fontSize: '0.8em', color: '#666' }}>Chargement...</span>
                      ) : (
                        `${userStats.totalDepense} TND`
                      )}
                    </div>
                    <div className="stat-label">Total dépensé</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-actions-modern">
          <button 
            className="btn-close-modern"
            onClick={onClose}
          >
            <FaTimes />
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
