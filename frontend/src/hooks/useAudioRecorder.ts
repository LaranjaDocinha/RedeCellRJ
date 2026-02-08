import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setDuration(0);

      timerInterval.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Falha ao acessar microfone:', err);
      alert('Não foi possível acessar o microfone.');
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current) return;

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/mpeg' });
        resolve(audioBlob);
        
        // Parar todos os tracks para liberar o microfone
        mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerInterval.current) clearInterval(timerInterval.current);
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (!mediaRecorder.current) return;
    mediaRecorder.current.stop();
    mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
  }, []);

  return { isRecording, duration, startRecording, stopRecording, cancelRecording };
};
