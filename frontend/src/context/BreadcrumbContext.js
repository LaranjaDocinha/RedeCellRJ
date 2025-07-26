import React, { createContext, useState, useContext } from 'react';

const BreadcrumbContext = createContext({
  breadcrumbTitle: '',
  setBreadcrumbTitle: () => {},
});

export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumbTitle, setBreadcrumbTitle] = useState('');

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbTitle, setBreadcrumbTitle }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);
