const express = require('express');
const router = express.Router();
const {
  login,
  getAccessToken,
  getMyPlaylists,
  getPlaylistTracks,
  searchTracks,
  play,
  disconnect,
  pause,
  skipToNext,
  skipToPrevious,
  getCurrentlyPlaying,
  addTrackToPlaylist,
  createPlaylist,
} = require('../controllers/spotifyController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/token', getAccessToken);
router.get('/login-initiate', login);
router.put('/disconnect', disconnect);
router.get('/me/playlists', getMyPlaylists);
router.post('/me/playlists', createPlaylist); // Nova rota para criar playlist
router.get('/playlists/:id', getPlaylistTracks);
router.post('/playlists/:playlistId/tracks', addTrackToPlaylist); // Nova rota para adicionar música à playlist
router.get('/search', searchTracks);
router.put('/player/play', play);
router.put('/player/pause', pause);
router.put('/player/next', skipToNext);
router.put('/player/previous', skipToPrevious);
router.get('/player/currently-playing', getCurrentlyPlaying);

module.exports = router;