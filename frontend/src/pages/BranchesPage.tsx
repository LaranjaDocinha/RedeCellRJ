import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Stack
} from '@mui/material';
import { 
  FaStore, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const StyledPageContainer = styled(motion.div)`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const StyledPageTitle = styled(motion.h1)`
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 24px;
  letter-spacing: -1px;
`;

interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Omit<Branch, 'id'>>({ name: '', address: '', phone: '', email: '' });
  
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const fetchBranches = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get('/api/branches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBranches(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      addNotification('Erro ao carregar filiais', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleOpenModal = (branch: Branch | null = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({ name: branch.name, address: branch.address || '', phone: branch.phone || '', email: branch.email || '' });
    } else {
      setEditingBranch(null);
      setFormData({ name: '', address: '', phone: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingBranch) {
        await axios.put(`/api/branches/${editingBranch.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        addNotification('Filial atualizada com sucesso!', 'success');
      } else {
        await axios.post('/api/branches', formData, { headers: { Authorization: `Bearer ${token}` } });
        addNotification('Filial criada com sucesso!', 'success');
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (err: any) {
      addNotification('Erro ao salvar filial', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta filial?')) return;
    try {
      await axios.delete(`/api/branches/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      addNotification('Filial excluída com sucesso!', 'success');
      fetchBranches();
    } catch (err: any) {
      addNotification('Erro ao excluir filial', 'error');
    }
  };

  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <StyledPageTitle>Gestão de Filiais</StyledPageTitle>
        <Button 
            variant="contained" 
            startIcon={<FaPlus />} 
            onClick={() => handleOpenModal()}
            sx={{ borderRadius: '12px', px: 3 }}
        >
            Nova Filial
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
      ) : branches.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'action.hover', borderRadius: '24px' }}>
          <FaStore size={48} style={{ opacity: 0.3 }} />
          <Typography variant="body1" color="text.secondary" mt={2}>Nenhuma filial cadastrada.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '24px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 400 }}>NOME DA UNIDADE</TableCell>
                <TableCell sx={{ fontWeight: 400 }}>CONTATO</TableCell>
                <TableCell sx={{ fontWeight: 400 }}>ENDEREÇO</TableCell>
                <TableCell sx={{ fontWeight: 400 }} align="right">AÇÕES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id} hover>
                  <TableCell sx={{ fontWeight: 400 }}>{branch.name}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                        {branch.phone && <Box display="flex" alignItems="center" gap={1}><FaPhone size={10} /> <Typography variant="caption">{branch.phone}</Typography></Box>}
                        {branch.email && <Box display="flex" alignItems="center" gap={1}><FaEnvelope size={10} /> <Typography variant="caption">{branch.email}</Typography></Box>}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FaMapMarkerAlt size={12} color="gray" />
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>{branch.address || 'Não informado'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenModal(branch)}>
                            <FaEdit size={16} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(branch.id)}>
                            <FaTrash size={16} />
                        </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Cadastro/Edição */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 400 }}>{editingBranch ? 'EDITAR FILIAL' : 'NOVA FILIAL'}</DialogTitle>
        <DialogContent>
            <Stack spacing={2} mt={1} minWidth={400}>
                <TextField fullWidth label="Nome da Unidade" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} size="small" required />
                <TextField fullWidth label="E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} size="small" />
                <TextField fullWidth label="Telefone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} size="small" />
                <TextField fullWidth label="Endereço Completo" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} size="small" multiline rows={2} />
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setIsModalOpen(false)} variant="text" color="inherit">Cancelar</Button>
            <Button onClick={handleSave} variant="contained" sx={{ borderRadius: '12px', px: 4 }} disabled={!formData.name}>Salvar Filial</Button>
        </DialogActions>
      </Dialog>
    </StyledPageContainer>
  );
};

export default BranchesPage;

