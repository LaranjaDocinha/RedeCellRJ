import React, { useState } from 'react';
import QuotationList from './components/QuotationList';
import QuotationForm from './components/QuotationForm'; // Import the new form component

const QuotationsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div>
      <h1>Gestão de Orçamentos</h1>
      <p>Aqui você poderá criar, visualizar e gerenciar orçamentos.</p>

      <button onClick={handleOpenForm}>Criar Novo Orçamento</button>

      {isFormOpen && <QuotationForm onClose={handleCloseForm} />}

      <QuotationList />
    </div>
  );
};

export default QuotationsPage;