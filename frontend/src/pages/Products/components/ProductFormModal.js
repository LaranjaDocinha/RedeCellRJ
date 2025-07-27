import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input,
  Row, Col, Spinner, Card
} from 'reactstrap';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import toast from 'react-hot-toast';

import useApi from '../../../hooks/useApi';
import { get, post, put } from '../../../helpers/api_helper';

const ProductFormModal = ({ isOpen, toggle, product, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  
  const isEditing = product && product.id;

  const { request: saveProduct, loading: isSaving } = useApi(isEditing ? put : post);
  const { request: fetchCategories } = useApi(get);

  useEffect(() => {
    fetchCategories('/api/categories?limit=1000').then(data => {
      setCategories(data.categories || []);
    });
  }, [fetchCategories]);

  useEffect(() => {
    if (isOpen) {
      const initialVariations = [{ id: Date.now(), color: '', price: '', costPrice: '', stockQuantity: '', alertThreshold: 5, imageUrl: '', status: 'active' }];
      if (isEditing) {
        const isService = product.productType === 'service';
        setFormData({
          name: product.name || '',
          description: product.description || '',
          categoryId: product.categoryId || '',
          productType: product.productType || 'physical',
          price: isService && product.variations.length > 0 ? product.variations[0].price : '',
          costPrice: isService && product.variations.length > 0 ? product.variations[0].cost_price : '',
          variations: !isService && product.variations && product.variations.length > 0
            ? product.variations.map(v => ({ ...v }))
            : initialVariations
        });
      } else {
        setFormData({
          name: '',
          description: '',
          categoryId: '',
          productType: 'physical',
          price: '',
          costPrice: '',
          variations: initialVariations
        });
      }
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVariationChange = useCallback((variationId, e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      variations: prevData.variations.map(variation =>
        variation.id === variationId ? { ...variation, [name]: value } : variation
      )
    }));
  }, []);

  const handleAddVariation = useCallback(() => {
    setFormData(prevData => ({
      ...prevData,
      variations: [...prevData.variations, { id: Date.now(), color: '', price: '', costPrice: '', stockQuantity: '', alertThreshold: 5, imageUrl: '', status: 'active' }]
    }));
  }, []);

  const handleRemoveVariation = useCallback((idToRemove) => {
    setFormData(prevData => ({
      ...prevData,
      variations: prevData.variations.filter(variation => variation.id !== idToRemove)
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description,
      ['category_id']: formData.categoryId,
      ['product_type']: formData.productType,
    };

    if (formData.productType === 'service') {
      payload.price = parseFloat(formData.price) || 0;
      payload['cost_price'] = parseFloat(formData.costPrice) || 0;
      payload.variations = [];
    } else {
      payload.variations = formData.variations.map(v => ({
        id: v.id,
        color: v.color,
        price: parseFloat(v.price) || 0,
        ['cost_price']: parseFloat(v.costPrice) || 0,
        ['stock_quantity']: parseInt(v.stockQuantity, 10) || 0,
        ['alert_threshold']: parseInt(v.alertThreshold, 10) || 5,
        ['image_url']: v.imageUrl,
        status: v.status || 'active',
      }));
    }

    const url = isEditing ? `/api/products/${product.id}` : '/api/products';

    saveProduct(url, payload)
      .then(() => {
        toast.success(`Produto ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
        onSuccess();
      })
      .catch((error) => {
        const errorMessage = error?.message || error?.msg || 'Erro ao salvar produto.';
        toast.error(errorMessage);
      });
  };

  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
      <ModalHeader toggle={toggle}>{isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <Row>
            <Col md={8}>
              <FormGroup>
                <Label for="name">Nome do Produto</Label>
                <Input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required />
              </FormGroup>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="product_type">Tipo de Produto</Label>
                    <Input type="select" name="productType" id="product_type" value={formData.productType || 'physical'} onChange={handleChange}>
                      <option value="physical">Físico (com estoque)</option>
                      <option value="service">Serviço (sem estoque)</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="category_id">Categoria</Label>
                    <Select
                      id="category_id"
                      name="categoryId"
                      options={categoryOptions}
                      value={categoryOptions.find(c => c.value === formData.categoryId) || null}
                      onChange={(selectedOption) => handleChange({ target: { name: 'categoryId', value: selectedOption ? selectedOption.value : '' }})}
                      classNamePrefix="select2-selection"
                      placeholder="Selecione..."
                    />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="description">Descrição</Label>
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.description || ''}
                  config={{ toolbar: ['bold', 'italic', 'bulletedList', 'numberedList', 'link'] }}
                  onChange={(event, editor) => handleChange({ target: { name: 'description', value: editor.getData() } })}
                />
              </FormGroup>

              {formData.productType === 'physical' ? (
                <>
                  <h5 className="mt-4 mb-3">Variações do Produto</h5>
                  {formData.variations?.map((variation, index) => (
                    <Card key={variation.id} className="mb-3 p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Variação #{index + 1}</h6>
                        {formData.variations.length > 1 && (
                          <Button color="danger" size="sm" onClick={() => handleRemoveVariation(variation.id)}><i className="bx bx-trash-alt"></i></Button>
                        )}
                      </div>
                      <Row>
                        <Col md={6}><FormGroup><Label>Cor/Variação</Label><Input type="text" name="color" value={variation.color} onChange={(e) => handleVariationChange(variation.id, e)} required /></FormGroup></Col>
                        <Col md={6}><FormGroup><Label>Preço de Venda</Label><NumericFormat name="price" value={variation.price} onValueChange={(values) => handleVariationChange(variation.id, { target: { name: 'price', value: values.floatValue || '' } })} thousandSeparator="." decimalSeparator="," prefix="R$ " className="form-control" required /></FormGroup></Col>
                      </Row>
                      <Row>
                        <Col md={4}><FormGroup><Label>Preço de Custo</Label><NumericFormat name="costPrice" value={variation.costPrice} onValueChange={(values) => handleVariationChange(variation.id, { target: { name: 'costPrice', value: values.floatValue || '' } })} thousandSeparator="." decimalSeparator="," prefix="R$ " className="form-control" /></FormGroup></Col>
                        <Col md={4}><FormGroup><Label>Estoque</Label><Input type="number" name="stockQuantity" value={variation.stockQuantity} onChange={(e) => handleVariationChange(variation.id, e)} required /></FormGroup></Col>
                        <Col md={4}><FormGroup><Label>Alerta de Estoque</Label><Input type="number" name="alertThreshold" value={variation.alertThreshold} onChange={(e) => handleVariationChange(variation.id, e)} /></FormGroup></Col>
                      </Row>
                    </Card>
                  ))}
                  <Button color="success" size="sm" onClick={handleAddVariation} className="mt-3"><i className="bx bx-plus me-2"></i>Adicionar Variação</Button>
                </>
              ) : (
                <Row>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="service_price">Preço do Serviço</Label>
                            <NumericFormat name="price" id="service_price" value={formData.price} onValueChange={(values) => handleChange({target: {name: 'price', value: values.floatValue || ''}})} thousandSeparator="." decimalSeparator="," prefix="R$ " className="form-control" required />
                        </FormGroup>
                    </Col>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="service_cost_price">Custo do Serviço (Opcional)</Label>
                            <NumericFormat name="costPrice" id="service_cost_price" value={formData.costPrice} onValueChange={(values) => handleChange({target: {name: 'costPrice', value: values.floatValue || ''}})} thousandSeparator="." decimalSeparator="," prefix="R$ " className="form-control" />
                        </FormGroup>
                    </Col>
                </Row>
              )}
            </Col>
            <Col md={4} className="d-flex flex-column align-items-center justify-content-center bg-light p-3 rounded">
              <Label className="mb-3 fw-bold">Pré-visualização da Imagem</Label>
              <div style={{ width: '100%', maxWidth: '250px', height: '250px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#fff' }}>
                {formData.productType === 'physical' && formData.variations?.[0]?.imageUrl ? (
                  <img src={formData.variations[0].imageUrl} alt="Pré-visualização" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <i className="bx bx-image fa-5x text-muted"></i>
                )}
              </div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={isSaving}>Cancelar</Button>
          <Button color="primary" type="submit" disabled={isSaving}>
            {isSaving ? <Spinner size="sm" /> : 'Salvar'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
