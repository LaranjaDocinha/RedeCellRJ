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

const ProductToolbar = ({ onManageCategories }) => {
  const { selection, filteredProducts } = useContext(ProductContext);
  const { selectedProducts, handleSelectAll } = selection;
  const checkboxRef = useRef();

  const totalFiltered = filteredProducts.length;
  const totalSelected = selectedProducts.size;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = totalSelected > 0 && totalSelected < totalFiltered;
    }
  }, [totalSelected, totalFiltered]);

  return (
    <Row className="product-toolbar mb-3 g-3 align-items-center">
      <Col lg={1} md={1} className="d-flex align-items-center">
        <Input
          type="checkbox"
          id="select-all-checkbox"
          className="form-check-input"
          ref={checkboxRef}
          checked={totalSelected > 0 && totalSelected === totalFiltered}
          onChange={handleSelectAll}
          disabled={totalFiltered === 0}
        />
        <label htmlFor="select-all-checkbox" className="ms-2 text-muted">
          {totalSelected > 0 ? `${totalSelected}` : ''}
        </label>
      </Col>
      <Col lg={3} md={5}>
        <SearchInput />
      </Col>
      <Col lg={2} md={6}>
        <InputGroup>
          <CategoryFilter />
          <Button onClick={onManageCategories} color="secondary" outline title="Gerenciar categorias">
            <i className="bx bx-cog"></i>
          </Button>
        </InputGroup>
      </Col>
      <Col lg={2} md={4}>
        <StockStatusFilter />
      </Col>
      <Col lg={2} md={4}>
        <ProductTypeFilter />
      </Col>
      <Col lg={2} md={4} className="ms-auto d-flex justify-content-end align-items-center gap-3">
        <SortBy />
        <ViewSwitcher />
      </Col>
    </Row>
  );
};

export default ProductToolbar;
