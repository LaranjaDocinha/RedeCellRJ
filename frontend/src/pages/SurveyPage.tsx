import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Card, CardContent, CircularProgress } from '@mui/material';

const SurveyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No survey token provided.');
    }
  }, [token]);

  const handleSubmit = async () => {
    if (score === null) {
      setError('Please select a score.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/surveys/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, score, comment }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit survey');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h4">Obrigado pelo seu feedback!</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Deixe seu Feedback</Typography>
          {error && <Typography color="error">{error}</Typography>}
          <Box my={3}>
            <Typography>Em uma escala de 1 a 10, qual a probabilidade de você nos recomendar a um amigo?</Typography>
            <Box display="flex" justifyContent="center" my={2}>
              {[...Array(10)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={score === i + 1 ? 'contained' : 'outlined'}
                  onClick={() => setScore(i + 1)}
                  sx={{ m: 0.5 }}
                >
                  {i + 1}
                </Button>
              ))}
            </Box>
          </Box>
          <TextField
            label="Comentários (opcional)"
            multiline
            rows={4}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Box mt={2} textAlign="right">
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Enviar'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SurveyPage;
