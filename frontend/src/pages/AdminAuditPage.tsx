import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Button, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

interface AuditLog {
  id: number;
  user_id: string;
  user_email?: string;
  action: string;
  details: any;
  timestamp: string;
}

const AdminAuditPage: React.FC = () => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/audit?limit=${rowsPerPage}&offset=${page * rowsPerPage}`);
      setLogs(response.data);
    } catch (error: any) {
      addNotification(t('failed_to_fetch_audit_logs'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('audit_logs_title')}
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            label={t('filter_by_user')} 
            variant="outlined" 
            size="small" 
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
          <TextField 
            label={t('filter_by_action')} 
            variant="outlined" 
            size="small" 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
          <Button variant="contained" onClick={fetchLogs}>{t('refresh')}</Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('timestamp')}</TableCell>
              <TableCell>{t('user')}</TableCell>
              <TableCell>{t('action')}</TableCell>
              <TableCell>{t('details')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>{log.user_email || log.user_id || 'System'}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  <pre style={{ margin: 0, fontSize: '0.8em' }}>
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t('no_logs_found')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={-1} // Unknown total count for now
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default AdminAuditPage;
