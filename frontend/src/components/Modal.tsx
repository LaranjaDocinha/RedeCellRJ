import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: "-50%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { y: "50%", opacity: 0 },
};

const MotionDivWithProps = React.forwardRef((props: any, ref) => {
  const { transitionDuration, ...rest } = props;
  return <motion.div ref={ref} {...rest} />;
});

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          PaperComponent={MotionDivWithProps}
          PaperProps={{
            variants: modalVariants,
            initial: "hidden",
            animate: "visible",
            exit: "exit",
            sx: { borderRadius: 3 }
          }}
          BackdropComponent={MotionDivWithProps}
          BackdropProps={{
            variants: backdropVariants,
            initial: "hidden",
            animate: "visible",
            exit: "hidden",
            style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          }}
        >
          {title && (
            <DialogTitle>
              {title}
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
          )}
          <DialogContent>{children}</DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default Modal;
