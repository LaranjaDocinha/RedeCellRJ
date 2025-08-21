// Remember to create Storybook stories for new components in this directory.
// Refer to TemplateComponent.stories.jsx for an example.

import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, onClick, className, type = 'button', disabled = false, ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${className || ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
};

export default Button;
