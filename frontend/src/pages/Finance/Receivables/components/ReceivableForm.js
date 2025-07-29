import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Form, FormGroup, Label, Input } from 'reactstrap';
import * as apiHelper from 'helpers/api_helper'; // Para buscar clientes

const ReceivableForm = ({ receivable = {}, onFormChange }) => {
  const [formData, setFormData] = useState({
    descricao: receivable.descricao || '',
    valor: receivable.valor || '',
    data_vencimento: receivable.data_vencimento || '',
    cliente_id: receivable.cliente_id || '',
    observacao: receivable.observacao || '',
  });
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Carrega a lista de clientes para o dropdown
    async function fetchCustomers() {
      try {
        const data = await apiHelper.get('/customers');
        setCustomers(data);
      } catch (error) {
        console.error('Não foi possível carregar os clientes.', error);
      }
    }
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    onFormChange(updatedFormData);
  };

  return (
    <Form>
      <Row>
        <Col md={12}>
          <FormGroup>
            <Label htmlFor='descricao'>Descrição</Label>
            <Input
              id='descricao'
              name='descricao'
              placeholder='Ex: Pagamento do Reparo #123'
              type='text'
              value={formData.descricao}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label htmlFor='valor'>Valor (R$)</Label>
            <Input
              id='valor'
              name='valor'
              placeholder='Ex: 350.00'
              type='number'
              value={formData.valor}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label htmlFor='data_vencimento'>Data de Vencimento</Label>
            <Input
              id='data_vencimento'
              name='data_vencimento'
              type='date'
              value={formData.data_vencimento}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <FormGroup>
            <Label htmlFor='cliente_id'>Cliente</Label>
            <Input
              id='cliente_id'
              name='cliente_id'
              type='select'
              value={formData.cliente_id}
              onChange={handleChange}
            >
              <option value=''>Selecione um cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Label htmlFor='observacao'>Observação</Label>
            <Input
              id='observacao'
              name='observacao'
              rows='3'
              type='textarea'
              value={formData.observacao}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
    </Form>
  );
};

ReceivableForm.propTypes = {
  receivable: PropTypes.object,
  onFormChange: PropTypes.func.isRequired,
};

export default ReceivableForm;
