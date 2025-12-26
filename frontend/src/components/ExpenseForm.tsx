import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Divider,
  Paper,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  Alert
} from '@mui/material';
import { 
  AttachMoney as MoneyIcon, 
  Description as DescriptionIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Restaurant as FoodIcon,
  DirectionsCar as TransportIcon,
  Inventory as MaterialIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';

interface ExpenseFormData {
  amount: string;
  description: string;
  category: string;
  file: File | null;
}

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
}

const COMMON_CATEGORIES = [
  { label: 'Alimentação', icon: <FoodIcon fontSize="small" /> },
  { label: 'Transporte/Combustível', icon: <TransportIcon fontSize="small" /> },
  { label: 'Material de Escritório', icon: <MaterialIcon fontSize="small" /> },
  { label: 'Estacionamento/Pedágio', icon: <TicketIcon fontSize="small" /> }
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel }) => {
  const theme = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Informe um valor válido.');
      return;
    }
    if (!description) {
      setError('Informe uma descrição.');
      return;
    }
    if (!category) {
      setError('Selecione uma categoria.');
      return;
    }
    
    onSubmit({
      amount,
      description,
      category,
      file
    });
  };

  return (
    <Box p={1}>
      <Stack spacing={3}>
        
        {/* Valor e Categoria */}
        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Valor da Despesa
          </Typography>
          <TextField
            autoFocus
            fullWidth
            placeholder="0,00"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><MoneyIcon color="primary" /></InputAdornment>,
              sx: { borderRadius: '12px', fontSize: '1.2rem' }
            }}
          />
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Categoria
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {COMMON_CATEGORIES.map((cat) => (
              <Chip
                key={cat.label}
                label={cat.label}
                icon={cat.icon}
                onClick={() => setCategory(cat.label)}
                color={category === cat.label ? 'primary' : 'default'}
                variant={category === cat.label ? 'filled' : 'outlined'}
                sx={{ borderRadius: '8px', '& .MuiChip-label': { px: 2 } }}
              />
            ))}
          </Box>
        </Box>

        {/* Descrição */}
        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Descrição Detalhada
          </Typography>
          <TextField
            fullWidth
            placeholder="Ex: Almoço com cliente X..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            InputProps={{
              startAdornment: <InputAdornment position="start" sx={{ mt: 1, alignSelf: 'flex-start' }}><DescriptionIcon color="action" /></InputAdornment>,
              sx: { borderRadius: '12px' }
            }}
          />
        </Box>

        <Divider />

        {/* Upload de Comprovante */}
        <Box>
           <Typography variant="body2" color="text.secondary" mb={1}>
            Comprovante / Recibo
          </Typography>
          <Button
            component="label"
            fullWidth
            sx={{
              border: '2px dashed',
              borderColor: file ? 'primary.main' : 'divider',
              borderRadius: '16px',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: file ? (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'primary.50') : 'background.paper',
              textTransform: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.12)' : 'action.hover'
              }
            }}
          >
            <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
            
            <Avatar sx={{ bgcolor: file ? 'primary.main' : 'action.selected', mb: 1, width: 48, height: 48 }}>
              {file ? <SaveIcon /> : <UploadIcon color="action" />}
            </Avatar>
            
            <Typography color={file ? 'primary' : 'text.primary'}>
              {file ? file.name : 'Clique para anexar o comprovante'}
            </Typography>
            {!file && (
              <Typography variant="caption" color="text.secondary">
                Formatos aceitos: JPG, PNG, PDF
              </Typography>
            )}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Footer */}
        <Box 
          mt={2} 
          p={2} 
          sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
            borderRadius: '16px',
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2,
            alignItems: 'center'
          }}
        >
          <Button 
            onClick={onCancel} 
            color="inherit" 
            sx={{ borderRadius: '10px' }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleSubmit}
            sx={{ borderRadius: '12px', px: 4 }}
          >
            Enviar Solicitação
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
