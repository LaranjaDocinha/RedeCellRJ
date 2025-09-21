import React from 'react';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface CategoryListProps {
  categories: Category[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Name</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Description</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4">No categories found.</td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{category.id}</td>
                <td className="py-3 px-4">{category.name}</td>
                <td className="py-3 px-4">{category.description || 'N/A'}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onEdit(category.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(category.id)}
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
