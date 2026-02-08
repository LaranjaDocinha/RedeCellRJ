import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';

export interface InstallmentCalculatorProps {
  price: number;
  maxInstallments?: number;
  interestFreeLimit?: number;
  interestRate?: number;
}

export const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({
  price,
  maxInstallments = 12,
  interestFreeLimit = 3,
  interestRate = 0.0199, // 1.99% a.m.
}) => {

    const calculateInstallments = () => {
        const installments = [];
        for (let i = 1; i <= maxInstallments; i++) {
            let total = price;
            let installmentPrice = price / i;
            let note = 'sem juros';

            if (i > interestFreeLimit) {
                total = price * Math.pow(1 + interestRate, i);
                installmentPrice = total / i;
                note = `com juros (total R$ ${total.toFixed(2)})`;
            }

            installments.push({
                number: i,
                value: installmentPrice,
                note: note,
            });
        }
        return installments;
    }

  return (
    <Box>
        <Typography variant="subtitle1" fontWeight={400} gutterBottom>Opções de Parcelamento</Typography>
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableBody>
                    {calculateInstallments().map(inst => (
                        <TableRow key={inst.number}>
                            <TableCell>{inst.number}x de R$ {inst.value.toFixed(2)}</TableCell>
                            <TableCell align="right">{inst.note}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
  );
};
