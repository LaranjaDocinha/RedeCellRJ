import React, { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Container, Button } from 'reactstrap';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import { get } from '../../helpers/api_helper';

import PdvUnifiedView from './components/layout/PdvUnifiedView';
import CashierModal from './components/CashierModal';
import PaymentModal from './components/PaymentModal';
import SuccessModal from './components/SuccessModal';

const PdvNewView = () => {
  document.title = 'PDV | RedeCellRJ PDV';

  const { user } = useAuthStore();

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [cashierModalOpen, setCashierModalOpen] = useState(false);
  const [cashierStatus, setCashierStatus] = useState({
    loading: true,
    isOpen: false,
    session: null,
  });
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [saleSuccessModalData, setSaleSuccessModalData] = useState(null);

  const fetchCashierStatus = useCallback(async (userId) => {
    setCashierStatus((prev) => ({ ...prev, loading: true }));
    try {
      const data = await get(`/api/cashier/status?userId=${userId}`);
      setCashierStatus({ loading: false, isOpen: data.isOpen, session: data.session });
    } catch (err) {
      console.error('Erro ao carregar status do caixa:', err);
      setCashierStatus({ loading: false, isOpen: false, session: null });
    } finally {
      setIsInitialLoad(false); // Finaliza o carregamento inicial
    }
  }, []);

  const toggleCashierModal = useCallback(() => {
    setCashierModalOpen((prevState) => !prevState);
  }, []);

  const onCashierUpdate = useCallback(() => {
    if (user?.id) {
      fetchCashierStatus(user.id);
    }
    setCashierModalOpen(false);
  }, [user?.id, fetchCashierStatus]);

  const togglePaymentModal = () => setPaymentModalOpen(!isPaymentModalOpen);

  useEffect(() => {
    if (user?.id) {
      fetchCashierStatus(user.id);
    }
  }, [user?.id, fetchCashierStatus]);

  const renderContent = () => {
    if (isInitialLoad) {
      return (
        <div className='text-center my-5'>
          <LoadingSpinner />
          <p className='mt-2'>Verificando status do caixa...</p>
        </div>
      );
    }

    if (!cashierStatus.isOpen) {
      return (
        <div className='text-center my-5'>
          <p className='font-size-18'>
            O caixa está fechado. Por favor, abra o caixa para iniciar as operações.
          </p>
          <Button color='primary' onClick={toggleCashierModal}>
            <i className='bx bx-wallet-alt me-1'></i> Abrir Caixa
          </Button>
        </div>
      );
    }

    return (
      <>
        <PdvUnifiedView
          cashierStatus={cashierStatus}
          isPaymentModalOpen={isPaymentModalOpen}
          isSuccessModalOpen={isSuccessModalOpen}
          saleSuccessModalData={saleSuccessModalData}
          setPaymentModalOpen={setPaymentModalOpen}
          setSaleSuccessModalData={setSaleSuccessModalData}
          setSuccessModalOpen={setSuccessModalOpen}
          togglePaymentModal={togglePaymentModal}
        />
        <div className='text-end mt-3'>
          <Button color='danger' outline size='sm' onClick={toggleCashierModal}>
            <i className='bx bx-power-off me-1'></i> Fechar Caixa
          </Button>
        </div>
      </>
    );
  };

  return (
    <React.Fragment>
      <Toaster position='top-right' reverseOrder={false} />
      <div className='page-content' style={{ padding: '15px' }}>
        <Container fluid>{renderContent()}</Container>
      </div>

      {/* Modais */}
      <CashierModal
        cashierStatus={cashierStatus}
        isOpen={cashierModalOpen}
        toggle={toggleCashierModal}
        onCashierUpdate={onCashierUpdate}
      />
      {/* PaymentModal e SuccessModal serão passados como props para PdvUnifiedView */}
    </React.Fragment>
  );
};

export default PdvNewView;
