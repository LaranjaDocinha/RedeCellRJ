import React, { useContext } from 'react';
import { Button } from 'reactstrap';
import { ProductContext } from '../../../context/ProductContext';

const ClearFiltersButton = () => {
  const { activeFilters, clearFilters } = useContext(ProductContext);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Button
      color="secondary"
      outline
      onClick={clearFilters}
      disabled={activeFilters.length === 0}
      title="Limpar todos os filtros"
    >
      <i className="bx bx-x-circle me-1"></i>
      Limpar Filtros
    </Button>
  );
};

export default ClearFiltersButton;
