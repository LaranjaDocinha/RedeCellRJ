import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { TopbarBtn } from './Topbar.styled'; // Re-using the button style
import { motion } from 'framer-motion';

const iconAnimation = {
  whileHover: { scale: 1.2 },
  whileTap: { scale: 0.9 },
};

interface SearchButtonProps {
  onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <TopbarBtn onClick={onClick} aria-label="Abrir busca">
      <motion.div {...iconAnimation}>
        <FaSearch />
      </motion.div>
    </TopbarBtn>
  );
};

export default SearchButton;
