import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Box, Button, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

export interface StepContent {
  label: string;
  content: React.ReactNode;
}

export interface AnimatedStepperProps {
  steps: StepContent[];
}

export const AnimatedStepper: React.FC<AnimatedStepperProps> = ({ steps }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    setDirection(1);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setActiveStep((prev) => prev - 1);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
        >
          {steps[activeStep].content}
        </motion.div>
      </AnimatePresence>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
          Voltar
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          <Button onClick={() => alert('Finalizado!')} variant="contained">
            Finalizar
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained">
            Próximo
          </Button>
        )}
      </Box>
    </Box>
  );
};