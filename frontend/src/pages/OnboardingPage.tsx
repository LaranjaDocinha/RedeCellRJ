import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Checkbox, List, ListItem, ListItemText, Paper, Select, MenuItem, FormControl, InputLabel, Button, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const OnboardingPage: React.FC = () => {
  const [myProgress, setMyProgress] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedChecklist, setSelectedChecklist] = useState<string>('');
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const { user, token } = useAuth();

  const isManager = useMemo(() => user?.permissions.some((p: any) => p.action === 'manage' && p.subject === 'Onboarding'), [user]);

  // Fetch my progress
  useEffect(() => {
    const fetchMyProgress = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/onboarding/me', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setMyProgress(data);
      } catch (error) {
        console.error('Error fetching my progress:', error);
      }
    };
    fetchMyProgress();
  }, [token]);

  // Fetch data for manager view
  useEffect(() => {
    const fetchManagerData = async () => {
      if (!token || !isManager) return;
      try {
        const [usersRes, checklistsRes] = await Promise.all([
          fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/onboarding/checklists', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const usersData = await usersRes.json();
        const checklistsData = await checklistsRes.json();
        setUsers(usersData);
        setChecklists(checklistsData);
      } catch (error) {
        console.error('Error fetching manager data:', error);
      }
    };
    fetchManagerData();
  }, [token, isManager]);

  // Fetch progress for selected user
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!token || !isManager || !selectedUser) return;
      try {
        const res = await fetch(`/api/onboarding/progress/${selectedUser}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setUserProgress(data);
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };
    fetchUserProgress();
  }, [token, isManager, selectedUser]);

  const handleAssignChecklist = async () => {
    if (!token || !selectedUser || !selectedChecklist) return;
    try {
      await fetch('/api/onboarding/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUser, checklistId: selectedChecklist })
      });
      // Refresh progress
      const res = await fetch(`/api/onboarding/progress/${selectedUser}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUserProgress(data);
    } catch (error) {
      console.error('Error assigning checklist:', error);
    }
  };

  const handleCompleteItem = async (itemId: number) => {
    if (!token) return;
    try {
        await fetch('/api/onboarding/me/complete-item', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ itemId })
        });
        // Optimistically update UI
        setMyProgress(prev => prev.map(item => item.item_id === itemId ? { ...item, completed: true } : item));
    } catch (error) {
        console.error('Error completing item:', error);
    }
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Onboarding</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={isManager ? 6 : 12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Meu Checklist de Onboarding</Typography>
            <List>
              {myProgress.length > 0 ? myProgress.map(item => (
                <ListItem key={item.item_id} secondaryAction={<Checkbox edge="end" checked={item.completed} onChange={() => handleCompleteItem(item.item_id)} disabled={item.completed} />}>
                  <ListItemText primary={item.item_name} />
                </ListItem>
              )) : <Typography>Nenhum checklist atribuído.</Typography>}
            </List>
          </Paper>
        </Grid>

        {isManager && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Gerenciar Onboarding de Funcionários</Typography>
              <FormControl fullWidth sx={{ my: 2 }}>
                <InputLabel>Funcionário</InputLabel>
                <Select value={selectedUser} label="Funcionário" onChange={e => setSelectedUser(e.target.value)}>
                  {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                </Select>
              </FormControl>
              {selectedUser && (
                <>
                  <FormControl fullWidth sx={{ my: 2 }}>
                    <InputLabel>Checklist</InputLabel>
                    <Select value={selectedChecklist} label="Checklist" onChange={e => setSelectedChecklist(e.target.value)}>
                      {checklists.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Button variant="contained" onClick={handleAssignChecklist} disabled={!selectedChecklist}>Atribuir Checklist</Button>
                  <List sx={{mt: 2}}>
                    <Typography variant="subtitle1">Progresso:</Typography>
                    {userProgress.length > 0 ? userProgress.map(item => (
                        <ListItem key={item.item_id}>
                            <ListItemText primary={item.item_name} secondary={item.completed ? `Concluído em ${new Date(item.completed_at).toLocaleDateString()}` : 'Pendente'} />
                        </ListItem>
                    )) : <Typography>Nenhum checklist atribuído para este usuário.</Typography>}
                  </List>
                </>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default OnboardingPage;
