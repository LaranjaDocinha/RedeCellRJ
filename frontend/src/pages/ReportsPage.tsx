
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import Table from '../components/Table';
import Input from '../components/Input';
import { Button } from '../components/Button';
import styled from 'styled-components';
import Chart from 'react-apexcharts'; // Import Chart

const ReportContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};

  h1 {
    color: ${({ theme }) => theme.colors.onSurface};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h2 {
    color: ${({ theme }) => theme.colors.onSurface};
    margin-top: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  align-items: flex-end;

  > div {
    flex: 1;
  }
`;

const ReportTypeSelector = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.onSurface}44;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 1rem;
  height: 40px;
  flex: 1;
`;

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('sales-by-date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productId, setProductId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();
  const { token } = useAuth();

  // Helper function to get chart options
  const getChartOptions = (type: string, data: any[]) => {
    let options: ApexCharts.ApexOptions = {
      chart: {
        id: type,
        toolbar: { show: false },
      },
      xaxis: {
        categories: [],
      },
      dataLabels: { enabled: false },
      tooltip: { enabled: true },
    };

    switch (type) {
      case 'sales-by-date':
        options.xaxis = { categories: data.map(d => new Date(d.sale_date).toLocaleDateString()) };
        options.title = { text: 'Vendas por Data' };
        break;
      case 'sales-by-product':
        options.xaxis = { categories: data.map(d => `${d.product_name} (${d.color})`) };
        options.title = { text: 'Vendas por Produto' };
        break;
      case 'sales-by-customer':
        options.xaxis = { categories: data.map(d => d.customer_name) };
        options.title = { text: 'Vendas por Cliente' };
        break;
    }
    return options;
  };

  // Helper function to get chart series
  const getChartSeries = (type: string, data: any[]) => {
    let series: ApexAxisChartSeries = [];
    switch (type) {
      case 'sales-by-date':
        series = [{ name: 'Vendas Diárias', data: data.map(d => parseFloat(d.daily_sales)) }];
        break;
      case 'sales-by-product':
        series = [{ name: 'Receita Total', data: data.map(d => parseFloat(d.total_revenue)) }];
        break;
      case 'sales-by-customer':
        series = [{ name: 'Total Gasto', data: data.map(d => parseFloat(d.total_spent)) }];
        break;
    }
    return series;
  };

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/reports/${reportType}?`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (productId && reportType === 'sales-by-product') params.append('productId', productId);
      if (customerId && reportType === 'sales-by-customer') params.append('customerId', customerId);
      url += params.toString();

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReportData(data);
    } catch (err: any) {
      setError(err.message);
      addNotification(`Failed to fetch report: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch or fetch when filters change
    fetchReport();
  }, [reportType, startDate, endDate, productId, customerId, token, addNotification]);

  const getColumns = () => {
    switch (reportType) {
      case 'sales-by-date':
        return [
          { key: 'sale_date', header: 'Data' },
          { key: 'daily_sales', header: 'Vendas Diárias' },
        ];
      case 'sales-by-product':
        return [
          { key: 'product_name', header: 'Produto' },
          { key: 'color', header: 'Cor' },
          { key: 'total_quantity_sold', header: 'Quantidade Vendida' },
          { key: 'total_revenue', header: 'Receita Total' },
        ];
      case 'sales-by-customer':
        return [
          { key: 'customer_name', header: 'Nome do Cliente' },
          { key: 'customer_email', header: 'Email' },
          { key: 'total_spent', header: 'Total Gasto' },
          { key: 'total_sales_count', header: 'Total de Vendas' },
        ];
      default:
        return [];
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      let url = `/api/reports/${reportType}/export/${format}?`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (productId && reportType === 'sales-by-product') params.append('productId', productId);
      if (customerId && reportType === 'sales-by-customer') params.append('customerId', customerId);
      url += params.toString();

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${reportType}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      addNotification(`Report exported to ${format} successfully!`, 'success');
    } catch (err: any) {
      addNotification(`Failed to export report: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ReportContainer>
      <h1>Relatórios</h1>

      <FilterContainer>
        <ReportTypeSelector value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="sales-by-date">Vendas por Data</option>
          <option value="sales-by-product">Vendas por Produto</option>
          <option value="sales-by-customer">Vendas por Cliente</option>
        </ReportTypeSelector>

        {(reportType === 'sales-by-product' || reportType === 'sales-by-customer') && (
          <Input
            type="number"
            placeholder={reportType === 'sales-by-product' ? 'ID do Produto' : 'ID do Cliente'}
            value={reportType === 'sales-by-product' ? productId : customerId}
            onChange={(e) => reportType === 'sales-by-product' ? setProductId(e.target.value) : setCustomerId(e.target.value)}
          />
        )}

        <Input type="date" placeholder="Data de Início" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" placeholder="Data de Fim" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button onClick={fetchReport}>Gerar Relatório</Button>
        <Button onClick={() => handleExport('csv')} variant="outlined">Exportar CSV</Button>
        <Button onClick={() => handleExport('pdf')} variant="outlined">Exportar PDF</Button>
      </FilterContainer>

      {reportData.length === 0 && !loading && !error ? (
        <p>{t('no_report_data')}</p>
      ) : (
        <div className="chart-container">
          <Chart
            options={getChartOptions(reportType, reportData)}
            series={getChartSeries(reportType, reportData)}
            type="bar" // Default chart type, can be dynamic
            height={350}
          />
        </div>
      )}
    </ReportContainer>
  );
};

export default ReportsPage;
