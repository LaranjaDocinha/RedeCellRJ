import React from 'react';
import { render, screen, fireEvent } from '../../test-utils/TestWrapper';
import { describe, it, expect, vi } from 'vitest';
import DiagnosticNodeComponent from './DiagnosticNode';
import { DiagnosticNode, DiagnosticNodeOption } from '../../types/diagnostic';

describe('DiagnosticNodeComponent', () => {
  const mockOnOptionClick = vi.fn();

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

  beforeEach(() => {
    mockOnOptionClick.mockClear();
  });

  it('should render a question node with options', () => {
    render(<DiagnosticNodeComponent node={questionNode} options={options} onOptionClick={mockOnOptionClick} />);

    expect(screen.getByText('Is the device turning on?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    expect(screen.queryByText(/Solução:/i)).not.toBeInTheDocument();
  });

  it('should render a solution node with solution details', () => {
    render(<DiagnosticNodeComponent node={solutionNode} options={[]} onOptionClick={mockOnOptionClick} />);

    expect(screen.getByText(/solution_title/i)).toBeInTheDocument();
    expect(screen.getByText('Problem: Battery. Solution: Replace battery.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should call onOptionClick when an option button is clicked', () => {
    render(<DiagnosticNodeComponent node={questionNode} options={options} onOptionClick={mockOnOptionClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(mockOnOptionClick).toHaveBeenCalledTimes(1);
    expect(mockOnOptionClick).toHaveBeenCalledWith(options[0]);
  });
});
