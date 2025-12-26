import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Grid, Tooltip } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url: string;
}

const MyBadges: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user?.id || !token) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/gamification/users/${user.id}/badges`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setBadges(data);
      } catch (error) {
        console.error('Error fetching user badges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user, token]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Meus Emblemas</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {badges.length === 0 ? (
              <Typography sx={{ ml: 2 }}>Você ainda não ganhou nenhum emblema.</Typography>
            ) : (
              badges.map((badge) => (
                <Grid item key={badge.id}>
                  <Tooltip title={`${badge.name}: ${badge.description}`}>
                    <img src={badge.icon_url || 'https://placehold.co/64'} alt={badge.name} width={64} height={64} />
                  </Tooltip>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default MyBadges;
