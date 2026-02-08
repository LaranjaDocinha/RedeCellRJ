import { render, screen } from '../../test-utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import DataTable from './index';

describe('DataTable Component', () => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
  ];

  const rows = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  it('should render columns and rows correctly', () => {
    render(<DataTable columns={columns} rows={rows} />);
    
    expect(screen.getByText('ID')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Item 1')).toBeDefined();
    expect(screen.getByText('Item 2')).toBeDefined();
  });

  it('should display loading state', () => {
    // MUI DataGrid uses a progress bar for loading
    render(<DataTable columns={columns} rows={[]} loading={true} />);
    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('should display custom empty message when no rows provided', () => {
    render(
      <DataTable 
        columns={columns} 
        rows={[]} 
        emptyStateMessage="Custom Empty Message" 
      />
    );
    expect(screen.getByText(/Custom Empty Message/i)).toBeDefined();
  });
});
