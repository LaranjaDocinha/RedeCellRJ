
import axios from 'axios';

const API_URL = '/api/gamification';

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  metric: string;
  target_value: number;
  current_value: number;
  reward_xp: number;
  completed: boolean;
  end_date: string;
}

export interface UserStats {
  xp: number;
  level: number;
  name: string;
  nextLevelXp: number;
  progress: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  total: number;
  xp: number;
  level: number;
}

export const gamificationService = {
  async getStats(token: string): Promise<UserStats> {
    const response = await axios.get(`${API_URL}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getLeaderboard(token: string, metric: string = 'sales_volume', period: string = 'monthly'): Promise<LeaderboardEntry[]> {
    const response = await axios.get(`${API_URL}/leaderboard`, {
      params: { metric, period },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getMyChallenges(token: string): Promise<Challenge[]> {
    const response = await axios.get(`${API_URL}/my-challenges`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getUserBadges(token: string, userId: string): Promise<Badge[]> {
    const response = await axios.get(`${API_URL}/users/${userId}/badges`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
