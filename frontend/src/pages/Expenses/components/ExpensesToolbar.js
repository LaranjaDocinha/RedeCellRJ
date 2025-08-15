import React, { useState, useEffect } from 'react';
import { Row, Col, Button } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import useApi from '../../hooks/useApi'; // Hook para buscar categorias, se aplicável

const ExpensesToolbar = ({ onFilterChange, onAddClick }) => {
  const [dates, setDates] = useState([]);
  const [category, setCategory] = useState(null);

  // Exemplo de como buscar categorias dinamicamente
  // const { data: categoriesData } = useApi('/api/expense-categories'); 
  // const categoryOptions = categoriesData?.map(c => ({ value: c.id, label: c.name })) || [];

  // Opções de categoria estáticas por enquanto
  const categoryOptions = [
    { value: 'Material de Escritório', label: 'Material de Escritório' },
    { value: 'Salários', label: 'Salários' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Manutenção', label: 'Manutenção' },
    { value: 'Aluguel', label: 'Aluguel' },
    { value: 'Outros', label: 'Outros' },
  ];

  useEffect(() => {
    const filters = {};
    if (dates[0]) filters.startDate = dates[0].toISOString().split('T')[0];
    if (dates[1]) filters.endDate = dates[1].toISOString().split('T')[0];
    if (category) filters.category = category.value;
    
    onFilterChange(filters);
  }, [dates, category, onFilterChange]);

  return (
    <Row className="mb-3">
      <Col md={3}>
        <Flatpickr
          className="form-control"
          placeholder="Filtrar por data..."
          options={{
            mode: 'range',
            dateFormat: 'd/m/Y',
          }}
          onChange={(selectedDates) => setDates(selectedDates)}
        />
      </Col>
      <Col md={3}>
        <Select
          options={categoryOptions}
          isClearable
          placeholder="Filtrar por categoria..."
          onChange={(selectedOption) => setCategory(selectedOption)}
        />
      </Col>
      <Col md={6} className="text-end">
        <Button color="primary" onClick={onAddClick}>
          <i className="bx bx-plus me-1"></i> Adicionar Despesa
        </Button>
      </Col>
    </Row>
  );
};

export default ExpensesToolbar;
