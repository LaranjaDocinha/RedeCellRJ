import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PurchaseOrderList from './PurchaseOrderList';
import CreatePurchaseOrder from './CreatePurchaseOrder';
import PurchaseOrderDetail from './PurchaseOrderDetail';

const PurchaseOrders = () => {
  return (
    <Routes>
      <Route path="/" element={<PurchaseOrderList />} />
      <Route path="/new" element={<CreatePurchaseOrder />} />
      <Route path="/:id" element={<PurchaseOrderDetail />} />
    </Routes>
  );
};

export default PurchaseOrders;
