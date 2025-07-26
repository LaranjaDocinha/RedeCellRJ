import React from "react";
import { Offcanvas, OffcanvasHeader, OffcanvasBody, Form, FormGroup, Label, Input, Button } from "reactstrap";
import Select from 'react-select';

const ProductFilterOffcanvas = ({
  offcanvasOpen,
  toggleOffcanvas,
  localSearchTerm,
  setLocalSearchTerm,
  filterCategoryId,
  setFilterCategoryId,
  filterMinPrice,
  setFilterMinPrice,
  filterMaxPrice,
  setFilterMaxPrice,
  categories = [], // Default to empty array if undefined
  handleClearFilters,
  onApplyFilters, // New prop for applying filters
}) => {
  const categoryOptions = (categories || []).filter(cat => cat).map(cat => ({
    value: cat.id,
    label: cat.text
  }));

  return (
    <Offcanvas isOpen={offcanvasOpen} toggle={toggleOffcanvas} direction="end">
      <OffcanvasHeader toggle={toggleOffcanvas}>Filtros de Produtos</OffcanvasHeader>
      <OffcanvasBody>
        <Form>
          <FormGroup className="mb-3">
            <Label for="search-product">Pesquisa Rápida</Label>
            <Input
              type="text"
              id="search-product"
              placeholder="Nome, descrição..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <Label for="filter-category">Categoria</Label>
            <Select
              id="filter-category"
              name="filter-category"
              options={[{ value: '', label: 'Todas as Categorias' }, ...categoryOptions]}
              value={categoryOptions.find(option => option.value === filterCategoryId) || { value: '', label: 'Todas as Categorias' }}
              onChange={(selectedOption) => setFilterCategoryId(selectedOption ? selectedOption.value : '')}
              classNamePrefix="select2-selection"
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <Label for="filter-min-price">Preço Mínimo</Label>
            <Input
              type="number"
              id="filter-min-price"
              placeholder="Min."
              value={filterMinPrice}
              onChange={(e) => setFilterMinPrice(e.target.value)}
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <Label for="filter-max-price">Preço Máximo</Label>
            <Input
              type="number"
              id="filter-max-price"
              placeholder="Max."
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(e.target.value)}
            />
          </FormGroup>

          <div className="d-flex justify-content-between mt-4">
            <Button color="secondary" onClick={handleClearFilters}>Limpar Filtros</Button>
            <Button color="primary" onClick={() => { onApplyFilters(); toggleOffcanvas(); }}>Aplicar Filtros</Button>
          </div>
        </Form>
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default ProductFilterOffcanvas;