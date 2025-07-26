import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Card, CardBody, CardHeader, Button } from "reactstrap";
import { fetchPayables, addPayable } from "../../../store/finance/actions";
import TableContainer from "../../../components/Common/TableContainer";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import CustomModal from "../../../components/Common/Custom/CustomModal";
import PayableForm from "./components/PayableForm";
import { format } from 'date-fns';

const PayablesList = () => {
  const dispatch = useDispatch();

  const { payables, loading, error } = useSelector((state) => state.Finance);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    dispatch(fetchPayables());
  }, [dispatch]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleAddClick = () => {
    setFormData({}); // Limpa o formulário para uma nova entrada
    toggleModal();
  };

  const handleFormChange = (updatedFormData) => {
    setFormData(updatedFormData);
  };

  const handleConfirmSave = () => {
    dispatch(addPayable(formData));
    toggleModal();
  };

  const columns = useMemo(
    () => [
      { 
        Header: "ID", 
        accessor: "id",
        id: "id",
        Cell: cellProps => <span className="font-weight-bold">{cellProps.value}</span>
      },
      { Header: "Descrição", accessor: "descricao", id: "descricao" },
      { 
        Header: "Valor", 
        accessor: "valor",
        id: "valor",
        Cell: cellProps => `R$ ${parseFloat(cellProps.value).toFixed(2)}`
      },
      { 
        Header: "Vencimento", 
        accessor: "data_vencimento",
        id: "data_vencimento",
        Cell: cellProps => format(new Date(cellProps.value), 'dd/MM/yyyy')
      },
      { 
        Header: "Status", 
        accessor: "status",
        id: "status",
        Cell: cellProps => {
            const status = cellProps.value;
            const badgeClass = status === 'pago' ? 'badge-soft-success' : 
                               status === 'pendente' ? 'badge-soft-warning' : 'badge-soft-danger';
            return <span className={`badge ${badgeClass} font-size-12`}>{status}</span>
        }
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Financeiro" breadcrumbItem="Contas a Pagar" />
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">Listagem de Contas a Pagar</h4>
              <Button color="primary" onClick={handleAddClick}>
                <i className="bx bx-plus me-1"></i> Nova Conta
              </Button>
            </CardHeader>
            <CardBody>
              <TableContainer
                columns={columns}
                data={payables || []}
                isGlobalFilter={true}
                customPageSize={10}
                className="custom-header-css"
              />
            </CardBody>
          </Card>
        </Container>
      </div>

      <CustomModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        title="Adicionar Nova Conta a Pagar"
        onConfirm={handleConfirmSave}
        isConfirmLoading={loading}
      >
        <PayableForm onFormChange={handleFormChange} />
      </CustomModal>
    </React.Fragment>
  );
};

export default PayablesList;
