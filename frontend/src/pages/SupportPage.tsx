import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Grid, 
  Paper, 
  Stack, 
  alpha, 
  useTheme,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search, FaBook, FaTools, FaShieldAlt, FaQuestionCircle,
  FaFilePdf, FaChevronRight, FaLifeRing, FaPlayCircle, FaMoon, FaSun, FaRobot, FaStream
} from 'react-icons/fa';

// ... inside component
      <Box sx={{ position: 'fixed', top: 80, left: 40, zIndex: 100 }}>
          <Tooltip title="Resumo IA do Artigo">
              <Fab color="secondary" size="small">
                  <FaRobot />
              </Fab>
          </Tooltip>
      </Box>

      {/* 6.24 Barra de Progresso de Leitura */}
      <Box sx={{ position: 'fixed', top: 64, left: 0, right: 0, height: 4, zIndex: 1000 }}>
          <LinearProgress variant="determinate" value={45} sx={{ height: '100%' }} />
      </Box>
import { motion, AnimatePresence } from 'framer-motion';
import { Accordion } from '../components/Accordion';

const SupportPage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [bancadaMode, setBancadaMode] = useState(false);

  const supportCategories = [
    { title: 'Técnico', icon: <FaTools />, color: theme.palette.primary.main, count: 12 },
    { title: 'Procedimentos', icon: <FaBook />, color: theme.palette.secondary.main, count: 8 },
    { title: 'Garantia', icon: <FaShieldAlt />, color: theme.palette.success.main, count: 5 },
    { title: 'Geral', icon: <FaQuestionCircle />, color: theme.palette.info.main, count: 15 },
  ];

  return (
    <Box sx={{ 
        p: { xs: 2, md: 4 }, 
        bgcolor: bancadaMode ? '#0a0a0a' : 'background.default', 
        color: bancadaMode ? '#fff' : 'inherit',
        minHeight: '100vh',
        transition: 'all 0.3s'
    }}>
      
      {/* 6.15 Modo Bancada Toggle */}
      <Box sx={{ position: 'fixed', top: 80, right: 40, zIndex: 100 }}>
          <Button 
            variant="contained" 
            color={bancadaMode ? "secondary" : "primary"}
            onClick={() => setBancadaMode(!bancadaMode)}
            startIcon={bancadaMode ? <FaSun /> : <FaMoon />}
            sx={{ borderRadius: '20px', fontWeight: 400, boxShadow: theme.shadows[10] }}
          >
              {bancadaMode ? 'MODO NORMAL' : 'MODO BANCADA'}
          </Button>
      </Box>

      {/* Header Centralizado */}
      <Box sx={{ textAlign: 'center', mb: 8, mt: 4 }}>
        <Typography variant="h3" fontWeight={400} gutterBottom sx={{ letterSpacing: '-1.5px' }}>
            Central de Conhecimento
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.7, mb: 4 }}>
            Tudo o que você precisa saber sobre reparos, processos e políticas da Redecell.
        </Typography>
        
        <Box sx={{ maxWidth: '700px', mx: 'auto' }}>
            <Paper sx={{ p: 1, borderRadius: '20px', boxShadow: theme.shadows[10], border: `1px solid ${theme.palette.divider}`, bgcolor: bancadaMode ? '#1a1a1a' : '#fff' }}>
                <TextField 
                    fullWidth
                    placeholder="Como posso te ajudar hoje? (Ex: Troca de Bateria iPhone...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: <InputAdornment position="start" sx={{ ml: 2 }}><Search color="primary" /></InputAdornment>,
                        sx: { height: 56, fontSize: '1.1rem', color: bancadaMode ? '#fff' : 'inherit' }
                    }}
                />
            </Paper>
        </Box>
      </Box>

      {/* 6.2 Player de Vídeo em Destaque */}
      <Box sx={{ mb: 8, position: 'relative', borderRadius: '32px', overflow: 'hidden', bgcolor: 'black', aspectRatio: '21/9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.palette.divider}` }}>
          <motion.div whileHover={{ scale: 1.1 }} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <FaPlayCircle size={80} color="white" style={{ opacity: 0.8 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 400, mt: 2 }}>
                  Tutorial em Destaque: Desmontagem iPhone 15 Pro
              </Typography>
          </motion.div>
      </Box>

      {/* Categorias */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {supportCategories.map((cat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
                <motion.div whileHover={{ y: -5 }}>
                    <Paper sx={{ p: 3, borderRadius: '24px', textAlign: 'center', cursor: 'pointer', border: `1px solid ${theme.palette.divider}`, bgcolor: bancadaMode ? '#1a1a1a' : '#fff', color: bancadaMode ? '#fff' : 'inherit', '&:hover': { borderColor: cat.color, bgcolor: alpha(cat.color, 0.05) } }}>
                        <Avatar sx={{ bgcolor: alpha(cat.color, 0.1), color: cat.color, mx: 'auto', mb: 2, width: 56, height: 56 }}>
                            {cat.icon}
                        </Avatar>
                        <Typography variant="h6" fontWeight={400}>{cat.title}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.6 }}>{cat.count} Artigos disponíveis</Typography>
                    </Paper>
                </motion.div>
            </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
            <Typography variant="h5" fontWeight={400} mb={3}>Artigos Populares</Typography>
            <Stack spacing={2}>
                <Accordion title="Qual o prazo máximo para um reparo de placa?">
                    <Typography variant="body2">O prazo médio é de 3 a 5 dias úteis, dependendo da disponibilidade de componentes e da complexidade da falha.</Typography>
                </Accordion>
                <Accordion title="Como proceder em caso de garantia de fornecedor?">
                    <Typography variant="body2">O item deve ser enviado para a Quarentena através da página dedicada, anexando fotos do defeito e do selo do fornecedor.</Typography>
                </Accordion>
            </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
            <Typography variant="h5" fontWeight={400} mb={3}>Documentação Técnica</Typography>
            <Paper sx={{ borderRadius: '24px', overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, bgcolor: bancadaMode ? '#1a1a1a' : '#fff' }}>
                <List disablePadding>
                    {[
                        { name: 'Manual de Identidade Visual', size: '2.4 MB' },
                        { name: 'Checklist de Entrada (PDF)', size: '1.1 MB' },
                        { name: 'Tabela de Preços Sugeridos', size: '0.8 MB' },
                    ].map((doc, i) => (
                        <React.Fragment key={i}>
                            <ListItem secondaryAction={<IconButton edge="end"><FaChevronRight size={12} color={bancadaMode ? '#fff' : 'inherit'} /></IconButton>}>
                                <ListItemIcon><FaFilePdf color={theme.palette.error.main} /></ListItemIcon>
                                <ListItemText primary={doc.name} secondary={doc.size} primaryTypographyProps={{ fontWeight: 400, fontSize: '0.85rem', color: bancadaMode ? '#fff' : 'inherit' }} secondaryTypographyProps={{ color: bancadaMode ? alpha('#fff', 0.5) : 'text.secondary' }} />
                            </ListItem>
                            {i < 2 && <Divider sx={{ borderColor: theme.palette.divider }} />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupportPage;
