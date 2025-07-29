import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './Timeline.scss';

const Timeline = ({ items }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      animate='visible'
      className='timeline-container'
      initial='hidden'
      variants={containerVariants}
    >
      {items.map((item, index) => (
        <motion.div key={index} className='timeline-item' variants={itemVariants}>
          <div className='timeline-marker'>
            <div className='timeline-icon'>
              <i className={`bx ${item.icon || 'bxs-circle'}`}></i>
            </div>
          </div>
          <div className='timeline-content'>
            <h5 className='timeline-title'>{item.title}</h5>
            <p className='timeline-description text-muted'>{item.description}</p>
            {item.timestamp && <small className='timeline-timestamp'>{item.timestamp}</small>}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

Timeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      timestamp: PropTypes.string,
      icon: PropTypes.string,
    }),
  ).isRequired,
};

export default Timeline;
