import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from 'reactstrap';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import useApi from '../../hooks/useApi';
import { get, post } from '../../helpers/api_helper';
import { useAuthStore } from '../../store/authStore';

import BlindCloseoutModal from './components/BlindCloseoutModal'; // Importa o novo modal

// Formulário para abrir o caixa (permanece o mesmo)
const OpenCashierForm = ({ onCashierOpened, loading }) => {
  const [openingBalance, setOpeningBalance] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!openingBalance || isNaN(parseFloat(openingBalance))) {
      toast.error('Por favor, insira um saldo de abertura válido.');
      return;
    }
    onCashierOpened({ openingBalance: parseFloat(openingBalance) });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <CardTitle className='h4 mb-4'>Abrir Caixa</CardTitle>
      <FormGroup>
        <Label for='openingBalance'>Saldo Inicial (Fundo de Troco)</Label>
        <Input
          required
          id='openingBalance'
          placeholder='Ex: 150.00'
          step='0.01'
          type='number'
          value={openingBalance}
          onChange={(e) => setOpeningBalance(e.target.value)}
        />
      </FormGroup>
      <Button color='primary' disabled={loading} type='submit'>
        {loading ? <LoadingSpinner size='sm' /> : 'Abrir Caixa'}
      </Button>
    </Form>
  );
};

// Componente para exibir o status do caixa aberto
const CashierOpenStatus = ({ session, onStartCloseout }) => {
  return (
    <div>
      <CardTitle className='h4 mb-4'>Caixa Aberto</CardTitle>
      <Alert className='text-center' color='success' fade={false}>
        <i className='bx bx-check-circle font-size-24 align-middle me-2'></i>O caixa está aberto.
      </Alert>
      <div className='text-center'>
        <p className='mb-2'>
          Aberto por: <strong>{useAuthStore.getState().user?.name}</strong>
        </p>
        <p className='mb-2'>
          Saldo Inicial: <strong>R$ {Number(session.opening_balance).toFixed(2)}</strong>
        </p>
        <p className='text-muted'>
          Aberto em: {new Date(session.opened_at).toLocaleString('pt-BR')}
        </p>
        <Button className='mt-3' color='danger' size='lg' onClick={onStartCloseout}>
          <i className='bx bx-lock-alt me-2'></i>
          Iniciar Fechamento de Caixa
        </Button>
      </div>
    </div>
  );
};

const CashierPage = () => {
  const { user } = useAuthStore();
  const { data: statusData, loading: loadingStatus, request: fetchStatus, setData: setStatusData } = useApi(get);
  const { loading: opening, request: openCashier } = useApi(post);

  const [isCloseoutModalOpen, setCloseoutModalOpen] = useState(false);

  const toggleCloseoutModal = () => setCloseoutModalOpen(!isCloseoutModalOpen);

  const refreshStatus = useCallback(() => {
    if (user?.id) {
      fetchStatus(`/api/cashier/status?userId=${user.id}`);
    }
  }, [fetchStatus, user?.id]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleOpenCashier = async (payload) => {
    try {
      const apiPayload = {
        openingBalance: payload.openingBalance,
        userId: user.id,
      };
      const response = await openCashier('/api/cashier/open', apiPayload);
      toast.success('Caixa aberto com sucesso!');
      // Atualiza o statusData diretamente com a nova sessão
      setStatusData({ isOpen: true, ...response.session });
    } catch (err) {
      // O helper já mostra o toast de erro
    }
  };

  return (
    <>
      <div className='page-content'>
        <Container fluid>
          <Row>
            <Col lg={{ size: 6, offset: 3 }} md={{ size: 8, offset: 2 }}>
              <Card>
                <CardBody>
                  {loadingStatus ? (
                    <div className='text-center'>
                      <LoadingSpinner />
                    </div>
                  ) : statusData?.isOpen && statusData.session ? (
                    <CashierOpenStatus
                      session={statusData.session}
                      onStartCloseout={toggleCloseoutModal}
                    />
                  ) : (
                    <OpenCashierForm loading={opening} onCashierOpened={handleOpenCashier} />
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {statusData?.session && (
        <BlindCloseoutModal
          isOpen={isCloseoutModalOpen}
          session={statusData.session}
          toggle={toggleCloseoutModal}
          onFinish={refreshStatus}
        />
      )}
    </>
  );
};

export default CashierPage;