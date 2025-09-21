import React, { useState, useEffect } from 'react';
import { AuditLogList } from '../components/AuditLogList';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';

interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  details?: any;
  timestamp: string;
}

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/audit', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setLogs(data);
    } catch (error: any) {
      console.error("Error fetching audit logs:", error);
      addNotification(`Failed to fetch audit logs: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      {loading ? (
        <p>Loading audit logs...</p>
      ) : (
        <AuditLogList logs={logs} />
      )}
    </div>
  );
};

export default AuditLogsPage;
