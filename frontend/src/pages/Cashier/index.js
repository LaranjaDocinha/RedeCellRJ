import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, CardBody, CardTitle,
  Button, Form, FormGroup, Label, Input, Spinner, Alert
} from 'reactstrap';
import useApi from '../../hooks/useApi';
import { get, post } from '../../helpers/api_helper';
import toast from 'react-hot-toast';

const OpenCashierForm = ({ onCashierOpened, loading }) => {
  const [openingBalance, setOpeningBalance] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!openingBalance || isNaN(parseFloat(openingBalance))) {
      toast.error("Por favor, insira um saldo de abertura válido.");
      return;
    }
    onCashierOpened({ opening_balance: parseFloat(openingBalance) });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <CardTitle className="h4 mb-4">Abrir Caixa</CardTitle>
      <FormGroup>
        <Label for="openingBalance">Saldo Inicial (Fundo de Troco)</Label>
        <Input
          type="number"
          step="0.01"
          id="openingBalance"
          value={openingBalance}
          onChange={(e) => setOpeningBalance(e.target.value)}
          placeholder="Ex: 150.00"
          required
        />
      </FormGroup>
      <Button color="primary" type="submit" disabled={loading}>
        {loading ? <Spinner size="sm" /> : 'Abrir Caixa'}
      </Button>
    </Form>
  );
};

const CloseCashierForm = ({ session, onCashierClosed, loading }) => {
  const [closingBalance, setClosingBalance] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!closingBalance || isNaN(parseFloat(closingBalance))) {
      toast.error("Por favor, insira o valor total contado no caixa.");
      return;
    }
    onCashierClosed({ 
      closing_balance: parseFloat(closingBalance),
      notes 
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <CardTitle className="h4 mb-4">Fechar Caixa</CardTitle>
      <Alert color="info">
        O caixa foi aberto com <strong>R$ {parseFloat(session.opening_balance).toFixed(2)}</strong> em {new Date(session.opened_at).toLocaleString('pt-BR')}.
      </Alert>
      <FormGroup>
        <Label for="closingBalance">Valor Total em Caixa (Contado)</Label>
        <Input
          type="number"
          step="0.01"
          id="closingBalance"
          value={closingBalance}
          onChange={(e) => setClosingBalance(e.target.value)}
          placeholder="Digite o valor total contado na gaveta"
          required
        />
      </FormGroup>
      <FormGroup>
        <Label for="notes">Observações</Label>
        <Input
          type="textarea"
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Alguma observação sobre o fechamento?"
        />
      </FormGroup>
      <Button color="danger" type="submit" disabled={loading}>
        {loading ? <Spinner size="sm" /> : 'Fechar Caixa'}
      </Button>
    </Form>
  );
};

const CashierPage = () => {
  const { data: statusData, loading: loadingStatus, request: fetchStatus } = useApi(get);
  const { loading: opening, request: openCashier } = useApi(post);
  const { loading: closing, request: closeCashier } = useApi(post);

  const refreshStatus = useCallback(() => {
    fetchStatus('/cashier/status');
  }, [fetchStatus]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleOpenCashier = async (payload) => {
    try {
      await openCashier('/cashier/open', payload);
      toast.success('Caixa aberto com sucesso!');
      refreshStatus();
    } catch (err) {
      toast.error(`Erro ao abrir caixa: ${err.message}`);
    }
  };

  const handleCloseCashier = async (payload) => {
    try {
      const result = await closeCashier('/cashier/close', payload);
      toast.success('Caixa fechado com sucesso!');
      // Aqui você pode mostrar um resumo do fechamento se desejar
      console.log('Fechamento:', result);
      refreshStatus();
    } catch (err) {
      toast.error(`Erro ao fechar caixa: ${err.message}`);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col md={{ size: 8, offset: 2 }} lg={{ size: 6, offset: 3 }}>
            <Card>
              <CardBody>
                {loadingStatus ? (
                  <div className="text-center"><Spinner /></div>
                ) : statusData?.isOpen ? (
                  <CloseCashierForm 
                    session={statusData.session}
                    onCashierClosed={handleCloseCashier}
                    loading={closing}
                  />
                ) : (
                  <OpenCashierForm 
                    onCashierOpened={handleOpenCashier}
                    loading={opening}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CashierPage;
