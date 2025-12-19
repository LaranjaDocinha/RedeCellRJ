import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ReferralPage: React.FC = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [codeRes, historyRes] = await Promise.all([
          fetch('/api/referrals/my-code', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/referrals/history', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const codeData = await codeRes.json();
        const historyData = await historyRes.json();
        console.log('codeData:', codeData); // Debugging
        console.log('historyData:', historyData); // Debugging
        setReferralCode(codeData.referral_code);
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  console.log('referralCode for rendering:', referralCode); // Debugging
  console.log('history for rendering:', history); // Debugging

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Programa de Indicação</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Seu Código de Indicação:</Typography>
          <Typography variant="h4" component="p" sx={{ my: 2 }}>{referralCode}</Typography>
          <Typography variant="h6" sx={{ mt: 4 }}>Histórico de Indicações</Typography>
          <List>
            {history.map((ref, index) => ( // Added index for key
              <ListItem key={ref.id || index}>
                <ListItemText
                  primary={`Indicado: ${ref.referred_customer_id ? String(ref.referred_customer_id) : 'Pendente'}`} // Ensure string conversion
                  secondary={`Status: ${ref.status ? String(ref.status) : 'N/A'}`} // Ensure string conversion
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ReferralPage;
