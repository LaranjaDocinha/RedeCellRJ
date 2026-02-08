import React, { useState, useRef } from 'react';
import { Box, IconButton, Typography, Slider, Stack } from '@mui/material';
import { FiPlay, FiPause, FiVolume2 } from 'react-icons/fi';

interface AudioPlayerProps {
  src: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(current || 0);
    }
  };

  return (
    <Box sx={{ minWidth: 200, bgcolor: 'rgba(0,0,0,0.05)', p: 1, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
      />
      
      <IconButton size="small" onClick={togglePlay} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
        {isPlaying ? <FiPause /> : <FiPlay />}
      </IconButton>

      <Box sx={{ flex: 1 }}>
          <Slider 
            size="small" 
            value={progress} 
            sx={{ color: 'primary.main', height: 4 }} 
          />
      </Box>

      <Box 
        onClick={handleSpeed}
        sx={{ 
            bgcolor: 'rgba(0,0,0,0.1)', px: 1, py: 0.5, borderRadius: 1, 
            cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 
        }}
      >
        {speed}x
      </Box>
    </Box>
  );
};
