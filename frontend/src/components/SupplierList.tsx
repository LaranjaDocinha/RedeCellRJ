import React from 'react';

interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface SupplierListProps {
  suppliers: Supplier[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Name</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Contact Person</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Email</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Phone</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Address</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">No suppliers found.</td>
            </tr>
          ) : (
            suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{supplier.id}</td>
                <td className="py-3 px-4">{supplier.name}</td>
                <td className="py-3 px-4">{supplier.contact_person || 'N/A'}</td>
                <td className="py-3 px-4">{supplier.email || 'N/A'}</td>
                <td className="py-3 px-4">{supplier.phone || 'N/A'}</td>
                <td className="py-3 px-4">{supplier.address || 'N/A'}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onEdit(supplier.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(supplier.id)}
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
