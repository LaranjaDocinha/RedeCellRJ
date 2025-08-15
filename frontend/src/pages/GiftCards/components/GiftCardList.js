import React from 'react';
import PropTypes from 'prop-types';
import { Table, Spinner, Alert } from 'reactstrap';

// Local definition of formatCurrency (assuming it's not globally available yet)
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const GiftCardList = ({ giftCards, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="text-center my-4">
        <Spinner className="me-2" /> Carregando vales-presente...
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="danger" className="my-4">
        Erro ao carregar vales-presente: {error.message || 'Erro desconhecido.'}
      </Alert>
    );
  }

  if (!giftCards || giftCards.length === 0) {
    return (
      <Alert color="info" className="my-4 text-center">
        Nenhum vale-presente encontrado.
      </Alert>
    );
  }

  return (
    <div className="table-responsive">
      <Table className="table-hover table-striped mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Valor Inicial</th>
            <th>Saldo Atual</th>
            <th>Cliente</th>
            <th>Data de Expiração</th>
            <th>Status</th>
            {/* <th>Ações</th> */}
          </tr>
        </thead>
        <tbody>
          {giftCards.map((card) => (
            <tr key={card.id}>
              <td>{card.id}</td>
              <td>{card.code}</td>
              <td>{formatCurrency(card.initial_value)}</td>
              <td>{formatCurrency(card.current_balance)}</td>
              <td>{card.customer_name || 'N/A'}</td>
              <td>{card.expiry_date ? new Date(card.expiry_date).toLocaleDateString('pt-BR') : 'N/A'}</td>
              <td>
                <span className={`badge bg-${card.status === 'active' ? 'success' : 'danger'}`}>
                  {card.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              {/* <td>
                <Button size="sm" color="info" className="me-2">Editar</Button>
                <Button size="sm" color="danger">Excluir</Button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

GiftCardList.propTypes = {
  giftCards: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
};

GiftCardList.defaultProps = {
  giftCards: [],
  isLoading: false,
  error: null,
};

export default GiftCardList;
