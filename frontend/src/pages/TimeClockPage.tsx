import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const TimeClockPage: React.FC = () => {
  const [latestEntry, setLatestEntry] = useState<any>(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [myEntries, setMyEntries] = useState<any[]>([]);
  const [branchEntries, setBranchEntries] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const { user, token } = useAuth();

  const isManager = useMemo(() => user?.permissions.some((p: any) => p.action === 'manage' && p.subject === 'TimeClock'), [user]);

  // Fetch latest entry to determine clock-in status
  useEffect(() => {
    const fetchLatestEntry = async () => {
      if (!token || !user) return;
      try {
        const res = await fetch('/api/time-clock/me/latest', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setLatestEntry(data);
        setIsClockedIn(data && !data.clock_out_time);
      } catch (error) {
        console.error('Error fetching latest entry:', error);
      }
    };
    fetchLatestEntry();
  }, [token, user]);

  // Fetch user's own entries
  useEffect(() => {
    const fetchMyEntries = async () => {
        if (!token || !user) return;
        const start = moment().startOf('week').toISOString();
        const end = moment().endOf('week').toISOString();
        try {
            const res = await fetch(`/api/time-clock/me?startDate=${start}&endDate=${end}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setMyEntries(data);
        } catch (error) {
            console.error('Error fetching my entries:', error);
        }
    }
    fetchMyEntries();
  }, [token, user]);

  // Fetch branch entries if manager
  useEffect(() => {
    const fetchBranchEntries = async () => {
      if (!token || !isManager || !selectedBranch) return;
      const start = moment().startOf('week').toISOString();
      const end = moment().endOf('week').toISOString();
      try {
        const res = await fetch(`/api/time-clock/branches/${selectedBranch}?startDate=${start}&endDate=${end}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setBranchEntries(data);
      } catch (error) {
        console.error('Error fetching branch entries:', error);
      }
    };
    fetchBranchEntries();
  }, [token, isManager, selectedBranch]);

    // Fetch branches for manager filter
    useEffect(() => {
        const fetchBranches = async () => {
            if (!token || !isManager) return;
            try {
                const res = await fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setBranches(data);
                if(data.length > 0) setSelectedBranch(data[0].id);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        }
        fetchBranches();
    }, [token, isManager]);

  const handleClock = async () => {
    if (!token || !user) return;
    const url = isClockedIn ? '/api/time-clock/clock-out' : '/api/time-clock/clock-in';
    const body = isClockedIn ? {} : { branchId: user.branch_id }; // Assuming user has a branch_id

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      // Refresh latest entry
      window.location.reload();
    } catch (error) {
      console.error('Error clocking in/out:', error);
    }
  };

  return (
    <Box p={3}>
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Paper sx={{p: 2, textAlign: 'center'}}>
                    <Typography variant="h5">Ponto Eletrônico</Typography>
                    <Button variant="contained" color={isClockedIn ? 'error' : 'success'} onClick={handleClock} sx={{my: 2}}>
                        {isClockedIn ? 'Registrar Saída' : 'Registrar Entrada'}
                    </Button>
                    {latestEntry && (
                        <Typography variant="body2">
                            Último registro: {moment(latestEntry.clock_in_time).format('DD/MM/YYYY HH:mm')}
                            {latestEntry.clock_out_time && ` - ${moment(latestEntry.clock_out_time).format('HH:mm')}`}
                        </Typography>
                    )}
                </Paper>
                 <Paper sx={{p: 2, mt: 2}}>
                    <Typography variant="h6">Minhas Entradas (Semana)</Typography>
                    <List>
                        {myEntries.map(entry => (
                            <ListItem key={entry.id}>
                                <ListItemText primary={moment(entry.clock_in_time).format('DD/MM/YYYY HH:mm')} secondary={entry.clock_out_time ? `Saída: ${moment(entry.clock_out_time).format('HH:mm')}` : 'Em andamento'} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grid>
            {isManager && (
                <Grid item xs={12} md={8}>
                    <Paper sx={{p: 2}}>
                        <Typography variant="h6">Entradas da Filial</Typography>
                        <FormControl fullWidth sx={{my: 2}}>
                            <InputLabel>Filial</InputLabel>
                            <Select value={selectedBranch} label="Filial" onChange={(e) => setSelectedBranch(e.target.value)}>
                                {branches.map(branch => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <List>
                            {branchEntries.map(entry => (
                                <ListItem key={entry.id}>
                                    <ListItemText primary={`${entry.user_name} - ${moment(entry.clock_in_time).format('DD/MM/YYYY HH:mm')}`} secondary={entry.clock_out_time ? `Saída: ${moment(entry.clock_out_time).format('HH:mm')}` : 'Em andamento'} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            )}
        </Grid>
    </Box>
  );
};

export default TimeClockPage;
