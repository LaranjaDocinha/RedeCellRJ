import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Badge, Input } from 'reactstrap';

import AdvancedTable from '../../../components/Common/AdvancedTable';
import placeholderImage from '../../../assets/images/placeholder.svg';

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  onQuickView,
  loading,
  selectedProducts,
  toggleProductSelection,
}) => {
  const columns = useMemo(
    () => [
      {
        id: 'selection',
        header: ({ table }) => (
          <Input
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            type='checkbox'
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Input
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            type='checkbox'
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: 'mainImage',
        header: 'Imagem',
        cell: ({ row }) => {
          const { name, variations } = row.original;
          const mainImage = variations.find((v) => v.image_url)?.image_url || placeholderImage;
          return <img alt={name} className='avatar-sm rounded' src={mainImage} />;
        },
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Nome',
      },
      {
        accessorKey: 'category.name',
        header: 'Categoria',
        cell: (info) => info.getValue() || 'N/A',
      },
      {
        accessorKey: 'priceRange',
        header: 'Preço',
        cell: ({ row }) => {
          const { variations = [] } = row.original;
          if (variations.length === 0) return 'R$ 0,00';
          if (variations.length === 1) return `R$ ${variations[0].price.toFixed(2)}`;
          const prices = variations.map((v) => v.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return min === max ? `R$ ${min.toFixed(2)}` : `R$ ${min.toFixed(2)} - ${max.toFixed(2)}`;
        },
      },
      {
        accessorKey: 'totalStock',
        header: 'Estoque Total',
        cell: ({ row }) => {
          const totalStock = row.original.variations.reduce(
            (acc, v) => acc + (v.stock_quantity || 0),
            0,
          );
          return (
            <Badge pill color={totalStock > 0 ? 'success' : 'danger'}>
              {totalStock}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <div className='d-flex gap-2'>
            <Button color='light' size='sm' onClick={() => onQuickView(row.original)}>
              <i className='bx bx-search-alt'></i>
            </Button>
            <Button color='primary' size='sm' onClick={() => onEdit(row.original)}>
              <i className='bx bx-pencil'></i>
            </Button>
            <Button color='danger' size='sm' onClick={() => onDelete(row.original)}>
              <i className='bx bx-trash'></i>
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete, onQuickView],
  );

  // Mapeia o estado de seleção para o formato que a tabela espera
  const rowSelection = useMemo(() => {
    const selection = {};
    products.forEach((p, index) => {
      if (selectedProducts.has(p.id)) {
        selection[index] = true;
      }
    });
    return selection;
  }, [selectedProducts, products]);

  // Função para lidar com a mudança de seleção
  const onRowSelectionChange = (updater) => {
    const newSelectedRowIndexes = updater(rowSelection);
    const newSelectedProductIds = new Set();
    Object.keys(newSelectedRowIndexes).forEach((index) => {
      if (newSelectedRowIndexes[index]) {
        newSelectedProductIds.add(products[parseInt(index, 10)].id);
      }
    });

    // Para fazer a seleção funcionar, precisaríamos de uma função do contexto
    // que aceite um Set de IDs. Por enquanto, vamos logar.
    // console.log("Novos IDs selecionados:", newSelectedProductIds);
    // Idealmente: selection.setMany(newSelectedProductIds);
  };

  return (
    <AdvancedTable
      columns={columns}
      data={products}
      emptyStateActionText={'Adicionar Produto'}
      emptyStateIcon={''}
      emptyStateMessage={'Cadastre seu primeiro produto para começar a vender.'}
      emptyStateTitle={'Nenhum produto encontrado'}
      loading={loading}
      persistenceKey='productsTable'
      onEmptyStateActionClick={() => {
        /* Implementar ação de adicionar produto */
      }}
      onRowClick={onQuickView}
    />
  );
};

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onQuickView: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  selectedProducts: PropTypes.instanceOf(Set).isRequired,
  toggleProductSelection: PropTypes.func.isRequired,
};

export default ProductTable;
