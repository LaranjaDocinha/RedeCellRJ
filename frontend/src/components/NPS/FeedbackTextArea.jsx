import React from 'react';
import { Input } from 'reactstrap';
import { motion } from 'framer-motion';
import './FeedbackTextArea.scss'; // Assuming a SCSS file for styling

const FeedbackTextArea = ({ value, onChange, placeholder, animationDelay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className="feedback-text-area-wrapper"
    >
      <Input
        type="textarea"
        name="feedback"
        id="feedback"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows="5"
        className="feedback-text-area"
      />
    </motion.div>
  );
};

export default FeedbackTextArea;