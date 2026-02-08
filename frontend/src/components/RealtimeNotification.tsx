import React, { useEffect, useState } from 'react';

interface RealtimeNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export const RealtimeNotification: React.FC<RealtimeNotificationProps> = ({
  message,
  type,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000); // Auto-hide after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type];

  const textColor = 'text-white';

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center justify-between ${bgColor} ${textColor}`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="ml-4 text-white font-normal"
      >
        &times;
      </button>
    </div>
  );
};

