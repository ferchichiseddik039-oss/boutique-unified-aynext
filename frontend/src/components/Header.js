import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrdersContext';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes, FaBox, FaShoppingBag, FaSignOutAlt } from 'react-icons/fa';
import AynextLogo from './AynextLogo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const { getOrdersCount } = useOrders();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?recherche=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <AynextLogo size="w-10 h-10" className="text-blue-600" />
            <span className="text-xl font-bold text-gray-800">AYNEXT</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              Accueil
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
              Produits
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                Admin
                <span className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded text-xs">
                  Ctrl+Shift+A
                </span>
              </Link>
            )}
          </nav>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-gray-600"
              >
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Commandes */}
            {isAuthenticated && (
              <Link to="/orders" className="relative text-gray-600 hover:text-blue-600 transition-colors" title="Mes commandes">
                <FaBox className="text-xl" />
                {getOrdersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getOrdersCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Panier */}
            <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 transition-colors" title="Mon panier">
              <FaShoppingCart className="text-xl" />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* Menu utilisateur */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <span className="hidden sm:block font-medium">{user?.prenom}</span>
                </button>

                {/* Menu déroulant */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50 animate-in slide-in-from-top-2 duration-200 -translate-x-8 sm:translate-x-0">
                    {/* En-tête du menu */}
                    <div className="px-8 py-4 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{user?.prenom} {user?.nom}</p>
                      <p className="text-xs text-gray-500 break-words" title={user?.email}>{user?.email}</p>
                    </div>
                    
                    {/* Options du menu */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-8 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaUser className="w-5 h-5 mr-4 text-blue-500 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                        <span className="font-medium text-sm">Mon Profil</span>
                      </Link>
                      
                      <Link
                        to="/orders"
                        className="flex items-center px-8 py-4 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaShoppingBag className="w-5 h-5 mr-4 text-green-500 group-hover:text-green-600 transition-colors flex-shrink-0" />
                        <span className="font-medium text-sm">Mes Commandes</span>
                      </Link>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-8 py-4 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                      >
                        <FaSignOutAlt className="w-5 h-5 mr-4 text-red-500 group-hover:text-red-600 transition-colors flex-shrink-0" />
                        <span className="font-medium text-sm">Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Bouton menu mobile */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/products"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Produits
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-between"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Admin</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                    Ctrl+Shift+A
                  </span>
                </Link>
              )}
            </nav>

            {/* Barre de recherche mobile */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-gray-600"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
