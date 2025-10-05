import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt, FaGoogle, FaFacebook } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
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
      pays: ''
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation des champs obligatoires
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    if (!formData.motDePasse) {
      newErrors.motDePasse = 'Le mot de passe est requis';
    } else if (formData.motDePasse.length < 8) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.motDePasse)) {
      newErrors.motDePasse = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
    }

    if (!formData.confirmerMotDePasse) {
      newErrors.confirmerMotDePasse = 'La confirmation du mot de passe est requise';
    } else if (formData.motDePasse !== formData.confirmerMotDePasse) {
      newErrors.confirmerMotDePasse = 'Les mots de passe ne correspondent pas';
    }

    // Validation de l'adresse
    if (!formData.adresse.rue.trim()) {
      newErrors['adresse.rue'] = 'La rue est requise';
    }

    if (!formData.adresse.ville.trim()) {
      newErrors['adresse.ville'] = 'La ville est requise';
    }

    if (!formData.adresse.codePostal.trim()) {
      newErrors['adresse.codePostal'] = 'Le code postal est requis';
    } else if (!/^\d{3,10}$/.test(formData.adresse.codePostal.trim())) {
      newErrors['adresse.codePostal'] = 'Le code postal doit contenir uniquement des chiffres (3 à 10 chiffres)';
    }

    if (!formData.adresse.pays.trim()) {
      newErrors['adresse.pays'] = 'Le pays est requis';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Vous devez accepter les conditions d\'utilisation';
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
      const userData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.toLowerCase(),
        telephone: formData.telephone,
        motDePasse: formData.motDePasse,
        adresse: formData.adresse
      };

      await register(userData);
      toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4">
            CRÉER UN COMPTE
          </h1>
          <div className="w-24 h-1 bg-red-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rejoignez AYNEXT et profitez de nos offres exclusives
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">
          {/* Informations personnelles */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <FaUser className="text-white text-sm" />
              </div>
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base z-10" />
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      getFieldError('prenom') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                    }`}
                    placeholder="Votre prénom"
                  />
                </div>
                {getFieldError('prenom') && (
                  <span className="text-red-500 text-sm mt-1 block">{getFieldError('prenom')}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base z-10" />
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      getFieldError('nom') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                    }`}
                    placeholder="Votre nom"
                  />
                </div>
                {getFieldError('nom') && (
                  <span className="text-red-500 text-sm mt-1 block">{getFieldError('nom')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <FaEnvelope className="text-white text-sm" />
              </div>
              Informations de contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base z-10" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      getFieldError('email') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
                {getFieldError('email') && (
                  <span className="text-red-500 text-sm mt-1 block">{getFieldError('email')}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base z-10" />
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      getFieldError('telephone') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                    }`}
                    placeholder="06 12 34 56 78"
                  />
                </div>
                {getFieldError('telephone') && (
                  <span className="text-red-500 text-sm mt-1 block">{getFieldError('telephone')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <FaLock className="text-white text-sm" />
              </div>
              Sécurité
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="motDePasse" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="motDePasse"
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      getFieldError('motDePasse') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                    }`}
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-base z-10"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {getFieldError('motDePasse') && (
                  <span className="text-red-500 text-sm mt-1 block">{getFieldError('motDePasse')}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmerMotDePasse" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base z-10" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmerMotDePasse"
                    name="confirmerMotDePasse"
                    value={formData.confirmerMotDePasse}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      getFieldError('confirmerMotDePasse') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                    }`}
                    placeholder="Confirmez votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-base z-10"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {getFieldError('confirmerMotDePasse') && (
                  <span className="text-red-500 text-sm mt-1 block">{getFieldError('confirmerMotDePasse')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <FaMapMarkerAlt className="text-white text-sm" />
              </div>
              Adresse de livraison
            </h3>
            
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="adresse.rue" className="block text-sm font-semibold text-gray-700 mb-2">
                  Rue *
                </label>
                <input
                  type="text"
                  id="adresse.rue"
                  name="adresse.rue"
                  value={formData.adresse.rue}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                    getFieldError('adresse.rue') 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                  }`}
                  placeholder="123 Rue de la Paix"
                />
                {getFieldError('adresse.rue') && (
                  <span className="text-red-500 text-sm mt-1 block">{getFieldError('adresse.rue')}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="form-group">
                  <label htmlFor="adresse.ville" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    id="adresse.ville"
                    name="adresse.ville"
                    value={formData.adresse.ville}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      getFieldError('adresse.ville') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                    }`}
                    placeholder="Votre ville"
                  />
                  {getFieldError('adresse.ville') && (
                    <span className="text-red-500 text-sm mt-1 block">{getFieldError('adresse.ville')}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="adresse.codePostal" className="block text-sm font-semibold text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    id="adresse.codePostal"
                    name="adresse.codePostal"
                    value={formData.adresse.codePostal}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      getFieldError('adresse.codePostal') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                    }`}
                    placeholder="Ex: 75001, 69000, 10001"
                  />
                  {getFieldError('adresse.codePostal') && (
                    <span className="text-red-500 text-sm mt-1 block">{getFieldError('adresse.codePostal')}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="adresse.pays" className="block text-sm font-semibold text-gray-700 mb-2">
                    Pays *
                  </label>
                  <select
                    id="adresse.pays"
                    name="adresse.pays"
                    value={formData.adresse.pays}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 ${
                      getFieldError('adresse.pays') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400 focus:border-red-500'
                    }`}
                  >
                    <option value="">Sélectionnez votre pays</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Afrique du Sud">Afrique du Sud</option>
                    <option value="Albanie">Albanie</option>
                    <option value="Algérie">Algérie</option>
                    <option value="Allemagne">Allemagne</option>
                    <option value="Andorre">Andorre</option>
                    <option value="Angola">Angola</option>
                    <option value="Antigua-et-Barbuda">Antigua-et-Barbuda</option>
                    <option value="Arabie saoudite">Arabie saoudite</option>
                    <option value="Argentine">Argentine</option>
                    <option value="Arménie">Arménie</option>
                    <option value="Australie">Australie</option>
                    <option value="Autriche">Autriche</option>
                    <option value="Azerbaïdjan">Azerbaïdjan</option>
                    <option value="Bahamas">Bahamas</option>
                    <option value="Bahreïn">Bahreïn</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Barbade">Barbade</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Belize">Belize</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Bhoutan">Bhoutan</option>
                    <option value="Biélorussie">Biélorussie</option>
                    <option value="Birmanie">Birmanie</option>
                    <option value="Bolivie">Bolivie</option>
                    <option value="Bosnie-Herzégovine">Bosnie-Herzégovine</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Brésil">Brésil</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Bulgarie">Bulgarie</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Burundi">Burundi</option>
                    <option value="Cambodge">Cambodge</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Canada">Canada</option>
                    <option value="Cap-Vert">Cap-Vert</option>
                    <option value="République centrafricaine">République centrafricaine</option>
                    <option value="Chili">Chili</option>
                    <option value="Chine">Chine</option>
                    <option value="Chypre">Chypre</option>
                    <option value="Colombie">Colombie</option>
                    <option value="Comores">Comores</option>
                    <option value="République du Congo">République du Congo</option>
                    <option value="République démocratique du Congo">République démocratique du Congo</option>
                    <option value="Corée du Nord">Corée du Nord</option>
                    <option value="Corée du Sud">Corée du Sud</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Croatie">Croatie</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Danemark">Danemark</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Dominique">Dominique</option>
                    <option value="République dominicaine">République dominicaine</option>
                    <option value="Égypte">Égypte</option>
                    <option value="Émirats arabes unis">Émirats arabes unis</option>
                    <option value="Équateur">Équateur</option>
                    <option value="Érythrée">Érythrée</option>
                    <option value="Espagne">Espagne</option>
                    <option value="Estonie">Estonie</option>
                    <option value="États-Unis">États-Unis</option>
                    <option value="Éthiopie">Éthiopie</option>
                    <option value="Fidji">Fidji</option>
                    <option value="Finlande">Finlande</option>
                    <option value="France">France</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Gambie">Gambie</option>
                    <option value="Géorgie">Géorgie</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Grèce">Grèce</option>
                    <option value="Grenade">Grenade</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Guinée">Guinée</option>
                    <option value="Guinée-Bissau">Guinée-Bissau</option>
                    <option value="Guinée équatoriale">Guinée équatoriale</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Haïti">Haïti</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Hongrie">Hongrie</option>
                    <option value="Inde">Inde</option>
                    <option value="Indonésie">Indonésie</option>
                    <option value="Irak">Irak</option>
                    <option value="Iran">Iran</option>
                    <option value="Irlande">Irlande</option>
                    <option value="Islande">Islande</option>
                    <option value="Israël">Israël</option>
                    <option value="Italie">Italie</option>
                    <option value="Jamaïque">Jamaïque</option>
                    <option value="Japon">Japon</option>
                    <option value="Jordanie">Jordanie</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Kirghizistan">Kirghizistan</option>
                    <option value="Kiribati">Kiribati</option>
                    <option value="Koweït">Koweït</option>
                    <option value="Laos">Laos</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Lettonie">Lettonie</option>
                    <option value="Liban">Liban</option>
                    <option value="Liberia">Liberia</option>
                    <option value="Libye">Libye</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Lituanie">Lituanie</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Macédoine du Nord">Macédoine du Nord</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malaisie">Malaisie</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Mali">Mali</option>
                    <option value="Malte">Malte</option>
                    <option value="Maroc">Maroc</option>
                    <option value="Îles Marshall">Îles Marshall</option>
                    <option value="Maurice">Maurice</option>
                    <option value="Mauritanie">Mauritanie</option>
                    <option value="Mexique">Mexique</option>
                    <option value="Micronésie">Micronésie</option>
                    <option value="Moldavie">Moldavie</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mongolie">Mongolie</option>
                    <option value="Monténégro">Monténégro</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Namibie">Namibie</option>
                    <option value="Nauru">Nauru</option>
                    <option value="Népal">Népal</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Norvège">Norvège</option>
                    <option value="Nouvelle-Zélande">Nouvelle-Zélande</option>
                    <option value="Oman">Oman</option>
                    <option value="Ouganda">Ouganda</option>
                    <option value="Ouzbékistan">Ouzbékistan</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Palaos">Palaos</option>
                    <option value="Panama">Panama</option>
                    <option value="Papouasie-Nouvelle-Guinée">Papouasie-Nouvelle-Guinée</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Pays-Bas">Pays-Bas</option>
                    <option value="Pérou">Pérou</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Pologne">Pologne</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Roumanie">Roumanie</option>
                    <option value="Royaume-Uni">Royaume-Uni</option>
                    <option value="Russie">Russie</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Saint-Christophe-et-Niévès">Saint-Christophe-et-Niévès</option>
                    <option value="Sainte-Lucie">Sainte-Lucie</option>
                    <option value="Saint-Vincent-et-les-Grenadines">Saint-Vincent-et-les-Grenadines</option>
                    <option value="Salomon">Salomon</option>
                    <option value="Salvador">Salvador</option>
                    <option value="Samoa">Samoa</option>
                    <option value="Saint-Marin">Saint-Marin</option>
                    <option value="Sao Tomé-et-Principe">Sao Tomé-et-Principe</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Serbie">Serbie</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Singapour">Singapour</option>
                    <option value="Slovaquie">Slovaquie</option>
                    <option value="Slovénie">Slovénie</option>
                    <option value="Somalie">Somalie</option>
                    <option value="Soudan">Soudan</option>
                    <option value="Soudan du Sud">Soudan du Sud</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Suède">Suède</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Eswatini">Eswatini</option>
                    <option value="Syrie">Syrie</option>
                    <option value="Tadjikistan">Tadjikistan</option>
                    <option value="Tanzanie">Tanzanie</option>
                    <option value="Tchad">Tchad</option>
                    <option value="République tchèque">République tchèque</option>
                    <option value="Thaïlande">Thaïlande</option>
                    <option value="Timor oriental">Timor oriental</option>
                    <option value="Togo">Togo</option>
                    <option value="Tonga">Tonga</option>
                    <option value="Trinité-et-Tobago">Trinité-et-Tobago</option>
                    <option value="Tunisie">Tunisie</option>
                    <option value="Turkménistan">Turkménistan</option>
                    <option value="Turquie">Turquie</option>
                    <option value="Tuvalu">Tuvalu</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Vanuatu">Vanuatu</option>
                    <option value="Vatican">Vatican</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Viêt Nam">Viêt Nam</option>
                    <option value="Yémen">Yémen</option>
                    <option value="Zambie">Zambie</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                  </select>
                  {getFieldError('adresse.pays') && (
                    <span className="text-red-500 text-sm mt-1 block">{getFieldError('adresse.pays')}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <div className="mb-8">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-red-500 border-2 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
              />
              <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-700">
                J'accepte les{' '}
                <Link to="/terms" className="text-red-500 hover:text-red-600 underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-red-500 hover:text-red-600 underline">
                  politique de confidentialité
                </Link>{' '}
                d'AYNEXT *
              </label>
            </div>
            {getFieldError('terms') && (
              <span className="text-red-500 text-sm mt-1 block">{getFieldError('terms')}</span>
            )}
          </div>

          {/* Bouton de soumission */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto px-12 py-4 text-lg font-bold rounded-lg transition-all duration-300 transform hover:scale-105 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-red-500 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? 'Création en cours...' : 'CRÉER MON COMPTE'}
            </button>
          </div>

          {/* Lien vers la connexion */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-red-500 hover:text-red-600 font-semibold underline">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;