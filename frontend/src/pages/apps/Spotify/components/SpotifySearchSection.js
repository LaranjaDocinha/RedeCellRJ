import React from 'react';
import { CardTitle, FormGroup, Input, Button, Spinner, ListGroup, ListGroupItem, Alert } from 'reactstrap';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlay, faPlus } from '@fortawesome/free-solid-svg-icons';

const SpotifySearchSection = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  searchResults,
  searchLoading,
  handlePlayTrack,
  toggleAddTrackModal,
}) => {
  return (
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
    </motion.div>
  );
};

export default SpotifySearchSection;
