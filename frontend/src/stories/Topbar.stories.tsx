import type { Meta, StoryObj } from '@storybook/react';
import Topbar from '../components/Topbar';
import { ThemeProvider } from '../contexts/ThemeContext'; // Assuming ThemeProvider export
import { BrandingProvider } from '../contexts/BrandingContext';
import { AuthProvider } from '../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { fn } from '@storybook/test';

// Mock child components to simplify testing the Topbar structure
jest.mock('../components/UserMenu', () => () => <div data-testid="user-menu">User Menu</div>);
jest.mock('../components/SearchButton', () => () => <button>Search</button>);
jest.mock('../components/NotificationsDropdown', () => () => <button>Notifications</button>);
jest.mock('../components/QuickCreateMenu', () => () => <button>Quick Create</button>);

const meta: Meta<typeof Topbar> = {
  title: 'Layout/Topbar',
  component: Topbar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthProvider>
            <BrandingProvider>
                <ThemeProvider>
                    <Story />
                </ThemeProvider>
            </BrandingProvider>
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
  args: {
    onToggleSidebar: fn(),
    onSearchClick: fn(),
    isSidebarOpen: true,
  },
};

export default meta;
type Story = StoryObj<typeof Topbar>;

export const Default: Story = {};
