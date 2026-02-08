import React, { useState } from 'react';
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
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { FaClipboardList, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { AuditLogDiffViewer } from './AuditLogDiffViewer';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditLogListProps {
  logs: AuditLog[];
}

const Row = (props: { log: AuditLog }) => {
  const { log } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow 
        hover 
        onClick={() => setOpen(!open)} 
        sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}
      >
        <TableCell>
          <IconButton size="small">
            {open ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleString('pt-BR')}</TableCell>
        <TableCell sx={{ fontSize: '0.75rem' }}>{log.user_email || 'SISTEMA'}</TableCell>
        <TableCell>
          <Chip 
            label={log.action.toUpperCase()} 
            size="small" 
            variant="outlined" 
            color={log.action.includes('delete') ? 'error' : log.action.includes('create') ? 'success' : 'primary'}
            sx={{ fontWeight: 400, fontSize: '0.6rem' }} 
          />
        </TableCell>
        <TableCell sx={{ fontSize: '0.75rem' }}>
          <Typography variant="caption" display="block" fontWeight={400}>{log.entity_type}</Typography>
          <Typography variant="caption" color="text.secondary">{log.entity_id}</Typography>
        </TableCell>
        <TableCell sx={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'text.secondary' }}>
          {log.hash?.substring(0, 8)}...
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <AnimatePresence>
            {open && (
              <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ margin: 2 }}>
                  <Typography variant="overline" fontWeight={400} color="primary" gutterBottom>
                    DETALHES DA ALTERAÇÃO
                  </Typography>
                  <AuditLogDiffViewer 
                    details={log.details || {}} 
                    oldValues={log.old_values}
                    newValues={log.new_values}
                  />
                </Box>
              </Collapse>
            )}
          </AnimatePresence>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

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
            <TableCell width={50} />
            <TableCell sx={{ fontWeight: 400 }}>TIMESTAMP</TableCell>
            <TableCell sx={{ fontWeight: 400 }}>USUÁRIO</TableCell>
            <TableCell sx={{ fontWeight: 400 }}>AÇÃO</TableCell>
            <TableCell sx={{ fontWeight: 400 }}>ENTIDADE</TableCell>
            <TableCell sx={{ fontWeight: 400 }}>HASH</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <Row key={log.id} log={log} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
