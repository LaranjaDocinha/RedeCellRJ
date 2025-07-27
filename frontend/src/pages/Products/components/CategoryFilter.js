import React, { useContext } from 'react';
import { Input } from 'reactstrap';
import { ProductContext } from '../../../context/ProductContext';

const CategoryFilter = () => {
  const { categories, setCategoryFilter } = useContext(ProductContext);

  return (
    <Input
      type="select"
      onChange={(e) => setCategoryFilter(e.target.value)}
      defaultValue=""
    >
      <option value="">Todas as Categorias</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </Input>
  );
};

export default CategoryFilter;
