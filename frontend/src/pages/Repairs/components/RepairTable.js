import React from 'react';
import moment from 'moment';
import { Table, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom'; // Import Link for customer details

import LoadingSpinner from '../../../components/Common/LoadingSpinner';

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
    <div className='table-responsive'>
      <Table className='table mb-0'>
        <thead>
          <tr>
            <th>
              <Input
                checked={repairs.length > 0 && selectedRepairIds.length === repairs.length}
                type='checkbox'
                onChange={handleSelectAllRepairs}
              />
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('customer_name')}>
              Cliente {sortColumn === 'customer_name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('device_type')}>
              Tipo Dispositivo{' '}
              {sortColumn === 'device_type' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('brand')}>
              Marca {sortColumn === 'brand' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('model')}>
              Modelo {sortColumn === 'model' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
              Data do Reparo{' '}
              {sortColumn === 'created_at' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
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
                  checked={selectedRepairIds.includes(repair.id)}
                  type='checkbox'
                  onChange={() => handleSelectRepair(repair.id)}
                />
              </td>
              <td>
                <button
                  className='btn btn-link p-0 border-0 align-baseline' // Adiciona classes para parecer um link
                  type='button'
                  onClick={() => {
                    const customer = customers.find((c) => c.id === repair.customer_id);
                    if (customer) {
                      handleCustomerDetailsClick(customer);
                    }
                  }}
                >
                  {repair.customer_name}
                </button>
              </td>
              <td>{repair.device_type}</td>
              <td>{repair.brand}</td>
              <td>{repair.model}</td>
              <td>{moment(repair.created_at).format('DD/MM/YYYY')}</td>
              <td>
                <Input
                  className={`text-${statusColors[repair.status]}`}
                  disabled={updatingStatusId === repair.id}
                  id={`status-${repair.id}`}
                  name='status'
                  style={{
                    width: 'auto',
                    display: 'inline-block',
                    marginRight: updatingStatusId === repair.id ? '5px' : '0',
                  }}
                  type='select'
                  value={repair.status}
                  onChange={(e) => handleStatusChange(repair.id, e.target.value)}
                >
                  {Object.entries(statusTranslations).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Input>
                {updatingStatusId === repair.id && <LoadingSpinner className='ms-2' size='sm' />}
              </td>
              <td>
                <Dropdown
                  direction='down'
                  isOpen={dropdownOpen[repair.id]}
                  toggle={() => toggleDropdown(repair.id)}
                >
                  <DropdownToggle caret color='secondary' size='sm'>
                    Opções
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => handleDetailsClick(repair)}>Detalhes</DropdownItem>
                    <DropdownItem onClick={() => handleEditClick(repair)}>Editar</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={() => handleDeleteRepair(repair.id)}>
                      Excluir
                    </DropdownItem>
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
