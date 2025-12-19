import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Skeleton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface SegmentData {
  rfm_segment: string;
  customer_count: number;
}

const RfmSegmentsPage: React.FC = () => {
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSegments = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/rfm/segments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch RFM segments');
        const data = await response.json();
        setSegments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSegments();
  }, [token]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Segmentos de Clientes (RFM)</Typography>
      <Grid container spacing={3}>
        {loading ? (
          Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))
        ) : (
          segments.map(segment => (
            <Grid item xs={12} sm={6} md={4} key={segment.rfm_segment}>
              <Card component={Link} to={`/customers/segments/${segment.rfm_segment}`} sx={{ textDecoration: 'none' }}>
                <CardContent>
                  <Typography variant="h6">{segment.rfm_segment}</Typography>
                  <Typography variant="h4" component="p">{segment.customer_count}</Typography>
                  <Typography color="text.secondary">Clientes</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default RfmSegmentsPage;
