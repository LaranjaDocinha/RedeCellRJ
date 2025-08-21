
import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import PropTypes from 'prop-types';

const SliderComponent = ({ value, onChange, ...rest }) => {
  return (
    <Slider
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};

SliderComponent.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SliderComponent;
