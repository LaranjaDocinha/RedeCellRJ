import { useCallback } from 'react';
import toast from 'react-hot-toast';

const useNotification = () => {
  const showSuccess = useCallback((message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      // Você pode adicionar mais opções de estilo ou animação aqui
      // style: { /* ... */ },
      // className: 'my-custom-toast',
    });
  }, []);

  const showError = useCallback((message) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    });
  }, []);

  const showInfo = useCallback((message) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
    });
  }, []);

  const showLoading = useCallback((message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  }, []);

  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  const updateToast = useCallback((toastId, type, message) => {
    if (type === 'success') {
      toast.success(message, { id: toastId });
    } else if (type === 'error') {
      toast.error(message, { id: toastId });
    } else {
      toast(message, { id: toastId });
    }
  }, []);

  return {
    showSuccess,
    showError,
    showInfo,
    showLoading,
    dismiss,
    updateToast,
  };
};

export default useNotification;
