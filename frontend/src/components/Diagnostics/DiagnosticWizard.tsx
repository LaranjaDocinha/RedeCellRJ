import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Stepper, Step, StepLabel, Fade } from '@mui/material';
import { CheckCircle, Build, Warning } from '@mui/icons-material';

const steps = [
  {
    id: 'screen',
    question: 'A tela exibe imagem corretamente?',
    options: [
      { label: 'Sim, perfeito', next: 'touch', issues: [] },
      { label: 'Não, está quebrada', next: 'touch', issues: ['Troca de Frontal'] },
      { label: 'Sem imagem (Tela preta)', next: 'charging', issues: ['Análise de Placa/Tela', 'Troca de Frontal'] }
    ]
  },
  {
    id: 'touch',
    question: 'O toque funciona em toda a tela?',
    options: [
      { label: 'Sim', next: 'charging', issues: [] },
      { label: 'Não / Falha parcial', next: 'charging', issues: ['Troca de Frontal (Touch Falhando)'] }
    ]
  },
  {
    id: 'charging',
    question: 'O aparelho carrega?',
    options: [
      { label: 'Sim', next: 'finish', issues: [] },
      { label: 'Não / Mal contato', next: 'finish', issues: ['Limpeza Conector', 'Troca Conector de Carga'] }
    ]
  }
];

interface DiagnosticWizardProps {
  onComplete: (issues: string[]) => void;
}

const DiagnosticWizard: React.FC<DiagnosticWizardProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [detectedIssues, setDetectedIssues] = useState<string[]>([]);

  const handleOptionClick = (option: any) => {
    const newIssues = [...detectedIssues, ...option.issues];
    setDetectedIssues(newIssues);

    if (option.next === 'finish' || currentStepIndex === steps.length - 1) {
      onComplete(Array.from(new Set(newIssues))); // Unique issues
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const currentStep = steps[currentStepIndex];

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Diagnóstico Guiado
      </Typography>
      
      <Stepper activeStep={currentStepIndex} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.id}>
            <StepLabel>{step.id}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Fade in key={currentStep.id}>
          <Box>
            <Typography variant="h4" align="center" gutterBottom>
              {currentStep.question}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
              {currentStep.options.map((opt, idx) => (
                <Button
                  key={idx}
                  variant="contained"
                  size="large"
                  onClick={() => handleOptionClick(opt)}
                  sx={{ 
                    minWidth: 150, 
                    py: 2, 
                    fontSize: '1.1rem',
                    bgcolor: opt.label.startsWith('Não') ? '#ef5350' : '#4caf50' 
                  }}
                  startIcon={opt.label.startsWith('Não') ? <Warning /> : <CheckCircle />}
                >
                  {opt.label}
                </Button>
              ))}
            </Box>
          </Box>
        </Fade>
      </Box>
    </Paper>
  );
};

export default DiagnosticWizard;
