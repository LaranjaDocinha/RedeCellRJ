import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button, 
  Stack, 
  IconButton, 
  alpha, 
  useTheme,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  FaUserShield, FaPlus, FaCheckCircle, FaLock, FaUsers, FaArrowRight, FaShieldAlt, FaCopy, FaSearch
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

const RolesPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { showNotification } = useNotification();
  
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, pRes] = await Promise.all([
        axios.get('/api/v1/roles', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/permissions', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRoles(rRes.data);
      setPermissions(pRes.data);
      if (rRes.data.length > 0) setSelectedRole(rRes.data[0]);
    } catch (err) {
      showNotification('Erro ao carregar níveis de acesso.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={5}>
        <Box>
            <Typography variant="h4" fontWeight={400} sx={{ letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: 2 }}>
                <FaUserShield color={theme.palette.primary.main} /> Níveis de Acesso
            </Typography>
            <Typography variant="body2" color="text.secondary">Gestão de cargos, hierarquia e permissões do sistema</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<FaCopy />} sx={{ borderRadius: '12px' }}>Clonar Selecionado</Button>
            <Button variant="contained" startIcon={<FaPlus />} sx={{ borderRadius: '12px', px: 3 }}>Criar Novo Cargo</Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 4, borderRadius: '20px', border: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField 
            fullWidth size="small" placeholder="Buscar permissão ou módulo..." 
            InputProps={{
                startAdornment: <InputAdornment position="start"><FaSearch size={14} /></InputAdornment>,
                sx: { borderRadius: '12px', border: 'none', bgcolor: 'action.hover', '& fieldset': { border: 'none' } }
            }}
          />
      </Paper>


      <Grid container spacing={4}>
        {/* Esquerda: Lista de Cargos */}
        <Grid item xs={12} md={4}>
            <Stack spacing={2}>
                {roles.map((role) => (
                    <motion.div key={role.id} whileHover={{ x: 5 }}>
                        <Paper 
                            onClick={() => setSelectedRole(role)}
                            sx={{ 
                                p: 3, 
                                borderRadius: '20px', 
                                cursor: 'pointer',
                                border: `2px solid ${selectedRole?.id === role.id ? theme.palette.primary.main : 'transparent'}`,
                                bgcolor: selectedRole?.id === role.id ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: selectedRole?.id === role.id ? 'primary.main' : 'action.hover' }}>
                                    <FaUsers size={16} />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={400}>{role.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">Colaboradores</Typography>
                                </Box>
                                <FaShieldAlt size={14} style={{ opacity: 0.3 }} />
                            </Stack>
                        </Paper>
                    </motion.div>
                ))}
            </Stack>
        </Grid>

        {/* Direita: Matriz de Permissões */}
        <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: '32px', minHeight: '600px' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h6" fontWeight={400}>Permissões para: {selectedRole?.name}</Typography>
                    <Button size="small" variant="outlined" color="primary">Salvar Alterações</Button>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <List disablePadding>
                    {permissions.map((perm, idx) => (
                        <ListItem 
                            key={perm.id}
                            sx={{ 
                                p: 2, 
                                borderRadius: '16px', 
                                mb: 1, 
                                bgcolor: idx % 2 === 0 ? alpha(theme.palette.action.hover, 0.5) : 'transparent' 
                            }}
                            secondaryAction={
                                <Switch defaultChecked={idx % 3 !== 0} color="primary" />
                            }
                        >
                            <ListItemIcon sx={{ color: theme.palette.primary.main }}><FaLock size={14} /></ListItemIcon>
                            <ListItemText 
                                primary={<Typography variant="subtitle2" fontWeight={400}>{perm.action} {perm.subject}</Typography>}
                                secondary={`Permite realizar a ação de ${perm.action.toLowerCase()} no módulo ${perm.subject}.`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RolesPage;