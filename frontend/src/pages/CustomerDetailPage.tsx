import React, { useState }mport { useParams, Link, useLoaderData, useNavigation } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, Modal, Tabs, Tab } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import CommunicationTimeline from '../components/CommunicationTimeline';
import CommunicationForm from '../components/CommunicationForm';
import PurchaseSuggestions from '../components/PurchaseSuggestions';
import ChurnRiskIndicator from '../components/Customer/ChurnRiskIndicator';
import CollaborativeRecommendations from '../components/Customer/CollaborativeRecommendations';

interface CustomerDetailLoaderData {
  customer: any;
  communications: any[];
}

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customer, communications: initialCommunications } = useLoaderData() as CustomerDetailLoaderData;
  const navigation = useNavigation();
  const [communications, setCommunications] = useState(initialCommunications); // State for communications that can be updated
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { token } = useAuth(); // Still need token for mutations or non-loader fetches

  // React Router handles loading state for the loader
  const isLoading = navigation.state === 'loading';

  // We need a way to refetch communications if we add one, since loader only runs on navigation
  const refetchCommunications = async () => {
    if (!id || !token) return;
    try {
      const commsRes = await fetch(`/api/customers/${id}/communications`, { headers: { Authorization: `Bearer ${token}` } });
      if (!commsRes.ok) throw new Error('Failed to refetch customer communications');
      const commsData = await commsRes.json();
      setCommunications(commsData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCommunication = async (data: any) => {
    setIsModalOpen(false);
    await refetchCommunications(); // Refetch after adding new communication
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!customer) {
    return <Typography>Cliente não encontrado.</Typography>;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>{customer.name}</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Detalhes</Typography>
            <Typography>Email: {customer.email}</Typography>
            <Typography>Telefone: {customer.phone}</Typography>
            <Typography>Endereço: {customer.address}</Typography>
            <Typography>CPF: {customer.cpf}</Typography>
            <Typography>Data de Nascimento: {customer.birth_date ? new Date(customer.birth_date).toLocaleDateString() : 'N/A'}</Typography>
            <Typography>Segmento RFM: {customer.rfm_segment || 'N/A'}</Typography>
            <Typography>Pontos de Fidelidade: {customer.loyalty_points || 0}</Typography>
            <Typography>Nível de Fidelidade: {customer.loyalty_tier_id || 'N/A'}</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} component={Link} to={`/customers/${customer.id}/wallet`}>Ver Carteira</Button>
          </Paper>
          <ChurnRiskIndicator customerId={id as string} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="customer details tabs">
              <Tab label="Comunicações" />
              <Tab label="Sugestões de Compra" />
              <Tab label="Recomendações" /> {/* Nova Aba */}
            </Tabs>
            <Box mt={2}>
              {activeTab === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Histórico de Comunicação</Typography>
                    <Button variant="contained" onClick={() => setIsModalOpen(true)}>Adicionar Registro</Button>
                  </Box>
                  <CommunicationTimeline communications={communications} />
                </Box>
              )}
              {activeTab === 1 && (
                <PurchaseSuggestions customerId={customer.id} />
              )}
              {activeTab === 2 && ( // Conteúdo da nova aba
                <CollaborativeRecommendations customerId={id as string} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <CommunicationForm customerId={customer.id} onSubmit={handleAddCommunication} onCancel={() => setIsModalOpen(false)} />
        </Box>
      </Modal>
    </Box>
  );
};

export default CustomerDetailPage;