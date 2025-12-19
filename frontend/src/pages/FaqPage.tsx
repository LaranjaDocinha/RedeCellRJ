import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    const fetchFaqs = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch('/api/faqs', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setFaqs(data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [token]);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (faq.category && faq.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categorizedFaqs = filteredFaqs.reduce((acc, faq) => {
    const category = faq.category || 'Geral';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {});

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Base de Conhecimento (FAQ)</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Buscar FAQs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {Object.keys(categorizedFaqs).length > 0 ? (
        Object.keys(categorizedFaqs).map(category => (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>{category}</Typography>
            {categorizedFaqs[category].map((faq: any) => (
              <Accordion key={faq.id}>
                <AccordionSummary
                  expandIcon={<FaChevronDown />}
                  aria-controls={`panel${faq.id}-content`}
                  id={`panel${faq.id}-header`}
                >
                  <Typography variant="h6">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))
      ) : (
        <Typography>Nenhuma FAQ encontrada para o termo de busca.</Typography>
      )}
    </Box>
  );
};

export default FaqPage;
