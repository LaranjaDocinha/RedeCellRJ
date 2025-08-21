const SpotifyWebApi = require('spotify-web-api-node');
const pool = require('../db');
const { get } = require('../helpers/api_helper'); // Importar a função get para buscar configurações

let spotifyApiInstance = null; // Instância global para ser configurada dinamicamente

const getSpotifySettingsFromDb = async () => {
  try {
    const { rows } = await pool.query('SELECT value FROM store_settings WHERE key = $1', ['apps_settings']);
    if (rows.length > 0) {
      const appsSettings = JSON.parse(rows[0].value);
      return appsSettings.spotify || {};
    }
    return {};
  } catch (error) {
    console.error('Erro ao buscar configurações do Spotify do DB:', error);
    return {};
  }
};

const initializeSpotifyApi = async () => {
  const settings = await getSpotifySettingsFromDb();
  if (settings.clientId && settings.clientSecret && settings.redirectUri) {
    spotifyApiInstance = new SpotifyWebApi({
      clientId: settings.clientId,
      clientSecret: settings.clientSecret,
      redirectUri: settings.redirectUri,
    });
  } else {
    console.warn('Configurações do Spotify (Client ID, Client Secret, Redirect URI) incompletas no DB.');
    spotifyApiInstance = null; // Garante que a instância seja nula se as configurações estiverem incompletas
  }
  return spotifyApiInstance;
};

const getSpotifyApi = async () => {
  if (!spotifyApiInstance) {
    await initializeSpotifyApi();
  }
  if (!spotifyApiInstance) {
    throw new Error('Spotify API não configurada. Verifique as configurações no painel administrativo.');
  }
  return spotifyApiInstance;
};

const scopes = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
];

// Removido a inicialização direta com process.env
// console.log removidos

const login = async (req, res) => {
  try {
    const spotifyApi = await getSpotifyApi();
    const settings = await getSpotifySettingsFromDb();
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, req.user.id); // Usar userId como state
    res.json({ authUrl: authorizeURL });
  } catch (error) {
    console.error('Erro ao criar URL de autorização do Spotify:', error);
    res.status(500).json({ message: error.message || 'Erro ao iniciar o processo de conexão com o Spotify.' });
  }
};

const callback = async (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state; // userId

  if (error) {
    console.error('Callback Error:', error);
    // Redirecionar para o frontend com mensagem de erro
    return res.redirect(`http://localhost:3000/apps/spotify?error=${encodeURIComponent(error)}`);
  }

  if (!state) {
    return res.status(400).send('State parameter (userId) missing.');
  }

  try {
    const spotifyApi = await getSpotifyApi();
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    const tokenTimestamp = Date.now();

    // Atualizar as configurações do Spotify na store_settings com os novos tokens
    const currentAppsSettings = await getSpotifySettingsFromDb();
    const updatedSpotifySettings = {
      ...currentAppsSettings,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      tokenTimestamp: tokenTimestamp,
    };

    // Usar a rota PUT do settingsController para salvar as configurações aninhadas
    // Nota: Isso requer que o settingsController.js seja capaz de lidar com chaves aninhadas
    // e que o `put` helper seja capaz de fazer a requisição para o próprio backend.
    // Para simplificar, farei a atualização direta no DB aqui, como o settingsController faz.
    const { rows } = await pool.query(
      'SELECT value FROM store_settings WHERE key = $1',
      ['apps_settings']
    );
    let appsSettings = {};
    if (rows.length > 0) {
      appsSettings = JSON.parse(rows[0].value);
    }
    appsSettings.spotify = updatedSpotifySettings;

    await pool.query(
      'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      ['apps_settings', JSON.stringify(appsSettings)]
    );

    // Redirecionar de volta para a página de configurações do Spotify no frontend
    res.redirect(`http://localhost:3000/apps/spotify?authSuccess=true`);

  } catch (err) {
    console.error('Error getting Tokens:', err);
    res.redirect(`http://localhost:3000/apps/spotify?authError=${encodeURIComponent(err.message || 'Erro ao obter tokens.')}`);
  }
};

const getAccessToken = async (req, res) => {
  const userId = req.user.id; // Ainda pode ser útil para logs ou associação

  try {
    const spotifyApi = await getSpotifyApi();
    const settings = await getSpotifySettingsFromDb();

    if (!settings.accessToken || !settings.refreshToken || !settings.tokenTimestamp || !settings.expiresIn) {
      return res.status(404).json({ message: 'Tokens do Spotify não encontrados ou incompletos.' });
    }

    const now = Date.now();
    const tokenExpiresAt = settings.tokenTimestamp + settings.expiresIn * 1000;

    if (now < tokenExpiresAt) {
      return res.json({ accessToken: settings.accessToken });
    }

    // Token expirado, tentar refresh
    spotifyApi.setRefreshToken(settings.refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    const { access_token, expires_in } = data.body;

    const newTokenTimestamp = Date.now();

    // Atualizar tokens na store_settings
    const currentAppsSettings = await getSpotifySettingsFromDb();
    const updatedSpotifySettings = {
      ...currentAppsSettings,
      accessToken: access_token,
      expiresIn: expires_in,
      tokenTimestamp: newTokenTimestamp,
    };

    let appsSettings = {};
    const { rows } = await pool.query(
      'SELECT value FROM store_settings WHERE key = $1',
      ['apps_settings']
    );
    if (rows.length > 0) {
      appsSettings = JSON.parse(rows[0].value);
    }
    appsSettings.spotify = updatedSpotifySettings;

    await pool.query(
      'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      ['apps_settings', JSON.stringify(appsSettings)]
    );

    res.json({ accessToken: access_token });

  } catch (err) {
    console.error('Could not refresh access token', err);
    res.status(500).json({ message: 'Could not refresh access token' });
  }
};

// Helper function to get an authenticated spotifyApi client
const getSpotifyApiClient = async (userId) => {
  try {
    const spotifyApi = await getSpotifyApi();
    const settings = await getSpotifySettingsFromDb();

    if (!settings.accessToken || !settings.refreshToken || !settings.tokenTimestamp || !settings.expiresIn) {
      throw new Error('Spotify tokens not found or incomplete. Please connect to Spotify.');
    }

    const now = Date.now();
    const tokenExpiresAt = settings.tokenTimestamp + settings.expiresIn * 1000;

    if (now < tokenExpiresAt) {
      spotifyApi.setAccessToken(settings.accessToken);
      spotifyApi.setRefreshToken(settings.refreshToken);
      return spotifyApi;
    }

    // Token expired, refresh it
    spotifyApi.setRefreshToken(settings.refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    const { access_token, expires_in } = data.body;

    const newTokenTimestamp = Date.now();

    // Atualizar tokens na store_settings
    const currentAppsSettings = await getSpotifySettingsFromDb();
    const updatedSpotifySettings = {
      ...currentAppsSettings,
      accessToken: access_token,
      expiresIn: expires_in,
      tokenTimestamp: newTokenTimestamp,
    };

    let appsSettings = {};
    const { rows } = await pool.query(
      'SELECT value FROM store_settings WHERE key = $1',
      ['apps_settings']
    );
    if (rows.length > 0) {
      appsSettings = JSON.parse(rows[0].value);
    }
    appsSettings.spotify = updatedSpotifySettings;

    await pool.query(
      'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      ['apps_settings', JSON.stringify(appsSettings)]
    );

    spotifyApi.setAccessToken(access_token);
    return spotifyApi;

  } catch (error) {
    console.error('Erro ao obter ou refresh do Spotify API client:', error);
    throw new Error(error.message || 'Erro ao configurar o cliente da API do Spotify.');
  }
};

const disconnect = async (req, res) => {
  try {
    const currentAppsSettings = await getSpotifySettingsFromDb();
    const updatedSpotifySettings = {
      ...currentAppsSettings,
      accessToken: '',
      refreshToken: '',
      expiresIn: 0,
      tokenTimestamp: 0,
    };

    let appsSettings = {};
    const { rows } = await pool.query(
      'SELECT value FROM store_settings WHERE key = $1',
      ['apps_settings']
    );
    if (rows.length > 0) {
      appsSettings = JSON.parse(rows[0].value);
    }
    appsSettings.spotify = updatedSpotifySettings;

    await pool.query(
      'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      ['apps_settings', JSON.stringify(appsSettings)]
    );

    res.status(200).json({ message: 'Desconectado do Spotify com sucesso.' });
  } catch (error) {
    console.error('Erro ao desconectar do Spotify:', error);
    res.status(500).json({ message: error.message || 'Erro ao desconectar do Spotify.' });
  }
};

const getMyPlaylists = async (req, res) => {
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    const data = await apiClient.getUserPlaylists(req.user.id);
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlaylistTracks = async (req, res) => {
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    const data = await apiClient.getPlaylistTracks(req.params.id, { limit: 50 });
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchTracks = async (req, res) => {
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    const data = await apiClient.searchTracks(req.query.q, { limit: 20 });
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const play = async (req, res) => {
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    await apiClient.play(req.body);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const pause = async (req, res) => {
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    await apiClient.pause();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const skipToNext = async (req, res) => {
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    await apiClient.skipToNext();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const skipToPrevious = async (req, res) => {
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    await apiClient.skipToPrevious();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentlyPlaying = async (req, res) => {
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    const data = await apiClient.getMyCurrentPlaybackState();
    res.json(data.body);
  } catch (error) {
    // Não logar erro se não houver nada tocando (status 204)
    if (error.statusCode === 204) {
      return res.status(200).json(null); // Retorna null para indicar que nada está tocando
    }
    res.status(500).json({ message: error.message });
  }
};

const addTrackToPlaylist = async (req, res) => {
  const { playlistId, uris } = req.body;
  if (!playlistId || !uris || !Array.isArray(uris) || uris.length === 0) {
    return res.status(400).json({ message: 'Playlist ID e URIs das músicas são obrigatórios.' });
  }
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    await apiClient.addTracksToPlaylist(playlistId, uris);
    res.status(200).json({ message: 'Música(s) adicionada(s) à playlist com sucesso.' });
  } catch (error) {
    console.error('Erro ao adicionar música à playlist:', error);
    res.status(500).json({ message: error.message || 'Erro ao adicionar música à playlist.' });
  }
};

const createPlaylist = async (req, res) => {
  const { name, description, isPublic } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nome da playlist é obrigatório.' });
  }
  try {
    const apiClient = await getSpotifyApiClient(req.user.id);
    const data = await apiClient.createPlaylist(name, {
      'description': description || '',
      'public': isPublic === true,
    });
    res.status(201).json(data.body);
  } catch (error) {
    console.error('Erro ao criar playlist:', error);
    res.status(500).json({ message: error.message || 'Erro ao criar playlist.' });
  }
};

module.exports = {
  login,
  callback,
  getAccessToken,
  disconnect,
  getMyPlaylists,
  getPlaylistTracks,
  searchTracks,
  play,
  pause,
  skipToNext,
  skipToPrevious,
  getCurrentlyPlaying,
  addTrackToPlaylist,
  createPlaylist,
};