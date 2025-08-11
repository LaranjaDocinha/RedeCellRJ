import React, { useState } from 'react';
import ColorPickerComponent from './ColorPickerComponent';

export default {
  title: 'Common/ColorPickerComponent',
  component: ColorPickerComponent,
  argTypes: {
    color: { control: 'color' },
    onChange: { action: 'color changed' },
  },
};

const Template = (args) => {
  const [currentColor, setCurrentColor] = useState(args.color);
  const handleChange = (newColor) => {
    setCurrentColor(newColor.rgb);
    args.onChange(newColor);
  };
  return <ColorPickerComponent {...args} color={currentColor} onChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  color: { r: 255, g: 0, b: 0, a: 1 },
};

export const WithInitialHexColor = Template.bind({});
WithInitialHexColor.args = {
  color: '#00FF00',
};

export const WithInitialRgbaColor = Template.bind({});
WithInitialRgbaColor.args = {
  color: 'rgba(0, 0, 255, 0.5)',
};
