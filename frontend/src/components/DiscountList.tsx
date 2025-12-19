import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Discount } from '../pages/DiscountsPage'; // Importar a interface Discount
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  ActionButton,
} from './DiscountList.styled';

interface DiscountListProps {
  discounts: Discount[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const DiscountList: React.FC<DiscountListProps> = ({ discounts, onEdit, onDelete }) => {
  return (
    <StyledTableContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <StyledTable>
        <StyledTableHead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Value</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Min Purchase</th>
            <th>Max Uses</th>
            <th>Uses Count</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </StyledTableHead>
        <StyledTableBody>
          {discounts.map((discount) => (
            <tr key={discount.id}>
              <td>{discount.name}</td>
              <td>{discount.type}</td>
              <td>{discount.value}</td>
              <td>{new Date(discount.start_date).toLocaleDateString()}</td>
              <td>
                {discount.end_date ? new Date(discount.end_date).toLocaleDateString() : 'N/A'}
              </td>
              <td>{discount.min_purchase_amount || 'N/A'}</td>
              <td>{discount.max_uses || 'N/A'}</td>
              <td>{discount.uses_count}</td>
              <td>{discount.is_active ? 'Yes' : 'No'}</td>
              <td>
                <ActionButton
                  onClick={() => onEdit(discount.id)}
                  color="edit"
                  aria-label={`Edit ${discount.name}`}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  onClick={() => onDelete(discount.id)}
                  color="delete"
                  aria-label={`Delete ${discount.name}`}
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
