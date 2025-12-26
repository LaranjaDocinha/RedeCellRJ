import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Avatar, 
  Container, 
  Paper, 
  Divider, 
  useTheme,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  FaRocket, 
  FaHistory, 
  FaLightbulb, 
  FaUsers, 
  FaAward, 
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTwitter
} from 'react-icons/fa';

const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const ValueCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => (
  <Paper 
    elevation={0}
    sx={{ 
      p: 4, 
      height: '100%', 
      borderRadius: '24px', 
      border: '1px solid', 
      borderColor: 'divider',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: `0 20px 40px ${color}10`,
        borderColor: color
      }
    }}
  >
    <Box sx={{ 
      width: 56, 
      height: 56, 
      borderRadius: '16px', 
      bgcolor: `${color}15`, 
      color: color, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      mb: 3
    }}>
      {icon}
    </Box>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{desc}</Typography>
  </Paper>
);

const TimelineItem: React.FC<{ year: string; title: string; desc: string; isLast?: boolean }> = ({ year, title, desc, isLast }) => (
  <Box sx={{ display: 'flex', gap: 4, pb: isLast ? 0 : 6 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ 
        width: 60, 
        height: 60, 
        borderRadius: '50%', 
        border: '2px solid', 
        borderColor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        zIndex: 1
      }}>
        <Typography variant="subtitle2" color="primary">{year}</Typography>
      </Box>
      {!isLast && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider' }} />}
    </Box>
    <Box pt={1}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 500 }}>{desc}</Typography>
    </Box>
  </Box>
);

const AboutUsPage = () => {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ 
        height: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <Typography variant="overline" sx={{ letterSpacing: 4, opacity: 0.8 }}>CONHEÇA A REDECELL</Typography>
            <Typography variant="h1" sx={{ mt: 2, mb: 3, fontSize: { xs: '3rem', md: '5rem' }, letterSpacing: '-2px' }}>
              Conectando o Futuro.
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Líderes em tecnologia móvel e soluções de gestão para o varejo desde 2010.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 12 }}>
        {/* Mission & Vision */}
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <ScrollReveal>
              <Typography variant="h3" gutterBottom letterSpacing="-1px">
                Nossa Missão é Simplificar a Tecnologia.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Na RedecellRJ, acreditamos que a tecnologia não deve ser uma barreira, mas uma ponte. Começamos como uma pequena assistência técnica no Rio de Janeiro e hoje somos um ecossistema completo de hardware e software.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Nossa paixão é fornecer os melhores dispositivos e as ferramentas de gestão mais potentes para que nossos clientes possam focar no que realmente importa: seu crescimento.
              </Typography>
            </ScrollReveal>
          </Grid>
          <Grid item xs={12} md={6}>
            <ScrollReveal delay={0.2}>
              <Box sx={{ position: 'relative' }}>
                <Box 
                  component="img" 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                  sx={{ width: '100%', borderRadius: '32px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
                />
                <Paper sx={{ position: 'absolute', bottom: -30, left: -30, p: 3, borderRadius: '20px', display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="h4" color="primary">15k+</Typography>
                  <Typography variant="caption">CLIENTES ATENDIDOS</Typography>
                </Paper>
              </Box>
            </ScrollReveal>
          </Grid>
        </Grid>

        {/* Values */}
        <Box sx={{ mt: 15, mb: 12 }}>
          <Box textAlign="center" mb={8}>
            <Typography variant="overline" color="primary">NOSSOS PILARES</Typography>
            <Typography variant="h3" letterSpacing="-1px">Valores que nos Movem</Typography>
          </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <ValueCard 
                icon={<FaLightbulb size={28} />} 
                title="Inovação" 
                desc="Buscamos constantemente novas formas de resolver problemas antigos, trazendo o que há de mais moderno no mercado global." 
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ValueCard 
                icon={<FaUsers size={28} />} 
                title="Foco no Cliente" 
                desc="O sucesso do nosso cliente é a nossa maior métrica. Cada detalhe do nosso sistema é pensado na experiência do usuário final." 
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ValueCard 
                icon={<FaAward size={28} />} 
                title="Excelência" 
                desc="Não aceitamos o 'bom o suficiente'. Entregamos qualidade premium em hardware e software, todos os dias." 
                color="#9c27b0"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Timeline */}
        <Box sx={{ mt: 15 }}>
          <Grid container spacing={8}>
            <Grid item xs={12} md={5}>
              <Typography variant="h3" letterSpacing="-1px" sticky>
                Uma Década de Conquistas.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Acompanhe os principais marcos que transformaram a RedecellRJ em uma referência nacional.
              </Typography>
            </Grid>
            <Grid item xs={12} md={7}>
              <ScrollReveal>
                <TimelineItem 
                  year="2010" 
                  title="A Fundação" 
                  desc="Início das atividades como uma assistência técnica especializada em dispositivos Apple no Rio de Janeiro." 
                />
                <TimelineItem 
                  year="2015" 
                  title="Expansão Regional" 
                  desc="Abertura da quinta unidade própria e início do desenvolvimento do primeiro software de gestão interna." 
                />
                <TimelineItem 
                  year="2019" 
                  title="Software as a Service" 
                  desc="Lançamento do PDV Redecell para parceiros externos, revolucionando o controle de estoque serializado." 
                />
                <TimelineItem 
                  year="2025" 
                  title="Redecell 2.0" 
                  desc="Lançamento do novo ecossistema integrado com IA, Realidade Aumentada e Gestão 360 do Cliente." 
                  isLast 
                />
              </ScrollReveal>
            </Grid>
          </Grid>
        </Box>

        {/* Team Section */}
        <Box sx={{ mt: 15, textAlign: 'center' }}>
          <Typography variant="overline" color="primary">LIDERANÇA</Typography>
          <Typography variant="h3" mb={8} letterSpacing="-1px">Quem Faz Acontecer</Typography>
          <Grid container spacing={6} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <ScrollReveal>
                <Avatar sx={{ width: 180, height: 180, margin: '0 auto 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} src="https://i.pravatar.cc/300?u=carlos" />
                <Typography variant="h6">Carlos Eduardo</Typography>
                <Typography color="primary" gutterBottom>CEO & Founder</Typography>
                <Box display="flex" justifyContent="center" gap={1}>
                  <IconButton color="inherit" size="small"><FaLinkedin /></IconButton>
                  <IconButton color="inherit" size="small"><FaTwitter /></IconButton>
                </Box>
              </ScrollReveal>
            </Grid>
            <Grid item xs={12} sm={4}>
              <ScrollReveal delay={0.1}>
                <Avatar sx={{ width: 180, height: 180, margin: '0 auto 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} src="https://i.pravatar.cc/300?u=ana" />
                <Typography variant="h6">Ana Paula</Typography>
                <Typography color="primary" gutterBottom>COO (Operações)</Typography>
                <Box display="flex" justifyContent="center" gap={1}>
                  <IconButton color="inherit" size="small"><FaLinkedin /></IconButton>
                  <IconButton color="inherit" size="small"><FaInstagram /></IconButton>
                </Box>
              </ScrollReveal>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Footer / Call to Action */}
      <Box sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 10, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="h4" gutterBottom>Pronto para ser parte desta história?</Typography>
          <Typography sx={{ mb: 4, opacity: 0.9 }}>Junte-se ao ecossistema Redecell e transforme sua gestão hoje.</Typography>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              padding: '16px 40px', 
              borderRadius: '12px', 
              border: 'none', 
              background: 'white', 
              color: theme.palette.primary.main, 
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
            }}
          >
            Falar com um Especialista
          </motion.button>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUsPage;