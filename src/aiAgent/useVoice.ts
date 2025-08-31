/**
 * React hook for voice functionality
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  VoiceRecognitionManager, 
  VoiceSynthesisManager, 
  checkVoiceSupport,
  requestMicrophonePermission 
} from './VoiceUtils';

interface UseVoiceOptions {
  language?: string;
  autoSpeak?: boolean;
  voiceRate?: number;
  voicePitch?: number;
}

interface UseVoiceReturn {
  // Speech Recognition
  isListening: boolean;
  transcript: string;
  confidence: number;
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  
  // Speech Synthesis
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  
  // Support and Permissions
  isSupported: {
    recognition: boolean;
    synthesis: boolean;
  };
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  recheckSupport: () => void;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const {
    language = 'en-US',
    autoSpeak = false,
    voiceRate = 1,
    voicePitch = 1
  } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState({
    recognition: false,
    synthesis: false
  });

  // Refs for voice managers
  const recognitionManager = useRef<VoiceRecognitionManager | null>(null);
  const synthesisManager = useRef<VoiceSynthesisManager | null>(null);

  // Initialize voice managers
  useEffect(() => {
    // Small delay to ensure DOM is ready and APIs are available
    const initializeVoice = () => {
      const support = checkVoiceSupport();
      setIsSupported({
        recognition: support.speechRecognition,
        synthesis: support.speechSynthesis
      });

      if (support.speechRecognition) {
        try {
          recognitionManager.current = new VoiceRecognitionManager();
          
          recognitionManager.current.setOnResult((result) => {
            setTranscript(result.transcript);
            setConfidence(result.confidence);
          });

          recognitionManager.current.setOnError((errorMessage) => {
            setError(errorMessage);
            setIsListening(false);
          });

          recognitionManager.current.setOnStart(() => {
            setIsListening(true);
            setError(null);
          });

          recognitionManager.current.setOnEnd(() => {
            setIsListening(false);
          });
        } catch (error) {
          console.error('Failed to initialize voice recognition:', error);
          setIsSupported(prev => ({ ...prev, recognition: false }));
        }
      }

      if (support.speechSynthesis) {
        try {
          synthesisManager.current = new VoiceSynthesisManager();
        } catch (error) {
          console.error('Failed to initialize voice synthesis:', error);
          setIsSupported(prev => ({ ...prev, synthesis: false }));
        }
      }
    };

    // Initialize immediately and also after a short delay to catch late-loading APIs
    initializeVoice();
    const timeoutId = setTimeout(initializeVoice, 100);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup
      if (recognitionManager.current) {
        recognitionManager.current.abort();
      }
      if (synthesisManager.current) {
        synthesisManager.current.stop();
      }
    };
  }, []);

  // Check for microphone permission on mount
  useEffect(() => {
    if (isSupported.recognition) {
      // Check if we already have permission by attempting to access getUserMedia
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then((stream) => {
          setHasPermission(true);
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {
          setHasPermission(false);
        });
    }
  }, [isSupported.recognition]);

  // Start listening function
  const startListening = useCallback(async (): Promise<boolean> => {
    if (!isSupported.recognition || !recognitionManager.current) {
      setError('Speech recognition not supported');
      return false;
    }

    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        setError('Microphone permission required');
        return false;
      }
      setHasPermission(true);
    }

    setError(null);
    setTranscript('');
    setConfidence(0);

    const started = recognitionManager.current.startListening({
      language,
      continuous: false,
      interimResults: true
    });

    if (!started) {
      setError('Failed to start speech recognition');
    }

    return started;
  }, [isSupported.recognition, hasPermission, language]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognitionManager.current) {
      recognitionManager.current.stopListening();
    }
  }, []);

  // Speak function
  const speak = useCallback(async (text: string): Promise<void> => {
    if (!isSupported.synthesis || !synthesisManager.current) {
      throw new Error('Speech synthesis not supported');
    }

    if (synthesisManager.current.speaking) {
      synthesisManager.current.stop();
    }

    setIsSpeaking(true);
    setError(null);

    try {
      await synthesisManager.current.speak(text, {
        rate: voiceRate,
        pitch: voicePitch
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Speech synthesis error');
      throw error;
    } finally {
      setIsSpeaking(false);
    }
  }, [isSupported.synthesis, voiceRate, voicePitch]);

  // Stop speaking function
  const stopSpeaking = useCallback(() => {
    if (synthesisManager.current) {
      synthesisManager.current.stop();
      setIsSpeaking(false);
    }
  }, []);

  // Request permission function
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestMicrophonePermission();
    setHasPermission(granted);
    if (!granted) {
      setError('Microphone permission denied');
    }
    return granted;
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Recheck support function
  const recheckSupport = useCallback(() => {
    const support = checkVoiceSupport();
    setIsSupported({
      recognition: support.speechRecognition,
      synthesis: support.speechSynthesis
    });
    
    // Re-initialize managers if needed
    if (support.speechRecognition && !recognitionManager.current) {
      try {
        recognitionManager.current = new VoiceRecognitionManager();
        
        recognitionManager.current.setOnResult((result) => {
          setTranscript(result.transcript);
          setConfidence(result.confidence);
        });

        recognitionManager.current.setOnError((errorMessage) => {
          setError(errorMessage);
          setIsListening(false);
        });

        recognitionManager.current.setOnStart(() => {
          setIsListening(true);
          setError(null);
        });

        recognitionManager.current.setOnEnd(() => {
          setIsListening(false);
        });
      } catch (error) {
        console.error('Failed to initialize voice recognition:', error);
        setIsSupported(prev => ({ ...prev, recognition: false }));
      }
    }

    if (support.speechSynthesis && !synthesisManager.current) {
      try {
        synthesisManager.current = new VoiceSynthesisManager();
      } catch (error) {
        console.error('Failed to initialize voice synthesis:', error);
        setIsSupported(prev => ({ ...prev, synthesis: false }));
      }
    }
  }, []);

  return {
    // Speech Recognition
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    
    // Speech Synthesis
    isSpeaking,
    speak,
    stopSpeaking,
    
    // Support and Permissions
    isSupported,
    hasPermission,
    requestPermission,
    recheckSupport,
    
    // Error handling
    error,
    clearError
  };
}
