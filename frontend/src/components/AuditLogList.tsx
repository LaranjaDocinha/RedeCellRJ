import React from 'react';
import { AuditLog } from '../pages/AuditLogsPage'; // Importar a interface AuditLog
import {
  StyledTableContainer,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  StyledEmptyState,
} from './AuditLogList.styled';
import { FaClipboardList } from 'react-icons/fa'; // Ícone para estado vazio

interface AuditLogListProps {
  logs: AuditLog[];
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <StyledEmptyState
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <FaClipboardList />
        <p>No audit logs found.</p>
      </StyledEmptyState>
    );
  }

  return (
    <StyledTableContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <StyledTable>
        <StyledTableHead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity Type</th>
            <th>Entity ID</th>
            <th>Details</th>
            <th>Previous Hash</th>
            <th>Hash</th>
          </tr>
        </StyledTableHead>
        <StyledTableBody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.user_email || 'N/A'}</td>
              <td>{log.action}</td>
              <td>{log.entity_type || 'N/A'}</td>
              <td>{log.entity_id || 'N/A'}</td>
              <td>{log.details ? JSON.stringify(log.details) : 'N/A'}</td>
              <td>{log.previous_hash ? log.previous_hash.substring(0, 10) + '...' : 'N/A'}</td>
              <td>{log.hash ? log.hash.substring(0, 10) + '...' : 'N/A'}</td>
            </tr>
          ))}
        </StyledTableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};
