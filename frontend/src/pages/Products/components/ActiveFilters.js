import React, { useContext } from 'react';
import { Badge, Button } from 'reactstrap';

import { ProductContext } from '../../../context/ProductContext';
import './ActiveFilters.scss';

const ActiveFilters = () => {
  const { activeFilters, removeFilter, clearFilters } = useContext(ProductContext);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className='active-filters-container'>
      <div className='filters-pills'>
        {activeFilters.map((filter) => (
          <Badge key={filter.type} className='filter-pill' color='secondary'>
            {filter.label}
            <Button close className='filter-close-btn' onClick={() => removeFilter(filter.type)} />
          </Badge>
        ))}
      </div>
      <Button outline className='clear-filters-btn' color='danger' size='sm' onClick={clearFilters}>
        <i className='bx bx-x me-1'></i>
        Limpar Tudo
      </Button>
    </div>
  );
};

export default ActiveFilters;
