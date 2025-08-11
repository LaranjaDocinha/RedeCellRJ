import React, { useState, useEffect, useCallback } from 'react';
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
  Row,
  Col,
  Card,
} from 'reactstrap';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import useApi from '../../../hooks/useApi';
import { get, post, put } from '../../../helpers/api_helper';

const ProductFormModal = ({ isOpen, toggle, product, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // Novo estado para o arquivo de imagem
  const [imagePreviewUrl, setImagePreviewUrl] = useState(''); // Novo estado para a URL de pré-visualização

  const isEditing = product && product.id;

  const { request: saveProduct, loading: isSaving } = useApi(isEditing ? put : post);
  const { request: fetchCategories } = useApi(get);

  useEffect(() => {
    fetchCategories('/api/categories?limit=1000').then((data) => {
      setCategories(data.categories || []);
    });
  }, [fetchCategories]);

  useEffect(() => {
    if (isOpen) {
      const initialVariations = [
        {
          id: Date.now(),
          color: '',
          price: '',
          costPrice: '',
          stockQuantity: '',
          alertThreshold: 5,
          imageUrl: '',
          status: 'active',
        },
      ];
      if (isEditing) {
        const isService = product.productType === 'service';
        setFormData({
          name: product.name || '',
          description: product.description || '',
          categoryId: product.categoryId || '',
          productType: product.productType || 'physical',
          price: isService && product.variations.length > 0 ? product.variations[0].price : '',
          costPrice:
            isService && product.variations.length > 0 ? product.variations[0].costPrice : '',
          variations:
            !isService && product.variations && product.variations.length > 0
              ? product.variations.map((v) => ({ ...v }))
              : initialVariations,
        });
        // Define a URL da imagem existente para pré-visualização ao editar
        if (product.variations?.[0]?.imageUrl) {
          setImagePreviewUrl(product.variations[0].imageUrl);
        } else {
          setImagePreviewUrl('');
        }
        setSelectedFile(null); // Limpa o arquivo selecionado ao abrir o modal
      } else {
        setFormData({
          name: '',
          description: '',
          categoryId: '',
          productType: 'physical',
          price: '',
          costPrice: '',
          variations: initialVariations,
        });
        setImagePreviewUrl(''); // Limpa a pré-visualização ao adicionar novo
        setSelectedFile(null); // Limpa o arquivo selecionado ao adicionar novo
      }
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariationChange = useCallback((variationId, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      variations: prevData.variations.map((variation) =>
        variation.id === variationId ? { ...variation, [name]: value } : variation,
      ),
    }));
  }, []);

  const handleAddVariation = useCallback(() => {
    setFormData((prevData) => ({
      ...prevData,
      variations: [
        ...prevData.variations,
        {
          id: Date.now(),
          color: '',
          price: '',
          costPrice: '',
          stockQuantity: '',
          alertThreshold: 5,
          imageUrl: '',
          status: 'active',
        },
      ],
    }));
  }, []);

  const handleRemoveVariation = useCallback((idToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      variations: prevData.variations.filter((variation) => variation.id !== idToRemove),
    }));
  }, []);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(
        isEditing && product.variations?.[0]?.imageUrl ? product.variations[0].imageUrl : '',
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = new FormData(); // Usar FormData para enviar arquivos

    // Adicionar campos de texto ao FormData
    dataToSend.append('name', formData.name);
    dataToSend.append('description', formData.description);
    dataToSend.append('category_id', formData.categoryId);
    dataToSend.append('product_type', formData.productType);

    if (formData.productType === 'service') {
      dataToSend.append('price', parseFloat(formData.price) || 0);
      dataToSend.append('cost_price', parseFloat(formData.costPrice) || 0);
      dataToSend.append('variations', JSON.stringify([])); // Envia array vazio para serviço
    } else {
      // Adicionar variações como uma string JSON
      dataToSend.append(
        'variations',
        JSON.stringify(
          formData.variations.map((v) => ({
            id: v.id,
            color: v.color,
            price: parseFloat(v.price) || 0,
            costPrice: parseFloat(v.costPrice) || 0,
            stockQuantity: parseInt(v.stockQuantity, 10) || 0,
            alertThreshold: parseInt(v.alertThreshold, 10) || 5,
            imageUrl: v.imageUrl, // Manter a URL existente se não houver novo upload
            status: v.status || 'active',
          })),
        ),
      );
    }

    // Adicionar o arquivo de imagem se selecionado
    if (selectedFile) {
      dataToSend.append('productImage', selectedFile);
    }

    const url = isEditing ? `/api/products/${product.id}` : '/api/products';

    // Usar fetch diretamente para lidar com FormData
    saveProduct(url, dataToSend, { headers: { 'Content-Type': undefined } }) // Content-Type: undefined permite que o navegador defina automaticamente multipart/form-data
      .then(() => {
        toast.success(`Produto ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
        onSuccess();
      })
      .catch((error) => {
        const errorMessage = error?.message || error?.msg || 'Erro ao salvar produto.';
        toast.error(errorMessage);
      });
  };

  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  return (
    <Modal centered isOpen={isOpen} size='xl' toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <Row>
            <Col md={8}>
              <FormGroup>
                <Label for='name'>Nome do Produto</Label>
                <Input
                  required
                  id='name'
                  name='name'
                  type='text'
                  value={formData.name || ''}
                  onChange={handleChange}
                />
              </FormGroup>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for='product_type'>Tipo de Produto</Label>
                    <Input
                      id='product_type'
                      name='productType'
                      type='select'
                      value={formData.productType || 'physical'}
                      onChange={handleChange}
                    >
                      <option value='physical'>Físico (com estoque)</option>
                      <option value='service'>Serviço (sem estoque)</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for='category_id'>Categoria</Label>
                    <Select
                      classNamePrefix='select2-selection'
                      id='category_id'
                      name='categoryId'
                      options={categoryOptions}
                      placeholder='Selecione...'
                      value={categoryOptions.find((c) => c.value === formData.categoryId) || null}
                      onChange={(selectedOption) =>
                        handleChange({
                          target: {
                            name: 'categoryId',
                            value: selectedOption ? selectedOption.value : '',
                          },
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for='description'>Descrição</Label>
                {/* <CKEditor
                  config={{ toolbar: ['bold', 'italic', 'bulletedList', 'numberedList', 'link'] }}
                  data={formData.description || ''}
                  editor={ClassicEditor}
                  onChange={(event, editor) =>
                    handleChange({ target: { name: 'description', value: editor.getData() } })
                  }
                /> */}
                <Input
                  type="textarea"
                  name="description"
                  id="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows="5"
                />
              </FormGroup>

              {formData.productType === 'physical' ? (
                <>
                  <h5 className='mt-4 mb-3'>Variações do Produto</h5>
                  {formData.variations?.map((variation, index) => (
                    <Card key={variation.id} className='mb-3 p-3'>
                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <h6>Variação #{index + 1}</h6>
                        {formData.variations.length > 1 && (
                          <Button
                            color='danger'
                            size='sm'
                            onClick={() => handleRemoveVariation(variation.id)}
                          >
                            <i className='bx bx-trash-alt'></i>
                          </Button>
                        )}
                      </div>
                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label>Cor/Variação</Label>
                            <Input
                              required
                              name='color'
                              type='text'
                              value={variation.color}
                              onChange={(e) => handleVariationChange(variation.id, e)}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label>Preço de Venda</Label>
                            <NumericFormat
                              required
                              className='form-control'
                              decimalSeparator=','
                              name='price'
                              prefix='R$ '
                              thousandSeparator='.'
                              value={variation.price}
                              onValueChange={(values) =>
                                handleVariationChange(variation.id, {
                                  target: { name: 'price', value: values.floatValue || '' },
                                })
                              }
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={4}>
                          <FormGroup>
                            <Label>Preço de Custo</Label>
                            <NumericFormat
                              className='form-control'
                              decimalSeparator=','
                              name='costPrice'
                              prefix='R$ '
                              thousandSeparator='.'
                              value={variation.costPrice}
                              onValueChange={(values) =>
                                handleVariationChange(variation.id, {
                                  target: { name: 'costPrice', value: values.floatValue || '' },
                                })
                              }
                            />
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label>Estoque</Label>
                            <Input
                              required
                              name='stockQuantity'
                              type='number'
                              value={variation.stockQuantity}
                              onChange={(e) => handleVariationChange(variation.id, e)}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label>Alerta de Estoque</Label>
                            <Input
                              name='alertThreshold'
                              type='number'
                              value={variation.alertThreshold}
                              onChange={(e) => handleVariationChange(variation.id, e)}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button className='mt-3' color='success' size='sm' onClick={handleAddVariation}>
                    <i className='bx bx-plus me-2'></i>Adicionar Variação
                  </Button>
                </>
              ) : (
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for='service_price'>Preço do Serviço</Label>
                      <NumericFormat
                        required
                        className='form-control'
                        decimalSeparator=','
                        id='service_price'
                        name='price'
                        prefix='R$ '
                        thousandSeparator='.'
                        value={formData.price}
                        onValueChange={(values) =>
                          handleChange({
                            target: { name: 'price', value: values.floatValue || '' },
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for='service_cost_price'>Custo do Serviço (Opcional)</Label>
                      <NumericFormat
                        className='form-control'
                        decimalSeparator=','
                        id='service_cost_price'
                        name='costPrice'
                        prefix='R$ '
                        thousandSeparator='.'
                        value={formData.costPrice}
                        onValueChange={(values) =>
                          handleChange({
                            target: { name: 'costPrice', value: values.floatValue || '' },
                          })
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
              )}
            </Col>
            <Col
              className='d-flex flex-column align-items-center justify-content-center bg-light p-3 rounded'
              md={4}
            >
              <Label className='mb-3 fw-bold'>Pré-visualização da Imagem</Label>
              <div
                style={{
                  width: '100%',
                  maxWidth: '250px',
                  height: '250px',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                }}
              >
                {imagePreviewUrl ? (
                  <img
                    alt='Pré-visualização'
                    src={imagePreviewUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <i className='bx bx-image fa-5x text-muted'></i>
                )}
              </div>
              <FormGroup className='mt-3 w-100'>
                <Label for='productImage'>Carregar Imagem</Label>
                <Input
                  accept='image/*'
                  id='productImage'
                  name='productImage'
                  type='file'
                  onChange={handleImageFileChange}
                />
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' disabled={isSaving} onClick={toggle}>
            Cancelar
          </Button>
          <Button color='primary' disabled={isSaving} type='submit'>
            {isSaving ? <LoadingSpinner size='sm' /> : 'Salvar'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
