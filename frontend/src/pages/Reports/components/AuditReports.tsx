import React from 'react';
import { Box, Typography } from '@mui/material';

const AuditReports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5">Relatórios de Auditoria</Typography>
      <Typography variant="body1" color="text.secondary">
        Conteúdo para relatórios de auditoria.
      </Typography>
    </Box>
  );
};

export default AuditReports;