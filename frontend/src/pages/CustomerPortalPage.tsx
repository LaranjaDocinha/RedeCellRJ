import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, List, ListItem, ListItemText, TextField, Tabs, Tab } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CustomerPortalPage: React.FC = () => {
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [customerWarranties, setCustomerWarranties] = useState<any[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [customerPaymentMethods, setCustomerPaymentMethods] = useState<any[]>([]);
  const [isPushEnabled, setIsPushEnabled] = useState(false); // New state for push notifications
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState('1'); // Placeholder for logged-in customer ID
  const [value, setValue] = useState(0); // For Tabs

  const { token } = useAuth();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !customerId) return;
      setLoading(true);
      try {
        const historyRes = await fetch(`/api/customer-portal/${customerId}/history`, { headers: { Authorization: `Bearer ${token}` } });
        const historyData = await historyRes.json();
        setCustomerHistory(historyData.history);

        const invoicesRes = await fetch(`/api/customer-portal/${customerId}/invoices`, { headers: { Authorization: `Bearer ${token}` } });
        const invoicesData = await invoicesRes.json();
        setCustomerInvoices(invoicesData.invoices);

        const warrantiesRes = await fetch(`/api/customer-portal/${customerId}/warranties`, { headers: { Authorization: `Bearer ${token}` } });
        const warrantiesData = await warrantiesRes.json();
        setCustomerWarranties(warrantiesData.warranties);

        const addressesRes = await fetch(`/api/customer-addresses/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
        const addressesData = await addressesRes.json();
        setCustomerAddresses(addressesData);

        const paymentMethodsRes = await fetch(`/api/customer-payment-methods/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
        const paymentMethodsData = await paymentMethodsRes.json();
        setCustomerPaymentMethods(paymentMethodsData);

      } catch (error) {
        console.error('Error fetching customer portal data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, customerId]);

  const handleUpdateProfile = async () => {
    if (!token || !customerId) return;
    try {
      // Simulate updating profile data
      await fetch(`/api/customer-portal/${customerId}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: 'João Silva Atualizado', email: 'joao.atualizado@example.com' }),
      });
      alert('Perfil atualizado com sucesso (simulado)!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil.');
    }
  };

  const handleAddAddress = async () => {
    alert('Adicionar Endereço (Simulado)');
  };

  const handleEditAddress = async (id: number) => {
    alert(`Editar Endereço ${id} (Simulado)`);
  };

  const handleDeleteAddress = async (id: number) => {
    alert(`Deletar Endereço ${id} (Simulado)`);
  };

  const handleAddPaymentMethod = async () => {
    alert('Adicionar Método de Pagamento (Simulado)');
  };

  const handleEditPaymentMethod = async (id: number) => {
    alert(`Editar Método de Pagamento ${id} (Simulado)`);
  };

  const handleDeletePaymentMethod = async (id: number) => {
    alert(`Deletar Método de Pagamento ${id} (Simulado)`);
  };

  const handleEnablePushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Seu navegador não suporta notificações push.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY', // Replace with your actual VAPID key
      });

      // Send subscription to your backend
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: customerId, subscription }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPushEnabled(true);
        alert('Notificações push habilitadas com sucesso!');
      } else {
        alert('Erro ao salvar inscrição de notificação.');
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      alert('Erro ao habilitar notificações push.');
    }
  };

  const handleSendTestNotification = async () => {
    if (!token || !customerId) return;
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: customerId, title: 'Notificação de Teste', message: 'Esta é uma notificação de teste do seu portal!' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Notificação de teste enviada (verifique se o navegador permitiu).');
      } else {
        alert('Erro ao enviar notificação de teste.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Erro ao enviar notificação de teste.');
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/download-link`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.downloadLink) {
        window.open(data.downloadLink, '_blank');
        alert(`Download da 2ª via da fatura #${invoiceId} iniciado (simulado)!`);
      } else {
        alert('Erro ao obter link de download da fatura.');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Erro ao baixar fatura.');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Meu Portal</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Bem-vindo(a), Cliente!</Typography>
        <TextField
          fullWidth
          label="ID do Cliente (Simulado)"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="body1">Aqui você pode gerenciar suas informações, ver seu histórico de compras e reparos, e acessar suas faturas e garantias.</Typography>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Customer Portal Tabs">
          <Tab label="Histórico" {...a11yProps(0)} />
          <Tab label="Meus Dados" {...a11yProps(1)} />
          <Tab label="Faturas" {...a11yProps(2)} />
          <Tab label="Garantias" {...a11yProps(3)} />
          <Tab label="Meus Endereços" {...a11yProps(4)} />
          <Tab label="Meus Pagamentos" {...a11yProps(5)} />
          <Tab label="Notificações" {...a11yProps(6)} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Typography variant="h6">Histórico de Compras e Reparos</Typography>
        <List>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Compras:</Typography>
          {customerHistory && customerHistory.purchases && customerHistory.purchases.length > 0 ? (
            customerHistory.purchases.map((item: any, index: number) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`Compra #${item.id} - ${moment(item.date).format('DD/MM/YYYY')} - Total: R$ ${item.total.toFixed(2)}`}
                  secondary={`Itens: ${item.items.join(', ')}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="Nenhum histórico de compras." /></ListItem>
          )}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Reparos:</Typography>
          {customerHistory && customerHistory.repairs && customerHistory.repairs.length > 0 ? (
            customerHistory.repairs.map((item: any, index: number) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`Reparo #${item.id} - ${item.device} - ${moment(item.date).format('DD/MM/YYYY')}`}
                  secondary={`Problema: ${item.issue} - Status: ${item.status}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="Nenhum histórico de reparos." /></ListItem>
          )}
        </List>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Typography variant="h6">Meus Dados Pessoais</Typography>
        <TextField fullWidth label="Nome" value="João Silva" sx={{ mb: 2 }} InputProps={{ readOnly: true }} />
        <TextField fullWidth label="Email" value="joao.silva@example.com" sx={{ mb: 2 }} InputProps={{ readOnly: true }} />
        <Button variant="contained" onClick={handleUpdateProfile}>Atualizar Perfil (Simulado)</Button>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Typography variant="h6">Minhas Faturas</Typography>
        <List>
          {customerInvoices.length > 0 ? (
            customerInvoices.map((invoice: any, index: number) => (
              <ListItem key={index} secondaryAction={
                <Button variant="outlined" size="small" onClick={() => handleDownloadInvoice(invoice.id)}>Download 2ª Via</Button>
              }>
                <ListItemText primary={`Fatura #${invoice.id} - ${moment(invoice.date).format('DD/MM/YYYY')} - R$ ${invoice.amount}`} />
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="Nenhuma fatura encontrada." /></ListItem>
          )}
        </List>
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Typography variant="h6">Minhas Garantias</Typography>
        <List>
          {customerWarranties.length > 0 ? (
            customerWarranties.map((warranty: any, index: number) => (
              <ListItem key={index}><ListItemText primary={`Produto: ${warranty.product} - Válida até: ${moment(warranty.endDate).format('DD/MM/YYYY')}`} /></ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="Nenhuma garantia encontrada." /></ListItem>
          )}
        </List>
      </TabPanel>

      <TabPanel value={value} index={4}>
        <Typography variant="h6">Meus Endereços</Typography>
        <Button variant="contained" onClick={handleAddAddress} sx={{ mb: 2 }}>Adicionar Endereço</Button>
        <List>
          {customerAddresses.length > 0 ? (
            customerAddresses.map((address: any) => (
              <ListItem key={address.id} secondaryAction={
                <Box>
                  <Button onClick={() => handleEditAddress(address.id)}>Editar</Button>
                  <Button onClick={() => handleDeleteAddress(address.id)} color="error">Excluir</Button>
                </Box>
              }>
                <ListItemText
                  primary={`${address.address_line1}, ${address.city} - ${address.state}, ${address.zip_code}`}
                  secondary={address.is_default ? 'Endereço Padrão' : ''}
                />
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="Nenhum endereço cadastrado." /></ListItem>
          )}
        </List>
      </TabPanel>

      <TabPanel value={value} index={5}>
        <Typography variant="h6">Meus Métodos de Pagamento</Typography>
        <Button variant="contained" onClick={handleAddPaymentMethod} sx={{ mb: 2 }}>Adicionar Cartão</Button>
        <List>
          {customerPaymentMethods.length > 0 ? (
            customerPaymentMethods.map((pm: any) => (
              <ListItem key={pm.id} secondaryAction={
                <Box>
                  <Button onClick={() => handleEditPaymentMethod(pm.id)}>Editar</Button>
                  <Button onClick={() => handleDeletePaymentMethod(pm.id)} color="error">Excluir</Button>
                </Box>
              }>
                <ListItemText
                  primary={`${pm.card_type} **** ${pm.last_four}`}
                  secondary={pm.is_default ? 'Método Padrão' : ''}
                />
              </ListItem>
            ))
          ) : (
            <ListItem><ListItemText primary="Nenhum método de pagamento cadastrado." /></ListItem>
          )}
        </List>
      </TabPanel>

      <TabPanel value={value} index={6}>
        <Typography variant="h6">Notificações Push</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>Receba atualizações sobre seus pedidos, reparos e promoções diretamente no seu navegador.</Typography>
        <Button variant="contained" onClick={handleEnablePushNotifications} disabled={isPushEnabled} sx={{ mr: 2 }}>
          {isPushEnabled ? 'Notificações Habilitadas' : 'Habilitar Notificações'}
        </Button>
        <Button variant="outlined" onClick={handleSendTestNotification} disabled={!isPushEnabled}>Enviar Notificação de Teste</Button>
      </TabPanel>
    </Box>
  );
};

export default CustomerPortalPage;
