import React, { useState } from 'react'; // Import useState
import UsedProductList from './components/UsedProductList';
import UsedProductForm from './components/UsedProductForm'; // Import the new form component

const UsedProductsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false); // State to control form visibility

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div>
      <h1>Gestão de Produtos Seminovos</h1>
      <p>Aqui você poderá gerenciar a compra e venda de produtos seminovos.</p>

      <button onClick={handleOpenForm}>Registrar Novo Seminovos</button> {/* Button to open form */}

      {isFormOpen && <UsedProductForm onClose={handleCloseForm} />} {/* Render form conditionally */}

      <UsedProductList />
    </div>
  );
};

export default UsedProductsPage;