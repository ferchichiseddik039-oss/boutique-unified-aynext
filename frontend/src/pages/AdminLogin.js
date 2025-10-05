import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaShieldAlt, FaUserShield, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/axios';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [adminExists, setAdminExists] = useState(true);

  const { loginAdmin, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Gérer le scroll du body et vérifier l'existence d'un admin
  useEffect(() => {
    document.body.classList.add('admin-login-active');
    checkAdminExists();
    return () => {
      document.body.classList.remove('admin-login-active');
    };
  }, []);

  // Gérer la redirection après connexion admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        toast.success('Connexion administrateur réussie !');
        navigate('/admin');
      } else {
        toast.error('Accès refusé : Vous devez être administrateur');
        // Déconnecter l'utilisateur non-admin
        localStorage.removeItem('token');
        window.location.reload();
      }
    }
  }, [isAuthenticated, user, navigate]);

  const checkAdminExists = async () => {
    try {
      const response = await api.get('/admin/check');
      setAdminExists(response.data.success);
    } catch (error) {
      console.error('Erreur lors de la vérification admin:', error);
      setAdminExists(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.motDePasse.trim()) {
      newErrors.motDePasse = 'Le mot de passe est requis';
    } else if (formData.motDePasse.length < 6) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
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
      const result = await loginAdmin(formData);
      
      if (result.success) {
        // La redirection sera gérée par useEffect qui surveille les changements d'utilisateur
        // Pas besoin de toast ici, il sera géré par useEffect
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion admin');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSite = () => {
    navigate('/');
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-logo">
            <FaUserShield className="admin-icon" />
            <h1>Administration</h1>
          </div>
          <p>Accès réservé aux administrateurs</p>
          <div className="admin-warning">
            <p><strong>Administrateurs :</strong> Utilisez cette page pour vous connecter</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email administrateur</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@boutique.com"
                className={errors.email ? 'error' : ''}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="motDePasse">Mot de passe</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="motDePasse"
                name="motDePasse"
                value={formData.motDePasse}
                onChange={handleChange}
                placeholder="Votre mot de passe administrateur"
                className={errors.motDePasse ? 'error' : ''}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.motDePasse && <span className="error-message">{errors.motDePasse}</span>}
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Connexion...
              </>
            ) : (
              <>
                <FaShieldAlt />
                Se connecter en tant qu'admin
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <div className="admin-login-actions">
            <button
              type="button"
              className="back-to-site-btn"
              onClick={handleBackToSite}
            >
              ← Retour au site
            </button>
            
            <button
              type="button"
              className="admin-setup-btn"
              onClick={() => navigate('/admin/setup')}
            >
              <FaCog />
              Configuration Admin
            </button>
          </div>
          
          <div className="security-notice">
            <FaShieldAlt className="security-icon" />
            <span>Connexion sécurisée et chiffrée</span>
          </div>
        </div>
      </div>

      <div className="admin-login-illustration">
        <div className="illustration-content">
          <div className="admin-badge">
            <FaUserShield className="badge-icon" />
            <span>ADMIN</span>
          </div>
          
          <h2>Panneau d'Administration</h2>
          <p>Gérez votre boutique en toute sécurité avec notre interface d'administration complète.</p>
          
          <div className="admin-features">
            <div className="feature">
              <div className="feature-icon">📊</div>
              <span>Tableau de bord</span>
            </div>
            <div className="feature">
              <div className="feature-icon">👥</div>
              <span>Gestion utilisateurs</span>
            </div>
            <div className="feature">
              <div className="feature-icon">📦</div>
              <span>Gestion produits</span>
            </div>
            <div className="feature">
              <div className="feature-icon">📋</div>
              <span>Commandes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
