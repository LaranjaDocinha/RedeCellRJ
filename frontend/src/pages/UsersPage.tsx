import React, { useState, useEffect } from 'react';
import { UserList } from '../components/UserList';
import { UserForm } from '../components/UserForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

import { User } from '../types/user';

interface Role {
  id: number;
  name: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      addNotification(`Failed to fetch users: ${error.message}`, 'error');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Role[] = await response.json();
      setAvailableRoles(data.map(role => role.name));
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      addNotification(`Failed to fetch roles: ${error.message}`, 'error');
    }
  };

  const handleCreateUser = async (userData: Omit<User, 'id'>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchUsers();
      addNotification('User created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating user:", error);
      addNotification(`Failed to create user: ${error.message}`, 'error');
    }
  };

  const handleUpdateUser = async (id: number, userData: Omit<User, 'id'>) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingUser(undefined);
      setShowForm(false);
      fetchUsers();
      addNotification('User updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating user:", error);
      addNotification(`Failed to update user: ${error.message}`, 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchUsers();
      addNotification('User deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting user:", error);
      addNotification(`Failed to delete user: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const userToEdit = users.find((u) => u.id === id);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingUser(undefined);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-normal mb-4">User Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-normal py-2 px-4 rounded"
        >
          Add New User
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-normal mb-3">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <UserForm
            initialData={editingUser}
            onSubmit={(data) => {
              if (editingUser) {
                handleUpdateUser(editingUser.id, data);
              } else {
                handleCreateUser(data);
              }
            }}
            onCancel={handleCancelForm}
            availableRoles={availableRoles}
          />
        </div>
      )}

      <UserList
        users={users}
        onEdit={handleEditClick}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default UsersPage;
