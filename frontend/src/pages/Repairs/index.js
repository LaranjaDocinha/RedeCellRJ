import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input, Spinner, Alert, Badge } from 'reactstrap';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import axios from 'axios';
import config from '../../config';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const RepairList = () => {
  document.title = "Ordens de Serviço | Skote PDV";

  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchRepairs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { search: searchTerm, status: statusFilter, limit: 100 };
      const response = await axios.get(`${config.api.API_URL}/repairs`, { params });
      setRepairs(response.data.repairs);
    } catch (err) {
      setError("Falha ao carregar as Ordens de Serviço.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  const getStatusBadge = (status) => {
    const colorMap = {
      'Orçamento pendente': 'secondary',
      'Aguardando Aprovação': 'info',
      'Em Reparo': 'warning',
      'Pronto para Retirada': 'primary',
      'Finalizado': 'success',
      'Cancelado': 'danger',
    };
    return <Badge color={colorMap[status] || 'light'}>{status}</Badge>;
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Gerenciamento" breadcrumbItem="Ordens de Serviço" />
          {error && <Alert color="danger">{error}</Alert>}
          <Card>
            <CardBody>
              <Row className="mb-4">
                <Col sm={4}>
                  <Input
                    placeholder="Buscar por cliente, aparelho ou IMEI..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col sm={8} className="d-flex justify-content-end gap-2">
                  <Button color="success" tag={Link} to="/repairs/new">
                    <i className="bx bx-plus me-1"></i> Nova O.S.
                  </Button>
                  <Input type="select" style={{ maxWidth: '200px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">Todos os Status</option>
                    <option value="Orçamento pendente">Orçamento pendente</option>
                    <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                    <option value="Em Reparo">Em Reparo</option>
                    <option value="Pronto para Retirada">Pronto para Retirada</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </Input>
                </Col>
              </Row>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
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
                      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
                        {[...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td><Skeleton width={50} /></td>
                            <td><Skeleton width={100} /></td>
                            <td><Skeleton width={120} /></td>
                            <td><Skeleton width={80} /></td>
                            <td><Skeleton width={90} /></td>
                            <td><Skeleton width={70} /></td>
                            <td><Skeleton width={80} /></td>
                            <td><Skeleton width={100} height={30} /></td>
                          </tr>
                        ))}
                      </SkeletonTheme>
                    ) : (
                      repairs.map(repair => (
                        <tr key={repair.id}>
                          <td><strong>{repair.id}</strong></td>
                          <td>{repair.customer_name}</td>
                          <td>{repair.device_type}</td>
                          <td>{repair.technician_name || 'N/A'}</td>
                          <td>{getStatusBadge(repair.status)}</td>
                          <td>R$ {parseFloat(repair.final_cost).toFixed(2)}</td>
                          <td>{new Date(repair.created_at).toLocaleDateString()}</td>
                          <td>
                            <Link to={`/repairs/${repair.id}`} className="btn btn-primary btn-sm">
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