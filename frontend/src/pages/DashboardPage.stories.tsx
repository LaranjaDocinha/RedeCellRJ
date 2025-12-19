import type { Meta, StoryObj } from '@storybook/react';
import DashboardPage from './DashboardPage';
import { BrowserRouter } from 'react-router-dom'; // Necessário para useLocation, NavLink, etc.
import { AuthProvider } from '../contexts/AuthContext'; // Necessário para useAuth
import { NotificationProvider } from '../contexts/NotificationContext'; // Necessário para useNotification

const meta: Meta<typeof DashboardPage> = {
  title: 'Pages/DashboardPage',
  component: DashboardPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Story />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};