import React from "react";
import { Table, Button, Badge, Input } from "reactstrap";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductTable = ({
  products,
  handleEditClick,
  handleDeleteProduct,
  loading,
  error,
  handleSort,
  sortColumn,
  sortDirection,
  selectedRows,
  setSelectedRows
}) => {

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allVariationIds = products.flatMap(p => p.variations.map(v => v.id));
      setSelectedRows(new Set(allVariationIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (variationId) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(variationId)) {
      newSelectedRows.delete(variationId);
    } else {
      newSelectedRows.add(variationId);
    }
    setSelectedRows(newSelectedRows);
  };

  if (loading) {
    return (
      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <div className="table-responsive">
          <Table className="table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th><Skeleton width={20} /></th>
                <th><Skeleton width={50} /></th>
                <th><Skeleton width={150} /></th>
                <th><Skeleton width={80} /></th>
                <th><Skeleton width={80} /></th>
                <th><Skeleton width={80} /></th>
                <th><Skeleton width={80} /></th>
                <th className="text-center"><Skeleton width={100} /></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><Skeleton width={20} /></td>
                  <td><Skeleton circle width={50} height={50} /></td>
                  <td><Skeleton count={2} /></td>
                  <td><Skeleton width={60} /></td>
                  <td><Skeleton width={70} /></td>
                  <td><Skeleton width={50} /></td>
                  <td><Skeleton width={60} /></td>
                  <td className="text-center"><Skeleton width={80} height={30} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </SkeletonTheme>
    );
  }

  if (error) {
    return <p className="text-danger">Erro ao carregar produtos: {error.message || error}</p>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center p-4">
        <i className="bx bx-box fa-3x text-muted mb-3"></i>
        <p className="text-muted">Nenhum produto encontrado.</p>
      </div>
    );
  }

  const allVariationIdsOnPage = products.flatMap(p => p.variations.map(v => v.id));
  const isAllSelected = allVariationIdsOnPage.length > 0 && allVariationIdsOnPage.every(id => selectedRows.has(id));

  const renderSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <i className="bx bx-sort-up ms-1"></i> : <i className="bx bx-sort-down ms-1"></i>;
    }
    return <i className="bx bx-sort text-muted ms-1"></i>;
  };

  return (
    <div className="table-responsive">
      <Table className="table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: '50px' }}>
              <Input
                type="checkbox"
                onChange={handleSelectAll}
                checked={isAllSelected}
                title="Selecionar todos nesta página"
              />
            </th>
            <th>Imagem</th>
            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Nome do Produto {renderSortIcon('name')}</th>
            <th>Cor</th>
            <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>Preço {renderSortIcon('price')}</th>
            <th onClick={() => handleSort('stock_quantity')} style={{ cursor: 'pointer' }}>Estoque {renderSortIcon('stock_quantity')}</th>
            <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status {renderSortIcon('status')}</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            product.variations && product.variations.map((variation, index) => (
              <tr key={`${product.id}-${variation.id}`} className={selectedRows.has(variation.id) ? 'table-active' : ''}>
                <td>
                  <Input
                    type="checkbox"
                    checked={selectedRows.has(variation.id)}
                    onChange={() => handleSelectRow(variation.id)}
                  />
                </td>
                <td>
                  <img
                    src={variation.image_url || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
                    alt={`${product.name} ${variation.color}`}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#f0f0f0' }}
                  />
                </td>
                <td>
                  <strong>{product.name}</strong>
                  {index === 0 && <p className="text-muted mb-0 small">{product.description?.replace(/<[^>]+>/g, '').substring(0, 50)}...</p>}
                </td>
                <td>{variation.color}</td>
                <td>R$ {parseFloat(variation.price).toFixed(2)}</td>
                <td>{variation.stock_quantity}</td>
                <td>
                  <Badge color={
                    variation.status === 'active' ? 'success' :
                    variation.status === 'out_of_stock' ? 'danger' :
                    'secondary'
                  } pill>
                    {variation.status}
                  </Badge>
                </td>
                <td className="text-center">
                  <Button color="info" size="sm" className="me-2" onClick={() => handleEditClick(product)}>
                    <i className="bx bx-pencil"></i>
                  </Button>
                  <Button color="danger" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                    <i className="bx bx-trash"></i>
                  </Button>
                </td>
              </tr>
            ))
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProductTable;