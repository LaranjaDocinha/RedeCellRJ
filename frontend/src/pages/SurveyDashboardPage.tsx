import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Skeleton, 
  Paper, 
  Avatar, 
  Chip, 
  Divider, 
  Stack, 
  useTheme,
  LinearProgress,
  IconButton
} from '@mui/material';
import { 
  Mood as HappyIcon, 
  SentimentNeutral as NeutralIcon, 
  SentimentVeryDissatisfied as SadIcon,
  Favorite as LoveIcon,
  Stars as NpsIcon,
  Comment as FeedbackIcon,
  TrendingUp,
  History as HistoryIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';

interface SurveyResults {
  nps: { score: number; total_responses: number };
  csat: { score: number; total_responses: number };
}

const SurveyDashboardPage: React.FC = () => {
  const theme = useTheme();
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    // Simulated data for high-fidelity UI
    setTimeout(() => {
      setResults({
        nps: { score: 72, total_responses: 154 },
        csat: { score: 88, total_responses: 142 }
      });
      setLoading(false);
    }, 1000);
  }, []);

  const npsChartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: '70%' },
        dataLabels: {
          name: { show: false },
          value: { 
            offsetY: 10, 
            fontSize: '32px', 
            fontWeight: 900,
            formatter: (val) => val.toString()
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: { shade: 'dark', type: 'horizontal', gradientToColors: ['#4caf50'], stops: [0, 100] }
    },
    colors: ['#ff9800'],
    stroke: { lineCap: 'round' },
    labels: ['NPS']
  };

  const recentFeedbacks = [
    { id: 1, user: 'Maria S.', score: 5, comment: 'Atendimento impecável na troca da minha bateria.', sentiment: 'positive', time: 'Há 2 horas' },
    { id: 2, user: 'José R.', score: 4, comment: 'O sistema de agendamento facilitou muito.', sentiment: 'positive', time: 'Há 5 horas' },
    { id: 3, user: 'Ana L.', score: 3, comment: 'Demorou um pouco mais que o esperado, mas resolveu.', sentiment: 'neutral', time: 'Há 1 dia' },
  ];

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress thickness={5} size={60} />
    </Box>
  );

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <HappyIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2 }}>
              CUSTOMER SUCCESS
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            Voz do Cliente
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Acompanhe métricas de satisfação e feedbacks em tempo real.
          </Typography>
        </Box>
        <Chip label="ZONA DE EXCELÊNCIA" color="success" sx={{ fontWeight: 900, borderRadius: '8px', px: 1 }} />
      </Box>

      <Grid container spacing={4}>
        {/* NPS Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider', textAlign: 'center', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Net Promoter Score</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={4}>
              Métrica de lealdade e recomendação
            </Typography>
            <Box sx={{ mt: -2 }}>
              <ReactApexChart options={npsChartOptions} series={[results?.nps.score || 0]} type="radialBar" height={300} />
            </Box>
            <Box display="flex" justifyContent="center" gap={3} mt={2}>
              <Box><Typography variant="h6" fontWeight={900}>154</Typography><Typography variant="caption" color="text.secondary">RESPOSTAS</Typography></Box>
              <Divider orientation="vertical" flexItem sx={{ opacity: 0.5 }} />
              <Box><Typography variant="h6" fontWeight={900} color="success.main">+12</Typography><Typography variant="caption" color="text.secondary">VARIAÇÃO</Typography></Box>
            </Box>
          </Paper>
        </Grid>

        {/* CSAT and Breakdown */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3} height="100%">
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider' }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" fontWeight={800} gutterBottom>Customer Satisfaction</Typography>
                  <Typography variant="h2" fontWeight={900} color="primary" sx={{ my: 1 }}>{results?.csat.score}%</Typography>
                  <Typography variant="body2" color="text.secondary">Média de satisfação geral com o serviço prestado.</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}><Typography variant="caption" fontWeight={700}>Qualidade Técnica</Typography><Typography variant="caption" fontWeight={800}>92%</Typography></Box>
                      <LinearProgress variant="determinate" value={92} color="success" sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}><Typography variant="caption" fontWeight={700}>Agilidade</Typography><Typography variant="caption" fontWeight={800}>78%</Typography></Box>
                      <LinearProgress variant="determinate" value={78} color="primary" sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}><Typography variant="caption" fontWeight={700}>Atendimento</Typography><Typography variant="caption" fontWeight={800}>95%</Typography></Box>
                      <LinearProgress variant="determinate" value={95} color="success" sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider', flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Feedbacks Recentes</Typography>
              <Stack spacing={2.5}>
                {recentFeedbacks.map(f => (
                  <Box key={f.id} display="flex" gap={2} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: f.sentiment === 'positive' ? 'success.light' : 'action.disabled' }}>{f.user[0]}</Avatar>
                    <Box flexGrow={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" fontWeight={800}>{f.user}</Typography>
                        <Typography variant="caption" color="text.secondary">{f.time}</Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} my={0.5}>
                        {[1,2,3,4,5].map(s => <StarIcon key={s} sx={{ fontSize: 14, color: s <= f.score ? 'warning.main' : 'divider' }} />)}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.4}>{f.comment}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button fullWidth variant="text" sx={{ mt: 3, fontWeight: 700, textTransform: 'none' }}>Ver Muro de Elogios</Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SurveyDashboardPage;