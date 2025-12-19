import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Modal, Tabs, Tab, List, ListItem, ListItemText, Paper, TextField, Rating } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const PerformanceReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const { user, token } = useAuth();

  const isManager = useMemo(() => user?.permissions.some((p: any) => p.action === 'manage' && p.subject === 'PerformanceReviews'), [user]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!token) return;
      setLoading(true);
      let url = '/api/performance-reviews';
      if (activeTab === 0 && user) {
        url += `?userId=${user.id}`;
      } else if (activeTab === 1 && user) {
        url += `?reviewerId=${user.id}`;
      }

      try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token, user, activeTab]);

  useEffect(() => {
    const fetchUsers = async () => {
        if (!token || !isManager) return;
        try {
            const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }
    fetchUsers();
  }, [token, isManager]);

  const handleOpenModal = (review: any = null) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!token) return;
    const method = selectedReview ? 'PUT' : 'POST';
    const url = selectedReview ? `/api/performance-reviews/${selectedReview.id}` : '/api/performance-reviews';
    const body = {
        ...formData,
        reviewer_id: user?.id
    };

    try {
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        setIsModalOpen(false);
        // Refresh reviews
        // This is a simplified refresh. A more robust solution would be better.
        window.location.reload();
    } catch (error) {
        console.error('Error saving review:', error);
    }
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>Avaliações de Desempenho</Typography>
        {isManager && <Button variant="contained" onClick={() => handleOpenModal()}>Agendar Avaliação</Button>}
      </Box>
      <Paper>
        {isManager && (
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
                <Tab label="Minhas Avaliações" />
                <Tab label="Avaliações da Equipe" />
            </Tabs>
        )}
        <List>
          {loading ? <Typography>Carregando...</Typography> : reviews.map(review => (
            <ListItem button key={review.id} onClick={() => handleOpenModal(review)}>
              <ListItemText 
                primary={`Avaliação de ${review.user_name}`}
                secondary={`Data: ${new Date(review.review_date).toLocaleDateString()} - Status: ${review.status}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {isModalOpen && <ReviewModal review={selectedReview} users={users} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
    </Box>
  );
};

const ReviewModal = ({ review, users, onSave, onClose }: any) => {
    const [formData, setFormData] = useState(review || { user_id: '', review_date: '', goals: '', strengths: '', areas_for_improvement: '', overall_rating: 3, comments: '', status: 'scheduled' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    return (
        <Modal open onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '90vh', overflowY: 'auto' }}>
                <Typography variant="h6">{review ? 'Editar' : 'Agendar'} Avaliação</Typography>
                <FormControl fullWidth sx={{ my: 2 }}>
                    <InputLabel>Funcionário</InputLabel>
                    <Select name="user_id" value={formData.user_id} label="Funcionário" onChange={handleChange}>
                        {users.map(user => <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <TextField fullWidth name="review_date" label="Data da Avaliação" type="date" value={formData.review_date} onChange={handleChange} sx={{ my: 2 }} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth name="goals" label="Metas" multiline rows={3} value={formData.goals} onChange={handleChange} sx={{ my: 2 }} />
                <TextField fullWidth name="strengths" label="Pontos Fortes" multiline rows={3} value={formData.strengths} onChange={handleChange} sx={{ my: 2 }} />
                <TextField fullWidth name="areas_for_improvement" label="Áreas a Melhorar" multiline rows={3} value={formData.areas_for_improvement} onChange={handleChange} sx={{ my: 2 }} />
                <Typography gutterBottom>Avaliação Geral</Typography>
                <Rating name="overall_rating" value={formData.overall_rating} onChange={(e, newValue) => setFormData({...formData, overall_rating: newValue})} />
                <TextField fullWidth name="comments" label="Comentários Adicionais" multiline rows={3} value={formData.comments} onChange={handleChange} sx={{ my: 2 }} />
                <FormControl fullWidth sx={{ my: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                        <MenuItem value="scheduled">Agendada</MenuItem>
                        <MenuItem value="completed">Concluída</MenuItem>
                    </Select>
                </FormControl>
                <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button onClick={onClose} sx={{ mr: 1 }}>Cancelar</Button>
                    <Button variant="contained" onClick={() => onSave(formData)}>Salvar</Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default PerformanceReviewsPage;
