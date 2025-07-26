import React from 'react';
import moment from 'moment';
import { Table, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Spinner } from "reactstrap";
import { Link } from "react-router-dom"; // Import Link for customer details

const RepairTable = ({
  repairs,
  loading,
  error,
  selectedRepairIds,
  handleSelectAllRepairs,
  handleSelectRepair,
  handleSort,
  sortColumn,
  sortDirection,
  getRepairRowClass,
  customers,
  handleCustomerDetailsClick,
  statusColors,
  statusTranslations,
  handleStatusChange,
  updatingStatusId,
  dropdownOpen,
  toggleDropdown,
  handleDetailsClick,
  handleEditClick,
  handleDeleteRepair,
}) => {
  return (
    <div className="table-responsive">
      <Table className="table mb-0">
        <thead>
          <tr>
            <th>
              <Input
                type="checkbox"
                onChange={handleSelectAllRepairs}
                checked={repairs.length > 0 && selectedRepairIds.length === repairs.length}
              />
            </th>
            <th onClick={() => handleSort('customer_name')} style={{ cursor: 'pointer' }}>
              Cliente {sortColumn === 'customer_name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th onClick={() => handleSort('device_type')} style={{ cursor: 'pointer' }}>
              Tipo Dispositivo {sortColumn === 'device_type' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th onClick={() => handleSort('brand')} style={{ cursor: 'pointer' }}>
              Marca {sortColumn === 'brand' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th onClick={() => handleSort('model')} style={{ cursor: 'pointer' }}>
              Modelo {sortColumn === 'model' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
              Data do Reparo {sortColumn === 'created_at' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
              Status {sortColumn === 'status' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((repair) => (
            <tr key={repair.id} className={getRepairRowClass(repair)}>
              <td>
                <Input
                  type="checkbox"
                  checked={selectedRepairIds.includes(repair.id)}
                  onChange={() => handleSelectRepair(repair.id)}
                />
              </td>
              <td>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  const customer = customers.find(c => c.id === repair.customer_id);
                  if (customer) {
                    handleCustomerDetailsClick(customer);
                  }
                }}>
                  {repair.customer_name}
                </a>
              </td>
              <td>{repair.device_type}</td>
              <td>{repair.brand}</td>
              <td>{repair.model}</td>
              <td>{moment(repair.created_at).format('DD/MM/YYYY')}</td>
              <td>
                <Input
                  type="select"
                  name="status"
                  id={`status-${repair.id}`}
                  value={repair.status}
                  onChange={(e) => handleStatusChange(repair.id, e.target.value)}
                  disabled={updatingStatusId === repair.id}
                  className={`text-${statusColors[repair.status]}`}
                  style={{ width: 'auto', display: 'inline-block', marginRight: updatingStatusId === repair.id ? '5px' : '0' }}
                >
                  {Object.entries(statusTranslations).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Input>
                {updatingStatusId === repair.id && <Spinner size="sm" className="ms-2" />}
              </td>
              <td>
                <Dropdown isOpen={dropdownOpen[repair.id]} toggle={() => toggleDropdown(repair.id)} direction="down">
                  <DropdownToggle caret color="secondary" size="sm">
                    Opções
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => handleDetailsClick(repair)}>Detalhes</DropdownItem>
                    <DropdownItem onClick={() => handleEditClick(repair)}>Editar</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={() => handleDeleteRepair(repair.id)}>Excluir</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RepairTable;