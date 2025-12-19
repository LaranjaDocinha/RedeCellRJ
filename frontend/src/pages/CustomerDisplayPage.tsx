import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, Divider, Grid } from '@mui/material';
import AnimatedCounter from '../components/AnimatedCounter';
import { useTranslation } from 'react-i18next';

const CustomerDisplayPage: React.FC = () => {
  const { t } = useTranslation();
  const [cart, setCart] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel('customer_display_channel');

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'UPDATE_CART') {
        setCart(payload.cart);
        setTotal(payload.total);
      } else if (type === 'SHOW_QR_CODE') {
        setQrCode(payload.qrCode);
      } else if (type === 'CLEAR_DISPLAY') {
        setCart([]);
        setTotal(0);
        setQrCode(null);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 4, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        {t('welcome_to_store')}
      </Typography>

      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        <Grid item xs={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <List>
                {cart.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity}x ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}`}
                        primaryTypographyProps={{ variant: 'h5' }}
                        secondaryTypographyProps={{ variant: 'h6' }}
                      />
                      <Typography variant="h5">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>{t('total_to_pay')}</Typography>
            <Typography variant="h2" color="secondary" fontWeight="bold">
              <AnimatedCounter value={total} />
            </Typography>
          </Card>

          {qrCode && (
            <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
              <Typography variant="h5" gutterBottom>{t('scan_to_pay_pix')}</Typography>
              <img src={`data:image/png;base64,${qrCode}`} alt="PIX QR Code" style={{ width: '100%', maxWidth: '300px' }} />
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDisplayPage;
