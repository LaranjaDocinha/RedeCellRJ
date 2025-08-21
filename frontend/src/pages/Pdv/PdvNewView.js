import React, { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Container, Button } from 'reactstrap';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import { get } from '../../helpers/api_helper';

import PdvUnifiedView from './components/layout/PdvUnifiedView';

import PaymentModal from './components/PaymentModal';
import SuccessModal from './components/SuccessModal';

const PdvNewView = () => {
  document.title = 'PDV | RedeCellRJ PDV';

  const { user } = useAuthStore();

  
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [saleSuccessModalData, setSaleSuccessModalData] = useState(null);

  

  const togglePaymentModal = () => setPaymentModalOpen(!isPaymentModalOpen);

  

  const renderContent = () => {
    return (
      <>
        <PdvUnifiedView
          isPaymentModalOpen={isPaymentModalOpen}
          isSuccessModalOpen={isSuccessModalOpen}
          saleSuccessModalData={saleSuccessModalData}
          setPaymentModalOpen={setPaymentModalOpen}
          setSaleSuccessModalData={setSaleSuccessModalData}
          setSuccessModalOpen={setSuccessModalOpen}
          togglePaymentModal={togglePaymentModal}
        />
      </>
    );
  };

  return (
    <React.Fragment>
      <Toaster position='top-right' reverseOrder={false} />
      <div className='page-content' style={{ padding: '15px' }}>
        <Container fluid>{renderContent()}</Container>
      </div>

      {/* PaymentModal e SuccessModal serão passados como props para PdvUnifiedView */}
    </React.Fragment>
  );
};

export default PdvNewView;
