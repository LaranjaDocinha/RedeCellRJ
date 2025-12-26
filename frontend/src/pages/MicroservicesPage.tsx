import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  IconButton, 
  Tooltip, 
  Paper,
  Divider,
  Button,
  useTheme,
  Breadcrumbs
} from '@mui/material';
import { 
  FaServer, 
  FaCubes, 
  FaArrowRight, 
  FaCodeBranch, 
  FaShieldAlt, 
  FaBell, 
  FaDatabase, 
  FaExchangeAlt, 
  FaRocket,
  FaNetworkWired,
  FaLayerGroup
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link as MuiLink } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const ServiceNode: React.FC<{ 
  name: string; 
  status: string; 
  icon: React.ReactNode; 
  color: string; 
  delay?: number;
  description: string;
}> = ({ name, status, icon, color, delay = 0, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
  >
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        borderRadius: '20px', 
        border: '1px solid', 
        borderColor: 'divider',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 10px 30px ${color}15`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: '12px', 
            bgcolor: `${color}15`, 
            color: color,
            display: 'flex'
          }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>{name}</Typography>
            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4caf50' }} />
              <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700, letterSpacing: 0.5 }}>{status}</Typography>
            </Box>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const ConnectionLine = () => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    px: 2,
    color: 'divider'
  }}>
    <motion.div
      animate={{ x: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <FaArrowRight size={20} />
    </motion.div>
  </Box>
);

const MicroservicesPage: React.FC = () => {
  const theme = useTheme();

  const roadmapItems = [
    { name: 'Gateway API', icon: <FaNetworkWired size={20} />, color: theme.palette.primary.main, status: 'EM PRODUÇÃO', desc: 'Porta de entrada única para todas as requisições, gerindo roteamento e rate limiting.' },
    { name: 'Auth Core', icon: <FaShieldAlt size={20} />, color: '#9c27b0', status: 'EM PRODUÇÃO', desc: 'Serviço centralizado de identidade, JWT e controle de permissões RBAC.' },
    { name: 'Notification Hub', icon: <FaBell size={20} />, color: '#ed6c02', status: 'LEGACY MIGRATING', desc: 'Mensageria assíncrona para WhatsApp, Email e Push Notifications.' },
    { name: 'Inventory Engine', icon: <FaDatabase size={20} />, color: '#2e7d32', status: 'PLANNING', desc: 'Gestão de estoque em tempo real com suporte a múltiplas filiais e sincronização.' },
    { name: 'Payment Bridge', icon: <FaExchangeAlt size={20} />, color: '#d32f2f', status: 'PLANNING', desc: 'Abstração para múltiplos gateways (Stripe, TEF, Pix) e reconciliação bancária.' },
    { name: 'Analytics Worker', icon: <FaLayerGroup size={20} />, color: '#0288d1', status: 'STAGING', desc: 'Processamento de grandes volumes de dados para geração de relatórios e BI.' },
  ];

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto' }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component="button" onClick={() => {}} underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.9rem', fontWeight: 600 }}>
          <SettingsIcon sx={{ fontSize: 16 }} /> Configurações
        </MuiLink>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }} color="text.primary">Arquitetura</Typography>
      </Breadcrumbs>

      <Box mb={6}>
        <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px', mb: 1 }}>
          Ecossistema de Microserviços
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, fontWeight: 400, lineHeight: 1.4 }}>
          Estamos evoluindo nossa arquitetura monolítica para um modelo distribuído, garantindo escalabilidade infinita e deploy independente de módulos críticos.
        </Typography>
      </Box>

      {/* Arquitetura Visual Concept */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 6, 
          borderRadius: '32px', 
          bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : theme.palette.background.default,
          border: '1px solid',
          borderColor: 'divider',
          mb: 6,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: -100, right: -100, opacity: 0.03 }}>
          <FaRocket size={400} />
        </Box>

        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={3}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '24px', border: `2px solid ${theme.palette.primary.main}`, bgcolor: 'background.paper' }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 64, height: 64, margin: '0 auto mb-2' }}>
                  <FaServer size={32} />
                </Avatar>
                <Typography variant="h6" fontWeight={800}>Redecell Core</Typography>
                <Typography variant="caption" color="text.secondary">MONOLITH (CURRENT)</Typography>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={1}>
            <ConnectionLine />
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <ServiceNode 
                  name="API Gateway" 
                  status="STABLE" 
                  icon={<FaCodeBranch />} 
                  color={theme.palette.primary.main} 
                  delay={0.1}
                  description="Roteamento centralizado e segurança de borda."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ServiceNode 
                  name="Event Bus" 
                  status="SCALING" 
                  icon={<FaCubes />} 
                  color="#4caf50" 
                  delay={0.2}
                  description="Comunicação entre serviços via RabbitMQ/Redis."
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Roadmap de Decomposição */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>Mapa de Decomposição (Roadmap)</Typography>
      <Grid container spacing={3}>
        {roadmapItems.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={item.name}>
            <ServiceNode 
              name={item.name} 
              status={item.status} 
              icon={item.icon} 
              color={item.color} 
              delay={0.1 + (idx * 0.05)}
              description={item.desc}
            />
          </Grid>
        ))}
      </Grid>

      <Box mt={8} textAlign="center" p={4} sx={{ borderRadius: '24px', bgcolor: 'action.hover' }}>
        <Typography variant="h6" fontWeight={800} gutterBottom>Pronto para o Próximo Nível?</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          A migração está sendo realizada em ondas para garantir zero downtime nos serviços de PDV.
        </Typography>
        <Button variant="contained" size="large" sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700 }}>
          Ver Documentação Técnica
        </Button>
      </Box>
    </Box>
  );
};

export default MicroservicesPage;