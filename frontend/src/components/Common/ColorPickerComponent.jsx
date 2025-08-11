import React from 'react';
import { ChromePicker } from 'react-color';
import PropTypes from 'prop-types';

const ColorPickerComponent = ({ color, onChange }) => {
  return (
    <div style={{ position: 'relative', zIndex: 9999 }}> {/* Ensure picker is on top */}
      <ChromePicker color={color} onChange={onChange} disableAlpha={false} />
    </div>
  );
};

ColorPickerComponent.propTypes = {
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ColorPickerComponent;
