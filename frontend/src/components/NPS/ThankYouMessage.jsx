import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from 'reactstrap';
import './ThankYouMessage.scss'; // Assuming a SCSS file for styling

const ThankYouMessage = ({ message, animationDelay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: animationDelay, duration: 0.5, type: 'spring', stiffness: 100, damping: 10 }}
      className="thank-you-message-wrapper"
    >
      <Card className="thank-you-card">
        <CardBody className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay + 0.3, duration: 0.5 }}
          >
            <i className="bx bx-check-circle thank-you-icon"></i>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay + 0.5, duration: 0.5 }}
            className="thank-you-title"
          >
            Obrigado!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationDelay + 0.7, duration: 0.5 }}
            className="thank-you-text"
          >
            {message}
          </motion.p>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ThankYouMessage;