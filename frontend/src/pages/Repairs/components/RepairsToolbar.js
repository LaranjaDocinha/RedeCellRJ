import React from 'react';
import { Row, Col, Input, Button } from 'reactstrap';

const RepairsToolbar = ({ onSearch, onFilter }) => {
  return (
    <div className='mb-4'>
      <Row>
        <Col md={4}>
          <Input
            placeholder='Buscar por O.S., Cliente, IMEI...'
            type='text'
            onChange={(e) => onSearch(e.target.value)}
          />
        </Col>
        <Col className='d-flex justify-content-end' md={8}>
          <Button color='light' onClick={onFilter}>
            <i className='bx bx-filter-alt me-1'></i> Filtros
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default RepairsToolbar;
