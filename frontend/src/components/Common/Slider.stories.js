
import React, { useState } from 'react';
import SliderComponent from './Slider';

export default {
  title: 'Components/Common/Slider',
  component: SliderComponent,
};

const Template = (args) => {
  const [value, setValue] = useState(args.value);

  const handleChange = (newValue) => {
    setValue(newValue);
    args.onChange(newValue);
  };

  return <SliderComponent {...args} value={value} onChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  value: 50,
};

export const Range = Template.bind({});
Range.args = {
  value: [20, 80],
  range: true,
};
