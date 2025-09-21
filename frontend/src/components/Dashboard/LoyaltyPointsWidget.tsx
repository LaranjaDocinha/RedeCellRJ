
import React, { useEffect, useState } from 'react';
import DashboardWidget from './DashboardWidget';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../components/NotificationProvider';
import { useTranslation } from 'react-i18next';

interface LoyaltyPointsWidgetProps {
  // No specific props needed, fetches its own data
}

const LoyaltyPointsWidget: React.FC<LoyaltyPointsWidgetProps> = () => {
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const { token, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch('/api/loyalty/points', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLoyaltyPoints(data.loyalty_points);
      } catch (error: any) {
        addNotification(`Failed to fetch loyalty points: ${error.message}`, 'error');
      }
    };

    fetchLoyaltyPoints();
  }, [token, isAuthenticated, addNotification]);

  return (
    <DashboardWidget title={t('loyalty_points')}>
      {loyaltyPoints !== null ? (
        <p className="summary-value">{loyaltyPoints}</p>
      ) : (
        <p>{t('loading_points')}</p>
      )}
    </DashboardWidget>
  );
};

export default LoyaltyPointsWidget;
