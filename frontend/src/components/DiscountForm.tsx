import React, { useState, useEffect } from 'react';

interface DiscountFormData {
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  is_active?: boolean;
}

interface DiscountFormProps {
  initialData?: DiscountFormData & { id?: number };
  onSubmit: (data: DiscountFormData) => void;
  onCancel: () => void;
}

export const DiscountForm: React.FC<DiscountFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<DiscountFormData>({
    name: '',
    type: 'percentage',
    value: 0,
    start_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    end_date: '',
    min_purchase_amount: 0,
    max_uses: 0,
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : '',
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
        <select
          name="type"
          id="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="percentage">Percentage</option>
          <option value="fixed_amount">Fixed Amount</option>
        </select>
      </div>
      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value</label>
        <input
          type="number"
          name="value"
          id="value"
          value={formData.value}
          onChange={handleChange}
          required
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="datetime-local"
          name="start_date"
          id="start_date"
          value={formData.start_date}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          type="datetime-local"
          name="end_date"
          id="end_date"
          value={formData.end_date || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="min_purchase_amount" className="block text-sm font-medium text-gray-700">Min Purchase Amount</label>
        <input
          type="number"
          name="min_purchase_amount"
          id="min_purchase_amount"
          value={formData.min_purchase_amount || 0}
          onChange={handleChange}
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="max_uses" className="block text-sm font-medium text-gray-700">Max Uses</label>
        <input
          type="number"
          name="max_uses"
          id="max_uses"
          value={formData.max_uses || 0}
          onChange={handleChange}
          step="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Is Active</label>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? 'Update Discount' : 'Add Discount'}
        </button>
      </div>
    </form>
  );
};
