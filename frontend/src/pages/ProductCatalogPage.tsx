// frontend/src/pages/ProductCatalogPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Importar useAuth
import { fetchAllProducts } from '../services/productService';
import { Part } from '../types/part'; // Precisaremos definir este tipo ou importá-lo de outro lugar
import ProductGrid from '../components/ProductCatalog/ProductGrid'; // Será criado em seguida

const ProductCatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Part[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { token } = useAuth(); // Obter o token do contexto de autenticação

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { products: data } = await fetchAllProducts(token as string, searchTerm);
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, token]); // Adicionar 'token' como dependência

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Product Catalog</h1>
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <ProductGrid products={products} />
    </div>
  );
};

export default ProductCatalogPage;
