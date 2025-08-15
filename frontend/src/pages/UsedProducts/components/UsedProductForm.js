import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import useApi from '../../../hooks/useApi'; // Adjust path as needed
import toast from 'react-hot-toast';

const UsedProductForm = ({ onClose, onSuccess, usedProduct }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    category_id: '',
    serial_number: '',
    condition: '',
    acquisition_price: '',
    sale_price: '',
    current_stock: '',
    branch_id: '',
  });

  const { request: createUsedProduct, isLoading: isCreating, error: createError } = useApi('post');
  const { request: updateUsedProduct, isLoading: isUpdating, error: updateError } = useApi('put');

  const isEditing = !!usedProduct;
  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  useEffect(() => {
    if (isEditing && usedProduct) {
      setFormData({
        product_name: usedProduct.product_name || '',
        description: usedProduct.description || '',
        category_id: usedProduct.category_id || '',
        serial_number: usedProduct.serial_number || '',
        condition: usedProduct.condition || '',
        acquisition_price: usedProduct.acquisition_price || '',
        sale_price: usedProduct.sale_price || '',
        current_stock: usedProduct.current_stock || '',
        branch_id: usedProduct.branch_id || '',
      });
    } else {
      setFormData({
        product_name: '',
        description: '',
        category_id: '',
        serial_number: '',
        condition: '',
        acquisition_price: '',
        sale_price: '',
        current_stock: '',
        branch_id: '',
      });
    }
  }, [isEditing, usedProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateUsedProduct(`/api/used-products/${usedProduct.id}`, formData);
        toast.success('Produto seminovo atualizado com sucesso!');
      } else {
        await createUsedProduct('/api/used-products', formData);
        toast.success('Produto seminovo registrado com sucesso!');
      }
      onSuccess(); // Call onSuccess to close modal and refresh list
    } catch (err) {
      toast.error(err.message || 'Erro ao registrar/atualizar produto seminovo.');
    }
  };

  return (
    <div className="used-product-form p-4">
      <h2>{isEditing ? 'Editar Produto Seminovos' : 'Registrar Seminovos'}</h2>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="product_name">Nome do Produto:</Label>
          <Input
            type="text"
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="description">Descrição:</Label>
          <Input
            type="textarea"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="category_id">ID da Categoria:</Label>
          <Input
            type="number"
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="serial_number">Número de Série:</Label>
          <Input
            type="text"
            id="serial_number"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="condition">Condição:</Label>
          <Input
            type="text"
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="acquisition_price">Preço de Aquisição:</Label>
          <Input
            type="number"
            id="acquisition_price"
            name="acquisition_price"
            value={formData.acquisition_price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
          />
        </FormGroup>
        <FormGroup>
          <Label for="sale_price">Preço de Venda:</Label>
          <Input
            type="number"
            id="sale_price"
            name="sale_price"
            value={formData.sale_price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
          />
        </FormGroup>
        <FormGroup>
          <Label for="current_stock">Estoque Atual:</Label>
          <Input
            type="number"
            id="current_stock"
            name="current_stock"
            value={formData.current_stock}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="branch_id">ID da Filial:</Label>
          <Input
            type="number"
            id="branch_id"
            name="branch_id"
            value={formData.branch_id}
            onChange={handleChange}
            required
          />
        </FormGroup>

        {error && <Alert color="danger" className="mt-3">{error.message}</Alert>}

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button type="button" color="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" color="primary" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : (isEditing ? 'Atualizar' : 'Salvar')}
          </Button>
        </div>
      </form>
    </div>
  );
};

UsedProductForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  usedProduct: PropTypes.object, // Added for editing
};

export default UsedProductForm;
