import React from 'react';
import { motion, Variants } from 'framer-motion';

export interface WithFormFeedbackProps {
  hasError?: boolean;
}

const shakeVariants: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

export function withFormFeedback<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithFeedback = (props: P & WithFormFeedbackProps) => {
    const { hasError, ...rest } = props;

    return (
      <motion.div
        variants={shakeVariants}
        animate={hasError ? 'animate' : 'initial'}
      >
        <WrappedComponent {...(rest as P)} />
      </motion.div>
    );
  };

  return ComponentWithFeedback;
}