import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button as ReactstrapButton } from 'reactstrap';

import RippleEffect from './RippleEffect';

const Button = ({ children, color, icon, className, onClick, ...props }) => {
  const buttonRef = useRef(null);

  return (
    <RippleEffect buttonRef={buttonRef} onButtonClick={onClick}>
      <ReactstrapButton
        className={`btn-custom ${className}`}
        color={color}
        innerRef={buttonRef}
        onClick={() => {}} // onClick é tratado pelo RippleEffect
        {...props}
      >
        {icon && <i className={`${icon} me-2`}></i>}
        {children}
      </ReactstrapButton>
    </RippleEffect>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func, // Adiciona onClick aos propTypes
};

Button.defaultProps = {
  color: 'primary',
  icon: null,
  className: '',
  onClick: () => {}, // Define um onClick padrão
};

export default Button;
