import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Card, CardBody, CardHeader, Button } from 'reactstrap';
import { format } from 'date-fns';

import { fetchReceivables, addReceivable } from '../../../store/finance/actions';
import TableContainer from '../../../components/Common/TableContainer';
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import CustomModal from '../../../components/Common/Custom/CustomModal';

import ReceivableForm from './components/ReceivableForm';

const ReceivablesList = () => {
  const dispatch = useDispatch();

  const { receivables, loading, error } = useSelector((state) => state.Finance);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    dispatch(fetchReceivables());
  }, [dispatch]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleAddClick = () => {
    setFormData({});
    toggleModal();
  };

  const handleFormChange = (updatedFormData) => {
    setFormData(updatedFormData);
  };

  const handleConfirmSave = () => {
    dispatch(addReceivable(formData));
    toggleModal();
  };

  const columns = useMemo(
    () => [
      { Header: 'ID', accessor: 'id', id: 'id' },
      { Header: 'Descrição', accessor: 'descricao', id: 'descricao' },
      { Header: 'Cliente ID', accessor: 'cliente_id', id: 'cliente_id' }, // Provisório, idealmente seria o nome do cliente
      {
        Header: 'Valor',
        accessor: 'valor',
        id: 'valor',
        Cell: (cellProps) => `R$ ${parseFloat(cellProps.value).toFixed(2)}`,
      },
      {
        Header: 'Vencimento',
        accessor: 'data_vencimento',
        id: 'data_vencimento',
        Cell: (cellProps) => format(new Date(cellProps.value), 'dd/MM/yyyy'),
      },
      {
        Header: 'Status',
        accessor: 'status',
        id: 'status',
        Cell: (cellProps) => {
          const status = cellProps.value;
          const badgeClass =
            status === 'recebido'
              ? 'badge-soft-success'
              : status === 'pendente'
                ? 'badge-soft-warning'
                : 'badge-soft-danger';
          return <span className={`badge ${badgeClass} font-size-12`}>{status}</span>;
        },
      },
    ],
    [],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Contas a Receber' title='Financeiro' />
          <Card>
            <CardHeader className='d-flex justify-content-between align-items-center'>
              <h4 className='card-title mb-0'>Listagem de Contas a Receber</h4>
              <Button color='primary' onClick={handleAddClick}>
                <i className='bx bx-plus me-1'></i> Nova Conta
              </Button>
            </CardHeader>
            <CardBody>
              <TableContainer
                className='custom-header-css'
                columns={columns}
                customPageSize={10}
                data={receivables || []}
                isGlobalFilter={true}
              />
            </CardBody>
          </Card>
        </Container>
      </div>

      <CustomModal
        isConfirmLoading={loading}
        isOpen={isModalOpen}
        title='Adicionar Nova Conta a Receber'
        toggle={toggleModal}
        onConfirm={handleConfirmSave}
      >
        <ReceivableForm onFormChange={handleFormChange} />
      </CustomModal>
    </React.Fragment>
  );
};

export default ReceivablesList;
