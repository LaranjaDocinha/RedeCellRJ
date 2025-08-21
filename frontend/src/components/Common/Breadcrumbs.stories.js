
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

export default {
  title: 'Components/Common/Breadcrumbs',
  component: Breadcrumbs,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/settings/personalization']}>
        <Routes>
          <Route path="/settings/personalization" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

const Template = (args) => <Breadcrumbs {...args} />;

export const Default = Template.bind({});
Default.args = {};
