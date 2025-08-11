import React, { useState } from 'react';
import GiftCardForm from './components/GiftCardForm';
import GiftCardList from './components/GiftCardList'; // Import the new list component

const GiftCardsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div>
      <h1>Gestão de Vales-Presente</h1>
      <p>Aqui você poderá emitir e consultar vales-presente.</p>

      <button onClick={handleOpenForm}>Emitir Novo Vale-Presente</button>

      {isFormOpen && <GiftCardForm onClose={handleCloseForm} />}

      <GiftCardList /> {/* Render the new list component */}
    </div>
  );
};

export default GiftCardsPage;