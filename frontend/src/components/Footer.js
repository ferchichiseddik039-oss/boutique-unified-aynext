import React, { useState, useEffect } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useSettings } from '../contexts/SettingsContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  // Récupérer les informations depuis les paramètres
  const getShopInfo = () => {
    const info = settings?.informationsGenerales || {};
    const adresse = info.adresse || {};
    
    return {
      email: info.email || 'contact@aynext.com',
      telephone: info.telephone || '+216 XX XXX XXX',
      adresse: adresse.rue && adresse.ville && adresse.codePostal 
        ? `${adresse.rue}, ${adresse.codePostal} ${adresse.ville}`
        : adresse.rue && adresse.ville
        ? `${adresse.rue}, ${adresse.ville}`
        : adresse.rue || '123 Rue de la Mode, 75001 Paris'
    };
  };

  const shopInfo = getShopInfo();

  // Liens supprimés comme demandé

  const socialLinks = [
    { icon: <FaFacebook />, link: 'https://facebook.com', label: 'Facebook' },
    { icon: <FaTwitter />, link: 'https://twitter.com', label: 'Twitter' },
    { icon: <FaInstagram />, link: 'https://instagram.com', label: 'Instagram' },
    { icon: <FaLinkedin />, link: 'https://linkedin.com', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informations de la boutique */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold">AYNEXT</span>
            </div>
            <p className="text-gray-300 mb-4">
              {settings?.informationsGenerales?.description || 'Votre destination mode en ligne pour des vêtements tendance et de qualité.'}
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-blue-400" />
                <span>{shopInfo.adresse}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-blue-400" />
                <span>{shopInfo.telephone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-blue-400" />
                <span>{shopInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Suivez-nous</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-xl"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Restez informé de nos nouveautés
                </h3>
                <p className="text-gray-300 mb-4">
                  Recevez en avant-première nos nouvelles collections et offres exclusives
                </p>
                <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="btn btn-primary whitespace-nowrap">
                    S'abonner
                  </button>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-gray-300 text-sm">
                © {currentYear} AYNEXT. Tous droits réservés.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Site créé avec ❤️ pour votre style
              </p>
            </div>
          </div>
        </footer>
      );
    };

    export default Footer;
