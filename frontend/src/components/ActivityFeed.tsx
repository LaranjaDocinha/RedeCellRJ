import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, Avatar, ListItemAvatar, Chip } from '@mui/material';
import { FaShoppingCart, FaWrench, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'sale':
            return <FaShoppingCart />;
        case 'repair_completed':
            return <FaWrench />;
        case 'goal_achieved':
            return <FaTrophy />;
        default:
            return null;
    }
}

const ActivityFeed: React.FC = () => {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchFeed = async () => {
      if (!token) return;
      try {
        const res = await fetch(`/api/activity-feed?branchId=${user.branch_id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setFeed(data);
      } catch (error) {
        console.error('Error fetching activity feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [token, user]);

  const renderActivityText = (activity: any) => {
    const { activity_type, activity_data, user_name } = activity;
    switch (activity_type) {
        case 'sale':
            return <Typography><b>{user_name}</b> realizou uma venda de <b>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activity_data.totalAmount)}</b>.</Typography>;
        case 'repair_completed':
            return <Typography><b>{user_name}</b> finalizou o reparo de um <b>{activity_data.productDescription}</b>.</Typography>;
        case 'goal_achieved':
             return <Typography><b>{user_name}</b> alcançou a meta <b>{activity_data.goalName}</b> e ganhou o emblema <b>{activity_data.badgeName}</b>!</Typography>;
        default:
            return <Typography>Nova atividade por {user_name}.</Typography>;
    }
  }

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom component="div" role="heading" aria-level="2">Feed de Atividades da Loja</Typography>
      <List>
        {loading ? <Typography>Carregando feed...</Typography> : feed.map(activity => (
          <ListItem key={activity.id} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar>
                <ActivityIcon type={activity.activity_type} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={renderActivityText(activity)}
              secondary={moment(activity.created_at).fromNow()}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ActivityFeed;
