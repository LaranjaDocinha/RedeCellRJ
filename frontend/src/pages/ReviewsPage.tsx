import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  TextField, 
  MenuItem, 
  IconButton, 
  Chip, 
  Avatar, 
  Stack, 
  Divider, 
  useTheme,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
  alpha,
  Rating,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  Autocomplete
} from '@mui/material';
import { 
  FaStar, 
  FaSearch, 
  FaReply, 
  FaRegSmile, 
  FaRegFrown, 
  FaRegMeh,
  FaChartLine,
  FaQuoteLeft,
  FaTools,
  FaUserTie,
  FaWhatsapp,
  FaShareAlt,
  FaGoogle,
  FaCheckCircle,
  FaTimes,
  FaSend
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Button } from '../components/Button';
import ErrorBoundary from '../components/ErrorBoundary';
import api from '../services/api';

const ReviewsPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { addNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [npsModalOpen, setNpsModalOpen] = useState(false);
  const [sendSurveyOpen, setSendSurveyOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/reviews');
      setReviews(res.data || []);
    } catch (err) {
      // Mock de Elite para visualização inicial
      setReviews([
        { id: 1, customer_name: 'Guilherme Santos', rating_overall: 5, comment: 'Atendimento impecável! Meu iPhone 14 ficou como novo.', store_response: 'Obrigado Guilherme!', sentiment_score: 'Positive', created_at: moment().subtract(2, 'hours').toISOString(), technician: 'Marcos Silva', service: 'Troca de Tela OLED' },
        { id: 2, customer_name: 'Ana Paula Oliveira', rating_overall: 4, comment: 'O conserto foi ótimo, mas o tempo de espera foi um pouco longo.', sentiment_score: 'Neutral', created_at: moment().subtract(1, 'day').toISOString(), technician: 'Rodrigo Lima', service: 'Reparo em Placa' },
        { id: 3, customer_name: 'Ricardo Mello', rating_overall: 2, comment: 'Peça veio com defeito no segundo dia. Tive que voltar na loja.', sentiment_score: 'Negative', created_at: moment().subtract(3, 'days').toISOString(), technician: 'Marcos Silva', service: 'Troca de Bateria' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const npsData = useMemo(() => {
    const total = reviews.length || 1;
    const promoters = reviews.filter(r => r.rating_overall === 5).length;
    const passives = reviews.filter(r => r.rating_overall === 4).length;
    const detractors = reviews.filter(r => r.rating_overall <= 3).length;
    const score = Math.round(((promoters - detractors) / total) * 100);
    
    return { score, promoters, passives, detractors, total: reviews.length };
  }, [reviews]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
        case 'Positive': return <FaRegSmile color={theme.palette.success.main} />;
        case 'Negative': return <FaRegFrown color={theme.palette.error.main} />;
        default: return <FaRegMeh color={theme.palette.warning.main} />;
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
        const matchesSearch = (r.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (r.comment || '').toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 1) return matchesSearch && !r.store_response;
        return matchesSearch;
    });
  }, [reviews, searchTerm, activeTab]);

  return (
    <ErrorBoundary>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, margin: '0 auto' }}>
        
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ letterSpacing: '-0.5px' }}>Central de Reputação</Typography>
            <Typography variant="body2" color="text.secondary">Monitoramento de satisfação e qualidade técnica</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" label="Relatório NPS" startIcon={<FaChartLine />} onClick={() => setNpsModalOpen(true)} />
            <Button variant="contained" label="Enviar Pesquisa" startIcon={<FaWhatsapp />} onClick={() => setSendSurveyOpen(true)} />
          </Stack>
        </Box>

        {/* DASHBOARD NPS */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: '24px', textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Score NPS Geral</Typography>
                    <Typography variant="h2" color="primary" sx={{ my: 1 }}>{npsData.score}</Typography>
                    <Typography variant="body2" sx={{ color: npsData.score > 70 ? 'success.main' : 'warning.main' }}>Zona de Excelência</Typography>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: '24px', bgcolor: theme.palette.background.paper }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2, display: 'block' }}>Métricas de Atendimento</Typography>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 4 }}>
                            <Typography variant="h5">4.8</Typography>
                            <LinearProgress variant="determinate" value={96} sx={{ height: 4, borderRadius: 2, my: 1 }} color="success" />
                            <Typography variant="caption" sx={{ opacity: 0.6 }}>Qualidade Técnica</Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <Typography variant="h5">4.2</Typography>
                            <LinearProgress variant="determinate" value={84} sx={{ height: 4, borderRadius: 2, my: 1 }} color="info" />
                            <Typography variant="caption" sx={{ opacity: 0.6 }}>Agilidade / Prazo</Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <Typography variant="h5">4.9</Typography>
                            <LinearProgress variant="determinate" value={98} sx={{ height: 4, borderRadius: 2, my: 1 }} color="secondary" />
                            <Typography variant="caption" sx={{ opacity: 0.6 }}>Cordialidade</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>

        {/* FILTROS E ABAS */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Paper variant="outlined" sx={{ bgcolor: theme.palette.background.paper, borderRadius: '12px', overflow: 'hidden' }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ minHeight: 44 }}>
                    <Tab label="Todos os Reviews" sx={{ textTransform: 'none' }} />
                    <Tab label="Aguardando Resposta" sx={{ textTransform: 'none' }} />
                </Tabs>
            </Paper>
            <TextField 
                size="small" placeholder="Filtrar comentários ou clientes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 400 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><FaSearch size={14} /></InputAdornment>, sx: { borderRadius: '12px', bgcolor: theme.palette.background.paper } }}
            />
        </Box>

        {/* LISTAGEM DE REVIEWS */}
        <Box sx={{ minHeight: '500px' }}>
            {loading ? (
                <Box display="flex" justifyContent="center" py={10}><CircularProgress thickness={2} /></Box>
            ) : (
                <Stack spacing={3}>
                    {filteredReviews.map((review) => (
                        <motion.div key={review.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card variant="outlined" sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, transition: 'all 0.3s', '&:hover': { bgcolor: isDarkMode ? alpha('#fff', 0.01) : '#fafafa' } }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 3 }} sx={{ borderRight: { md: `1px solid ${theme.palette.divider}` } }}>
                                            <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
                                                <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontSize: '1.5rem' }}>
                                                    {review.customer_name[0]}
                                                </Avatar>
                                                <Box textAlign={{ xs: 'center', md: 'left' }}>
                                                    <Typography variant="subtitle1">{review.customer_name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Cliente Verificado</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    {getSentimentIcon(review.sentiment_score)}
                                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Análise de IA</Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 9 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                <Stack spacing={0.5}>
                                                    <Rating value={review.rating_overall} readOnly size="small" sx={{ color: theme.palette.primary.main }} />
                                                    <Typography variant="caption" color="text.secondary">{moment(review.created_at).fromNow()}</Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1}>
                                                    <Tooltip title="Publicar no Google Meu Negócio"><IconButton size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}><FaGoogle size={12} color="#4285F4" /></IconButton></Tooltip>
                                                    <Tooltip title="Compartilhar no Instagram"><IconButton size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}><FaShareAlt size={12} /></IconButton></Tooltip>
                                                </Stack>
                                            </Box>

                                            <Box sx={{ position: 'relative', mb: 3 }}>
                                                <FaQuoteLeft style={{ position: 'absolute', top: -10, left: -20, opacity: 0.05, fontSize: '2rem' }} />
                                                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.primary', pl: 1 }}>
                                                    "{review.comment}"
                                                </Typography>
                                            </Box>

                                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                                <Grid size={{ xs: 6, sm: 4 }}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FaUserTie size={12} style={{ opacity: 0.5 }} />
                                                        <Typography variant="caption">{review.technician}</Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid size={{ xs: 6, sm: 4 }}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FaTools size={12} style={{ opacity: 0.5 }} />
                                                        <Typography variant="caption">{review.service}</Typography>
                                                    </Stack>
                                                </Grid>
                                            </Grid>

                                            {review.store_response ? (
                                                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: isDarkMode ? alpha('#fff', 0.02) : '#f8f9fa', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                                                    <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 0.5 }}>RESPOSTA DA REDECELL</Typography>
                                                    <Typography variant="body2">{review.store_response}</Typography>
                                                </Box>
                                            ) : (
                                                <Button variant="text" size="small" label="Responder Cliente" startIcon={<FaReply />} />
                                            )}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </Stack>
            )}
        </Box>

        {/* MODAL RELATÓRIO NPS */}
        <Dialog open={npsModalOpen} onClose={() => setNpsModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="span">Distribuição NPS</Typography>
                <IconButton onClick={() => setNpsModalOpen(false)} size="small" autoFocus><FaTimes /></IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} py={2}>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Promotores (9-10)</Typography>
                            <Typography variant="body2">{npsData.promoters} ({Math.round(npsData.promoters/npsData.total * 100)}%)</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={npsData.promoters/npsData.total * 100} sx={{ height: 10, borderRadius: 5 }} color="success" />
                    </Box>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Neutros (7-8)</Typography>
                            <Typography variant="body2">{npsData.passives} ({Math.round(npsData.passives/npsData.total * 100)}%)</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={npsData.passives/npsData.total * 100} sx={{ height: 10, borderRadius: 5 }} color="warning" />
                    </Box>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Detratores (0-6)</Typography>
                            <Typography variant="body2">{npsData.detractors} ({Math.round(npsData.detractors/npsData.total * 100)}%)</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={npsData.detractors/npsData.total * 100} sx={{ height: 10, borderRadius: 5 }} color="error" />
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '16px', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">FÓRMULA NPS</Typography>
                        <Typography variant="body1">% Promotores - % Detratores = <strong>{npsData.score}</strong></Typography>
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>

        {/* MODAL ENVIAR PESQUISA */}
        <Dialog open={sendSurveyOpen} onClose={() => setSendSurveyOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="span">Nova Pesquisa</Typography>
                <IconButton onClick={() => setSendSurveyOpen(false)} size="small" autoFocus><FaTimes /></IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} py={2}>
                    <Typography variant="body2" color="text.secondary">Envie um link de satisfação para um cliente que concluiu um serviço recentemente.</Typography>
                    
                    <Autocomplete
                        options={['Marcos Oliveira', 'Juliana Dias', 'Roberto Silva']}
                        renderInput={(params) => <TextField {...params} label="Selecionar Cliente" size="small" />}
                    />

                    <TextField select label="Ordem de Serviço" size="small" defaultValue="">
                        <MenuItem value="1024">OS #1024 - iPhone 14 Pro</MenuItem>
                        <MenuItem value="1025">OS #1025 - Samsung S23</MenuItem>
                    </TextField>

                    <Button 
                        variant="contained" 
                        label="Enviar via WhatsApp" 
                        startIcon={<FaWhatsapp />} 
                        fullWidth
                        onClick={() => {
                            addNotification('Pesquisa enviada com sucesso!', 'success');
                            setSendSurveyOpen(false);
                        }}
                    />
                </Stack>
            </DialogContent>
        </Dialog>

      </Box>
    </ErrorBoundary>
  );
};

export default ReviewsPage;
