import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShoppingBag, FaHeart, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { formatBrand } from '../utils/formatUtils';
import '../styles/Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const { user, updateProfile, logout } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Charger les commandes
      const ordersResponse = await fetch('/api/orders', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders);
      }

      // Charger la liste de souhaits depuis l'API (vide pour le moment)
      setWishlist([]);

      // Initialiser le formulaire avec les données utilisateur
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: {
          rue: user.adresse?.rue || '',
          ville: user.adresse?.ville || '',
          codePostal: user.adresse?.codePostal || '',
          pays: user.adresse?.pays || 'Tunisie'
        }
      });

    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.telephone) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    if (!formData.adresse.rue.trim()) {
      newErrors['adresse.rue'] = 'La rue est requise';
    }

    if (!formData.adresse.ville.trim()) {
      newErrors['adresse.ville'] = 'La ville est requise';
    }

    if (!formData.adresse.codePostal) {
      newErrors['adresse.codePostal'] = 'Le code postal est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile(formData);
      toast.success('Profil mis à jour avec succès');
      setEditing(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      adresse: {
        rue: user.adresse?.rue || '',
        ville: user.adresse?.ville || '',
        codePostal: user.adresse?.codePostal || '',
        pays: user.adresse?.pays || 'France'
      }
    });
    setErrors({});
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] || '';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et suivez vos commandes</p>
        </div>

        {/* Navigation des onglets */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser />
            Informations
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingBag />
            Mes Commandes
          </button>
          <button
            className={`tab ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <FaHeart />
            Liste de souhaits
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog />
            Paramètres
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              formData={formData}
              editing={editing}
              errors={errors}
              onEdit={() => setEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
              onChange={handleChange}
              getFieldError={getFieldError}
            />
          )}
          
          {activeTab === 'orders' && (
            <OrdersTab orders={orders} />
          )}
          
          {activeTab === 'wishlist' && (
            <WishlistTab wishlist={wishlist} setWishlist={setWishlist} />
          )}
          
          {activeTab === 'settings' && (
            <SettingsTab onLogout={handleLogout} />
          )}
        </div>
      </div>
    </div>
  );
};

// Onglet Profil
const ProfileTab = ({ user, formData, editing, errors, onEdit, onSave, onCancel, onChange, getFieldError }) => {
  return (
    <div className="profile-tab">
      <div className="profile-section">
        <div className="section-header">
          <h3>Informations personnelles</h3>
          {!editing ? (
            <button onClick={onEdit} className="btn-secondary">
              <FaEdit />
              Modifier
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={onSave} className="btn-primary">
                <FaSave />
                Enregistrer
              </button>
              <button onClick={onCancel} className="btn-secondary">
                <FaTimes />
                Annuler
              </button>
            </div>
          )}
        </div>

        <div className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prenom">
                <FaUser />
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={onChange}
                disabled={!editing}
                className={getFieldError('prenom') ? 'error' : ''}
              />
              {getFieldError('prenom') && (
                <span className="error-message">{getFieldError('prenom')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="nom">
                <FaUser />
                Nom
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={onChange}
                disabled={!editing}
                className={getFieldError('nom') ? 'error' : ''}
              />
              {getFieldError('nom') && (
                <span className="error-message">{getFieldError('nom')}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                disabled={!editing}
                className={getFieldError('email') ? 'error' : ''}
              />
              {getFieldError('email') && (
                <span className="error-message">{getFieldError('email')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="telephone">
                <FaPhone />
                Téléphone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={onChange}
                disabled={!editing}
                className={getFieldError('telephone') ? 'error' : ''}
              />
              {getFieldError('telephone') && (
                <span className="error-message">{getFieldError('telephone')}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adresse.rue">
              <FaMapMarkerAlt />
              Adresse
            </label>
            <input
              type="text"
              id="adresse.rue"
              name="adresse.rue"
              value={formData.adresse.rue}
              onChange={onChange}
              disabled={!editing}
              placeholder="123 Rue de la Paix"
              className={getFieldError('adresse.rue') ? 'error' : ''}
            />
            {getFieldError('adresse.rue') && (
              <span className="error-message">{getFieldError('adresse.rue')}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="adresse.codePostal">Code postal</label>
              <input
                type="text"
                id="adresse.codePostal"
                name="adresse.codePostal"
                value={formData.adresse.codePostal}
                onChange={onChange}
                disabled={!editing}
                placeholder="75001"
                className={getFieldError('adresse.codePostal') ? 'error' : ''}
              />
              {getFieldError('adresse.codePostal') && (
                <span className="error-message">{getFieldError('adresse.codePostal')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="adresse.ville">Ville</label>
              <input
                type="text"
                id="adresse.ville"
                name="adresse.ville"
                value={formData.adresse.ville}
                onChange={onChange}
                disabled={!editing}
                placeholder="Paris"
                className={getFieldError('adresse.ville') ? 'error' : ''}
              />
              {getFieldError('adresse.ville') && (
                <span className="error-message">{getFieldError('adresse.ville')}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adresse.pays">Pays</label>
            <select
              id="adresse.pays"
              name="adresse.pays"
              value={formData.adresse.pays}
              onChange={onChange}
              disabled={!editing}
            >
              <option value="Tunisie">Tunisie</option>
              <option value="France">France</option>
              <option value="Algérie">Algérie</option>
              <option value="Maroc">Maroc</option>
              <option value="Libye">Libye</option>
              <option value="Égypte">Égypte</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Informations du compte */}
      <div className="profile-section">
        <h3>Informations du compte</h3>
        <div className="account-info">
          <div className="info-item">
            <span className="label">Membre depuis:</span>
            <span className="value">
              {new Date(user.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Rôle:</span>
            <span className={`value role-badge ${user.role}`}>
              {user.role === 'admin' ? 'Administrateur' : 'Client'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Dernière connexion:</span>
            <span className="value">
              {new Date().toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Onglet Commandes
const OrdersTab = ({ orders }) => {
  const getStatusColor = (status) => {
    const statusColors = {
      'en_attente': 'pending',
      'confirmee': 'confirmed',
      'en_preparation': 'preparing',
      'expediee': 'shipped',
      'livree': 'delivered',
      'annulee': 'cancelled'
    };
    return statusColors[status] || 'pending';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'en_preparation': 'En préparation',
      'expediee': 'Expédiée',
      'livree': 'Livrée',
      'annulee': 'Annulée'
    };
    return statusLabels[status] || status;
  };

  if (orders.length === 0) {
    return (
      <div className="orders-tab">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Aucune commande</h3>
          <p>Vous n'avez pas encore passé de commande</p>
          <Link to="/products" className="btn-primary">
            Découvrir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-tab">
      <h3>Historique des commandes</h3>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h4>Commande #{order._id.slice(-6)}</h4>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="order-status">
                <span className={`status-badge ${getStatusColor(order.statut)}`}>
                  {getStatusLabel(order.statut)}
                </span>
              </div>
            </div>

            <div className="order-items">
              {order.articles.map((item, index) => (
                <div key={index} className="order-item">
                  <img 
                    src={item.produit.images[0] || '/placeholder-product.jpg'} 
                    alt={item.produit.nom}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                  <div className="item-details">
                    <h5>{item.produit.nom}</h5>
                    <p>{formatBrand(item.produit.marque)}</p>
                    <p>Taille: {item.taille} | Couleur: {item.couleur}</p>
                    <p>Quantité: {item.quantite}</p>
                  </div>
                  <div className="item-price">
                    {item.prixUnitaire} TND
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Total:</span>
                <span className="total-amount">{order.total} TND</span>
              </div>
              <div className="order-actions">
                <Link to={`/orders/${order._id}`} className="btn-secondary">
                  Voir les détails
                </Link>
                {order.statut === 'livree' && (
                  <button className="btn-primary">
                    Laisser un avis
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Onglet Liste de souhaits
const WishlistTab = ({ wishlist, setWishlist }) => {
  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item._id !== productId));
    toast.success('Produit retiré de la liste de souhaits');
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-tab">
        <div className="empty-state">
          <div className="empty-icon">💝</div>
          <h3>Liste de souhaits vide</h3>
          <p>Ajoutez des produits à votre liste de souhaits</p>
          <Link to="/products" className="btn-primary">
            Découvrir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-tab">
      <h3>Ma liste de souhaits</h3>
      
      <div className="wishlist-grid">
        {wishlist.map(product => (
          <div key={product._id} className="wishlist-item">
            <div className="product-image">
              <img 
                src={product.image} 
                alt={product.nom}
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
              <button 
                onClick={() => removeFromWishlist(product._id)}
                className="remove-wishlist-btn"
                title="Retirer de la liste"
              >
                ×
              </button>
            </div>
            
            <div className="product-info">
              <h4>{product.nom}</h4>
              <p className="brand">{formatBrand(product.marque)}</p>
              <p className="price">{product.prix} TND</p>
            </div>

            <div className="product-actions">
              <Link to={`/product/${product._id}`} className="btn-secondary">
                Voir le produit
              </Link>
              <button className="btn-primary">
                Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Onglet Paramètres
const SettingsTab = ({ onLogout }) => {
  return (
    <div className="settings-tab">
      <h3>Paramètres du compte</h3>
      
      <div className="settings-section">
        <h4>Changer le mot de passe</h4>
        <p>Mettez à jour votre mot de passe pour sécuriser votre compte</p>
        <button className="btn-secondary">
          Modifier le mot de passe
        </button>
      </div>


      <div className="settings-section">
        <h4>Compte</h4>
        <p>Actions liées à votre compte</p>
        <div className="account-actions">
          <button className="btn-secondary">
            Exporter mes données
          </button>
          <button className="btn-secondary danger">
            Supprimer mon compte
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h4>Déconnexion</h4>
        <p>Déconnectez-vous de votre compte</p>
        <button onClick={onLogout} className="btn-primary logout-btn">
          <FaSignOutAlt />
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default Profile;
