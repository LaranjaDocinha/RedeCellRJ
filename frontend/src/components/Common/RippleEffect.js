import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './RippleEffect.scss';

const RippleEffect = ({ children, buttonRef, onButtonClick }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = useCallback(
    (event) => {
      if (onButtonClick) {
        onButtonClick(event); // Propagate the click event
      }

      if (!buttonRef || !buttonRef.current) return;

      const button = buttonRef.current;
      const size = Math.max(button.offsetWidth, button.offsetHeight);
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple = {
        id: Date.now(),
        size,
        x,
        y,
      };

      setRipples((prevRipples) => [...prevRipples, newRipple]);
    },
    [buttonRef, onButtonClick],
  );

  const handleAnimationEnd = useCallback((id) => {
    setRipples((prevRipples) => prevRipples.filter((ripple) => ripple.id !== id));
  }, []);

  return (
    <div className='ripple-container'>
      {' '}
      {/* No role, no tabIndex here */}
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className='ripple'
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
          }}
          onAnimationEnd={() => handleAnimationEnd(ripple.id)}
        />
      ))}
    </div>
  );
};

RippleEffect.propTypes = {
  children: PropTypes.node,
  buttonRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  onButtonClick: PropTypes.func,
};

export default RippleEffect;
