import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dropdown } from './Dropdown';

test('renders dropdown', () => {
  render(<Dropdown trigger={<div>Trigger</div>}><div>Content</div></Dropdown>);
  expect(screen.getByText('Trigger')).toBeInTheDocument();
});
