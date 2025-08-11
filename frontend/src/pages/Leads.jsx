
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, CardBody, Button, Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Plus, Edit, Trash2 } from 'react-feather';
import toast from 'react-hot-toast';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  const toggle = () => {
    setModal(!modal);
    if (isEditing) {
        setIsEditing(false);
        setCurrentLead(null);
    }
  }

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leads', { withCredentials: true });
      setLeads(response.data);
    } catch (error) {
      toast.error('Falha ao carregar leads.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentLead({ name: '', email: '', phone: '', status: 'Novo', source: '' });
    setModal(true);
  };

  const handleEdit = (lead) => {
    setIsEditing(true);
    setCurrentLead(lead);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const leadData = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        status: e.target.status.value,
        source: e.target.source.value,
        branch_id: 1, // Hardcoded para demonstração, idealmente viria do usuário logado
    };

    try {
        if (isEditing) {
            await axios.put(`/api/leads/${currentLead.id}`, leadData, { withCredentials: true });
            toast.success('Lead atualizado com sucesso!');
        } else {
            await axios.post('/api/leads', leadData, { withCredentials: true });
            toast.success('Lead criado com sucesso!');
        }
        fetchLeads();
        toggle();
    } catch (error) {
        toast.error('Ocorreu um erro.');
        console.error(error);
    }
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Gestão de Leads</h2>
        </Col>
        <Col className="text-end">
          <Button color="primary" onClick={handleAdd}>
            <Plus size={18} className="me-1" /> Adicionar Lead
          </Button>
        </Col>
      </Row>

      <Card>
        <CardBody>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <div className="table-responsive">
                <table className="table table-hover">
                <thead>
                    <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Fonte</th>
                    <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map(lead => (
                    <tr key={lead.id}>
                        <td>{lead.name}</td>
                        <td>{lead.email}</td>
                        <td>{lead.phone}</td>
                        <td><span className={`badge bg-light-secondary`}>{lead.status}</span></td>
                        <td>{lead.source}</td>
                        <td>
                        <Button color="light" size="sm" className="me-2" onClick={() => handleEdit(lead)}>
                            <Edit size={16} />
                        </Button>
                        {/* Botão de deletar pode ser adicionado aqui */}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>{isEditing ? 'Editar Lead' : 'Adicionar Novo Lead'}</ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="name">Nome</Label>
              <Input id="name" name="name" type="text" defaultValue={currentLead?.name} required />
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={currentLead?.email} />
            </FormGroup>
            <FormGroup>
              <Label for="phone">Telefone</Label>
              <Input id="phone" name="phone" type="text" defaultValue={currentLead?.phone} />
            </FormGroup>
            <FormGroup>
              <Label for="status">Status</Label>
              <Input id="status" name="status" type="select" defaultValue={currentLead?.status}>
                <option>Novo</option>
                <option>Contatado</option>
                <option>Qualificado</option>
                <option>Não qualificado</option>
                <option>Convertido</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="source">Fonte</Label>
              <Input id="source" name="source" type="text" defaultValue={currentLead?.source} placeholder="Ex: Indicação, Site, etc." />
            </FormGroup>
            <Button color="primary" type="submit">Salvar</Button>
          </Form>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default LeadsPage;
