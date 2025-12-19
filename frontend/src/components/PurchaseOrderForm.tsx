import React, { useState, useEffect } from 'react';

interface PurchaseOrderItemFormData {
  product_id: number;
  variation_id: number;
  quantity: number;
  unit_price: number;
}

interface PurchaseOrderFormData {
  supplier_id: number;
  expected_delivery_date?: string;
  status?: 'pending' | 'ordered' | 'received' | 'cancelled';
  items: PurchaseOrderItemFormData[];
}

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrderFormData & { id?: number };
  onSubmit: (data: PurchaseOrderFormData) => void;
  onCancel: () => void;
  suppliers: Array<{ id: number; name: string }>;
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  suppliers,
}) => {
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    supplier_id: suppliers[0]?.id || 0,
    expected_delivery_date: '',
    status: 'pending',
    items: [{ product_id: 0, variation_id: 0, quantity: 0, unit_price: 0 }],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        expected_delivery_date: initialData.expected_delivery_date
          ? new Date(initialData.expected_delivery_date).toISOString().slice(0, 16)
          : '',
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]:
        name === 'product_id' || name === 'variation_id' || name === 'quantity'
          ? parseInt(value)
          : parseFloat(value),
    };
    setFormData((prevData) => ({ ...prevData, items: newItems }));
  };

  const handleAddItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      items: [...prevData.items, { product_id: 0, variation_id: 0, quantity: 0, unit_price: 0 }],
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
        <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700">
          Supplier
        </label>
        <select
          name="supplier_id"
          id="supplier_id"
          value={formData.supplier_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-gray-700">
          Expected Delivery Date
        </label>
        <input
          type="datetime-local"
          name="expected_delivery_date"
          id="expected_delivery_date"
          value={formData.expected_delivery_date || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      {initialData && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="pending">Pending</option>
            <option value="ordered">Ordered</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">Order Items</h3>
      {formData.items.map((item, index) => (
        <div key={index} className="flex space-x-2 mb-2 items-end">
          <div className="flex-1">
            <label
              htmlFor={`product_id-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Product ID
            </label>
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
            <label
              htmlFor={`variation_id-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Variation ID
            </label>
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
            <label
              htmlFor={`quantity-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Quantity
            </label>
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
          <div className="flex-1">
            <label
              htmlFor={`unit_price-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Unit Price
            </label>
            <input
              type="number"
              name="unit_price"
              id={`unit_price-${index}`}
              value={item.unit_price}
              onChange={(e) => handleItemChange(index, e)}
              required
              step="0.01"
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
          {initialData ? 'Update Order' : 'Create Order'}
        </button>
      </div>
    </form>
  );
};
