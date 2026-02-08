import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, Divider, List, ListItem, ListItemText, Checkbox, 
  Container, AppBar, Toolbar, LinearProgress 
} from '@mui/material';
import { FaCheck, FaTimes, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const QuoteApprovalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    const fetchQuote = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/public/quotes/${token}`);
            setQuote(res.data);
            setSelectedItems(res.data.items.filter((i: any) => !i.is_optional || i.is_accepted).map((i: any) => i.id));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    if (token) fetchQuote();
  }, [token]);

  const handleToggle = (id: number) => {
      if (selectedItems.includes(id)) {
          setSelectedItems(prev => prev.filter(i => i !== id));
      } else {
          setSelectedItems(prev => [...prev, id]);
      }
  };

  const handleAction = async (action: 'accept' | 'reject') => {
      try {
          await axios.post(`${API_BASE_URL}/public/quotes/${token}/action`, { action, itemIds: selectedItems });
          alert(action === 'accept' ? 'Orçamento aprovado com sucesso!' : 'Orçamento rejeitado.');
          window.location.reload();
      } catch (e) {
          alert('Erro ao processar ação.');
      }
  };

  if (loading) return <LinearProgress />;
  if (!quote) return <Typography align="center" mt={4}>Orçamento não encontrado.</Typography>;

  const total = quote.items
    .filter((i: any) => selectedItems.includes(i.id))
    .reduce((sum: number, i: any) => sum + Number(i.unit_price * i.quantity), 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>RedecellRJ - Orçamento #{quote.id}</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: '16px' }}>
            <Typography variant="h4" gutterBottom>Olá, Cliente!</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Confira os detalhes do seu orçamento abaixo. Você pode selecionar os itens opcionais.
            </Typography>

            <List>
                {quote.items.map((item: any) => (
                    <React.Fragment key={item.id}>
                        <ListItem 
                            secondaryAction={
                                <Typography variant="h6">R$ {Number(item.unit_price).toFixed(2)}</Typography>
                            }
                        >
                            {item.is_optional && (
                                <Checkbox 
                                    edge="start"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => handleToggle(item.id)}
                                />
                            )}
                            <ListItemText 
                                primary={item.product_name || `Produto #${item.product_id}`} // Assuming join or product name available
                                secondary={item.is_optional ? "Opcional" : "Obrigatório"} 
                            />
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, mb: 4 }}>
                <Typography variant="h3" color="primary">Total: R$ {total.toFixed(2)}</Typography>
            </Box>

            {quote.status === 'pending' ? (
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Button fullWidth variant="outlined" color="error" size="large" onClick={() => handleAction('reject')} startIcon={<FaTimes />}>
                            Rejeitar
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button fullWidth variant="contained" color="success" size="large" onClick={() => handleAction('accept')} startIcon={<FaCheck />}>
                            Aprovar Orçamento
                        </Button>
                    </Grid>
                </Grid>
            ) : (
                <Box textAlign="center" p={2} bgcolor="action.hover" borderRadius="12px">
                    <Typography variant="h6" color={quote.status === 'accepted' ? 'success.main' : 'error.main'}>
                        Este orçamento foi {quote.status === 'accepted' ? 'APROVADO' : 'REJEITADO'}.
                    </Typography>
                </Box>
            )}
            
            <Box mt={4} textAlign="center">
                <Button startIcon={<FaWhatsapp />} color="success">Falar com um atendente</Button>
            </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default QuoteApprovalPage;
