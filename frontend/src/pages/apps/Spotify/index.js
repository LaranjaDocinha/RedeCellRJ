import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, FormGroup, Label, Input, Button, Alert, ListGroup, ListGroupItem, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { get, post, put } from '../../../helpers/api_helper';
import useNotification from '../../../hooks/useNotification';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCompactDisc, faMusic, faPlay, faPause, faStepForward, faStepBackward, faPlus, faTimes, faExternalLinkAlt, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';

const SpotifyIntegration = () => {
  document.title = 'Configurações do Spotify | PDV Web';

  const { showSuccess, showError } = useNotification();
  const [spotifySettings, setSpotifySettings] = useState({
    enabled: false,
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/apps/spotify/callback`,
    accessToken: '',
    refreshToken: '',
    expiresIn: 0,
    tokenTimestamp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50); // Exemplo de controle de volume

  // Estados para modais
  const [addTrackModal, setAddTrackModal] = useState(false);
  const [selectedTrackUri, setSelectedTrackUri] = useState(null);
  const [createPlaylistModal, setCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(true);

  const isConnected = spotifySettings.accessToken && (spotifySettings.tokenTimestamp + spotifySettings.expiresIn * 1000) > Date.now();

  const fetchSettings = useCallback(async () => {
    try {
      const response = await get('/api/settings');
      if (response.apps_settings && response.apps_settings.spotify) {
        setSpotifySettings(prev => ({ ...prev, ...response.apps_settings.spotify }));
      }
    } catch (err) {
      console.error('Erro ao buscar configurações do Spotify:', err);
      showError('Não foi possível carregar as configurações do Spotify.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchPlaylists = useCallback(async () => {
    if (!isConnected) return;
    setPlaylistsLoading(true);
    try {
      const response = await get('/api/spotify/me/playlists');
      setUserPlaylists(response.items || []);
    } catch (err) {
      console.error('Erro ao buscar playlists:', err);
      showError('Não foi possível carregar as playlists.');
    } finally {
      setPlaylistsLoading(false);
    }
  }, [isConnected, showError]);

  const fetchCurrentlyPlaying = useCallback(async () => {
    if (!isConnected) return;
    try {
      const response = await get('/api/spotify/player/currently-playing');
      if (response) {
        setCurrentPlaying({
          name: response.item.name,
          artist: response.item.artists.map(a => a.name).join(', '),
          albumArt: response.item.album.images[0]?.url,
          progress_ms: response.progress_ms,
          duration_ms: response.item.duration_ms,
        });
        setIsPlaying(response.is_playing);
      } else {
        setCurrentPlaying(null);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Erro ao buscar música atual:', err);
      // showError('Não foi possível carregar a música atual.'); // Evitar spam de notificação
    }
  }, [isConnected]);

  useEffect(() => {
    fetchSettings();
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      handleSpotifyCallback(code, state);
    }
  }, [fetchSettings]);

  useEffect(() => {
    if (isConnected) {
      fetchPlaylists();
      fetchCurrentlyPlaying();

      const interval = setInterval(() => {
        fetchCurrentlyPlaying();
      }, 5000); // Atualiza a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [isConnected, fetchPlaylists, fetchCurrentlyPlaying]);

  const handleSpotifyCallback = async (code, state) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const response = await put('/api/settings/apps_settings.spotify.auth', { code, redirectUri: spotifySettings.redirectUri });
      if (response.accessToken) {
        setSpotifySettings(prev => ({
          ...prev,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn,
          tokenTimestamp: Date.now(),
        }));
        showSuccess('Conectado ao Spotify com sucesso!');
        fetchPlaylists();
        fetchCurrentlyPlaying();
      } else {
        setAuthError('Falha ao obter token de acesso do Spotify.');
        showError('Falha ao conectar ao Spotify.');
      }
    } catch (err) {
      console.error('Erro no callback do Spotify:', err);
      setAuthError(err.message || 'Erro ao processar o callback do Spotify.');
      showError('Erro ao conectar ao Spotify.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSpotifySettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      const settingsToSave = {
        enabled: spotifySettings.enabled,
        clientId: spotifySettings.clientId,
        clientSecret: spotifySettings.clientSecret,
        redirectUri: spotifySettings.redirectUri,
      };
      await put('/api/settings/apps_settings.spotify', { value: settingsToSave });
      showSuccess('Configurações do Spotify salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configurações do Spotify:', err);
      showError('Erro ao salvar configurações do Spotify.');
    }
  };

  const handleConnectSpotify = async () => {
    setAuthError(null);
    if (!spotifySettings.clientId || !spotifySettings.redirectUri) {
      setAuthError('Client ID e Redirect URI são necessários para conectar.');
      return;
    }
    try {
      const response = await get('/api/spotify/authorize');
      if (response.authUrl) {
        window.location.href = response.authUrl;
      } else {
        setAuthError('Não foi possível obter a URL de autorização do Spotify.');
      }
    } catch (err) {
      console.error('Erro ao iniciar conexão com Spotify:', err);
      setAuthError(err.message || 'Erro ao iniciar o processo de conexão com o Spotify.');
    }
  };

  const handleDisconnectSpotify = async () => {
    setAuthError(null);
    try {
      await put('/api/settings/apps_settings.spotify.disconnect');
      setSpotifySettings(prev => ({
        ...prev,
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        tokenTimestamp: 0,
      }));
      showSuccess('Desconectado do Spotify com sucesso!');
      setUserPlaylists([]);
      setSearchResults([]);
      setCurrentPlaying(null);
      setIsPlaying(false);
    } catch (err) {
      console.error('Erro ao desconectar do Spotify:', err);
      showError('Erro ao desconectar do Spotify.');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      const response = await get(`/api/spotify/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchResults(response.tracks.items || []);
    } catch (err) {
      console.error('Erro ao buscar músicas:', err);
      showError('Não foi possível buscar músicas.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePlayTrack = async (trackUri) => {
    try {
      await put('/api/spotify/player/play', { uris: trackUri ? [trackUri] : undefined });
      // Após tocar, buscar o estado atual para atualizar a UI
      setTimeout(fetchCurrentlyPlaying, 1000); // Pequeno delay para a API do Spotify atualizar
      showSuccess(trackUri ? 'Reproduzindo música!' : 'Continuando reprodução!');
    } catch (err) {
      console.error('Erro ao reproduzir música:', err);
      showError('Não foi possível reproduzir a música. Verifique se há um dispositivo ativo.');
    }
  };

  const handlePause = async () => {
    try {
      await put('/api/spotify/player/pause');
      setIsPlaying(false);
      showSuccess('Música pausada.');
    } catch (err) {
      console.error('Erro ao pausar música:', err);
      showError('Não foi possível pausar a música.');
    }
  };

  const handleNext = async () => {
    try {
      await put('/api/spotify/player/next');
      setTimeout(fetchCurrentlyPlaying, 1000);
      showSuccess('Próxima música.');
    } catch (err) {
      console.error('Erro ao pular música:', err);
      showError('Não foi possível pular para a próxima música.');
    }
  };

  const handlePrevious = async () => {
    try {
      await put('/api/spotify/player/previous');
      setTimeout(fetchCurrentlyPlaying, 1000);
      showSuccess('Música anterior.');
    } catch (err) {
      console.error('Erro ao voltar música:', err);
      showError('Não foi possível voltar para a música anterior.');
    }
  };

  const toggleAddTrackModal = (trackUri = null) => {
    setSelectedTrackUri(trackUri);
    setAddTrackModal(!addTrackModal);
  };

  const handleAddTrackToPlaylist = async (playlistId) => {
    if (!selectedTrackUri || !playlistId) return;
    try {
      await post(`/api/spotify/playlists/${playlistId}/tracks`, { uris: [selectedTrackUri] });
      showSuccess('Música adicionada à playlist com sucesso!');
      toggleAddTrackModal();
    } catch (err) {
      console.error('Erro ao adicionar música à playlist:', err);
      showError('Não foi possível adicionar a música à playlist.');
    }
  };

  const toggleCreatePlaylistModal = () => {
    setCreatePlaylistModal(!createPlaylistModal);
    setNewPlaylistName('');
    setNewPlaylistDescription('');
    setNewPlaylistPublic(true);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      showError('O nome da playlist não pode ser vazio.');
      return;
    }
    try {
      await post('/api/spotify/me/playlists', {
        name: newPlaylistName,
        description: newPlaylistDescription,
        isPublic: newPlaylistPublic,
      });
      showSuccess('Playlist criada com sucesso!');
      toggleCreatePlaylistModal();
      fetchPlaylists(); // Recarregar playlists
    } catch (err) {
      console.error('Erro ao criar playlist:', err);
      showError('Não foi possível criar a playlist.');
    }
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  if (loading) {
    return (
      <div className='page-content'>
        <Container fluid>
          <p>Carregando configurações do Spotify...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className='page-content'>
      <Container fluid>
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle className='mb-4'>Configurações do Spotify</CardTitle>
                <FormGroup check className="mb-3">
                  <Input
                    type="checkbox"
                    name="enabled"
                    id="spotifyEnabled"
                    checked={spotifySettings.enabled}
                    onChange={handleInputChange}
                  />
                  <Label for="spotifyEnabled" check>Habilitar Integração com Spotify</Label>
                </FormGroup>
                <FormGroup>
                  <Label for="clientId">Client ID</Label>
                  <Input
                    type="text"
                    name="clientId"
                    id="clientId"
                    value={spotifySettings.clientId}
                    onChange={handleInputChange}
                    placeholder="Client ID da API do Spotify"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="clientSecret">Client Secret</Label>
                  <Input
                    type="text"
                    name="clientSecret"
                    id="clientSecret"
                    value={spotifySettings.clientSecret}
                    onChange={handleInputChange}
                    placeholder="Client Secret da API do Spotify"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="redirectUri">Redirect URI</Label>
                  <Input
                    type="text"
                    name="redirectUri"
                    id="redirectUri"
                    value={spotifySettings.redirectUri}
                    readOnly
                  />
                  <small className="form-text text-muted">
                    Esta URI deve ser configurada nas configurações do seu aplicativo Spotify Developer.
                  </small>
                </FormGroup>

                <Button color="primary" onClick={handleSave} className="me-2">
                  Salvar Configurações
                </Button>

                <hr className="my-4" />

                <CardTitle className='mb-4'>Status da Conexão com Spotify</CardTitle>
                {authError && <Alert color="danger">{authError}</Alert>}
                {isAuthenticating && <Alert color="info">Conectando ao Spotify...</Alert>}

                {isConnected ? (
                  <Alert color="success">
                    Conectado ao Spotify!
                    <Button color="danger" size="sm" className="ms-3" onClick={handleDisconnectSpotify}>
                      Desconectar
                    </Button>
                  </Alert>
                ) : (
                  <Alert color="warning">
                    Não conectado ao Spotify.
                    <Button color="success" size="sm" className="ms-3" onClick={handleConnectSpotify}>
                      Conectar ao Spotify
                    </Button>
                  </Alert>
                )}

                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-4"
                  >
                    <CardTitle className='mb-4'>Busca de Músicas</CardTitle>
                    <FormGroup>
                      <Input
                        type="text"
                        placeholder="Buscar músicas, artistas ou álbuns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                      />
                      <Button color="info" className="mt-2" onClick={handleSearch} disabled={searchLoading}>
                        {searchLoading ? <Spinner size="sm">Carregando...</Spinner> : <><FontAwesomeIcon icon={faSearch} className="me-2" />Buscar</>}
                      </Button>
                    </FormGroup>

                    {searchResults.length > 0 && (
                      <div className="mt-3">
                        <h5>Resultados da Busca:</h5>
                        <ListGroup>
                          {searchResults.map((track) => (
                            <ListGroupItem key={track.id} className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                {track.album.images.length > 0 && (
                                  <img src={track.album.images[0].url} alt="Album Art" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
                                )}
                                <div>
                                  <strong>{track.name}</strong> - {track.artists.map(a => a.name).join(', ')}
                                  <div className="text-muted" style={{ fontSize: '0.8em' }}>{track.album.name}</div>
                                </div>
                              </div>
                              <div>
                                <Button color="success" size="sm" onClick={() => handlePlayTrack(track.uri)} className="me-2">
                                  <FontAwesomeIcon icon={faPlay} />
                                </Button>
                                <Button color="secondary" size="sm" onClick={() => toggleAddTrackModal(track.uri)}>
                                  <FontAwesomeIcon icon={faPlus} />
                                </Button>
                              </div>
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                    {!searchLoading && searchTerm && searchResults.length === 0 && (
                      <Alert color="info" className="mt-3">Nenhum resultado encontrado para "{searchTerm}".</Alert>
                    )}

                    <hr className="my-4" />

                    <CardTitle className='mb-4 d-flex justify-content-between align-items-center'>
                      Suas Playlists
                      <Button color="success" size="sm" onClick={toggleCreatePlaylistModal}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" />Criar Nova Playlist
                      </Button>
                    </CardTitle>
                    {playlistsLoading ? (
                      <p><Spinner size="sm" className="me-2" />Carregando playlists...</p>
                    ) : userPlaylists.length > 0 ? (
                      <ListGroup>
                        {userPlaylists.map((playlist) => (
                          <ListGroupItem key={playlist.id} className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              {playlist.images.length > 0 && (
                                <img src={playlist.images[0].url} alt="Playlist Cover" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
                              )}
                              <div>
                                <strong>{playlist.name}</strong> ({playlist.tracks.total} músicas)
                                {playlist.description && <div className="text-muted" style={{ fontSize: '0.8em' }}>{playlist.description}</div>}
                              </div>
                            </div>
                            <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                              <FontAwesomeIcon icon={faExternalLinkAlt} />
                            </a>
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                    ) : (
                      <Alert color="info">Nenhuma playlist encontrada. Conecte-se ao Spotify e crie algumas!</Alert>
                    )}

                    <hr className="my-4" />

                    <CardTitle className='mb-4'>Controle de Reprodução</CardTitle>
                    <div className="d-flex align-items-center mb-3">
                      {currentPlaying ? (
                        <div className="d-flex align-items-center flex-grow-1">
                          {currentPlaying.albumArt && (
                            <img src={currentPlaying.albumArt} alt="Album Art" style={{ width: '60px', height: '60px', marginRight: '15px', borderRadius: '5px' }} />
                          )}
                          <div>
                            <h5 className="mb-0">{currentPlaying.name}</h5>
                            <p className="text-muted mb-0">{currentPlaying.artist}</p>
                            <div className="text-muted" style={{ fontSize: '0.8em' }}>
                              {formatTime(currentPlaying.progress_ms)} / {formatTime(currentPlaying.duration_ms)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="mb-0 me-3 flex-grow-1">Nenhuma música em reprodução.</p>
                      )}
                      <Button color="secondary" className="me-2" onClick={handlePrevious} disabled={!isConnected}>
                        <FontAwesomeIcon icon={faStepBackward} />
                      </Button>
                      {isPlaying ? (
                        <Button color="secondary" className="me-2" onClick={handlePause} disabled={!isConnected}>
                          <FontAwesomeIcon icon={faPause} />
                        </Button>
                      ) : (
                        <Button color="secondary" className="me-2" onClick={() => handlePlayTrack(null)} disabled={!isConnected}> 
                          <FontAwesomeIcon icon={faPlay} />
                        </Button>
                      )}
                      <Button color="secondary" onClick={handleNext} disabled={!isConnected}>
                        <FontAwesomeIcon icon={faStepForward} />
                      </Button>
                    </div>

                    {/* Modal para Adicionar Música à Playlist */}
                    <Modal isOpen={addTrackModal} toggle={toggleAddTrackModal} centered>
                      <ModalHeader toggle={toggleAddTrackModal}>Adicionar Música à Playlist</ModalHeader>
                      <ModalBody>
                        {userPlaylists.length > 0 ? (
                          <ListGroup>
                            {userPlaylists.map((playlist) => (
                              <ListGroupItem key={playlist.id} action onClick={() => handleAddTrackToPlaylist(playlist.id)}>
                                {playlist.name}
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        ) : (
                          <p>Você não tem playlists para adicionar esta música.</p>
                        )}
                      </ModalBody>
                      <ModalFooter>
                        <Button color="secondary" onClick={toggleAddTrackModal}>Cancelar</Button>
                      </ModalFooter>
                    </Modal>

                    {/* Modal para Criar Nova Playlist */}
                    <Modal isOpen={createPlaylistModal} toggle={toggleCreatePlaylistModal} centered>
                      <ModalHeader toggle={toggleCreatePlaylistModal}>Criar Nova Playlist</ModalHeader>
                      <ModalBody>
                        <FormGroup>
                          <Label for="newPlaylistName">Nome da Playlist</Label>
                          <Input
                            type="text"
                            id="newPlaylistName"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Minha Nova Playlist"
                          />
                        </FormGroup>
                        <FormGroup className="mt-3">
                          <Label for="newPlaylistDescription">Descrição (Opcional)</Label>
                          <Input
                            type="textarea"
                            id="newPlaylistDescription"
                            value={newPlaylistDescription}
                            onChange={(e) => setNewPlaylistDescription(e.target.value)}
                            placeholder="Uma descrição para sua playlist..."
                          />
                        </FormGroup>
                        <FormGroup check className="mt-3">
                          <Input
                            type="checkbox"
                            id="newPlaylistPublic"
                            checked={newPlaylistPublic}
                            onChange={(e) => setNewPlaylistPublic(e.target.checked)}
                          />
                          <Label for="newPlaylistPublic" check>Pública</Label>
                        </FormGroup>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="primary" onClick={handleCreatePlaylist}>Criar Playlist</Button>
                        <Button color="secondary" onClick={toggleCreatePlaylistModal}>Cancelar</Button>
                      </ModalFooter>
                    </Modal>

                  </motion.div>
                )}

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SpotifyIntegration;
