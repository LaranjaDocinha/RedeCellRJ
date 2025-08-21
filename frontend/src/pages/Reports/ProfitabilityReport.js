import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Card, CardBody, CardTitle, Row, Col, Input, Button, Label } from 'reactstrap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import AdvancedTable from '../../components/Common/AdvancedTable';
import useApi from '../../hooks/useApi';
import useNotification from '../../hooks/useNotification';

const ProfitabilityReport = () => {
  document.title = 'Relatório de Lucratividade | PDV Web';
  const { showSuccess, showError } = useNotification();

  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [productId, setProductId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const { request: fetchReport, loading, error } = useApi('get');
  const { request: fetchProductsListApi } = useApi('get');
  const { request: fetchCategoriesListApi } = useApi('get');

  const loadReport = useCallback(async () => {
    try {
      const params = {
        startDate,
        endDate,
        ...(productId && { productId }),
        ...(categoryId && { categoryId }),
      };
      const response = await fetchReport('/api/reports/profitability', { params });
      setReportData(response);
    } catch (err) {
      showError('Falha ao carregar relatório de lucratividade.');
      console.error(err);
    }
  }, [startDate, endDate, productId, categoryId, fetchReport, showError]);

  const loadProductsAndCategories = useCallback(async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetchProductsListApi('/api/products?limit=1000'),
        fetchCategoriesListApi('/api/categories?limit=1000'),
      ]);
      setProducts(productsResponse.products || []);
      setCategories(categoriesResponse.categories || []);
    } catch (err) {
      showError('Falha ao carregar listas de produtos/categorias.');
      console.error(err);
    }
  }, [fetchProductsListApi, fetchCategoriesListApi, showError]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    loadProductsAndCategories();
  }, [loadProductsAndCategories]);

  const columns = useMemo(
    () => [
      {
        header: 'Produto',
        accessorKey: 'product_name',
      },
      {
        header: 'Qtd. Vendida',
        accessorKey: 'total_quantity_sold',
      },
      {
        header: 'Receita Total',
        accessorKey: 'total_revenue',
        cell: (info) => `R$ ${parseFloat(info.getValue()).toFixed(2)}`,
      },
      {
        header: 'Custo Total',
        accessorKey: 'total_cost',
        cell: (info) => `R$ ${parseFloat(info.getValue()).toFixed(2)}`,
      },
      {
        header: 'Lucro Bruto',
        accessorKey: 'gross_profit',
        cell: (info) => `R$ ${parseFloat(info.getValue()).toFixed(2)}`,
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Lucratividade' title='Relatórios' />

          <Card>
            <CardBody>
              <CardTitle className='h4 mb-4'>Relatório de Lucratividade</CardTitle>
              <Row className='mb-3'>
                <Col md={3}>
                  <Label for='startDate'>Data Início</Label>
                  <Input
                    id='startDate'
                    type='date'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Label for='endDate'>Data Fim</Label>
                  <Input
                    id='endDate'
                    type='date'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Label for='productId'>Produto</Label>
                  <Input
                    id='productId'
                    type='select'
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    <option value=''>Todos os Produtos</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={3}>
                  <Label for='categoryId'>Categoria</Label>
                  <Input
                    id='categoryId'
                    type='select'
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value=''>Todas as Categorias</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Input>
                </Col>
              </Row>
              <div className='mb-3'>
                <Button color='primary' disabled={loading} onClick={loadReport}>
                  {loading ? 'Carregando...' : 'Gerar Relatório'}
                </Button>
              </div>
              <AdvancedTable
                columns={columns}
                data={reportData}
                emptyStateMessage='Nenhum dado de lucratividade encontrado para os filtros selecionados.'
                emptyStateTitle='Sem Dados'
                loading={loading}
                persistenceKey='profitabilityReportTable'
              />
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ProfitabilityReport;