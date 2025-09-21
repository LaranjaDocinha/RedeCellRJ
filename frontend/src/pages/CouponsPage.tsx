import React, { useState, useEffect } from 'react';
import { CouponList } from '../components/CouponList';
import { CouponForm } from '../components/CouponForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';

interface Coupon {
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
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/coupons', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCoupons(data);
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      addNotification(`Failed to fetch coupons: ${error.message}`, 'error');
    }
  };

  const handleCreateCoupon = async (couponData: Omit<Coupon, 'id' | 'uses_count'>) => {
    try {
      const response = await fetch('/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(couponData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchCoupons();
      addNotification('Coupon created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      addNotification(`Failed to create coupon: ${error.message}`, 'error');
    }
  };

  const handleUpdateCoupon = async (id: number, couponData: Omit<Coupon, 'id' | 'uses_count'>) => {
    try {
      const response = await fetch(`/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(couponData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingCoupon(undefined);
      setShowForm(false);
      fetchCoupons();
      addNotification('Coupon updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating coupon:", error);
      addNotification(`Failed to update coupon: ${error.message}`, 'error');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const response = await fetch(`/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchCoupons();
      addNotification('Coupon deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      addNotification(`Failed to delete coupon: ${error.message}`, 'error');
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coupon Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Coupon
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          </h2>
          <CouponForm
            initialData={editingCoupon}
            onSubmit={(data) => {
              if (editingCoupon) {
                handleUpdateCoupon(editingCoupon.id, data);
              } else {
                handleCreateCoupon(data);
              }
            }}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <CouponList
        coupons={coupons}
        onEdit={handleEditClick}
        onDelete={handleDeleteCoupon}
      />
    </div>
  );
};

export default CouponsPage;
