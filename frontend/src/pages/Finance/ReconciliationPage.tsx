import React, { useState } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Chip, IconButton, Stack, Alert
} from '@mui/material';
import { FiUpload, FiCheck, FiX, FiLink } from 'react-icons/fi';
import api from '../../services/api';
import { PageTransition } from '../../components/ui/PageTransition';

const ReconciliationPage: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('ofx', file);

    setLoading(true);
    try {
      const { data } = await api.post('/api/v1/finance/reconcile/ofx', formData);
      setResults(data);
    } catch (error) {
      console.error('Erro ao processar OFX', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Box p={4}>
        <Typography variant="h4" gutterBottom fontWeight={700}>Conciliação Bancária</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Suba seu arquivo OFX para cruzar os lançamentos bancários com o sistema.
        </Typography>

        <Paper sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: 'divider', mb: 4 }}>
          <input
            accept=".ofx"
            style={{ display: 'none' }}
            id="ofx-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="ofx-upload">
            <Button variant="contained" component="span" startIcon={<FiUpload />} size="large">
              Selecionar Arquivo OFX
            </Button>
          </label>
        </Paper>

        {results.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição Banco</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Sugestão no Sistema</TableCell>
                <TableCell>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((res, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(res.bankTransaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{res.bankTransaction.description}</TableCell>
                  <TableCell sx={{ color: res.bankTransaction.amount > 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                    R$ {res.bankTransaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {res.suggestedMatch ? (
                      <Chip 
                        icon={<FiLink />} 
                        label={`Venda #${res.suggestedMatch.id} - R$ ${res.suggestedMatch.amount}`} 
                        color="primary" 
                        variant="outlined" 
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">Nenhum match encontrado</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton color="success" disabled={!res.suggestedMatch}><FiCheck /></IconButton>
                      <IconButton color="error"><FiX /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </PageTransition>
  );
};

export default ReconciliationPage;