
import { create } from 'zustand';
import api from '../utils/api';

export const useSpotifyStore = create((set, get) => ({
  // State
  player: undefined,
  deviceId: undefined,
  is_active: false,
  is_paused: true,
  current_track: undefined,
  position: 0,
  volume: 0.5,
  hasToken: false,

  // Actions
  setPlayer: (player) => set({ player }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setActive: (is_active) => set({ is_active }),
  setPaused: (is_paused) => set({ is_paused }),
  setCurrentTrack: (current_track) => set({ current_track }),
  setHasToken: (hasToken) => set({ hasToken }),

  initializePlayer: (accessToken) => {
    if (get().player) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'PDV Web Player',
        getOAuthToken: (cb) => { cb(accessToken); },
        volume: get().volume,
      });

      set({ player: spotifyPlayer });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        set({ deviceId: device_id });
      });

      spotifyPlayer.addListener('not_ready', () => {
        set({ deviceId: undefined, is_active: false });
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) {
          set({ is_active: false, current_track: undefined });
          return;
        }
        set({
          is_active: true,
          is_paused: state.paused,
          current_track: state.track_window.current_track,
          position: state.position,
        });
      });

      spotifyPlayer.connect();
    };
  },

  playTrack: async (trackUri) => {
    const { deviceId } = get();
    if (!deviceId) return;
    try {
      await api.put(`/spotify/player/play?device_id=${deviceId}`, { uris: [trackUri] });
    } catch (error) {
      console.error('Failed to play track', error);
    }
  },

  togglePlay: () => {
    const { player } = get();
    if (player) player.togglePlay();
  },

  nextTrack: () => {
    const { player } = get();
    if (player) player.nextTrack();
  },

  previousTrack: () => {
    const { player } = get();
    if (player) player.previousTrack();
  },

  setVolume: (volume) => {
    const { player } = get();
    if (player) player.setVolume(volume);
    set({ volume });
  },

  seek: (position) => {
    const { player } = get();
    if (player) player.seek(position);
  },
  
  disconnect: () => {
    const { player } = get();
    if (player) {
      player.disconnect();
      set({ player: undefined, is_active: false });
    }
  }
}));
