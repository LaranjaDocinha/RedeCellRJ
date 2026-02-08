import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Tabs, Tab, Paper, Avatar, Stack, Divider, 
  alpha, useTheme, IconButton, Button, Chip, LinearProgress, Tooltip,
  TextField, List, ListItem, ListItemText, ListItemIcon, Button as MuiButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Person as PersonIcon, 
  Security as SecurityIcon, 
  Palette as PaletteIcon, 
  Notifications as NotificationsIcon,
  EmojiEvents, CameraAlt, VerifiedUser, Shield, Devices, Language,
  AccessibilityNew, CloudDone, Visibility, VisibilityOff, Star,
  Payments, CalendarMonth, BugReport, RateReview, GppGood
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SecuritySettings from '../components/settings/SecuritySettings';
import GeneralSettings from './GeneralSettings';

const MyAccountPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [privacyMode, setPrivacyMode] = useState(false);

  const tabs = [
    { label: 'Perfil', icon: <PersonIcon />, content: <ProfileView /> },
    { label: 'Segurança', icon: <SecurityIcon />, content: <SecuritySettings /> },
    { label: 'Finanças', icon: <CommissionsView privacy={privacyMode} />, iconRaw: <Payments /> },
    { label: 'Escala', icon: <WorkScheduleView />, iconRaw: <CalendarMonth /> },
    { label: 'Suporte', icon: <SupportLogsView />, iconRaw: <BugReport /> },
    { label: 'Ajustes', icon: <GeneralSettings />, iconRaw: <PaletteIcon /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h4" fontWeight={400} sx={{ letterSpacing: '-1.5px' }}>Minha Conta</Typography>
            <Chip label="VERIFICADA" color="success" size="small" variant="outlined" icon={<VerifiedUser />} sx={{ fontWeight: 400 }} />
            <Tooltip title="Nível de Confiança: Máximo">
                <IconButton color="success" size="small"><GppGood /></IconButton>
            </Tooltip>
        </Stack>
        <MuiButton 
            variant="outlined" 
            startIcon={privacyMode ? <VisibilityOff /> : <Visibility />}
            onClick={() => setPrivacyMode(!privacyMode)}
            sx={{ borderRadius: '12px', fontWeight: 400 }}
        >
            {privacyMode ? 'MODO PRIVADO: ON' : 'MODO PRIVADO: OFF'}
        </MuiButton>
      </Stack>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 4, borderRadius: '28px', textAlign: 'center', boxShadow: theme.shadows[4] }}>
            <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto', mb: 3 }}>
                <Avatar sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: 'primary.main' }}>{user?.name?.[0]}</Avatar>
                <IconButton size="small" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', boxShadow: 2 }}><CameraAlt fontSize="small" /></IconButton>
            </Box>
            <Typography variant="h5" fontWeight={400}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={400}>Ele/Dele • {user?.email}</Typography>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ textAlign: 'left' }}>
                <Stack direction="row" justifyContent="space-between" mb={1}><Typography variant="caption" fontWeight={400} color="primary">NÍVEL 12</Typography><Typography variant="caption">2.550 / 3.000 XP</Typography></Stack>
                <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4, mb: 3 }} />
                <Stack spacing={2}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', display: 'flex', gap: 2, alignItems: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: theme.palette.primary.main }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}><Star sx={{ fontSize: 18 }} /></Avatar>
                        <Box><Typography variant="caption" fontWeight={400} color="primary.main">COLABORADOR DE ELITE</Typography></Box>
                    </Paper>
                </Stack>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper sx={{ borderRadius: '28px', overflow: 'hidden' }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
                {tabs.map((tab, idx) => (
                    <Tab key={idx} label={tab.label} icon={tab.iconRaw || tab.icon} iconPosition="start" sx={{ fontWeight: 400, minHeight: 64 }} />
                ))}
            </Tabs>
            <Box sx={{ p: 4 }}>
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                        {tabs[activeTab].content}
                    </motion.div>
                </AnimatePresence>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const ProfileView = () => (
    <Box>
        <Typography variant="h6" fontWeight={400} gutterBottom>Dados Pessoais</Typography>
        <Grid container spacing={3} mt={1}>
            <Grid item xs={12} md={6}><Typography variant="caption" color="text.secondary" fontWeight={400}>NOME COMPLETO</Typography><Typography variant="body1">João da Silva Redecell</Typography></Grid>
            <Grid item xs={12} md={6}><Typography variant="caption" color="text.secondary" fontWeight={400}>TELEFONE</Typography><Typography variant="body1">(21) 99999-9999</Typography></Grid>
        </Grid>
        <Box sx={{ mt: 6, p: 3, borderRadius: '20px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={400} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AccessibilityNew fontSize="small" /> Acessibilidade e Idioma</Typography>
            <Stack direction="row" spacing={2}>
                <MuiButton variant="outlined" startIcon={<Language />}>Português</MuiButton>
                <MuiButton variant="outlined" startIcon={<AccessibilityNew />}>Contraste</MuiButton>
            </Stack>
        </Box>
    </Box>
);

const CommissionsView = ({ privacy }: { privacy: boolean }) => (
    <Box>
        <Typography variant="h6" fontWeight={400} gutterBottom>Comissões e Metas</Typography>
        <Stack spacing={3} mt={3}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: '20px' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={400}>SALDO DISPONÍVEL</Typography>
                <Typography variant="h4" fontWeight={400} color="success.main">{privacy ? '••••••' : 'R$ 1.250,40'}</Typography>
            </Paper>
            <Box>
                <Typography variant="subtitle2" fontWeight={400} mb={1}>Simulador de Bônus</Typography>
                <Typography variant="body2" color="text.secondary">Se você vender mais <strong>R$ 2.000,00</strong> hoje, seu bônus sobe para <strong>R$ 1.500,00</strong>!</Typography>
            </Box>
        </Stack>
    </Box>
);

const WorkScheduleView = () => (
    <Box>
        <Typography variant="h6" fontWeight={400} mb={3}>Minha Escala</Typography>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '24px' }}>
            <Stack spacing={2}>
                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((day) => (
                    <Box key={day} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={400}>{day}</Typography>
                        <Chip label="09:00 - 18:00" size="small" variant="outlined" />
                    </Box>
                ))}
            </Stack>
        </Paper>
    </Box>
);

const SupportLogsView = () => (
    <Box>
        <Typography variant="h6" fontWeight={400} mb={3}>Suporte Técnico</Typography>
        <Stack spacing={3}>
            <Box>
                <Typography variant="subtitle2" fontWeight={400} mb={1}>Relatar Bug</Typography>
                <TextField fullWidth multiline rows={3} placeholder="Descreva o problema..." variant="outlined" />
                <Button variant="contained" startIcon={<RateReview />} sx={{ mt: 2 }}>Enviar</Button>
            </Box>
        </Stack>
    </Box>
);

export default MyAccountPage;
