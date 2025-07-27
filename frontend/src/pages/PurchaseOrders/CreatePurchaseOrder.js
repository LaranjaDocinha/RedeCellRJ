import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, CardBody, CardTitle,
  Form, FormGroup, Label, Input, Button,
  Table, FormFeedback, Spinner
} from 'reactstrap';
import Select from 'react-select';
import useApi from '../../hooks/useApi';
import { get, post } from '../../helpers/api_helper';
import toast from 'react-hot-toast';

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();

  // API Hooks
  const { data: suppliersData, loading: loadingSuppliers, request: fetchSuppliers } = useApi(get);
  const { data: productsData, loading: loadingProducts, request: fetchProducts } = useApi(get);
  const { request: createOrder, loading: creatingOrder } = useApi(post);

  // Form State
  const [supplier, setSupplier] = useState(null);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const suppliers = suppliersData?.suppliers || [];
  const products = productsData?.products || [];

  useEffect(() => {
    fetchSuppliers('/suppliers');
    fetchProducts('/products?includeVariations=true');
  }, [fetchSuppliers, fetchProducts]);

  const handleAddItem = (product) => {
    if (items.find(i => i.variation_id === product.value)) return; // Evita duplicados
    setItems([...items, {
      variationId: product.value,
      productName: product.label,
      quantity: 1,
      costPrice: product.costPrice || 0,
    }]);
    setProductSearch(''); // Limpa a busca
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const validateForm = () => {
    const errors = {};
    if (!supplier) errors.supplier = 'Fornecedor é obrigatório.';
    if (items.length === 0) errors.items = 'Adicione pelo menos um item.';
    items.forEach((item, index) => {
      if (item.quantity <= 0) errors[`item_quantity_${index}`] = 'Qtde > 0';
      if (item.costPrice <= 0) errors[`item_cost_${index}`] = 'Custo > 0';
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }

    const orderData = {
      supplierId: supplier.value,
      expectedDeliveryDate: expectedDate || null,
      notes,
      items: items.map(({ variationId, quantity, costPrice }) => ({
        variationId,
        quantity: Number(quantity),
        costPrice: Number(costPrice),
      })),
    };

    try {
      await createOrder('/purchase-orders', orderData);
      toast.success('Ordem de compra criada com sucesso!');
      navigate('/purchase-orders');
    } catch (error) {
      toast.error(`Erro ao criar ordem: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const productOptions = products.flatMap(p => 
    p.variations.map(v => ({
      value: v.id,
      label: `${p.name} (${v.color || 'Padrão'})`,
      costPrice: v.cost_price
    }))
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Card>
          <CardBody>
            <CardTitle className="h4 mb-4">Criar Nova Ordem de Compra</CardTitle>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Fornecedor</Label>
                    <Select
                      options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                      onChange={setSupplier}
                      value={supplier}
                      placeholder="Selecione um fornecedor..."
                      isLoading={loadingSuppliers}
                      isInvalid={!!formErrors.supplier}
                    />
                    {formErrors.supplier && <div className="invalid-feedback d-block">{formErrors.supplier}</div>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Data de Entrega Prevista</Label>
                    <Input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <Label>Observações</Label>
                    <Input type="textarea" value={notes} onChange={e => setNotes(e.target.value)} />
                  </FormGroup>
                </Col>
              </Row>

              <hr />
              <h5 className="font-size-16 mb-3">Itens do Pedido</h5>

              <FormGroup>
                <Label>Adicionar Produto</Label>
                <Select
                  options={productOptions}
                  onChange={handleAddItem}
                  placeholder="Digite para buscar um produto..."
                  isLoading={loadingProducts}
                  value={null} // Controlado externamente
                />
                 {formErrors.items && <div className="text-danger mt-2">{formErrors.items}</div>}
              </FormGroup>

              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th style={{width: '120px'}}>Quantidade</th>
                    <th style={{width: '150px'}}>Custo (R$)</th>
                    <th style={{width: '80px'}}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.variationId}>
                      <td>{item.productName}</td>
                      <td>
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                          invalid={!!formErrors[`item_quantity_${index}`]}
                        />
                      </td>
                      <td>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={item.costPrice} 
                          onChange={e => handleItemChange(index, 'costPrice', e.target.value)}
                          invalid={!!formErrors[`item_cost_${index}`]}
                        />
                      </td>
                      <td>
                        <Button color="danger" size="sm" onClick={() => handleRemoveItem(index)}>Remover</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-end mt-4">
                <Button color="secondary" className="me-2" onClick={() => navigate('/purchase-orders')}>
                  Cancelar
                </Button>
                <Button color="primary" type="submit" disabled={creatingOrder}>
                  {creatingOrder ? <Spinner size="sm" /> : 'Salvar Ordem de Compra'}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default CreatePurchaseOrder;
