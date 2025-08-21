import React from 'react';
import { Card, CardBody, CardTitle, CardText } from 'reactstrap';
import { motion } from 'framer-motion';
import './ABCSummary.scss'; // Assuming a SCSS file for styling

const ABCSummary = ({ title, value, iconClass, animationDelay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className="abc-summary-card-wrapper"
    >
      <Card className="abc-summary-card">
        <CardBody>
          <div className="d-flex align-items-center">
            <div className="icon-wrapper me-3">
              <i className={`bx ${iconClass}`}></i>
            </div>
            <div>
              <CardTitle tag="h5" className="mb-0">{title}</CardTitle>
              <CardText className="display-6 fw-bold">{value}</CardText>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ABCSummary;