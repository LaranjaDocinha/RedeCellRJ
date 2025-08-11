import React, { useState } from 'react';
import BankStatementImport from './components/BankStatementImport';
import BankReconciliation from './components/BankReconciliation'; // Import the new component

const BankAccountsPage = () => {
  return (
    <div>
      <h1>Gestão de Contas Bancárias</h1>
      <p>Aqui você poderá gerenciar suas contas bancárias (CRUD).</p>
      <BankStatementImport />
      <BankReconciliation /> {/* Render the new component */}
      {/* Further UI for bank account management will be added here */}
    </div>
  );
};

export default BankAccountsPage;