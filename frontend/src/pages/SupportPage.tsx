import React, { useState, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Accordion } from '../components/Accordion';

// Mock data
const faqData = [
    { q: 'Qual é a política de devolução?', a: 'Nossa política de devolução permite que você devolva qualquer item dentro de 30 dias após a compra, desde que esteja em sua condição original.' },
    { q: 'Como rastrear meu pedido?', a: 'Assim que seu pedido for enviado, você receberá um email de confirmação com um número de rastreamento.' },
    { q: 'Vocês oferecem frete internacional?', a: 'Atualmente, não oferecemos frete internacional. Enviamos apenas para endereços dentro do Brasil.' },
    { q: 'Quais formas de pagamento são aceitas?', a: 'Aceitamos os principais cartões de crédito (Visa, MasterCard, American Express), boleto bancário e Pix.' },
];

const SupportPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFaq = useMemo(() => 
        faqData.filter(item => 
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm]);

  return (
    <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Suporte e FAQ</Typography>
        <TextField 
            fullWidth
            label="Buscar no FAQ"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 4 }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                )
            }}
        />
        {filteredFaq.length > 0 ? (
            filteredFaq.map((item, index) => (
                <Accordion key={index} title={item.q}>
                    <Typography>{item.a}</Typography>
                </Accordion>
            ))
        ) : (
            <Typography>Nenhum resultado encontrado para "{searchTerm}".</Typography>
        )}
    </Box>
  );
};

export default SupportPage;