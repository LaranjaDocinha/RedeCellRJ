import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PurchaseOrderList from './PurchaseOrderList';
import CreatePurchaseOrder from './CreatePurchaseOrder';
import PurchaseOrderDetail from './PurchaseOrderDetail';

const PurchaseOrders = () => {
  return (
    <Routes>
      <Route element={<PurchaseOrderList />} path='/' />
      <Route element={<CreatePurchaseOrder />} path='/new' />
      <Route element={<PurchaseOrderDetail />} path='/:id' />
    </Routes>
  );
};

export default PurchaseOrders;
