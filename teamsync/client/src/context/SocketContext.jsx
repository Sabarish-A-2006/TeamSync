import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [latestEvent, setLatestEvent] = useState(null);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to TeamSync Socket.IO server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket.IO:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('Socket connect error:', error.message);
      setIsConnected(false);
    });

    socketInstance.on('user:online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socketInstance.on('user:offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socketInstance.on('availability:updated', (data) => {
      setLatestEvent({ type: 'availability:updated', data, timestamp: Date.now() });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        latestEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
