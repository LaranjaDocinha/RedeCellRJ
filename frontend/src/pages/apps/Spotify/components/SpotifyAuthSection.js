import React from 'react';
import { CardTitle, Button, Alert, FormGroup, Label, Input } from 'reactstrap';
import { motion } from 'framer-motion';

const SpotifyAuthSection = ({
  spotifySettings,
  handleInputChange,
  handleSave,
  handleConnectSpotify,
  handleDisconnectSpotify,
  isConnected,
  isAuthenticating,
  authError,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-4"
    >
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
    </motion.div>
  );
};

export default SpotifyAuthSection;
