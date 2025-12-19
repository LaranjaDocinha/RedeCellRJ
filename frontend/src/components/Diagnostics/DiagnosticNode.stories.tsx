import type { Meta, StoryObj } from '@storybook/react';
import DiagnosticNodeComponent from './DiagnosticNode';
import { DiagnosticNode, DiagnosticNodeOption } from '../../types/diagnostic';
import { TestWrapper } from '../../test-utils/TestWrapper';

const meta = {
  title: 'Diagnostics/DiagnosticNodeComponent',
  component: DiagnosticNodeComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    node: { control: 'object' },
    options: { control: 'object' },
    onOptionClick: { action: 'optionClicked' },
  },
  decorators: [
    (Story) => (
      <TestWrapper>
        <Story />
      </TestWrapper>
    ),
  ],
} satisfies Meta<typeof DiagnosticNodeComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const questionNode: DiagnosticNode = {
  id: 'q1',
  question_text: 'Is the device turning on?',
  is_solution: false,
  solution_details: null,
  parent_node_id: null,
};

const solutionNode: DiagnosticNode = {
  id: 's1',
  question_text: 'Solution found',
  is_solution: true,
  solution_details: 'Problem: Battery. Solution: Replace battery.',
  parent_node_id: 'q1',
};

const options: DiagnosticNodeOption[] = [
  { id: 'opt1', diagnostic_node_id: 'q1', option_text: 'Yes', next_node_id: 'q2' },
  { id: 'opt2', diagnostic_node_id: 'q1', option_text: 'No', next_node_id: 's1' },
];

export const QuestionNode: Story = {
  args: {
    node: questionNode,
    options: options,
  },
};

export const SolutionNode: Story = {
  args: {
    node: solutionNode,
    options: [],
  },
};

export const QuestionNodeNoOptions: Story = {
  args: {
    node: { ...questionNode, question_text: 'Is the device completely dead?' },
    options: [],
  },
};
