import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';

import useApi from '../../../hooks/useApi';
import { post, put } from '../../../helpers/api_helper';
import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import useNotification from '../../../hooks/useNotification';

const LeadFormModal = ({ isOpen, toggle, lead, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'Novo',
    notes: '',
  });

  const { request: createLead, loading: creating } = useApi(post);
  const { request: updateLead, loading: updating } = useApi(put);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || '',
        status: lead.status || 'Novo',
        notes: lead.notes || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        source: '',
        status: 'Novo',
        notes: '',
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (lead) {
        await updateLead(`/api/leads/${lead.id}`, formData);
        showSuccess('Lead atualizado com sucesso!');
      } else {
        await createLead('/api/leads', formData);
        showSuccess('Lead criado com sucesso!');
      }
      onSave();
      toggle();
    } catch (err) {
      showError(`Falha ao salvar lead: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <Modal centered isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{lead ? 'Editar Lead' : 'Adicionar Novo Lead'}</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for='name'>Nome</Label>
            <Input
              required
              id='name'
              name='name'
              placeholder='Nome do Lead'
              value={formData.name}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='email'>Email</Label>
            <Input
              id='email'
              name='email'
              placeholder='email@exemplo.com'
              type='email'
              value={formData.email}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='phone'>Telefone</Label>
            <Input
              id='phone'
              name='phone'
              placeholder='(XX) XXXXX-XXXX'
              type='tel'
              value={formData.phone}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='source'>Origem</Label>
            <Input
              id='source'
              name='source'
              placeholder='Ex: Website, Indicação'
              type='text'
              value={formData.source}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for='status'>Status</Label>
            <Input
              id='status'
              name='status'
              type='select'
              value={formData.status}
              onChange={handleChange}
            >
              <option>Novo</option>
              <option>Qualificado</option>
              <option>Contato</option>
              <option>Convertido</option>
              <option>Perdido</option>
            </Input>
          </FormGroup>
          <FormGroup className='mb-0'>
            <Label for='notes'>Notas</Label>
            <Input
              id='notes'
              name='notes'
              rows='3'
              type='textarea'
              value={formData.notes}
              onChange={handleChange}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' disabled={creating || updating} onClick={toggle}>
            Cancelar
          </Button>
          <Button color='primary' disabled={creating || updating} type='submit'>
            {creating || updating ? <LoadingSpinner size='sm' /> : 'Salvar'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default LeadFormModal;
