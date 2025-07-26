import React, { useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Form, FormGroup, Label, Input } from "reactstrap";

const PayableForm = ({ payable = {}, onFormChange }) => {
  const [formData, setFormData] = useState({
    descricao: payable.descricao || "",
    valor: payable.valor || "",
    data_vencimento: payable.data_vencimento || "",
    observacao: payable.observacao || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    onFormChange(updatedFormData); // Notifica o componente pai sobre a mudança
  };

  return (
    <Form>
      <Row>
        <Col md={12}>
          <FormGroup>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              type="text"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Ex: Aluguel da loja"
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              type="number"
              id="valor"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              placeholder="Ex: 1500.00"
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label htmlFor="data_vencimento">Data de Vencimento</Label>
            <Input
              type="date"
              id="data_vencimento"
              name="data_vencimento"
              value={formData.data_vencimento}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Label htmlFor="observacao">Observação</Label>
            <Input
              type="textarea"
              id="observacao"
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              rows="3"
            />
          </FormGroup>
        </Col>
      </Row>
    </Form>
  );
};

PayableForm.propTypes = {
  payable: PropTypes.object,
  onFormChange: PropTypes.func.isRequired,
};

export default PayableForm;
