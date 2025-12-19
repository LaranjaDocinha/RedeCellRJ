import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Skeleton, Button, Modal, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface Tier {
  id: number;
  name: string;
  min_points: number;
  description: string;
  benefits: any;
}

const LoyaltyTiersPage: React.FC = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const { token } = useAuth();

  const fetchTiers = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/loyalty-tiers', { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to fetch loyalty tiers');
      const data = await response.json();
      setTiers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, [token]);

  const handleOpenModal = (tier: Tier | null = null) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTier(null);
    setIsModalOpen(false);
  };

  const handleSaveTier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tierData = {
      name: formData.get('name') as string,
      min_points: parseInt(formData.get('min_points') as string, 10),
      description: formData.get('description') as string,
      benefits: JSON.parse(formData.get('benefits') as string || '{}'),
    };

    const url = selectedTier ? `/api/loyalty-tiers/${selectedTier.id}` : '/api/loyalty-tiers';
    const method = selectedTier ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(tierData),
      });
      fetchTiers();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTier = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tier?')) {
      try {
        await fetch(`/api/loyalty-tiers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        fetchTiers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Níveis de Fidelidade</Typography>
        <Button variant="contained" onClick={() => handleOpenModal()}>Novo Nível</Button>
      </Box>
      <Grid container spacing={3}>
        {loading ? (
          Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} md={4} key={index}><Skeleton variant="rectangular" height={200} /></Grid>
          ))
        ) : (
          tiers.map(tier => (
            <Grid item xs={12} md={4} key={tier.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{tier.name}</Typography>
                  <Typography color="text.secondary">{tier.min_points} pontos</Typography>
                  <Typography mt={1}>{tier.description}</Typography>
                  {/* Display benefits here */}
                  <Box mt={2}>
                    <Button size="small" onClick={() => handleOpenModal(tier)}>Editar</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteTier(tier.id)}>Excluir</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" mb={2}>{selectedTier ? 'Editar Nível' : 'Novo Nível'}</Typography>
          <form onSubmit={handleSaveTier}>
            <TextField name="name" label="Nome" defaultValue={selectedTier?.name} fullWidth required sx={{ mb: 2 }} />
            <TextField name="min_points" label="Pontos Mínimos" type="number" defaultValue={selectedTier?.min_points} fullWidth required sx={{ mb: 2 }} />
            <TextField name="description" label="Descrição" defaultValue={selectedTier?.description} fullWidth multiline rows={3} sx={{ mb: 2 }} />
            <TextField name="benefits" label="Benefícios (JSON)" defaultValue={JSON.stringify(selectedTier?.benefits || {}, null, 2)} fullWidth multiline rows={4} sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit" variant="contained">Salvar</Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default LoyaltyTiersPage;