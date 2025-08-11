import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert, ListGroup, ListGroupItem, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import useChecklistStore from '../store/checklistStore';
import ChecklistTemplateForm from '../components/checklists/ChecklistTemplateForm'; // Import the real form
import { Edit, Trash2 } from 'react-feather';

// Real list component
const ChecklistTemplateList = ({ templates, onEdit, onDelete }) => (
  <ListGroup flush>
    {templates.map(t => (
      <ListGroupItem key={t.id} className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-0">{t.name}</h6>
          <small className="text-muted">{t.items.length} itens | Categoria: {t.category || 'N/A'}</small>
        </div>
        <div>
          <Button color="light" size="sm" className="me-2" onClick={() => onEdit(t)}><Edit size={14} /></Button>
          <Button color="danger" outline size="sm" onClick={() => onDelete(t.id)}><Trash2 size={14} /></Button>
        </div>
      </ListGroupItem>
    ))}
  </ListGroup>
);

// Real confirmation modal
const ConfirmationModal = ({ isOpen, toggle, onConfirm, title, children }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>{title}</ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
            <Button color="light" onClick={toggle}>Cancelar</Button>
            <Button color="danger" onClick={onConfirm}>Confirmar Exclusão</Button>
        </ModalFooter>
    </Modal>
);

const ChecklistTemplatesPage = () => {
  const {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useChecklistStore();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const toggleFormModal = () => setIsFormModalOpen(!isFormModalOpen);
  const toggleConfirmModal = () => setIsConfirmModalOpen(!isConfirmModalOpen);

  const handleCreate = () => {
    setSelectedTemplate(null);
    toggleFormModal();
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    toggleFormModal();
  };

  const handleDeleteRequest = (id) => {
    setTemplateToDelete(id);
    toggleConfirmModal();
  };

  const handleConfirmDelete = async () => {
    if (templateToDelete) {
      try {
        await deleteTemplate(templateToDelete);
      } catch (e) {
        // error is already set in the store, the Alert component will show it
      }
    }
    toggleConfirmModal();
  };

  const handleSave = async (values) => {
    try {
        if (selectedTemplate) {
            await updateTemplate(selectedTemplate.id, values);
        } else {
            await createTemplate(values);
        }
        toggleFormModal();
    } catch (e) {
        // error is handled in the store, but we might want to keep the modal open on failure
        // for now, we close it regardless.
        toggleFormModal();
    }
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle tag="h5" className="mb-0">Gerenciar Templates de Checklist</CardTitle>
                <Button color="success" onClick={handleCreate}>Criar Novo Template</Button>
              </div>

              {error && <Alert color="danger">Erro: {error}</Alert>}

              {loading && !templates.length ? (
                <div className="text-center p-5">
                  <Spinner />
                  <p className="mt-2">Carregando templates...</p>
                </div>
              ) : templates.length === 0 && !loading ? (
                <div className="text-center p-5">
                    <p>Nenhum template de checklist encontrado.</p>
                    <Button color="primary" onClick={handleCreate}>Crie o primeiro!</Button>
                </div>
              ) : (
                <ChecklistTemplateList
                  templates={templates}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {isFormModalOpen && 
        <ChecklistTemplateForm 
            isOpen={isFormModalOpen} 
            toggle={toggleFormModal} 
            template={selectedTemplate} 
            onSave={handleSave} 
        />
      }
      <ConfirmationModal 
        isOpen={isConfirmModalOpen} 
        toggle={toggleConfirmModal} 
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
      >
        <p>Você tem certeza que deseja excluir este template?</p>
        <p>Esta ação não poderá ser desfeita.</p>
      </ConfirmationModal>
    </Container>
  );
};

export default ChecklistTemplatesPage;
