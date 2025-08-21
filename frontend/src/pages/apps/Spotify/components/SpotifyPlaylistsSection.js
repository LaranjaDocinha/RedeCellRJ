import React from 'react';
import { CardTitle, Button, Spinner, ListGroup, ListGroupItem, Alert } from 'reactstrap';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompactDisc, faPlus, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const SpotifyPlaylistsSection = ({
  userPlaylists,
  playlistsLoading,
  toggleCreatePlaylistModal,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-4"
    >
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
    </motion.div>
  );
};

export default SpotifyPlaylistsSection;
