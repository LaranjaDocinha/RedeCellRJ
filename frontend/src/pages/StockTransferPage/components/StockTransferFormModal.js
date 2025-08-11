import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';

import useProductStore from '../../../store/productStore';
import useBranchStore from '../../../store/branchStore';

const StockTransferSchema = Yup.object().shape({
  product_variation_id: Yup.number().required('O produto é obrigatório.'),
  quantity: Yup.number().min(1, 'A quantidade deve ser no mínimo 1.').required('A quantidade é obrigatória.'),
  from_branch_id: Yup.number().required('A filial de origem é obrigatória.'),
  to_branch_id: Yup.number().required('A filial de destino é obrigatória.'),
  notes: Yup.string().max(500, 'As notas não podem exceder 500 caracteres.'),
});

const StockTransferFormModal = ({ isOpen, toggle, onSave }) => {
  const { products, fetchProducts, loading: productsLoading, error: productsError } = useProductStore();
  const { branches, fetchBranches, loading: branchesLoading, error: branchesError } = useBranchStore();

  const [productOptions, setProductOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchBranches();
  }, [fetchProducts, fetchBranches]);

  useEffect(() => {
    if (products.length > 0) {
      const options = products.flatMap(p => 
        p.variations.map(v => ({
          value: v.id,
          label: `${p.name} ${v.color ? `(${v.color})` : ''} - ${v.barcode} (Estoque: ${v.stock_quantity - v.reserved_quantity})`,
          stock: v.stock_quantity - v.reserved_quantity,
          branch_id: v.branch_id // Assuming variation has branch_id
        }))
      );
      setProductOptions(options);
    }
  }, [products]);

  useEffect(() => {
    if (branches.length > 0) {
      const options = branches.map(b => ({
        value: b.id,
        label: b.name,
      }));
      setBranchOptions(options);
    }
  }, [branches]);

  const initialValues = {
    product_variation_id: '',
    quantity: '',
    from_branch_id: '',
    to_branch_id: '',
    notes: '',
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <Formik
        initialValues={initialValues}
        validationSchema={StockTransferSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          onSave(values);
          setSubmitting(false);
          resetForm();
          toggle();
        }}
      >
        {({ values, setFieldValue, isSubmitting, handleSubmit, errors, touched }) => (
          <Form onSubmit={handleSubmit}>
            <ModalHeader toggle={toggle}>Nova Transferência de Estoque</ModalHeader>
            <ModalBody>
              {(productsLoading || branchesLoading) && <Spinner size="sm" />}
              {(productsError || branchesError) && <Alert color="danger">Erro ao carregar dados: {productsError || branchesError}</Alert>}

              <FormGroup>
                <Label for="product_variation_id">Produto</Label>
                <Select
                  id="product_variation_id"
                  name="product_variation_id"
                  options={productOptions}
                  isLoading={productsLoading}
                  onChange={(option) => {
                    setFieldValue('product_variation_id', option ? option.value : '');
                    // Optionally, set max quantity based on selected product's stock
                    const selectedProduct = productOptions.find(p => p.value === option.value);
                    if (selectedProduct) {
                        setFieldValue('max_quantity', selectedProduct.stock);
                        setFieldValue('from_branch_id', selectedProduct.branch_id); // Auto-fill from_branch_id
                    }
                  }}
                  value={productOptions.find(option => option.value === values.product_variation_id)}
                  placeholder="Selecione um produto..."
                />
                <ErrorMessage name="product_variation_id" component="div" className="text-danger" />
              </FormGroup>

              <FormGroup>
                <Label for="quantity">Quantidade</Label>
                <Field as={Input} type="number" name="quantity" id="quantity" min="1" />
                {values.max_quantity !== undefined && values.product_variation_id && (
                    <small className="form-text text-muted">Estoque disponível na origem: {values.max_quantity}</small>
                )}
                <ErrorMessage name="quantity" component="div" className="text-danger" />
              </FormGroup>

              <FormGroup>
                <Label for="from_branch_id">Filial de Origem</Label>
                <Select
                  id="from_branch_id"
                  name="from_branch_id"
                  options={branchOptions}
                  isLoading={branchesLoading}
                  onChange={(option) => setFieldValue('from_branch_id', option ? option.value : '')}
                  value={branchOptions.find(option => option.value === values.from_branch_id)}
                  placeholder="Selecione a filial de origem..."
                />
                <ErrorMessage name="from_branch_id" component="div" className="text-danger" />
              </FormGroup>

              <FormGroup>
                <Label for="to_branch_id">Filial de Destino</Label>
                <Select
                  id="to_branch_id"
                  name="to_branch_id"
                  options={branchOptions}
                  isLoading={branchesLoading}
                  onChange={(option) => setFieldValue('to_branch_id', option ? option.value : '')}
                  value={branchOptions.find(option => option.value === values.to_branch_id)}
                  placeholder="Selecione a filial de destino..."
                />
                <ErrorMessage name="to_branch_id" component="div" className="text-danger" />
              </FormGroup>

              <FormGroup>
                <Label for="notes">Notas (Opcional)</Label>
                <Field as={Input} type="textarea" name="notes" id="notes" />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="light" onClick={toggle}>Cancelar</Button>
              <Button color="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner size="sm" /> : 'Solicitar Transferência'}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default StockTransferFormModal;
