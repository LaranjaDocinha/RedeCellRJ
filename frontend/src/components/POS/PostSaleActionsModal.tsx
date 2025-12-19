import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';
import { connectToPrinter, printReceipt } from '../../utils/printer';
import { FaWhatsapp } from 'react-icons/fa';

interface PostSaleActionsModalProps {
  open: boolean;
  onClose: () => void;
  saleId: string | null;
  customerEmail?: string;
  customerPhone?: string;
}

const PostSaleActionsModal: React.FC<PostSaleActionsModalProps> = ({
  open,
  onClose,
  saleId,
  customerEmail,
  customerPhone,
}) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const [email, setEmail] = useState(customerEmail || '');
  const [emailSubject, setEmailSubject] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // WhatsApp state
  const [showWhatsappForm, setShowWhatsappForm] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState(customerPhone || '');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  useEffect(() => {
    if (open) {
      setEmail(customerEmail || '');
      setEmailSubject(t('sale_receipt_subject', { saleId }));
      setWhatsappPhone(customerPhone || '');
      setWhatsappMessage(t('whatsapp_default_message', { saleId }));
      setShowEmailForm(false);
      setShowWhatsappForm(false);
    }
  }, [open, customerEmail, customerPhone, saleId, t]);

  const handleGenerateReceipt = async () => {
    try {
      addNotification(t('connecting_printer'), 'info');
      const device = await connectToPrinter();
      await printReceipt(device, {
        storeName: "Redecell RJ",
        address: "Rua Exemplo, 123 - Rio de Janeiro",
        saleId: saleId || "N/A",
        date: new Date().toLocaleString(),
        items: [], // TODO: Pass real items
        total: 0, // TODO: Pass real total
        payments: []
      });
      addNotification(t('printed_successfully'), 'success');
    } catch (error) {
      console.warn("WebUSB failed, falling back to browser print", error);
      window.print();
    }
  };

  const handleGenerateFiscalNote = () => {
     addNotification(t('fiscal_note_generated'), 'success');
  };

  const handleSendEmail = async () => {
      // Mock email sending
      addNotification(t('email_sent_successfully'), 'success');
      setShowEmailForm(false);
  };

  const handleSendWhatsapp = async () => {
    if (!saleId || !whatsappPhone || !whatsappMessage) {
      addNotification(t('whatsapp_fields_required'), 'warning');
      return;
    }
    try {
      await axios.post('/api/whatsapp/send', {
        phone: whatsappPhone,
        message: whatsappMessage,
      });
      addNotification(t('whatsapp_sent_successfully'), 'success');
      onClose();
    } catch (error: any) {
      addNotification(t('failed_to_send_whatsapp', { message: error.response?.data?.message || error.message }), 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('post_sale_actions_title')}</DialogTitle>
      <DialogContent dividers>
        {!showEmailForm && !showWhatsappForm ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateReceipt}
            >
              {t('print_receipt')}
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setShowEmailForm(true)}
            >
              {t('email_receipt')}
            </Button>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={() => setShowWhatsappForm(true)}
              startIcon={<FaWhatsapp />}
            >
              {t('whatsapp_receipt')}
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateFiscalNote}
            >
              {t('generate_fiscal_note')}
            </Button>
          </Box>
        ) : showEmailForm ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
             <TextField
              label={t('email_to')}
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              label={t('email_subject')}
              fullWidth
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              margin="normal"
            />
            <Typography variant="body2" color="textSecondary">
              {t('email_content_note')}
            </Typography>
            <Button variant="contained" onClick={handleSendEmail}>
              {t('send_email')}
            </Button>
            <Button variant="outlined" onClick={() => setShowEmailForm(false)}>
              {t('back_to_options')}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('whatsapp_phone')}
              fullWidth
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              margin="normal"
              helperText={t('whatsapp_phone_helper')}
            />
            <TextField
              label={t('whatsapp_message')}
              fullWidth
              multiline
              rows={3}
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              margin="normal"
            />
            <Button variant="contained" color="success" onClick={handleSendWhatsapp} startIcon={<FaWhatsapp />}>
              {t('send_whatsapp')}
            </Button>
            <Button variant="outlined" onClick={() => setShowWhatsappForm(false)}>
              {t('back_to_options')}
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('done')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostSaleActionsModal;