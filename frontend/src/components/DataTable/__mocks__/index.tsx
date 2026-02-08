import React from 'react';

const DataTable: React.FC<any> = ({ rows, columns, emptyStateMessage }) => {
  if (rows.length === 0) return <div>{emptyStateMessage || 'Nenhum dado encontrado'}</div>;
  
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col: any) => <th key={col.field}>{col.headerName}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any) => (
          <tr key={row.id}>
            {columns.map((col: any) => <td key={col.field}>{row[col.field]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
