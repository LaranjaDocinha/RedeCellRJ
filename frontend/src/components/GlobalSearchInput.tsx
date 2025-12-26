import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useNotification } from '../../contexts/NotificationContext';

interface GlobalSearchInputProps {
  onSearchSubmit: (query: string, entityType: 'products' | 'customers' | 'all') => void;
  initialQuery?: string;
  initialEntityType?: 'products' | 'customers' | 'all';
}

type EntityType = 'products' | 'customers' | 'all';

const GlobalSearchInput: React.FC<GlobalSearchInputProps> = ({
  onSearchSubmit,
  initialQuery = '',
  initialEntityType = 'all',
}) => {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>(initialEntityType);
  const { token } = useAuth();
  const debouncedInputValue = useDebounce(inputValue, 300); // Debounce input para evitar muitas requisições
  const { showNotification } = useNotification();

  const fetchSuggestions = useCallback(async (query: string, entityType: EntityType) => {
    if (!token) {
        showNotification('Erro de autenticação. Por favor, faça login novamente.', 'error');
        setLoading(false);
        return;
    }
    if (query.length < 2) { // Não buscar sugestões para queries muito curtas
      setOptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(query)}&entityType=${entityType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOptions(data);
    } catch (err: any) {
      console.error('Failed to fetch suggestions:', err);
      showNotification('Falha ao buscar sugestões.', 'error');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  useEffect(() => {
    if (debouncedInputValue) {
      fetchSuggestions(debouncedInputValue, selectedEntityType);
    } else {
      setOptions([]);
    }
  }, [debouncedInputValue, selectedEntityType, fetchSuggestions]);

  const handleEntityTypeChange = (event: SelectChangeEvent<EntityType>) => {
    const newEntityType = event.target.value as EntityType;
    setSelectedEntityType(newEntityType);
    // Refetch suggestions if input value is not empty
    if (inputValue) {
      fetchSuggestions(inputValue, newEntityType);
    }
  };

  const handleSearchClick = () => {
    if (inputValue.trim()) {
      onSearchSubmit(inputValue.trim(), selectedEntityType);
    }
  };

  const handleClearInput = () => {
    setInputValue('');
    setOptions([]);
    // Optionally trigger a search submit with empty query or reset results
    onSearchSubmit('', selectedEntityType);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel id="entity-type-select-label">Buscar Em</InputLabel>
        <Select
          labelId="entity-type-select-label"
          value={selectedEntityType}
          label="Buscar Em"
          onChange={handleEntityTypeChange}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="products">Produtos</MenuItem>
          <MenuItem value="customers">Clientes</MenuItem>
        </Select>
      </FormControl>
      <Autocomplete
        freeSolo
        options={options}
        loading={loading}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        onChange={(event, newValue) => {
          if (newValue) {
            setInputValue(newValue);
            onSearchSubmit(newValue, selectedEntityType);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar..."
            variant="outlined"
            size="small"
            fullWidth
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchClick();
              }
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {inputValue && (
                    <IconButton size="small" onClick={handleClearInput}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={handleSearchClick} edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
        sx={{ flexGrow: 1 }}
      />
    </Box>
  );
};

export default GlobalSearchInput;