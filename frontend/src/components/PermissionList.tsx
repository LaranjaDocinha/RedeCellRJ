import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  ActionButton,
} from './PermissionList.styled';

interface Permission {
  id: number;
  name: string;
}

interface PermissionListProps {
  permissions: Permission[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const PermissionList: React.FC<PermissionListProps> = ({
  permissions,
  onEdit,
  onDelete,
}) => {
  return (
    <StyledTableContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledTable>
        <StyledTableHead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </StyledTableHead>
        <StyledTableBody>
          {Array.isArray(permissions) && permissions.length > 0 ? (
            permissions.map((permission) => (
            <tr key={permission.id}>
              <td>{permission.id}</td>
              <td>{permission.name}</td>
              <td>
                <ActionButton
                  color="edit"
                  onClick={() => onEdit(permission.id)}
                  title="Edit Permission"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  color="delete"
                  onClick={() => onDelete(permission.id)}
                  title="Delete Permission"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTrash />
                </ActionButton>
              </td>
            </tr>
          ))) : (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                Nenhuma permissão encontrada.
              </td>
            </tr>
          )}
        </StyledTableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};

export default PermissionList;