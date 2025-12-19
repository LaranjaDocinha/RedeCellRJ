import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { styled } from '@mui/system';
import * as loyaltyService from '../services/loyaltyService';
import type { LoyaltyTier, LoyaltyTransaction, UserLoyaltyInfo } from '../services/loyaltyService';

// --- Mock Auth Token (Replace with actual auth context/logic) ---
const DUMMY_AUTH_TOKEN = 'your_jwt_token_here'; // TODO: Replace with actual token from auth context

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const LoyaltyPage: React.FC = () => {
  const [userLoyaltyInfo, setUserLoyaltyInfo] = useState<UserLoyaltyInfo | null>(null);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddPointsModalOpen, setIsAddPointsModalOpen] = useState(false);
  const [addPointsAmount, setAddPointsAmount] = useState<number | ''>('');
  const [addPointsReason, setAddPointsReason] = useState('');
  const [addPointsUserId, setAddPointsUserId] = useState(''); // For admin to add points to specific user

  const [isRedeemPointsModalOpen, setIsRedeemPointsModalOpen] = useState(false);
  const [redeemPointsAmount, setRedeemPointsAmount] = useState<number | ''>('');
  const [redeemPointsReason, setRedeemPointsReason] = useState('');

  const fetchLoyaltyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [info, transactions, tiers] = await Promise.all([
        loyaltyService.fetchUserLoyaltyInfo(DUMMY_AUTH_TOKEN),
        loyaltyService.fetchLoyaltyTransactions(DUMMY_AUTH_TOKEN),
        loyaltyService.fetchAllLoyaltyTiers(DUMMY_AUTH_TOKEN),
      ]);

      // Sort tiers by min_points ascending
      const sortedTiers = tiers.sort((a, b) => a.min_points - b.min_points);

      // Determine current and next tier
      let currentTier: LoyaltyTier | undefined;
      let nextTier: LoyaltyTier | undefined;
      let pointsToNextTier: number | undefined;

      if (info && info.loyalty_points !== undefined) {
        currentTier = sortedTiers
          .slice()
          .reverse()
          .find(tier => info.loyalty_points >= tier.min_points);

        nextTier = sortedTiers.find(tier => info.loyalty_points < tier.min_points);

        if (nextTier) {
          pointsToNextTier = nextTier.min_points - info.loyalty_points;
        }
      }

      setUserLoyaltyInfo({
        ...info,
        current_tier: currentTier,
        next_tier: nextTier,
        points_to_next_tier: pointsToNextTier,
      });
      setLoyaltyTransactions(transactions);
      setLoyaltyTiers(sortedTiers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loyalty data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  const handleAddPoints = async () => {
    if (addPointsAmount === '' || !addPointsUserId.trim() || !addPointsReason.trim()) return;
    try {
      await loyaltyService.addLoyaltyPoints(DUMMY_AUTH_TOKEN, addPointsUserId, addPointsAmount as number, addPointsReason);
      setIsAddPointsModalOpen(false);
      setAddPointsAmount('');
      setAddPointsReason('');
      setAddPointsUserId('');
      fetchLoyaltyData(); // Re-fetch data to update UI
    } catch (err: any) {
      setError(err.message || 'Failed to add points.');
    }
  };

  const handleRedeemPoints = async () => {
    if (redeemPointsAmount === '' || !redeemPointsReason.trim()) return;
    try {
      await loyaltyService.redeemLoyaltyPoints(DUMMY_AUTH_TOKEN, redeemPointsAmount as number, redeemPointsReason);
      setIsRedeemPointsModalOpen(false);
      setRedeemPointsAmount('');
      setRedeemPointsReason('');
      fetchLoyaltyData(); // Re-fetch data to update UI
    } catch (err: any) {
      setError(err.message || 'Failed to redeem points.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Loyalty Program
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Loyalty Summary Card */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Your Loyalty Status
              </Typography>
              <Typography variant="h6" color="primary">
                Current Points: {userLoyaltyInfo?.loyalty_points ?? 0}
              </Typography>
              {userLoyaltyInfo?.current_tier && (
                <Typography variant="body1">
                  Current Tier: <strong>{userLoyaltyInfo.current_tier.name}</strong>
                </Typography>
              )}
              {userLoyaltyInfo?.next_tier && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Points to next tier ({userLoyaltyInfo.next_tier.name}):{' '}
                    {userLoyaltyInfo.points_to_next_tier}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      userLoyaltyInfo.next_tier.min_points > 0
                        ? ((userLoyaltyInfo.loyalty_points ?? 0) / userLoyaltyInfo.next_tier.min_points) * 100
                        : 0
                    }
                    sx={{ height: 10, borderRadius: 5, mt: 1 }}
                  />
                </Box>
              )}
              {!userLoyaltyInfo?.current_tier && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  You are not yet in a loyalty tier. Earn points to unlock rewards!
                </Typography>
              )}
            </CardContent>
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={() => setIsRedeemPointsModalOpen(true)}>
                Redeem Points
              </Button>
              {/* Assuming an admin/manager role can add points */}
              <Button variant="outlined" onClick={() => setIsAddPointsModalOpen(true)}>
                Add Points (Admin)
              </Button>
            </Box>
          </StyledCard>
        </Grid>

        {/* Loyalty Tiers List */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Loyalty Tiers & Benefits
              </Typography>
              <List>
                {loyaltyTiers.map((tier, index) => (
                  <React.Fragment key={tier.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography variant="h6">
                            {tier.name} ({tier.min_points} points)
                          </Typography>
                        }
                        secondary={tier.benefits_description || 'No specific benefits listed.'}
                      />
                    </ListItem>
                    {index < loyaltyTiers.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Loyalty Transactions History */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Transaction History
        </Typography>
        {loyaltyTransactions.length > 0 ? (
          <List>
            {loyaltyTransactions.map(transaction => (
              <ListItem key={transaction.id}>
                <ListItemText
                  primary={`${transaction.transaction_type}: ${transaction.points_change > 0 ? '+' : ''}${transaction.points_change} points`}
                  secondary={`Date: ${new Date(transaction.created_at).toLocaleDateString()} - Related ID: ${transaction.related_entity_id || 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1">No loyalty transactions yet.</Typography>
        )}
      </Paper>

      {/* Add Points Modal */}
      <Dialog open={isAddPointsModalOpen} onClose={() => setIsAddPointsModalOpen(false)}>
        <DialogTitle>Add Loyalty Points</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User ID"
            type="text"
            fullWidth
            variant="standard"
            value={addPointsUserId}
            onChange={(e) => setAddPointsUserId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Points Amount"
            type="number"
            fullWidth
            variant="standard"
            value={addPointsAmount}
            onChange={(e) => setAddPointsAmount(parseInt(e.target.value) || '')}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Reason"
            type="text"
            fullWidth
            variant="standard"
            value={addPointsReason}
            onChange={(e) => setAddPointsReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddPointsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddPoints} disabled={addPointsAmount === '' || !addPointsUserId.trim() || !addPointsReason.trim()}>
            Add Points
          </Button>
        </DialogActions>
      </Dialog>

      {/* Redeem Points Modal */}
      <Dialog open={isRedeemPointsModalOpen} onClose={() => setIsRedeemPointsModalOpen(false)}>
        <DialogTitle>Redeem Loyalty Points</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Points to Redeem"
            type="number"
            fullWidth
            variant="standard"
            value={redeemPointsAmount}
            onChange={(e) => setRedeemPointsAmount(parseInt(e.target.value) || '')}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Reason for Redemption"
            type="text"
            fullWidth
            variant="standard"
            value={redeemPointsReason}
            onChange={(e) => setRedeemPointsReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRedeemPointsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleRedeemPoints} disabled={redeemPointsAmount === '' || !redeemPointsReason.trim()}>
            Redeem Points
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoyaltyPage;