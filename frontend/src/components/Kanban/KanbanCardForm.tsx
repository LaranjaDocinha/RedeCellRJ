import React, { useState, useEffect } from 'react';

interface KanbanCardFormData {
  title: string;
  description?: string;
  due_date?: string;
  assignee_id?: number | null;
}

interface KanbanCardFormProps {
  initialData?: KanbanCardFormData & { id?: string };
  onSubmit: (data: KanbanCardFormData) => void;
  onCancel: () => void;
  availableAssignees: Array<{ id: number; name: string }>;
}

export const KanbanCardForm: React.FC<KanbanCardFormProps> = ({ initialData, onSubmit, onCancel, availableAssignees }) => {
  const [formData, setFormData] = useState<KanbanCardFormData>({
    title: '',
    description: '',
    due_date: '',
    assignee_id: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().slice(0, 16) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'assignee_id' ? (value === '' ? null : parseInt(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
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
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="datetime-local"
          name="due_date"
          id="due_date"
          value={formData.due_date || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="assignee_id" className="block text-sm font-medium text-gray-700">Assignee</label>
        <select
          name="assignee_id"
          id="assignee_id"
          value={formData.assignee_id || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">-- Select Assignee --</option>
          {availableAssignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.name}
            </option>
          ))}
        </select>
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
          {initialData ? 'Update Card' : 'Add Card'}
        </button>
      </div>
    </form>
  );
};
