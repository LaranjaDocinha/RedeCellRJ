import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Input, Label } from 'reactstrap';
import Select from 'react-select';
import { useDebounce } from '../../hooks/useDebounce';

const ChecklistTemplatesToolbar = ({ onFilterChange, onAddClick }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);

  const debouncedSearch = useDebounce(search, 500);
  const debouncedCategory = useDebounce(category, 500);

  const categoryOptions = [
    { value: 'Reparo de Celular', label: 'Reparo de Celular' },
    { value: 'Manutenção de Notebook', label: 'Manutenção de Notebook' },
    { value: 'Instalação de Software', label: 'Instalação de Software' },
    { value: 'Outro', label: 'Outro' },
  ];

  const handleFilter = useCallback(() => {
    const filters = {};
    if (debouncedSearch) filters.search = debouncedSearch;
    if (debouncedCategory) filters.category = debouncedCategory.value;
    onFilterChange(filters);
  }, [debouncedSearch, debouncedCategory, onFilterChange]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  return (
    <Row className="mb-3 align-items-end">
      <Col md={4}>
        <Label for="search">Buscar</Label>
        <Input
          type="text"
          name="search"
          id="search"
          placeholder="Nome ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Col>
      <Col md={4}>
        <Label for="category">Categoria</Label>
        <Select
          options={categoryOptions}
          isClearable
          placeholder="Filtrar por categoria..."
          onChange={(selectedOption) => setCategory(selectedOption)}
          id="category"
        />
      </Col>
      <Col md={4} className="text-end">
        <Button color="primary" onClick={onAddClick}>
          <i className="bx bx-plus me-1"></i> Adicionar Modelo
        </Button>
      </Col>
    </Row>
  );
};

export default ChecklistTemplatesToolbar;
