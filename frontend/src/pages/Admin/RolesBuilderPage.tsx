import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Button,
  TextField,
  IconButton,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SelectChangeEvent,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import * as rolesService from '../services/rolesService';
import type { Role, Permission } from '../services/rolesService';

// --- Mock Auth Token (Replace with actual auth context/logic) ---
const DUMMY_AUTH_TOKEN = 'your_jwt_token_here';

const RolesBuilderPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedRoles, fetchedPermissions] = await Promise.all([
        rolesService.fetchAllRoles(DUMMY_AUTH_TOKEN),
        rolesService.fetchAllPermissions(DUMMY_AUTH_TOKEN),
      ]);
      setRoles(fetchedRoles);
      setAllPermissions(fetchedPermissions);
      if (fetchedRoles.length > 0) {
        setSelectedRoleId(fetchedRoles[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const selectedRole = useMemo(() => {
    return roles.find(r => r.id === selectedRoleId);
  }, [roles, selectedRoleId]);

  const handleRoleSelectChange = (event: SelectChangeEvent<number>) => {
    setSelectedRoleId(event.target.value as number);
  };

  const handlePermissionChange = async (permissionId: number, isEnabled: boolean) => {
    if (!selectedRole) return;

    const currentPermissionIds = selectedRole.permissions.map(p => p.id);
    const newPermissionIds = isEnabled
      ? [...currentPermissionIds, permissionId]
      : currentPermissionIds.filter(id => id !== permissionId);

    try {
      const updatedRole = await rolesService.updateRole(DUMMY_AUTH_TOKEN, selectedRole.id, {
        permissionIds: newPermissionIds,
      });
      setRoles(prevRoles => prevRoles.map(r => (r.id === updatedRole.id ? updatedRole : r)));
    } catch (err: any) {
      setError(err.message || 'Failed to update permission.');
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const newRole = await rolesService.createRole(DUMMY_AUTH_TOKEN, { name: newRoleName });
      setRoles(prevRoles => [...prevRoles, newRole]);
      setSelectedRoleId(newRole.id);
      setNewRoleName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create role.');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await rolesService.deleteRole(DUMMY_AUTH_TOKEN, roleId);
        setRoles(prevRoles => prevRoles.filter(r => r.id !== roleId));
        if (selectedRoleId === roleId) {
          setSelectedRoleId(roles.length > 1 ? roles[0].id : null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete role.');
      }
    }
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>
        Roles & Permissions Builder
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Roles List */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Roles</Typography>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              label="New Role Name"
              variant="outlined"
              size="small"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              fullWidth
            />
            <IconButton color="primary" onClick={handleCreateRole} disabled={!newRoleName.trim()}>
              <Add />
            </IconButton>
          </Box>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Select Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={selectedRoleId ?? ''}
              label="Select Role"
              onChange={handleRoleSelectChange}
            >
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {role.name}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Permissions List */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Permissions for {selectedRole ? `"${selectedRole.name}"` : '...'}
          </Typography>
          {selectedRole ? (
            <List sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {allPermissions.map(permission => {
                const isEnabled = selectedRole.permissions.some(p => p.id === permission.id);
                return (
                  <ListItem key={permission.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isEnabled}
                          onChange={e => handlePermissionChange(permission.id, e.target.checked)}
                        />
                      }
                      label={`${permission.action}: ${permission.subject}`}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography>Select a role to see its permissions.</Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RolesBuilderPage;