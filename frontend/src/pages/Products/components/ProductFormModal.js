import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col, Card } from 'reactstrap';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast';
import _ from 'lodash';

import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import useApi from '../../../hooks/useApi';
import { useDirtyForm } from '../../../hooks/useDirtyForm';

const ProductFormModal = ({ isOpen, toggle, product, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  const { setDirty, reset: resetDirty } = useDirtyForm();

  const isEditing = product && product.id;

  const { request: createProduct, loading: isCreating } = useApi('post');
  const { request: updateProduct, loading: isUpdating } = useApi('put');
  const { request: fetchCategories } = useApi('get');
  const isSaving = isCreating || isUpdating;

  // Efeito para detectar se o formulário está "sujo"
  useEffect(() => {
    if (initialData) {
      const isFormDirty = !_.isEqual(formData, initialData);
      setDirty(isFormDirty);
    }
  }, [formData, initialData, setDirty]);

  // Efeito para limpar o estado sujo ao desmontar o componente
  useEffect(() => {
    return () => {
      resetDirty();
    };
  }, [resetDirty]);

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
      let data;
      if (isEditing) {
        const isService = product.productType === 'service';
        data = {
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
        };
        if (product.variations?.[0]?.imageUrl) {
          setImagePreviewUrl(product.variations[0].imageUrl);
        } else {
          setImagePreviewUrl('');
        }
        setSelectedFile(null);
      } else {
        data = {
          name: '',
          description: '',
          categoryId: '',
          productType: 'physical',
          price: '',
          costPrice: '',
          variations: initialVariations,
        };
        setImagePreviewUrl('');
        setSelectedFile(null);
      }
      setFormData(data);
      setInitialData(data);
    }
  }, [product, isOpen, isEditing]);

  const handleToggle = () => {
    resetDirty();
    toggle();
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();

    dataToSend.append('name', formData.name);
    dataToSend.append('description', formData.description);
    dataToSend.append('category_id', formData.categoryId);
    dataToSend.append('product_type', formData.productType);

    if (formData.productType === 'service') {
      dataToSend.append('price', parseFloat(formData.price) || 0);
      dataToSend.append('cost_price', parseFloat(formData.costPrice) || 0);
      dataToSend.append('variations', JSON.stringify([]));
    } else {
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
            imageUrl: v.imageUrl,
            status: v.status || 'active',
          })),
        ),
      );
    }

    if (selectedFile) {
      dataToSend.append('productImage', selectedFile);
    }

    const apiCall = isEditing ? updateProduct : createProduct;
    const url = isEditing ? `/api/products/${product.id}` : '/api/products';

    try {
      await apiCall(url, dataToSend, { headers: { 'Content-Type': undefined } });
      toast.success(`Produto ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      resetDirty();
      onSuccess();
    } catch (error) {
      const errorMessage = error?.message || error?.msg || 'Erro ao salvar produto.';
      toast.error(errorMessage);
    }
  };

  const categoryOptions = categories.map((cat) => ({ value: cat.id, label: cat.name }));

  return (
    <Modal centered isOpen={isOpen} size='xl' toggle={handleToggle}>
      <ModalHeader toggle={handleToggle}>
        {isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
           {/* ... JSX do formulário ... */}
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' disabled={isSaving} onClick={handleToggle}>
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