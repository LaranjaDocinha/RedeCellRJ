import React from 'react';
import { Dialog, Box, IconButton, useTheme, alpha } from '@mui/material';
import { FiX, FiZoomIn, FiZoomOut, FiMaximize } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  src: string;
  open: boolean;
  onClose: () => void;
  alt?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, open, onClose, alt }) => {
  const theme = useTheme();

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: alpha('#000', 0.9),
          backgroundImage: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10, display: 'flex', gap: 2 }}>
          <IconButton onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <FiX size={24} />
          </IconButton>
      </Box>

      <AnimatePresence>
        {open && (
          <motion.img
            src={src}
            alt={alt || 'Visualização'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ 
                maxWidth: '95vw', 
                maxHeight: '95vh', 
                objectFit: 'contain',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                borderRadius: '8px'
            }}
          />
        )}
      </AnimatePresence>

      <Box sx={{ position: 'absolute', bottom: 40, display: 'flex', gap: 3, bgcolor: 'rgba(0,0,0,0.5)', p: 2, borderRadius: 10, backdropFilter: 'blur(10px)' }}>
          <IconButton sx={{ color: 'white' }}><FiZoomOut /></IconButton>
          <IconButton sx={{ color: 'white' }}><FiMaximize /></IconButton>
          <IconButton sx={{ color: 'white' }}><FiZoomIn /></IconButton>
      </Box>
    </Dialog>
  );
};
