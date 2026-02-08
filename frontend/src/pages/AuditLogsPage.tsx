import React, { useState, useEffect, useCallback } from 'react';
import { AuditLogList } from '../components/AuditLogList';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled';
import Loading from '../components/Loading';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Pagination,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

export interface AuditLog {
  id: number;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  hash?: string;
}

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterEntityType, setFilterEntityType] = useState('');
  const [filterEntityId, setFilterEntityId] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState<Dayjs | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Dayjs | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', ((page - 1) * limit).toString());
      if (filterEntityType) queryParams.append('entityType', filterEntityType);
      if (filterEntityId) queryParams.append('entityId', filterEntityId);
      if (filterAction) queryParams.append('action', filterAction);
      if (filterUserId) queryParams.append('userId', filterUserId);
      if (filterStartDate) queryParams.append('startDate', filterStartDate.toISOString());
      if (filterEndDate) queryParams.append('endDate', filterEndDate.toISOString());

      const response = await fetch(`/api/audit?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setLogs(data.logs);
      setTotalCount(data.totalCount);
    } catch (error: any) {
      console.error("Error fetching audit logs:", error);
      addNotification(`Falha ao buscar logs de auditoria: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, filterEntityType, filterEntityId, filterAction, filterUserId, filterStartDate, filterEndDate, page, limit, addNotification]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);
  
  const handleClearFilters = () => {
    setFilterEntityType('');
    setFilterEntityId('');
    setFilterAction('');
    setFilterUserId('');
    setFilterStartDate(null);
    setFilterEndDate(null);
    setPage(1);
    setLimit(10);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(event.target.value as number);
    setPage(1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledPageContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledPageTitle
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Logs de Auditoria
        </StyledPageTitle>

        <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" fontWeight={400} color="text.secondary" gutterBottom display="block">FILTROS DE BUSCA</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Tipo de Entidade"
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="ID da Entidade"
                value={filterEntityId}
                onChange={(e) => setFilterEntityId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Ação"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="ID do Usuário"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Data de Início"
                value={filterStartDate}
                onChange={(date) => setFilterStartDate(date)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Data Final"
                value={filterEndDate}
                onChange={(date) => setFilterEndDate(date)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Logs por Página</InputLabel>
                <Select value={limit} onChange={handleLimitChange} label="Logs por Página">
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} display="flex" alignItems="flex-end">
              <Button fullWidth variant="outlined" onClick={handleClearFilters} sx={{ borderRadius: '12px' }}>Limpar Filtros</Button>
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}><Loading /></Box>
        ) : (
          <>
            <AuditLogList logs={logs} />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(totalCount / limit)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
            </Box>
          </>
        )}
      </StyledPageContainer>
    </LocalizationProvider>
  );
};

export default AuditLogsPage;

