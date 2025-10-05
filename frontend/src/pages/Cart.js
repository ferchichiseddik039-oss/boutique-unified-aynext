import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaLock, FaTruck, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrdersContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatBrand } from '../utils/formatUtils';
import '../styles/Cart.css';

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotal, 
    getItemCount 
  } = useCart();
  
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const { getActivePaymentMethods, calculateDeliveryFees, getDeliveryInfo, getCurrency } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Effet pour forcer la mise à jour quand le panier change
  useEffect(() => {
    console.log('🔄 Panier mis à jour:', cart);
    console.log('🔄 Nombre d\'articles:', cart.articles?.length || 0);
  }, [cart]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      // Cart is already loaded by the context, no need to fetch
    } catch (error) {
      toast.error('Erreur lors du chargement du panier');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      await updateQuantity(productId, newQuantity);
      // Le panier est automatiquement mis à jour par le contexte
      toast.success('Quantité mise à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la quantité');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    console.log('🗑️ Suppression du produit:', productId);
    console.log('Panier avant suppression:', cart);
    
    try {
      setUpdating(true);
      const result = await removeFromCart(productId);
      console.log('Résultat de la suppression:', result);
      
      if (result.success) {
        toast.success('Produit retiré du panier');
        // Forcer le re-render
        setForceUpdate(prev => prev + 1);
        console.log('🔄 Force update déclenché');
      } else {
        toast.error('Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      try {
        setUpdating(true);
        await clearCart();
        toast.success('Panier vidé');
      } catch (error) {
        toast.error('Erreur lors du vidage du panier');
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour continuer');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setShowCheckout(true);
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du panier...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h1>Mon Panier</h1>
          </div>
          <div className="login-required">
            <h2>Connexion requise</h2>
            <p>Veuillez vous connecter pour accéder à votre panier</p>
            <div className="auth-buttons">
              <Link to="/login" className="btn-primary">
                Se connecter
              </Link>
              <Link to="/register" className="btn-secondary">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.articles && cart.articles.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h1>Mon Panier</h1>
          </div>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Votre panier est vide</h2>
            <p>Découvrez nos produits et commencez vos achats</p>
            <button onClick={handleContinueShopping} className="btn-primary">
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = calculateDeliveryFees(subtotal);
  const total = subtotal + shipping;
  const itemCount = getItemCount();
  const deliveryInfo = getDeliveryInfo();
  const currency = getCurrency();

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Mon Panier</h1>
          <p>{itemCount} article(s) dans votre panier</p>
        </div>

        <div className="cart-content">
          {/* Liste des produits */}
          <div className="cart-items">
            <div className="cart-items-header">
              <h3>Produits</h3>
              <button 
                onClick={handleClearCart}
                className="clear-cart-btn"
                disabled={updating}
              >
                <FaTrash />
                Vider le panier
              </button>
            </div>

            {cart.articles && cart.articles.map((item) => (
              <CartItem
                key={`${item._id}-${forceUpdate}`}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                updating={updating}
              />
            ))}
          </div>

          {/* Résumé et commande */}
          <div className="cart-summary">
            <div className="summary-card">
              <h3>Résumé de la commande</h3>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Sous-total ({itemCount} article(s))</span>
                  <span>{subtotal.toFixed(2)} {currency}</span>
                </div>
                
                <div className="summary-row">
                  <span>Frais de livraison</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="free-shipping">Gratuit</span>
                    ) : (
                      `${shipping.toFixed(2)} ${currency}`
                    )}
                  </span>
                </div>
                
                {shipping > 0 && deliveryInfo.livraisonGratuite && (
                  <div className="shipping-info">
                    <small>
                      Livraison gratuite à partir de {deliveryInfo.seuil} {currency} d'achat
                    </small>
                  </div>
                )}
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{total.toFixed(2)} {currency}</span>
                </div>
              </div>

              <div className="summary-actions">
                <button
                  onClick={handleCheckout}
                  className="checkout-btn"
                  disabled={updating}
                >
                  <FaLock />
                  Passer la commande
                </button>
                
                <button
                  onClick={handleContinueShopping}
                  className="continue-shopping-btn"
                >
                  <FaArrowLeft />
                  Continuer mes achats
                </button>
              </div>

              <div className="security-info">
                <div className="security-item">
                  <FaShieldAlt />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="security-item">
                  <FaTruck />
                  <span>Livraison rapide</span>
                </div>
                <div className="security-item">
                  <FaCreditCard />
                  <span>Retours gratuits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section de passage de commande */}
        {showCheckout && (
          <CheckoutSection
            cart={cart}
            total={total}
            shipping={shipping}
            onClose={() => setShowCheckout(false)}
            onSuccess={(newOrder) => {
              setShowCheckout(false);
              addOrder(newOrder); // Ajouter la nouvelle commande au contexte
              navigate('/orders');
            }}
            getActivePaymentMethods={getActivePaymentMethods}
          />
        )}
      </div>
    </div>
  );
};

// Composant article du panier
const CartItem = ({ item, onQuantityChange, onRemove, updating }) => {
  const [quantity, setQuantity] = useState(item.quantite);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
      onQuantityChange(item.produit._id, newQuantity);
    }
  };

  const handleRemove = () => {
    console.log('🔍 CartItem - item:', item);
    console.log('🔍 CartItem - item.produit:', item.produit);
    console.log('🔍 CartItem - item.produit._id:', item.produit._id);
    onRemove(item.produit._id);
  };

  const price = item.prixUnitaire;
  const totalPrice = price * item.quantite;

  return (
    <div className="cart-item">
      <div className="item-image">
        <img 
          src={item.produit.images?.[0]?.url || item.produit.images?.[0] || '/placeholder-product.jpg'} 
          alt={item.produit.images?.[0]?.alt || item.produit.nom}
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>

      <div className="item-details">
        <div className="item-info">
          <h4 className="item-name">
            <Link to={`/product/${item.produit._id}`}>
              {item.produit.nom}
            </Link>
          </h4>
          <p className="item-brand">{formatBrand(item.produit.marque)}</p>
          <div className="item-options">
            <span className="option">Taille: {item.taille}</span>
            <span className="option">Couleur: {item.couleur}</span>
          </div>
        </div>

        <div className="item-price">
          <span className="unit-price">{price.toFixed(2)} TND</span>
          <span className="total-price">{totalPrice.toFixed(2)} TND</span>
        </div>

        <div className="item-quantity">
          <div className="quantity-controls">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || updating}
              className="quantity-btn"
            >
              -
            </button>
            <span className="quantity-display">{item.quantite}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 10 || updating}
              className="quantity-btn"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleRemove}
          disabled={updating}
          className="remove-item-btn"
          title="Retirer du panier"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

// Composant de passage de commande
const CheckoutSection = ({ cart, total, shipping, onClose, onSuccess, getActivePaymentMethods }) => {
  const [formData, setFormData] = useState({
    adresseLivraison: {
      nom: '',
      prenom: '',
      rue: '',
      ville: '',
      codePostal: '',
      pays: 'Tunisie',
      telephone: ''
    },
    methodePaiement: 'carte',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialiser la méthode de paiement avec la première méthode active
  useEffect(() => {
    const activeMethods = getActivePaymentMethods();
    if (activeMethods.length > 0 && formData.methodePaiement === 'carte') {
      setFormData(prev => ({
        ...prev,
        methodePaiement: activeMethods[0].value
      }));
    }
  }, []);

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

    // Validation du nom
    if (!formData.adresseLivraison.nom.trim()) {
      newErrors['adresseLivraison.nom'] = 'Le nom est requis';
    }

    // Validation du prénom
    if (!formData.adresseLivraison.prenom.trim()) {
      newErrors['adresseLivraison.prenom'] = 'Le prénom est requis';
    }

    // Validation de la rue
    if (!formData.adresseLivraison.rue.trim()) {
      newErrors['adresseLivraison.rue'] = 'La rue est requise';
    }

    // Validation de la ville
    if (!formData.adresseLivraison.ville.trim()) {
      newErrors['adresseLivraison.ville'] = 'La ville est requise';
    }

    // Validation du code postal
    if (!formData.adresseLivraison.codePostal) {
      newErrors['adresseLivraison.codePostal'] = 'Le code postal est requis';
    } else if (!/^\d{5}$/.test(formData.adresseLivraison.codePostal)) {
      newErrors['adresseLivraison.codePostal'] = 'Le code postal doit contenir 5 chiffres';
    }

    // Validation du téléphone
    if (!formData.adresseLivraison.telephone.trim()) {
      newErrors['adresseLivraison.telephone'] = 'Le téléphone est requis';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.adresseLivraison.telephone)) {
      newErrors['adresseLivraison.telephone'] = 'Le téléphone doit contenir au moins 10 caractères';
    }

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
      const orderData = {
        adresseLivraison: formData.adresseLivraison,
        methodePaiement: formData.methodePaiement,
        notes: formData.notes
      };

      console.log('📤 Envoi des données de commande:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(orderData)
      });

      console.log('📥 Réponse du serveur:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur du serveur:', errorData);
        
        // Afficher les erreurs de validation détaillées
        if (errorData.errors && errorData.errors.length > 0) {
          console.error('📋 Erreurs de validation détaillées:');
          errorData.errors.forEach((error, index) => {
            console.error(`${index + 1}. ${error.msg} (${error.param})`);
          });
          
          // Afficher la première erreur à l'utilisateur
          const firstError = errorData.errors[0];
          throw new Error(`${firstError.param}: ${firstError.msg}`);
        }
        
        throw new Error(errorData.message || 'Erreur lors de la création de la commande');
      }

      const result = await response.json();
      console.log('✅ Commande créée avec succès:', result);
      
      toast.success('Commande passée avec succès !');
      onSuccess(result.commande || result.order || result); // Passer la commande créée
    } catch (error) {
      console.error('❌ Erreur lors de la création de commande:', error);
      toast.error(error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] || '';
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <div className="checkout-header">
          <h2>Finaliser la commande</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-sections">
            {/* Adresse de livraison */}
            <div className="checkout-section">
              <h3>Adresse de livraison</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="adresse.nom">Nom *</label>
                  <input
                    type="text"
                    id="adresse.nom"
                    name="adresseLivraison.nom"
                    value={formData.adresseLivraison.nom}
                    onChange={handleChange}
                    placeholder="Ben Ali"
                    className={getFieldError('adresseLivraison.nom') ? 'error' : ''}
                  />
                  {getFieldError('adresseLivraison.nom') && (
                    <span className="error-message">{getFieldError('adresseLivraison.nom')}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="adresse.prenom">Prénom *</label>
                  <input
                    type="text"
                    id="adresse.prenom"
                    name="adresseLivraison.prenom"
                    value={formData.adresseLivraison.prenom}
                    onChange={handleChange}
                    placeholder="Ahmed"
                    className={getFieldError('adresseLivraison.prenom') ? 'error' : ''}
                  />
                  {getFieldError('adresseLivraison.prenom') && (
                    <span className="error-message">{getFieldError('adresseLivraison.prenom')}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="adresse.telephone">Téléphone *</label>
                <input
                  type="tel"
                  id="adresse.telephone"
                  name="adresseLivraison.telephone"
                  value={formData.adresseLivraison.telephone}
                  onChange={handleChange}
                  placeholder="+216 20 123 456"
                  className={getFieldError('adresseLivraison.telephone') ? 'error' : ''}
                />
                {getFieldError('adresseLivraison.telephone') && (
                  <span className="error-message">{getFieldError('adresseLivraison.telephone')}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="adresse.rue">Rue *</label>
                <input
                  type="text"
                  id="adresse.rue"
                  name="adresseLivraison.rue"
                  value={formData.adresseLivraison.rue}
                  onChange={handleChange}
                  placeholder="Avenue Habib Bourguiba, 1000"
                  className={getFieldError('adresseLivraison.rue') ? 'error' : ''}
                />
                {getFieldError('adresseLivraison.rue') && (
                  <span className="error-message">{getFieldError('adresseLivraison.rue')}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="adresse.codePostal">Code postal *</label>
                  <input
                    type="text"
                    id="adresse.codePostal"
                    name="adresseLivraison.codePostal"
                    value={formData.adresseLivraison.codePostal}
                    onChange={handleChange}
                    placeholder="1000"
                    className={getFieldError('adresseLivraison.codePostal') ? 'error' : ''}
                  />
                  {getFieldError('adresseLivraison.codePostal') && (
                    <span className="error-message">{getFieldError('adresseLivraison.codePostal')}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="adresse.ville">Ville *</label>
                  <input
                    type="text"
                    id="adresse.ville"
                    name="adresseLivraison.ville"
                    value={formData.adresseLivraison.ville}
                    onChange={handleChange}
                    placeholder="Tunis"
                    className={getFieldError('adresseLivraison.ville') ? 'error' : ''}
                  />
                  {getFieldError('adresseLivraison.ville') && (
                    <span className="error-message">{getFieldError('adresseLivraison.ville')}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="adresse.pays">Pays</label>
                <select
                  id="adresse.pays"
                  name="adresseLivraison.pays"
                  value={formData.adresseLivraison.pays}
                  onChange={handleChange}
                >
                  <option value="Tunisie">Tunisie</option>
                  <option value="France">France</option>
                  <option value="Algérie">Algérie</option>
                  <option value="Maroc">Maroc</option>
                  <option value="Libye">Libye</option>
                  <option value="Égypte">Égypte</option>
                  <option value="Italie">Italie</option>
                  <option value="Espagne">Espagne</option>
                  <option value="Allemagne">Allemagne</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>

            {/* Méthode de paiement */}
            <div className="checkout-section">
              <h3>Méthode de paiement</h3>
              
              <div className="payment-methods">
                {getActivePaymentMethods().map((method) => (
                  <label key={method.value} className="payment-method">
                    <input
                      type="radio"
                      name="methodePaiement"
                      value={method.value}
                      checked={formData.methodePaiement === method.value}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    <div className="method-info">
                      <span className="method-name">{method.label}</span>
                      <span className="method-description">{method.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="checkout-section">
              <h3>Notes de commande (optionnel)</h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Instructions spéciales, préférences de livraison..."
                rows="3"
              />
            </div>
          </div>

          {/* Résumé final */}
          <div className="checkout-summary">
            <h3>Résumé de la commande</h3>
            <div className="summary-row">
              <span>Sous-total</span>
              <span>{(total - shipping).toFixed(2)} TND</span>
            </div>
            <div className="summary-row">
              <span>Livraison</span>
              <span>{shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} TND`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{total.toFixed(2)} TND</span>
            </div>
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cart;
