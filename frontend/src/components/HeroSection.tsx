import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Box, Typography } from '@mui/material';

export interface HeroSectionProps {
  imageUrl: string;
  title: string;
  subtitle: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ imageUrl, title, subtitle }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <Box
      ref={ref}
      sx={{
        height: '80vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        style={{ y, position: 'absolute', top: 0, left: 0, width: '100%', height: '150%', backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <Box sx={{ textAlign: 'center', color: 'white', zIndex: 1 }}>
        <Typography variant="h2" component="h1" fontWeight="bold" sx={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
          {title}
        </Typography>
        <Typography variant="h5" component="p" sx={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};