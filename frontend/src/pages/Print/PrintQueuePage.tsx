import React from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { PageContainer } from '../../styles/common.styles';
import { Chip, Card, CardContent, Typography, Button, Grid, CircularProgress, Box } from '@mui/material';
import { Print, CheckCircle, PlayArrow, DoneAll, WhatsApp } from '@mui/icons-material';

const JobCard = styled(Card)<{ status: string }>`
  border-left: 10px solid ${props => {
    switch (props.status) {
      case 'Pendente': return '#95a5a6';
      case 'Imprimindo': return '#3498db';
      case 'Pronto': return '#2ecc71';
      default: return '#eee';
    }
  }};
  transition: transform 0.2s;
  &:hover { transform: translateY(-5px); }
`;

const PrintQueuePage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['print-jobs'],
    queryFn: async () => {
      const res = await api.get('/print/jobs');
      return res.data;
    },
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await api.patch(`/print/jobs/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
    }
  });

  const notifyMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/print/jobs/${id}/notify`);
    },
    onSuccess: () => {
      alert('Cliente notificado via WhatsApp!');
    },
    onError: (error: any) => {
        alert(error.response?.data?.message || 'Falha ao notificar cliente.');
    }
  });

  if (isLoading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Print fontSize="large" color="primary" /> Fila de Produção: Impressão & Xerox
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {jobs?.map((job: any) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <JobCard status={job.status}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6">{job.customer_name}</Typography>
                    <Chip label={job.status} size="small" color={job.status === 'Pronto' ? 'success' : 'default'} />
                </Box>
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    {job.description}
                </Typography>
                <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                    Qtd: {job.quantity}
                </Typography>

                <Box display="flex" gap={1}>
                    {job.status === 'Pendente' && (
                        <Button 
                            variant="outlined" 
                            fullWidth 
                            startIcon={<PlayArrow />} 
                            onClick={() => updateMutation.mutate({ id: job.id, status: 'Imprimindo' })} 
                        >
                            Imprimir
                        </Button>
                    )}
                    {job.status === 'Imprimindo' && (
                        <Button 
                            variant="contained" 
                            color="success" 
                            fullWidth 
                            startIcon={<CheckCircle />} 
                            onClick={() => updateMutation.mutate({ id: job.id, status: 'Pronto' })} 
                        >
                            Pronto
                        </Button>
                    )}
                    {job.status === 'Pronto' && (
                        <>
                            <Button 
                                variant="contained" 
                                color="success" 
                                fullWidth 
                                startIcon={<WhatsApp />} 
                                onClick={() => notifyMutation.mutate(job.id)}
                                sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }} 
                            >
                                Avisar Cliente
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth 
                                startIcon={<DoneAll />} 
                                onClick={() => updateMutation.mutate({ id: job.id, status: 'Entregue' })} 
                            >
                                Entregue
                            </Button>
                        </>
                    )}

                </Box>
              </CardContent>
            </JobCard>
          </Grid>
        ))}
        {jobs?.length === 0 && (
            <Grid item xs={12}>
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 5, color: '#999' }}>
                    Nenhum trabalho na fila no momento.
                </Typography>
            </Grid>
        )}
      </Grid>
    </PageContainer>
  );
};

export default PrintQueuePage;
