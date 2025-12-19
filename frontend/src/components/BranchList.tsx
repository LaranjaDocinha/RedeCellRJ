import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  ActionButton,
} from './BranchList.styled';

interface BranchListProps {
  branches: Branch[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const BranchList: React.FC<BranchListProps> = ({ branches, onEdit, onDelete }) => {
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
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </StyledTableHead>
        <StyledTableBody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>{branch.name}</td>
              <td>{branch.address || 'N/A'}</td>
              <td>{branch.phone || 'N/A'}</td>
              <td>{branch.email || 'N/A'}</td>
              <td>
                <ActionButton
                  onClick={() => onEdit(branch.id)}
                  color="edit"
                  aria-label={`Edit ${branch.name}`}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  onClick={() => onDelete(branch.id)}
                  color="delete"
                  aria-label={`Delete ${branch.name}`}
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
