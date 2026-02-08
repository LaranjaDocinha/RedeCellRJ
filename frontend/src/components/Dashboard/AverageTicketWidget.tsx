import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FaUserTie } from 'react-icons/fa';

const AverageTicketWidget: React.FC<{ data: any[] }> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('average_ticket_by_salesperson')}
        </Typography>
        <List>
          {data && data.map((item, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: index === 0 ? 'gold' : 'primary.main' }}>
                  <FaUserTie />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={item.user_name} 
                secondary={`${item.total_sales} ${t('sales')}`} 
              />
              <Typography variant="body1" sx={{ fontWeight: 400 }}>
                R$ {item.avg_ticket.toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default AverageTicketWidget;

