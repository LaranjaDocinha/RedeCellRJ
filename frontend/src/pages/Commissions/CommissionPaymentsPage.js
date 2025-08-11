import React, { useState } from 'react';
import CommissionPaymentForm from './components/CommissionPaymentForm';

const CommissionPaymentsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div>
      <h1>Registro de Pagamentos de Comissão</h1>
      <p>Aqui você poderá registrar os pagamentos de comissão realizados.</p>

      <button onClick={handleOpenForm}>Registrar Novo Pagamento</button>

      {isFormOpen && <CommissionPaymentForm onClose={handleCloseForm} />}

      <h2>Histórico de Pagamentos</h2>
      {/* Placeholder for a list of commission payments */}
      <p>Histórico de pagamentos de comissão será exibido aqui.</p>
    </div>
  );
};

export default CommissionPaymentsPage;