import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Container, 
  Avatar, 
  Divider, 
  useTheme,
  Stack,
  Tooltip,
  CircularProgress,
  IconButton,
  Chip
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon, 
  FlashOn as EnergyIcon,
  Timeline as StatsIcon,
  LocalFireDepartment as StreakIcon,
  Add as AddIcon,
  HelpOutline as InfoIcon,
  Diamond as DiamondIcon,
  Leaderboard as RankingIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { gamificationService, UserStats, LeaderboardEntry, Challenge, Badge } from '../services/gamificationService';
import { 
  StyledPageContainer, 
  GlassCard, 
  XPProgressBar, 
  RankBadge, 
  LeaderboardItem, 
  MissionCard,
  FloatingIcon,
  StatValue 
} from './GamificationPage.styled';
import ReactApexChart from 'react-apexcharts';
import CreateChallengeModal from '../components/gamification/CreateChallengeModal';

const GamificationPage: React.FC = () => {
  const theme = useTheme();
  const { token, user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['userStats', token],
    queryFn: () => gamificationService.getStats(token as string),
    enabled: !!token
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', token],
    queryFn: () => gamificationService.getLeaderboard(token as string),
    enabled: !!token
  });

  const { data: challenges, isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ['myChallenges', token],
    queryFn: () => gamificationService.getMyChallenges(token as string),
    enabled: !!token
  });

  const { data: allBadges } = useQuery<Badge[]>({
    queryKey: ['allBadges', token],
    queryFn: () => gamificationService.getAllBadges(token as string),
    enabled: !!token
  });

  const { data: userBadges } = useQuery<Badge[]>({
    queryKey: ['userBadges', token, user?.id],
    queryFn: () => gamificationService.getUserBadges(token as string, user?.id as string),
    enabled: !!token && !!user?.id
  });

  const isHappyHour = useMemo(() => {
    const now = new Date();
    return now.getDay() === 5 && now.getHours() >= 16;
  }, []);

  const topStats = useMemo(() => [
    { label: 'Nível Atual', value: stats?.level || 1, icon: <EnergyIcon />, color: '#ed6c02' },
    { label: 'XP Total', value: (stats?.xp || 0).toLocaleString(), icon: <StatsIcon />, color: theme.palette.primary.main },
    { label: 'Próximo Nível', value: (stats?.nextLevelXp || 1000).toLocaleString(), icon: <TrophyIcon />, color: '#9c27b0' },
    { label: 'Bônus Ativo', value: isHappyHour ? '1.5x XP' : 'Nenhum', icon: <StreakIcon />, color: isHappyHour ? '#f44336' : '#757575' },
  ], [stats, isHappyHour, theme]);

  const radarData = useMemo(() => ({
    series: [{
      name: 'Habilidades',
      data: [80, 50, 30, 40, 100, 20],
    }],
    options: {
      chart: { height: 350, type: 'radar', toolbar: { show: false } },
      xaxis: {
        categories: ['Vendas', 'Upsell', 'Fidelidade', 'Rapidez', 'Estratégia', 'Presença']
      },
      colors: [theme.palette.primary.main],
      fill: { opacity: 0.4 },
      markers: { size: 0 }
    } as any
  }), [theme]);

  if (statsLoading || leaderboardLoading || challengesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <StyledPageContainer>
      <Container maxWidth="xl">
        <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  border: '4px solid', 
                  borderColor: 'primary.main',
                  boxShadow: '0 0 20px rgba(33, 150, 243, 0.3)'
                }}
                src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
              />
              <Box>
                <Typography variant="h4">{user?.name}</Typography>
                <Stack direction="row" spacing={1} mt={0.5}>
                  <RankBadge $color="#ed6c02"><EnergyIcon sx={{ fontSize: 14 }} /> Nível {stats?.level}</RankBadge>
                  <RankBadge $color="#9c27b0"><TrophyIcon sx={{ fontSize: 14 }} /> Rank Master</RankBadge>
                </Stack>
              </Box>
            </Box>
          </motion.div>

          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
            sx={{ 
              borderRadius: '16px', 
              px: 4, py: 1.5, 
              boxShadow: '0 10px 20px rgba(33, 150, 243, 0.2)'
            }}
          >
            Novo Desafio
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {topStats.map((stat, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <GlassCard sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 56, height: 56, borderRadius: '16px' }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    <Typography variant="h5">{stat.value}</Typography>
                  </Box>
                </GlassCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={4}>
              <GlassCard sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={2}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">PROGRESSO DE NÍVEL</Typography>
                    <Typography variant="h5">{stats?.xp} / {stats?.nextLevelXp} XP</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Faltam { (stats?.nextLevelXp || 0) - (stats?.xp || 0) } XP para o Nível { (stats?.level || 0) + 1 }
                  </Typography>
                </Box>
                <XPProgressBar $progress={stats?.progress || 0} />
              </GlassCard>

              <Box>
                <Typography variant="h5" mb={3} display="flex" alignItems="center" gap={1}>
                  <StatsIcon color="primary" /> Missões Ativas
                </Typography>
                <Grid container spacing={3}>
                  {challenges?.map((challenge, idx) => (
                    <Grid size={{ xs: 12, md: 6 }} key={challenge.id}>
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <MissionCard sx={{ p: 3 }}>
                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                              <FloatingIcon>🎯</FloatingIcon>
                              <Chip label={`+${challenge.reward_xp} XP`} color="primary" sx={{ borderRadius: '8px' }} />
                            </Box>
                            <Typography variant="h6" gutterBottom>{challenge.title}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              {challenge.description}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="caption">PROGRESSO</Typography>
                              <Typography variant="caption">
                                {Math.round((Number(challenge.current_value) / Number(challenge.target_value)) * 100)}%
                              </Typography>
                            </Box>
                            <XPProgressBar $progress={(Number(challenge.current_value) / Number(challenge.target_value)) * 100} />
                          </Box>
                        </MissionCard>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <GlassCard sx={{ p: 4 }}>
                <Typography variant="h6" mb={2}>Atributos de Performance</Typography>
                <ReactApexChart options={radarData.options} series={radarData.series} type="radar" height={350} />
              </GlassCard>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={4}>
              <GlassCard sx={{ p: 0 }}>
                <Box p={3} sx={{ background: theme.palette.primary.main, color: 'white' }}>
                  <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                    <RankingIcon /> Leaderboard Mensal
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Top 10 Vendedores da Redecell</Typography>
                </Box>
                <Box p={2}>
                  {leaderboard?.map((entry, index) => (
                    <LeaderboardItem key={entry.id} $isUser={entry.id === user?.id}>
                      <Typography variant="h6" color={index < 3 ? 'primary.main' : 'text.disabled'} sx={{ minWidth: 24 }}>
                        #{index + 1}
                      </Typography>
                      <Avatar src={`https://ui-avatars.com/api/?name=${entry.name}&background=random`} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">{entry.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Nível {entry.level}</Typography>
                      </Box>
                      <StatValue variant="subtitle1">R$ {Number(entry.total).toLocaleString()}</StatValue>
                    </LeaderboardItem>
                  ))}
                </Box>
              </GlassCard>

              <GlassCard sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Medalhas</Typography>
                  <Tooltip title="Complete missões para ganhar medalhas épicas!">
                    <IconButton size="small"><InfoIcon /></IconButton>
                  </Tooltip>
                </Box>
                <Grid container spacing={2}>
                  {allBadges?.map(badge => {
                    const isEarned = userBadges?.some(ub => ub.id === badge.id);
                    return (
                      <Grid size={{ xs: 4 }} key={badge.id}>
                        <Tooltip title={`${badge.name}: ${badge.description}`}>
                          <Box sx={{ textAlign: 'center', opacity: isEarned ? 1 : 0.3, filter: isEarned ? 'none' : 'grayscale(1)', cursor: 'help' }}>
                            <Avatar src={badge.icon_url} sx={{ width: 60, height: 60, margin: '0 auto', bgcolor: 'action.hover', mb: 1, border: isEarned ? '2px solid' : 'none', borderColor: 'warning.main' }}>
                              <DiamondIcon color="disabled" />
                            </Avatar>
                            <Typography variant="caption" display="block" noWrap>{badge.name}</Typography>
                          </Box>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                </Grid>
              </GlassCard>
            </Stack>
          </Grid>
        </Grid>

        <CreateChallengeModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={() => {}} />
      </Container>
    </StyledPageContainer>
  );
};

export default GamificationPage;