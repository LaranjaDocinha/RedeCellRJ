import React from 'react';
import LoginCustomizer from './LoginCustomizer';
import { MemoryRouter } from 'react-router-dom'; // Required for components using react-router-dom
import axios from 'axios'; // Mock axios

// Mock axios requests for Storybook
axios.get = jest.fn(() =>
  Promise.resolve({
    data: {
      background_type: 'gradient',
      background_solid_color: '#FFFFFF',
      background_image_url: '',
      background_video_url: '',
      image_size: 'cover',
      image_repeat: 'no-repeat',
      gradient_color_1: 'rgb(255, 0, 0)',
      gradient_color_2: 'rgb(0, 255, 0)',
      gradient_color_3: 'rgb(0, 0, 255)',
      gradient_color_4: 'rgb(255, 255, 0)',
      gradient_speed: 15,
      gradient_direction: 45,
    },
  })
);

axios.put = jest.fn(() => Promise.resolve({ data: {} }));

export default {
  title: 'Settings/LoginCustomizer',
  component: LoginCustomizer,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = () => <LoginCustomizer />;
