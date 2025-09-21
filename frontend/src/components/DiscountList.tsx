import React from 'react';

interface Discount {
  id: number;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  uses_count: number;
  is_active: boolean;
}

interface DiscountListProps {
  discounts: Discount[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const DiscountList: React.FC<DiscountListProps> = ({ discounts, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Name</th>
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
          {discounts.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-4">No discounts found.</td>
            </tr>
          ) : (
            discounts.map((discount) => (
              <tr key={discount.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{discount.id}</td>
                <td className="py-3 px-4">{discount.name}</td>
                <td className="py-3 px-4">{discount.type}</td>
                <td className="py-3 px-4">{discount.value}</td>
                <td className="py-3 px-4">{new Date(discount.start_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">{discount.end_date ? new Date(discount.end_date).toLocaleDateString() : 'N/A'}</td>
                <td className="py-3 px-4">{discount.min_purchase_amount || 'N/A'}</td>
                <td className="py-3 px-4">{discount.max_uses || 'Unlimited'}</td>
                <td className="py-3 px-4">{discount.uses_count}</td>
                <td className="py-3 px-4">{discount.is_active ? 'Yes' : 'No'}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onEdit(discount.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(discount.id)}
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
