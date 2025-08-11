import React, { useState } from 'react';
import SolidColorSettings from './SolidColorSettings';

export default {
  title: 'Common/SolidColorSettings',
  component: SolidColorSettings,
  argTypes: {
    solidColor: { control: 'color' },
    onColorChange: { action: 'color changed' },
  },
};

const Template = (args) => {
  const [currentColor, setCurrentColor] = useState(args.solidColor);
  const handleChange = (newColor) => {
    setCurrentColor(newColor.rgb);
    args.onColorChange(newColor);
  };
  return <SolidColorSettings {...args} solidColor={currentColor} onColorChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  solidColor: 'rgb(0, 0, 255)',
};

export const RedColor = Template.bind({});
RedColor.args = {
  solidColor: '#FF0000',
};
