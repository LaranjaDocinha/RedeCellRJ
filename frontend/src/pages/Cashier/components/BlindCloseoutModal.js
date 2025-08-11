import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Table,
  Alert,
} from 'reactstrap';
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import useApi from '../../../hooks/useApi';
import { get, post } from '../../../helpers/api_helper';

import './BlindCloseoutModal.scss';

const BlindCloseoutModal = ({ isOpen, toggle, session, onFinish }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Report
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [countedValues, setCountedValues] = useState({});
  const [notes, setNotes] = useState('');
  const [reportData, setReportData] = useState(null);

  const { request: fetchPaymentMethods, loading: loadingMethods } = useApi(get);
  const { request: closeSession, loading: closingSession } = useApi(post);

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchPaymentMethods('/api/payment-methods')
        .then((data) => {
          setPaymentMethods(data || []);
          // Inicializa os valores contados
          const initialValues = {};
          (data || []).forEach((pm) => {
            initialValues[pm.id] = '';
          });
          setCountedValues(initialValues);
        })
        .catch(() => toast.error('Falha ao carregar métodos de pagamento.'));
    }
  }, [isOpen, step, fetchPaymentMethods]);

  const handleValueChange = (id, value) => {
    setCountedValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const countedValuesPayload = Object.entries(countedValues).map(([id, value]) => ({
      paymentMethodId: parseInt(id, 10),
      countedAmount: parseFloat(value || 0),
    }));

    // Adicionar verificação aqui
    if (countedValuesPayload.length === 0) {
      toast.error('Por favor, insira pelo menos um valor contado para fechar o caixa.');
      return;
    }

    try {
      const result = await closeSession('/api/cashier/close', {
        userId: session.user_id,
        notes,
        countedValues: countedValuesPayload,
      });
      setReportData(result.report);
      setStep(2);
      toast.success('Caixa fechado com sucesso!');
    } catch (error) {
      // O helper da API já mostra o toast de erro
      console.error('Erro ao fechar o caixa:', error);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setReportData(null);
    setCountedValues({});
    setNotes('');
    toggle();
    onFinish(); // Recarrega o estado da página principal
  };

  const renderForm = () => (
    <Form onSubmit={handleSubmit}>
      <ModalBody>
        <p>
          Insira o valor total contado para cada método de pagamento. O sistema não mostrará os
          valores esperados até que você confirme.
        </p>
        {loadingMethods && <LoadingSpinner />}
        {paymentMethods.map((pm) => (
          <FormGroup key={pm.id}>
            <Label for={`pm-${pm.id}`}>{pm.name}</Label>
            <NumericFormat
              className='form-control'
              decimalScale={2}
              decimalSeparator=','
              id={`pm-${pm.id}`}
              placeholder='R$ 0,00'
              prefix='R$ '
              thousandSeparator='.'
              value={countedValues[pm.id] || ''}
              onValueChange={(values) => handleValueChange(pm.id, values.value)}
            />
          </FormGroup>
        ))}
        <FormGroup>
          <Label for='notes'>Notas (Opcional)</Label>
          <Input
            id='notes'
            placeholder='Ex: Diferença justificada por...'
            type='textarea'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={toggle}>
          Cancelar
        </Button>
        <Button color='primary' disabled={closingSession} type='submit'>
          {closingSession ? <LoadingSpinner size='sm' /> : 'Confirmar e Ver Relatório'}
        </Button>
      </ModalFooter>
    </Form>
  );

  const renderReport = () => (
    <>
      <ModalBody>
        <h4>Relatório de Fechamento</h4>
        <p>
          Abaixo está a comparação entre os valores contados e os valores registrados no sistema.
        </p>
        <Table bordered responsive className='text-center'>
          <thead>
            <tr>
              <th>Método de Pagamento</th>
              <th>Valor Contado</th>
              <th>Valor no Sistema</th>
              <th>Diferença</th>
            </tr>
          </thead>
          <tbody>
            {reportData.details.map((d) => (
              <tr
                key={d.paymentMethodId}
                className={
                  d.discrepancy !== 0 ? (d.discrepancy > 0 ? 'table-success' : 'table-danger') : ''
                }
              >
                <td>{d.paymentMethodName}</td>
                <td>
                  <NumericFormat
                    fixedDecimalScale
                    decimalScale={2}
                    decimalSeparator=','
                    displayType='text'
                    prefix='R$ '
                    thousandSeparator='.'
                    value={d.countedAmount}
                  />
                </td>
                <td>
                  <NumericFormat
                    fixedDecimalScale
                    decimalScale={2}
                    decimalSeparator=','
                    displayType='text'
                    prefix='R$ '
                    thousandSeparator='.'
                    value={d.systemAmount}
                  />
                </td>
                <td>
                  <NumericFormat
                    fixedDecimalScale
                    decimalScale={2}
                    decimalSeparator=','
                    displayType='text'
                    prefix='R$ '
                    thousandSeparator='.'
                    value={d.discrepancy}
                  />
                  {d.discrepancy > 0 && ' (Sobra)'}
                  {d.discrepancy < 0 && ' (Falta)'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className='table-light fw-bold'>
              <td className='text-end' colSpan='3'>
                Diferença Total:
              </td>
              <td>
                <NumericFormat
                  fixedDecimalScale
                  decimalScale={2}
                  decimalSeparator=','
                  displayType='text'
                  prefix='R$ '
                  thousandSeparator='.'
                  value={reportData.totalDiscrepancy}
                />
              </td>
            </tr>
          </tfoot>
        </Table>
        {reportData.totalDiscrepancy !== 0 && (
          <Alert color={reportData.totalDiscrepancy > 0 ? 'success' : 'danger'}>
            Houve uma {reportData.totalDiscrepancy > 0 ? 'sobra' : 'falta'} de{' '}
            <NumericFormat
              fixedDecimalScale
              decimalScale={2}
              decimalSeparator=','
              displayType='text'
              prefix='R$ '
              thousandSeparator='.'
              value={Math.abs(reportData.totalDiscrepancy)}
            />{' '}
            no caixa.
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color='primary' onClick={resetAndClose}>
          Finalizar
        </Button>
      </ModalFooter>
    </>
  );

  return (
    <Modal backdrop='static' isOpen={isOpen} size='lg' toggle={resetAndClose}>
      <ModalHeader toggle={resetAndClose}>
        {step === 1 ? 'Fechamento de Caixa (Cego)' : 'Relatório de Fechamento'}
      </ModalHeader>
      {step === 1 ? renderForm() : renderReport()}
    </Modal>
  );
};

export default BlindCloseoutModal;
