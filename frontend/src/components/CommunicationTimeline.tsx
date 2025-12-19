import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';

interface Communication {
  id: number;
  channel: string;
  direction: 'inbound' | 'outbound';
  summary: string;
  communication_timestamp: string;
}

interface CommunicationTimelineProps {
  communications: Communication[];
}

const CommunicationTimeline: React.FC<CommunicationTimelineProps> = ({ communications }) => {
  return (
    <Timeline position="alternate">
      {communications.map((comm, index) => (
        <TimelineItem key={comm.id}>
          <TimelineOppositeContent color="text.secondary">
            {new Date(comm.communication_timestamp).toLocaleString()}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
            {index < communications.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" component="h1">{comm.channel}</Typography>
              <Typography>{comm.summary}</Typography>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default CommunicationTimeline;
