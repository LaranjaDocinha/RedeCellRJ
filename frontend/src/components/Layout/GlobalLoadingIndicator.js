import React, { useState, useEffect } from 'react';
import './GlobalLoadingIndicator.scss';

const GlobalLoadingIndicator = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStartLoading = () => setLoading(true);
    const handleStopLoading = () => setLoading(false);

    window.addEventListener('start-loading', handleStartLoading);
    window.addEventListener('stop-loading', handleStopLoading);

    return () => {
      window.removeEventListener('start-loading', handleStartLoading);
      window.removeEventListener('stop-loading', handleStopLoading);
    };
  }, []);

  return (
    <div className={`global-loading-indicator ${loading ? 'visible' : ''}`}>
      <div className="bar"></div>
    </div>
  );
};

export default GlobalLoadingIndicator;
