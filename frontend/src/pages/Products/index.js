import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Button, Badge, UncontrolledCollapse, Card, CardBody } from 'reactstrap';
import toast from 'react-hot-toast';
import { NumericFormat } from 'react-number-format';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import AdvancedTable from '../../components/Common/AdvancedTable';
import ProductFormModal from './components/ProductFormModal';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import ProductPageSkeleton from './components/ProductPageSkeleton';
import useApi from '../../hooks/useApi';
import { get, del } from '../../helpers/api_helper';

const Products = () => {
  document.title = "Produtos | PDV Web";

  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const { request: fetchProducts, loading } = useApi(get);
  const { request: deleteProduct, loading: isDeleting } = useApi(del);

  const loadProducts = useCallback(() => {
    fetchProducts('/products?limit=2000') // Fetch a large number for now
      .then(response => {
        setProducts(response.products || []);
      })
      .catch(err => {
        toast.error("Falha ao carregar produtos.");
        console.error(err);
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [fetchProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const toggleModal = () => setModalOpen(!modalOpen);
  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);

  const handleNewClick = () => {
    setSelectedProduct(null);
    toggleModal();
  };
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    toggleModal();
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    toggleDeleteModal();
  };

  const onDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(`/products/${selectedProduct.id}`);
      toast.success("Produto excluído com sucesso!");
      loadProducts();
      toggleDeleteModal();
    } catch (error) {
      toast.error("Falha ao excluir o produto.");
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Produto',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <p className="fw-bold mb-0">{row.original.name}</p>
          <small className="text-muted">{row.original.description?.replace(/<[^>]+>/g, '').substring(0, 50)}...</small>
        </div>
      )
    },
    {
      header: 'Variações',
      accessorKey: 'variations',
      cell: ({ row }) => (
        <div>
          <Button id={`toggler-${row.original.id}`} type="button" color="light" size="sm">
            Ver ({row.original.variations.length})
          </Button>
          <UncontrolledCollapse toggler={`#toggler-${row.original.id}`} style={{width: '300px'}}>
            <Card>
              <CardBody>
                {row.original.variations.map(v => (
                  <div key={v.id} className="d-flex justify-content-between border-bottom py-1">
                    <span>{v.color}</span>
                    <NumericFormat value={v.price} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix={'R$ '} />
                    <Badge color={v.stock_quantity > 0 ? 'light' : 'danger'}>{v.stock_quantity} em est.</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </UncontrolledCollapse>
        </div>
      )
    },
    {
      header: 'Tipo',
      accessorKey: 'product_type',
      cell: info => <Badge color={info.getValue() === 'physical' ? 'info' : 'secondary'}>{info.getValue() === 'physical' ? 'Físico' : 'Serviço'}</Badge>
    },
    {
      header: 'Ações',
      cell: ({ row }) => (
        <div className="d-flex gap-2">
          <Button color="primary" size="sm" onClick={() => handleEditClick(row.original)}>
            <i className="bx bx-pencil me-1"></i> Editar
          </Button>
          <Button color="danger" size="sm" onClick={() => handleDeleteClick(row.original)}>
            <i className="bx bx-trash-alt me-1"></i> Excluir
          </Button>
        </div>
      ),
    },
  ], []);

  if (initialLoading) {
    return <ProductPageSkeleton />;
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Catálogo" breadcrumbItem="Produtos" />
          <AdvancedTable
            data={products}
            columns={columns}
            loading={loading && !initialLoading} // Only show table spinner on re-fetches
            actions={
              <Button color="success" onClick={handleNewClick}>
                <i className="bx bx-plus me-1"></i> Novo Produto
              </Button>
            }
            emptyStateTitle="Nenhum Produto Encontrado"
            emptyStateMessage="Cadastre seu primeiro produto para começar a vender."
            emptyStateActionText="Adicionar Produto"
            onEmptyStateActionClick={handleNewClick}
          />
        </Container>
      </div>
      
      {modalOpen && (
        <ProductFormModal 
          isOpen={modalOpen} 
          toggle={toggleModal} 
          product={selectedProduct} 
          onSave={loadProducts} 
        />
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        toggle={toggleDeleteModal}
        onConfirm={onDeleteConfirm}
        loading={isDeleting}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o produto "${selectedProduct?.name}"? Esta ação não pode ser desfeita.`}
      />
    </React.Fragment>
  );
};

export default Products;