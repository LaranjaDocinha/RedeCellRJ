import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

import { get, del, post, put } from '../helpers/api_helper';
import useApi from '../hooks/useApi';

export const ProductContext = createContext({ selection: {} });

export const ProductProvider = ({ children }) => {
  // Estados de Dados
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtro e Ordenação
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(''); // 'all' or category.id
  const [stockStatusFilter, setStockStatusFilter] = useState(''); // 'all', 'in_stock', 'low_stock', 'out_of_stock'
  const [productTypeFilter, setProductTypeFilter] = useState(''); // 'all', 'physical', 'service'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price_asc', 'price_desc', 'name_asc'

  // Estados de UI
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [quickViewProduct, setQuickViewProduct] = useState(null); // product object for modal
  const [selectedProducts, setSelectedProducts] = useState(new Set()); // Using a Set for efficient add/delete

  const { request: fetchApi, loading: apiLoading } = useApi('get');
  const { request: deleteProductsApi } = useApi(del); // For bulk delete

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchApi('/api/products?limit=2000', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      fetchApi('/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    ])
      .then(([productsResponse, categoriesResponse]) => {
        setProducts(productsResponse.products || []);
        setCategories(categoriesResponse || []);
      })
      .catch((err) => {
        toast.error('Falha ao carregar dados dos produtos.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Lógica de Categoria ---
  const addCategory = useCallback(
    async (categoryName) => {
      try {
        await post('/api/categories', { name: categoryName });
        toast.success(`Categoria "${categoryName}" adicionada com sucesso!`);
        await loadData();
      } catch (error) {
        // O interceptor de API já mostra um toast de erro
        console.error('Falha ao adicionar categoria:', error);
        throw error; // Re-throw para o componente saber que falhou
      }
    },
    [loadData],
  );

  const updateCategory = useCallback(
    async (categoryId, categoryName) => {
      try {
        await put(`/api/categories/${categoryId}`, { name: categoryName });
        toast.success(`Categoria atualizada para "${categoryName}"!`);
        await loadData();
      } catch (error) {
        console.error('Falha ao atualizar categoria:', error);
        throw error;
      }
    },
    [loadData],
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      try {
        await del(`/api/categories/${categoryId}`);
        toast.success('Categoria excluída com sucesso!');
        await loadData();
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // A mensagem específica do backend já é exibida pelo interceptor
          console.error('Tentativa de excluir categoria em uso.');
        } else {
          console.error('Falha ao excluir categoria:', error);
        }
        throw error;
      }
    },
    [loadData],
  );

  // Lógica de seleção
  const toggleProductSelection = useCallback((productId) => {
    setSelectedProducts((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }
      return newSelected;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProducts(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedProducts.size === filteredProducts.length) {
      clearSelection();
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  }, [filteredProducts, selectedProducts.size, clearSelection]);

  const deleteSelected = useCallback(() => {
    const ids = Array.from(selectedProducts);
    return deleteProductsApi('/api/products', { data: { ids } })
      .then(() => {
        toast.success(`${ids.length} produto(s) excluído(s) com sucesso!`);
        clearSelection();
        loadData();
      })
      .catch(() => {
        toast.error('Falha ao excluir produtos selecionados.');
      });
  }, [selectedProducts, deleteProductsApi, loadData, clearSelection]);

  useEffect(() => {
    let result = [...products];

    // 1. Filtragem
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter((p) => p.category_id === parseInt(categoryFilter));
    }
    if (productTypeFilter && productTypeFilter !== 'all') {
      result = result.filter((p) => p.productType === productTypeFilter);
    }
    if (stockStatusFilter && stockStatusFilter !== 'all') {
      result = result.filter((p) => {
        const totalStock = p.variations.reduce((acc, v) => acc + (v.stock_quantity || 0), 0);
        if (stockStatusFilter === 'inStock') return totalStock > 5;
        if (stockStatusFilter === 'lowStock') return totalStock > 0 && totalStock <= 5;
        if (stockStatusFilter === 'outOfStock') return totalStock === 0;
        return true;
      });
    }

    // 2. Ordenação
    const getMinPrice = (product) => {
      if (!product.variations || product.variations.length === 0) return 0;
      return Math.min(...product.variations.map((v) => v.price));
    };

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case 'price_desc':
        result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredProducts(result);
  }, [searchTerm, categoryFilter, stockStatusFilter, productTypeFilter, sortBy, products]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('');
    setStockStatusFilter('');
    setProductTypeFilter('');
    setSortBy('newest');
  }, []);

  const removeFilter = useCallback((filterType) => {
    switch (filterType) {
      case 'category':
        setCategoryFilter('');
        break;
      case 'stockStatus':
        setStockStatusFilter('');
        break;
      case 'productType':
        setProductTypeFilter('');
        break;
      default:
        break;
    }
  }, []);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (categoryFilter && categoryFilter !== 'all') {
      const cat = categories.find((c) => c.id === parseInt(categoryFilter));
      if (cat) filters.push({ type: 'category', label: `Categoria: ${cat.name}` });
    }
    if (stockStatusFilter && stockStatusFilter !== 'all') {
      const labels = {
        inStock: 'Em Estoque',
        lowStock: 'Estoque Baixo',
        outOfStock: 'Fora de Estoque',
      };
      filters.push({ type: 'stockStatus', label: `Estoque: ${labels[stockStatusFilter]}` });
    }
    if (productTypeFilter && productTypeFilter !== 'all') {
      const labels = { physical: 'Físico', service: 'Serviço' };
      filters.push({ type: 'productType', label: `Tipo: ${labels[productTypeFilter]}` });
    }
    return filters;
  }, [categoryFilter, stockStatusFilter, productTypeFilter, categories]);

  const contextValue = useMemo(
    () => ({
      loading: loading || apiLoading,
      products,
      categories,
      filteredProducts,
      filters: { searchTerm, categoryFilter, stockStatusFilter, productTypeFilter, sortBy },
      ui: { viewMode, quickViewProduct },
      selection: {
        selectedProducts,
        toggleProductSelection,
        clearSelection,
        handleSelectAll,
        deleteSelected,
      },
      categoryActions: {
        addCategory,
        updateCategory,
        deleteCategory,
      },
      activeFilters,
      reloadProducts: loadData,
      setSearchTerm,
      setCategoryFilter,
      setStockStatusFilter,
      setProductTypeFilter,
      setSortBy,
      setViewMode,
      setQuickViewProduct,
      clearFilters,
      removeFilter,
    }),
    [
      loading,
      apiLoading,
      products,
      categories,
      filteredProducts,
      searchTerm,
      categoryFilter,
      stockStatusFilter,
      productTypeFilter,
      sortBy,
      viewMode,
      quickViewProduct,
      selectedProducts,
      activeFilters,
      loadData,
      toggleProductSelection,
      clearSelection,
      handleSelectAll,
      deleteSelected,
      clearFilters,
      removeFilter,
      addCategory,
      updateCategory,
      deleteCategory,
    ],
  );

  return <ProductContext.Provider value={contextValue}>{children}</ProductContext.Provider>;
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
