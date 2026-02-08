import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import { FaArrowRight, FaPlus, FaMinus } from 'react-icons/fa';

interface DiffValue {
  from: any;
  to: any;
}

interface AuditLogDiffViewerProps {
  details?: {
    diff?: Record<string, DiffValue>;
    addedData?: any;
    removedData?: any;
  };
  oldValues?: any;
  newValues?: any;
}

export const AuditLogDiffViewer: React.FC<AuditLogDiffViewerProps> = ({ details, oldValues, newValues }) => {
  // Se temos oldValues e newValues, fazemos o diff robusto
  if (oldValues || newValues) {
    const allKeys = new Set([...Object.keys(oldValues || {}), ...Object.keys(newValues || {})]);
    const diffItems: Array<{ field: string, from: any, to: any }> = [];

    allKeys.forEach(key => {
        const from = oldValues?.[key];
        const to = newValues?.[key];
        if (JSON.stringify(from) !== JSON.stringify(to)) {
            diffItems.push({ field: key, from, to });
        }
    });

    if (diffItems.length > 0 && !oldValues && newValues) {
        // Se for uma criação (sem oldValues), mas detectamos campos em diffItems,
        // vamos mostrar como snapshot inicial em vez de lista de campos NULO -> Valor
        return (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="success.main" fontWeight={400} sx={{ mb: 1, display: 'block' }}>ESTADO INICIAL:</Typography>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(76, 175, 80, 0.04)' }}>
                  <pre style={{ fontSize: '0.7rem', margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(newValues, null, 2)}</pre>
              </Paper>
            </Box>
        );
    }

    if (diffItems.length === 0 && !oldValues && newValues) {
        // Provavelmente CREATE
        return (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="success.main" fontWeight={400} sx={{ mb: 1, display: 'block' }}>ESTADO INICIAL:</Typography>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(76, 175, 80, 0.04)' }}>
                  <pre style={{ fontSize: '0.7rem', margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(newValues, null, 2)}</pre>
              </Paper>
            </Box>
        );
    }

    return (
      <Box sx={{ mt: 1 }}>
        {diffItems.map((item) => (
          <Paper
            key={item.field}
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 1,
              borderRadius: '12px',
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              bgcolor: 'background.default'
            }}
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" fontWeight={400} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  {item.field.replace(/_/g, ' ')}
                </Typography>
              </Grid>
              <Grid item xs={5} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                  <FaMinus size={10} style={{ marginRight: 4 }} />
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', textDecoration: 'line-through' }}>
                    {typeof item.from === 'object' ? 'Objeto...' : String(item.from ?? 'NULO')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2} sm={1} sx={{ textAlign: 'center', color: 'text.disabled' }}>
                <FaArrowRight size={14} />
              </Grid>
              <Grid item xs={5} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                  <FaPlus size={10} style={{ marginRight: 4 }} />
                  <Typography variant="body2" fontWeight={400} sx={{ wordBreak: 'break-all' }}>
                    {typeof item.to === 'object' ? 'Objeto...' : String(item.to ?? 'NULO')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    );
  }

  // Fallback para formato legado
  const { diff, addedData, removedData } = details || {};

  if (diff) {
    return (
      <Box sx={{ mt: 1 }}>
        {Object.entries(diff).map(([field, values]) => (
          <Paper
            key={field}
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 1,
              borderRadius: '12px',
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              bgcolor: 'background.default'
            }}
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" fontWeight={400} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  {field.replace(/_/g, ' ')}
                </Typography>
              </Grid>
              <Grid item xs={5} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                  <FaMinus size={10} style={{ marginRight: 4 }} />
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', textDecoration: 'line-through' }}>
                    {String(values.from)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2} sm={1} sx={{ textAlign: 'center', color: 'text.disabled' }}>
                <FaArrowRight size={14} />
              </Grid>
              <Grid item xs={5} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                  <FaPlus size={10} style={{ marginRight: 4 }} />
                  <Typography variant="body2" fontWeight={400} sx={{ wordBreak: 'break-all' }}>
                    {String(values.to)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    );
  }

  if (addedData) {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="success.main" fontWeight={400} sx={{ mb: 1, display: 'block' }}>
          NOVA ENTIDADE CRIADA:
        </Typography>
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(76, 175, 80, 0.04)' }}>
            <pre style={{ fontSize: '0.7rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(addedData, null, 2)}
            </pre>
        </Paper>
      </Box>
    );
  }

  if (removedData) {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="error.main" fontWeight={400} sx={{ mb: 1, display: 'block' }}>
          ENTIDADE REMOVIDA:
        </Typography>
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(244, 67, 54, 0.04)' }}>
            <pre style={{ fontSize: '0.7rem', margin: 0, whiteSpace: 'pre-wrap', textDecoration: 'line-through' }}>
                {JSON.stringify(removedData, null, 2)}
            </pre>
        </Paper>
      </Box>
    );
  }

  return (
    <Typography variant="caption" color="text.secondary">
      Nenhum detalhe de alteração disponível.
    </Typography>
  );
};

