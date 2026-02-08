import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid'; // For session ID
import DiagnosticNodeComponent from '../../components/Diagnostics/DiagnosticNode'; // Import DiagnosticNodeComponent
import { DiagnosticNode, DiagnosticNodeOption } from '../../types/diagnostic'; // Import types
import { Box, Typography, Breadcrumbs, Link, Button, CircularProgress, LinearProgress } from '@mui/material'; // Import MUI components
import { useNotification } from '../../contexts/NotificationContext'; // Import useNotification
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import FeedbackForm from '../../components/Diagnostics/FeedbackForm'; // Import FeedbackForm

import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTools, FaRedo } from 'react-icons/fa';

const DiagnosticWizard: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<DiagnosticNode[]>([]);
  // ... rest of state
  const [isFinished, setIsFinished] = useState(false);

  const { data: rootNodes, isLoading: isLoadingRootNodes, isError: isErrorRootNodes } = useQuery<DiagnosticNode[]>({
    queryKey: ['diagnosticRootNodes'],
    queryFn: async () => {
      const response = await axios.get<DiagnosticNode[]>('/api/v1/diagnostics/root');
      return response.data;
    },
    staleTime: Infinity,
  });

  const handleOptionClick = async (option: DiagnosticNodeOption) => {
    if (option.next_node_id) {
      axios.post('/api/v1/diagnostics/history', { sessionId, nodeId: currentNode?.id, selectedOptionId: option.id });
      const response = await axios.get<DiagnosticNode>(`/api/v1/diagnostics/${option.next_node_id}`);
      setHistory([...history, currentNode!]);
      setCurrentNode(response.data);
    } else {
      axios.post('/api/v1/diagnostics/history', { sessionId, nodeId: currentNode?.id, selectedOptionId: option.id });
      setIsFinished(true);
    }
  };

  const handleCreateOS = () => {
    const diagnosticSummary = history.map(h => h.question_text).join(' -> ');
    navigate('/service-orders/new', { 
        state: { 
            issue_description: `Diagnóstico: ${diagnosticSummary}`,
            suggested_solution: currentNode?.solution_details || 'Avaliação técnica necessária'
        } 
    });
  };

  const handleGoBack = async () => {
    if (history.length > 0) {
      const previousNode = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentNode(previousNode);
      // Optionally record history for going back
      axios.post('/api/diagnostics/history', { sessionId, nodeId: previousNode.id, action: 'go_back' });
    }
  };

  const handleGoBackToNode = (index: number) => {
    const newHistory = history.slice(0, index);
    setHistory(newHistory);
    setCurrentNode(newHistory[newHistory.length - 1] || rootNodes?.[0] || null);
    // Optionally record history for going back to a specific node
    axios.post('/api/diagnostics/history', { sessionId, nodeId: newHistory[newHistory.length - 1]?.id || rootNodes?.[0]?.id, action: 'go_back_to_node' });
  };

  if (isLoadingRootNodes) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading diagnostic wizard...</Typography>
      </Box>
    );
  }

  if (isErrorRootNodes) {
    addNotification('Error loading diagnostic wizard.', 'error');
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Error loading diagnostic wizard.</Typography>
        <Typography variant="body2">Please try again later.</Typography>
      </Box>
    );
  }

  const maxDepth = 5; // Assuming a max depth for the diagnostic tree for progress calculation
  const progress = (history.length / maxDepth) * 100;

  if (!rootNodes || rootNodes.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Nenhum nó de diagnóstico configurado.</Typography>
        <Typography variant="body2">Por favor, configure os nós de diagnóstico no backend.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">Diagnóstico Guiado</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setHistory([]);
            setCurrentNode(rootNodes?.[0] || null);
            // Optionally record history for restarting
            axios.post('/api/diagnostics/history', { sessionId, action: 'restart_diagnostic' });
          }}
        >
          Reiniciar Diagnóstico
        </Button>
      </Box>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />

      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#" onClick={() => { setHistory([]); setCurrentNode(rootNodes?.[0] || null); }}>
            Início
          </Link>
          {history.map((node, index) => (
            <Link color="inherit" href="#" key={node.id + index} onClick={() => handleGoBackToNode(index)}>
              {node.question_text}
            </Link>
          ))}
          {currentNode && (
            <Typography color="text.primary">{currentNode.question_text}</Typography>
          )}
        </Breadcrumbs>
      </Box>
      <hr />
      <AnimatePresence mode="wait">
        {isFinished ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px' }}>
                <FaCheckCircle size={80} color={theme.palette.success.main} style={{ marginBottom: '20px' }} />
                <Typography variant="h4" fontWeight={400} gutterBottom>Diagnóstico Concluído!</Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>O sistema identificou a provável causa e solução.</Typography>
                
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button variant="outlined" startIcon={<FaRedo />} onClick={() => { setIsFinished(false); setHistory([]); setCurrentNode(rootNodes?.[0] || null); }}>Reiniciar</Button>
                    <Button variant="contained" size="large" startIcon={<FaTools />} onClick={handleCreateOS} sx={{ px: 4, borderRadius: '12px' }}>Abrir Ordem de Serviço</Button>
                </Stack>
            </motion.div>
        ) : currentNode && (
          <motion.div
            key={currentNode.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DiagnosticNodeComponent
              node={currentNode}
              options={currentOptions}
              onOptionClick={handleOptionClick}
            />
            {history.length > 0 && (
              <Button variant="outlined" onClick={handleGoBack} aria-label="Voltar para a pergunta anterior">Voltar</Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default DiagnosticWizard;



