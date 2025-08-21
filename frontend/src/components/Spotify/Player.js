
import React, { useEffect } from 'react';
import { useSpotifyStore } from '../../store/spotifyStore';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaVolumeDown, 
  FaVolumeUp,
  FaBroadcastTower
} from 'react-icons/fa';
import './Player.css';

const SpotifyPlayer = () => {
  const {
    is_active,
    is_paused,
    current_track,
    position,
    volume,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
    seek
  } = useSpotifyStore();

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handlePositionChange = (e) => {
    const newPosition = parseInt(e.target.value, 10);
    seek(newPosition);
  };

  // This effect will keep the local position in sync with the store's position
  // This is a simplified approach. A more robust solution would use the store's position directly.
  const [localPosition, setLocalPosition] = React.useState(position);

  useEffect(() => {
    setLocalPosition(position);
  }, [position]);

  useEffect(() => {
    let interval = null;
    if (!is_paused && is_active) {
      interval = setInterval(() => {
        setLocalPosition(prevPosition => prevPosition + 1000);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [is_paused, is_active]);


  if (!is_active || !current_track) {
    return (
      <div className="player-container inactive-player">
        <FaBroadcastTower size={50} />
        <h3>Instância não ativa</h3>
        <p>Transfira a reprodução para 'PDV Web Player' no seu app Spotify.</p>
      </div>
    );
  }

  return (
    <div className="player-container">
      <div className="track-info-container">
        <img src={current_track.album.images[0].url} className="now-playing-cover" alt={current_track.name} />
        <div className="track-details">
          <div className="now-playing-name">{current_track.name}</div>
          <div className="now-playing-artist">{current_track.artists[0].name}</div>
        </div>
      </div>

      <div className="controls-container">
        <div className="main-controls">
            <button className="control-button" onClick={previousTrack} >
                <FaStepBackward />
            </button>
            <button className="control-button play-pause" onClick={togglePlay} >
                { is_paused ? <FaPlay size={20}/> : <FaPause size={20}/> }
            </button>
            <button className="control-button" onClick={nextTrack} >
                <FaStepForward />
            </button>
        </div>
        <div className="progress-bar-container">
            <span>{new Date(localPosition).toISOString().substr(14, 5)}</span>
            <input 
                type="range" 
                min="0" 
                max={current_track.duration_ms}
                value={localPosition}
                onChange={handlePositionChange}
                className="progress-bar"
            />
            <span>{new Date(current_track.duration_ms).toISOString().substr(14, 5)}</span>
        </div>
      </div>

      <div className="volume-container">
        <FaVolumeDown />
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
        />
        <FaVolumeUp />
      </div>
    </div>
  );
};

export default SpotifyPlayer;
