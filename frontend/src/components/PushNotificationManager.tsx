import React, { useState, useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';

const PushNotificationManager: React.FC = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setIsSubscribed(true);
                        setSubscription(sub);
                    }
                });
            });
        }
    }, []);

    const subscribeUser = () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    // VAPID public key should be sourced from your backend/environment variables
                    applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' 
                })
                .then(sub => {
                    console.log('User is subscribed.', sub);
                    setIsSubscribed(true);
                    setSubscription(sub);
                    // TODO: Send subscription to your backend
                })
                .catch(err => {
                    console.error('Failed to subscribe the user: ', err);
                    setError('Não foi possível se inscrever para notificações.');
                });
            });
        }
    };

    return (
        <Box sx={{p: 2, border: '1px dashed grey', borderRadius: '16px'}}>
            <Typography variant="h6">Notificações Push</Typography>
            {isSubscribed ? (
                <Typography>Você está inscrito para receber notificações!</Typography>
            ) : (
                <Button onClick={subscribeUser} variant="contained">Receber Notificações</Button>
            )}
            {error && <Typography color="error">{error}</Typography>}
            {subscription && <pre style={{wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}>{JSON.stringify(subscription, null, 2)}</pre>}
        </Box>
    );
};

export default PushNotificationManager;
