import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  TextField, 
  InputAdornment, 
  CircularProgress,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Container,
  useTheme,
  Button,
  Stack,
  Divider,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ExpandMore as ExpandIcon,
  HelpOutline as HelpIcon,
  Description as DocIcon,
  QuestionAnswer as ChatIcon,
  History as HistoryIcon,
  Smartphone as DeviceIcon,
  Security as LockIcon,
  ContactSupport as SupportIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const FaqPage: React.FC = () => {
  const theme = useTheme();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { token } = useAuth();

  const categories = [
    { title: 'Pedidos', icon: <DocIcon />, color: theme.palette.primary.main, desc: 'Status, entregas e faturamento.' },
    { title: 'Reparos', icon: <DeviceIcon />, color: '#4caf50', desc: 'Garantias, prazos e assistência.' },
    { title: 'Segurança', icon: <LockIcon />, color: '#9c27b0', desc: 'Senha, 2FA e privacidade.' },
    { title: 'Pagamentos', icon: <ChatIcon />, color: '#ed6c02', desc: 'Métodos, estornos e parcelas.' },
  ];

  useEffect(() => {
    const fetchFaqs = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch('/api/faqs', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [token]);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (faq.category && faq.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categorizedFaqs = filteredFaqs.reduce((acc, faq) => {
    const category = faq.category || 'Geral';
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Search Section */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        pt: 10, pb: 15, 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
          <HelpIcon sx={{ fontSize: 300 }} />
        </Box>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px', mb: 2 }}>
            Como podemos ajudar?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, mb: 6, fontWeight: 400 }}>
            Busque por temas, dúvidas frequentes ou tutoriais de uso.
          </Typography>
          <TextField
            fullWidth
            placeholder="Ex: Como rastrear meu pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{ 
              bgcolor: 'background.paper', 
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              '& .MuiOutlinedInput-root': { borderRadius: '16px', height: 64, px: 2, fontSize: '1.1rem' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="primary" sx={{ fontSize: 28 }} /></InputAdornment>,
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8 }}>
        {/* Categories Grid */}
        {!searchTerm && !selectedCategory && (
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {categories.map((cat) => (
              <Grid item xs={12} sm={6} md={3} key={cat.title}>
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: '24px', 
                    border: '1px solid', 
                    borderColor: 'divider',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-8px)', borderColor: cat.color, boxShadow: `0 15px 30px ${cat.color}15` }
                  }}
                >
                  <CardActionArea onClick={() => setSearchTerm(cat.title)} sx={{ p: 3 }}>
                    <Box sx={{ 
                      width: 56, height: 56, borderRadius: '16px', 
                      bgcolor: `${cat.color}15`, color: cat.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mb: 2
                    }}>
                      {cat.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={400}>{cat.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{cat.desc}</Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* FAQ Content */}
        <Box mb={10}>
          {searchTerm && (
            <Box mb={4}>
              <Typography variant="h5" fontWeight={400}>
                {filteredFaqs.length} resultados encontrados para "{searchTerm}"
              </Typography>
              <Button size="small" onClick={() => setSearchTerm('')} sx={{ mt: 1 }}>Limpar busca</Button>
            </Box>
          )}

          <AnimatePresence>
            {Object.keys(categorizedFaqs).length > 0 ? (
              Object.keys(categorizedFaqs).map((category, idx) => (
                <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Box sx={{ mb: 6 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 400, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                      {category}
                    </Typography>
                    <Stack spacing={1.5}>
                      {categorizedFaqs[category].map((faq: any) => (
                        <Accordion 
                          key={faq.id} 
                          elevation={0} 
                          sx={{ 
                            borderRadius: '16px !important', 
                            border: '1px solid', 
                            borderColor: 'divider',
                            '&:before': { display: 'none' },
                            overflow: 'hidden',
                            '&.Mui-expanded': { borderColor: 'primary.main' }
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandIcon color="primary" />}>
                            <Typography variant="subtitle1" fontWeight={400}>{faq.question}</Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ bgcolor: 'action.hover', p: 3 }}>
                            <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
                              {faq.answer}
                            </Typography>
                            <Box mt={3} display="flex" gap={2}>
                              <Typography variant="caption" fontWeight={400}>Isso foi útil?</Typography>
                              <MuiLink href="#" variant="caption" underline="hover">Sim</MuiLink>
                              <MuiLink href="#" variant="caption" underline="hover">Não</MuiLink>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  </Box>
                </motion.div>
              ))
            ) : (
              <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '32px', border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                <Typography variant="h6" color="text.secondary">Nenhuma FAQ encontrada para sua busca.</Typography>
                <Typography variant="body2" color="text.disabled">Tente usar palavras-chave mais simples.</Typography>
              </Paper>
            )}
          </AnimatePresence>
        </Box>

        {/* Support CTA */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, mb: 8, borderRadius: '32px', 
            bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : theme.palette.background.default,
            border: '1px solid', borderColor: 'divider',
            textAlign: 'center'
          }}
        >
          <SupportIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={400} gutterBottom>Ainda precisa de ajuda?</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Nossos especialistas estão prontos para te atender via chat ou telefone.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" sx={{ borderRadius: '12px', px: 4, fontWeight: 400 }}>
              Falar com Atendente
            </Button>
            <Button variant="outlined" size="large" sx={{ borderRadius: '12px', px: 4, fontWeight: 400 }}>
              Abrir Ticket de Suporte
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default FaqPage;
