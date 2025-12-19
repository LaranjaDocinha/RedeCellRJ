import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { LoyaltyTier } from '../pages/LoyaltyTiersPage'; // Importar a interface LoyaltyTier
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  ActionButton,
} from './LoyaltyTierList.styled';

interface LoyaltyTierListProps {
  tiers: LoyaltyTier[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const LoyaltyTierList: React.FC<LoyaltyTierListProps> = ({ tiers, onEdit, onDelete }) => {
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
            <th>Min Points</th>
            <th>Description</th>
            <th>Benefits</th>
            <th>Actions</th>
          </tr>
        </StyledTableHead>
        <StyledTableBody>
          {tiers.map((tier) => (
            <tr key={tier.id}>
              <td>{tier.name}</td>
              <td>{tier.min_points}</td>
              <td>{tier.description || 'N/A'}</td>
              <td>{tier.benefits ? JSON.stringify(tier.benefits) : 'N/A'}</td>
              <td>
                <ActionButton
                  onClick={() => onEdit(tier.id)}
                  color="edit"
                  aria-label={`Edit ${tier.name}`}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  onClick={() => onDelete(tier.id)}
                  color="delete"
                  aria-label={`Delete ${tier.name}`}
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
