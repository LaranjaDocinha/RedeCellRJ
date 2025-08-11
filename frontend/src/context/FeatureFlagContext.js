import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { get } from '../helpers/api_helper'; // Usando nosso helper de API

const FeatureFlagContext = createContext({
  flags: {},
  isLoading: true,
});

export const useFeatureFlags = () => useContext(FeatureFlagContext);

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await get('/api/settings');
        setFlags(response.featureFlags || {});
      } catch (error) {
        console.error('Failed to fetch feature flags', error);
        // Em caso de erro, usamos um objeto vazio para não quebrar a aplicação
        setFlags({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlags();
  }, []);

  return (
    <FeatureFlagContext.Provider value={{ flags, isLoading }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

FeatureFlagProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
