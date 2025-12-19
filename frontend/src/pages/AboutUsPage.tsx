import React, { useRef } from 'react';
import { Box, Typography, Grid, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
    >
        {children}
    </motion.div>
);

const AboutUsPage = () => {
  return (
    <Box sx={{ p: 4 }}>
        <AnimatedSection>
            <Box sx={{textAlign: 'center', mb: 8}}>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>Nossa História</Typography>
                <Typography variant="h6" color="text.secondary">Conectando pessoas e tecnologia desde 2010.</Typography>
            </Box>
        </AnimatedSection>

        <AnimatedSection>
            <Grid container spacing={4} alignItems="center" sx={{mb: 8}}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>Nossa Missão</Typography>
                    <Typography>Nossa missão é fornecer os melhores e mais recentes produtos de tecnologia com um serviço excepcional, criando clientes para toda a vida. Acreditamos no poder da tecnologia para simplificar e enriquecer a vida das pessoas.</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="Nossa Missão" style={{width: '100%', borderRadius: '16px'}} />
                </Grid>
            </Grid>
        </AnimatedSection>

        <AnimatedSection>
            <Box sx={{textAlign: 'center', mb: 8}}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>Nossa Equipe</Typography>
                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={6} md={3} sx={{textAlign: 'center'}}>
                        <Avatar sx={{width: 100, height: 100, margin: 'auto'}} />
                        <Typography fontWeight="bold">Carlos</Typography>
                        <Typography variant="caption">CEO</Typography>
                    </Grid>
                    <Grid item xs={6} md={3} sx={{textAlign: 'center'}}>
                        <Avatar sx={{width: 100, height: 100, margin: 'auto'}} />
                        <Typography fontWeight="bold">Ana</Typography>
                        <Typography variant="caption">Gerente de Vendas</Typography>
                    </Grid>
                </Grid>
            </Box>
        </AnimatedSection>
    </Box>
  );
};

export default AboutUsPage;