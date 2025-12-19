import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';

interface FeedbackFormProps {
  nodeId: string;
  sessionId: string;
  onFeedbackSubmitted?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ nodeId, sessionId, onFeedbackSubmitted }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isHelpful === null) {
      addNotification(t('please_select_feedback'), 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/diagnostics/feedback', {
        nodeId,
        sessionId, // Pass sessionId for context if needed on backend
        isHelpful,
        comments: comments || undefined,
      });
      addNotification(t('feedback_submitted_success'), 'success');
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error: any) {
      addNotification(t('feedback_submitted_error', { message: error.response?.data?.message || error.message }), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>{t('feedback_form_title')}</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>{t('feedback_question')}</Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant={isHelpful === true ? 'contained' : 'outlined'}
          color="success"
          onClick={() => setIsHelpful(true)}
          disabled={submitting}
        >
          {t('feedback_helpful')}
        </Button>
        <Button
          variant={isHelpful === false ? 'contained' : 'outlined'}
          color="error"
          onClick={() => setIsHelpful(false)}
          disabled={submitting}
        >
          {t('feedback_not_helpful')}
        </Button>
      </Box>

      <TextField
        label={t('feedback_comments_label')}
        multiline
        rows={3}
        fullWidth
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        sx={{ mb: 2 }}
        disabled={submitting}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isHelpful === null || submitting}
      >
        {submitting ? t('submitting_feedback') : t('submit_feedback')}
      </Button>
    </Paper>
  );
};

export default FeedbackForm;
