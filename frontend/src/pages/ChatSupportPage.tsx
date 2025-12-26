import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Avatar, 
  IconButton, 
  Divider, 
  Badge, 
  Chip,
  InputBase,
  useTheme,
  ListItemButton,
  ListItemIcon
} from '@mui/material';
import { 
  Send as SendIcon, 
  AttachFile as AttachIcon, 
  MoreVert as MoreIcon, 
  Search as SearchIcon,
  FiberManualRecord as OnlineIcon,
  History as HistoryIcon,
  SupportAgent as AgentIcon,
  Person as PersonIcon,
  WhatsApp as WhatsAppIcon,
  ChatBubbleOutline as ChatIcon,
  ArrowBackIosNew as BackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const ChatSupportPage: React.FC = () => {
  const theme = useTheme();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(1);

  const { token, user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chats = [
    { id: 1, name: 'Maria Silva', lastMsg: 'Obrigada pela ajuda!', time: '14:30', unread: 0, status: 'online', type: 'system' },
    { id: 2, name: 'João Pereira', lastMsg: 'Meu pedido ainda não chegou.', time: '12:15', unread: 2, status: 'offline', type: 'whatsapp' },
    { id: 3, name: 'Assistência Técnica', lastMsg: 'Aparelho pronto para retirada.', time: 'Ontem', unread: 0, status: 'online', type: 'system' },
  ];

  const handleStartChat = async () => {
    setSessionId('session-123');
    setMessages([
      { sender: 'Agent', message: `Olá! Eu sou o assistente virtual da Redecell. Como posso ajudar você hoje?`, timestamp: new Date().toISOString() }
    ]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const userMsg = { sender: 'You', message: newMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    
    // Simulate agent typing and response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        sender: 'Agent', 
        message: 'Entendido. Estou verificando essa informação no sistema agora mesmo.', 
        timestamp: new Date().toISOString() 
      }]);
    }, 1500);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: 'calc(100vh - 100px)', 
      bgcolor: 'background.default',
      m: -3, // Compensate for parent padding
      overflow: 'hidden'
    }}>
      {/* Sidebar de Conversas */}
      <Box sx={{ 
        width: 350, 
        borderRight: '1px solid', 
        borderColor: 'divider', 
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box p={3}>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>Mensagens</Typography>
          <Paper elevation={0} sx={{ 
            p: '2px 12px', 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'action.hover',
            borderRadius: '12px'
          }}>
            <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
            <InputBase 
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }} 
              placeholder="Buscar conversas..." 
            />
          </Paper>
        </Box>
        
        <List sx={{ flexGrow: 1, overflowY: 'auto', py: 0 }}>
          {chats.map((chat) => (
            <ListItemButton 
              key={chat.id} 
              selected={activeChatId === chat.id}
              onClick={() => setActiveChatId(chat.id)}
              sx={{ py: 2, px: 3, borderLeft: activeChatId === chat.id ? '4px solid' : '4px solid transparent', borderColor: 'primary.main' }}
            >
              <ListItemIcon sx={{ minWidth: 56 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color={chat.status === 'online' ? 'success' : 'error'}
                >
                  <Avatar sx={{ bgcolor: 'primary.light' }}>{chat.name[0]}</Avatar>
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={700} variant="body2">{chat.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{chat.time}</Typography>
                  </Box>
                }
                secondary={
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                      {chat.lastMsg}
                    </Typography>
                    {chat.unread > 0 && <Chip label={chat.unread} size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem' }} />}
                  </Box>
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Janela de Chat Principal */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: 'action.hover' }}>
        {activeChatId ? (
          <>
            {/* Header do Chat */}
            <Paper elevation={0} sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={`https://i.pravatar.cc/150?u=${activeChatId}`} sx={{ width: 40, height: 40 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>{chats.find(c => c.id === activeChatId)?.name}</Typography>
                  <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <OnlineIcon sx={{ fontSize: 8 }} /> Online agora
                  </Typography>
                </Box>
              </Box>
              <Box>
                <IconButton size="small"><HistoryIcon /></IconButton>
                <IconButton size="small"><MoreIcon /></IconButton>
              </Box>
            </Paper>

            {/* Mensagens */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box textAlign="center" my={2}>
                <Chip label="Hoje" size="small" sx={{ bgcolor: 'divider', color: 'text.secondary', fontWeight: 700 }} />
              </Box>

              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    style={{ 
                      alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                      maxWidth: '70%' 
                    }}
                  >
                    <Paper sx={{ 
                      p: 2, 
                      borderRadius: msg.sender === 'You' ? '20px 20px 0 20px' : '20px 20px 20px 0', 
                      bgcolor: msg.sender === 'You' ? 'primary.main' : 'background.paper',
                      color: msg.sender === 'You' ? 'white' : 'text.primary',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right', opacity: 0.7 }}>
                        {moment(msg.timestamp).format('HH:mm')}
                      </Typography>
                    </Paper>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
              
              {!sessionId && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Button variant="contained" onClick={handleStartChat} sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700 }}>
                    Iniciar Conversa com Suporte
                  </Button>
                </Box>
              )}
            </Box>

            {/* Input de Mensagem */}
            <Box p={3} bgcolor="background.paper" borderTop="1px solid" borderColor="divider">
              <Paper elevation={0} sx={{ 
                p: '8px 12px', 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: 'action.hover',
                borderRadius: '16px'
              }}>
                <IconButton size="small"><AttachIcon /></IconButton>
                <InputBase 
                  sx={{ ml: 2, flex: 1 }} 
                  placeholder="Escreva sua mensagem..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  multiline
                  maxRows={4}
                />
                <IconButton 
                  color="primary" 
                  disabled={!newMessage.trim()} 
                  onClick={handleSendMessage}
                  sx={{ 
                    bgcolor: newMessage.trim() ? 'primary.main' : 'transparent', 
                    color: newMessage.trim() ? 'white' : 'inherit',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Paper>
            </Box>
          </>
        ) : (
          <Box display="flex" flex={1} justifyContent="center" alignItems="center" flexDirection="column">
            <ChatIcon sx={{ fontSize: 80, color: 'divider', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Selecione uma conversa para começar</Typography>
          </Box>
        )}
      </Box>

      {/* Sidebar Lateral de Detalhes (Opcional - God Mode) */}
      {!isMobile && activeChatId && (
        <Box sx={{ 
          width: 300, 
          borderLeft: '1px solid', 
          borderColor: 'divider', 
          bgcolor: 'background.paper',
          p: 3
        }}>
          <Typography variant="subtitle2" fontWeight={800} gutterBottom>Detalhes do Cliente</Typography>
          <Box textAlign="center" mt={4} mb={4}>
            <Avatar src={`https://i.pravatar.cc/150?u=${activeChatId}`} sx={{ width: 80, height: 80, margin: '0 auto mb-2' }} />
            <Typography variant="h6" fontWeight={800}>{chats.find(c => c.id === activeChatId)?.name}</Typography>
            <Typography variant="caption" color="text.secondary">ID: 12948 • Cliente desde 2023</Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" mb={2}>HISTÓRICO RECENTE</Typography>
          <Stack spacing={2}>
            <Box display="flex" gap={1.5}>
              <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: '8px', color: 'white', display: 'flex' }}><WhatsAppIcon sx={{ fontSize: 16 }} /></Box>
              <Box><Typography variant="caption" fontWeight={700} display="block">Venda Finalizada</Typography><Typography variant="caption" color="text.secondary">R$ 1.500,00 • Há 2 dias</Typography></Box>
            </Box>
            <Box display="flex" gap={1.5}>
              <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: '8px', color: 'white', display: 'flex' }}><ChatIcon sx={{ fontSize: 16 }} /></Box>
              <Box><Typography variant="caption" fontWeight={700} display="block">OS Criada</Typography><Typography variant="caption" color="text.secondary">iPhone 13 Pro • Há 1 semana</Typography></Box>
            </Box>
          </Stack>
          
          <Button fullWidth variant="outlined" sx={{ mt: 4, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
            Ver Perfil Completo
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ChatSupportPage;