import React from 'react';
import { Row, Col, Input, Button, FormGroup, Label } from 'reactstrap';
import DateRangePicker from '../Common/DateRangePicker';
import { motion } from 'framer-motion';

const QuotationsToolbar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  startDate,
  endDate,
  setDateRange,
  onAddNew,
  animationDelay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className="quotations-toolbar mb-4"
    >
      <Row className="align-items-end">
        <Col md="4">
          <FormGroup>
            <Label for="searchQuery">Buscar</Label>
            <Input
              type="text"
              id="searchQuery"
              placeholder="Buscar por cliente, ID, etc."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Label for="statusFilter">Status</Label>
            <Input
              type="select"
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Draft">Rascunho</option>
              <option value="Sent">Enviado</option>
              <option value="Approved">Aprovado</option>
              <option value="Rejected">Rejeitado</option>
              <option value="ConvertedToSale">Convertido em Venda</option>
            </Input>
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Label for="dateRange">Período</Label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              setStartDate={(date) => setDateRange([date, endDate])}
              setEndDate={(date) => setDateRange([startDate, date])}
            />
          </FormGroup>
        </Col>
        <Col md="2" className="text-right">
          <Button color="primary" onClick={onAddNew}>
            <i className="bx bx-plus me-2"></i> Nova Cotação
          </Button>
        </Col>
      </Row>
    </motion.div>
  );
};

export default QuotationsToolbar;