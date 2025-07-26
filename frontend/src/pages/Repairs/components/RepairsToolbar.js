import React from 'react';
import { Row, Col, Input, Button } from 'reactstrap';

const RepairsToolbar = ({ onSearch, onFilter }) => {
  return (
    <div className="mb-4">
      <Row>
        <Col md={4}>
          <Input
            type="text"
            placeholder="Buscar por O.S., Cliente, IMEI..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </Col>
        <Col md={8} className="d-flex justify-content-end">
          <Button color="light" onClick={onFilter}>
            <i className="bx bx-filter-alt me-1"></i> Filtros
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default RepairsToolbar;
