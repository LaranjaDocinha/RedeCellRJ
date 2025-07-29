import React from 'react';
import PropTypes from 'prop-types';
import './WidgetStates.scss';

const WidgetError = ({ onRetry = () => {} }) => {
  return (
    <div className='widget-state-container'>
      <i className='ri-error-warning-line error-icon'></i>
      <p>Ocorreu um erro ao carregar os dados.</p>
      {onRetry && (
        <button className='retry-btn' onClick={onRetry}>
          Tentar Novamente
        </button>
      )}
    </div>
  );
};

WidgetError.propTypes = {
  /**
   * Callback function to be called when the retry button is clicked.
   */
  onRetry: PropTypes.func,
};

export default WidgetError;
