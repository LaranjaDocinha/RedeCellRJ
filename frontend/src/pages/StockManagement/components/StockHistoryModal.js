import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Spinner, Alert, Badge } from 'reactstrap';
import toast from 'react-hot-toast';
import useApi from '../../../hooks/useApi';
import { get } from '../../../helpers/api_helper';

const StockHistoryModal = ({ isOpen, toggle, variation }) => {
  const [history, setHistory] = useState([]);
  const { request: fetchHistory, loading } = useApi(get);

  useEffect(() => {
    if (isOpen && variation) {
      fetchHistory(`/products/stock-history/${variation.id}`)
        .then(data => {
          setHistory(data);
        })
        .catch(err => {
          toast.error("Falha ao carregar o histórico de estoque.");
          console.error(err);
        });
    }
  }, [isOpen, variation, fetchHistory]);

  const getChangeTypeLabel = (type) => {
    switch (type) {
      case 'sale': return <Badge color="danger" pill>Venda</Badge>;
      case 'return': return <Badge color="warning" pill className="text-dark">Devolução</Badge>;
      case 'entry': return <Badge color="success" pill>Entrada</Badge>;
      case 'adjustment': return <Badge color="info" pill>Ajuste</Badge>;
      case 'initial': return <Badge color="secondary" pill>Inicial</Badge>;
      default: return <Badge color="light" pill className="text-dark">{type}</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        Histórico de Estoque: {variation?.product_name} ({variation?.color})
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <div className="text-center p-5"><Spinner /></div>
        ) : history.length === 0 ? (
          <Alert color="info">Nenhum histórico de movimentação encontrado para este item.</Alert>
        ) : (
          <div className="table-responsive">
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Motivo/Origem</th>
                  <th>Usuário</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                    <td>{getChangeTypeLabel(item.change_type)}</td>
                    <td className={`fw-bold ${item.quantity_change > 0 ? 'text-success' : 'text-danger'}`}>
                      {item.quantity_change > 0 ? `+${item.quantity_change}` : item.quantity_change}
                    </td>
                    <td>{item.reason}</td>
                    <td>{item.user_name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Fechar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default StockHistoryModal;