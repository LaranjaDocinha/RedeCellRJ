import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Permission } from '../pages/PermissionsPage'; // Importar a interface Permission
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  ActionButton,
} from './PermissionList.styled';

interface PermissionListProps {
  permissions: Permission[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const PermissionList: React.FC<PermissionListProps> = ({
  permissions,
  onEdit,
  onDelete,
}) => {
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
            <th>Actions</th>
          </tr>
        </StyledTableHead>
        <StyledTableBody>
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td>{permission.name}</td>
              <td>
                <ActionButton
                  onClick={() => onEdit(permission.id)}
                  color="edit"
                  aria-label={`Edit ${permission.name}`}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  onClick={() => onDelete(permission.id)}
                  color="delete"
                  aria-label={`Delete ${permission.name}`}
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
