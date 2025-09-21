import React from 'react';

interface Permission {
  id: number;
  name: string;
}

interface PermissionListProps {
  permissions: Permission[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const PermissionList: React.FC<PermissionListProps> = ({ permissions, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Name</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {permissions.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4">No permissions found.</td>
            </tr>
          ) : (
            permissions.map((permission) => (
              <tr key={permission.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{permission.id}</td>
                <td className="py-3 px-4">{permission.name}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onEdit(permission.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(permission.id)}
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
