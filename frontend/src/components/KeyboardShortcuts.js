import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaKeyboard, FaTimes } from 'react-icons/fa';

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  const shortcuts = [
    {
      keys: 'Ctrl + Shift + A',
      description: 'Accéder à l\'administration',
      available: isAuthenticated && isAdmin
    },
    {
      keys: 'Ctrl + Shift + L',
      description: 'Connexion administrateur',
      available: !isAuthenticated
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Raccourcis clavier"
      >
        <FaKeyboard className="text-lg" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Raccourcis clavier</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        
        <div className="p-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-2 px-3 rounded ${
                shortcut.available 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50 border border-gray-200 opacity-50'
              }`}
            >
              <div>
                <div className="font-mono text-sm font-semibold text-gray-700">
                  {shortcut.keys}
                </div>
                <div className="text-sm text-gray-600">
                  {shortcut.description}
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                shortcut.available 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {shortcut.available ? 'Disponible' : 'Non disponible'}
              </div>
            </div>
          ))}
          
          {!isAuthenticated && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                Connectez-vous pour accéder aux raccourcis administrateur.
              </p>
            </div>
          )}
          
          {isAuthenticated && !isAdmin && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-700">
                Vous devez être administrateur pour accéder aux raccourcis admin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
