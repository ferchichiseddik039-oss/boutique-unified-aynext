import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import AynextLogo from '../components/AynextLogo';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirection après connexion
  const from = location.state?.from?.pathname || '/';

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.motDePasse) {
      newErrors.motDePasse = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Note: Vérification du rôle supprimée pour simplifier
    // Les admins peuvent utiliser la page de connexion normale

    setLoading(true);
    
    try {
      const result = await login({
        email: formData.email,
        motDePasse: formData.motDePasse
      });
      
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      // L'erreur est déjà gérée dans AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      window.location.href = '/api/auth/google';
    } else if (provider === 'Facebook') {
      window.location.href = '/api/auth/facebook';
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white py-12">
      <div className="max-w-md mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4">
            CONNEXION
          </h1>
          <div className="w-24 h-1 bg-red-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connectez-vous à votre compte AYNEXT
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">
          {/* Logo AYNEXT */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <AynextLogo size="w-16 h-16 md:w-20 md:h-20" className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-black">Bienvenue chez AYNEXT</h2>
            <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
          </div>

          {/* Champs de connexion */}
          <div className="space-y-6">
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
          </div>

          {/* Options supplémentaires */}
          <div className="flex items-center justify-start mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-red-500 border-2 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Se souvenir de moi</span>
            </label>
          </div>

          {/* Bouton de connexion */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-4 text-lg font-bold rounded-lg transition-all duration-300 transform hover:scale-105 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-red-500 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? 'Connexion en cours...' : 'SE CONNECTER'}
            </button>
          </div>

          {/* Séparateur */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou connectez-vous avec</span>
              </div>
            </div>
          </div>

          {/* Boutons sociaux */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-300"
            >
              <FaGoogle className="text-red-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-300"
            >
              <FaFacebook className="text-red-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </button>
          </div>

          {/* Lien vers l'inscription */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="text-red-500 hover:text-red-600 font-semibold underline">
                Créer un compte
              </Link>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Administrateur ?{' '}
              <Link to="/admin/login" className="text-blue-500 hover:text-blue-600 font-semibold underline">
                Connexion admin
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;