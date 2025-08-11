import React, { useState, useEffect, useMemo } from 'react';
import { Container, Button, Card, CardBody, CardTitle } from 'reactstrap';

import useNotification from '../../hooks/useNotification';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AdvancedTable from '../../components/Common/AdvancedTable';
import { get, post, put, del } from '../../helpers/api_helper';
import useApi from '../../hooks/useApi';

import RoleFormModal from './components/RoleFormModal';
import PermissionAssignmentModal from './components/PermissionAssignmentModal';

const RolesAndPermissions = () => {
  document.title = 'Gestão de Papéis e Permissões | PDV Web';

  const [roles, setRoles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const { request: fetchRoles, loading, error } = useApi(get);
  const { request: deleteRole } = useApi(del);
  const { showSuccess, showError } = useNotification();

  const loadRoles = () => {
    fetchRoles('/api/roles')
      .then((response) => {
        if (response) {
          setRoles(response);
        }
      })
      .catch((err) => {
        showError('Falha ao carregar papéis.');
        console.error(err);
      });
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  const handleNewClick = () => {
    setSelectedRole(null);
    setModalOpen(true);
  };

  const handleDeleteClick = async (role) => {
    if (window.confirm(`Tem certeza que deseja excluir o papel ${role.name}?`)) {
      try {
        await deleteRole(`/api/roles/${role.id}`);
        showSuccess('Papel excluído com sucesso!');
        loadRoles();
      } catch (err) {
        showError('Falha ao excluir papel.');
        console.error(err);
      }
    }
  };

  const handleManagePermissionsClick = (role) => {
    setSelectedRole(role);
    setPermissionModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: 'Nome',
        accessorKey: 'name',
      },
      {
        header: 'Descrição',
        accessorKey: 'description',
      },
      {
        header: 'Ações',
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className='d-flex gap-2'>
              <Button color='primary' size='sm' onClick={() => handleEditClick(role)}>
                <i className='bx bx-pencil me-1'></i> Editar
              </Button>
              <Button color='info' size='sm' onClick={() => handleManagePermissionsClick(role)}>
                <i className='bx bx-shield-alt-2 me-1'></i> Permissões
              </Button>
              <Button color='danger' size='sm' onClick={() => handleDeleteClick(role)}>
                <i className='bx bx-trash me-1'></i> Excluir
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
          <Breadcrumbs breadcrumbItem='Papéis e Permissões' title='Administração' />

          <Card>
            <CardBody>
              <CardTitle className='h4 mb-4'>Gestão de Papéis</CardTitle>
              <div className='mb-3'>
                <Button color='success' onClick={handleNewClick}>
                  <i className='bx bx-plus me-1'></i> Adicionar Novo Papel
                </Button>
              </div>
              <AdvancedTable
                columns={columns}
                data={roles}
                emptyStateActionText={'Adicionar Papel'}
                emptyStateIcon={''}
                emptyStateMessage={'Cadastre seu primeiro papel.'}
                emptyStateTitle={'Nenhum papel encontrado'}
                loading={loading}
                persistenceKey='rolesTable'
                onEmptyStateActionClick={handleNewClick}
                onRowClick={handleEditClick}
              />
            </CardBody>
          </Card>
        </Container>
      </div>

      <RoleFormModal
        isOpen={modalOpen}
        role={selectedRole}
        toggle={() => setModalOpen(!modalOpen)}
        onSave={loadRoles}
      />

      <PermissionAssignmentModal
        isOpen={permissionModalOpen}
        role={selectedRole}
        toggle={() => setPermissionModalOpen(!permissionModalOpen)}
        onSave={loadRoles}
      />
    </React.Fragment>
  );
};

export default RolesAndPermissions;
