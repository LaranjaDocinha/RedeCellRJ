import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, 
  IconButton, Divider, Autocomplete, Table, TableHead, 
  TableRow, TableCell, TableBody 
} from '@mui/material';
import { Add, Delete, CloudDownload, AssignmentReturn } from '@mui/icons-material';
import api from '../../services/api';

const RMABorderou: React.FC = () => {
  const [supplier, setSupplier] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { variation_id: '', product_name: '', quantity: 1, reason: '', cost_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!supplier || items.length === 0) return;
    setLoading(true);
    try {
      const res = await api.post('/rma', { supplierId: supplier.id, items, notes });
      alert('RMA Criado com Sucesso!');
      
      // Download automático do borderô
      const pdfRes = await api.get(`/rma/${res.data.id}/borderou`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bordero_rma_${res.data.id}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Reset
      setItems([]);
      setSupplier(null);
      setNotes('');
    } catch (error) {
      console.error(error);
      alert('Erro ao processar RMA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentReturn color="primary" /> Gestão de RMA (Garantia de Fornecedor)
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Autocomplete
                    options={[]} // Aqui viriam os fornecedores do sistema
                    getOptionLabel={(option: any) => option.name}
                    onChange={(_, val) => setSupplier(val)}
                    renderInput={(params) => <TextField {...params} label="Selecionar Fornecedor" />}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField 
                    fullWidth multiline rows={2} label="Observações Gerais" 
                    value={notes} onChange={(e) => setNotes(e.target.value)}
                />
            </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>Itens para Devolução</Typography>
      <Table sx={{ bgcolor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <TableHead>
            <TableRow>
                <TableCell>Variação ID</TableCell>
                <TableCell>Qtd</TableCell>
                <TableCell>Motivo do Defeito</TableCell>
                <TableCell>Custo Unit.</TableCell>
                <TableCell width={50}></TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {items.map((item, idx) => (
                <TableRow key={idx}>
                    <TableCell>
                        <TextField 
                            size="small" value={item.variation_id} 
                            onChange={(e) => updateItem(idx, 'variation_id', e.target.value)} 
                        />
                    </TableCell>
                    <TableCell>
                        <TextField 
                            size="small" type="number" value={item.quantity} 
                            onChange={(e) => updateItem(idx, 'quantity', e.target.value)} 
                        />
                    </TableCell>
                    <TableCell>
                        <TextField 
                            size="small" fullWidth value={item.reason} 
                            onChange={(e) => updateItem(idx, 'reason', e.target.value)} 
                        />
                    </TableCell>
                    <TableCell>
                        <TextField 
                            size="small" type="number" value={item.cost_price} 
                            onChange={(e) => updateItem(idx, 'cost_price', e.target.value)} 
                        />
                    </TableCell>
                    <TableCell>
                        <IconButton color="error" onClick={() => removeItem(idx)}><Delete /></IconButton>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button startIcon={<Add />} onClick={addItem}>Adicionar Item</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button 
            variant="contained" size="large" onClick={handleSubmit} 
            disabled={loading || items.length === 0 || !supplier}
            sx={{ borderRadius: '12px', px: 4 }}
        >
            Gerar Borderô e Registrar
        </Button>
      </Box>
    </Box>
  );
};

export default RMABorderou;