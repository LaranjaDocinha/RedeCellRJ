import React, { useRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import { CameraAlt, FiberManualRecord } from '@mui/icons-material';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  background: #2c3e50;
  padding: 20px;
  border-radius: 12px;
  color: white;
`;

const VideoWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const LiveBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.5);
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  text-transform: uppercase;
`;

const CaptureButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;

  &:hover { background: #c0392b; }
`;

interface WebcamCaptureProps {
  onCapture: (blob: Blob) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) onCapture(blob);
        }, 'image/jpeg', 0.8);
      }
    }
  }, [onCapture]);

  React.useEffect(() => {
    startVideo();
    return () => stopVideo();
  }, []);

  return (
    <Container>
      <VideoWrapper>
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <LiveBadge>
            <FiberManualRecord style={{ color: '#e74c3c', fontSize: 12 }} />
            Bancada Ao Vivo
        </LiveBadge>
      </VideoWrapper>
      
      <CaptureButton onClick={capture}>
        <CameraAlt /> Capturar Snapshot
      </CaptureButton>
    </Container>
  );
};

export default WebcamCapture;
