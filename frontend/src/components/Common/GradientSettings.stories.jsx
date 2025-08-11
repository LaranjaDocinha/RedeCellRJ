import React, { useState } from 'react';
import GradientSettings from './GradientSettings';

export default {
  title: 'Common/GradientSettings',
  component: GradientSettings,
  argTypes: {
    gradientColor1: { control: 'color' },
    gradientColor2: { control: 'color' },
    gradientColor3: { control: 'color' },
    gradientColor4: { control: 'color' },
    gradientSpeed: { control: { type: 'range', min: 1, max: 60, step: 1 } },
    gradientDirection: { control: { type: 'range', min: 0, max: 360, step: 1 } },
    onColorChange: { action: 'color changed' },
    onSpeedChange: { action: 'speed changed' },
    onDirectionChange: { action: 'direction changed' },
  },
};

const Template = (args) => {
  const [colors, setColors] = useState({
    c1: args.gradientColor1,
    c2: args.gradientColor2,
    c3: args.gradientColor3,
    c4: args.gradientColor4,
  });
  const [speed, setSpeed] = useState(args.gradientSpeed);
  const [direction, setDirection] = useState(args.gradientDirection);

  const handleColorChange = (key, newColor) => {
    setColors((prev) => ({ ...prev, [key]: newColor }));
    args.onColorChange(key, newColor);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(Number(newSpeed));
    args.onSpeedChange(Number(newSpeed));
  };

  const handleDirectionChange = (newDirection) => {
    setDirection(Number(newDirection));
    args.onDirectionChange(Number(newDirection));
  };

  return (
    <GradientSettings
      gradientColor1={colors.c1}
      gradientColor2={colors.c2}
      gradientColor3={colors.c3}
      gradientColor4={colors.c4}
      gradientSpeed={speed}
      gradientDirection={direction}
      onColorChange={handleColorChange}
      onSpeedChange={handleSpeedChange}
      onDirectionChange={handleDirectionChange}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  gradientColor1: 'rgb(255, 0, 0)',
  gradientColor2: 'rgb(0, 255, 0)',
  gradientColor3: 'rgb(0, 0, 255)',
  gradientColor4: 'rgb(255, 255, 0)',
  gradientSpeed: 15,
  gradientDirection: 45,
};

export const SlowBlueToGreen = Template.bind({});
SlowBlueToGreen.args = {
  gradientColor1: 'rgb(0, 0, 255)',
  gradientColor2: 'rgb(0, 255, 0)',
  gradientColor3: 'rgb(0, 0, 255)',
  gradientColor4: 'rgb(0, 255, 0)',
  gradientSpeed: 30,
  gradientDirection: 90,
};
