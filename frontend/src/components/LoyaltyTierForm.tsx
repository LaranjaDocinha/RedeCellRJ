import React, { useState, useEffect } from 'react';

interface LoyaltyTierFormData {
  name: string;
  min_points: number;
  description?: string;
  benefits?: string; // Storing as string for JSON input
}

interface LoyaltyTierFormProps {
  initialData?: LoyaltyTierFormData & { id?: number };
  onSubmit: (data: LoyaltyTierFormData) => void;
  onCancel: () => void;
}

export const LoyaltyTierForm: React.FC<LoyaltyTierFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<LoyaltyTierFormData>({
    name: '',
    min_points: 0,
    description: '',
    benefits: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        benefits: initialData.benefits ? JSON.stringify(initialData.benefits, null, 2) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'min_points' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.benefits) {
        dataToSubmit.benefits = JSON.parse(dataToSubmit.benefits); // Parse benefits string to JSON object
      }
      onSubmit(dataToSubmit);
    } catch (error) {
      alert('Invalid JSON in Benefits field.');
      console.error('Invalid JSON in Benefits:', error);
    }
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
        <label htmlFor="min_points" className="block text-sm font-medium text-gray-700">Minimum Points</label>
        <input
          type="number"
          name="min_points"
          id="min_points"
          value={formData.min_points}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          id="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        ></textarea>
      </div>
      <div>
        <label htmlFor="benefits" className="block text-sm font-medium text-gray-700">Benefits (JSON)</label>
        <textarea
          name="benefits"
          id="benefits"
          value={formData.benefits || ''}
          onChange={handleChange}
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
          placeholder='e.g., { "discount": "5%", "free_shipping": true }'
        ></textarea>
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
          {initialData ? 'Update Tier' : 'Add Tier'}
        </button>
      </div>
    </form>
  );
};
