import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Créer la connexion Socket.IO
    // Désactiver Socket.IO sur Vercel (WebSockets non supportés)
    // const newSocket = io('http://localhost:5001', {
    //   transports: ['websocket', 'polling']
    // });
    const newSocket = null; // Désactivé pour Vercel

    // Désactiver les événements Socket.IO pour Vercel
    if (newSocket) {
      newSocket.on('connect', () => {
        console.log('Connecté au serveur WebSocket');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Déconnecté du serveur WebSocket');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Erreur de connexion WebSocket:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup
      return () => {
        newSocket.close();
      };
    } else {
      // Simulation pour Vercel
      setIsConnected(false);
      setSocket(null);
    }
  }, []);

  const joinAdminRoom = () => {
    if (socket && isConnected) {
      socket.emit('join-admin');
      console.log('Rejoint la room admin');
    }
  };

  const leaveAdminRoom = () => {
    if (socket && isConnected) {
      socket.emit('leave-admin');
      console.log('Quitté la room admin');
    }
  };

  const value = {
    socket,
    isConnected,
    joinAdminRoom,
    leaveAdminRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
