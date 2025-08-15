import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Row, Col, Button, Input, Label } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { useDebounce } from '../../../hooks/useDebounce';
import useApi from '../../../hooks/useApi';

const QuotationsToolbar = ({ onFilterChange }) => { // Removed onAddClick from props
  const [customer, setCustomer] = useState(null);
  const [status, setStatus] = useState(null);
  const [dates, setDates] = useState([]);

  const debouncedCustomer = useDebounce(customer, 500);
  const debouncedStatus = useDebounce(status, 500);
  const debouncedDates = useDebounce(dates, 500);

  // Fetch customers for filter dropdown
  const { data: customersData } = useApi('/api/customers');
  const customerOptions = customersData?.customers?.map(c => ({ value: c.id, label: c.name })) || [];

  const statusOptions = [
    { value: 'Draft', label: 'Rascunho' },
    { value: 'Sent', label: 'Enviado' },
    { value: 'Approved', label: 'Aprovado' },
    { value: 'Rejected', label: 'Rejeitado' },
    { value: 'ConvertedToSale', label: 'Convertido em Venda' },
  ];

  const handleFilter = useCallback(() => {
    const filters = {};
    if (debouncedCustomer) filters.customer_id = debouncedCustomer.value;
    if (debouncedStatus) filters.status = debouncedStatus.value;
    if (debouncedDates[0]) filters.startDate = debouncedDates[0].toISOString().split('T')[0];
    if (debouncedDates[1]) filters.endDate = debouncedDates[1].toISOString().split('T')[0];
    onFilterChange(filters);
  }, [debouncedCustomer, debouncedStatus, debouncedDates, onFilterChange]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  return (
    <Row className="mb-3 align-items-end">
      <Col md={3}>
        <Label for="customerFilter">Cliente</Label>
        <Select
          options={customerOptions}
          isClearable
          placeholder="Filtrar por cliente..."
          onChange={(selectedOption) => setCustomer(selectedOption)}
          id="customerFilter"
        />
      </Col>
      <Col md={3}>
        <Label for="statusFilter">Status</Label>
        <Select
          options={statusOptions}
          isClearable
          placeholder="Filtrar por status..."
          onChange={(selectedOption) => setStatus(selectedOption)}
          id="statusFilter"
        />
      </Col>
      <Col md={3}>
        <Label for="dateRangeFilter">Data</Label>
        <Flatpickr
          className="form-control d-block"
          placeholder="Filtrar por data..."
          options={{
            mode: 'range',
            dateFormat: 'd/m/Y',
          }}
          onChange={(selectedDates) => setDates(selectedDates)}
          id="dateRangeFilter"
        />
      </Col>
      <Col md={3} className="text-end">
        {/* Removed Add Quotation button as it's now in the main page */}
        {/* Add a clear filters button if needed */}
      </Col>
    </Row>
  );
};

QuotationsToolbar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  // onAddClick: PropTypes.func.isRequired, // Removed as button is removed
};

export default QuotationsToolbar;