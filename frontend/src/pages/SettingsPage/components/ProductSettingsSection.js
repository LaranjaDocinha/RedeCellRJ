import React from 'react';
import { FormGroup, Label, Input, Alert, Row, Col } from 'reactstrap';

const ProductSettingsSection = ({ settings, handleInputChange }) => {
  return (
    <>
      <h4 className='h4 mb-4'>Configurações de Produtos</h4>

      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='default_min_stock_level'>Nível Mínimo de Estoque Padrão</Label>
            <Input
              id='default_min_stock_level'
              name='default_min_stock_level'
              type='number'
              placeholder='Ex: 5'
              value={settings.default_min_stock_level || ''}
              onChange={handleInputChange}
            />
            <Alert color='info' className='mt-2'>
              Este é o nível mínimo de estoque padrão para novos produtos.
            </Alert>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup check className='mb-3'>
            <Label check>
              <Input
                type='checkbox'
                name='enable_product_serialization_by_default'
                checked={settings.enable_product_serialization_by_default || false}
                onChange={(e) => handleInputChange({ target: { name: 'enable_product_serialization_by_default', value: e.target.checked, type: 'checkbox' } })}
              />{' '}
              Habilitar Serialização de Produtos por Padrão
            </Label>
            <Alert color='info' className='mt-2'>
              Se marcado, novos produtos serão serializados por padrão.
            </Alert>
          </FormGroup>
        </Col>
      </Row>

      <hr className='my-4' />

      <h5>Ferramentas de Produtos</h5>
      <p>
        Gerencie seus produtos importando ou exportando dados.
      </p>
      {/* Placeholder for actual import/export functionality links */}
      <Alert color='secondary'>
        Links para Importar/Exportar Produtos (a ser implementado)
      </Alert>
    </>
  );
};

export default ProductSettingsSection;
