import React, { useState } from 'react';
import BackgroundTypeSelector from './BackgroundTypeSelector';

export default {
  title: 'Common/BackgroundTypeSelector',
  component: BackgroundTypeSelector,
  argTypes: {
    selectedType: {
      control: {
        type: 'radio',
        options: ['gradient', 'solid', 'image', 'video'],
      },
    },
    onChange: { action: 'type changed' },
  },
};

const Template = (args) => {
  const [currentType, setCurrentType] = useState(args.selectedType);
  const handleChange = (newType) => {
    setCurrentType(newType);
    args.onChange(newType);
  };
  return <BackgroundTypeSelector {...args} selectedType={currentType} onChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  selectedType: 'gradient',
};

export const SolidSelected = Template.bind({});
SolidSelected.args = {
  selectedType: 'solid',
};

export const ImageSelected = Template.bind({});
ImageSelected.args = {
  selectedType: 'image',
};

export const VideoSelected = Template.bind({});
VideoSelected.args = {
  selectedType: 'video',
};
