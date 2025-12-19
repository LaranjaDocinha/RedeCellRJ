import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnimatedStepper } from './AnimatedStepper';

test('renders animated stepper', () => {
  const steps = [ { label: 'Step 1', content: <div>Content 1</div> } ];
  render(<AnimatedStepper steps={steps} />);
  expect(screen.getByText('Step 1')).toBeInTheDocument();
});
