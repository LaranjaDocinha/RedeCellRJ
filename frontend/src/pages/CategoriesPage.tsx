import React, { useState, useEffect } from 'react';
import { CategoryList } from '../components/CategoryList';
import { CategoryForm } from '../components/CategoryForm';

interface Category {
  id: number;
  name: string;
  description?: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/categories'); // Assuming proxy is set up for /categories to backend
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleCreateCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const response = await fetch('/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleUpdateCategory = async (id: number, categoryData: Omit<Category, 'id'>) => {
    try {
      const response = await fetch(`/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      setEditingCategory(undefined);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    try {
      const response = await fetch(`/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      // TODO: Display user-friendly error message
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Category Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Category
        </button>
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

      <CategoryList
        categories={categories}
        onEdit={handleEditClick}
        onDelete={handleDeleteCategory}
      />
    </div>
  );
};

export default CategoriesPage;