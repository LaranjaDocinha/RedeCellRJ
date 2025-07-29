import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  InputGroup,
  Alert,
} from 'reactstrap';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import useApi from '../../hooks/useApi';
import { get, post } from '../../helpers/api_helper';

import SaleDetailsForReturn from './SaleDetailsForReturn';

const ReturnsPage = () => {
  const [saleId, setSaleId] = useState('');
  const [saleDetails, setSaleDetails] = useState(null);
  const [error, setError] = useState('');

  const { loading: searching, request: findSale } = useApi(get);
  const { loading: processing, request: processReturn } = useApi(post);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSaleDetails(null);
    if (!saleId) {
      setError('Por favor, insira o ID da venda.');
      return;
    }
    try {
      const data = await findSale(`/sales/detail/${saleId}`);
      setSaleDetails(data);
    } catch (err) {
      setError(`Venda não encontrada ou erro ao buscar: ${err.message}`);
      setSaleDetails(null);
    }
  };

  const handleProcessReturn = async (itemsToReturn) => {
    if (itemsToReturn.length === 0) {
      toast.error('Selecione pelo menos um item para devolver.');
      return;
    }

    const returnPayload = {
      originalSaleId: saleDetails.id,
      customerId: saleDetails.customer_id,
      items: itemsToReturn.map((item) => ({
        variationId: item.variation_id,
        quantity: item.quantity,
        unitPrice: item.unit_price, // O preço do item na devolução
      })),
      // Pagamentos podem ser tratados de forma diferente (crédito, etc.)
      // Por agora, vamos focar em reverter o estoque.
      payments: [],
      notes: `Devolução referente à venda #${saleDetails.id}`,
    };

    try {
      await processReturn('/sales', returnPayload);
      toast.success('Devolução processada com sucesso!');
      setSaleId('');
      setSaleDetails(null);
    } catch (err) {
      toast.error(`Erro ao processar devolução: ${err.message}`);
    }
  };

  return (
    <div className='page-content'>
      <Container fluid>
        <Row>
          <Col>
            <Card>
              <CardBody>
                <CardTitle className='h4 mb-4'>Processar Devolução</CardTitle>

                <Form onSubmit={handleSearch}>
                  <FormGroup>
                    <Label for='saleId'>ID da Venda Original</Label>
                    <InputGroup>
                      <Input
                        id='saleId'
                        placeholder='Digite o número da venda'
                        type='text'
                        value={saleId}
                        onChange={(e) => setSaleId(e.target.value)}
                      />
                      <Button color='primary' disabled={searching} type='submit'>
                        {searching ? <LoadingSpinner size='sm' /> : 'Buscar Venda'}
                      </Button>
                    </InputGroup>
                  </FormGroup>
                </Form>

                {error && (
                  <Alert className='mt-3' color='danger'>
                    {error}
                  </Alert>
                )}

                {saleDetails && (
                  <SaleDetailsForReturn
                    loading={processing}
                    sale={saleDetails}
                    onProcessReturn={handleProcessReturn}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReturnsPage;
