import React from 'react';

interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string; // Joined from users table
  action: string;
  entity_type?: string;
  entity_id?: number;
  details?: any; // JSONB data
  timestamp: string;
}

interface AuditLogListProps {
  logs: AuditLog[];
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ logs }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">User</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Action</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Entity Type</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Entity ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Timestamp</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Details</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {logs.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">No audit logs found.</td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{log.id}</td>
                <td className="py-3 px-4">{log.user_email || 'System'}</td>
                <td className="py-3 px-4">{log.action}</td>
                <td className="py-3 px-4">{log.entity_type || 'N/A'}</td>
                <td className="py-3 px-4">{log.entity_id || 'N/A'}</td>
                <td className="py-3 px-4">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="py-3 px-4">
                  {log.details ? (
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
