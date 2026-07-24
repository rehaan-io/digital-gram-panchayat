import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth, API_BASE_URL } from './AuthContext';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      return;
    }

    // Map REST URL (e.g. http://192.168.1.100:5000/api) to root socket.io path (http://192.168.1.100:5000)
    const socketUrl = API_BASE_URL.replace(/\/api$/, '');
    
    console.log('🔌 Connecting to Socket.IO at:', socketUrl);

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket'], // React Native requires websocket transport
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('🟢 Socket.IO: Connected successfully.');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.IO: Disconnected.');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('❌ Socket.IO connection error:', error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
