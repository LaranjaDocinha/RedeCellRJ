import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export interface FavoriteButtonProps {
  isFavorited?: boolean;
  onToggle: (isFavorited: boolean) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ isFavorited = false, onToggle }) => {
  const [favorited, setFavorited] = useState(isFavorited);

  const handleClick = () => {
    const newFavorited = !favorited;
    setFavorited(newFavorited);
    onToggle(newFavorited);
  };

  const variants = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.3, 1], transition: { duration: 0.3 } },
  };

  return (
    <IconButton onClick={handleClick}>
        <motion.div variants={variants} animate={favorited ? 'animate' : 'initial'}>
            {favorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </motion.div>
    </IconButton>
  );
};