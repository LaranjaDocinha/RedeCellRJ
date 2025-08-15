
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardBody, CardTitle, Alert, Nav, NavItem, NavLink, TabContent, TabPane, Spinner } from 'reactstrap';
import classnames from 'classnames';
import useApi from '../../hooks/useApi';
import { get } from '../../helpers/api_helper';
import ActivityLogTable from '../Common/ActivityLogTable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProfileActivityTab = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('activityLogs');

  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogsPageCount, setActivityLogsPageCount] = useState(0);
  const { request: fetchActivityLogs, loading: logsLoading, error: logsError } = useApi(get);

  const [loginHistory, setLoginHistory] = useState([]);
  const [loginHistoryPageCount, setLoginHistoryPageCount] = useState(0);
  const { request: fetchLoginHistory, loading: loginHistoryLoading, error: loginHistoryError } = useApi(get);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const loadActivityLogs = useCallback(async ({ pageIndex, pageSize }) => {
    if (!userId) return;
    try {
      const response = await fetchActivityLogs(`/api/users/${userId}/activity-logs?page=${pageIndex + 1}&limit=${pageSize}`);
      setActivityLogs(response.logs);
      setActivityLogsPageCount(Math.ceil(response.total / pageSize));
    } catch (err) {
      console.error('Erro ao carregar logs de atividade:', err);
    }
  }, [userId, fetchActivityLogs]);

  const loadLoginHistory = useCallback(async ({ pageIndex, pageSize }) => {
    if (!userId) return;
    try {
      const response = await fetchLoginHistory(`/api/users/${userId}/login-history?page=${pageIndex + 1}&limit=${pageSize}`);
      setLoginHistory(response.history);
      setLoginHistoryPageCount(Math.ceil(response.total / pageSize));
    } catch (err) {
      console.error('Erro ao carregar histórico de login:', err);
    } finally {
    }
  }, [userId, fetchLoginHistory]);

  const activityLogsColumns = useMemo(
    () => [
      {
        id: 'timestamp', // Added id
        Header: 'Data',
        accessor: 'timestamp',
        Cell: ({ value }) => format(new Date(value), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      },
      {
        id: 'description', // Added id
        Header: 'Descrição',
        accessor: 'description',
      },
    ],
    []
  );

  const loginHistoryColumns = useMemo(
    () => [
      {
        id: 'login_at', // Added id
        Header: 'Data',
        accessor: 'login_at',
        Cell: ({ value }) => format(new Date(value), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      },
      {
        id: 'ip_address', // Added id
        Header: 'IP',
        accessor: 'ip_address',
      },
      {
        id: 'user_agent', // Added id
        Header: 'Agente',
        accessor: 'user_agent',
      },
      {
        id: 'success', // Added id
        Header: 'Status',
        accessor: 'success',
        Cell: ({ value }) => (
          <span className={`badge bg-${value ? 'success' : 'danger'}`}>
            {value ? 'Sucesso' : 'Falha'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <Card>
      <CardBody>
        <CardTitle className="mb-3">Histórico de Atividade</CardTitle>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === 'activityLogs' })}
              onClick={() => { toggleTab('activityLogs'); }}
            >
              Logs de Atividade
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === 'loginHistory' })}
              onClick={() => { toggleTab('loginHistory'); }}
            >
              Histórico de Login
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab} className="p-3 border border-top-0 rounded-bottom bg-white">
          <TabPane tabId="activityLogs">
            {logsError ? (
              <Alert color="danger">{logsError}</Alert>
            ) : (
              <ActivityLogTable
                columns={activityLogsColumns}
                data={activityLogs}
                loading={logsLoading}
                pageCount={activityLogsPageCount}
                onFetchData={loadActivityLogs}
              />
            )}
          </TabPane>
          <TabPane tabId="loginHistory">
            {loginHistoryError ? (
              <Alert color="danger">{loginHistoryError}</Alert>
            ) : (
              <ActivityLogTable
                columns={loginHistoryColumns}
                data={loginHistory}
                loading={loginHistoryLoading}
                pageCount={loginHistoryPageCount}
                onFetchData={loadLoginHistory}
              />
            )}
          </TabPane>
        </TabContent>
      </CardBody>
    </Card>
  );
};

export default ProfileActivityTab;
