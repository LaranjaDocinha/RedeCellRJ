import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotification } from './NotificationContext'; // Correct path

interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { addToast } = useNotification(); // Use addToast

  useEffect(() => {
    const newSocket = io('http://localhost:5000'); // Correct URL
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    // Listeners from App.tsx are now here
    newSocket.on('newOrderNotification', (data) => {
      const message = `New Order: ${data.orderId} - ${data.message}`;
      console.log('Socket newOrderNotification:', message);
      addToast(message, 'success');
    });

    newSocket.on('lowStockNotification', (data) => {
      const message = `Low Stock: Product ${data.productId}, Variation ${data.variationId} - ${data.currentStock} units (Threshold: ${data.threshold})`
      console.log('Socket lowStockNotification:', message);
      addToast(message, 'warning');
    });

    newSocket.on('customer_birthday', (data) => {
      const message = `Aniversário: Hoje é o aniversário de ${data.name}! Deseje a ele(a) felicidades!`
      console.log('Socket customer_birthday:', message);
      addToast(message, 'info');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [addToast]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};