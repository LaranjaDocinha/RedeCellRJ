import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardBody, Button, Spinner, Alert, CardTitle, CardSubtitle } from 'reactstrap';
import { Edit, Trash2 } from 'react-feather'; // Added react-feather icons
import useApi from '../../../hooks/useApi';
import toast from 'react-hot-toast';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const BankAccountsList = ({ accounts, isLoading, error, onEdit, onDeleteSuccess }) => {
  const { request: deleteAccount } = useApi('delete');

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta? A ação não pode ser desfeita.')) {
      try {
        await deleteAccount(`/api/bank-accounts/${id}`);
        toast.success('Conta excluída com sucesso!');
        onDeleteSuccess();
      } catch (err) {
        toast.error(err.message || 'Falha ao excluir a conta.');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-5"><Spinner color="primary">Carregando...</Spinner></div>;
  }

  if (error) {
    return <Alert color="danger">Erro ao carregar contas: {error.message}</Alert>;
  }

  if (!accounts || accounts.length === 0) {
    return <Alert color="info">Nenhuma conta bancária cadastrada. Clique em "Adicionar Conta Bancária" para começar.</Alert>;
  }

  return (
    <Row>
      {accounts.map((account) => (
        <Col key={account.id} md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <CardBody>
              <CardTitle tag="h5">{account.name}</CardTitle>
              <CardSubtitle tag="h6" className="mb-2 text-muted">{account.bank_name}</CardSubtitle>
              <p className="mb-1"><strong>Conta:</strong> {account.account_number}</p>
              <h4 className="mt-3">{formatCurrency(account.current_balance)}</h4>
              <div className="mt-4">
                <Button color="light" outline size="sm" className="me-2" onClick={() => onEdit(account)}>
                  <Edit size={16} /> Editar
                </Button>
                <Button color="light" outline size="sm" onClick={() => handleDelete(account.id)}>
                  <Trash2 size={16} /> Excluir
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

BankAccountsList.propTypes = {
  accounts: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
};

export default BankAccountsList;
