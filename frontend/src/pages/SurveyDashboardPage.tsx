import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Skeleton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface SurveyResults {
  nps: { score: number; total_responses: number };
  csat: { score: number; total_responses: number };
}

const SurveyDashboardPage: React.FC = () => {
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchResults = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/surveys/results', { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch survey results');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [token]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Dashboard de Satisfação</Typography>
      <Grid container spacing={3}>
        {loading ? (
          <>
            <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={150} /></Grid>
            <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={150} /></Grid>
          </>
        ) : results ? (
          <>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Net Promoter Score (NPS)</Typography>
                  <Typography variant="h3">{results.nps.score}</Typography>
                  <Typography color="text.secondary">{results.nps.total_responses} respostas</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Customer Satisfaction (CSAT)</Typography>
                  <Typography variant="h3">{results.csat.score}%</Typography>
                  <Typography color="text.secondary">{results.csat.total_responses} respostas</Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <Typography>Não foi possível carregar os resultados.</Typography>
        )}
      </Grid>
    </Box>
  );
};

export default SurveyDashboardPage;
