import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Chart from 'react-apexcharts';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageContainer } from '../styles/common.styles';
import { AutoGraph, InfoOutlined, TrendingUp, TrendingDown, Remove, Engineering, PictureAsPdf } from '@mui/icons-material';
import { Box, Typography, Alert, useTheme, Chip } from '@mui/material';

const Title = styled.h1`
  margin-bottom: 20px;
  color: #2c3e50;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const InsightCard = styled(Card)`
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  border-left: 5px solid #3498db;
`;

const KPICard = styled(Card)`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const KPIValue = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  color: #2ecc71;
  margin-bottom: 5px;
`;

const KPILabel = styled.div`
  color: #7f8c8d;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ExecutiveDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/executive-dashboard')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <PageContainer><div>Erro ao carregar dados.</div></PageContainer>;

  const salesLabels = stats.salesByChannel?.map((s: any) => s.channel) || [];
  const salesData = stats.salesByChannel?.map((s: any) => Number(s.revenue)) || [];

  const conversionRate = stats.serviceConversion?.total > 0 
    ? ((stats.serviceConversion.completed / stats.serviceConversion.total) * 100).toFixed(1) 
    : 0;

  const trendLabels = stats.repairTrends?.map((t: any) => t.model) || [];
  const trendData = stats.repairTrends?.map((t: any) => t.frequency) || [];

  const theme = useTheme();

  const handleDownloadPDF = async () => {
    try {
        const response = await api.get('/executive-dashboard/download-premium', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'relatorio_executivo_premium.pdf');
        document.body.appendChild(link);
        link.click();
    } catch (e) {
        alert('Erro ao gerar PDF');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Title sx={{ mb: 0 }}>Torre de Controle (Executivo)</Title>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<PictureAsPdf />}
            onClick={handleDownloadPDF}
            sx={{ borderRadius: '12px', bgcolor: '#2c3e50' }}
          >
              Baixar Relatório Premium
          </Button>
      </Box>

      <InsightCard sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoGraph color="primary" /> Insights Estratégicos
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {stats.insights?.map((insight: string, idx: number) => (
                <Typography key={idx} variant="body1" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <InfoOutlined fontSize="small" sx={{ mt: 0.5, color: '#3498db' }} />
                    <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </Typography>
            ))}
            {(!stats.insights || stats.insights.length === 0) && (
                <Typography variant="body2" color="text.secondary">Coletando dados suficientes para gerar insights...</Typography>
            )}
        </Box>
      </InsightCard>
      
      <Grid>
        <KPICard>
          <KPIValue>{stats.avgMargin}%</KPIValue>
          <KPILabel>Margem Média (30d)</KPILabel>
        </KPICard>

        <KPICard>
          <KPIValue>{conversionRate}%</KPIValue>
          <KPILabel>Taxa de Conversão OS ({stats.serviceConversion.completed}/{stats.serviceConversion.total})</KPILabel>
        </KPICard>
      </Grid>

      <Grid>
        <Card>
          <h3>Vendas por Canal (Receita)</h3>
          {salesData.length > 0 ? (
             <Chart 
                options={{ 
                    labels: salesLabels,
                    colors: ['#3498db', '#e74c3c'],
                    legend: { position: 'bottom' }
                }} 
                series={salesData} 
                type="pie" 
                height={350} 
              />
          ) : (
              <p>Sem dados de vendas nos últimos 30 dias.</p>
          )}
         
        </Card>
        
        <Card>
          <h3>Tendências de Reparo & Falhas</h3>
          {trendData.length > 0 ? (
              <Chart 
                options={{
                    xaxis: { categories: trendLabels },
                    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
                    colors: [theme.palette.secondary.main]
                }}
                series={[{ name: 'Reparos (3m)', data: trendData }]}
                type="bar"
                height={300}
              />
          ) : <p>Sem dados de reparo nos últimos 3 meses.</p>}
          
          <Box sx={{ mt: 2 }}>
              {stats.repairTrends?.filter((t: any) => t.spikeDetected).map((t: any, i: number) => (
                  <Alert key={i} severity="warning" icon={<Engineering />} sx={{ mb: 1, borderRadius: '8px' }}>
                      {t.recommendation}
                  </Alert>
              ))}
          </Box>
        </Card>

        <Card>
           <h3>Monitor de Preços (Concorrência)</h3>
           <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee', fontSize: '0.8rem', color: '#999' }}>
                        <th>PRODUTO</th>
                        <th>SEU PREÇO</th>
                        <th>MERCADO (MÉD)</th>
                        <th>SUGESTÃO</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.marketSuggestions?.map((s: any) => (
                        <tr key={s.variationId} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '0.9rem' }}>
                            <td style={{ padding: '10px 0' }}>{s.productName}</td>
                            <td>R$ {s.currentPrice}</td>
                            <td>R$ {s.competitorAvgPrice}</td>
                            <td>
                                {s.suggestion === 'raise' && <Chip size="small" color="success" icon={<TrendingUp />} label={`Subir ${s.diffPercent}%`} />}
                                {s.suggestion === 'lower' && <Chip size="small" color="error" icon={<TrendingDown />} label={`Baixar ${Math.abs(s.diffPercent)}%`} />}
                                {s.suggestion === 'maintain' && <Chip size="small" variant="outlined" icon={<Remove />} label="Manter" />}
                            </td>
                        </tr>
                    ))}
                </tbody>
           </table>
        </Card>
      </Grid>
    </PageContainer>
  );
};

export default ExecutiveDashboardPage;
