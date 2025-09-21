import React, { useState, useEffect } from 'react';

interface ReturnItemFormData {
  product_id: number;
  variation_id: number;
  quantity: number;
}

interface ReturnFormData {
  sale_id: number;
  reason?: string;
  items: ReturnItemFormData[];
}

interface ReturnFormProps {
  initialData?: ReturnFormData & { id?: number };
  onSubmit: (data: ReturnFormData) => void;
  onCancel: () => void;
}

export const ReturnForm: React.FC<ReturnFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ReturnFormData>({
    sale_id: 0,
    reason: '',
    items: [{ product_id: 0, variation_id: 0, quantity: 0 }],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: name === 'sale_id' ? parseInt(value) : value }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]: parseInt(value),
    };
    setFormData((prevData) => ({ ...prevData, items: newItems }));
  };

  const handleAddItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      items: [...prevData.items, { product_id: 0, variation_id: 0, quantity: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      items: prevData.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <div>
        <label htmlFor="sale_id" className="block text-sm font-medium text-gray-700">Sale ID</label>
        <input
          type="number"
          name="sale_id"
          id="sale_id"
          value={formData.sale_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
        <textarea
          name="reason"
          id="reason"
          value={formData.reason || ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      <h3 className="text-lg font-semibold mb-2">Items to Return</h3>
      {formData.items.map((item, index) => (
        <div key={index} className="flex space-x-2 mb-2 items-end">
          <div className="flex-1">
            <label htmlFor={`product_id-${index}`} className="block text-sm font-medium text-gray-700">Product ID</label>
            <input
              type="number"
              name="product_id"
              id={`product_id-${index}`}
              value={item.product_id}
              onChange={(e) => handleItemChange(index, e)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor={`variation_id-${index}`} className="block text-sm font-medium text-gray-700">Variation ID</label>
            <input
              type="number"
              name="variation_id"
              id={`variation_id-${index}`}
              value={item.variation_id}
              onChange={(e) => handleItemChange(index, e)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              id={`quantity-${index}`}
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveItem(index)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddItem}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
      >
        Add Item
      </button>

      <div className="flex justify-end space-x-3 mt-6">
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
          {initialData ? 'Update Return' : 'Create Return'}
        </button>
      </div>
    </form>
  );
};
