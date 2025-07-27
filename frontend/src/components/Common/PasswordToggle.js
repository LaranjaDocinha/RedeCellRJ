import React from 'react';
import PropTypes from 'prop-types';
import './PasswordToggle.scss';

const PasswordToggle = ({ showPassword, togglePasswordVisibility }) => {
  return (
    <button
      type="button"
      onClick={togglePasswordVisibility}
      className="password-toggle-btn"
      aria-label="Toggle password visibility"
    >
      <div className="icon-wrapper">
        <i className="material-symbols-outlined">
          {showPassword ? "visibility" : "visibility_off"}
        </i>
      </div>
    </button>
  );
};

PasswordToggle.propTypes = {
  showPassword: PropTypes.bool.isRequired,
  togglePasswordVisibility: PropTypes.func.isRequired,
};

export default PasswordToggle;
