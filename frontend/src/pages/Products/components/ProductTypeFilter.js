import React, { useContext } from 'react';
import { Input } from 'reactstrap';
import { ProductContext } from '../../../context/ProductContext';

const ProductTypeFilter = () => {
  const { setProductTypeFilter } = useContext(ProductContext);

  return (
    <Input
      type="select"
      onChange={(e) => setProductTypeFilter(e.target.value)}
      defaultValue=""
    >
      <option value="">Todos os Tipos</option>
      <option value="physical">Produto Físico</option>
      <option value="service">Serviço</option>
    </Input>
  );
};

export default ProductTypeFilter;
