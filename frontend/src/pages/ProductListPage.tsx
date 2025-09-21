import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useNotification } from '../components/NotificationProvider';
import Loading from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';
import ProductForm from '../components/ProductForm'; // Componente para o formulário de produto
import { ImageUpload } from '../components/ImageUpload'; // Import ImageUpload

interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  branch_id: number;
  imageUrl?: string; // Add imageUrl
  variations: any[]; // Simplificado por enquanto
}

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { token } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
      addNotification(`Failed to fetch products: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      addNotification('Product deleted successfully!', 'success');
      fetchProducts(); // Refresh list
    } catch (err: any) {
      addNotification(`Failed to delete product: ${err.message}`, 'error');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `http://localhost:3000/products/${editingProduct.id}` : 'http://localhost:3000/products';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      addNotification(`Product ${editingProduct ? 'updated' : 'created'} successfully!`, 'success');
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (err: any) {
      addNotification(`Failed to ${editingProduct ? 'update' : 'create'} product: ${err.message}`, 'error');
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'sku', header: 'SKU' },
    { key: 'branch_id', header: 'Branch ID' },
    {
      key: 'imageUrl',
      header: 'Image',
      render: (product: Product) => (
        product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-10 w-10 object-cover rounded-full" /> : 'N/A'
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outlined" size="small" onClick={() => navigate(`/products/${product.id}`)} label="View" />
          <Button variant="contained" size="small" onClick={() => handleEditProduct(product)} label="Edit" />
          <Button variant="danger" size="small" onClick={() => handleDeleteProduct(product.id)} label="Delete" />
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="product-list-page error">Error: {error}</div>;
  }

  return (
    <div className="product-list-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 data-tut="product-page-title">Product List</h1>
        <Button variant="contained" onClick={handleCreateProduct} label="Add New Product" data-tut="add-product-button" />
      </div>
      <Table data={products} columns={columns} data-tut="product-list-table" />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <ProductForm initialData={editingProduct} onSubmit={handleFormSubmit} />
      </Modal>
    </div>
  );
};

export default ProductListPage;