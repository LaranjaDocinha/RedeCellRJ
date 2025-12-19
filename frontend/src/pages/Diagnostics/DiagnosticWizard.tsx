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

const DiagnosticWizard: React.FC = () => {
  const [history, setHistory] = useState<DiagnosticNode[]>([]);
  const [currentNode, setCurrentNode] = useState<DiagnosticNode | null>(null);
  const [currentOptions, setCurrentOptions] = useState<DiagnosticNodeOption[]>([]);
  const [sessionId] = useState(uuidv4()); // Unique session ID for history tracking
  const { addNotification } = useNotification(); // Initialize useNotification

  const { data: rootNodes, isLoading: isLoadingRootNodes, isError: isErrorRootNodes } = useQuery<DiagnosticNode[]>({
    queryKey: ['diagnosticRootNodes'],
    queryFn: async () => {
      const response = await axios.get<DiagnosticNode[]>('/api/diagnostics/root');
      return response.data;
    },
    staleTime: Infinity, // Root nodes don't change often
  });

  useEffect(() => {
    if (rootNodes && rootNodes.length > 0 && !currentNode) {
      // Start with the first root node if available
      setCurrentNode(rootNodes[0]);
      // Record history for the initial node
      axios.post('/api/diagnostics/history', { sessionId, nodeId: rootNodes[0].id });
    }
  }, [rootNodes, currentNode, sessionId]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (currentNode) {
        const response = await axios.get<DiagnosticNodeOption[]>(`/api/diagnostics/${currentNode.id}/options`);
        setCurrentOptions(response.data);
      }
    };
    fetchOptions();
  }, [currentNode]);

  const handleOptionClick = async (option: DiagnosticNodeOption) => {
    if (option.next_node_id) {
      // Record history for the selected option
      axios.post('/api/diagnostics/history', { sessionId, nodeId: currentNode?.id, selectedOptionId: option.id });

      // Fetch the next node
      const response = await axios.get<DiagnosticNode>(`/api/diagnostics/${option.next_node_id}`);
      const nextNode = response.data;

      setHistory([...history, currentNode!]); // Add current node to history
      setCurrentNode(nextNode);
    } else {
      // This option leads to a solution or end of path
      axios.post('/api/diagnostics/history', { sessionId, nodeId: currentNode?.id, selectedOptionId: option.id });
      // If the current node is a solution, display it
      // Otherwise, this option might lead to a solution node that needs to be fetched
    }
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
        {currentNode && (
          <motion.div
            key={currentNode.id} // Key is important for AnimatePresence to detect changes
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


