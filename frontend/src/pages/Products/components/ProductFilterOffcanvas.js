import React from 'react';
import {
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from 'reactstrap';
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
  const categoryOptions = (categories || [])
    .filter((cat) => cat)
    .map((cat) => ({
      value: cat.id,
      label: cat.text,
    }));

  return (
    <Offcanvas direction='end' isOpen={offcanvasOpen} toggle={toggleOffcanvas}>
      <OffcanvasHeader toggle={toggleOffcanvas}>Filtros de Produtos</OffcanvasHeader>
      <OffcanvasBody>
        <Form>
          <FormGroup className='mb-3'>
            <Label for='search-product'>Pesquisa Rápida</Label>
            <Input
              id='search-product'
              placeholder='Nome, descrição...'
              type='text'
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </FormGroup>

          <FormGroup className='mb-3'>
            <Label for='filter-category'>Categoria</Label>
            <Select
              classNamePrefix='select2-selection'
              id='filter-category'
              name='filter-category'
              options={[{ value: '', label: 'Todas as Categorias' }, ...categoryOptions]}
              value={
                categoryOptions.find((option) => option.value === filterCategoryId) || {
                  value: '',
                  label: 'Todas as Categorias',
                }
              }
              onChange={(selectedOption) =>
                setFilterCategoryId(selectedOption ? selectedOption.value : '')
              }
            />
          </FormGroup>

          <FormGroup className='mb-3'>
            <Label for='filter-min-price'>Preço Mínimo</Label>
            <Input
              id='filter-min-price'
              placeholder='Min.'
              type='number'
              value={filterMinPrice}
              onChange={(e) => setFilterMinPrice(e.target.value)}
            />
          </FormGroup>

          <FormGroup className='mb-3'>
            <Label for='filter-max-price'>Preço Máximo</Label>
            <Input
              id='filter-max-price'
              placeholder='Max.'
              type='number'
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(e.target.value)}
            />
          </FormGroup>

          <div className='d-flex justify-content-between mt-4'>
            <Button color='secondary' onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
            <Button
              color='primary'
              onClick={() => {
                onApplyFilters();
                toggleOffcanvas();
              }}
            >
              Aplicar Filtros
            </Button>
          </div>
        </Form>
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default ProductFilterOffcanvas;
