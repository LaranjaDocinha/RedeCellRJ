import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SlowMovingProductsWidget: React.FC<{ data: any[] }> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('slow_moving_products')}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('product')}</TableCell>
              <TableCell>{t('stock')}</TableCell>
              <TableCell>{t('days_since_sale')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2">{row.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{row.color}</Typography>
                  </TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.days_since_sale ? `${Math.floor(row.days_since_sale)} dias` : t('never_sold')} 
                      color="error" 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">{t('no_slow_moving_products')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SlowMovingProductsWidget;
