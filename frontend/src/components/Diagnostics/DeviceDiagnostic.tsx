import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Tooltip, Typography, Chip, Stack, useTheme } from '@mui/material';

export interface DiagnosticPart {
  id: string;
  name: string;
  status: 'ok' | 'damaged' | 'missing' | 'unknown';
}

interface DeviceDiagnosticProps {
  initialState?: Record<string, 'ok' | 'damaged' | 'missing' | 'unknown'>;
  onChange?: (state: Record<string, 'ok' | 'damaged' | 'missing' | 'unknown'>) => void;
  readOnly?: boolean;
}

const partsConfig = [
  { id: 'screen', name: 'Tela Frontal', path: 'M40,40 h220 v450 h-220 z' },
  { id: 'battery', name: 'Bateria', path: 'M80,100 h140 v250 h-140 z' },
  { id: 'camera_rear', name: 'Câmera Traseira', path: 'M200,60 h40 v40 h-40 z' },
  { id: 'charging_port', name: 'Conector de Carga', path: 'M120,500 h60 v20 h-60 z' },
  { id: 'housing', name: 'Carcaça', path: 'M20,20 h260 v500 h-260 z M40,40 v450 h220 v-450 z', fillRule: 'evenodd' },
];

export const DeviceDiagnostic: React.FC<DeviceDiagnosticProps> = ({ 
  initialState = {}, 
  onChange,
  readOnly = false 
}) => {
  const theme = useTheme();
  const [partStates, setPartStates] = useState(initialState);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const handlePartClick = (partId: string) => {
    if (readOnly) return;

    setPartStates(prev => {
      const current = prev[partId] || 'unknown';
      const next = current === 'unknown' ? 'ok' 
                 : current === 'ok' ? 'damaged' 
                 : current === 'damaged' ? 'missing' 
                 : 'unknown'; // Cycle
      
      const newState = { ...prev, [partId]: next };
      onChange?.(newState);
      return newState;
    });
  };

  const getColor = (status: string | undefined, isHovered: boolean) => {
    if (isHovered && !readOnly) return theme.palette.primary.light;
    switch (status) {
      case 'ok': return '#4caf50'; // Green
      case 'damaged': return '#f44336'; // Red
      case 'missing': return '#ff9800'; // Orange
      default: return '#e0e0e0'; // Grey
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6">Diagnóstico Visual Interativo</Typography>
      <Typography variant="caption" color="text.secondary">
        Clique nas partes para alterar o status: Cinza (Desconhecido) -> Verde (Ok) -> Vermelho (Danificado) -> Laranja (Ausente)
      </Typography>

      <div style={{ position: 'relative', width: 300, height: 540 }}>
        <svg width="300" height="540" viewBox="0 0 300 540">
          {partsConfig.map(part => {
             const status = partStates[part.id] || 'unknown';
             const isHovered = hoveredPart === part.id;
             
             return (
               <Tooltip key={part.id} title={`${part.name}: ${status.toUpperCase()}`} arrow>
                 <motion.path
                   d={part.path}
                   fill={getColor(status, isHovered)}
                   stroke={isHovered ? theme.palette.primary.main : '#999'}
                   strokeWidth={isHovered ? 2 : 1}
                   onMouseEnter={() => setHoveredPart(part.id)}
                   onMouseLeave={() => setHoveredPart(null)}
                   onClick={() => handlePartClick(part.id)}
                   style={{ cursor: readOnly ? 'default' : 'pointer' }}
                   initial={false}
                   animate={{ fill: getColor(status, isHovered) }}
                   transition={{ duration: 0.2 }}
                 />
               </Tooltip>
             );
          })}
        </svg>
      </div>

      <Stack direction="row" spacing={1}>
         <Chip label="Ok" sx={{ bgcolor: '#4caf50', color: '#fff' }} size="small"/>
         <Chip label="Danificado" sx={{ bgcolor: '#f44336', color: '#fff' }} size="small"/>
         <Chip label="Ausente" sx={{ bgcolor: '#ff9800', color: '#fff' }} size="small"/>
      </Stack>
    </Box>
  );
};
