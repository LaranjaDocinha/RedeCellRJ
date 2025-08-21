import React, { useState, useEffect } from 'react';
import SpotifyPlayer from '../../components/Spotify/Player';
import PlaylistView from '../../components/Spotify/PlaylistView';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

const SpotifyPage = () => {
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const checkToken = async () => {
      try {
        await api.get('/api/spotify/token');
        setHasToken(true);
      } catch (error) {
        setHasToken(false);
      }
      setLoading(false);
    };

    checkToken();
  }, [api]);

  if (loading) {
    return <div>Verificando autenticação com o Spotify...</div>;
  }

  return (
    <div>
      <h1>Integração com Spotify</h1>
      {
        hasToken ? (
          <div>
            <SpotifyPlayer />
            <hr />
            <PlaylistView />
          </div>
        ) :
        <div>
          <p>Para começar, conecte sua conta do Spotify.</p>
          <button onClick={async () => { try { const response = await api.get('/api/spotify/login-initiate'); window.location.href = response.redirectUrl; } catch (error) { console.error('Error initiating Spotify login:', error); } }} className="btn btn-primary">
            Conectar com o Spotify
          </button>
        </div>
      }
    </div>
  );
};

export default SpotifyPage;