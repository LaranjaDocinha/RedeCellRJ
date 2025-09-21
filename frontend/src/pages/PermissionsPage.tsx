import React, { useState, useEffect } from 'react';
import { PermissionList } from '../components/PermissionList';
import { PermissionForm } from '../components/PermissionForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';

interface Permission {
  id: number;
  name: string;
}

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editingPermission, setEditingPermission] = useState<Permission | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/permissions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPermissions(data);
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      addNotification(`Failed to fetch permissions: ${error.message}`, 'error');
    }
  };

  const handleCreatePermission = async (permissionData: Omit<Permission, 'id'>) => {
    try {
      const response = await fetch('/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(permissionData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchPermissions();
      addNotification('Permission created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating permission:", error);
      addNotification(`Failed to create permission: ${error.message}`, 'error');
    }
  };

  const handleUpdatePermission = async (id: number, permissionData: Omit<Permission, 'id'>) => {
    try {
      const response = await fetch(`/permissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(permissionData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingPermission(undefined);
      setShowForm(false);
      fetchPermissions();
      addNotification('Permission updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating permission:", error);
      addNotification(`Failed to update permission: ${error.message}`, 'error');
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;
    try {
      const response = await fetch(`/permissions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchPermissions();
      addNotification('Permission deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting permission:", error);
      addNotification(`Failed to delete permission: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const permissionToEdit = permissions.find((p) => p.id === id);
    if (permissionToEdit) {
      setEditingPermission(permissionToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingPermission(undefined);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Permission Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Permission
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingPermission ? 'Edit Permission' : 'Add New Permission'}
          </h2>
          <PermissionForm
            initialData={editingPermission}
            onSubmit={(data) => {
              if (editingPermission) {
                handleUpdatePermission(editingPermission.id, data);
              } else {
                handleCreatePermission(data);
              }
            }}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <PermissionList
        permissions={permissions}
        onEdit={handleEditClick}
        onDelete={handleDeletePermission}
      />
    </div>
  );
};

export default PermissionsPage;
