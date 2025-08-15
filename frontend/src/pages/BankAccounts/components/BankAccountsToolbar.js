import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Row, Col, Button } from 'reactstrap';

const BankAccountsToolbar = ({ onAddClick }) => {
  return (
    <Row className="mb-3">
      <Col md={12} className="text-end">
        <Button color="primary" onClick={onAddClick}>
          <i className="bx bx-plus me-1"></i> Adicionar Conta Bancária
        </Button>
      </Col>
    </Row>
  );
};

BankAccountsToolbar.propTypes = {
  onAddClick: PropTypes.func.isRequired,
};

export default BankAccountsToolbar;