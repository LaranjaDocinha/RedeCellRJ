import React, { useContext } from 'react';
import { Input } from 'reactstrap';

import { ProductContext } from '../../../context/ProductContext';

const SortBy = () => {
  const { setSortBy } = useContext(ProductContext);

  return (
    <Input defaultValue='newest' type='select' onChange={(e) => setSortBy(e.target.value)}>
      <option value='newest'>Mais Recentes</option>
      <option value='price_asc'>Preço: Menor para Maior</option>
      <option value='price_desc'>Preço: Maior para Menor</option>
      <option value='name_asc'>Nome (A-Z)</option>
    </Input>
  );
};

export default SortBy;
