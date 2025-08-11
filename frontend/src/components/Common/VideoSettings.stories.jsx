import React, { useState } from 'react';
import VideoSettings from './VideoSettings';

export default {
  title: 'Common/VideoSettings',
  component: VideoSettings,
  argTypes: {
    videoUrl: { control: 'text' },
    onVideoUrlChange: { action: 'video URL changed' },
  },
};

const Template = (args) => {
  const [url, setUrl] = useState(args.videoUrl);
  const handleChange = (newUrl) => {
    setUrl(newUrl);
    args.onVideoUrlChange(newUrl);
  };
  return <VideoSettings {...args} videoUrl={url} onVideoUrlChange={handleChange} />;
};

export const Default = Template.bind({});
Default.args = {
  videoUrl: '',
};

export const WithMp4Video = Template.bind({});
WithMp4Video.args = {
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Example MP4
};

export const WithGif = Template.bind({});
WithGif.args = {
  videoUrl: 'https://media.giphy.com/media/v1.GIF', // Example GIF (replace with a real one if needed)
};
