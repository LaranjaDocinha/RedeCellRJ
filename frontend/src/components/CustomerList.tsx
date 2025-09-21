import React from 'react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface CustomerListProps {
  customers: Customer[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Name</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Email</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Phone</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Address</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {customers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4">No customers found.</td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{customer.id}</td>
                <td className="py-3 px-4">{customer.name}</td>
                <td className="py-3 px-4">{customer.email}</td>
                <td className="py-3 px-4">{customer.phone || 'N/A'}</td>
                <td className="py-3 px-4">{customer.address || 'N/A'}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onEdit(customer.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(customer.id)}
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
