
import React, { useState, useEffect } from 'react';
import { CouponList } from '../components/CouponList';
import { CouponForm } from '../components/CouponForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled'; // Reutilizando componentes estilizados
import { Button } from '../components/Button'; // Importar o componente Button
import Loading from '../components/Loading'; // Importar o componente Loading
import { StyledEmptyState } from '../components/AuditLogList.styled'; // Reutilizando StyledEmptyState
import { FaTag } from 'react-icons/fa'; // Ícone para estado vazio

export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  uses_count: number;
  is_active: boolean;
}

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/coupons', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCoupons(data);
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      showNotification(`Failed to fetch coupons: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (couponData: Omit<Coupon, 'id' | 'uses_count'>) => {
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(couponData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchCoupons();
      showNotification('Coupon created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      showNotification(`Failed to create coupon: ${error.message}`, 'error');
    }
  };

  const handleUpdateCoupon = async (originalCode: string, couponData: Omit<Coupon, 'id' | 'uses_count'>) => {
    try {
      const response = await fetch(`/api/coupons/${originalCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(couponData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingCoupon(undefined);
      setShowForm(false);
      fetchCoupons();
      showNotification('Coupon updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating coupon:", error);
      showNotification(`Failed to update coupon: ${error.message}`, 'error');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;
    if (!window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return;
    try {
      const response = await fetch(`/api/coupons/${coupon.code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchCoupons();
      showNotification('Coupon deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      showNotification(`Failed to delete coupon: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const couponToEdit = coupons.find((d) => d.id === id);
    if (couponToEdit) {
      setEditingCoupon(couponToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingCoupon(undefined);
    setShowForm(false);
  };

  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledPageTitle
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Coupon Management
      </StyledPageTitle>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setShowForm(true)}
              variant="contained"
              color="primary"
              label="Add New Coupon"
            />
          </div>

          {showForm && (
            <div className="mb-8">
              <h2 className="text-xl font-normal mb-3">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
              <CouponForm
                initialData={editingCoupon}
                onSubmit={(data) => {
                  if (editingCoupon) {
                    handleUpdateCoupon(editingCoupon.code, data);
                  } else {
                    handleCreateCoupon(data);
                  }
                }}
                onCancel={handleCancelForm}
              />
            </div>
          )}

          {coupons.length === 0 && !showForm ? (
            <StyledEmptyState
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FaTag />
              <p>No coupons found. Click "Add New Coupon" to get started!</p>
            </StyledEmptyState>
          ) : (
            <CouponList
              coupons={coupons}
              onEdit={handleEditClick}
              onDelete={handleDeleteCoupon}
            />
          )}
        </>
      )}
    </StyledPageContainer>
  );
};

export default CouponsPage;
