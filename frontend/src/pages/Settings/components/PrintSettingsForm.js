import React from 'react';
import { Card, CardBody, CardTitle, Form, FormGroup, Label, Input, Button } from 'reactstrap';

const PrintSettingsForm = () => {
  // Mock de estado para as configurações de impressão
  const [printSettings, setPrintSettings] = React.useState({
    defaultPrinter: 'Nenhuma',
    receiptTemplate: 'Padrão',
    printOnSale: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrintSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aqui você faria a chamada à API para salvar as configurações
    alert(
      'Configurações de Impressão Salvas! (Funcionalidade de salvamento real a ser implementada)',
    );
  };

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
            <Button color='primary' type='submit'>
              Salvar Configurações de Impressão
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default PrintSettingsForm;
