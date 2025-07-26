import React from "react";
import moment from 'moment';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, Button, Spinner } from "reactstrap";
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';
import { validateRepairForm } from "../utils/repairFormValidation";

const RepairFormModal = ({
  modal,
  toggle,
  selectedRepair,
  formData,
  setFormData,
  customers,
  formErrors,
  setFormErrors,
  activeTab,
  setActiveTab,
  handleSubmitRepair,
  submitting,
}) => {

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      setFormErrors(validateRepairForm(newData)); // Validate specific field
      return newData;
    });
  };

  const statusTranslations = {
    pending: 'Pendente',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    delivered: 'Entregue',
    canceled: 'Cancelado',
  };

  return (
    <Modal isOpen={modal} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>{selectedRepair ? 'Editar Reparo' : 'Adicionar Novo Reparo'}</ModalHeader>
      <Form onSubmit={handleSubmitRepair}>
        <ModalBody>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={activeTab === '1' ? 'active' : ''}
                onClick={() => setActiveTab('1')}
              >
                Cliente e Dispositivo
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '2' ? 'active' : ''}
                onClick={() => setActiveTab('2')}
              >
                Problema e Custos
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '3' ? 'active' : ''}
                onClick={() => setActiveTab('3')}
              >
                Status e Notas
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab} className="py-3">
            <TabPane tabId="1">
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="customer_id">Cliente <span className="text-danger">*</span></Label>
                    <Select
                      name="customer_id"
                      id="customer_id"
                      value={customers.find(c => c.id === parseInt(formData.customer_id))}
                      onChange={(selectedOption) => {
                        setFormData(prevData => {
                          const newData = { ...prevData, customer_id: selectedOption ? selectedOption.id : '' };
                          setFormErrors(validateRepairForm(newData));
                          return newData;
                        });
                      }}
                      options={customers}
                      getOptionLabel={(option) => `${option.name} (${option.phone})`}
                      getOptionValue={(option) => option.id}
                      placeholder="Selecione um Cliente"
                      classNamePrefix="select2-selection"
                      className={formErrors.customer_id ? 'is-invalid' : ''}
                    />
                    <FormFeedback>{formErrors.customer_id}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="device_type">Tipo de Dispositivo <span className="text-danger">*</span></Label>
                    <Input
                      type="select"
                      name="device_type"
                      id="device_type"
                      value={formData.device_type}
                      onChange={handleInputChange}
                      invalid={!!formErrors.device_type}
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="smartphone">Smartphone</option>
                      <option value="tablet">Tablet</option>
                      <option value="notebook">Notebook</option>
                      <option value="other">Outro</option>
                    </Input>
                    <FormFeedback>{formErrors.device_type}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="brand">Marca</Label>
                    <Input
                      type="text"
                      name="brand"
                      id="brand"
                      placeholder="Marca do Dispositivo"
                      value={formData.brand}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="model">Modelo</Label>
                    <Input
                      type="text"
                      name="model"
                      id="model"
                      placeholder="Modelo do Dispositivo"
                      value={formData.model}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="device_color">Cor</Label>
                    <Input
                      type="text"
                      name="device_color"
                      id="device_color"
                      placeholder="Cor do aparelho"
                      value={formData.device_color}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="imei_serial">IMEI/Número de Série</Label>
                    <Input
                      type="text"
                      name="imei_serial"
                      id="imei_serial"
                      placeholder="IMEI ou Número de Série"
                      value={formData.imei_serial}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="visual_condition">Condição Visual</Label>
                <Input
                  type="textarea"
                  name="visual_condition"
                  id="visual_condition"
                  placeholder="Ex: Tela trincada, arranhões na traseira"
                  value={formData.visual_condition}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </TabPane>
            <TabPane tabId="2">
              <FormGroup>
                <Label for="problem_description">Descrição do Problema <span className="text-danger">*</span></Label>
                <Input
                  type="textarea"
                  name="problem_description"
                  id="problem_description"
                  placeholder="Descreva o problema do dispositivo"
                  value={formData.problem_description}
                  onChange={handleInputChange}
                  invalid={!!formErrors.problem_description}
                  required
                />
                <FormFeedback>{formErrors.problem_description}</FormFeedback>
              </FormGroup>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="initial_quote">Orçamento Inicial</Label>
                    <NumericFormat
                      name="initial_quote"
                      id="initial_quote"
                      placeholder="Valor do orçamento inicial"
                      value={formData.initial_quote}
                      onValueChange={(values) => {
                        setFormData({ ...formData, initial_quote: values.floatValue });
                      }}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      decimalScale={2}
                      fixedDecimalScale={true}
                      className="form-control"
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="promised_date">Data Prometida</Label>
                    <Input
                      type="date"
                      name="promised_date"
                      id="promised_date"
                      value={formData.promised_date ? moment(formData.promised_date).format('YYYY-MM-DD') : ''}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="service_cost">Custo do Serviço (Final) <span className="text-danger">*</span></Label>
                    <NumericFormat
                      name="service_cost"
                      id="service_cost"
                      placeholder="Custo do Serviço"
                      value={formData.service_cost}
                      onValueChange={(values) => {
                        setFormData({ ...formData, service_cost: values.floatValue });
                      }}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      decimalScale={2}
                      fixedDecimalScale={true}
                      className={`form-control ${formErrors.service_cost ? 'is-invalid' : ''}`}
                      required
                    />
                    <FormFeedback>{formErrors.service_cost}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="parts_cost">Custo das Peças (Final) <span className="text-danger">*</span></Label>
                    <NumericFormat
                      name="parts_cost"
                      id="parts_cost"
                      placeholder="Custo das Peças"
                      value={formData.parts_cost}
                      onValueChange={(values) => {
                        setFormData({ ...formData, parts_cost: values.floatValue });
                      }}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      decimalScale={2}
                      fixedDecimalScale={true}
                      className={`form-control ${formErrors.parts_cost ? 'is-invalid' : ''}`}
                      required
                    />
                    <FormFeedback>{formErrors.parts_cost}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="3">
              <FormGroup tag="fieldset">
                <Label>Status <span className="text-danger">*</span></Label>
                <div className="d-flex flex-wrap">
                  {Object.entries(statusTranslations).map(([key, value]) => (
                    <FormGroup check className="me-3" key={key}>
                      <Input
                        type="radio"
                        name="status"
                        id={`status-${key}`}
                        value={key}
                        checked={formData.status === key}
                        onChange={handleInputChange}
                        invalid={!!formErrors.status}
                        disabled={submitting}
                      />{' '}
                      <Label check for={`status-${key}`}>
                        {value}
                      </Label>
                    </FormGroup>
                  ))}
                </div>
                <FormFeedback>{formErrors.status}</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="warranty_period">Garantia do Serviço</Label>
                <Input
                  type="text"
                  name="warranty_period"
                  id="warranty_period"
                  placeholder="Ex: 90 dias, 1 ano"
                  value={formData.warranty_period}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="notes">Notas Internas</Label>
                <Input
                  type="textarea"
                  name="notes"
                  id="notes"
                  placeholder="Adicione notas internas sobre o reparo (não visível para o cliente)"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </TabPane>
          </TabContent>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit" disabled={submitting}>
            {submitting ? <><Spinner size="sm"> </Spinner> Salvando...</> : (selectedRepair ? 'Salvar Alterações' : 'Adicionar')}
          </Button>{' '}
          <Button color="secondary" onClick={toggle} disabled={submitting}>Cancelar</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default RepairFormModal;
