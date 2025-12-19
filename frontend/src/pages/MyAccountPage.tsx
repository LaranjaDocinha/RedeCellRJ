import React, { useState } from 'react';
import { Box, Typography, Grid, Tabs, Tab, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Mock content for each section
const sections = [
    { label: 'Meus Dados', icon: <PersonIcon />, content: <Typography>Formulário para editar dados pessoais.</Typography> },
    { label: 'Endereços', icon: <HomeIcon />, content: <Typography>Lista de endereços cadastrados.</Typography> },
    { label: 'Pagamentos', icon: <CreditCardIcon />, content: <Typography>Lista de cartões de crédito salvos.</Typography> },
    { label: 'Favoritos', icon: <FavoriteIcon />, content: <Typography>Grade de produtos favoritados.</Typography> },
];

const MyAccountPage = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const variants = {
        enter: { opacity: 0, x: 50 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };

  return (
    <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Minha Conta</Typography>
        <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={activeTab}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    {sections.map((section, index) => (
                        <Tab key={index} icon={section.icon} iconPosition="start" label={section.label} sx={{justifyContent: 'flex-start'}} />
                    ))}
                </Tabs>
            </Grid>
            <Grid item xs={12} md={9}>
                <Paper sx={{p: 3, borderRadius: '16px'}}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            {sections[activeTab].content}
                        </motion.div>
                    </AnimatePresence>
                </Paper>
            </Grid>
        </Grid>
    </Box>
  );
};

export default MyAccountPage;