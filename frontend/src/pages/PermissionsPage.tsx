
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import PermissionList from '../components/PermissionList';
import { PermissionForm } from '../components/PermissionForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled'; // Reutilizando componentes estilizados
import { Button } from '../components/Button'; // Importar o componente Button
import Loading from '../components/Loading'; // Importar o componente Loading
import { FaKey } from 'react-icons/fa'; // Ícone para estado vazio

interface Permission {
  id: number;
  name: string;
}

const StyledEmptyState = styled(motion.div)`
  text-align: center;
  padding: 3rem;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5'};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.mode === 'dark' ? '#aaa' : '#666'};
  svg {
    font-size: 2rem;
    opacity: 0.5;
  }
`;

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editingPermission, setEditingPermission] = useState<Permission | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/permissions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPermissions(data);
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      showNotification(`Failed to fetch permissions: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async (permissionData: Omit<Permission, 'id'>) => {
    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(permissionData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchPermissions();
      showNotification('Permission created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating permission:", error);
      showNotification(`Failed to create permission: ${error.message}`, 'error');
    }
  };

  const handleUpdatePermission = async (id: number, permissionData: Omit<Permission, 'id'>) => {
    try {
      const response = await fetch(`/api/permissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(permissionData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingPermission(undefined);
      setShowForm(false);
      fetchPermissions();
      showNotification('Permission updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating permission:", error);
      showNotification(`Failed to update permission: ${error.message}`, 'error');
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;
    try {
      const response = await fetch(`/api/permissions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchPermissions();
      showNotification('Permission deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting permission:", error);
      showNotification(`Failed to delete permission: ${error.message}`, 'error');
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
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledPageTitle
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Permission Management
      </StyledPageTitle>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setShowForm(true)}
              variant="contained"
              color="primary"
              label="Add New Permission"
            />
          </div>

          {showForm && (
            <div className="mb-8">
              <h2 className="text-xl font-normal mb-3">
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

          {permissions.length === 0 && !showForm ? (
            <StyledEmptyState
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FaKey />
              <p>No permissions found. Click "Add New Permission" to get started!</p>
            </StyledEmptyState>
          ) : (
            <PermissionList
              permissions={permissions}
              onEdit={handleEditClick}
              onDelete={handleDeletePermission}
            />
          )}
        </>
      )}
    </StyledPageContainer>
  );
};

export default PermissionsPage;
