import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Spinner, Alert, Modal, ModalHeader, ModalBody, Badge, Table } from 'reactstrap';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { Edit, Trash2 } from 'react-feather';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed
import { useDebounce } from '../../hooks/useDebounce'; // Assuming useDebounce is available
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import CommissionRuleFormModal from './components/CommissionRuleFormModal'; // Will create this
import { get, del } from '../../helpers/api_helper'; // Import API functions

import './CommissionRulesPage.scss'; // Page-specific styling

const CommissionRulesPage = () => {
  const [filters, setFilters] = useState({
    type: '',
    search_query: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  const debouncedFilters = useDebounce(filters, 500);

  // Corrected useApi usage
  const { data: rules, loading, error, request: fetchRules } = useApi(() => get('/api/commission-rules', { params: debouncedFilters }));
  const { request: deleteRuleApi, loading: isDeleting } = useApi(del);

  const typeOptions = [
    { value: 'product', label: 'Por Produto' },
    { value: 'service', label: 'Por Serviço' },
    { value: 'salesperson', label: 'Por Vendedor' },
    { value: 'overall_sales', label: 'Vendas Totais' },
  ];

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setModalOpen(true);
  };

  const handleDelete = (rule) => {
    setRuleToDelete(rule);
    setConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await deleteRuleApi(`/api/commission-rules/${ruleToDelete.id}`);
      toast.success('Regra de comissão excluída com sucesso!');
      fetchRules(); // Re-fetch the list
    } catch (err) {
      // Error is already handled by the api_helper interceptor
    } finally {
      setConfirmationModalOpen(false);
      setRuleToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    fetchRules(); // Re-fetch the list
    setModalOpen(false);
    setSelectedRule(null);
  };

  useEffect(() => {
    fetchRules(); // Initial fetch and re-fetch on filter change
  }, [debouncedFilters, fetchRules]);

  return (
    <motion.div
      className="commission-rules-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Gestão de Regras de Comissão</h1>
              <Button color="primary" onClick={() => {
                setSelectedRule(null);
                setModalOpen(true);
              }}>
                <i className="bx bx-plus me-1"></i> Nova Regra
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
                  <Col md={4}>
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
                  <Col md={8}>
                    <FormGroup>
                      <Label for="search_query">Buscar por Descrição:</Label>
                      <Input
                        type="text"
                        id="search_query"
                        placeholder="Buscar..."
                        value={filters.search_query}
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
                <CardTitle tag="h5" className="mb-4">Lista de Regras de Comissão</CardTitle>
                {loading ? (
                  <div className="text-center"><Spinner /> Carregando regras...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar regras: {error.message}</Alert>
                ) : rules && rules.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="table-hover table-striped mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Descrição</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Condição</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rules.map(rule => (
                          <tr key={rule.id}>
                            <td>{rule.id}</td>
                            <td>{rule.description}</td>
                            <td>
                              <Badge color="primary">{typeOptions.find(opt => opt.value === rule.type)?.label || rule.type}</Badge>
                            </td>
                            <td>{rule.value_type === 'percentage' ? `${rule.value}%` : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rule.value)}</td>
                            <td>{rule.condition || 'N/A'}</td>
                            <td>
                              <Button color="light" size="sm" className="me-2" onClick={() => handleEdit(rule)}>
                                <Edit size={16} />
                              </Button>
                              <Button color="light" size="sm" onClick={() => handleDelete(rule)} disabled={isDeleting}>
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <Alert color="info" className="text-center">Nenhuma regra de comissão encontrada.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {modalOpen && (
        <CommissionRuleFormModal
          isOpen={modalOpen}
          rule={selectedRule}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setModalOpen(false);
            setSelectedRule(null);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        message={`Tem certeza que deseja excluir a regra de comissão "${ruleToDelete?.description}"?`}
        title="Confirmar Exclusão"
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </motion.div>
  );
};

export default CommissionRulesPage;