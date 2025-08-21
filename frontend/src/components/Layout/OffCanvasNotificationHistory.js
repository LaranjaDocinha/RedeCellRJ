import React, { useState, useEffect, useCallback } from 'react';
import { Offcanvas, OffcanvasHeader, OffcanvasBody, Spinner, Button } from 'reactstrap';
import { get, post, del } from '../../helpers/api_helper';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const OffCanvasNotificationHistory = ({ isOpen, toggle }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const response = await get(`/api/notifications?page=${pageNum}&limit=20`);
      const newNotifications = response.notifications || [];
      setNotifications(prev => [...prev, ...newNotifications]);
      setHasMore(newNotifications.length > 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset on open to fetch fresh data or if it's the first time
      setNotifications([]);
      setPage(1);
      setHasMore(true);
      fetchNotifications(1);
    }
  }, [isOpen, fetchNotifications]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_sale': return 'bx bx-cart-alt';
      case 'stock_alert': return 'bx bx-error-circle';
      case 'new_repair': return 'bx bx-wrench';
      default: return 'bx bx-bell';
    }
  };

  const getNotificationLink = (notification) => {
    // Placeholder for actual links based on notification type and entity_id
    switch (notification.type) {
      case 'new_sale': return `/sales/${notification.entity_id}`; // Assuming entity_id is sale ID
      case 'stock_alert': return `/products/${notification.entity_id}`; // Assuming entity_id is product ID
      case 'new_repair': return `/repairs/${notification.entity_id}`; // Assuming entity_id is repair ID
      default: return '/painel-administrativo'; // Generic fallback
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await post(`/api/notifications/${notification.id}/mark-read`);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    toggle(); // Close offcanvas
    navigate(getNotificationLink(notification));
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await post(`/api/notifications/${notificationId}/mark-read`);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDismiss = async (notificationId) => {
    try {
      await del(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  return (
    <Offcanvas isOpen={isOpen} toggle={toggle} direction="end" scrollable>
      <OffcanvasHeader toggle={toggle}>
        Histórico de Notificações
      </OffcanvasHeader>
      <OffcanvasBody>
        <div>
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`d-flex align-items-center p-3 border-bottom ${notification.is_read ? 'text-muted' : 'fw-bold'}`}
            >
              <Link to={getNotificationLink(notification)} onClick={() => handleNotificationClick(notification)} className="d-flex align-items-center flex-grow-1 text-decoration-none text-reset">
                <div className="avatar-xs me-3">
                  <span className={`avatar-title rounded-circle font-size-16 ${notification.is_read ? 'bg-light text-secondary' : 'bg-primary text-white'}`}>
                    <i className={getIcon(notification.type)} />
                  </span>
                </div>
                <div className="flex-grow-1">
                  <p className="mb-1">{notification.message}</p>
                  <small>{new Date(notification.created_at).toLocaleString()}</small>
                </div>
              </Link>
              {!notification.is_read && (
                <div className="ms-auto d-flex align-items-center">
                  <Button
                    color="link"
                    className="text-primary p-0 me-2"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Marcar como lida"
                  >
                    <i className="bx bx-check-circle font-size-18" />
                  </Button>
                  <Button
                    color="link"
                    className="text-danger p-0"
                    onClick={() => handleDismiss(notification.id)}
                    title="Descartar"
                  >
                    <i className="bx bx-x-circle font-size-18" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        {loading && (
          <div className="text-center mt-3">
            <Spinner color="primary" />
          </div>
        )}
        {!loading && hasMore && (
          <div className="text-center mt-4">
            <Button onClick={loadMore} color="primary" outline>
              Carregar Mais
            </Button>
          </div>
        )}
        {!loading && !hasMore && notifications.length === 0 && (
            <div className="text-center mt-4">
                <p>Nenhuma notificação encontrada.</p>
            </div>
        )}
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default OffCanvasNotificationHistory;
