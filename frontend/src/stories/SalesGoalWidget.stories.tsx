import type { Meta, StoryObj } from '@storybook/react';
import SalesGoalWidget from '../components/POS/SalesGoalWidget';
import { NotificationProvider } from '../contexts/NotificationContext';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockGoalData = {
  targetAmount: 5000.00,
  currentSalesAmount: 2500.00,
  progressPercentage: 50,
  remainingAmount: 2500.00,
};

const meta: Meta<typeof SalesGoalWidget> = {
  title: 'POS/Widgets/SalesGoalWidget',
  component: SalesGoalWidget,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      mockedAxios.get.mockResolvedValue({ data: mockGoalData });
      return (
        <NotificationProvider>
          <div style={{ width: 300, height: 400 }}>
            <Story />
          </div>
        </NotificationProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof SalesGoalWidget>;

export const Default: Story = {};
