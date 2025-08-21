import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Input, Label } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { useDebounce } from '../../hooks/useDebounce';
import useApi from '../../hooks/useApi';

const SalesHistoryToolbar = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [dates, setDates] = useState([]);

  const debouncedSearch = useDebounce(search, 500);
  const debouncedCustomer = useDebounce(customer, 500);
  const debouncedPaymentMethod = useDebounce(paymentMethod, 500);
  const debouncedDates = useDebounce(dates, 500);

  // Fetch customers for filter dropdown
  const { data: customersData, request: fetchCustomers } = useApi('get');
  const customerOptions = customersData?.customers?.map(c => ({ value: c.id, label: c.name })) || [];

  // Fetch payment methods for filter dropdown
  const { data: paymentMethodsData, request: fetchPaymentMethods } = useApi('get');
  const paymentMethodOptions = paymentMethodsData?.map(pm => ({ value: pm.name, label: pm.name })) || [];

  useEffect(() => {
    fetchCustomers('/api/customers');
    fetchPaymentMethods('/api/payment-methods');
  }, [fetchCustomers, fetchPaymentMethods]);

  const handleFilter = useCallback(() => {
    const filters = {};
    if (debouncedSearch) filters.search = debouncedSearch;
    if (debouncedCustomer) filters.customer_id = debouncedCustomer.value;
    if (debouncedPaymentMethod) filters.payment_method = debouncedPaymentMethod.value;
    if (debouncedDates[0]) filters.startDate = debouncedDates[0].toISOString().split('T')[0];
    if (debouncedDates[1]) filters.endDate = debouncedDates[1].toISOString().split('T')[0];
    onFilterChange(filters);
  }, [debouncedSearch, debouncedCustomer, debouncedPaymentMethod, debouncedDates, onFilterChange]);

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
          placeholder="ID, cliente ou usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Col>
      <Col md={3}>
        <Label for="customerFilter">Cliente</Label>
        <Select
          options={customerOptions}
          isLoading={!customersData}
          isClearable
          placeholder="Filtrar por cliente..."
          onChange={(selectedOption) => setCustomer(selectedOption)}
          id="customerFilter"
        />
      </Col>
      <Col md={3}>
        <Label for="paymentMethodFilter">Método de Pagamento</Label>
        <Select
          options={paymentMethodOptions}
          isLoading={!paymentMethodsData}
          isClearable
          placeholder="Filtrar por método..."
          onChange={(selectedOption) => setPaymentMethod(selectedOption)}
          id="paymentMethodFilter"
        />
      </Col>
      <Col md={3}>
        <Label for="dateRangeFilter">Data da Venda</Label>
        <Flatpickr
          className="form-control"
          placeholder="Filtrar por data..."
          options={{
            mode: 'range',
            dateFormat: 'd/m/Y',
          }}
          onChange={(selectedDates) => setDates(selectedDates)}
          id="dateRangeFilter"
        />
      </Col>
    </Row>
  );
};

export default SalesHistoryToolbar;