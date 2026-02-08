import React from 'react';
import { FaEdit, FaTrash, FaShieldAlt } from 'react-icons/fa';
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  ActionButton,
} from './PermissionList.styled'; // Reutilizando estilos de tabela

interface Role {
  id: number;
  name: string;
}

interface RoleListProps {
  roles: Role[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onManagePermissions: (id: number) => void;
}

const RoleList: React.FC<RoleListProps> = ({
  roles,
  onEdit,
  onDelete,
  onManagePermissions,
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
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.id}</td>
              <td>{role.name}</td>
              <td>
                <ActionButton
                  color="edit"
                  onClick={() => onManagePermissions(role.id)}
                  title="Manage Permissions"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaShieldAlt />
                </ActionButton>
                <ActionButton
                  color="edit"
                  onClick={() => onEdit(role.id)}
                  title="Edit Role"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  color="delete"
                  onClick={() => onDelete(role.id)}
                  title="Delete Role"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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

export default RoleList;