import React, { useState, useEffect, useCallback } from 'react';
import { get, post } from '../../helpers/api_helper';
import OffCanvasNotificationHistory from './OffCanvasNotificationHistory';
import { io } from 'socket.io-client'; // Import socket.io-client

import './NotificationCenter.scss';

const NotificationCenter = () => {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await get(`/api/notifications/unread-count`);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      // console.error("Error fetching unread count:", error); // Keep for debugging if needed
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Refresh every minute

    // Socket.IO connection
    const socket = io('http://localhost:5000'); // Connect to your backend Socket.IO server

    socket.on('connect', () => {
      // console.log('Connected to Socket.IO server'); // Keep for debugging if needed
    });

    socket.on('newNotification', (notification) => {
      // console.log('New notification received via Socket.IO:', notification); // Keep for debugging if needed
      // Update unread count immediately
      setUnreadCount(prevCount => prevCount + 1);
      // You might want to show a toast notification here
    });

    socket.on('disconnect', () => {
      // console.log('Disconnected from Socket.IO server'); // Keep for debugging if needed
    });

    return () => {
        clearInterval(interval);
        socket.disconnect(); // Disconnect socket on component unmount
    };
  }, [fetchUnreadCount]);

  const toggleOffcanvas = () => {
    setIsOffcanvasOpen(prevState => !prevState);
    // Optionally mark all as read when offcanvas is opened
    if (!isOffcanvasOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const markAllAsRead = async () => {
    try {
      await post(`/api/notifications/mark-read`);
      setUnreadCount(0);
    } catch (error) {
      // console.error("Error marking all notifications as read:", error); // Keep for debugging if needed
    }
  };

  return (
    <>
      <button onClick={toggleOffcanvas} className="btn header-item noti-icon">
        <i className="bx bx-bell" />
        {unreadCount > 0 && <span className="badge bg-danger rounded-pill">{unreadCount}</span>}
      </button>
      <OffCanvasNotificationHistory isOpen={isOffcanvasOpen} toggle={toggleOffcanvas} />
    </>
  );
};

export default NotificationCenter;
