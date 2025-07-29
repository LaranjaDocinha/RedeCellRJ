import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import SimpleBar from 'simplebar-react';

import LoadingSpinner from '../Common/LoadingSpinner';
import 'simplebar-react/dist/simplebar.min.css';
import useApi from '../../hooks/useApi';
import { get, put } from '../../helpers/api_helper';
import { useAuthStore } from '../../store/authStore';

import './NotificationCenter.scss';

const NotificationCenter = () => {
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();

  const {
    data: fetchedNotifications,
    loading,
    error,
    request: fetchNotificationsApi,
  } = useApi(get);
  const { request: markNotificationAsReadApi } = useApi(put);

  const loadNotifications = useCallback(async () => {
    if (user?.id) {
      try {
        const allNotifications = await fetchNotificationsApi(
          `/api/notifications?userId=${user.id}&limit=20&readStatus=all`,
        );
        if (allNotifications) {
          setNotifications(allNotifications);
          setUnreadCount(allNotifications.filter((n) => !n.readStatus).length);
        }
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
        // Opcional: exibir um toast de erro aqui se desejar um feedback mais direto
      }
    }
  }, [fetchNotificationsApi, user?.id]);

  useEffect(() => {
    loadNotifications();
    // Opcional: Recarregar notificações a cada X segundos
    const interval = setInterval(loadNotifications, 60000); // A cada 1 minuto
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await markNotificationAsReadApi(`/api/notifications/${notificationId}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, readStatus: true } : n)),
        );
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      } catch (err) {
        console.error('Erro ao marcar notificação como lida:', err);
      }
    },
    [markNotificationAsReadApi],
  );

  const toggle = () => {
    setMenu((prev) => !prev);
    // Quando o dropdown é aberto, marca todas as notificações não lidas como lidas
    if (!menu && unreadCount > 0) {
      notifications.filter((n) => !n.readStatus).forEach((n) => markAsRead(n.id));
    }
  };

  return (
    <React.Fragment>
      <Dropdown className='d-inline-block notification-center' isOpen={menu} toggle={toggle}>
        <DropdownToggle
          aria-label='Abrir notificações'
          className='btn header-item noti-icon'
          id='page-header-notifications-dropdown'
          tag='button'
        >
          <i className='bx bx-bell notification-bell' />
          {unreadCount > 0 && <span className='notification-badge'>{unreadCount}</span>}
        </DropdownToggle>

        <DropdownMenu className='dropdown-menu-lg dropdown-menu-end p-0'>
          <div className='p-3 notification-header'>
            <div className='row align-items-center'>
              <div className='col'>
                <h5 className='m-0'> Notificações </h5>
              </div>
            </div>
          </div>

          <SimpleBar className='notification-list'>
            {loading ? (
              <div className='text-center p-3'>
                <LoadingSpinner size='sm' /> Carregando...
              </div>
            ) : error ? (
              <div className='text-center p-3 text-danger'>Erro ao carregar notificações.</div>
            ) : notifications.length === 0 ? (
              <div className='text-center p-3 text-muted'>Nenhuma notificação.</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`text-reset notification-item ${notification.readStatus ? 'read' : 'unread'}`}
                  role='button'
                  tabIndex={0}
                  onClick={() => !notification.readStatus && markAsRead(notification.id)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      !notification.readStatus && markAsRead(notification.id);
                    }
                  }}
                >
                  <div className='item-icon'>
                    {/* Ícone baseado no tipo de notificação */}
                    {notification.type === 'stock_alert' && (
                      <i className='bx bx-error-circle text-warning' />
                    )}
                    {notification.type === 'customer_risk' && (
                      <i className='bx bx-user-x text-danger' />
                    )}
                    {notification.type === 'sales_goal' && (
                      <i className='bx bx-trending-down text-info' />
                    )}
                    {!['stock_alert', 'customer_risk', 'sales_goal'].includes(
                      notification.type,
                    ) && <i className='bx bx-bell text-primary' />}
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
                </div>
              ))
            )}
          </SimpleBar>

          <div className='p-2 border-top'>
            <Link className='notification-footer' to='#'>
              Ver todas as notificações
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default NotificationCenter;
