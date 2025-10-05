import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/AdminSetup.css';

const AdminSetup = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    motDePasse: '',
    confirmerMotDePasse: '',
    adresse: {
      rue: '',
      ville: '',
      codePostal: '',
      pays: 'France'
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [adminExists, setAdminExists] = useState(false);

  const navigate = useNavigate();

  // Vérifier si un admin existe déjà
  useEffect(() => {
    checkAdminExists();
    document.body.classList.add('admin-setup-active');
    return () => {
      document.body.classList.remove('admin-setup-active');
    };
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      setAdminExists(data.exists);
    } catch (error) {
      console.error('Erreur lors de la vérification admin:', error);
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

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    if (!formData.motDePasse.trim()) {
      newErrors.motDePasse = 'Le mot de passe est requis';
    } else if (formData.motDePasse.length < 8) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirmerMotDePasse.trim()) {
      newErrors.confirmerMotDePasse = 'La confirmation du mot de passe est requise';
    } else if (formData.motDePasse !== formData.confirmerMotDePasse) {
      newErrors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.adresse.rue.trim()) {
      newErrors['adresse.rue'] = 'La rue est requise';
    }

    if (!formData.adresse.ville.trim()) {
      newErrors['adresse.ville'] = 'La ville est requise';
    }

    if (!formData.adresse.codePostal.trim()) {
      newErrors['adresse.codePostal'] = 'Le code postal est requis';
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
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'admin'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Compte administrateur créé avec succès !');
        navigate('/admin/login');
      } else {
        toast.error(data.message || 'Erreur lors de la création du compte admin');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (adminExists) {
    return (
      <div className="admin-setup-page">
        <div className="admin-setup-container">
          <div className="admin-setup-header">
            <div className="admin-logo">
              <FaUserShield className="admin-icon" />
              <h1>Configuration Admin</h1>
            </div>
            <p>Un compte administrateur existe déjà</p>
          </div>

          <div className="admin-exists-message">
            <FaShieldAlt className="security-icon" />
            <h3>Accès refusé</h3>
            <p>Un compte administrateur a déjà été configuré pour cette boutique.</p>
            <p>Si vous êtes l'administrateur, veuillez vous connecter via la page de connexion admin.</p>
            
            <div className="admin-setup-actions">
              <button
                onClick={() => navigate('/admin/login')}
                className="admin-setup-btn primary"
              >
                Se connecter en tant qu'admin
              </button>
              <button
                onClick={() => navigate('/')}
                className="admin-setup-btn secondary"
              >
                Retour au site
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-setup-page">
      <div className="admin-setup-container">
        <div className="admin-setup-header">
          <div className="admin-logo">
            <FaUserShield className="admin-icon" />
            <h1>Configuration Admin</h1>
          </div>
          <p>Créez votre compte administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-setup-form">
          <div className="form-section">
            <h3>Informations personnelles</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className={errors.nom ? 'error' : ''}
                  />
                </div>
                {errors.nom && <span className="error-message">{errors.nom}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    className={errors.prenom ? 'error' : ''}
                  />
                </div>
                {errors.prenom && <span className="error-message">{errors.prenom}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@votreboutique.com"
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="telephone">Téléphone *</label>
                <div className="input-wrapper">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+33 1 23 45 67 89"
                    className={errors.telephone ? 'error' : ''}
                  />
                </div>
                {errors.telephone && <span className="error-message">{errors.telephone}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Sécurité</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="motDePasse">Mot de passe *</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="motDePasse"
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    placeholder="Mot de passe sécurisé"
                    className={errors.motDePasse ? 'error' : ''}
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

              <div className="form-group">
                <label htmlFor="confirmerMotDePasse">Confirmer le mot de passe *</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmerMotDePasse"
                    name="confirmerMotDePasse"
                    value={formData.confirmerMotDePasse}
                    onChange={handleChange}
                    placeholder="Confirmez votre mot de passe"
                    className={errors.confirmerMotDePasse ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmerMotDePasse && <span className="error-message">{errors.confirmerMotDePasse}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Adresse</h3>
            
            <div className="form-group">
              <label htmlFor="adresse.rue">Rue *</label>
              <div className="input-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  id="adresse.rue"
                  name="adresse.rue"
                  value={formData.adresse.rue}
                  onChange={handleChange}
                  placeholder="123 Rue de la Mode"
                  className={errors['adresse.rue'] ? 'error' : ''}
                />
              </div>
              {errors['adresse.rue'] && <span className="error-message">{errors['adresse.rue']}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="adresse.ville">Ville *</label>
                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />
                  <input
                    type="text"
                    id="adresse.ville"
                    name="adresse.ville"
                    value={formData.adresse.ville}
                    onChange={handleChange}
                    placeholder="Paris"
                    className={errors['adresse.ville'] ? 'error' : ''}
                  />
                </div>
                {errors['adresse.ville'] && <span className="error-message">{errors['adresse.ville']}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="adresse.codePostal">Code postal *</label>
                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />
                  <input
                    type="text"
                    id="adresse.codePostal"
                    name="adresse.codePostal"
                    value={formData.adresse.codePostal}
                    onChange={handleChange}
                    placeholder="75001"
                    className={errors['adresse.codePostal'] ? 'error' : ''}
                  />
                </div>
                {errors['adresse.codePostal'] && <span className="error-message">{errors['adresse.codePostal']}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="adresse.pays">Pays</label>
              <div className="input-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <select
                  id="adresse.pays"
                  name="adresse.pays"
                  value={formData.adresse.pays}
                  onChange={handleChange}
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="admin-setup-btn primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Création du compte...
              </>
            ) : (
              <>
                <FaShieldAlt />
                Créer le compte administrateur
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSetup;
