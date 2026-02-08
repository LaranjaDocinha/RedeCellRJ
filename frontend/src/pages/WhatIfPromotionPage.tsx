import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Slider, Typography, Box, Paper, Grid, Divider, 
  alpha, useTheme, Card, CardContent 
} from '@mui/material';
import { ShowChart, TrendingUp, AttachMoney, Settings } from '@mui/icons-material';
import api from '../services/api';
import { PageContainer } from '../styles/common.styles';

const SimulationCard = styled(Paper)`
  padding: 30px;
  border-radius: 24px;
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
`;

const StatBox = styled(Box)<{ positive: boolean }>`
  text-align: center;
  padding: 20px;
  border-radius: 16px;
  background: ${props => props.positive ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.positive ? '#2e7d32' : '#c62828'};
`;

const WhatIfSimulationPage: React.FC = () => {
  const [printPrice, setPrintPrice] = useState(1);
  const [salesVol, setSalesVol] = useState(1);
  const [costs, setCost] = useState(1);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    runSim();
  }, [printPrice, salesVol, costs]);

  const runSim = async () => {
    try {
      const res = await api.get('/what-if/simulate', {
        params: {
            printPriceMultiplier: printPrice,
            salesVolumeMultiplier: salesVol,
            costMultiplier: costs
        }
      });
      setResults(res.data);
    } catch (e) { console.error(e); }
  };

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Settings color="primary" /> Simulador Estratégico "What-If"
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ajuste as variáveis abaixo para prever o impacto financeiro no seu negócio baseado no histórico dos últimos 30 dias.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <SimulationCard elevation={0}>
            <Typography variant="h6" gutterBottom>Variáveis de Mercado</Typography>
            
            <Box sx={{ mt: 4 }}>
                <Typography gutterBottom>Preço Médio Impressão ({Math.round(printPrice * 100)}%)</Typography>
                <Slider value={printPrice} min={0.5} max={2} step={0.1} onChange={(_, v) => setPrintPrice(v as number)} valueLabelDisplay="auto" />
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography gutterBottom>Volume de Vendas ({Math.round(salesVol * 100)}%)</Typography>
                <Slider value={salesVol} min={0.5} max={3} step={0.1} onChange={(_, v) => setSalesVol(v as number)} valueLabelDisplay="auto" />
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography gutterBottom>Custos Operacionais ({Math.round(costs * 100)}%)</Typography>
                <Slider value={costs} min={0.5} max={2} step={0.1} onChange={(_, v) => setCost(v as number)} valueLabelDisplay="auto" color="secondary" />
            </Box>
          </SimulationCard>
        </Grid>

        <Grid item xs={12} md={7}>
          {results && (
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: '20px', bgcolor: '#2c3e50', color: 'white' }}>
                        <CardContent>
                            <Typography variant="overline">RECEITA MENSAL PROJETADA</Typography>
                            <Typography variant="h3">R$ {Number(results.projection.revenue).toLocaleString()}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                Base atual: R$ {Number(results.baseline.revenue).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={6}>
                    <StatBox positive={Number(results.projection.impact) >= 0}>
                        <Typography variant="overline">LUCRO PROJETADO</Typography>
                        <Typography variant="h4">R$ {Number(results.projection.profit).toLocaleString()}</Typography>
                    </StatBox>
                </Grid>

                <Grid item xs={6}>
                    <StatBox positive={Number(results.projection.impact) >= 0}>
                        <Typography variant="overline">IMPACTO LÍQUIDO</Typography>
                        <Typography variant="h4">
                            {Number(results.projection.impact) >= 0 ? '+' : ''} 
                            R$ {Number(results.projection.impact).toLocaleString()}
                        </Typography>
                    </StatBox>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: '20px', border: '1px dashed #ccc' }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp color="success" /> Análise de Viabilidade
                        </Typography>
                        <Typography variant="body2">
                            {Number(results.projection.impact) > 0 
                                ? `Este cenário resultaria em um aumento de R$ ${results.projection.impact} no seu bolso ao final do mês.`
                                : `Cuidado: estas alterações podem reduzir sua lucratividade mensal em R$ ${Math.abs(results.projection.impact)}.`
                            }
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default WhatIfSimulationPage;