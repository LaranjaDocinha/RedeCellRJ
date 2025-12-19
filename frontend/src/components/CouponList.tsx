import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Coupon } from '../pages/CouponsPage'; // Importar a interface Coupon
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  ActionButton,
} from './CouponList.styled';

interface CouponListProps {
  coupons: Coupon[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const CouponList: React.FC<CouponListProps> = ({ coupons, onEdit, onDelete }) => {
  return (
    <StyledTableContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <StyledTable>
        <StyledTableHead>
          <tr>
            <th>Code</th>
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
          {coupons.map((coupon) => (
            <tr key={coupon.id}>
              <td>{coupon.code}</td>
              <td>{coupon.type}</td>
              <td>{coupon.value}</td>
              <td>{new Date(coupon.start_date).toLocaleDateString()}</td>
              <td>{coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'N/A'}</td>
              <td>{coupon.min_purchase_amount || 'N/A'}</td>
              <td>{coupon.max_uses || 'N/A'}</td>
              <td>{coupon.uses_count}</td>
              <td>{coupon.is_active ? 'Yes' : 'No'}</td>
              <td>
                <ActionButton
                  onClick={() => onEdit(coupon.id)}
                  color="edit"
                  aria-label={`Edit ${coupon.code}`}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  onClick={() => onDelete(coupon.id)}
                  color="delete"
                  aria-label={`Delete ${coupon.code}`}
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
