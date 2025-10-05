import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import AynextLogo from '../components/AynextLogo';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { setAuthToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('🔄 OAuthSuccess - Traitement du callback:', { token: !!token, error });

    if (error) {
      console.error('❌ Erreur OAuth:', error);
      toast.error('Erreur lors de la connexion. Veuillez réessayer.');
      navigate('/login');
      return;
    }

    if (token) {
      console.log('✅ Token reçu, traitement de la connexion...');
      
      try {
        // Sauvegarder le token
        localStorage.setItem('token', token);
        setAuthToken(token);
        
        console.log('✅ Token sauvegardé et utilisateur chargé');
        toast.success('Connexion réussie !');
        
        // Rediriger vers la page d'accueil après un court délai
        setTimeout(() => {
          console.log('🔄 Redirection vers la page d\'accueil...');
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('❌ Erreur lors du traitement du token:', error);
        toast.error('Erreur lors de la connexion. Veuillez réessayer.');
        navigate('/login');
      }
    } else {
      console.error('❌ Token manquant dans l\'URL');
      toast.error('Token manquant. Veuillez réessayer.');
      navigate('/login');
    }
  }, [searchParams, navigate, setAuthToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <AynextLogo size="w-20 h-20 md:w-24 md:h-24" className="text-red-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Connexion en cours...
        </h1>
        <p className="text-gray-600 mb-8">
          Veuillez patienter pendant que nous finalisons votre connexion.
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default OAuthSuccess;
