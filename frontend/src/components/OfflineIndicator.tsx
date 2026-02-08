import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { WifiOff, Wifi, CloudSync } from '@mui/icons-material';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { offlineSyncService } from '../services/offlineSyncService';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Count pending items with safety check
  const pendingCount = useLiveQuery(async () => {
    if (!db.offlineServiceOrders) return 0;
    return await db.offlineServiceOrders.where('synced').equals(0).count();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true);
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000); // Fake sync visual duration if fast
    };
    const handleOffline = () => setIsOnline(false);
    const handleSyncComplete = () => setIsSyncing(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
    };
  }, []);

  if (isOnline && (pendingCount === 0 || pendingCount === undefined) && !isSyncing) {
    return null; // Don't show anything if online and synced
  }

  return (
    <AnimatePresence>
      <Box
        component={motion.div}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          bgcolor: isOnline ? '#4caf50' : '#f44336',
          color: 'white',
          px: 3,
          py: 1,
          borderRadius: 4,
          boxShadow: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          zIndex: 9999,
        }}
      >
        {isOnline ? (
          <>
            {isSyncing || (pendingCount && pendingCount > 0) ? (
                <>
                    <CircularProgress size={20} color="inherit" />
                    <Typography variant="body2" fontWeight={400}>
                      Sincronizando {pendingCount} itens...
                    </Typography>
                </>
            ) : (
                <>
                    <Wifi fontSize="small" />
                    <Typography variant="body2">Conectado</Typography>
                </>
            )}
          </>
        ) : (
          <>
            <WifiOff fontSize="small" />
            <Typography variant="body2" fontWeight={400}>
              Modo Offline
            </Typography>
            {pendingCount ? (
              <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', px: 1, borderRadius: 1 }}>
                <Typography variant="caption">{pendingCount} pendentes</Typography>
              </Box>
            ) : null}
          </>
        )}
        
        {/* Force Sync Button */}
        {isOnline && pendingCount && pendingCount > 0 && (
            <IconButton size="small" color="inherit" onClick={() => offlineSyncService.sync()}>
                <CloudSync fontSize="small" />
            </IconButton>
        )}
      </Box>
    </AnimatePresence>
  );
};

export default OfflineIndicator;

