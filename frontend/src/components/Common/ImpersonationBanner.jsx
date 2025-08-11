import React from 'react';
import { Alert, Button } from 'reactstrap';
import { useAuthStore } from '../../store/authStore';

const ImpersonationBanner = () => {
  const { originalToken, setToken, setOriginalToken, user } = useAuthStore();

  const handleStopImpersonating = () => {
    if (originalToken) {
      setToken(originalToken); // Restore the original admin token
      setOriginalToken(null); // Clear the original token
      window.location.reload(); // Reload to revert to original user context
    }
  };

  if (!originalToken) {
    return null; // Don't render if not impersonating
  }

  return (
    <Alert color="warning" className="text-center mb-0 rounded-0">
      Você está personificando <strong>{user?.name}</strong>.
      <Button color="link" className="text-dark ms-2 p-0" onClick={handleStopImpersonating}>
        Parar Personificação
      </Button>
    </Alert>
  );
};

export default ImpersonationBanner;
