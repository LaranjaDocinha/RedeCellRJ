import { motion } from 'framer-motion';
import { Row } from 'reactstrap'; // Import Row from reactstrap

import EmptyState from '../../Common/EmptyState'; // Usando o componente de estado vazio

import ProductCard from './ProductCard'; // Importando o componente padronizado
import ProductPageSkeleton from './ProductPageSkeleton'; // Usando o skeleton correto

const ProductGrid = ({ products, onEdit, onDelete, onQuickView, loading, error }) => {
  if (loading) {
    // O ProductPageSkeleton já tem um grid de skeletons, então não precisamos de um loop aqui.
    return <ProductPageSkeleton view='grid' />;
  }

  if (error) {
    return <EmptyState icon='bx-error-circle' message={`Erro ao carregar produtos: ${error}`} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState icon='bx-box' message='Nenhum produto encontrado com os filtros aplicados.' />
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Atraso entre a animação de cada card
      },
    },
  };

  return (
    <motion.div
      animate='visible'
      as={Row}
      className='row' // A `Row` do reactstrap renderiza uma div com a classe row
      initial='hidden'
      variants={containerVariants}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onDelete={onDelete}
          onEdit={onEdit}
          onQuickView={onQuickView}
        />
      ))}
    </motion.div>
  );
};

export default ProductGrid;
