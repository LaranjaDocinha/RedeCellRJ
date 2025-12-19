import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Skeleton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Table from '../components/Table'; // Assuming a generic Table component exists

interface CustomerData {
  id: number;
  name: string;
  email: string;
  rfm_recency: number;
  rfm_frequency: number;
  rfm_monetary: number;
}

const CustomerSegmentPage: React.FC = () => {
  const { segmentName } = useParams<{ segmentName: string }>();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token || !segmentName) return;
      try {
        const response = await fetch(`/api/rfm/segments/${segmentName}` , {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch customers for segment ${segmentName}`);
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [token, segmentName]);

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'Email' },
    { key: 'rfm_recency', header: 'Recência' },
    { key: 'rfm_frequency', header: 'Frequência' },
    { key: 'rfm_monetary', header: 'Valor Monetário' },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Clientes no Segmento: {segmentName}</Typography>
      {loading ? (
        <Skeleton variant="rectangular" height={400} />
      ) : (
        <Table columns={columns} data={customers} />
      )}
    </Box>
  );
};

export default CustomerSegmentPage;
