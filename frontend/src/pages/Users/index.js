import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Button,
  Badge,
  Card,
  CardBody,
  Row,
  Col,
  Input,
  Spinner, // Added Spinner
} from 'reactstrap';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import debounce from 'lodash.debounce';
import { Download, Send, Grid, List } from 'react-feather'; // Import Send, Grid, and List icons

import useNotification from '../../hooks/useNotification';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AdvancedTable from '../../components/Common/AdvancedTable';
import TableSkeleton from '../../components/Common/TableSkeleton';
import BulkActionsToolbar from '../../components/Common/BulkActionsToolbar';
import useApi from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';

import UserFormModal from './UserFormModal';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import UserCardView from './components/UserCardView';

const UserManagement = () => {
  document.title = 'Gestão de Usuários | PDV Web';

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: usersData, isLoading: loading, error, request: fetchUsers } = useApi('get');
  const { request: toggleUserStatusApi } = useApi('delete');
  const { request: bulkActionApi, loading: bulkLoading } = useApi('post');
  const { request: sendResetEmailApi, loading: sendingEmail } = useApi('post');
  const { request: impersonateUserApi, loading: impersonatingUser } = useApi('post');
  const { showSuccess, showError } = useNotification();
  const { user: loggedInUser, setToken, setOriginalToken } = useAuthStore();

  const navigate = useNavigate();

  const loadUsers = useCallback(() => {
    let url = `/api/users?limit=1000&search=${searchQuery}`;
    if (statusFilter !== 'all') url += `&is_active=${statusFilter}`;
    if (roleFilter !== 'all') url += `&role=${roleFilter}`;
    fetchUsers(url);
  }, [fetchUsers, searchQuery, statusFilter, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (usersData && usersData.users) {
      setUsers(usersData.users);
    }
  }, [usersData]);

  const handleStatusToggle = (user) => {
    setUserToToggle(user);
    setConfirmModalOpen(true);
  };

  const confirmStatusToggle = async () => {
    if (!userToToggle) return;
    const action = userToToggle.is_active ? 'desativar' : 'ativar';
    try {
      await toggleUserStatusApi(`/api/users/${userToToggle.id}`);
      showSuccess(`Usuário ${action} com sucesso!`);
      loadUsers();
    } catch (err) {
      showError(`Falha ao ${action} o usuário.`);
      console.error(err);
    } finally {
      setConfirmModalOpen(false);
      setUserToToggle(null);
    }
  };

  const handleBulkAction = async (action, options = {}) => {
    const selectedUserIds = Object.keys(rowSelection).map(Number);
    if (selectedUserIds.length === 0) {
        showError('Nenhum usuário selecionado.');
        return;
    }

    const payload = { 
        action,
        userIds: selectedUserIds, 
        ...options 
    };

    try {
        const response = await bulkActionApi('/api/users/bulk-action', payload);
        showSuccess(response.message);
        setRowSelection({});
        loadUsers();
    } catch (err) {
        showError('Falha ao executar ação em massa.');
        console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Status', 'Permissão', 'Último Login'];
    const csvRows = [
        headers.join(',')
    ];

    users.forEach(user => {
        const row = [
            user.id,
            `"${user.name}"`, // Corrected escaping for double quotes within template literal
            user.email,
            user.is_active ? 'Ativo' : 'Inativo',
            user.role,
            user.last_login_at ? format(new Date(user.last_login_at), 'yyyy-MM-dd HH:mm:ss') : 'Nunca'
        ];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n'); // Corrected escaping for newline character
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'usuarios.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendResetEmail = async (user) => {
    try {
        await sendResetEmailApi(`/api/users/${user.id}/send-reset-email`, {});
        showSuccess(`E-mail de reset de senha enviado para ${user.email}.`);
    } catch (err) {
        showError(`Falha ao enviar e-mail de reset de senha para ${user.email}.`);
        console.error(err);
    }
  };

  const handleImpersonate = async (user) => {
    try {
        const response = await impersonateUserApi(`/api/users/${user.id}/impersonate`, {});
        if (response.token) {
            setOriginalToken(loggedInUser.token); // Save the current admin token
            setToken(response.token); // Store the new impersonated user's token
            showSuccess(`Você está agora personificando ${user.name}.`);
            window.location.reload(); // Reload to apply new user context
        }
    } catch (err) {
        showError(`Falha ao personificar o usuário ${user.name}.`);
        console.error(err);
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    toggleModal();
  };

  const handleNewClick = () => {
    setSelectedUser(null);
    toggleModal();
  };

  const roleColors = {
    admin: 'danger',
    technician: 'info',
    user: 'primary',
    seller: 'success',
  };

  const columns = useMemo(
    () => [
        {
            header: 'Usuário',
            accessorKey: 'name',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="d-flex align-items-center">
                        <img src={user.profile_image_url || 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg'} alt={user.name} className="avatar-xs rounded-circle me-2" />
                        <span className="fw-bold">{user.name}</span>
                    </div>
                )
            }
        },
      { header: 'Email', accessorKey: 'email' },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: (info) => (
          <Badge pill className={`badge-soft-${info.getValue() ? 'success' : 'danger'}`}>
            {info.getValue() ? 'Ativo' : 'Inativo'}
          </Badge>
        ),
      },
      {
        header: 'Permissão',
        accessorKey: 'role',
        cell: (info) => (
          <Badge pill className={`badge-soft-${roleColors[info.getValue()] || 'secondary'} text-capitalize`}>
            {info.getValue()}
          </Badge>
        ),
      },
      {
        header: 'Último Login',
        accessorKey: 'last_login_at',
        cell: (info) => {
            const lastLogin = info.getValue();
            return lastLogin ? format(new Date(lastLogin), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Nunca';
        }
      },
      {
        header: 'Ações',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className='d-flex gap-2'>
              <Button color='primary' size='sm' onClick={() => handleEditClick(user)}><i className='bx bx-pencil me-1'></i> Editar</Button>
              <Button color='info' size='sm' onClick={() => navigate(`/user-profile/${user.id}`)}><i className='bx bx-user me-1'></i> Ver Perfil</Button>
              {loggedInUser.role === 'admin' && (
                <Button color='warning' size='sm' onClick={() => handleImpersonate(user)} disabled={impersonatingUser}>
                  {impersonatingUser ? <Spinner size="sm" /> : <><i className='bx bx-mask me-1'></i> Personificar</>}
                </Button>
              )}
              <Button color={user.is_active ? 'danger' : 'success'} size='sm' onClick={() => handleStatusToggle(user)}>{user.is_active ? 'Desativar' : 'Ativar'}</Button>
              <Button color='info' size='sm' onClick={() => handleSendResetEmail(user)} disabled={sendingEmail}><Send size={16} /></Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Usuários' title='Sistema' />

          <Card>
            <CardBody>
                <Row className="g-3 mb-3">
                    <Col md={5}>
                        <Input type="text" placeholder="Buscar por nome ou email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </Col>
                    <Col md={2}>
                        <Input type="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Todos os Status</option>
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </Input>
                    </Col>
                    <Col md={2}>
                        <Input type="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="all">Todas as Permissões</option>
                            <option value="admin">Admin</option>
                            <option value="technician">Técnico</option>
                            <option value="user">Usuário</option>
                        </Input>
                    </Col>
                    <Col md={3} className="text-end">
                        <Button color="secondary" onClick={handleExportCSV}><Download size={16} className="me-1"/> Exportar CSV</Button>
                        <Button color={viewMode === 'table' ? 'primary' : 'light'} onClick={() => setViewMode('table')} className="ms-2"><List size={16} /></Button>
                        <Button color={viewMode === 'card' ? 'primary' : 'light'} onClick={() => setViewMode('card')} className="ms-1"><Grid size={16} /></Button>
                    </Col>
                </Row>
                {Object.keys(rowSelection).length > 0 && (
                    <BulkActionsToolbar 
                        selectedCount={Object.keys(rowSelection).length}
                        onAction={handleBulkAction}
                        disabled={bulkLoading}
                    />
                )}
            </CardBody>
          </Card>

          {loading && !users.length ? (
            <TableSkeleton columns={7} />
          ) : viewMode === 'table' ? (
            <AdvancedTable
                columns={columns}
                data={users}
                enableRowSelection={true}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                emptyStateActionText={'Adicionar Usuário'}
                emptyStateMessage={'Nenhum usuário corresponde aos filtros atuais.'}
                emptyStateTitle={'Nenhum usuário encontrado'}
                onEmptyStateActionClick={handleNewClick}
            />
          ) : (
            <UserCardView
                users={users}
                onEditClick={handleEditClick}
                onStatusToggle={handleStatusToggle}
                onSendResetEmail={handleSendResetEmail}
                onImpersonate={handleImpersonate}
                loggedInUser={loggedInUser}
                impersonatingUser={impersonatingUser}
            />
          )}
        </Container>
      </div>
      <UserFormModal isOpen={modalOpen} toggle={toggleModal} user={selectedUser} onSave={() => loadUsers()} />
      <ConfirmationModal isOpen={confirmModalOpen} toggle={() => setConfirmModalOpen(false)} onConfirm={confirmStatusToggle} title={`Confirmar Alteração de Status`} message={`Você tem certeza que deseja ${userToToggle?.is_active ? 'desativar' : 'ativar'} o usuário ${userToToggle?.name}?`} />
    </React.Fragment>
  );
};

export default UserManagement;