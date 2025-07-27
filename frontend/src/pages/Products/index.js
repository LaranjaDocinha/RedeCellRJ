import React, { useState, useContext } from 'react';
import { Container, Button, Row, Col } from 'reactstrap';
import toast from 'react-hot-toast';

import { ProductContext } from '../../context/ProductContext';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import ProductCard from './components/ProductCard';
import ProductListItem from './components/ProductListItem';
import ProductFormModal from './components/ProductFormModal';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import ProductPageSkeleton from './components/ProductPageSkeleton';
import ProductToolbar from './components/ProductToolbar';
import QuickViewModal from './components/QuickViewModal';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import CategoryManagerModal from './components/CategoryManagerModal';
import useApi from '../../hooks/useApi';
import { del } from '../../helpers/api_helper';

import ActiveFilters from './components/ActiveFilters';

const Products = () => {
  document.title = "Produtos | PDV Web";

  const { 
    filteredProducts, 
    loading, 
    reloadProducts, 
    products, 
    ui,
    selection,
    setQuickViewProduct 
  } = useContext(ProductContext);
  const { viewMode } = ui;
  const { selectedProducts, deleteSelected } = selection;

  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { request: deleteProductApi, loading: isDeleting } = useApi(del);

  const toggleModal = () => setModalOpen(!modalOpen);
  const toggleCategoryModal = () => setCategoryModalOpen(!categoryModalOpen);
  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);
  const toggleBulkDeleteModal = () => setBulkDeleteModalOpen(!bulkDeleteModalOpen);

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
        toast.success("Produto excluído com sucesso!");
        toggleDeleteModal();
        reloadProducts();
      })
      .catch(() => {
        toast.error("Falha ao excluir o produto.");
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
        <Col xs="12" className="text-center mt-5">
          <h4>Nenhum Produto Encontrado</h4>
          <p>Tente ajustar seus filtros de busca ou clique em "Limpar Tudo".</p>
        </Col>
      );
    }

    if (!hasProducts) {
      return (
        <Col xs="12" className="text-center mt-5">
          <h4>Você ainda não tem produtos</h4>
          <p>Cadastre seu primeiro produto para começar a vender.</p>
          <Button color="primary" onClick={handleNewClick}>
            Adicionar Produto
          </Button>
        </Col>
      );
    }

    return null;
  };

  if (loading) {
    return <ProductPageSkeleton />;
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="align-items-center mb-4">
            <Col>
              <Breadcrumbs title="Catálogo" breadcrumbItem="Produtos" />
            </Col>
            <Col className="text-end">
              <Button color="success" onClick={handleNewClick}>
                <i className="bx bx-plus me-1"></i> Novo Produto
              </Button>
            </Col>
          </Row>

          <ProductToolbar onManageCategories={toggleCategoryModal} />
          <ActiveFilters />

          <div className="d-flex justify-content-end mb-2">
            <small className="text-muted">
              Exibindo {filteredProducts.length} de {products.length} produtos
            </small>
          </div>
          
          <Row className="g-4">
            {filteredProducts.length > 0
              ? filteredProducts.map(product =>
                  viewMode === 'grid' ? (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      onQuickView={handleQuickViewClick}
                    />
                  ) : (
                    <Col xs="12" key={product.id}>
                      <ProductListItem
                        product={product}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onQuickView={handleQuickViewClick}
                      />
                    </Col>
                  )
                )
              : renderEmptyState()}
          </Row>
        </Container>
      </div>
      
      <ConfirmationModal
        isOpen={deleteModalOpen}
        toggle={toggleDeleteModal}
        onConfirm={onDeleteConfirm}
        loading={isDeleting}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o produto "${selectedProduct?.name}"? Esta ação não pode ser desfeita.`}
      />

      <ConfirmationModal
        isOpen={bulkDeleteModalOpen}
        toggle={toggleBulkDeleteModal}
        onConfirm={onBulkDeleteConfirm}
        loading={isDeleting}
        title="Confirmar Exclusão em Massa"
        message={`Tem certeza que deseja excluir os ${selectedProducts.size} produtos selecionados? Esta ação não pode ser desfeita.`}
      />

      <ProductFormModal
        isOpen={modalOpen}
        toggle={toggleModal}
        product={selectedProduct}
        onSuccess={() => {
          toggleModal();
          reloadProducts();
        }}
      />
      
      <CategoryManagerModal 
        isOpen={categoryModalOpen}
        toggle={toggleCategoryModal}
      />

      <QuickViewModal />

      <BulkActionsToolbar onBulkDelete={toggleBulkDeleteModal} />
    </React.Fragment>
  );
};

export default Products;
