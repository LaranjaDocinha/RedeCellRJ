import { useState, useEffect, useCallback } from 'react';

interface VoiceCommand {
  command: string; // Frase exata ou regex simples
  action: () => void;
  feedback?: string; // Texto para falar de volta
}

export const useVoiceCommands = (commands: VoiceCommand[]) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!supported) return;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript.trim().toLowerCase();
      setTranscript(text);

      console.log('Voice Command Heard:', text);

      // Match command
      const matched = commands.find(c => text.includes(c.command.toLowerCase()));
      if (matched) {
        matched.action();
        if (matched.feedback) {
          speak(matched.feedback);
        }
      }
    };

    recognition.start();
  }, [commands, supported]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  return { isListening, transcript, startListening, supported, speak };
};
