import React, { useContext, useRef, useEffect } from 'react';
import { Row, Col, Input, Button, InputGroup } from 'reactstrap';

import { ProductContext } from '../../../context/ProductContext';

import SearchInput from './SearchInput';
import CategoryFilter from './CategoryFilter';
import StockStatusFilter from './StockStatusFilter';
import ProductTypeFilter from './ProductTypeFilter';
import SortBy from './SortBy';
import ViewSwitcher from './ViewSwitcher';
import './ProductToolbar.scss';

const ProductToolbar = ({ onManageCategories, onPrintLabels }) => {
  const { selection, filteredProducts, ui, setFilters } = useContext(ProductContext);
  const { viewMode } = ui;
  const { selectedProducts, handleSelectAll } = selection;
  const checkboxRef = useRef();

  const totalFiltered = filteredProducts.length;
  const totalSelected = selectedProducts.size;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = totalSelected > 0 && totalSelected < totalFiltered;
    }
  }, [totalSelected, totalFiltered]);

  const handleMinPriceChange = (e) => {
    setFilters(prevFilters => ({ ...prevFilters, min_price: e.target.value }));
  };

  const handleMaxPriceChange = (e) => {
    setFilters(prevFilters => ({ ...prevFilters, max_price: e.target.value }));
  };

  return (
    <Row className='product-toolbar mb-3 g-3 align-items-center'>
      <Col className='d-flex align-items-center' lg={1} md={1}>
        <Input
          ref={checkboxRef}
          checked={totalSelected > 0 && totalSelected === totalFiltered}
          className='form-check-input'
          disabled={totalFiltered === 0}
          id='select-all-checkbox'
          type='checkbox'
          onChange={handleSelectAll}
        />
        <label className='ms-2 text-muted' htmlFor='select-all-checkbox'>
          {totalSelected > 0 ? `${totalSelected}` : ''}
        </label>
      </Col>
      <Col lg={3} md={5}>
        <SearchInput />
      </Col>
      <Col lg={4} md={6}>
        <InputGroup>
          <CategoryFilter />
          <Input
            type="number"
            placeholder="Preço Mín."
            onChange={handleMinPriceChange}
            style={{ maxWidth: '120px' }}
          />
          <Input
            type="number"
            placeholder="Preço Máx."
            onChange={handleMaxPriceChange}
            style={{ maxWidth: '120px' }}
          />
          <Button
            outline
            color='secondary'
            title='Gerenciar categorias'
            onClick={onManageCategories}
          >
            <i className='bx bx-cog'></i>
          </Button>
          <Button outline color='secondary' onClick={onPrintLabels}>
            <i className='bx bx-printer me-1'></i>Etiquetas
          </Button>
          <Button outline color='secondary' onClick={() => alert('Importar Produtos')}>
            {' '}
            {/* Placeholder */}
            <i className='bx bx-import me-1'></i>Importar
          </Button>
          <Button outline color='secondary' onClick={() => alert('Exportar Produtos')}>
            {' '}
            {/* Placeholder */}
            <i className='bx bx-export me-1'></i>Exportar
          </Button>
        </InputGroup>
      </Col>
      <Col lg={1} md={4}>
        <StockStatusFilter />
      </Col>
      <Col lg={1} md={4}>
        <ProductTypeFilter />
      </Col>
      <Col className='d-flex justify-content-end align-items-center gap-3' lg={2} md={2}>
        <SortBy />
        <ViewSwitcher />
      </Col>
    </Row>
  );
};

export default ProductToolbar;