import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled';
import { Button } from '../components/Button';
import styled from 'styled-components';
import Loading from '../components/Loading';

// Styled Components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FormLabel = styled.label`
  font-weight: 500;
`;

const FormInput = styled.input`
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.outline};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const FormSelect = styled.select`
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.outline};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const FormError = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 12px;
`;

const SectionContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Zod Validation Schemas
const variationSchema = z.object({
  id: z.number().optional(),
  color: z.string().nonempty('Cor é obrigatória'),
  storage_capacity: z.string().optional(),
  price: z.preprocess((val) => parseFloat(String(val)), z.number().positive('Preço deve ser positivo')),
  stock_quantity: z.preprocess((val) => parseInt(String(val), 10), z.number().int().min(0, 'Estoque não pode ser negativo')),
  low_stock_threshold: z.preprocess((val) => parseInt(String(val), 10), z.number().int().min(0, 'Alerta de estoque não pode ser negativo')),
});

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr) auto; // Changed from 4 to 5
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

    } else {
      reset({
        variations: [{ color: '', storage_capacity: '', price: 0, stock_quantity: 0, low_stock_threshold: 10 }],
        suppliers: [],
      });
    }

          {variationFields.map((field, index) => (
            <Row key={field.id}>
              <FormGroup><FormLabel>Cor</FormLabel><FormInput {...register(`variations.${index}.color`)} /></FormGroup>
              <FormGroup><FormLabel>Capacidade</FormLabel><FormInput placeholder="Ex: 128GB" {...register(`variations.${index}.storage_capacity`)} /></FormGroup>
              <FormGroup><FormLabel>Preço</FormLabel><FormInput type="number" step="0.01" {...register(`variations.${index}.price`)} /></FormGroup>
              <FormGroup><FormLabel>Estoque</FormLabel><FormInput type="number" {...register(`variations.${index}.stock_quantity`)} /></FormGroup>
              <FormGroup><FormLabel>Alerta Est.</FormLabel><FormInput type="number" {...register(`variations.${index}.low_stock_threshold`)} /></FormGroup>
              <Button type="button" onClick={() => removeVariation(index)} label="Remover" variant="danger" />
            </Row>
          ))}
          <Button type="button" onClick={() => appendVariation({ color: '', storage_capacity: '', price: 0, stock_quantity: 0, low_stock_threshold: 10 })} label="Adicionar Variação" />
          {errors.variations && <FormError>{errors.variations.message}</FormError>}

const supplierSchema = z.object({
  supplier_id: z.preprocess((val) => parseInt(String(val), 10), z.number().positive('Fornecedor é obrigatório')),
  cost: z.preprocess((val) => parseFloat(String(val)), z.number().min(0, 'Custo deve ser positivo')),
  lead_time_days: z.preprocess((val) => val ? parseInt(String(val), 10) : null, z.number().int().min(0).nullable().optional()),
  supplier_part_number: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().nonempty('Nome do produto é obrigatório'),
  branch_id: z.preprocess((val) => parseInt(String(val), 10), z.number().positive('Filial é obrigatória')),
  sku: z.string().nonempty('SKU é obrigatório'),
  product_type: z.string().nonempty('Tipo de produto é obrigatório'),
  variations: z.array(variationSchema).min(1, 'Adicione pelo menos uma variação'),
  suppliers: z.array(supplierSchema).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Branch { id: number; name: string; }
interface Supplier { id: number; name: string; }

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToast } = useNotification();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(isEditMode);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      product_type: '',
      variations: [],
      suppliers: [],
    },
  });

  const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({
    control,
    name: 'variations',
  });

  const { fields: supplierFields, append: appendSupplier, remove: removeSupplier } = useFieldArray({
    control,
    name: 'suppliers',
  });

  useEffect(() => {
    const fetchData = async (url: string, setData: Function, entityName: string) => {
      try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error(`Falha ao buscar ${entityName}`);
        setData(await response.json());
      } catch (error) { addToast(`Erro ao carregar ${entityName}.`, 'error'); }
    };

    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Falha ao buscar dados do produto');
        const data = await response.json();
        reset(data);
      } catch (error: any) {
        addToast(error.message, 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchData('/api/branches', setBranches, 'filiais');
    fetchData('/api/suppliers', setSuppliers, 'fornecedores');

    if (isEditMode) {
      fetchProduct();
    } else {
      reset({
        variations: [{ color: '', price: 0, stock_quantity: 0, low_stock_threshold: 10 }],
        suppliers: [],
      });
    }
  }, [id, isEditMode, token, addToast, navigate, reset]);

  const onSubmit = async (data: ProductFormData) => {
    const url = isEditMode ? `/api/products/${id}` : '/api/products';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} produto`);
      }
      addToast(`Produto ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`, 'success');
      navigate('/products');
    } catch (error: any) {
      addToast(error.message, 'error');
    }
  };

  if (loading && isEditMode) {
    return <Loading />;
  }

  return (
    <StyledPageContainer>
      <StyledPageTitle>{isEditMode ? 'Editar Produto' : 'Adicionar Novo Produto'}</StyledPageTitle>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Product Info */}
        <FormGroup>
          <FormLabel htmlFor="name">Nome do Produto</FormLabel>
          <FormInput id="name" {...register('name')} />
          {errors.name && <FormError>{errors.name.message}</FormError>}
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="sku">SKU</FormLabel>
          <FormInput id="sku" {...register('sku')} />
          {errors.sku && <FormError>{errors.sku.message}</FormError>}
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="branch_id">Filial</FormLabel>
          <FormSelect id="branch_id" {...register('branch_id')}>
            <option value="">Selecione uma Filial</option>
            {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </FormSelect>
          {errors.branch_id && <FormError>{errors.branch_id.message}</FormError>}
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="product_type">Tipo de Produto</FormLabel>
          <FormSelect id="product_type" {...register('product_type')}>
            <option value="">Selecione um Tipo</option>
            <option value="Celular">Celular</option>
            <option value="Acessório">Acessório</option>
            <option value="Peça">Peça</option>
            <option value="Outro">Outro</option>
          </FormSelect>
          {errors.product_type && <FormError>{errors.product_type.message}</FormError>}
        </FormGroup>

        {/* Variations Section */}
        <SectionContainer>
          <h3 style={{ marginBottom: '20px' }}>Variações</h3>
          {variationFields.map((field, index) => (
            <Row key={field.id}>
              <FormGroup><FormLabel>Cor</FormLabel><FormInput {...register(`variations.${index}.color`)} /></FormGroup>
              <FormGroup><FormLabel>Preço</FormLabel><FormInput type="number" step="0.01" {...register(`variations.${index}.price`)} /></FormGroup>
              <FormGroup><FormLabel>Estoque</FormLabel><FormInput type="number" {...register(`variations.${index}.stock_quantity`)} /></FormGroup>
              <FormGroup><FormLabel>Alerta Est.</FormLabel><FormInput type="number" {...register(`variations.${index}.low_stock_threshold`)} /></FormGroup>
              <Button type="button" onClick={() => removeVariation(index)} label="Remover" variant="danger" />
            </Row>
          ))}
          <Button type="button" onClick={() => appendVariation({ color: '', price: 0, stock_quantity: 0, low_stock_threshold: 10 })} label="Adicionar Variação" />
          {errors.variations && <FormError>{errors.variations.message}</FormError>}
        </SectionContainer>

        {/* Suppliers Section */}
        <SectionContainer>
          <h3 style={{ marginBottom: '20px' }}>Fornecedores</h3>
          {supplierFields.map((field, index) => (
            <Row key={field.id}>
              <FormGroup>
                <FormLabel>Fornecedor</FormLabel>
                <FormSelect {...register(`suppliers.${index}.supplier_id`)}>
                  <option value="">Selecione</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Custo</FormLabel>
                <FormInput type="number" step="0.01" {...register(`suppliers.${index}.cost`)} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Prazo (dias)</FormLabel>
                <FormInput type="number" {...register(`suppliers.${index}.lead_time_days`)} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Cód. Fornecedor</FormLabel>
                <FormInput {...register(`suppliers.${index}.supplier_part_number`)} />
              </FormGroup>
              <Button type="button" onClick={() => removeSupplier(index)} label="Remover" variant="danger" />
            </Row>
          ))}
          <Button type="button" onClick={() => appendSupplier({ supplier_id: 0, cost: 0, lead_time_days: null, supplier_part_number: '' })} label="Adicionar Fornecedor" />
          {errors.suppliers && <FormError>Verifique os dados dos fornecedores.</FormError>}
        </SectionContainer>

        <Button type="submit" label={isEditMode ? 'Salvar Alterações' : 'Salvar Produto'} primary />
      </Form>
    </StyledPageContainer>
  );
};

export default ProductFormPage;