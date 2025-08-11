import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import useStockTransferStore from '../store/stockTransferStore';
import useProductStore from '../store/productStore';
import useBranchStore from '../store/branchStore';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle, XCircle, Truck } from 'react-feather';
import { StockTransferFormModal } from 'pages/StockTransferPage/components'; // Import the real form

// Real confirmation modal (reused from ChecklistTemplatesPage)
const ConfirmationModal = ({ isOpen, toggle, onConfirm, title, children }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>{title}</ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
            <Button color="light" onClick={toggle}>Cancelar</Button>
            <Button color="danger" onClick={onConfirm}>Confirmar</Button>
        </ModalFooter>
    </Modal>
);

const StockTransferPage = () => {
  const {
    transfers,
    loading,
    error,
    fetchTransfers,
    completeTransfer,
    cancelTransfer
  } = useStockTransferStore();

  // Assuming these stores exist and have fetch methods
  const { products: allProducts, fetchProducts } = useProductStore();
  const { branches: allBranches, fetchBranches } = useBranchStore();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'complete' or 'cancel'
  const [selectedTransferId, setSelectedTransferId] = useState(null);

  useEffect(() => {
    fetchTransfers();
    fetchProducts(); // Fetch products for the form
    fetchBranches(); // Fetch branches for the form
  }, [fetchTransfers, fetchProducts, fetchBranches]);

  const toggleFormModal = () => setIsFormModalOpen(!isFormModalOpen);
  const toggleConfirmModal = () => setIsConfirmModalOpen(!isConfirmModalOpen);

  const handleCreate = () => {
    toggleFormModal();
  };

  const handleActionRequest = (id, type) => {
    setSelectedTransferId(id);
    setActionType(type);
    toggleConfirmModal();
  };

  const handleConfirmAction = async () => {
    if (selectedTransferId && actionType) {
      try {
        if (actionType === 'complete') {
          await completeTransfer(selectedTransferId);
        } else if (actionType === 'cancel') {
          await cancelTransfer(selectedTransferId);
        }
      } catch (e) {
        // Error handled by store, alert will show
      }
    }
    toggleConfirmModal();
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_transit': return 'info';
      case 'completed': return 'success';
      case 'canceled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_transit': return 'Em Trânsito';
      case 'completed': return 'Concluída';
      case 'canceled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle tag="h5" className="mb-0">Gerenciar Transferências de Estoque</CardTitle>
                <Button color="success" onClick={handleCreate}><Plus size={16} /> Nova Transferência</Button>
              </div>

              {error && <Alert color="danger">Erro: {error}</Alert>}

              {loading && !transfers.length ? (
                <div className="text-center p-5">
                  <Spinner />
                  <p className="mt-2">Carregando transferências...</p>
                </div>
              ) : transfers.length === 0 && !loading ? (
                <div className="text-center p-5">
                    <p>Nenhuma transferência de estoque encontrada.</p>
                    <Button color="primary" onClick={handleCreate}>Crie a primeira!</Button>
                </div>
              ) : (
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Produto</th>
                      <th>Qtd</th>
                      <th>Origem</th>
                      <th>Destino</th>
                      <th>Status</th>
                      <th>Data Solic.</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map(transfer => (
                      <tr key={transfer.id}>
                        <td><Link to={`/stock/transfers/${transfer.id}`}>{transfer.id}</Link></td>
                        <td>{transfer.product_name} ({transfer.barcode})</td>
                        <td>{transfer.quantity}</td>
                        <td>{transfer.from_branch_name}</td>
                        <td>{transfer.to_branch_name}</td>
                        <td><Badge color={getStatusBadgeColor(transfer.status)}>{getStatusText(transfer.status)}</Badge></td>
                        <td>{new Date(transfer.transfer_date).toLocaleDateString()}</td>
                        <td>
                          {transfer.status === 'in_transit' && (
                            <div className="d-flex gap-2">
                              <Button color="success" size="sm" onClick={() => handleActionRequest(transfer.id, 'complete')} title="Concluir Transferência"><CheckCircle size={16} /></Button>
                              <Button color="danger" size="sm" onClick={() => handleActionRequest(transfer.id, 'cancel')} title="Cancelar Transferência"><XCircle size={16} /></Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {isFormModalOpen && 
        <StockTransferFormModal 
            isOpen={isFormModalOpen} 
            toggle={toggleFormModal} 
            onSave={handleConfirmAction} // This will be createTransfer
            products={allProducts} // Pass products for selection
            branches={allBranches} // Pass branches for selection
        />
      }
      <ConfirmationModal 
        isOpen={isConfirmModalOpen} 
        toggle={toggleConfirmModal} 
        onConfirm={handleConfirmAction}
        title={actionType === 'complete' ? 'Concluir Transferência' : 'Cancelar Transferência'}
      >
        <p>Você tem certeza que deseja {actionType === 'complete' ? 'concluir' : 'cancelar'} esta transferência?</p>
        <p>Esta ação {actionType === 'complete' ? 'finalizará o movimento de estoque' : 'reverterá a reserva'}.</p>
      </ConfirmationModal>
    </Container>
  );
};

export default StockTransferPage;
