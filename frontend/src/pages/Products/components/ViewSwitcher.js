import React, { useContext } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import { ProductContext } from '../../../context/ProductContext';

const ViewSwitcher = () => {
  const { ui, setViewMode } = useContext(ProductContext);
  const { viewMode } = ui;

  return (
    <ButtonGroup>
      <Button
        color={viewMode === 'grid' ? 'primary' : 'light'}
        onClick={() => setViewMode('grid')}
      >
        <i className="bx bx-grid-alt"></i>
      </Button>
      <Button
        color={viewMode === 'list' ? 'primary' : 'light'}
        onClick={() => setViewMode('list')}
      >
        <i className="bx bx-list-ul"></i>
      </Button>
    </ButtonGroup>
  );
};

export default ViewSwitcher;
