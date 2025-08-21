import React, { useState, useContext } from 'react';
import { Container, Button, Row, Col } from 'reactstrap';
import toast from 'react-hot-toast';

import { ProductContext } from '../../context/ProductContext';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import useApi from '../../hooks/useApi';


import ProductCard from './components/ProductCard';
import ProductTable from './components/ProductTable'; // Importa a nova tabela
import ProductFormModal from './components/ProductFormModal';
import LabelPrintModal from './components/LabelPrintModal';
import ProductPageSkeleton from './components/ProductPageSkeleton';
import ProductToolbar from './components/ProductToolbar';
import QuickViewModal from './components/QuickViewModal';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import CategoryManagerModal from './components/CategoryManagerModal';
import ActiveFilters from './components/ActiveFilters';

const Products = () => {
  document.title = 'Produtos | PDV Web';

  const {
    filteredProducts,
    loading,
    reloadProducts,
    products,
    ui,
    selection,
    setQuickViewProduct,
  } = useContext(ProductContext);
  const { viewMode } = ui;
  const { selectedProducts, deleteSelected, toggleProductSelection } = selection;

  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [labelPrintModalOpen, setLabelPrintModalOpen] = useState(false); // Novo estado
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { request: deleteProductApi, loading: isDeleting } = useApi('delete');

  const toggleModal = () => setModalOpen(!modalOpen);
  const toggleCategoryModal = () => setCategoryModalOpen(!categoryModalOpen);
  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);
  const toggleBulkDeleteModal = () => setBulkDeleteModalOpen(!bulkDeleteModalOpen);
  const toggleLabelPrintModal = () => setLabelPrintModalOpen(!labelPrintModalOpen); // Nova função

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

  const handleQuickViewClick = (product) => {
    setQuickViewProduct(product);
  };

  const onDeleteConfirm = () => {
    if (!selectedProduct) return;
    deleteProductApi(`/api/products/${selectedProduct.id}`)
      .then(() => {
        toast.success('Produto excluído com sucesso!');
        reloadProducts();
        toggleDeleteModal();
      })
      .catch(() => {
        // Error is handled by the interceptor
      });
  };

  const onBulkDeleteConfirm = () => {
    deleteSelected().finally(() => {
      toggleBulkDeleteModal();
    });
  };

  const renderEmptyState = () => {
    const hasProducts = products.length > 0;
    const hasFilteredProducts = filteredProducts.length > 0;

    if (!hasFilteredProducts && hasProducts) {
      return (
        <Col className='text-center mt-5' xs='12'>
          <h4>Nenhum Produto Encontrado</h4>
          <p>Tente ajustar seus filtros de busca ou clique em &quot;Limpar Tudo&quot;.</p>
        </Col>
      );
    }

    if (!hasProducts) {
      return (
        <Col className='text-center mt-5' xs='12'>
          <h4>Você ainda não tem produtos</h4>
          <p>Cadastre seu primeiro produto para começar a vender.</p>
          <Button color='primary' onClick={handleNewClick}>
            Adicionar Produto
          </Button>
        </Col>
      );
    }

    return null;
  };

  if (loading && products.length === 0) {
    return <ProductPageSkeleton />;
  }

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Row className='align-items-center mb-4'>
            <Col>
              <Breadcrumbs breadcrumbItem='Produtos' title='Catálogo' />
            </Col>
            <Col className='text-end'>
              <Button color='success' onClick={handleNewClick}>
                <i className='bx bx-plus me-1'></i> Novo Produto
              </Button>
            </Col>
          </Row>

          <ProductToolbar
            onManageCategories={toggleCategoryModal}
            onPrintLabels={toggleLabelPrintModal}
          />
          <ActiveFilters />

          <div className='d-flex justify-content-end mb-2'>
            <small className='text-muted'>
              Exibindo {filteredProducts.length} de {products.length} produtos
            </small>
          </div>

          <Row className='g-4'>
            {viewMode === 'grid' ? (
              filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Col key={product.id} lg={3} md={4} sm={6} xs={12}>
                    <ProductCard
                      product={product}
                      onDelete={handleDeleteClick}
                      onEdit={handleEditClick}
                      onQuickView={handleQuickViewClick}
                    />
                  </Col>
                ))
              ) : (
                renderEmptyState()
              )
            ) : (
              <Col xs='12'>
                <ProductTable
                  loading={loading}
                  products={filteredProducts}
                  selectedProducts={selectedProducts}
                  toggleProductSelection={toggleProductSelection}
                  onDelete={handleDeleteClick}
                  onEdit={handleEditClick}
                  onQuickView={handleQuickViewClick}
                />
              </Col>
            )}
          </Row>
        </Container>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        loading={isDeleting}
        message={`Tem certeza que deseja excluir o produto "${selectedProduct?.name}"? Esta ação não pode ser desfeita.`}
        title='Confirmar Exclusão'
        toggle={toggleDeleteModal}
        onConfirm={onDeleteConfirm}
      />

      <ConfirmationModal
        isOpen={bulkDeleteModalOpen}
        loading={isDeleting}
        message={`Tem certeza que deseja excluir os ${selectedProducts.size} produtos selecionados? Esta ação não pode ser desfeita.`}
        title='Confirmar Exclusão em Massa'
        toggle={toggleBulkDeleteModal}
        onConfirm={onBulkDeleteConfirm}
      />

      <ProductFormModal
        isOpen={modalOpen}
        product={selectedProduct}
        toggle={toggleModal}
        onSuccess={() => {
          toggleModal();
          reloadProducts();
        }}
      />

      <CategoryManagerModal isOpen={categoryModalOpen} toggle={toggleCategoryModal} />

      <QuickViewModal />

      <BulkActionsToolbar onBulkDelete={toggleBulkDeleteModal} />

      <LabelPrintModal
        isOpen={labelPrintModalOpen}
        selectedVariations={Array.from(selectedProducts)}
        toggle={toggleLabelPrintModal}
      />
    </React.Fragment>
  );
};

export default Products;
