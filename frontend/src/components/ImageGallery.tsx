import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

export interface ImageGalleryProps {
  images: string[];
  selectedImage?: string; // Added selectedImage prop
}

const generateSrcSet = (url: string) => {
    // This is a mock implementation. In a real app, you'd have different sized images.
    // Here, we just append a width parameter for demonstration.
    return `https://place-hold.it/400x400?text=${encodeURIComponent(url)} 400w, https://place-hold.it/800x800?text=${encodeURIComponent(url)} 800w`;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, selectedImage: propSelectedImage }) => {
  const [currentImage, setCurrentImage] = useState(propSelectedImage || images[0]);

  useEffect(() => {
    setCurrentImage(propSelectedImage || images[0]);
  }, [propSelectedImage, images]);

  return (
    <Box>
      <Box sx={{ borderRadius: '16px', overflow: 'hidden', mb: 2, height: 400, position: 'relative' }}>
        <AnimatePresence initial={false}>
          <motion.img
            key={currentImage}
            src={currentImage} // Fallback src
            srcSet={generateSrcSet(currentImage)}
            sizes="(max-width: 600px) 400px, 800px"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
            loading="lazy"
          />
        </AnimatePresence>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {images.map((image, index) => (
          <Box
            key={index}
            onClick={() => setCurrentImage(image)}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: currentImage === image ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
              transition: 'border 0.2s ease-in-out',
            }}
          >
            <img src={image} alt={`thumbnail ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          </Box>
        ))}
      </Box>
    </Box>
  );
};