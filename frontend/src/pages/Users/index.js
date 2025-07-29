import React, { useState, useEffect, useMemo } from 'react';
import { Container, Button, Badge } from 'reactstrap';
import toast from 'react-hot-toast';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import AdvancedTable from '../../components/Common/AdvancedTable';
import { get, del } from '../../helpers/api_helper';
import useApi from '../../hooks/useApi';

import UserFormModal from './UserFormModal';

const UserManagement = () => {
  document.title = 'Gestão de Usuários | PDV Web';

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { request: fetchUsers, loading, error } = useApi(get);
  const { request: toggleUserStatus } = useApi(del);

  const loadUsers = () => {
    fetchUsers('/api/users?limit=1000')
      .then((response) => {
        if (response.users) {
          setUsers(response.users);
        }
      })
      .catch((err) => {
        toast.error('Falha ao carregar usuários.');
        console.error(err);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusToggle = async (user) => {
    const action = user.is_active ? 'desativar' : 'ativar';
    if (window.confirm(`Tem certeza que deseja ${action} o usuário ${user.name}?`)) {
      try {
        await toggleUserStatus(`/api/users/${user.id}`);
        toast.success(`Usuário ${action} com sucesso!`);
        loadUsers();
      } catch (err) {
        toast.error(`Falha ao ${action} o usuário.`);
        console.error(err);
      }
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

  const columns = useMemo(
    () => [
      {
        header: 'Nome',
        accessorKey: 'name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: (info) => (
          <Badge color={info.getValue() ? 'success' : 'danger'}>
            {info.getValue() ? 'Ativo' : 'Inativo'}
          </Badge>
        ),
      },
      {
        header: 'Permissão',
        accessorKey: 'role',
        cell: (info) => <span className='text-capitalize'>{info.getValue()}</span>,
      },
      {
        header: 'Ações',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className='d-flex gap-2'>
              <Button color='primary' size='sm' onClick={() => handleEditClick(user)}>
                <i className='bx bx-pencil me-1'></i> Editar
              </Button>
              <Button
                color={user.is_active ? 'danger' : 'success'}
                size='sm'
                onClick={() => handleStatusToggle(user)}
              >
                {user.is_active ? 'Desativar' : 'Ativar'}
              </Button>
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
          <AdvancedTable
            columns={columns}
            data={users}
            emptyStateActionText={'Adicionar Usuário'}
            emptyStateIcon={''}
            emptyStateMessage={'Cadastre seu primeiro usuário.'}
            emptyStateTitle={'Nenhum usuário encontrado'}
            loading={loading}
            persistenceKey='usersTable'
            onEmptyStateActionClick={handleNewClick}
            onRowClick={handleEditClick}
          />
        </Container>
      </div>
      <UserFormModal
        isOpen={modalOpen}
        toggle={toggleModal}
        user={selectedUser}
        onSave={loadUsers}
      />
    </React.Fragment>
  );
};

export default UserManagement;
