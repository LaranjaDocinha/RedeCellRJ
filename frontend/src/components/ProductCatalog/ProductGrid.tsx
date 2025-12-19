// frontend/src/components/ProductCatalog/ProductGrid.tsx
import React from 'react';
import * as ReactWindow from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Part } from '../../types/part';
import ProductCard from './ProductCard';
import { Skeleton } from '@mui/material';

const FixedSizeGrid = ReactWindow.FixedSizeGrid;

interface ProductGridProps {
  products: Part[];
  onProductClick?: (product: Part) => void;
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick, isLoading }) => {
  const columnCount = 4; // Adjust based on layout or make it dynamic
  const rowHeight = 320; // Height of ProductCard + gap

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnCount}, 1fr)`, gap: '20px', padding: '20px' }}>
        {Array.from(new Array(8)).map((_, index) => (
          <div key={index}>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}> {/* Container with defined height */}
      <AutoSizer>
        {({ height, width }) => {
          const dynamicColumnCount = Math.floor(width / 270) || 1; // 270px min width (250 + 20 gap)
          const columnWidth = width / dynamicColumnCount;
          const rowCount = Math.ceil(products.length / dynamicColumnCount);

          const Cell = ({ columnIndex, rowIndex, style }: any) => {
            const index = rowIndex * dynamicColumnCount + columnIndex;
            if (index >= products.length) return null;

            const product = products[index];

            return (
              <div style={{ ...style, padding: '10px' }}> {/* Add padding to simulate gap */}
                <ProductCard product={product} onProductClick={onProductClick} />
              </div>
            );
          };

          return (
            <FixedSizeGrid
              columnCount={dynamicColumnCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={rowHeight}
              width={width}
            >
              {Cell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default ProductGrid;
