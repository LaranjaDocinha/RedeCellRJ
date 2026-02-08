import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartToy, Send, Close, Minimize } from '@mui/icons-material';
import { IconButton, Paper, TextField, Box, Typography, alpha } from '@mui/material';
import api from '../services/api';

const ChatWrapper = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  right: 100px; // Ao lado do microfone
  width: 350px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MessageList = styled.div`
  flex: 1;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? props.theme.palette.primary.main : '#f0f0f0'};
  color: ${props => props.isUser ? 'white' : '#333'};
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
  font-size: 0.85rem;
`;

const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string, isUser: boolean }[]>([
    { text: 'Olá! Sou o assistente Redecell. Como posso te ajudar hoje?', isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { question: userMsg });
      setMessages(prev => [...prev, { text: res.data.answer, isUser: false }]);
    } catch (e) {
      setMessages(prev => [...prev, { text: 'Desculpe, tive um problema ao processar sua dúvida.', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton 
        onClick={() => setIsOpen(!isOpen)}
        sx={{ 
            position: 'fixed', bottom: 30, right: 100, 
            width: 60, height: 60, bgcolor: 'secondary.main', 
            color: 'white', '&:hover': { bgcolor: 'secondary.dark' },
            boxShadow: 3
        }}
      >
        <SmartToy />
      </IconButton>

      <AnimatePresence>
        {isOpen && (
          <ChatWrapper
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <Box sx={{ p: 2, bgcolor: 'secondary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Central de Ajuda IA</Typography>
                <IconButton size="small" color="inherit" onClick={() => setIsOpen(false)}><Close /></IconButton>
            </Box>

            <MessageList>
                {messages.map((m, i) => (
                    <MessageBubble key={i} isUser={m.isUser}>{m.text}</MessageBubble>
                ))}
                {loading && <Typography variant="caption" sx={{ fontStyle: 'italic', ml: 1 }}>Digitando...</Typography>}
            </MessageList>

            <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
                <TextField 
                    fullWidth size="small" placeholder="Sua dúvida..." 
                    value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <IconButton color="primary" onClick={handleSend} disabled={loading}><Send /></IconButton>
            </Box>
          </ChatWrapper>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatBot;
