import React from 'react';
import { Spinner } from 'reactstrap';
import './FullPageLoader.scss';

const FullPageLoader = () => {
  return (
    <div className="full-page-loader">
      <Spinner style={{ width: '3rem', height: '3rem' }} />
      <p className="mt-3">Carregando...</p>
    </div>
  );
};

export default FullPageLoader;
