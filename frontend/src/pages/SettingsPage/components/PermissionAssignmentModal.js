import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
} from 'reactstrap';

import useNotification from '../../../hooks/useNotification';
import useApi from '../../../hooks/useApi';
import { get, post } from '../../../helpers/api_helper';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';

const PermissionAssignmentModal = ({ isOpen, toggle, role, onSave }) => {
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

  const { request: fetchAllPermissions, loading: loadingPermissions } = useApi('get');
  const { request: assignPermissions, loading: assigningPermissions } = useApi('post');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (isOpen) {
      fetchAllPermissions('/api/roles/permissions')
        .then((data) => {
          setAllPermissions(data);
        })
        .catch((err) => {
          showError('Falha ao carregar permissões disponíveis.');
          console.error(err);
        });

      // Carregar permissões atuais do papel
      if (role && role.id) {
        // Assumindo que o papel já vem com suas permissões ou que há um endpoint para isso
        // Por simplicidade, vamos simular que o role.permissions é um array de objetos de permissão
        // Em um cenário real, você faria uma nova chamada de API para buscar as permissões do papel
        // Ex: fetchPermissionsForRole(`/api/roles/${role.id}/permissions`)
        // Por enquanto, vamos assumir que o objeto `role` já tem uma propriedade `permissions`
        // que é um array de objetos de permissão, ou que você vai buscar isso aqui.
        // Para este exemplo, vamos assumir que o `role` tem uma propriedade `permission_ids`
        // que é um array de IDs de permissão.
        setSelectedPermissionIds(role.permission_ids || []);
      }
    }
  }, [isOpen, role, fetchAllPermissions, showError]);

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const handleSubmit = async () => {
    if (!role || !role.id) {
      showError('Nenhum papel selecionado para atribuir permissões.');
      return;
    }
    try {
      await assignPermissions(`/api/roles/${role.id}/permissions`, {
        permissionIds: selectedPermissionIds,
      });
      showSuccess('Permissões atribuídas com sucesso!');
      onSave();
      toggle();
    } catch (err) {
      showError(`Falha ao atribuir permissões: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <Modal centered isOpen={isOpen} size='lg' toggle={toggle}>
      <ModalHeader toggle={toggle}>Atribuir Permissões ao Papel: {role?.name}</ModalHeader>
      <ModalBody>
        {loadingPermissions ? (
          <LoadingSpinner>Carregando permissões...</LoadingSpinner>
        ) : (
          <Row>
            {allPermissions.map((permission) => (
              <Col key={permission.id} md={6}>
                <FormGroup check className='mb-2'>
                  <Input
                    checked={selectedPermissionIds.includes(permission.id)}
                    id={`permission-${permission.id}`}
                    type='checkbox'
                    onChange={() => handlePermissionChange(permission.id)}
                  />
                  <Label check for={`permission-${permission.id}`}>
                    {permission.name} ({permission.description})
                  </Label>
                </FormGroup>
              </Col>
            ))}
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' disabled={assigningPermissions} onClick={toggle}>
          Cancelar
        </Button>
        <Button
          color='primary'
          disabled={assigningPermissions || loadingPermissions}
          onClick={handleSubmit}
        >
          {assigningPermissions ? <LoadingSpinner size='sm' /> : 'Salvar Permissões'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PermissionAssignmentModal;
