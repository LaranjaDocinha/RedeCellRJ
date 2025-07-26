import React from "react";
import { Offcanvas, OffcanvasHeader, OffcanvasBody, Input, Button, FormGroup, Label } from "reactstrap";

const RepairFilterOffcanvas = ({
  offcanvasOpen,
  toggleOffcanvas,
  localSearchTerm,
  setLocalSearchTerm,
  filterStatus,
  setFilterStatus,
  selectedCustomerId,
  setSelectedCustomerId,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  customers,
  handleClearFilters,
  statusTranslations,
}) => {
  return (
    <Offcanvas isOpen={offcanvasOpen} toggle={toggleOffcanvas} direction="end">
      <OffcanvasHeader toggle={toggleOffcanvas}>Filtros de Reparos</OffcanvasHeader>
      <OffcanvasBody>
        <div className="mb-3 position-relative">
          <Input
            type="text"
            placeholder="Pesquisar reparos por marca, modelo, IMEI/Serial ou problema..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
          {localSearchTerm && (
            <Button
              close
              onClick={() => setLocalSearchTerm('')}
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }}
            />
          )}
        </div>
        <div className="mb-3">
          <FormGroup>
            <Label for="filterStatus">Filtrar por Status</Label>
            <Input
              type="select"
              name="filterStatus"
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos os Status</option>
              {Object.entries(statusTranslations).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Input>
          </FormGroup>
        </div>
        <div className="mb-3">
          <FormGroup>
            <Label for="filterCustomer">Filtrar por Cliente</Label>
            <Input
              type="select"
              name="filterCustomer"
              id="filterCustomer"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Todos os Clientes</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.phone})
                </option>
              ))}
            </Input>
          </FormGroup>
        </div>
        <div className="mb-3">
          <FormGroup>
            <Label for="filterStartDate">Data Inicial do Reparo</Label>
            <Input
              type="date"
              name="filterStartDate"
              id="filterStartDate"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </FormGroup>
        </div>
        <div className="mb-3">
          <FormGroup>
            <Label for="filterEndDate">Data Final do Reparo</Label>
            <Input
              type="date"
              name="filterEndDate"
              id="filterEndDate"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </FormGroup>
        </div>
        <Button color="primary" onClick={handleClearFilters}>Limpar Filtros</Button>
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default RepairFilterOffcanvas;
