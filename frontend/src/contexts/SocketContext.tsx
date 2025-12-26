import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext'; // Import useAuth
import { useSound } from './SoundContext'; // Import useSound

interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth(); // Get user
  const { playSound } = useSound(); // Get playSound

  useEffect(() => {
    const newSocket = io(); 
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    // Gamification Listeners
    newSocket.on('xp_earned', (data) => {
      if (data.userId === user?.id) {
        playSound('achievement');
        const achievementMsg = data.achievements.length > 0 
          ? `\n🏆 ${data.achievements.join('\n🏆 ')}`
          : '';
        showNotification(`Você ganhou +${data.totalXP} XP!${achievementMsg}`, 'success');
      }
    });

    newSocket.on('level_up', (data) => {
      if (data.userId === user?.id) {
        playSound('levelUp');
        showNotification(`PARABÉNS! Você subiu para o Nível ${data.newLevel}! 🚀`, 'info');
      }
    });

    // Existing listeners
    newSocket.on('newOrderNotification', (data) => {
      const message = `New Order: ${data.orderId} - ${data.message}`;
      console.log('Socket newOrderNotification:', message);
      showNotification(message, 'success');
    });

    newSocket.on('lowStockNotification', (data) => {
      const message = `Low Stock: Product ${data.productId}, Variation ${data.variationId} - ${data.currentStock} units (Threshold: ${data.threshold})`
      console.log('Socket lowStockNotification:', message);
      showNotification(message, 'warning');
    });

    newSocket.on('customer_birthday', (data) => {
      const message = `Aniversário: Hoje é o aniversário de ${data.name}! Deseje a ele(a) felicidades!`
      console.log('Socket customer_birthday:', message);
      showNotification(message, 'info');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [showNotification]);

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