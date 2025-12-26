import React from 'react';
import { Box, Typography } from '@mui/material';

const InventoryReports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5">Relatórios de Estoque</Typography>
      <Typography variant="body1" color="text.secondary">
        Conteúdo para relatórios de estoque.
      </Typography>
    </Box>
  );
};

export default InventoryReports;