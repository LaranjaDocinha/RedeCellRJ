import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Spinner, Alert, Modal, ModalHeader, ModalBody, Badge, Table } from 'reactstrap';
import { motion } from 'framer-motion';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { Edit, Trash2 } from 'react-feather';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed
import { useDebounce } from '../../hooks/useDebounce'; // Assuming useDebounce is available
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import MarketingCampaignFormModal from './components/MarketingCampaignFormModal'; // Will create this

import 'flatpickr/dist/themes/material_blue.css'; // Example theme
import './MarketingCampaignsPage.scss'; // Page-specific styling

const MarketingCampaignsPage = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    type: '',
    search_query: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  const debouncedFilters = useDebounce(filters, 500);

  const { data: campaigns, isLoading, error, refresh } = useApi('/api/marketing/campaigns', { params: debouncedFilters });
  const { request: deleteCampaignApi, isLoading: isDeleting } = useApi('delete');

  const statusOptions = [
    { value: 'active', label: 'Ativa' },
    { value: 'paused', label: 'Pausada' },
    { value: 'completed', label: 'Concluída' },
    { value: 'draft', label: 'Rascunho' },
  ];

  const typeOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'social_media', label: 'Mídia Social' },
    { value: 'push_notification', label: 'Notificação Push' },
  ];

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setModalOpen(true);
  };

  const handleDelete = (campaign) => {
    setCampaignToDelete(campaign);
    setConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCampaignApi(`/api/marketing/campaigns/${campaignToDelete.id}`);
      toast.success('Campanha excluída com sucesso!');
      setRefreshList(prev => !prev);
    } catch (err) {
      toast.error(err.message || 'Falha ao excluir campanha.');
    } finally {
      setConfirmationModalOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setRefreshList(prev => !prev);
    setModalOpen(false);
  };

  useEffect(() => {
    refresh(); // Initial fetch and re-fetch on filter/refreshList change
  }, [debouncedFilters, refresh, refreshList]);

  return (
    <motion.div
      className="marketing-campaigns-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Gestão de Campanhas de Marketing</h1>
              <Button color="primary" onClick={() => handleEdit(null)}>
                <i className="bx bx-plus me-1"></i> Nova Campanha
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Filtros</CardTitle>
                <Row>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="dateRange">Período:</Label>
                      <Flatpickr
                        className="form-control d-block"
                        options={{ mode: 'range', dateFormat: 'Y-m-d' }}
                        onChange={([start, end]) => {
                          handleFilterChange('startDate', start ? start.toISOString().split('T')[0] : '');
                          handleFilterChange('endDate', end ? end.toISOString().split('T')[0] : '');
                        }}
                        placeholder="Selecione o período"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="status">Status:</Label>
                      <Select
                        options={statusOptions}
                        isClearable
                        placeholder="Filtrar por status..."
                        onChange={(val) => handleFilterChange('status', val ? val.value : '')}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="type">Tipo:</Label>
                      <Select
                        options={typeOptions}
                        isClearable
                        placeholder="Filtrar por tipo..."
                        onChange={(val) => handleFilterChange('type', val ? val.value : '')}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label for="search_query">Buscar por Nome/Descrição:</Label>
                      <Input
                        type="text"
                        id="search_query"
                        placeholder="Buscar..."
                        onChange={(e) => handleFilterChange('search_query', e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Lista de Campanhas</CardTitle>
                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando campanhas...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar campanhas: {error.message}</Alert>
                ) : campaigns && campaigns.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="table-hover table-striped mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nome</th>
                          <th>Tipo</th>
                          <th>Status</th>
                          <th>Data Início</th>
                          <th>Data Fim</th>
                          <th>Orçamento</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(campaign => (
                          <tr key={campaign.id}>
                            <td>{campaign.id}</td>
                            <td>{campaign.name}</td>
                            <td>{campaign.type}</td>
                            <td>
                              <Badge color={
                                campaign.status === 'active' ? 'success' :
                                campaign.status === 'paused' ? 'warning' :
                                campaign.status === 'completed' ? 'info' :
                                'secondary'
                              }>
                                {campaign.status === 'active' ? 'Ativa' :
                                 campaign.status === 'paused' ? 'Pausada' :
                                 campaign.status === 'completed' ? 'Concluída' :
                                 'Rascunho'}
                              </Badge>
                            </td>
                            <td>{new Date(campaign.start_date).toLocaleDateString('pt-BR')}</td>
                            <td>{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('pt-BR') : 'N/A'}</td>
                            <td>{campaign.budget ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(campaign.budget) : 'N/A'}</td>
                            <td>
                              <Button color="light" size="sm" className="me-2" onClick={() => handleEdit(campaign)}>
                                <Edit size={16} />
                              </Button>
                              <Button color="light" size="sm" onClick={() => handleDelete(campaign)} disabled={isDeleting}>
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <Alert color="info" className="text-center">Nenhuma campanha de marketing encontrada.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="lg">
        <ModalHeader toggle={() => setModalOpen(false)}>
          {selectedCampaign ? 'Editar Campanha' : 'Nova Campanha'}
        </ModalHeader>
        <ModalBody>
          <MarketingCampaignFormModal
            campaign={selectedCampaign}
            onSuccess={handleFormSuccess}
            onCancel={() => setModalOpen(false)}
          />
        </ModalBody>
      </Modal>

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        message={`Tem certeza que deseja excluir a campanha "${campaignToDelete?.name}"?`}
        title="Confirmar Exclusão"
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
};

export default MarketingCampaignsPage;
