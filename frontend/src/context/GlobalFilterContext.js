import React, { createContext, useState, useContext } from 'react';

const GlobalFilterContext = createContext();

export const GlobalFilterProvider = ({ children }) => {
  const [globalPeriod, setGlobalPeriod] = useState('today'); // Default period

  const value = {
    globalPeriod,
    setGlobalPeriod,
  };

  return <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>;
};

export const useGlobalFilter = () => {
  const context = useContext(GlobalFilterContext);
  if (!context) {
    throw new Error('useGlobalFilter must be used within a GlobalFilterProvider');
  }
  return context;
};
