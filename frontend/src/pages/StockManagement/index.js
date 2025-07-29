import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  InputGroup,
  Badge,
  Alert,
} from 'reactstrap';
import axios from 'axios';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import config from '../../config';

import StockMovementModal from './StockMovementModal';
import StockHistoryModal from './components/StockHistoryModal'; // 1. Importar

const StockManagement = () => {
  document.title = 'Gestão de Estoque | RedeCellRJ PDV';

  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false); // 2. Adicionar estado
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  const fetchStockData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${config.api.API_URL}/api/products?limit=1000`);

      const flattenedVariations = response.data.products.flatMap((product) =>
        product.variations.map((variation) => ({
          ...variation,
          productId: product.id,
          productName: product.name,
          description: product.description,
          categoryId: product.category_id,
        })),
      );

      setVariations(flattenedVariations);
    } catch (err) {
      setError('Falha ao carregar os dados de estoque. Verifique a conexão com o servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  const toggleMovementModal = () => setMovementModalOpen(!movementModalOpen);
  const toggleHistoryModal = () => setHistoryModalOpen(!historyModalOpen); // Handler para o novo modal

  const handleMovementClick = (variation, mode) => {
    setSelectedVariation(variation);
    setModalMode(mode);
    toggleMovementModal();
  };

  const handleHistoryClick = (variation) => {
    setSelectedVariation(variation);
    toggleHistoryModal();
  };

  const handleSuccess = () => {
    fetchStockData();
  };

  const getStatusBadge = (quantity, alertThreshold) => {
    if (quantity <= 0) return <Badge color='danger'>Esgotado</Badge>;
    if (quantity <= alertThreshold) return <Badge color='warning'>Estoque Baixo</Badge>;
    return <Badge color='success'>Em Estoque</Badge>;
  };

  const filteredVariations = variations
    .filter((v) => {
      if (filter === 'low') return v.stock_quantity > 0 && v.stock_quantity <= v.alert_threshold;
      if (filter === 'out') return v.stock_quantity <= 0;
      return true;
    })
    .filter((v) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        v.product_name.toLowerCase().includes(searchLower) ||
        v.color.toLowerCase().includes(searchLower) ||
        (v.barcode && v.barcode.toLowerCase().includes(searchLower))
      );
    });

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Gestão de Estoque' title='Estoque' />

          {error && (
            <Alert color='danger' fade={false}>
              {error}
            </Alert>
          )}

          <Card>
            <CardBody>
              <Row className='mb-4'>
                <Col sm={4}>
                  <InputGroup>
                    <Input
                      placeholder='Buscar por nome, variação ou código...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col className='d-flex justify-content-end gap-2' sm={8}>
                  <Button
                    color={filter === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('all')}
                  >
                    Todos
                  </Button>
                  <Button
                    color={filter === 'low' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('low')}
                  >
                    Estoque Baixo
                  </Button>
                  <Button
                    color={filter === 'out' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('out')}
                  >
                    Esgotados
                  </Button>
                </Col>
              </Row>

              <div className='table-responsive'>
                <table className='table table-hover align-middle'>
                  <thead className='table-light'>
                    <tr>
                      <th>Produto</th>
                      <th>Variação (Cor)</th>
                      <th>Cód. Barras / SKU</th>
                      <th>Estoque Atual</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td className='text-center' colSpan='6'>
                          <LoadingSpinner size='sm' />
                        </td>
                      </tr>
                    ) : (
                      filteredVariations.map((v) => (
                        <tr key={v.id}>
                          <td>{v.productName}</td>
                          <td>{v.color}</td>
                          <td>{v.barcode || 'N/A'}</td>
                          <td>
                            <strong>{v.stock_quantity}</strong>
                          </td>
                          <td>{getStatusBadge(v.stock_quantity, v.alert_threshold)}</td>
                          <td>
                            <div className='d-flex gap-2'>
                              <Button
                                color='success'
                                size='sm'
                                onClick={() => handleMovementClick(v, 'add')}
                              >
                                <i className='bx bx-plus'></i>
                              </Button>
                              <Button
                                color='primary'
                                size='sm'
                                onClick={() => handleMovementClick(v, 'adjust')}
                              >
                                <i className='bx bx-pencil'></i>
                              </Button>
                              <Button color='info' size='sm' onClick={() => handleHistoryClick(v)}>
                                <i className='bx bx-history'></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Container>
      </div>

      <StockMovementModal
        isOpen={movementModalOpen}
        mode={modalMode}
        toggle={toggleMovementModal}
        variation={selectedVariation}
        onSuccess={handleSuccess}
      />

      {/* 4. Renderizar o modal */}
      <StockHistoryModal
        isOpen={historyModalOpen}
        toggle={toggleHistoryModal}
        variation={selectedVariation}
      />
    </React.Fragment>
  );
};

export default StockManagement;
