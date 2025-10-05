import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Service Clientèle</h1>
          <p className="text-lg text-gray-600">Nous sommes là pour vous aider</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Contactez-nous</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email</h3>
                  <p className="text-gray-600">contact@aynext.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                  <FaPhone className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Téléphone</h3>
                  <p className="text-gray-600">+33 1 23 45 67 89</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Adresse</h3>
                  <p className="text-gray-600">123 Rue de la Mode<br />75001 Paris, France</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                  <FaClock className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Horaires</h3>
                  <p className="text-gray-600">Lun-Ven: 9h-18h<br />Sam: 10h-16h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Envoyez-nous un message</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Sujet de votre message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Votre message..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
