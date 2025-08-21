import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './NPSScoreSelector.scss'; // Assuming a SCSS file for styling

const NPSScoreSelector = ({ onSelectScore, selectedScore }) => {
  const scores = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

  return (
    <div className="nps-score-selector">
      <p className="nps-question">Qual a probabilidade de você recomendar nossa empresa a um amigo ou colega?</p>
      <div className="score-buttons">
        {scores.map((score) => (
          <motion.button
            key={score}
            className={`score-button ${selectedScore === score ? 'selected' : ''}`}
            onClick={() => onSelectScore(score)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: score * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
          >
            {score}
          </motion.button>
        ))}
      </div>
      <div className="score-labels">
        <span>Nada provável</span>
        <span>Muito provável</span>
      </div>
    </div>
  );
};

export default NPSScoreSelector;