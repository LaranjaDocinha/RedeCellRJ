import React from 'react';
import { 
  Box, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Security, 
  Phishing, 
  Devices, 
  History, 
  LockReset 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SecuritySettings: React.FC = () => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h6" fontWeight={400} gutterBottom>Segurança da Conta</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Gerencie as configurações de acesso e proteção dos seus dados.
      </Typography>

      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '16px', borderStyle: 'dashed' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" gap={2}>
                    <Security color="primary" />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={400}>Autenticação de Dois Fatores (2FA)</Typography>
                        <Typography variant="caption" color="text.secondary">Adicione uma camada extra de segurança usando seu celular.</Typography>
                    </Box>
                </Box>
                <Button variant="contained" size="small" sx={{ borderRadius: '8px' }}>Configurar</Button>
            </Box>
        </Paper>

        <Divider />

        <Box>
            <Typography variant="subtitle2" fontWeight={400} mb={2}>Dispositivos Conectados</Typography>
            <List sx={{ bgcolor: 'action.hover', borderRadius: '16px' }}>
                <ListItem>
                    <ListItemIcon><Devices /></ListItemIcon>
                    <ListItemText 
                        primary="Windows 11 • Chrome" 
                        secondary="Rio de Janeiro, Brasil • Atual" 
                        primaryTypographyProps={{ fontWeight: 400, fontSize: '0.85rem' }}
                    />
                    <Chip label="ATUAL" size="small" color="success" sx={{ fontWeight: 400, height: 20 }} />
                </ListItem>
                <ListItem>
                    <ListItemIcon><Devices /></ListItemIcon>
                    <ListItemText 
                        primary="iPhone 15 Pro • Safari" 
                        secondary="São Paulo, Brasil • Há 2 dias" 
                        primaryTypographyProps={{ fontWeight: 400, fontSize: '0.85rem' }}
                    />
                    <Button size="small" color="error" sx={{ fontWeight: 400 }}>Encerrar</Button>
                </ListItem>
            </List>
            <Button variant="text" size="small" sx={{ mt: 1, fontWeight: 400 }} color="error">Encerrar todas as outras sessões</Button>
        </Box>

        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(theme.palette.success.main, 0.05), display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloudDone color="success" />
            <Typography variant="caption" fontWeight={400}>Configurações sincronizadas com a nuvem da franquia.</Typography>
        </Box>

        <Box>
            <Typography variant="subtitle2" fontWeight={400} mb={2}>Ações Rápidas</Typography>
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<LockReset />} sx={{ borderRadius: '10px' }}>Alterar Senha</Button>
                <Button variant="outlined" startIcon={<History />} sx={{ borderRadius: '10px' }}>Ver Logs de Acesso</Button>
            </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

import { Stack, Chip } from '@mui/material';
export default SecuritySettings;

