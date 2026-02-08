import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  Stack, 
  IconButton, 
  TextField, 
  MenuItem, 
  Grid, 
  Paper,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Close, 
  PictureAsPdf, 
  Send, 
  History, 
  EventNote,
  AttachFile,
  WarningAmber
} from '@mui/icons-material';
import { Button } from '../Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../contexts/NotificationContext';

// --- Relatório Modal ---

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

export const TimeClockReportModal: React.FC<ReportModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { addNotification } = useNotification();
  const [period, setPeriod] = useState('current_month');

  const handleGeneratePDF = () => {
    addNotification('Gerando relatório...', 'info');
    
    // Simulação de geração de PDF real com download
    setTimeout(() => {
      try {
        const reportContent = `
          RELATÓRIO DE PONTO - REDECELL RJ
          Período: ${period}
          Gerado em: ${new Date().toLocaleString()}
          ------------------------------------------
          Resumo: 16 dias trabalhados | 128h totais
          Status: Regular
        `;
        
        const blob = new Blob([reportContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Relatorio_Ponto_${period}_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        addNotification('Relatório PDF baixado com sucesso!', 'success');
        onClose();
      } catch (error) {
        addNotification('Erro ao gerar PDF', 'error');
      }
    }, 1500);
  };

  const handleSendEmail = () => {
    // Simulação de envio de e-mail
    setTimeout(() => {
      addNotification('Relatório enviado para o seu e-mail cadastrado!', 'success');
      onClose();
    }, 1200);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus={false}
      disableEnforceFocus={true}
      PaperProps={{
        sx: { borderRadius: '28px', p: 1, backgroundImage: 'none' }
      }}
    >
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="span" sx={{ fontWeight: 400 }}>Extrair Relatório de Ponto</Typography>
        <IconButton onClick={onClose} sx={{ bgcolor: 'action.hover' }}><Close /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Selecione o período desejado para gerar o espelho de ponto detalhado em PDF ou Excel.
          </Typography>

          <TextField
            select
            fullWidth
            autoFocus
            label="Período"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
          >
            <MenuItem value="current_month">Mês Atual</MenuItem>
            <MenuItem value="last_month">Mês Anterior</MenuItem>
            <MenuItem value="custom">Personalizado...</MenuItem>
          </TextField>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', bgcolor: alpha(theme.palette.primary.main, 0.02), borderStyle: 'dashed' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <History color="primary" />
              <Box>
                <Typography variant="subtitle2">Resumo do Período</Typography>
                <Typography variant="caption" color="text.secondary">16 dias trabalhados | 128h totais</Typography>
              </Box>
            </Stack>
          </Paper>

          <Divider />

          <Stack direction="row" spacing={2}>
            <Button 
                fullWidth 
                variant="outlined" 
                label="Gerar PDF" 
                startIcon={<PictureAsPdf />} 
                onClick={handleGeneratePDF}
                sx={{ py: 1.5, borderRadius: '14px' }} 
            />
            <Button 
                fullWidth 
                variant="contained" 
                label="Enviar por E-mail" 
                startIcon={<Send />} 
                onClick={handleSendEmail}
                sx={{ py: 1.5, borderRadius: '14px' }} 
            />
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

// --- Justificativa Modal ---

interface JustifyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const TimeClockJustifyModal: React.FC<JustifyModalProps> = ({ open, onClose, onSubmit }) => {
  const theme = useTheme();
  const [reason, setReason] = useState('');

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus={false}
      disableEnforceFocus={true}
      PaperProps={{
        sx: { borderRadius: '28px', p: 1, backgroundImage: 'none' }
      }}
    >
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="span" sx={{ fontWeight: 400 }}>Justificar Ausência / Atraso</Typography>
        <IconButton onClick={onClose} sx={{ bgcolor: 'action.hover' }}><Close /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: '16px', display: 'flex', gap: 2, alignItems: 'center' }}>
            <WarningAmber color="warning" />
            <Typography variant="body2" color="warning.dark">
              As justificativas serão analisadas pelo setor de RH em até 48 horas.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth autoFocus label="Data da Ocorrência" type="date" InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField 
                select 
                fullWidth 
                label="Motivo" 
                defaultValue="medical"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
              >
                <MenuItem value="medical">Atestado Médico</MenuItem>
                <MenuItem value="personal">Assuntos Pessoais</MenuItem>
                <MenuItem value="technical">Problema Técnico</MenuItem>
                <MenuItem value="other">Outro</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Descrição Detalhada"
            placeholder="Descreva o motivo da sua justificativa..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '18px' } }}
          />

          <Box 
            sx={{ 
                p: 3, border: '2px dashed', borderColor: 'divider', borderRadius: '20px', 
                textAlign: 'center', cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }
            }}
          >
            <AttachFile sx={{ mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" color="text.secondary">Anexar Atestado ou Comprovante (PDF, JPG)</Typography>
          </Box>

          <Button 
            fullWidth 
            variant="contained" 
            label="Enviar Justificativa" 
            onClick={() => onSubmit({ reason })}
            sx={{ py: 2, borderRadius: '16px' }} 
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
