import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, AlertColor, Box, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import api from '../services/api';

export interface AppNotification {
  id: string | number;
  message: string;
  title?: string;
  severity: AlertColor;
  timestamp: Date | string;
  read: boolean;
  type?: string;
  link?: string;
  metadata?: any;
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (msg: string, sev?: AlertColor, type?: string, metadata?: any) => void;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Snackbar State
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSev, setSnackSev] = useState<AlertColor>('info');

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      // Verify if data is an array before mapping
      if (Array.isArray(response.data)) {
        // Map backend type to frontend severity
        const mapped = response.data.map((n: any) => ({
            ...n,
            severity: n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'info'
        }));
        setNotifications(mapped);
      } else if (response.data && Array.isArray(response.data.data)) {
         // Handle wrapped response { status: 'success', data: [...] }
         const mapped = response.data.data.map((n: any) => ({
            ...n,
            severity: n.type === 'error' ? 'error' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'info'
        }));
        setNotifications(mapped);
      } else {
        console.warn('Notifications response is not an array:', response.data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = useCallback((msg: string, sev: AlertColor = 'info') => {
    setSnackMsg(msg);
    setSnackSev(sev);
    setSnackOpen(true);
  }, []);

  const markAsRead = async (id: string | number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
        notifications, 
        addNotification,
        markAsRead, 
        markAllAsRead, 
        loading 
    }}>
      {children}
      <Snackbar 
        open={snackOpen} 
        autoHideDuration={5000} 
        onClose={() => setSnackOpen(false)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackSev} variant="filled" sx={{ borderRadius: '12px', boxShadow: 3 }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
