
import React, { useState, useEffect } from 'react';
import { CategoryList } from '../components/CategoryList';
import { CategoryForm } from '../components/CategoryForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled'; // Reutilizando componentes estilizados
import { Button } from '../components/Button'; // Importar o componente Button
import Loading from '../components/Loading'; // Importar o componente Loading
import { StyledEmptyState } from '../components/AuditLogList.styled'; // Reutilizando StyledEmptyState
import { FaFolderOpen } from 'react-icons/fa'; // Ícone para estado vazio

interface Category {
  id: number;
  name: string;
  description?: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCategories(data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      addNotification(`Failed to fetch categories: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchCategories();
      addNotification('Category created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating category:", error);
      addNotification(`Failed to create category: ${error.message}`, 'error');
    }
  };

  const handleUpdateCategory = async (id: number, categoryData: Omit<Category, 'id'>) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingCategory(undefined);
      setShowForm(false);
      fetchCategories();
      addNotification('Category updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating category:", error);
      addNotification(`Failed to update category: ${error.message}`, 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchCategories();
      addNotification('Category deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting category:", error);
      addNotification(`Failed to delete category: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const categoryToEdit = categories.find((c) => c.id === id);
    if (categoryToEdit) {
      setEditingCategory(categoryToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingCategory(undefined);
    setShowForm(false);
  };

  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledPageTitle
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Category Management
      </StyledPageTitle>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setShowForm(true)}
              variant="contained"
              color="primary"
              label="Add New Category"
            />
          </div>

          {showForm && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <CategoryForm
                initialData={editingCategory}
                onSubmit={(data) => {
                  if (editingCategory) {
                    handleUpdateCategory(editingCategory.id, data);
                  } else {
                    handleCreateCategory(data);
                  }
                }}
                onCancel={handleCancelForm}
              />
            </div>
          )}

          {categories.length === 0 && !showForm ? (
            <StyledEmptyState
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FaFolderOpen />
              <p>No categories found. Click "Add New Category" to get started!</p>
            </StyledEmptyState>
          ) : (
            <CategoryList
              categories={categories}
              onEdit={handleEditClick}
              onDelete={handleDeleteCategory}
            />
          )}
        </>
      )}
    </StyledPageContainer>
  );
};

export default CategoriesPage;