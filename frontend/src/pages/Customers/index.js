import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Alert,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  ModalBody,
} from 'reactstrap';

import StandardModal from '../../components/Common/StandardModal';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import AdvancedTable from '../../components/Common/AdvancedTable';

const CustomersPage = () => {
  const navigate = useNavigate();

  // Estados da Tabela
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  // Estados do Modal e Formulário
  const [modal, setModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [updatingCustomer, setUpdatingCustomer] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const toggle = useCallback(() => {
    setModal(!modal);
    if (modal) {
      // Se estiver fechando o modal, resetar formulário e cliente selecionado
      setSelectedCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
      });
      setFormErrors({});
    }
  }, [modal]);

  // Função para buscar dados da API com base no estado da tabela
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        sort: sorting[0]?.id,
        order: sorting[0]?.desc ? 'desc' : 'asc',
        filters: JSON.stringify(
          columnFilters.reduce((acc, filter) => {
            acc[filter.id] = filter.value;
            return acc;
          }, {}),
        ),
      };
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setData(response.data.data);
      setPageCount(response.data.totalPages);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      // Lógica de toast para erro
    } finally {
      setLoading(false);
    }
  }, [pagination, sorting, columnFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmitCustomer = useCallback(
    async (e) => {
      e.preventDefault();
      // Validação básica
      const errors = {};
      if (!formData.name) errors.name = 'Nome é obrigatório.';
      if (!formData.email) errors.email = 'Email é obrigatório.';
      else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email))
        errors.email = 'Email inválido.';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (selectedCustomer) {
          setUpdatingCustomer(true);
          await axios.put(`/api/customers/${selectedCustomer.id}`, formData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Lógica de toast para sucesso
        } else {
          setAddingCustomer(true);
          await axios.post(`${process.env.REACT_APP_API_URL}/api/customers`, formData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Lógica de toast para sucesso
        }
        toggle();
        fetchData();
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        // Lógica de toast para erro
      } finally {
        setAddingCustomer(false);
        setUpdatingCustomer(false);
      }
    },
    [formData, selectedCustomer, toggle, fetchData],
  );

  // ... (lógica do modal, formulário, delete, etc. permanece a mesma)

  const columns = useMemo(
    () => [
      // ... (definição das colunas permanece a mesma, mas agora podem ter `enableSorting` e `enableFiltering`)
      { accessorKey: 'id', header: '#', enableSorting: true },
      { accessorKey: 'name', header: 'Nome', enableSorting: true, enableFiltering: true },
      { accessorKey: 'phone', header: 'Telefone', enableFiltering: true },
      { accessorKey: 'email', header: 'Email', enableFiltering: true },
      // ... (outras colunas)
    ],
    [],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Row>
            <Col lg='12'>
              <Card>
                <CardBody>
                  {/* O botão de adicionar novo cliente pode ser movido para o header da tabela */}
                  <AdvancedTable
                    columnFilters={columnFilters}
                    columns={columns}
                    data={data}
                    loading={loading}
                    pageCount={pageCount}
                    pagination={pagination}
                    sorting={sorting}
                    onPaginationChange={setPagination}
                    onSortingChange={setSorting}
                    onColumnFiltersChange={setColumnFilters}
                    // ... (outras props da AdvancedTable)
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <StandardModal
        footer={
          <>
            <Button color='primary' disabled={addingCustomer || updatingCustomer} type='submit'>
              {(addingCustomer || updatingCustomer) && <LoadingSpinner size='sm' />}{' '}
              {selectedCustomer ? 'Salvar Alterações' : 'Adicionar'}
            </Button>{' '}
            <Button color='secondary' onClick={toggle}>
              Cancelar
            </Button>
          </>
        }
        isOpen={modal}
        title={selectedCustomer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
        toggle={toggle}
      >
        <Form onSubmit={handleSubmitCustomer}>
          <ModalBody>
            <FormGroup>
              <Label for='name'>Nome</Label>
              <Input
                required
                id='name'
                invalid={!!formErrors.name}
                name='name'
                type='text'
                value={formData.name}
                onChange={handleInputChange}
              />
              <FormFeedback>{formErrors.name}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for='phone'>Telefone</Label>
              <Input
                id='phone'
                name='phone'
                type='text'
                value={formData.phone}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for='email'>Email</Label>
              <Input
                id='email'
                invalid={!!formErrors.email}
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
              />
              <FormFeedback>{formErrors.email}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for='address'>Endereço</Label>
              <Input
                id='address'
                name='address'
                type='textarea'
                value={formData.address}
                onChange={handleInputChange}
              />
            </FormGroup>
          </ModalBody>
        </Form>
      </StandardModal>
    </React.Fragment>
  );
};

export default CustomersPage;
