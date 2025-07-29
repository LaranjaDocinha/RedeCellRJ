import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input, Alert, Badge } from 'reactstrap';
import { Link } from 'react-router-dom';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import useApi from '../../hooks/useApi';
import { get, post } from '../../helpers/api_helper';
import { useAuthStore } from '../../store/authStore';

import 'react-loading-skeleton/dist/skeleton.css';

const RepairList = () => {
  document.title = 'Ordens de Serviço | RedeCellRJ PDV';

  const { user } = useAuthStore();
  const [repairs, setRepairs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { request: fetchRepairsApi, loading, error } = useApi(get);

  const fetchRepairs = useCallback(async () => {
    try {
      const params = { search: searchTerm, status: statusFilter, limit: 100, userId: user?.id };
      const response = await fetchRepairsApi('/api/repairs', { params });
      setRepairs(response.repairs || []);
    } catch (err) {
      // O erro já é capturado e exposto pelo hook useApi
      console.error(err);
    }
  }, [searchTerm, statusFilter, fetchRepairsApi, user?.id]);

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  const getStatusBadge = (status) => {
    const colorMap = {
      'Orçamento pendente': 'secondary',
      'Aguardando Aprovação': 'info',
      'Em Reparo': 'primary',
      'Pronto para Retirada': 'primary',
      Finalizado: 'success',
      Cancelado: 'danger',
    };
    const color = colorMap[status] || 'light';
    // Usar text-bg-* para garantir o contraste do texto
    return <span className={`badge text-bg-${color}`}>{status}</span>;
  };

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Ordens de Serviço' title='Gerenciamento' />
          {error && (
            <Alert color='danger' timeout={0}>
              {error}
            </Alert>
          )}
          <Card>
            <CardBody>
              <Row className='mb-4'>
                <Col sm={4}>
                  <Input
                    placeholder='Buscar por cliente, aparelho ou IMEI...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col className='d-flex justify-content-end gap-2' sm={8}>
                  <Button color='success' tag={Link} to='/repairs/new'>
                    <i className='bx bx-plus me-1'></i> Nova O.S.
                  </Button>
                  <Input
                    style={{ maxWidth: '200px' }}
                    type='select'
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value=''>Todos os Status</option>
                    <option value='Orçamento pendente'>Orçamento pendente</option>
                    <option value='Aguardando Aprovação'>Aguardando Aprovação</option>
                    <option value='Em Reparo'>Em Reparo</option>
                    <option value='Pronto para Retirada'>Pronto para Retirada</option>
                    <option value='Finalizado'>Finalizado</option>
                    <option value='Cancelado'>Cancelado</option>
                  </Input>
                </Col>
              </Row>
              <div className='table-responsive'>
                <table className='table table-hover align-middle'>
                  <thead className='table-light'>
                    <tr>
                      <th>#O.S.</th>
                      <th>Cliente</th>
                      <th>Aparelho</th>
                      <th>Técnico</th>
                      <th>Status</th>
                      <th>Custo Total</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <SkeletonTheme baseColor='#e0e0e0' highlightColor='#f5f5f5'>
                        {[...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td>
                              <Skeleton width={50} />
                            </td>
                            <td>
                              <Skeleton width={100} />
                            </td>
                            <td>
                              <Skeleton width={120} />
                            </td>
                            <td>
                              <Skeleton width={80} />
                            </td>
                            <td>
                              <Skeleton width={90} />
                            </td>
                            <td>
                              <Skeleton width={70} />
                            </td>
                            <td>
                              <Skeleton width={80} />
                            </td>
                            <td>
                              <Skeleton height={30} width={100} />
                            </td>
                          </tr>
                        ))}
                      </SkeletonTheme>
                    ) : (
                      repairs.map((repair) => (
                        <tr key={repair.id}>
                          <td>
                            <strong>{repair.id}</strong>
                          </td>
                          <td>{repair.customer_name}</td>
                          <td>{repair.device_type}</td>
                          <td>{repair.technician_name || 'N/A'}</td>
                          <td>{getStatusBadge(repair.status)}</td>
                          <td>R$ {parseFloat(repair.final_cost || 0).toFixed(2)}</td>
                          <td>{new Date(repair.created_at).toLocaleDateString()}</td>
                          <td>
                            <Link className='btn btn-primary btn-sm' to={`/repairs/${repair.id}`}>
                              Ver Detalhes
                            </Link>
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
    </React.Fragment>
  );
};

export default RepairList;
