import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';

const Logout = () => {
  const navigate = useNavigate();
  const logoutAction = useAuthStore((state) => state.logout);

  useEffect(() => {
    logoutAction();
    navigate('/login');
  }, [logoutAction, navigate]);

  // Renderiza um componente vazio ou um spinner enquanto o logout acontece
  return null;
};

export default Logout;
