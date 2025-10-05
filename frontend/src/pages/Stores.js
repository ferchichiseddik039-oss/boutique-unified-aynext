import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaClock, FaCar } from 'react-icons/fa';

const Stores = () => {
  const stores = [
    {
      id: 1,
      name: "AYNEXT Paris Centre",
      address: "123 Rue de Rivoli, 75001 Paris",
      phone: "+33 1 23 45 67 89",
      hours: "Lun-Sam: 10h-20h, Dim: 11h-19h",
      parking: "Parking public à 100m",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
    },
    {
      id: 2,
      name: "AYNEXT Champs-Élysées",
      address: "456 Avenue des Champs-Élysées, 75008 Paris",
      phone: "+33 1 23 45 67 90",
      hours: "Lun-Sam: 10h-21h, Dim: 11h-20h",
      parking: "Parking souterrain disponible",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
    },
    {
      id: 3,
      name: "AYNEXT Marais",
      address: "789 Rue des Archives, 75004 Paris",
      phone: "+33 1 23 45 67 91",
      hours: "Lun-Sam: 10h-19h, Dim: 12h-18h",
      parking: "Stationnement rue disponible",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Nos Magasins</h1>
          <p className="text-lg text-gray-600">Découvrez nos boutiques près de chez vous</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Ouvert
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{store.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-pink-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Adresse</p>
                      <p className="text-gray-600">{store.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaPhone className="text-pink-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Téléphone</p>
                      <p className="text-gray-600">{store.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaClock className="text-pink-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Horaires</p>
                      <p className="text-gray-600">{store.hours}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FaCar className="text-pink-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Parking</p>
                      <p className="text-gray-600">{store.parking}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors">
                    Itinéraire
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                    Appeler
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Carte */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Trouvez le magasin le plus proche</h2>
          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Carte interactive des magasins</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stores;
