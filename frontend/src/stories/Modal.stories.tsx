import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from '../components/ui/Modal';
import { useState } from 'react';
import { Card } from '../components/ui/Card';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    width: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Wrapper component to handle state
const ModalWrapper = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);

  return (
    <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 20px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        Open Modal
      </button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
          This is a highly interactive modal powered by Framer Motion.
          It features a smooth spring animation on entry and exit, a backdrop blur,
          and consistent styling with our Design System.
        </p>
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Confirm Action
          </button>
        </div>
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: 'Confirm Transaction',
    width: '500px',
    isOpen: false, // Default closed
  },
};

export const WideModal: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: 'Report Preview',
    width: '800px',
    isOpen: false,
  },
};
