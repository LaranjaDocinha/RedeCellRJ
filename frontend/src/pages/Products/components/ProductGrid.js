import React from "react";
import { Row, Col, Card, CardImg, CardBody, CardTitle, CardText, Button, Badge } from "reactstrap";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Importar o CSS do skeleton

const ProductGrid = ({ products, handleEditClick, handleDeleteProduct, loading, error }) => {
  if (loading) {
    return (
      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <Row>
          {[...Array(4)].map((_, i) => (
            <Col key={i} xl="3" lg="4" md="6" sm="12" className="mb-4">
              <Card className="h-100">
                <Skeleton height={200} /> {/* Imagem */}
                <CardBody className="d-flex flex-column">
                  <CardTitle tag="h5" className="text-truncate">
                    <Skeleton width="80%" /> {/* Título */}
                  </CardTitle>
                  <CardText className="text-muted mb-2 flex-grow-1" style={{ minHeight: '40px' }}>
                    <Skeleton count={2} /> {/* Descrição */}
                  </CardText>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0"><Skeleton width={70} /></h5> {/* Preço */}
                    <Skeleton width={50} /> {/* Badge de status */}
                  </div>
                  <div className="d-flex justify-content-between">
                    <Skeleton width={60} height={30} /> {/* Botão Editar */}
                    <Skeleton width={60} height={30} /> {/* Botão Excluir */}
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </SkeletonTheme>
    );
  }

  if (error) {
    return <p className="text-danger">Erro ao carregar produtos: {error}</p>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center p-4">
        <i className="bx bx-box fa-3x text-muted mb-3"></i>
        <p className="text-muted">Nenhum produto encontrado com os filtros aplicados.</p>
      </div>
    );
  }

  return (
    <Row>
      {products.filter(product => product && typeof product === 'object' && product.id !== undefined && product.id !== null).map((product) => (
        <Col key={product.id} xl="3" lg="4" md="6" sm="12" className="mb-4">
          <Card className="h-100">
            <CardImg top src={product.image_url || 'https://via.placeholder.com/200'} alt={product.name} style={{ height: '200px', objectFit: 'cover' }} />
            <CardBody className="d-flex flex-column">
              <CardTitle tag="h5" className="text-truncate">{product.name}</CardTitle>
              <CardText className="text-muted mb-2 flex-grow-1" style={{ minHeight: '40px' }}>
                {product.description ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 70) + (product.description.length > 70 ? '...' : '') : 'Sem descrição'}
              </CardText>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">R$ {parseFloat(product.price).toFixed(2)}</h5>
                {
                  product.status === 'active' && <Badge color="success">Ativo</Badge>
                }
                {
                  product.status === 'inactive' && <Badge color="warning">Inativo</Badge>
                }
                {
                  product.status === 'draft' && <Badge color="info">Rascunho</Badge>
                }
                {
                  product.status === 'out_of_stock' && <Badge color="danger">Esgotado</Badge>
                }
              </div>
              <div className="d-flex justify-content-between">
                <Button color="info" size="sm" onClick={() => handleEditClick(product)}>Editar</Button>
                <Button color="danger" size="sm" onClick={() => handleDeleteProduct(product.id)}>Excluir</Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;