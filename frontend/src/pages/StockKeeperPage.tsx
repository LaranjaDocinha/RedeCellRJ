import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, CircularProgress, IconButton } from '@mui/material';
import { FaBarcode, FaPlus, FaMinus, FaSearch, FaSync } from 'react-icons/fa';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Part } from '../types/part'; // Re-use Part interface
import { fetchAllProducts } from '../services/productService'; // Re-use product service
import { db } from '../db'; // Dexie DB for offline

interface ProductStockInfo {
  product_id: number;
  variation_id: number;
  product_name: string;
  variation_details: string; // e.g., "Cor: Preto, Capacidade: 128GB"
  current_stock: number;
}

const StockKeeperPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ProductStockInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const barcodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addNotification } = useNotification();
  const { token } = useAuth();

  const currentBranchId = 1; // TODO: Get from user context or settings

  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      // Use fetchAllProducts to search by barcode or SKU
      const { products: fetchedProducts } = await fetchAllProducts(token!, query, undefined, 10, 0);

      const stockInfoPromises = fetchedProducts.flatMap(async (p: any) => {
        // Fetch stock for each variation
        const variationStockPromises = p.variations.map(async (v: any) => {
          const res = await axios.get(`/api/inventory/${v.id}/stock?branchId=${currentBranchId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return {
            product_id: p.id,
            variation_id: v.id,
            product_name: p.name,
            variation_details: `Cor: ${v.color}, ${v.storage_capacity ? `Cap: ${v.storage_capacity}` : ''}`,
            current_stock: res.data.quantity || 0,
          };
        });
        return Promise.all(variationStockPromises);
      });

      const allStockInfo = (await Promise.all(stockInfoPromises)).flat();
      setProducts(allStockInfo);

    } catch (error: any) {
      addNotification(`Erro ao buscar produtos: ${error.message}`, 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (barcodeBuffer.length > 0) {
          handleSearch(barcodeBuffer);
          setBarcodeBuffer(''); // Clear after processing
        } else {
          handleSearch(searchTerm); // If no barcode, search by text input
        }
        if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
        return;
      }
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        setBarcodeBuffer((prev) => prev + event.key);
        if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
        barcodeTimeoutRef.current = setTimeout(() => {
          setBarcodeBuffer('');
        }, 150); // Small timeout to distinguish barcode from manual typing
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);
    };
  }, [barcodeBuffer, searchTerm, handleSearch]);

  const handleAdjustStock = async (variationId: number, change: number) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/inventory/${variationId}/adjust-stock`,
        { quantityChange: change, branchId: currentBranchId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addNotification(`Estoque ajustado: ${response.data.message}`, 'success');
      // Refresh stock for the specific product or re-search
      handleSearch(searchTerm || barcodeBuffer);
    } catch (error: any) {
      addNotification(`Erro ao ajustar estoque: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Gerenciamento de Estoque Simplificado</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            label="Buscar por SKU ou Nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <IconButton>
                  <FaSearch />
                </IconButton>
              ),
            }}
          />
          <Button variant="contained" onClick={() => handleSearch(searchTerm)} disabled={loading}>
            Buscar
          </Button>
        </Box>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          <FaBarcode /> Digite ou escaneie o código de barras
        </Typography>
      </Paper>

      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {products.map((p) => (
            <Paper key={p.variation_id} sx={{ mb: 2, p: 2 }}>
              <ListItemText
                primary={p.product_name}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="textPrimary">
                      {p.variation_details}
                    </Typography>
                    {` — Estoque atual: ${p.current_stock}`}
                  </React.Fragment>
                }
              />
              <Box display="flex" gap={1} mt={1}>
                <Button startIcon={<FaMinus />} onClick={() => handleAdjustStock(p.variation_id, -1)}>
                  Remover 1
                </Button>
                <Button startIcon={<FaPlus />} onClick={() => handleAdjustStock(p.variation_id, 1)}>
                  Adicionar 1
                </Button>
              </Box>
            </Paper>
          ))}
          {products.length === 0 && !searchTerm && (
            <Typography>Nenhum produto encontrado. Use a busca para começar.</Typography>
          )}
        </List>
      )}
    </Box>
  );
};

export default StockKeeperPage;
