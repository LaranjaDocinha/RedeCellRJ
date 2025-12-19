import type { Meta, StoryObj } from '@storybook/react';
import AppLayout from '../components/AppLayout';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from 'styled-components';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

// Mock theme
const theme = createTheme();

const meta: Meta<typeof AppLayout> = {
  title: 'Layout/AppLayout',
  component: AppLayout,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/dashboard']}>
        <MuiThemeProvider theme={theme}>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Story />}>
                        <Route path="dashboard" element={<div style={{ padding: 20 }}><h1>Dashboard Content</h1><p>This is where the page content goes.</p></div>} />
                    </Route>
                </Routes>
            </AuthProvider>
        </MuiThemeProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

export const Default: Story = {};
