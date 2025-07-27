import React, { useContext } from 'react';
import { Input } from 'reactstrap';
import { ProductContext } from '../../../context/ProductContext';

const StockStatusFilter = () => {
  const { setStockStatusFilter } = useContext(ProductContext);

  return (
    <Input
      type="select"
      onChange={(e) => setStockStatusFilter(e.target.value)}
      defaultValue=""
    >
      <option value="">Todo o Estoque</option>
      <option value="in_stock">Em Estoque</option>
      <option value="low_stock">Estoque Baixo</option>
      <option value="out_of_stock">Fora de Estoque</option>
    </Input>
  );
};

export default StockStatusFilter;
