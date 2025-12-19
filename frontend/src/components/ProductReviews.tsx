import React from 'react';
import { Box, Typography, Grid, Divider, Paper } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { RatingStars } from './RatingStars';

// Mock data
const reviewsData = {
  averageRating: 4.8,
  totalReviews: 125,
  ratingDistribution: [90, 20, 5, 5, 5], // 5 a 1 estrelas
  comments: [
    { id: 1, author: 'João S.', rating: 5, text: 'Excelente produto, superou minhas expectativas! A câmera é fantástica.' },
    { id: 2, author: 'Maria P.', rating: 4, text: 'Muito bom, mas a bateria poderia durar um pouco mais. No geral, estou satisfeita.' },
    { id: 3, author: 'Carlos A.', rating: 5, text: 'Design incrível e performance impecável. Recomendo!' },
  ]
};

export const ProductReviews: React.FC = () => {
  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, barHeight: '50%', distributed: true } },
    xaxis: { categories: ['5 Estrelas', '4 Estrelas', '3 Estrelas', '2 Estrelas', '1 Estrela'], labels: { show: false } },
    yaxis: { labels: { style: { colors: ['#333'] } } },
    legend: { show: false },
    grid: { show: false },
    tooltip: { enabled: false },
  };

  const chartSeries = [{
    data: reviewsData.ratingDistribution
  }];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Avaliações dos Clientes</Typography>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Typography variant="h2" fontWeight="bold">{reviewsData.averageRating.toFixed(1)}</Typography>
          <RatingStars value={reviewsData.averageRating} readOnly size="large" />
          <Typography color="text.secondary">Baseado em {reviewsData.totalReviews} avaliações</Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={200} />
        </Grid>
      </Grid>
      <Divider sx={{ my: 4 }} />
      {
        reviewsData.comments.map(comment => (
          <Paper key={comment.id} sx={{ p: 2, mb: 2 }} variant="outlined">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography fontWeight="bold" sx={{ mr: 1 }}>{comment.author}</Typography>
              <RatingStars value={comment.rating} readOnly size="small" />
            </Box>
            <Typography>{comment.text}</Typography>
          </Paper>
        ))
      }
    </Box>
  );
};