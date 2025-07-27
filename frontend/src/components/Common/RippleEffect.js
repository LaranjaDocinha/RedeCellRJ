
import React, { useState, useEffect } from 'react';
import './RippleEffect.scss';

const RippleEffect = ({ children }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (event) => {
    const button = event.currentTarget;
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
  };

  const handleAnimationEnd = (id) => {
    setRipples((prevRipples) => prevRipples.filter((ripple) => ripple.id !== id));
  };

  return (
    <div
      className="ripple-container"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ')
          handleClick(e);
      }}
      role="button"
      tabIndex={0}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
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

export default RippleEffect;
