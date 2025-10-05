import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCreditCard, FaShoppingBag, FaUser, FaSearch, FaAward, FaEnvelope, FaMapMarkerAlt, FaEye, FaTag, FaStore, FaPalette } from 'react-icons/fa';
import AynextLogo from '../components/AynextLogo';
import HoodieCustomizer from '../components/HoodieCustomizer';

const Home = () => {
  const [showHoodieDesigner, setShowHoodieDesigner] = useState(false);

  const features = [
    {
      icon: <FaEye className="text-4xl" />,
      title: "VÊTEMENTS DE CONTACT",
      description: "Approvisionnement exclusif auprès des fournisseurs officiels"
    },
    {
      icon: <FaCreditCard className="text-4xl" />,
      title: "PAIEMENT SÉCURISÉ à partir de 0 TND",
      description: "Paiement sécurisé & Garanties"
    },
    {
      icon: <FaStore className="text-4xl" />,
      title: "Entreprise Familiale depuis 2025",
      description: "Boutique de mode depuis 2025"
    },
    {
      icon: <FaTag className="text-4xl" />,
      title: "VÊTEMENTS et ACCESSOIRES",
      description: "Qualité premium garantie"
    },
  ];

  return (
    <div className="bg-white">
      {/* Modern Header */}
      <section className="bg-black py-16 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <AynextLogo size="w-20 h-20 md:w-24 md:h-24" className="text-white mr-4" />
                <h1 className="text-6xl md:text-8xl font-black text-white animate-bounce" style={{
                  textShadow: '0 0 30px rgba(239,68,68,0.6), 0 0 60px rgba(239,68,68,0.4), 0 0 90px rgba(239,68,68,0.2), 4px 4px 8px rgba(0,0,0,0.8)',
                  transform: 'perspective(500px) rotateX(10deg)',
                  transformStyle: 'preserve-3d'
                }}>
                  AYNEXT
                </h1>
              </div>
              <div className="w-32 h-1 bg-red-500 mx-auto mb-4"></div>
              <p className="text-2xl md:text-3xl text-gray-300 font-light tracking-wider">
                BOUTIQUE DIGITAL
              </p>
            </div>
          </div>
        </div>
        {/* Modern background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-8 left-20 w-2 h-2 bg-red-500 rounded-full opacity-80 animate-ping"></div>
          <div className="absolute top-16 right-32 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-12 left-1/4 w-1.5 h-1.5 bg-red-400 rounded-full opacity-70 animate-bounce"></div>
          <div className="absolute top-24 right-1/3 w-1 h-1 bg-gray-400 rounded-full opacity-50 animate-ping"></div>
        </div>
      </section>

      {/* Modern Hero Section */}
      <section className="relative bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-6xl md:text-7xl font-black text-black mb-8 leading-tight">
                VÊTEMENTS DE MODE POUR TOUS
              </h1>
              <div className="w-24 h-1 bg-red-500 mb-6"></div>
              <p className="text-2xl text-gray-700 mb-10 font-light">
                + de 15000 références
              </p>
              
              {/* Modern Category Buttons */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <Link
                  to="/genre/femme"
                  className="bg-black text-white px-8 py-6 font-bold text-center hover:bg-red-500 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-black hover:border-red-500"
                >
                  👩 FEMME
                </Link>
                <Link
                  to="/genre/homme"
                  className="bg-red-500 text-white px-8 py-6 font-bold text-center hover:bg-black transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-red-500 hover:border-black"
                >
                  👨 HOMME
                </Link>
                <Link
                  to="/genre/enfant"
                  className="bg-white text-black px-8 py-6 font-bold text-center hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-black hover:border-red-500"
                >
                  👶 ENFANT
                </Link>
                <Link
                  to="/genre/sport"
                  className="bg-black text-white px-8 py-6 font-bold text-center hover:bg-red-500 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-black hover:border-red-500"
                >
                  🏃 SPORT
                </Link>
              </div>
              
              {/* Test Button for Hoodie Designer */}
              <div className="mb-8">
                <button
                  onClick={() => setShowHoodieDesigner(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-6 font-bold text-center hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-purple-500 hover:border-pink-500 w-full"
                >
                  <FaPalette className="inline mr-2" />
                  CAPUCHE PERSONNALISER
                </button>
              </div>
            </div>
            
            {/* Right Content - Modern Model Image */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src="/model.jpg"
                  alt="Modèle avec vêtements"
                  className="w-full max-w-lg h-auto shadow-2xl"
                />
                {/* Modern tag effect */}
                <div className="absolute top-8 right-8 w-20 h-20 bg-red-500 flex items-center justify-center shadow-lg">
                  <FaTag className="text-white text-2xl" />
                </div>
                {/* Modern accent lines */}
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                <div className="absolute bottom-0 right-0 w-2 h-full bg-black"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modern decorative elements */}
        <div className="absolute top-20 left-20 w-40 h-40 border-2 border-red-500 opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-black opacity-10"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 border border-gray-300 opacity-30"></div>
      </section>

      {/* Modern Boutique Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-8 text-black">
              VOTRE BOUTIQUE EN LIGNE
            </h2>
            <div className="w-32 h-1 bg-red-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-light">
              Vêtements de mode. Accessoires & Chaussures
            </p>
          </div>
          
          {/* Modern Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              to="/products"
              className="relative overflow-hidden shadow-2xl group border-4 border-black hover:border-red-500 transition-all duration-300 block"
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                alt="Collection mode"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-red-500/40 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-3xl font-black mb-2">COLLECTION MODE</h3>
                <p className="text-gray-200">Découvrez nos dernières tendances</p>
              </div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-red-500 flex items-center justify-center shadow-lg">
                <FaTag className="text-white text-xl" />
              </div>
            </Link>
            <Link
              to="/genre/sport"
              className="relative overflow-hidden shadow-2xl group border-4 border-black hover:border-red-500 transition-all duration-300 block"
            >
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"
                alt="Collection sport"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-red-500/40 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-3xl font-black mb-2">COLLECTION SPORT</h3>
                <p className="text-gray-200">Performance • Style • Innovation</p>
              </div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-red-500 flex items-center justify-center shadow-lg">
                <FaTag className="text-white text-xl" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 bg-white hover:bg-red-500 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 border-2 border-black hover:border-red-500">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white mb-6 shadow-md hover:bg-red-500 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-4 text-black hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 hover:text-white leading-relaxed transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Hoodie Designer Modal */}
      {showHoodieDesigner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowHoodieDesigner(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <HoodieCustomizer />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
