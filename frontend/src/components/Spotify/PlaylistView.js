
import React, { useState, useEffect, useCallback } from 'react';
import useApi from '../../hooks/useApi';
import { useSpotifyStore } from '../../store/spotifyStore';
import { FaPlay } from 'react-icons/fa';
import './PlaylistView.css';

const PlaylistView = () => {
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const api = useApi();
  const { playTrack } = useSpotifyStore(); // Get the playTrack action from the store

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await api.get('/spotify/me/playlists');
        setPlaylists(response.data.items);
      } catch (error) {
        console.error('Failed to fetch playlists', error);
      }
      setLoading(false);
    };

    fetchPlaylists();
  }, [api]);

  const handlePlaylistClick = async (playlist) => {
    try {
      setLoading(true);
      const response = await api.get(`/spotify/playlists/${playlist.id}`);
      setTracks(response.data.items);
      setSelectedPlaylist(playlist);
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to fetch tracks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = (trackUri) => {
    playTrack(trackUri); // Use the action from the store
  };

  const handleSearch = useCallback(async () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/spotify/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchResults(response.data.tracks.items);
      setTracks([]);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error('Failed to search tracks', error);
    } finally {
      setLoading(false);
    }
  }, [api, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, handleSearch]);


  const renderTracks = (trackList) => {
    return (
      <ul className="track-list">
        {trackList.map(({ track }) => track && (
          <li key={track.id} className="track-item" onClick={() => handleTrackClick(track.uri)}>
            <img src={track.album.images[2]?.url || track.album.images[0]?.url} alt={track.album.name} className="track-album-art" />
            <div className="track-info">
              <span className="track-name">{track.name}</span>
              <span className="track-artist">{track.artists.map(artist => artist.name).join(', ')}</span>
            </div>
            <span className="track-duration">{new Date(track.duration_ms).toISOString().substr(14, 5)}</span>
            <button className="play-button"><FaPlay /></button>
          </li>
        ))}
      </ul>
    )
  }


  if (loading && !playlists.length) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="spotify-view-container">
      <div className="playlists-grid">
        <h2>Minhas Playlists</h2>
        <div className="grid">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="playlist-card" onClick={() => handlePlaylistClick(playlist)}>
              <img src={playlist.images[0]?.url} alt={playlist.name} />
              <div className="playlist-name">{playlist.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="tracks-view">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar músicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading && <div>Carregando músicas...</div>}
        {searchResults.length > 0 ? (
          <>
            <h2>Resultados da Busca</h2>
            {renderTracks(searchResults.map(track => ({ track })))}
          </>
        ) : selectedPlaylist ? (
          <>
            <h2>{selectedPlaylist.name}</h2>
            {renderTracks(tracks)}
          </>
        ) : (
          <div className="no-selection">Selecione uma playlist ou faça uma busca.</div>
        )}
      </div>
    </div>
  );
};

export default PlaylistView;
