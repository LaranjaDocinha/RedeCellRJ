import React, { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useNotification, AppNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';
import confetti from 'canvas-confetti';

export const SocketEventHandler: React.FC = () => {
  const socket = useSocket().socket;
  const { showNotification, addNotification } = useNotification() as any; // Using any for local fix of addNotification vs showNotification mismatch
  const { user } = useAuth();
  const { playSound } = useSound();

  useEffect(() => {
    if (!socket || !user) return;

    const eventName = `notification:${user.id}`;

    const handleGenericNotification = (newNotif: any) => {
        const mapped: any = {
            ...newNotif,
            severity: newNotif.type === 'error' ? 'error' : newNotif.type === 'warning' ? 'warning' : newNotif.type === 'success' ? 'success' : 'info'
        };
        
        // This would ideally update the notifications list in context, but for now we show the toast
        addNotification(mapped.title || mapped.message, mapped.severity);

        if (mapped.severity === 'success' || mapped.type === 'sale') {
            const isEpic = mapped.metadata?.total > 1000;
            
            if (isEpic) {
                const duration = 3 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

                const interval: any = setInterval(() => {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) return clearInterval(interval);
                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
                }, 250);
            } else {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        }
    };

    // Gamification Listeners
    const handleXpEarned = (data: any) => {
      if (data.userId === user?.id) {
        playSound('success');
        const achievementMsg = data.achievements && data.achievements.length > 0 
          ? `\n🏆 ${data.achievements.join('\n🏆 ')}`
          : '';
        addNotification(`Você ganhou +${data.totalXP} XP!${achievementMsg}`, 'success');
      }
    };

    const handleLevelUp = (data: any) => {
      if (data.userId === user?.id) {
        playSound('success');
        addNotification(`PARABÉNS! Você subiu para o Nível ${data.newLevel}! 🚀`, 'info');
      }
    };

    const handleStatusUpdate = (data: any) => {
      playSound('hover');
      addNotification(`OS #${data.orderId} movida para ${data.newStatus}`, 'info');
    };

    const handleNewLead = (data: any) => {
      playSound('success');
      addNotification(`Novo Lead: ${data.name} via ${data.source}`, 'success');
    };

    const handleLowStock = (data: any) => {
      playSound('error');
      addNotification(`ESTOQUE CRÍTICO: ${data.productName} (${data.currentStock} un.)`, 'error');
    };

    const handleNewOrder = (data: any) => {
      const message = `New Order: ${data.orderId} - ${data.message}`;
      addNotification(message, 'success');
    };

    const handleCustomerBirthday = (data: any) => {
      const message = `Aniversário: Hoje é o aniversário de ${data.name}! Deseje a ele(a) felicidades!`;
      addNotification(message, 'info');
    };

    socket.on(eventName, handleGenericNotification);
    socket.on('xp_earned', handleXpEarned);
    socket.on('level_up', handleLevelUp);
    socket.on('service_order_status_updated', handleStatusUpdate);
    socket.on('new_lead', handleNewLead);
    socket.on('low_stock_critical', handleLowStock);
    socket.on('newOrderNotification', handleNewOrder);
    socket.on('customer_birthday', handleCustomerBirthday);

    return () => {
      socket.off(eventName, handleGenericNotification);
      socket.off('xp_earned', handleXpEarned);
      socket.off('level_up', handleLevelUp);
      socket.off('service_order_status_updated', handleStatusUpdate);
      socket.off('new_lead', handleNewLead);
      socket.off('low_stock_critical', handleLowStock);
      socket.off('newOrderNotification', handleNewOrder);
      socket.off('customer_birthday', handleCustomerBirthday);
    };
  }, [socket, user, addNotification, playSound]);

  return null;
};