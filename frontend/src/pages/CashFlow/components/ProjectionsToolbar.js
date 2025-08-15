import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Row, Col, Button, Input, Label } from 'reactstrap'; // Added Input, Label
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { useDebounce } from '../../../hooks/useDebounce';

const ProjectionsToolbar = ({ onFilterChange }) => { // Removed onAddClick from props
  const [dates, setDates] = useState([]);
  const [type, setType] = useState(null);

  const debouncedDates = useDebounce(dates, 500);
  const debouncedType = useDebounce(type, 500);

  const typeOptions = [
    { value: 'inflow', label: 'Entrada' },
    { value: 'outflow', label: 'Saída' },
  ];

  const handleFilter = useCallback(() => {
    const filters = {};
    if (debouncedDates[0]) filters.startDate = debouncedDates[0].toISOString().split('T')[0];
    if (debouncedDates[1]) filters.endDate = debouncedDates[1].toISOString().split('T')[0];
    if (debouncedType) filters.type = debouncedType.value;
    onFilterChange(filters);
  }, [debouncedDates, debouncedType, onFilterChange]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  return (
    <Row className="mb-3 align-items-end"> {/* Added align-items-end */}
      <Col md={4}> {/* Adjusted Col size */}
        <Label for="date-range-picker">Período:</Label>
        <Flatpickr
          className="form-control d-block" // Added d-block for full width
          placeholder="Filtrar por data..."
          options={{
            mode: 'range',
            dateFormat: 'd/m/Y',
          }}
          onChange={(selectedDates) => setDates(selectedDates)}
          id="date-range-picker"
        />
      </Col>
      <Col md={4}> {/* Adjusted Col size */}
        <Label for="type-select">Tipo:</Label>
        <Select
          options={typeOptions}
          isClearable
          placeholder="Filtrar por tipo..."
          onChange={(selectedOption) => setType(selectedOption)}
          id="type-select"
        />
      </Col>
      <Col md={4} className="text-end"> {/* Adjusted Col size */}
        {/* Removed Add Projection button as it's now in the main page */}
        {/* Add a clear filters button if needed */}
      </Col>
    </Row>
  );
};

ProjectionsToolbar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  // onAddClick: PropTypes.func.isRequired, // Removed as button is removed
};

export default ProjectionsToolbar;