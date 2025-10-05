import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Raccourci Ctrl+Shift+A pour accéder à l'admin
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        
        if (isAuthenticated && isAdmin) {
          // Si l'utilisateur est connecté et admin, naviguer vers /admin
          toast.success('Accès à l\'administration autorisé');
          navigate('/admin');
        } else if (isAuthenticated && !isAdmin) {
          // Si l'utilisateur est connecté mais pas admin, afficher un message
          toast.error('Accès refusé : Vous devez être administrateur pour accéder à cette section.');
        } else {
          // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion admin
          toast.info('Veuillez vous connecter en tant qu\'administrateur');
          navigate('/admin/login');
        }
      }
      
      // Raccourci Ctrl+Shift+L pour la connexion admin
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        
        if (!isAuthenticated) {
          toast.info('Accès à la connexion administrateur');
          navigate('/admin/login');
        } else if (isAuthenticated && isAdmin) {
          toast.info('Vous êtes déjà connecté en tant qu\'administrateur');
          navigate('/admin');
        } else {
          toast.info('Vous êtes déjà connecté. Déconnectez-vous d\'abord pour accéder à la connexion admin.');
        }
      }
    };

    // Ajouter l'écouteur d'événements
    document.addEventListener('keydown', handleKeyDown);

    // Nettoyer l'écouteur d'événements lors du démontage
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, isAuthenticated, isAdmin]);
};
