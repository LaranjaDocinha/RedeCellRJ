import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, CardTitle, Form, FormGroup, Label, Input } from 'reactstrap';
import { motion } from 'framer-motion';
import DateRangePicker from '../../../components/Common/DateRangePicker';
import ProfitabilityCard from '../../../components/Reports/ProfitabilityCard';
import AdvancedTable from '../../../components/Common/AdvancedTable';
import { useAuthStore } from '../../../store/authStore'; // Assuming auth store for token
import { formatCurrency } from '../../../utils/formatters'; // Assuming a formatter utility
import { toast } from 'react-toastify'; // For notifications

const ProductProfitabilityReportPage = () => {
  const { token } = useAuthStore();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch products and categories for filter dropdowns
  useEffect(() => {
    const fetchDataForFilters = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!productsResponse.ok) throw new Error('Failed to fetch products');
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Fetch categories
        const categoriesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

      } catch (err) {
        console.error('Error fetching filter data:', err);
        toast.error('Erro ao carregar dados para filtros.');
      }
    };
    fetchDataForFilters();
  }, [token]);

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      if (!startDate || !endDate) return;

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          ...(selectedProduct && { productId: selectedProduct }),
          ...(selectedCategory && { categoryId: selectedCategory }),
        }).toString();

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reports/product-profitability?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch report data');
        }

        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching product profitability report:', err);
        setError(err.message);
        toast.error(`Erro: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [startDate, endDate, selectedProduct, selectedCategory, token]);

  // Prepare data for summary cards
  const totalGrossProfit = useMemo(() => reportData.reduce((sum, item) => sum + parseFloat(item.gross_profit || 0), 0), [reportData]);
  const totalRevenue = useMemo(() => reportData.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0), [reportData]);
  const totalProductsSold = useMemo(() => reportData.reduce((sum, item) => sum + parseInt(item.total_quantity_sold || 0), 0), [reportData]);

  const highestProfitMarginProduct = useMemo(() => {
    if (reportData.length === 0) return null;
    return reportData.reduce((prev, current) => (parseFloat(prev.profit_margin_percentage) > parseFloat(current.profit_margin_percentage) ? prev : current));
  }, [reportData]);

  const lowestProfitMarginProduct = useMemo(() => {
    if (reportData.length === 0) return null;
    return reportData.reduce((prev, current) => (parseFloat(prev.profit_margin_percentage) < parseFloat(current.profit_margin_percentage) ? prev : current));
  }, [reportData]);

  // Prepare data for detailed table
  const tableColumns = useMemo(() => [
    { Header: 'ID do Produto', accessor: 'product_id' },
    { Header: 'Nome do Produto', accessor: 'product_name' },
    { Header: 'Quantidade Vendida', accessor: 'total_quantity_sold' },
    { Header: 'Receita Total', accessor: 'total_revenue', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Custo Total', accessor: 'total_cost', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Lucro Bruto', accessor: 'gross_profit', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Margem (%)', accessor: 'profit_margin_percentage', Cell: ({ value }) => `${parseFloat(value).toFixed(2)}%` },
  ], []);

  return (
    <Container fluid className="py-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4">Relatório de Lucratividade por Produto</h2>

        <Row className="mb-4">
          <Col md="4">
            <FormGroup>
              <Label for="dateRange">Período</Label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                setStartDate={(date) => setDateRange([date, endDate])}
                setEndDate={(date) => setDateRange([startDate, date])}
              />
            </FormGroup>
          </Col>
          <Col md="4">
            <FormGroup>
              <Label for="productSelect">Produto</Label>
              <Input
                type="select"
                name="productSelect"
                id="productSelect"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Todos os Produtos</option>
                {products.map(prod => (
                  <option key={prod.id} value={prod.id}>{prod.name}</option>
                ))}
              </Input>
            </FormGroup>
          </Col>
          <Col md="4">
            <FormGroup>
              <Label for="categorySelect">Categoria</Label>
              <Input
                type="select"
                name="categorySelect"
                id="categorySelect"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas as Categorias</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Input>
            </FormGroup>
          </Col>
        </Row>

        {loading ? (
          <p>Carregando dados do relatório...</p>
        ) : error ? (
          <p className="text-danger">Erro ao carregar relatório: {error}</p>
        ) : (
          <>
            <Row className="mb-4">
              <Col md="3">
                <ProfitabilityCard
                  title="Lucro Bruto Total"
                  value={formatCurrency(totalGrossProfit)}
                  iconClass="bx-dollar"
                  animationDelay={0}
                />
              </Col>
              <Col md="3">
                <ProfitabilityCard
                  title="Receita Total"
                  value={formatCurrency(totalRevenue)}
                  iconClass="bx-line-chart"
                  animationDelay={0.1}
                />
              </Col>
              <Col md="3">
                <ProfitabilityCard
                  title="Maior Margem"
                  value={highestProfitMarginProduct ? `${highestProfitMarginProduct.product_name} (${highestProfitMarginProduct.profit_margin_percentage.toFixed(2)}%)` : 'N/A'}
                  iconClass="bx-trending-up"
                  animationDelay={0.2}
                />
              </Col>
              <Col md="3">
                <ProfitabilityCard
                  title="Menor Margem"
                  value={lowestProfitMarginProduct ? `${lowestProfitMarginProduct.product_name} (${lowestProfitMarginProduct.profit_margin_percentage.toFixed(2)}%)` : 'N/A'}
                  iconClass="bx-trending-down"
                  animationDelay={0.3}
                />
              </Col>
            </Row>

            <Row className="mb-4">
              <Col lg="12">
                <Card>
                  <CardHeader>
                    <CardTitle tag="h5" className="mb-0">Detalhes de Lucratividade por Produto</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <AdvancedTable
                      columns={tableColumns}
                      data={reportData}
                      enablePagination={true}
                      enableSearch={true}
                      searchPlaceholder="Buscar produto..."
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </motion.div>
    </Container>
  );
};

export default ProductProfitabilityReportPage;