import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

const VideoSettings = ({ videoUrl, onVideoUrlChange }) => {
  return (
    <div>
      <h5 className="mb-3">Configurações de Vídeo/GIF</h5>
      <FormGroup className="mb-3">
        <Label for="videoUrl">URL do Vídeo/GIF</Label>
        <Input
          type="text"
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => onVideoUrlChange(e.target.value)}
          placeholder="Ex: https://example.com/background.mp4 ou .gif"
        />
      </FormGroup>
      {videoUrl && (
        <div className="mb-3">
          <h6>Preview:</h6>
          {videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={videoUrl} autoPlay loop muted style={{ maxWidth: '100%', height: 'auto' }}>
              Seu navegador não suporta o elemento de vídeo.
            </video>
          ) : videoUrl.match(/\.(gif)$/i) ? (
            <img src={videoUrl} alt="Preview GIF" style={{ maxWidth: '100%', height: 'auto' }} />
          ) : (
            <p className="text-muted">Formato de URL não suportado para preview.</p>
          )}
        </div>
      )}
    </div>
  );
};

VideoSettings.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  onVideoUrlChange: PropTypes.func.isRequired,
};

export default VideoSettings;
