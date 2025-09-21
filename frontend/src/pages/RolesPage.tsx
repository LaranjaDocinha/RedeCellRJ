import React, { useState, useEffect } from 'react';
import { RoleList } from '../components/RoleList';
import { RoleForm } from '../components/RoleForm';
import { PermissionList } from '../components/PermissionList';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [managingPermissionsForRole, setManagingPermissionsForRole] = useState<Role | undefined>(undefined);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/roles', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setRoles(data);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      addNotification(`Failed to fetch roles: ${error.message}`, 'error');
    }
  };

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

  const handleCreateRole = async (roleData: Omit<Role, 'id'>) => {
    try {
      const response = await fetch('/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(roleData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowRoleForm(false);
      fetchRoles();
      addNotification('Role created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating role:", error);
      addNotification(`Failed to create role: ${error.message}`, 'error');
    }
  };

  const handleUpdateRole = async (id: number, roleData: Omit<Role, 'id'>) => {
    try {
      const response = await fetch(`/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(roleData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingRole(undefined);
      setShowRoleForm(false);
      fetchRoles();
      addNotification('Role updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating role:", error);
      addNotification(`Failed to update role: ${error.message}`, 'error');
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      const response = await fetch(`/roles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchRoles();
      addNotification('Role deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting role:", error);
      addNotification(`Failed to delete role: ${error.message}`, 'error');
    }
  };

  const handleEditRoleClick = (id: number) => {
    const roleToEdit = roles.find((r) => r.id === id);
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setShowRoleForm(true);
    }
  };

  const handleCancelRoleForm = () => {
    setEditingRole(undefined);
    setShowRoleForm(false);
  };

  const handleManagePermissionsClick = (id: number) => {
    const roleToManage = roles.find((r) => r.id === id);
    if (roleToManage) {
      setManagingPermissionsForRole(roleToManage);
    }
  };

  const handleAssignPermission = async (roleId: number, permissionId: number) => {
    try {
      const response = await fetch(`/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ permissionId }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      addNotification('Permission assigned successfully!', 'success');
      // Optionally refresh permissions for the role if needed, or just rely on UI update
    } catch (error: any) {
      console.error("Error assigning permission:", error);
      addNotification(`Failed to assign permission: ${error.message}`, 'error');
    }
  };

  const handleRemovePermission = async (roleId: number, permissionId: number) => {
    try {
      const response = await fetch(`/roles/${roleId}/permissions/${permissionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      addNotification('Permission removed successfully!', 'success');
      // Optionally refresh permissions for the role if needed, or just rely on UI update
    } catch (error: any) {
      console.error("Error removing permission:", error);
      addNotification(`Failed to remove permission: ${error.message}`, 'error');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Role Management</h1>

      {!managingPermissionsForRole ? (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowRoleForm(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Add New Role
            </button>
          </div>

          {showRoleForm && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h2>
              <RoleForm
                initialData={editingRole}
                onSubmit={(data) => {
                  if (editingRole) {
                    handleUpdateRole(editingRole.id, data);
                  } else {
                    handleCreateRole(data);
                  }
                }}
                onCancel={handleCancelRoleForm}
              />
            </div>
          )}

          <RoleList
            roles={roles}
            onEdit={handleEditRoleClick}
            onDelete={handleDeleteRole}
            onManagePermissions={handleManagePermissionsClick}
          />
        </>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Manage Permissions for {managingPermissionsForRole.name}</h2>
          <button
            onClick={() => setManagingPermissionsForRole(undefined)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Back to Roles
          </button>
          <PermissionList
            permissions={permissions} // All available permissions
            onEdit={() => {}} // Not editing permissions directly from here
            onDelete={() => {}} // Not deleting permissions directly from here
          />
          {/* TODO: Add UI to assign/unassign permissions to the current role */}
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold mb-2">Assign/Remove Permissions</h3>
            {/* This is a simplified example. In a real app, you'd have checkboxes or a multi-select */}
            <p>Available Permissions:</p>
            <ul>
              {permissions.map(p => (
                <li key={p.id} className="flex items-center justify-between py-1">
                  <span>{p.name}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleAssignPermission(managingPermissionsForRole.id, p.id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => handleRemovePermission(managingPermissionsForRole.id, p.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
