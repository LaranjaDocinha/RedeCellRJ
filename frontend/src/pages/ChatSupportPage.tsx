import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const ChatSupportPage: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState('1'); // Placeholder for logged-in customer ID

  const { token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartChat = async () => {
    if (!token || !customerId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerId: parseInt(customerId, 10) }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages([{ sender: 'System', message: data.message, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.error('Error starting chat session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!token || !sessionId || !newMessage.trim()) return;
    setLoading(true);
    try {
      setMessages(prev => [...prev, { sender: 'You', message: newMessage, timestamp: new Date().toISOString() }]);
      await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId, message: newMessage }),
      });
      setNewMessage('');
      // Simulate agent response
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'Agent', message: 'Recebi sua mensagem. Um momento, por favor.', timestamp: new Date().toISOString() }]);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Chat de Suporte em Tempo Real</Typography>

      <Paper sx={{ p: 2, mb: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index} sx={{ justifyContent: msg.sender === 'You' ? 'flex-end' : 'flex-start' }}>
                <Paper sx={{ p: 1, backgroundColor: msg.sender === 'You' ? '#e0f7fa' : '#f0f0f0' }}>
                  <ListItemText
                    primary={msg.message}
                    secondary={`${msg.sender} - ${moment(msg.timestamp).format('HH:mm')}`}
                  />
                </Paper>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>
        <Box display="flex">
          {!sessionId ? (
            <>
              <TextField
                fullWidth
                label="ID do Cliente (Simulado)"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                sx={{ mr: 1 }}
              />
              <Button variant="contained" onClick={handleStartChat} disabled={loading}>Iniciar Chat</Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Sua Mensagem"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                sx={{ mr: 1 }}
                disabled={loading}
              />
              <Button variant="contained" onClick={handleSendMessage} disabled={loading}>Enviar</Button>
            </>
          )}
        </Box>
      </Paper>

      {loading && <CircularProgress />}
    </Box>
  );
};

export default ChatSupportPage;
