import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Category } from '../pages/CategoriesPage'; // Importar a interface Category
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  ActionButton,
} from './CategoryList.styled';

interface CategoryListProps {
  categories: Category[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit, onDelete }) => {
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
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </StyledTableHead>
        <StyledTableBody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description || 'N/A'}</td>
              <td>
                <ActionButton
                  onClick={() => onEdit(category.id)}
                  color="edit"
                  aria-label={`Edit ${category.name}`}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  onClick={() => onDelete(category.id)}
                  color="delete"
                  aria-label={`Delete ${category.name}`}
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
