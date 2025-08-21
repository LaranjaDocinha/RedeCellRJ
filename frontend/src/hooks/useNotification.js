import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Info, Loader } from 'react-feather';
import { motion } from 'framer-motion';

const ToastWrapper = ({ t, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      backgroundColor: 'var(--background-color, #fff)',
      color: 'var(--text-color, #333)',
    }}
  >
    <div style={{ marginRight: '12px' }}>{icon}</div>
    <div>{children}</div>
    <button
      onClick={() => toast.dismiss(t.id)}
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        marginLeft: '16px',
        color: 'var(--text-color-muted, #888)',
      }}
    >
      <XCircle size={18} />
    </button>
  </motion.div>
);

const icons = {
  success: <CheckCircle color="var(--success-color, #28a745)" />,
  error: <XCircle color="var(--danger-color, #dc3545)" />,
  info: <Info color="var(--info-color, #17a2b8)" />,
  loading: <Loader color="var(--primary-color, #007bff)" className="animate-spin" />,
};

const useNotification = () => {
  const showToast = useCallback((message, options) => {
    const { type = 'info', ...restOptions } = options;

    const icon = icons[type];

    return toast.custom(
      (t) => (
        <ToastWrapper t={t} icon={icon}>
          {message}
        </ToastWrapper>
      ),
      {
        duration: 4000,
        position: 'bottom-right',
        ...restOptions,
      }
    );
  }, []);

  const showSuccess = useCallback((message) => {
    showToast(message, { type: 'success' });
  }, [showToast]);

  const showError = useCallback((message) => {
    showToast(message, { type: 'error', duration: 6000 });
  }, [showToast]);

  const showInfo = useCallback((message) => {
    showToast(message, { type: 'info' });
  }, [showToast]);

  const showLoading = useCallback((message = 'Carregando...') => {
    return showToast(message, { type: 'loading', duration: Infinity });
  }, [showToast]);

  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  const updateToast = useCallback((toastId, message, type = 'success') => {
     toast.custom(
      (t) => (
        <ToastWrapper t={t} icon={icons[type]}>
          {message}
        </ToastWrapper>
      ),
      { id: toastId }
    );
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