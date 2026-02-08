import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, Typography, Paper, Avatar, TextField, IconButton, 
  List, ListItem, ListItemAvatar, ListItemText, Badge, 
  useTheme, alpha, Stack, Divider, Tooltip, Fab, CircularProgress,
  Chip, Button as MuiButton, LinearProgress
} from '@mui/material';
import { 
  FiSend, FiImage, FiX, FiMinus, FiMessageCircle, 
  FiMic, FiPaperclip, FiFile, FiCheck, FiTerminal, FiExternalLink
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSound } from '../../contexts/SoundContext';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { AudioPlayer } from './AudioPlayer';
import { ImageLightbox } from './ImageLightbox';
import api from '../../services/api';
import moment from 'moment';

const ChatWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user, token } = useAuth();
  const { addNotification } = useNotification();
  const { playSound } = useSound();
  const { isRecording, duration, startRecording, stopRecording, cancelRecording } = useAudioRecorder();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean, src: string }>({ open: false, src: '' });
  
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [focusedCommandIndex, setFocusedCommandIndex] = useState(0);

  const commands = [
      { cmd: '/os', desc: 'Consulta Ordem de Serviço', example: '/os 123', hint: 'Exibe status, aparelho e link direto para o registro.' },
      { cmd: '/prod', desc: 'Consulta Preço/Estoque', example: '/prod tela iphone', hint: 'Busca rápida no catálogo com foto e saldo em estoque.' },
      { cmd: '/cliente', desc: 'Dados de Cliente', example: '/cliente joao', hint: 'Verifica saldo de fidelidade e crédito disponível.' },
      { cmd: '/caixa', desc: 'Resumo Financeiro', example: '/caixa', hint: 'Total de vendas, entradas e saídas do dia atual.' },
      { cmd: '/meta', desc: 'Progresso de Metas', example: '/meta', hint: 'Visualização gráfica do atingimento da meta mensal.' },
      { cmd: '/ajuda', desc: 'Lista de Comandos', example: '/ajuda', hint: 'Mostra todos os comandos e utilitários do Bot.' },
  ];

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useHotkeys('alt+c', () => setIsOpen(prev => !prev));

  useEffect(() => {
    if (!socket || !user) return;
    socket.emit('identify', { id: user.id, name: user.name, role: user.role });
    socket.on('online_users', (users) => setOnlineUsers(users));
    
    socket.on('new_message', (msg) => {
        const isForCurrentChat = selectedContact ? (msg.sender_id === selectedContact.id || msg.sender_id === user.id) : !msg.receiver_id;
        if (isForCurrentChat) {
            setMessages(prev => {
                const filtered = prev.filter(m => m.tempId !== msg.tempId);
                return [...filtered, msg];
            });
            if (isOpen && msg.sender_id !== user.id) {
                socket.emit('mark_read', { messageIds: [msg.id], senderId: msg.sender_id });
            }
        }
        if (msg.sender_id !== user.id) {
            playSound('bubble');
            if (!isOpen || !isForCurrentChat) addNotification(`Mensagem de ${msg.sender_name}`, 'info');
        }
    });

    socket.on('messages_read', ({ messageIds }) => {
        setMessages(prev => prev.map(m => messageIds.includes(m.id) ? { ...m, is_read: true } : m));
    });

    socket.on('user_typing', ({ userName }) => {
        setTypingUser(userName);
        setTimeout(() => setTypingUser(null), 3000);
    });

    return () => {
        socket.off('online_users');
        socket.off('new_message');
        socket.off('messages_read');
        socket.off('user_typing');
    };
  }, [socket, user, isOpen, selectedContact, playSound, addNotification]);

  const fetchHistory = useCallback(async (currentOffset: number, append = false) => {
      if (!token || !user || isHistoryLoading) return;
      setIsHistoryLoading(true);
      const url = selectedContact ? `/api/v1/chat/messages?contactId=${selectedContact.id}&offset=${currentOffset}` : `/api/v1/chat/messages?offset=${currentOffset}`;
      try {
          const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data.length < 50) setHasMore(false);
          setMessages(prev => append ? [...data, ...prev] : data);
          setOffset(currentOffset + data.length);
      } finally { setIsHistoryLoading(false); }
  }, [selectedContact, token, user, isHistoryLoading]);

  useEffect(() => {
      setOffset(0); setHasMore(true); fetchHistory(0, false);
  }, [selectedContact, fetchHistory]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (e.currentTarget.scrollTop === 0 && hasMore && !isHistoryLoading) {
          fetchHistory(offset, true);
      }
  };

  useEffect(() => {
    if (scrollRef.current && offset <= 50) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typingUser, offset]);

  const handleSendMessage = (content: string, type = 'text', fileUrl?: string) => {
    if (!content.trim() && !fileUrl || !socket) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = { id: tempId, tempId, sender_id: user?.id, sender_name: user?.name, content, type, file_url: fileUrl, created_at: new Date().toISOString(), pending: true };
    setMessages(prev => [...prev, optimisticMsg]);
    
    socket.emit('chat_message', { 
        senderId: user?.id, 
        userRole: user?.role,
        content, 
        receiverId: selectedContact?.id || null, 
        type, 
        fileUrl, 
        tempId 
    });
    
    setInputText('');
    setSuggestionsOpen(false);
    playSound('click');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (suggestionsOpen) {
          if (e.key === 'ArrowDown') {
              e.preventDefault();
              setFocusedCommandIndex(prev => (prev + 1) % commands.length);
          } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setFocusedCommandIndex(prev => (prev - 1 + commands.length) % commands.length);
          } else if (e.key === 'Enter') {
              e.preventDefault();
              const selected = commands[focusedCommandIndex];
              setInputText(selected.cmd + ' ');
              setSuggestionsOpen(false);
          } else if (e.key === 'Escape') {
              setSuggestionsOpen(false);
          }
      } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage(inputText);
      }
  };

  const handleInputChange = (val: string) => {
      setInputText(val);
      if (val === '/') {
          setSuggestionsOpen(true);
          setFocusedCommandIndex(0);
      } else if (!val.startsWith('/')) {
          setSuggestionsOpen(false);
      }
      socket?.emit('typing', { senderId: user?.id, userName: user?.name, receiverId: selectedContact?.id || null });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
          const { data } = await api.post('/api/v1/chat/upload', formData);
          const type = data.type.startsWith('image/') ? 'image' : data.type.startsWith('video/') ? 'video' : 'file';
          handleSendMessage(file.name, type, data.fileUrl);
      } catch (e) { addNotification('Falha no upload', 'error'); }
      finally { setIsUploading(false); }
  };

  const handleSendAudio = async () => {
      const blob = await stopRecording();
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', blob, 'audio.mp3');
      try {
          const { data } = await api.post('/api/v1/chat/upload', formData);
          handleSendMessage('Mensagem de voz', 'audio', data.fileUrl);
      } catch (e) { addNotification('Falha ao enviar áudio', 'error'); }
      finally { setIsUploading(false); }
  };

  const getRoleColor = (role: string) => {
      switch (role?.toLowerCase()) {
          case 'admin': return '#FFD700';
          case 'technician': return '#2196F3';
          case 'seller': return '#4CAF50';
          default: return theme.palette.primary.main;
      }
  };

  const renderMessageContent = (msg: any) => {
      const isMe = msg.sender_id === user?.id;
      return (
          <Box>
              {msg.type === 'image' && <img src={msg.file_url} style={{ maxWidth: '100%', borderRadius: 8, cursor: 'pointer' }} onClick={() => setLightbox({ open: true, src: msg.file_url })} />}
              {msg.type === 'video' && <video src={msg.file_url} controls style={{ maxWidth: '100%', borderRadius: 8 }} />}
              {msg.type === 'audio' && <AudioPlayer src={msg.file_url} />}
              {msg.type === 'file' && (
                  <Box component="a" href={msg.file_url} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', textDecoration: 'none', bgcolor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 2 }}>
                      <FiFile /> <Typography variant="caption">{msg.content}</Typography>
                  </Box>
              )}
              {msg.type === 'text' && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>}

              {msg.metadata?.type === 'os_card' && (
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'background.paper', borderRadius: 2, borderLeft: 4, borderColor: 'primary.main' }}>
                      <Typography variant="caption" fontWeight={700} display="block">OS #{msg.metadata.data.id}</Typography>
                      <Typography variant="body2">{msg.metadata.data.product_description}</Typography>
                      <Chip label={msg.metadata.data.status} size="small" sx={{ mt: 1, height: 20, fontSize: 10 }} />
                      <MuiButton size="small" fullWidth sx={{ mt: 1, fontSize: 10 }} onClick={() => navigate(`/service-orders/${msg.metadata.data.id}`)}>ABRIR REGISTRO</MuiButton>
                  </Paper>
              )}

              {msg.metadata?.type === 'finance_card' && (
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2, borderLeft: 4, borderColor: 'success.main' }}>
                      <Typography variant="caption" fontWeight={700} color="success.main" display="block">CAIXA DO DIA</Typography>
                      <Typography variant="h6" color="success.main">R$ {msg.metadata.data.mainPeriodSales?.total_amount || 0}</Typography>
                      <Typography variant="caption">Ticket Médio: R$ 452,00</Typography>
                  </Paper>
              )}

              {msg.metadata?.type === 'customer_card' && (
                  <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'background.paper', borderRadius: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32 }}>{msg.metadata.data.name ? msg.metadata.data.name[0] : 'C'}</Avatar>
                      <Box>
                          <Typography variant="caption" fontWeight={700}>{msg.metadata.data.name}</Typography>
                          <Typography variant="body2" sx={{ fontSize: 10 }}>⭐ {msg.metadata.data.loyalty_points} pts | 💳 R$ {msg.metadata.data.store_credit_balance}</Typography>
                      </Box>
                  </Paper>
              )}

              {msg.metadata?.type === 'goal_card' && (
                  <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" fontWeight={700}>Progresso da Meta ({msg.metadata.data.percent}%)</Typography>
                      <LinearProgress variant="determinate" value={msg.metadata.data.percent} color="primary" sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
                  </Box>
              )}
              
              <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5} sx={{ mt: 0.5, opacity: 0.6 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>{moment(msg.created_at).format('HH:mm')}</Typography>
                  {isMe && (msg.pending ? <CircularProgress size={8} color="inherit" /> : <FiCheck color={msg.is_read ? '#2196F3' : 'inherit'} size={10} />)}
              </Stack>
          </Box>
      );
  };

  const TypingIndicator = () => (
      <Box sx={{ display: 'flex', gap: 0.5, p: 1, bgcolor: alpha(theme.palette.divider, 0.05), borderRadius: 2, width: 'fit-content' }}>
          {[0, 1, 2].map((i) => (
              <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                style={{ width: 4, height: 4, background: theme.palette.text.disabled, borderRadius: '50%' }} />
          ))}
      </Box>
  );

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Fab color="primary" sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1300 }} onClick={() => setIsOpen(true)}>
                    <FiMessageCircle size={24} />
                </Fab>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
            style={{ position: 'fixed', bottom: 30, right: 30, width: 400, height: 600, zIndex: 1301, display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={20} sx={{ height: '100%', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', border: 1, borderColor: 'divider', backdropFilter: 'blur(20px)' }}>
                <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        {selectedContact ? <IconButton size="small" color="inherit" onClick={() => setSelectedContact(null)}><FiX /></IconButton> : <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><FiMessageCircle /></Avatar>}
                        <Box><Typography variant="subtitle1" fontWeight={600} lineHeight={1}>{selectedContact ? selectedContact.name : 'Redecell Social'}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>{selectedContact ? 'Conversa Privada' : `${onlineUsers.length} online`}</Typography></Box>
                    </Stack>
                    <IconButton size="small" color="inherit" onClick={() => setIsOpen(false)}><FiMinus /></IconButton>
                </Box>

                {!selectedContact && (
                    <Stack direction="row" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Box onClick={() => setActiveTab('general')} sx={{ flex: 1, p: 1.5, textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'general' ? 2 : 0, borderColor: 'primary.main', opacity: activeTab === 'general' ? 1 : 0.5 }}><Typography variant="caption" fontWeight={600}>GERAL</Typography></Box>
                        <Box onClick={() => setActiveTab('users')} sx={{ flex: 1, p: 1.5, textAlign: 'center', cursor: 'pointer', borderBottom: activeTab === 'users' ? 2 : 0, borderColor: 'primary.main', opacity: activeTab === 'users' ? 1 : 0.5 }}><Typography variant="caption" fontWeight={600}>EQUIPE</Typography></Box>
                    </Stack>
                )}

                <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {/* Suggestions UI with Hint Balloon */}
                    <AnimatePresence>
                        {suggestionsOpen && (
                            <Box sx={{ position: 'absolute', bottom: 70, left: 10, right: 10, zIndex: 10, display: 'flex', gap: 1 }}>
                                {/* List Menu */}
                                <Paper 
                                    component={motion.div}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    sx={{ 
                                        width: 200, borderRadius: 3, overflow: 'hidden', border: 1, 
                                        borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.9),
                                        backdropFilter: 'blur(10px)', boxShadow: theme.shadows[10]
                                    }}
                                >
                                    <Box sx={{ p: 1, bgcolor: theme.palette.primary.main, color: 'white' }}>
                                        <Typography variant="caption" fontWeight={800} sx={{ fontSize: 9, letterSpacing: 1 }}>COMANDOS</Typography>
                                    </Box>
                                    <List dense sx={{ p: 0 }}>
                                        {commands.map((c, idx) => (
                                            <ListItem 
                                                key={c.cmd} 
                                                selected={focusedCommandIndex === idx}
                                                onMouseEnter={() => setFocusedCommandIndex(idx)}
                                                onClick={() => { setInputText(c.cmd + ' '); setSuggestionsOpen(false); }}
                                                sx={{ 
                                                    borderBottom: 1, borderColor: 'divider',
                                                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                }}
                                            >
                                                <Typography variant="caption" fontWeight={700} color="primary.main">{c.cmd}</Typography>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>

                                {/* Hint Balloon */}
                                <Paper
                                    component={motion.div}
                                    key={focusedCommandIndex}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    sx={{ 
                                        flex: 1, borderRadius: 3, p: 2, border: 1, borderColor: 'primary.light',
                                        bgcolor: alpha(theme.palette.primary.main, 0.05), backdropFilter: 'blur(10px)',
                                        display: 'flex', flexDirection: 'column', gap: 1
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <FiTerminal color={theme.palette.primary.main} />
                                        <Typography variant="caption" fontWeight={800} color="primary.main">DICA DO BOT</Typography>
                                    </Stack>
                                    <Typography variant="caption" fontWeight={600} sx={{ lineHeight: 1.2 }}>{commands[focusedCommandIndex].desc}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{commands[focusedCommandIndex].hint}</Typography>
                                    <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>Ex: {commands[focusedCommandIndex].example}</Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        )}
                    </AnimatePresence>

                    {(activeTab === 'general' || selectedContact) ? (
                        <>
                            <Box ref={scrollRef} onScroll={handleScroll} sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {isHistoryLoading && <Box textAlign="center" p={1}><CircularProgress size={20} /></Box>}
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <Box key={msg.id || idx} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                            {!isMe && !selectedContact && <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>{msg.sender_name}</Typography>}
                                            <Paper elevation={0} sx={{ p: 1.5, borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', bgcolor: isMe ? 'primary.main' : alpha(theme.palette.divider, 0.05), color: isMe ? 'white' : 'text.primary', border: isMe ? 0 : 1, borderColor: 'divider' }}>
                                                {renderMessageContent(msg)}
                                            </Paper>
                                        </Box>
                                    );
                                })}
                                {typingUser && <Box sx={{ alignSelf: 'flex-start' }}><Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>{typingUser}</Typography><TypingIndicator /></Box>}
                            </Box>

                            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                {isRecording ? (
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ bgcolor: 'error.lighter', p: 1, borderRadius: 3 }}>
                                        <Box sx={{ width: 10, height: 10, bgcolor: 'error.main', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                                        <Typography variant="body2" color="error.main" fontWeight={700}>Gravando: {duration}s</Typography>
                                        <Box sx={{ flex: 1 }} />
                                        <IconButton size="small" color="error" onClick={cancelRecording}><FiX /></IconButton>
                                        <IconButton size="small" color="success" onClick={handleSendAudio}><FiSend /></IconButton>
                                    </Stack>
                                ) : (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                                        <IconButton size="small" onClick={() => fileInputRef.current?.click()} disabled={isUploading}><FiPaperclip /></IconButton>
                                        <TextField fullWidth size="small" placeholder="Mensagem..." value={inputText} onChange={(e) => handleInputChange(e.target.value)}
                                            onKeyDown={handleKeyDown} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                        {inputText.trim() ? (
                                            <IconButton color="primary" onClick={() => handleSendMessage(inputText)}><FiSend /></IconButton>
                                        ) : (
                                            <IconButton color="primary" onClick={startRecording} disabled={isUploading}>{isUploading ? <CircularProgress size={20} /> : <FiMic />}</IconButton>
                                        )}
                                    </Stack>
                                )}
                            </Box>
                        </>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {onlineUsers.filter(u => u.id !== user.id).map((u) => (
                                <ListItem key={u.id} onClick={() => { setSelectedContact(u); setActiveTab('general'); }} sx={{ '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' } }}>
                                    <ListItemAvatar><Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color="success"><Avatar sx={{ bgcolor: alpha(getRoleColor(u.role), 0.1), color: getRoleColor(u.role), boxShadow: `0 0 10px ${alpha(getRoleColor(u.role), 0.3)}`, border: `1px solid ${getRoleColor(u.role)}` }}>{u.name ? u.name[0] : 'U'}</Avatar></Badge></ListItemAvatar>
                                    <ListItemText primary={u.name} secondary={u.role} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
      <ImageLightbox open={lightbox.open} src={lightbox.src} onClose={() => setLightbox({ open: false, src: '' })} />
    </>
  );
};

export default ChatWidget;
