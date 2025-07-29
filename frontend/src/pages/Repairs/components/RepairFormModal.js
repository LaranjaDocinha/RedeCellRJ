import React from 'react';
import moment from 'moment';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Button,
} from 'reactstrap';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';

import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import { validateRepairForm } from '../utils/repairFormValidation';

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
    setFormData((prevData) => {
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
    <Modal isOpen={modal} size='lg' toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {selectedRepair ? 'Editar Reparo' : 'Adicionar Novo Reparo'}
      </ModalHeader>
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
          <TabContent activeTab={activeTab} className='py-3'>
            <TabPane tabId='1'>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for='customer_id'>
                      Cliente <span className='text-danger'>*</span>
                    </Label>
                    <Select
                      className={formErrors.customer_id ? 'is-invalid' : ''}
                      classNamePrefix='select2-selection'
                      getOptionLabel={(option) => `${option.name} (${option.phone})`}
                      getOptionValue={(option) => option.id}
                      id='customer_id'
                      name='customer_id'
                      options={customers}
                      placeholder='Selecione um Cliente'
                      value={customers.find((c) => c.id === parseInt(formData.customer_id))}
                      onChange={(selectedOption) => {
                        setFormData((prevData) => {
                          const newData = {
                            ...prevData,
                            customer_id: selectedOption ? selectedOption.id : '',
                          };
                          setFormErrors(validateRepairForm(newData));
                          return newData;
                        });
                      }}
                    />
                    <FormFeedback>{formErrors.customer_id}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for='device_type'>
                      Tipo de Dispositivo <span className='text-danger'>*</span>
                    </Label>
                    <Input
                      required
                      id='device_type'
                      invalid={!!formErrors.device_type}
                      name='device_type'
                      type='select'
                      value={formData.device_type}
                      onChange={handleInputChange}
                    >
                      <option value=''>Selecione</option>
                      <option value='smartphone'>Smartphone</option>
                      <option value='tablet'>Tablet</option>
                      <option value='notebook'>Notebook</option>
                      <option value='other'>Outro</option>
                    </Input>
                    <FormFeedback>{formErrors.device_type}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for='brand'>Marca</Label>
                    <Input
                      id='brand'
                      name='brand'
                      placeholder='Marca do Dispositivo'
                      type='text'
                      value={formData.brand}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for='model'>Modelo</Label>
                    <Input
                      id='model'
                      name='model'
                      placeholder='Modelo do Dispositivo'
                      type='text'
                      value={formData.model}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for='device_color'>Cor</Label>
                    <Input
                      id='device_color'
                      name='device_color'
                      placeholder='Cor do aparelho'
                      type='text'
                      value={formData.device_color}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for='imei_serial'>IMEI/Número de Série</Label>
                    <Input
                      id='imei_serial'
                      name='imei_serial'
                      placeholder='IMEI ou Número de Série'
                      type='text'
                      value={formData.imei_serial}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for='visual_condition'>Condição Visual</Label>
                <Input
                  id='visual_condition'
                  name='visual_condition'
                  placeholder='Ex: Tela trincada, arranhões na traseira'
                  type='textarea'
                  value={formData.visual_condition}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </TabPane>
            <TabPane tabId='2'>
              <FormGroup>
                <Label for='problem_description'>
                  Descrição do Problema <span className='text-danger'>*</span>
                </Label>
                <Input
                  required
                  id='problem_description'
                  invalid={!!formErrors.problem_description}
                  name='problem_description'
                  placeholder='Descreva o problema do dispositivo'
                  type='textarea'
                  value={formData.problem_description}
                  onChange={handleInputChange}
                />
                <FormFeedback>{formErrors.problem_description}</FormFeedback>
              </FormGroup>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for='initial_quote'>Orçamento Inicial</Label>
                    <NumericFormat
                      className='form-control'
                      decimalScale={2}
                      decimalSeparator=','
                      fixedDecimalScale={true}
                      id='initial_quote'
                      name='initial_quote'
                      placeholder='Valor do orçamento inicial'
                      prefix='R$ '
                      thousandSeparator='.'
                      value={formData.initial_quote}
                      onValueChange={(values) => {
                        setFormData({ ...formData, initial_quote: values.floatValue });
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for='promised_date'>Data Prometida</Label>
                    <Input
                      id='promised_date'
                      name='promised_date'
                      type='date'
                      value={
                        formData.promised_date
                          ? moment(formData.promised_date).format('YYYY-MM-DD')
                          : ''
                      }
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for='service_cost'>
                      Custo do Serviço (Final) <span className='text-danger'>*</span>
                    </Label>
                    <NumericFormat
                      required
                      className={`form-control ${formErrors.service_cost ? 'is-invalid' : ''}`}
                      decimalScale={2}
                      decimalSeparator=','
                      fixedDecimalScale={true}
                      id='service_cost'
                      name='service_cost'
                      placeholder='Custo do Serviço'
                      prefix='R$ '
                      thousandSeparator='.'
                      value={formData.service_cost}
                      onValueChange={(values) => {
                        setFormData({ ...formData, service_cost: values.floatValue });
                      }}
                    />
                    <FormFeedback>{formErrors.service_cost}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for='parts_cost'>
                      Custo das Peças (Final) <span className='text-danger'>*</span>
                    </Label>
                    <NumericFormat
                      required
                      className={`form-control ${formErrors.parts_cost ? 'is-invalid' : ''}`}
                      decimalScale={2}
                      decimalSeparator=','
                      fixedDecimalScale={true}
                      id='parts_cost'
                      name='parts_cost'
                      placeholder='Custo das Peças'
                      prefix='R$ '
                      thousandSeparator='.'
                      value={formData.parts_cost}
                      onValueChange={(values) => {
                        setFormData({ ...formData, parts_cost: values.floatValue });
                      }}
                    />
                    <FormFeedback>{formErrors.parts_cost}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId='3'>
              <FormGroup tag='fieldset'>
                <Label>
                  Status <span className='text-danger'>*</span>
                </Label>
                <div className='d-flex flex-wrap'>
                  {Object.entries(statusTranslations).map(([key, value]) => (
                    <FormGroup key={key} check className='me-3'>
                      <Input
                        checked={formData.status === key}
                        disabled={submitting}
                        id={`status-${key}`}
                        invalid={!!formErrors.status}
                        name='status'
                        type='radio'
                        value={key}
                        onChange={handleInputChange}
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
                <Label for='warranty_period'>Garantia do Serviço</Label>
                <Input
                  id='warranty_period'
                  name='warranty_period'
                  placeholder='Ex: 90 dias, 1 ano'
                  type='text'
                  value={formData.warranty_period}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for='notes'>Notas Internas</Label>
                <Input
                  id='notes'
                  name='notes'
                  placeholder='Adicione notas internas sobre o reparo (não visível para o cliente)'
                  type='textarea'
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </TabPane>
          </TabContent>
        </ModalBody>
        <ModalFooter>
          <Button color='primary' disabled={submitting} type='submit'>
            {submitting ? (
              <>
                <LoadingSpinner size='sm'> </LoadingSpinner> Salvando...
              </>
            ) : selectedRepair ? (
              'Salvar Alterações'
            ) : (
              'Adicionar'
            )}
          </Button>{' '}
          <Button color='secondary' disabled={submitting} onClick={toggle}>
            Cancelar
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default RepairFormModal;
