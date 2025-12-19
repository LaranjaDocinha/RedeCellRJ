import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ActionButton, StyledTableContainer, StyledTable, StyledTableBody } from './CustomerList.styled'; // Assuming these are styled components

interface Customer { // Assuming a basic Customer interface
  id: string;
  name: string;
  // Add other customer properties as needed
}

interface CustomerListProps {
  customers: Customer[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onEdit, onDelete }) => {
  return (
    <StyledTableContainer>
      <StyledTable>
        <StyledTableBody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>
                <ActionButton as={Link} to={`/customers/${customer.id}`} color="view" aria-label={`View ${customer.name}`}>
                  <FaEye />
                </ActionButton>
                <ActionButton
                  onClick={() => onEdit(customer.id)}
                  color="edit"
                  aria-label={`Edit ${customer.name}`}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  onClick={() => onDelete(customer.id)}
                  color="delete"
                  aria-label={`Delete ${customer.name}`}
                >
                  <FaTrash />
                </ActionButton>
              </td>
            </tr>
          ))}
        </StyledTableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};