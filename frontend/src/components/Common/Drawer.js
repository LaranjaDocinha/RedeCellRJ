import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
`;

const DrawerContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  max-width: 500px;
  background: var(--color-background);
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 1050;
  display: flex;
  flex-direction: column;
`;

const DrawerHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h5 {
    margin: 0;
    color: var(--color-heading);
  }

  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text);
  }
`;

const DrawerBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
`;

const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: '0%', transition: { type: 'tween', duration: 0.3 } },
  exit: { x: '100%', transition: { type: 'tween', duration: 0.25 } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const Drawer = ({ title, isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop
            animate='visible'
            exit='exit'
            initial='hidden'
            variants={backdropVariants}
            onClick={onClose}
          />
          <DrawerContainer animate='visible' exit='exit' initial='hidden' variants={drawerVariants}>
            <DrawerHeader>
              <h5>{title}</h5>
              <button onClick={onClose}>&times;</button>
            </DrawerHeader>
            <DrawerBody>{children}</DrawerBody>
          </DrawerContainer>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
