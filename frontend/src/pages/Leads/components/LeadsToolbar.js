import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Input } from 'reactstrap';
import Select from 'react-select';
import { useDebounce } from '../../hooks/useDebounce';

const LeadsToolbar = ({ onFilterChange, onAddClick }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(null);
  const [source, setSource] = useState(null);

  const debouncedSearch = useDebounce(search, 500);
  const debouncedStatus = useDebounce(status, 500);
  const debouncedSource = useDebounce(source, 500);

  const statusOptions = [
    { value: 'Novo', label: 'Novo' },
    { value: 'Qualificado', label: 'Qualificado' },
    { value: 'Contato', label: 'Contato' },
    { value: 'Convertido', label: 'Convertido' },
    { value: 'Perdido', label: 'Perdido' },
  ];

  const sourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Indicação', label: 'Indicação' },
    { value: 'Telefone', label: 'Telefone' },
    { value: 'Email', label: 'Email' },
    { value: 'Outro', label: 'Outro' },
  ];

  const handleFilter = useCallback(() => {
    const filters = {};
    if (debouncedSearch) filters.search = debouncedSearch;
    if (debouncedStatus) filters.status = debouncedStatus.value;
    if (debouncedSource) filters.source = debouncedSource.value;
    onFilterChange(filters);
  }, [debouncedSearch, debouncedStatus, debouncedSource, onFilterChange]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  return (
    <Row className="mb-3 align-items-end">
      <Col md={3}>
        <Label for="search">Buscar</Label>
        <Input
          type="text"
          name="search"
          id="search"
          placeholder="Nome, email ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Col>
      <Col md={3}>
        <Label for="status">Status</Label>
        <Select
          options={statusOptions}
          isClearable
          placeholder="Filtrar por status..."
          onChange={(selectedOption) => setStatus(selectedOption)}
        />
      </Col>
      <Col md={3}>
        <Label for="source">Origem</Label>
        <Select
          options={sourceOptions}
          isClearable
          placeholder="Filtrar por origem..."
          onChange={(selectedOption) => setSource(selectedOption)}
        />
      </Col>
      <Col md={3} className="text-end">
        <Button color="primary" onClick={onAddClick}>
          <i className="bx bx-plus me-1"></i> Adicionar Lead
        </Button>
      </Col>
    </Row>
  );
};

export default LeadsToolbar;
