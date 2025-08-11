import React, { useState, useCallback, useRef } from 'react';
import { Card, CardBody, CardTitle, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import useNotification from '../../../hooks/useNotification';
import useApi from '../../../hooks/useApi';
import { post } from '../../../helpers/api_helper'; // Assuming POST for saving settings
import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import { useReactToPrint } from 'react-to-print';

import StandardReceipt from './receipts/StandardReceipt';
import CompactReceipt from './receipts/CompactReceipt';
import DetailedReceipt from './receipts/DetailedReceipt';

// Mock Receipt Component for printing
const MockReceipt = React.forwardRef(({ settings }, ref) => {
  const ReceiptComponent = {
    'Padrão': StandardReceipt,
    'Compacto': CompactReceipt,
    'Detalhado': DetailedReceipt,
  }[settings.receiptTemplate] || StandardReceipt;

  return <ReceiptComponent ref={ref} settings={settings} />;
});

const PrintSettingsForm = ({ generalSettings }) => { // Receive general settings as prop
  const [printSettings, setPrintSettings] = useState({
    defaultPrinter: 'Nenhuma',
    receiptTemplate: 'Padrão',
    printOnSale: true,
  });

  const { showSuccess, showError, showInfo } = useNotification();
  const { loading: saving, request: savePrintSettings } = useApi(post);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrintSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mock de salvamento: em um cenário real, você enviaria printSettings para o backend
    try {
      // Simula uma chamada de API
      await savePrintSettings('/api/settings/print', printSettings); // Endpoint mock
      showSuccess('Configurações de Impressão salvas com sucesso!');
    } catch (err) {
      showError(`Erro ao salvar configurações de impressão: ${err.message}`);
    }
  };

  const handlePrintTestReceipt = useReactToPrint({
    content: () => componentRef.current,
  });

  const componentRef = useRef();

  return (
    <Card className='mt-4'>
      <CardBody>
        <CardTitle className='h4 mb-4'>Configurações de Impressão</CardTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for='defaultPrinter'>Impressora Padrão</Label>
            <Input
              id='defaultPrinter'
              name='defaultPrinter'
              type='select'
              value={printSettings.defaultPrinter}
              onChange={handleInputChange}
            >
              <option>Nenhuma</option>
              <option>Impressora Térmica 1</option>
              <option>Impressora A4</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for='receiptTemplate'>Modelo de Recibo</Label>
            <Input
              id='receiptTemplate'
              name='receiptTemplate'
              type='select'
              value={printSettings.receiptTemplate}
              onChange={handleInputChange}
            >
              <option>Padrão</option>
              <option>Compacto</option>
              <option>Detalhado</option>
            </Input>
          </FormGroup>

          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                checked={printSettings.printOnSale}
                name='printOnSale'
                type='checkbox'
                onChange={handleInputChange}
              />{' '}
              Imprimir recibo automaticamente após a venda
            </Label>
          </FormGroup>

          <div className='d-flex justify-content-end mt-3'>
            <Button color='primary' type='submit' disabled={saving} className="me-2">
              {saving ? <LoadingSpinner size='sm' /> : 'Salvar Configurações de Impressão'}
            </Button>
            <Button color='secondary' onClick={handlePrintTestReceipt}>
              Testar Impressão
            </Button>
          </div>
        </Form>
      </CardBody>
      <div style={{ display: 'none' }}>
        <MockReceipt ref={componentRef} settings={{ ...generalSettings, ...printSettings }} />
      </div>
    </Card>
  );
};

export default PrintSettingsForm;
