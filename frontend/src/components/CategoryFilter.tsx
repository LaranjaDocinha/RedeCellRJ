import React, { useState } from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export interface Category {
  id: string;
  name: string;
  count?: number;
}

export interface CategoryFilterProps {
  categories: Category[];
  onFilterChange: (selectedCategoryId: string | null) => void;
  title?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  onFilterChange,
  title = "Categorias",
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (categoryId: string) => {
    const newSelectedId = selectedId === categoryId ? null : categoryId;
    setSelectedId(newSelectedId);
    onFilterChange(newSelectedId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const chipVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{title}</Typography>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
      >
        {categories.map((category) => (
          <motion.div key={category.id} variants={chipVariants}>
            <Chip
              label={`${category.name} (${category.count ?? 0})`}
              onClick={() => handleSelect(category.id)}
              variant={selectedId === category.id ? 'filled' : 'outlined'}
              color={selectedId === category.id ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
              disabled={category.count === 0}
            />
          </motion.div>
        ))}
      </motion.div>
    </Stack>
  );
};
