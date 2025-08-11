import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import LoadingSpinner from '../Common/LoadingSpinner';
import 'simplebar-react/dist/simplebar.min.css';
import './NotificationCenter.scss';

const NotificationCenter = () => {
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return; // Não busca se não houver token
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setError('Não foi possível carregar as notificações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/notifications/mark-read`,
        { notificationIds: unreadIds },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Atualiza o estado local para refletir a mudança imediatamente
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n.id) ? { ...n, is_read: true } : n)),
      );
    } catch (err) {
      console.error('Erro ao marcar notificações como lidas:', err);
    }
  }, [notifications]);

  const toggle = () => {
    setMenu((prev) => !prev);
    if (!menu && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'stock_alert':
        return 'bx bx-error-circle text-warning';
      case 'customer_risk':
        return 'bx bx-user-x text-danger';
      case 'sales_goal':
        return 'bx bx-trending-down text-info';
      default:
        return 'bx bx-bell text-primary';
    }
  };

  return (
    <React.Fragment>
      <Dropdown className='d-inline-block notification-center' isOpen={menu} toggle={toggle}>
        <DropdownToggle
          aria-label='Abrir notificações'
          className='btn header-item noti-icon'
          tag='button'
        >
          <i className='bx bx-bell notification-bell' />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                animate={{ scale: 1, opacity: 1 }}
                className='notification-badge'
                exit={{ scale: 0, opacity: 0 }}
                initial={{ scale: 0, opacity: 0 }}
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </DropdownToggle>

        <DropdownMenu className='dropdown-menu-lg dropdown-menu-end p-0'>
          <div className='p-3 notification-header'>
            <h5 className='m-0'>Notificações</h5>
          </div>

          <SimpleBar className='notification-list'>
            <AnimatePresence>
              {loading ? (
                <div className='text-center p-3'>
                  <LoadingSpinner size='sm' /> Carregando...
                </div>
              ) : error ? (
                <div className='text-center p-3 text-danger'>{error}</div>
              ) : notifications.length === 0 ? (
                <div className='text-center p-3 text-muted'>Nenhuma notificação.</div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                    className={`text-reset notification-item ${notification.is_read ? 'read' : 'unread'}`}
                    exit={{ opacity: 0, x: -20 }}
                    initial={{ opacity: 0, y: -20 }}
                  >
                    <Link className='d-flex' to={notification.link || '#'}>
                      <div className='item-icon'>
                        <i className={getIcon(notification.type)} />
                      </div>
                      <div className='flex-1'>
                        <h6 className='mt-0 mb-1'>
                          {notification.type.replace(/_/g, ' ').toUpperCase()}
                        </h6>
                        <div className='font-size-12 text-muted'>
                          <p className='mb-0'>{notification.message}</p>
                          <p className='mb-0 text-end'>
                            <small>{new Date(notification.created_at).toLocaleString()}</small>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </SimpleBar>

          <div className='p-2 border-top'>
            <Link className='notification-footer' to='/notifications'>
              Ver todas as notificações
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default NotificationCenter;
