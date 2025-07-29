import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody, Table, Alert } from 'reactstrap';
import axios from 'axios';

import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import config from '../../../config';

const SalesDetailModal = ({ isOpen, toggle, modalData }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesDetails = useCallback(async () => {
    if (!modalData || !modalData.type) return;

    setLoading(true);
    setError(null);

    let url = '';
    let params = {};
    let title = 'Detalhes';

    if (modalData.type === 'paymentMethod') {
      url = `${config.api.API_URL}/sales/by-payment-method`;
      params = {
        paymentMethod: modalData.filterValue,
        startDate: modalData.period.startDate,
        endDate: modalData.period.endDate,
      };
      title = `Vendas por ${modalData.filterValue}`;
    } else if (modalData.type === 'user') {
      url = `${config.api.API_URL}/sales/by-user`;
      params = {
        userId: modalData.filterValue,
        startDate: modalData.period.startDate,
        endDate: modalData.period.endDate,
      };
      title = `Vendas de ${modalData.userName}`;
    }

    try {
      const response = await axios.get(url, { params });
      setSales(response.data);
    } catch (err) {
      setError('Falha ao carregar os detalhes das vendas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [modalData]);

  useEffect(() => {
    if (isOpen) {
      fetchSalesDetails();
    }
  }, [isOpen, fetchSalesDetails]);

  const getTitle = () => {
    if (!modalData) return 'Detalhes';
    const dateRange = `(${new Date(modalData.period.startDate).toLocaleDateString()} - ${new Date(modalData.period.endDate).toLocaleDateString()})`;
    if (modalData.type === 'paymentMethod') {
      return `Vendas por ${modalData.filterValue} ${dateRange}`;
    }
    if (modalData.type === 'user') {
      return `Vendas de ${modalData.userName} ${dateRange}`;
    }
    return 'Detalhes';
  };

  return (
    <Modal centered isOpen={isOpen} size='lg' toggle={toggle}>
      <ModalHeader toggle={toggle}>{getTitle()}</ModalHeader>
      <ModalBody>
        {loading && (
          <div className='text-center'>
            <LoadingSpinner />
          </div>
        )}
        {error && <Alert color='danger'>{error}</Alert>}
        {!loading && !error && (
          <div className='table-responsive'>
            <Table hover striped>
              <thead>
                <tr>
                  <th>#Venda</th>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th className='text-end'>Valor</th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.id}</td>
                      <td>{new Date(sale.sale_date).toLocaleString()}</td>
                      <td>{sale.customer_name || 'N/A'}</td>
                      <td>{sale.user_name}</td>
                      <td className='text-end'>R$ {parseFloat(sale.total_amount).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className='text-center' colSpan='5'>
                      Nenhuma venda encontrada para este filtro no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default SalesDetailModal;
