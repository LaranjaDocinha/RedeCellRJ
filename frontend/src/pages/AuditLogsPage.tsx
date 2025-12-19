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
  Pagination, // Importar Pagination
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Importar DatePicker
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Importar LocalizationProvider
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'; // Importar AdapterMoment
import Moment from 'moment'; // Importar Moment

interface AuditLog {
  id: number;
  user_id?: string; // Changed to string/UUID
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: string; // Changed to string/UUID
  details?: any;
  timestamp: string;
  previous_hash?: string;
  hash?: string;
}

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0); // Novo estado para totalCount
  const [loading, setLoading] = useState(true);
  const [filterEntityType, setFilterEntityType] = useState('');
  const [filterEntityId, setFilterEntityId] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState<Moment | null>(null); // Novo estado
  const [filterEndDate, setFilterEndDate] = useState<Moment | null>(null);     // Novo estado
  const [page, setPage] = useState(1);       // Novo estado
  const [limit, setLimit] = useState(10);    // Novo estado
  const { token } = useAuth();
  const { addToast } = useNotification(); // Usar addToast em vez de addNotification

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
      setLogs(data.logs); // O backend agora retorna { logs, totalCount }
      setTotalCount(data.totalCount);
    } catch (error: any) {
      console.error("Error fetching audit logs:", error);
      addToast(`Falha ao buscar logs de auditoria: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, filterEntityType, filterEntityId, filterAction, filterUserId, filterStartDate, filterEndDate, page, limit, addToast]);

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
    setPage(1); // Resetar para a primeira página ao mudar o limite
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
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

        <Box sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Tipo de Entidade"
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="ID da Entidade"
                value={filterEntityId}
                onChange={(e) => setFilterEntityId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Ação"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
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
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Data Final"
                value={filterEndDate}
                onChange={(date) => setFilterEndDate(date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Logs por Página</InputLabel>
                <Select value={limit} onChange={handleLimitChange} label="Logs por Página">
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleClearFilters}>Limpar Filtros</Button>
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <Loading />
        ) : (
          <>
            <AuditLogList logs={logs} />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalCount / limit)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </StyledPageContainer>
    </LocalizationProvider>
  );
};

export default AuditLogsPage;