import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const calculateTimeLeft = (targetDate: Date) => {
    const difference = +targetDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
        timeLeft = {
            dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
            horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutos: Math.floor((difference / 1000 / 60) % 60),
            segundos: Math.floor((difference / 1000) % 60)
        };
    }

    return timeLeft;
};

export const Countdown: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <Box sx={{display: 'flex', gap: 2, textAlign: 'center'}}>
            {Object.entries(timeLeft).map(([unit, value]) => (
                <Box key={unit}>
                    <Typography variant="h4" fontWeight={400}>{String(value).padStart(2, '0')}</Typography>
                    <Typography variant="caption">{unit.toUpperCase()}</Typography>
                </Box>
            ))}
        </Box>
    );
};

