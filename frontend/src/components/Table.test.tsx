import React from 'react';
import { render } from '../test-utils/TestWrapper';
import { axe, toHaveNoViolations } from 'jest-axe';
import Table from './Table';

expect.extend(toHaveNoViolations);

describe('Table Component Accessibility', () => {
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ];
  const data = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  it('should have no accessibility violations', async () => {
    const { container } = render(<Table data={data} columns={columns} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when no data is available', async () => {
    const { container } = render(<Table data={[]} columns={columns} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});