import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, List, ListItem, ListItemText, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

const allPermissions: Permission[] = [
  { id: 1, name: 'view_dashboard', description: 'Visualizar Dashboard' },
  { id: 2, name: 'manage_products', description: 'Gerenciar Produtos' },
  { id: 3, name: 'manage_users', description: 'Gerenciar Usuários' },
  { id: 4, name: 'manage_roles', description: 'Gerenciar Cargos' },
  { id: 5, name: 'manage_permissions', description: 'Gerenciar Permissões' },
  { id: 6, name: 'view_reports', description: 'Visualizar Relatórios' },
  { id: 7, name: 'manage_sales', description: 'Gerenciar Vendas' },
  { id: 8, name: 'manage_inventory', description: 'Gerenciar Estoque' },
];

const RolePermissionsPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/rbac/roles', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!token || !newRoleName) return;
    try {
      const res = await fetch('/api/rbac/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newRoleName, permissionIds: selectedPermissions }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Cargo criado com sucesso!');
        setNewRoleName('');
        setSelectedPermissions([]);
        fetchRoles();
      } else {
        alert(data.message || 'Erro ao criar cargo.');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Erro ao criar cargo.');
    }
  };

  const handleUpdateRole = async () => {
    if (!token || !editingRole) return;
    try {
      const res = await fetch(`/api/rbac/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editingRole.name, permissionIds: editingRole.permissions.map(p => p.id) }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Cargo atualizado com sucesso!');
        setEditingRole(null);
        fetchRoles();
      } else {
        alert(data.message || 'Erro ao atualizar cargo.');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Erro ao atualizar cargo.');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!token || !window.confirm('Tem certeza que deseja excluir este cargo?')) return;
    try {
      const res = await fetch(`/api/rbac/roles/${roleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert('Cargo excluído com sucesso!');
        fetchRoles();
      } else {
        alert(data.message || 'Erro ao excluir cargo.');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Erro ao excluir cargo.');
    }
  };

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId) ? prev.filter(id => id !== permissionId) : [...prev, permissionId]
    );
  };

  const handleEditPermissionChange = (permissionId: number) => {
    if (!editingRole) return;
    setEditingRole(prev => {
      if (!prev) return null;
      const newPermissions = prev.permissions.some(p => p.id === permissionId)
        ? prev.permissions.filter(p => p.id !== permissionId)
        : [...prev.permissions, allPermissions.find(p => p.id === permissionId)!];
      return { ...prev, permissions: newPermissions };
    });
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Gerenciamento de Cargos e Permissões</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Criar Novo Cargo</Typography>
        <TextField
          fullWidth
          label="Nome do Cargo"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Permissões:</Typography>
        <Grid container spacing={1}>
                  {allPermissions.map(permission => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={permission.id}>
                      <FormControlLabel                control={
                  <Checkbox
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                  />
                }
                label={permission.description}
              />
            </Grid>
          ))}
        </Grid>
        <Button variant="contained" onClick={handleCreateRole} sx={{ mt: 2 }} disabled={!newRoleName || selectedPermissions.length === 0}>Criar Cargo</Button>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Cargos Existentes</Typography>
        <List>
          {roles.length > 0 ? (
            roles.map(role => (
              <ListItem
                key={role.id}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => setEditingRole(role)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteRole(role.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                {editingRole?.id === role.id ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Nome do Cargo"
                      value={editingRole.name}
                      onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Permissões:</Typography>
                    <Grid container spacing={1}>
                              {allPermissions.map(permission => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={permission.id}>
                                  <FormControlLabel                            control={
                              <Checkbox
                                checked={editingRole.permissions.some(p => p.id === permission.id)}
                                onChange={() => handleEditPermissionChange(permission.id)}
                              />
                            }
                            label={permission.description}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Button onClick={handleUpdateRole} variant="contained" sx={{ mt: 2, mr: 1 }}>Salvar</Button>
                    <Button onClick={() => setEditingRole(null)} variant="outlined" sx={{ mt: 2 }}>Cancelar</Button>
                  </Box>
                ) : (
                  <ListItemText
                    primary={role.name}
                    secondary={role.permissions.map(p => p.description).join(', ')}
                  />
                )}
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="Nenhum cargo encontrado." /></ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default RolePermissionsPage;
