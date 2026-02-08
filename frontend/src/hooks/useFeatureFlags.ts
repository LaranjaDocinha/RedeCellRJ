import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useFeatureFlags = () => {
  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/settings/flags'); // Preciso garantir que essa rota existe
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const isEnabled = (name: string) => {
    const flag = flags.find((f: any) => f.name === name);
    return flag ? flag.is_enabled : false;
  };

  return { isEnabled, isLoading, flags };
};
