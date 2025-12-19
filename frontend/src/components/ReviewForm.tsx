import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Avatar } from '@mui/material';
import { RatingStars } from './RatingStars';

export const ReviewForm: React.FC = () => {
    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
        }
    };

    const handleSubmit = () => {
        console.log({ rating, comment, files });
        alert('Avaliação enviada!');
    };

  return (
    <Paper sx={{ p: 3, borderRadius: '16px' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Escreva sua avaliação</Typography>
        <Stack spacing={2}>
            <RatingStars value={rating || 0} onChange={setRating} size="large" />
            <TextField 
                label="Seu comentário"
                multiline
                rows={4}
                variant="outlined"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <Button variant="outlined" component="label">
                Adicionar Fotos
                <input type="file" hidden multiple onChange={handleFileChange} accept="image/*" />
            </Button>
            {files.length > 0 && (
                <Stack direction="row" spacing={1}>
                    {files.map((file, index) => (
                        <Avatar key={index} src={URL.createObjectURL(file)} variant="rounded" />
                    ))}
                </Stack>
            )}
            <Button variant="contained" onClick={handleSubmit}>Enviar Avaliação</Button>
        </Stack>
    </Paper>
  );
};