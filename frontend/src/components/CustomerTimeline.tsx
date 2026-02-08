import React from 'react';
import styled from 'styled-components';
import { 
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, 
  TimelineContent, TimelineDot, TimelineOppositeContent 
} from '@mui/lab';
import { 
  ShoppingCart, Build, Print, Star, Celebration, 
  History, ConfirmationNumber 
} from '@mui/icons-material';
import { Typography, Box, Paper, Chip } from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TimelineContainer = styled(Box)`
  padding: 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #eee;
`;

interface TimelineEvent {
  id: string | number;
  date: Date;
  type: 'sale' | 'os' | 'print' | 'loyalty' | 'system';
  title: string;
  description: string;
  value?: string;
  status?: string;
}

interface CustomerTimelineProps {
  events: TimelineEvent[];
}

const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ events }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ShoppingCart />;
      case 'os': return <Build />;
      case 'print': return <Print />;
      case 'loyalty': return <Star />;
      default: return <History />;
    }
  };

  const getColor = (type: string): any => {
    switch (type) {
      case 'sale': return 'success';
      case 'os': return 'primary';
      case 'print': return 'secondary';
      case 'loyalty': return 'warning';
      default: return 'grey';
    }
  };

  return (
    <TimelineContainer>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Jornada do Cliente</Typography>
      <Timeline position="right">
        {events.sort((a, b) => b.date.getTime() - a.date.getTime()).map((event) => (
          <TimelineItem key={event.id}>
            <TimelineOppositeContent sx={{ m: 'auto 0', flex: 0.2 }} align="right" variant="body2" color="text.secondary">
              {format(event.date, "dd MMM yyyy", { locale: ptBR })}
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color={getColor(event.type)}>
                {getIcon(event.type)}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>

            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '12px' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" component="span" sx={{ fontWeight: 500 }}>
                        {event.title}
                    </Typography>
                    {event.value && <Chip label={event.value} size="small" color={getColor(event.type)} variant="outlined" />}
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {event.description}
                </Typography>
                {event.status && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                        Status: {event.status}
                    </Typography>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </TimelineContainer>
  );
};

export default CustomerTimeline;
