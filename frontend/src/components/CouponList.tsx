import React from 'react';

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

interface CouponListProps {
  coupons: Coupon[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const CouponList: React.FC<CouponListProps> = ({ coupons, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Code</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Type</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Value</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Start Date</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">End Date</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Min Purchase</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Max Uses</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Used</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Active</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {coupons.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-4">No coupons found.</td>
            </tr>
          ) : (
            coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{coupon.id}</td>
                <td className="py-3 px-4">{coupon.code}</td>
                <td className="py-3 px-4">{coupon.type}</td>
                <td className="py-3 px-4">{coupon.value}</td>
                <td className="py-3 px-4">{new Date(coupon.start_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">{coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'N/A'}</td>
                <td className="py-3 px-4">{coupon.min_purchase_amount || 'N/A'}</td>
                <td className="py-3 px-4">{coupon.max_uses || 'Unlimited'}</td>
                <td className="py-3 px-4">{coupon.uses_count}</td>
                <td className="py-3 px-4">{coupon.is_active ? 'Yes' : 'No'}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onEdit(coupon.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(coupon.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
