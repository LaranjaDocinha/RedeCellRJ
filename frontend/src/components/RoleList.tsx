import React from 'react';

interface Role {
  id: number;
  name: string;
}

interface RoleListProps {
  roles: Role[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onManagePermissions: (id: number) => void;
}

export const RoleList: React.FC<RoleListProps> = ({ roles, onEdit, onDelete, onManagePermissions }) => {
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
          {roles.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4">No roles found.</td>
            </tr>
          ) : (
            roles.map((role) => (
              <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{role.id}</td>
                <td className="py-3 px-4">{role.name}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onEdit(role.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(role.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => onManagePermissions(role.id)}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    Manage Permissions
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
