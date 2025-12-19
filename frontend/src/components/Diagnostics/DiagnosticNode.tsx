import React from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { DiagnosticNode, DiagnosticNodeOption } from '../../types/diagnostic'; // Assuming types are defined here
import { useTranslation } from 'react-i18next';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'; // For questions
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // For solutions

interface DiagnosticNodeProps {
  node: DiagnosticNode;
  options: DiagnosticNodeOption[];
  onOptionClick: (option: DiagnosticNodeOption) => void;
}

const DiagnosticNodeComponent: React.FC<DiagnosticNodeProps> = ({ node, options, onOptionClick }) => {
  const { t } = useTranslation();

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      {node.is_solution ? (
        <Box>
          <Typography variant="h5" component="h3" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlineIcon sx={{ mr: 1 }} /> {t('solution_title')}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {node.solution_details}
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="h5" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <QuestionAnswerIcon sx={{ mr: 1 }} /> {node.question_text}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {options.map((option) => (
              <Button
                key={option.id}
                variant="contained"
                onClick={() => onOptionClick(option)}
                sx={{ py: 1.5 }}
              >
                {option.option_text}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default DiagnosticNodeComponent;
