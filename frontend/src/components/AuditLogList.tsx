import React from 'react';
import { AuditLog } from '../pages/AuditLogsPage';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box,
  Tooltip,
  Chip
} from '@mui/material';
import { FaClipboardList } from 'react-icons/fa';

interface AuditLogListProps {
  logs: AuditLog[];
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'action.hover', borderRadius: '24px' }}>
        <FaClipboardList size={40} style={{ opacity: 0.3 }} />
        <Typography variant="body1" color="text.secondary" mt={2}>Nenhum log de auditoria encontrado.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: '24px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 800 }}>TIMESTAMP</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>USUÁRIO</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>AÇÃO</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>ENTIDADE</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>DETALHES</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>HASH</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} hover>
              <TableCell sx={{ fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleString('pt-BR')}</TableCell>
              <TableCell sx={{ fontSize: '0.75rem' }}>{log.user_email || 'SISTEMA'}</TableCell>
              <TableCell>
                <Chip label={log.action.toUpperCase()} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.6rem' }} />
              </TableCell>
              <TableCell sx={{ fontSize: '0.75rem' }}>
                <Typography variant="caption" display="block" fontWeight={700}>{log.entity_type}</Typography>
                <Typography variant="caption" color="text.secondary">{log.entity_id}</Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={JSON.stringify(log.details, null, 2)}>
                    <Typography variant="caption" sx={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {JSON.stringify(log.details)}
                    </Typography>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'text.secondary' }}>
                {log.hash?.substring(0, 8)}...
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};