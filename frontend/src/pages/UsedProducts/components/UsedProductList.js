import React from 'react';
import PropTypes from 'prop-types';
import { Table, Spinner, Alert, Button } from 'reactstrap';
import { Edit, Trash2 } from 'react-feather';

// Local definition of formatCurrency (assuming it's not globally available yet)
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const UsedProductList = ({ usedProducts, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="text-center my-4">
        <Spinner className="me-2" /> Carregando produtos seminovos...
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="danger" className="my-4">
        Erro ao carregar produtos seminovos: {error.message || 'Erro desconhecido.'}
      </Alert>
    );
  }

  if (!usedProducts || usedProducts.length === 0) {
    return (
      <Alert color="info" className="my-4 text-center">
        Nenhum produto seminovo registrado ainda.
      </Alert>
    );
  }

  return (
    <div className="table-responsive">
      <Table className="table-hover table-striped mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Número de Série</th>
            <th>Condição</th>
            <th>Preço Aquisição</th>
            <th>Preço Venda</th>
            <th>Estoque</th>
            <th>Filial</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usedProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.product_name}</td>
              <td>{product.description}</td>
              <td>{product.category_id}</td> {/* Assuming category_id is displayed directly */}
              <td>{product.serial_number}</td>
              <td>{product.condition}</td>
              <td>{formatCurrency(product.acquisition_price)}</td>
              <td>{formatCurrency(product.sale_price)}</td>
              <td>{product.current_stock}</td>
              <td>{product.branch_id}</td> {/* Assuming branch_id is displayed directly */}
              <td>
                <Button size="sm" color="light" className="me-2" /* onClick={() => handleEdit(product)} */>
                  <Edit size={16} />
                </Button>
                <Button size="sm" color="light" /* onClick={() => handleDelete(product.id)} */>
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

UsedProductList.propTypes = {
  usedProducts: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
};

UsedProductList.defaultProps = {
  usedProducts: [],
  isLoading: false,
  error: null,
};

export default UsedProductList;
