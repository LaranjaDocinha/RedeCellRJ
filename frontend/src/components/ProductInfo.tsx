import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { RatingStars } from './RatingStars';
import { QuantitySelector } from './QuantitySelector';
import { Button } from './Button';
import { InstallmentCalculator } from './InstallmentCalculator';
import { Accordion } from './Accordion';
import { Product } from '../types/product'; // Import global Product interface

interface ProductInfoProps {
    product: Product;
    onChangeSelectedVariation: (imageUrl: string) => void; // Callback to update image in parent
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, onChangeSelectedVariation }) => {
    const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);

    useEffect(() => {
      // Reset selected variation when product changes
      setSelectedVariationIndex(0);
    }, [product]);

    const currentVariation = product.variations[selectedVariationIndex];

    useEffect(() => {
      if (currentVariation?.image_url) {
        onChangeSelectedVariation(currentVariation.image_url);
      }
    }, [currentVariation, onChangeSelectedVariation]);

    return (
        <Box>
            <Typography variant="h4" component="h1" fontWeight={400} gutterBottom>
                {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RatingStars value={product.rating || 0} readOnly /> {/* Assuming rating can be 0 */}
                <Typography sx={{ ml: 1 }} color="text.secondary">
                    ({product.reviews || 0} avaliações) {/* Assuming reviews can be 0 */}
                </Typography>
            </Box>

            <Typography variant="h3" component="p" fontWeight={400} sx={{ my: 2 }}>
                R$ {currentVariation?.price.toFixed(2) || product.price?.toFixed(2) || '0.00'}
            </Typography>

            {product.description && (
              <Typography variant="body1" color="text.secondary" paragraph>
                  {product.description}
              </Typography>
            )}

            {product.variations && product.variations.length > 1 && (
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Variações:</Typography>
                <RadioGroup
                  row
                  value={selectedVariationIndex}
                  onChange={(event) => setSelectedVariationIndex(parseInt(event.target.value, 10))}
                >
                  {product.variations.map((variation, index) => (
                    <FormControlLabel
                      key={index}
                      value={index}
                      control={<Radio size="small" />}
                      label={`Opção ${index + 1} (R$ ${variation.price.toFixed(2)})`}
                    />
                  ))}
                </RadioGroup>
              </Box>
            )}

            <InstallmentCalculator price={currentVariation?.price || product.price || 0} />

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <QuantitySelector max={product.stock || 999} onChange={(q) => console.log(`Quantity: ${q}`)} /> {/* Assuming stock can be 0 or undefined */}
                <Button label="Adicionar ao Carrinho" onClick={() => {}} color="primary" size="large" />
            </Box>

            <Box sx={{ mt: 4 }}>
                <Accordion title="Especificações Técnicas">
                    <Typography variant="body2">...</Typography>
                </Accordion>
                <Accordion title="Dimensões e Peso">
                    <Typography variant="body2">...</Typography>
                </Accordion>
            </Box>
        </Box>
    );
}

