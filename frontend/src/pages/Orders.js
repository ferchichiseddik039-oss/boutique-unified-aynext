import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../contexts/OrdersContext';
import { FaBox, FaClock, FaCheck, FaTruck, FaTimes, FaEye, FaSearch, FaFilter, FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import '../styles/OrdersPage.css';

const Orders = () => {
  const { orders, loading, error, fetchOrders, getOrdersCount } = useOrders();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Le chargement initial est géré par OrdersContext

  // Timeout de sécurité séparé
  useEffect(() => {
    if (loading) {
      console.log('⏱️ Démarrage du timeout de sécurité');
      const timeout = setTimeout(() => {
        console.log('⚠️ Timeout de chargement détecté');
        setLoadingTimeout(true);
      }, 10000); // 10 secondes

      return () => {
        console.log('🧹 Nettoyage du timeout');
        clearTimeout(timeout);
      };
    } else {
      // Reset le timeout si le chargement se termine
      setLoadingTimeout(false);
    }
  }, [loading]);

  // Debug des données
  useEffect(() => {
    console.log('🔍 Orders - État des commandes:', {
      orders,
      loading,
      error,
      count: getOrdersCount(),
      ordersLength: orders?.length,
      ordersType: typeof orders,
      ordersIsArray: Array.isArray(orders)
    });
  }, [orders, loading, error, getOrdersCount]);


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

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  // Fonctions de filtrage et recherche
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.articles?.some(article => 
        article.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || order.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status) => {
    const statusConfig = {
      'en_attente': { 
        label: 'En attente', 
        icon: <FaClock />, 
        className: 'status-pending' 
      },
      'confirmee': { 
        label: 'Confirmée', 
        icon: <FaCheck />, 
        className: 'status-confirmed' 
      },
      'en_preparation': { 
        label: 'En préparation', 
        icon: <FaBox />, 
        className: 'status-preparing' 
      },
      'expediee': { 
        label: 'Expédiée', 
        icon: <FaTruck />, 
        className: 'status-shipped' 
      },
      'livree': { 
        label: 'Livrée', 
        icon: <FaCheck />, 
        className: 'status-delivered' 
      },
      'annulee': { 
        label: 'Annulée', 
        icon: <FaTimes />, 
        className: 'status-cancelled' 
      }
    };
    return statusConfig[status] || { 
      label: status, 
      icon: <FaClock />, 
      className: 'status-pending' 
    };
  };

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="ml-4">
              <p className="text-gray-600">Chargement de vos commandes...</p>
              <p className="text-sm text-gray-500 mt-2">Cela peut prendre quelques secondes</p>
              <button
                onClick={() => {
                  console.log('🔄 Forcer l\'arrêt du chargement');
                  setLoadingTimeout(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Arrêter le chargement
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si timeout de chargement
  if (loadingTimeout && loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Chargement lent détecté</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  Le chargement prend plus de temps que prévu. Cela peut être dû à :
                  <ul className="mt-2 list-disc list-inside">
                    <li>Problème de connexion au serveur</li>
                    <li>Token d'authentification expiré</li>
                    <li>Serveur surchargé</li>
                  </ul>
                </div>
                <div className="mt-4 space-x-3">
                  <button
                    onClick={() => {
                      setLoadingTimeout(false);
                      fetchOrders();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                  >
                    🔄 Réessayer
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/login';
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    🔑 Se reconnecter
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔍 DIAGNOSTIC COMPLET:');
                      console.log('Token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
                      console.log('User:', localStorage.getItem('user'));
                      console.log('Timestamp:', new Date().toISOString());
                      
                      // Test direct du serveur
                      fetch('/api/orders', {
                        headers: {
                          'x-auth-token': localStorage.getItem('token') || 'no-token'
                        }
                      })
                      .then(response => {
                        console.log('📊 Test serveur:', response.status, response.statusText);
                        return response.text();
                      })
                      .then(data => {
                        console.log('📄 Réponse serveur:', data.substring(0, 200));
                      })
                      .catch(error => {
                        console.log('❌ Erreur test serveur:', error.message);
                      });
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    🔍 Diagnostic
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <FaTimes className="h-5 w-5 text-red-400" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      console.log('🔄 Rechargement forcé...');
                      fetchOrders();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    🔄 Réessayer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !error && (!orders || orders.length === 0)) {
    console.log('🔍 Affichage de la page vide - orders:', orders, 'length:', orders?.length);
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande</p>
            <button
              onClick={() => {
                console.log('🔄 Rechargement manuel des commandes');
                fetchOrders();
              }}
              className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              🔄 Recharger
            </button>
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Découvrir nos produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎯 RENDU PRINCIPAL - Affichage des commandes:', {
    ordersLength: orders?.length,
    loading,
    error,
    count: getOrdersCount()
  });

  return (
    <div className="orders-page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête principal avec gradient */}
        <div className="orders-header">
          <div className="orders-header-content">
            <div className="orders-title-section">
              <h1>Mes Commandes</h1>
              <p className="orders-subtitle">
                Retrouvez l'historique de toutes vos commandes
              </p>
            </div>
            <div className="orders-stats">
              <div className="stat-card">
                <span className="stat-number">{getOrdersCount()}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{filteredOrders.length}</span>
                <span className="stat-label">Affichées</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contrôles et filtres */}
        <div className="orders-controls">
          <div className="controls-header">
            <h2 className="controls-title">Filtres et recherche</h2>
          </div>
          <div className="search-filter-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher par ID de commande ou nom d'article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="en_preparation">En préparation</option>
              <option value="expediee">Expédiée</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.statut);
            return (
              <div key={order._id} className="order-card">
                {/* En-tête de la carte */}
                <div className="order-card-header">
                  <div className="order-header-top">
                    <div className="order-info-left">
                      <span className={`order-status-badge ${statusInfo.className}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                      <span className="order-id">#{order._id?.slice(-8)}</span>
                    </div>
                    <div className="order-price-section">
                      <div className="order-total">{order.total} TND</div>
                      <div className="order-date">
                        <FaCalendarAlt className="inline mr-1" />
                        {formatDate(order.dateCommande)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="order-card-body">
                  <div className="order-details-grid">
                    {/* Articles */}
                    <div className="detail-section">
                      <h4>
                        <FaShoppingBag />
                        Articles
                      </h4>
                      <div className="articles-list">
                        {order.articles?.slice(0, 3).map((article, index) => (
                          <div key={index} className="article-item">
                            <div>
                              <div className="article-name">
                                {article.type === 'custom_hoodie' && (
                                  <span className="mr-2">🎨</span>
                                )}
                                {article.nom}
                                {article.quantite > 1 && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    (x{article.quantite})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="article-price">{article.prixTotal} TND</div>
                          </div>
                        ))}
                        {order.articles?.length > 3 && (
                          <div className="text-center text-sm text-gray-500 py-2">
                            +{order.articles.length - 3} autres articles
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Adresse de livraison */}
                    <div className="detail-section">
                      <h4>
                        <FaMapMarkerAlt />
                        Adresse de livraison
                      </h4>
                      <div className="address-details">
                        <div className="address-line">
                          <strong>{order.adresseLivraison?.nom} {order.adresseLivraison?.prenom}</strong>
                        </div>
                        <div className="address-line">{order.adresseLivraison?.rue}</div>
                        <div className="address-line">
                          {order.adresseLivraison?.codePostal} {order.adresseLivraison?.ville}
                        </div>
                        <div className="address-line">{order.adresseLivraison?.pays}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pied de la carte */}
                <div className="order-card-footer">
                  <div className="payment-info">
                    <FaCreditCard className="inline mr-2" />
                    Méthode de paiement: <span className="payment-method">{order.methodePaiement}</span>
                  </div>
                  <button 
                    className="btn-view-details"
                    onClick={() => handleViewDetails(order)}
                  >
                    <FaEye />
                    Voir détails
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message si aucune commande trouvée après filtrage */}
        {filteredOrders.length === 0 && orders.length > 0 && (
          <div className="empty-orders">
            <div className="empty-icon">🔍</div>
            <h3>Aucune commande trouvée</h3>
            <p>Aucune commande ne correspond à vos critères de recherche.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="btn-primary"
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </div>

      {/* Modal des détails de commande */}
      {showOrderDetails && selectedOrder && (
        <div className="order-details-modal">
          <div className="order-details-overlay" onClick={closeOrderDetails}></div>
          <div className="order-details-content">
            <div className="order-details-header">
              <h2>Détails de la commande #{selectedOrder._id}</h2>
              <button className="close-btn" onClick={closeOrderDetails}>
                <FaTimes />
              </button>
            </div>

            <div className="order-details-body">
              {/* Informations générales */}
              <div className="order-info-section">
                <h3>Informations générales</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Numéro de commande:</strong>
                    <span>#{selectedOrder._id}</span>
                  </div>
                  <div className="info-item">
                    <strong>Date de commande:</strong>
                    <span>{formatDate(selectedOrder.dateCommande)}</span>
                  </div>
                  <div className="info-item">
                    <strong>Statut:</strong>
                    <span className={`status-badge status-${selectedOrder.statut}`}>
                      {selectedOrder.statut}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Total:</strong>
                    <span className="total-amount">{selectedOrder.total} TND</span>
                  </div>
                </div>
              </div>

              {/* Articles */}
              <div className="order-info-section">
                <h3>Articles commandés</h3>
                <div className="articles-details">
                  {selectedOrder.articles?.map((article, index) => (
                    <div key={index} className="article-detail">
                      <div className="article-info">
                        <div className="article-name">
                          {article.type === 'custom_hoodie' && (
                            <span className="mr-2">🎨</span>
                          )}
                          {article.nom}
                        </div>
                        <div className="article-details">
                          <span>Quantité: {article.quantite}</span>
                          {article.taille && <span>Taille: {article.taille}</span>}
                          {article.couleur && <span>Couleur: {article.couleur}</span>}
                        </div>
                      </div>
                      <div className="article-price">
                        {article.prixTotal} TND
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="order-info-section">
                <h3>Adresse de livraison</h3>
                <div className="address-details-full">
                  <div className="address-line">
                    <strong>{selectedOrder.adresseLivraison?.nom} {selectedOrder.adresseLivraison?.prenom}</strong>
                  </div>
                  <div className="address-line">{selectedOrder.adresseLivraison?.rue}</div>
                  <div className="address-line">
                    {selectedOrder.adresseLivraison?.codePostal} {selectedOrder.adresseLivraison?.ville}
                  </div>
                  <div className="address-line">{selectedOrder.adresseLivraison?.pays}</div>
                </div>
              </div>

              {/* Méthode de paiement */}
              <div className="order-info-section">
                <h3>Méthode de paiement</h3>
                <div className="payment-details">
                  <span className="payment-method">{selectedOrder.methodePaiement}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="order-info-section">
                  <h3>Notes de commande</h3>
                  <div className="notes-content">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="order-details-footer">
              <button className="btn-secondary" onClick={closeOrderDetails}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
