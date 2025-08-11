import React, { useState } from 'react';
import ImageSettings from './ImageSettings';

export default {
  title: 'Common/ImageSettings',
  component: ImageSettings,
  argTypes: {
    imageUrl: { control: 'text' },
    imageSize: {
      control: {
        type: 'select',
        options: ['cover', 'contain', 'auto'],
      },
    },
    imageRepeat: {
      control: {
        type: 'select',
        options: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'],
      },
    },
    onImageUrlChange: { action: 'image URL changed' },
    onImageSizeChange: { action: 'image size changed' },
    onImageRepeatChange: { action: 'image repeat changed' },
  },
};

const Template = (args) => {
  const [url, setUrl] = useState(args.imageUrl);
  const [size, setSize] = useState(args.imageSize);
  const [repeat, setRepeat] = useState(args.imageRepeat);

  const handleUrlChange = (newUrl) => {
    setUrl(newUrl);
    args.onImageUrlChange(newUrl);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    args.onImageSizeChange(newSize);
  };

  const handleRepeatChange = (newRepeat) => {
    setRepeat(newRepeat);
    args.onImageRepeatChange(newRepeat);
  };

  return (
    <ImageSettings
      imageUrl={url}
      imageSize={size}
      imageRepeat={repeat}
      onImageUrlChange={handleUrlChange}
      onImageSizeChange={handleSizeChange}
      onImageRepeatChange={handleRepeatChange}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  imageUrl: 'https://via.placeholder.com/150',
  imageSize: 'cover',
  imageRepeat: 'no-repeat',
};

export const RepeatedImage = Template.bind({});
RepeatedImage.args = {
  imageUrl: 'https://via.placeholder.com/50',
  imageSize: 'auto',
  imageRepeat: 'repeat',
};
