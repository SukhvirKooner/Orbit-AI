/**
 * Voice utilities for speech recognition and synthesis
 */

interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface VoiceSynthesisOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class VoiceRecognitionManager {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private onResult?: (result: VoiceRecognitionResult) => void;
  private onError?: (error: string) => void;
  private onStart?: () => void;
  private onEnd?: () => void;

  constructor() {
    this.checkSupport();
    if (this.isSupported) {
      this.initializeRecognition();
    }
  }

  private checkSupport(): void {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    this.isSupported = !!SpeechRecognition;
  }

  private initializeRecognition(): void {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      this.onResult?.({
        transcript,
        confidence,
        isFinal
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone setup.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please enable microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      this.onError?.(errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd?.();
    };
  }

  public startListening(options?: VoiceRecognitionOptions): boolean {
    if (!this.isSupported || !this.recognition || this.isListening) {
      return false;
    }

    if (options) {
      if (options.language) this.recognition.lang = options.language;
      if (options.continuous !== undefined) this.recognition.continuous = options.continuous;
      if (options.interimResults !== undefined) this.recognition.interimResults = options.interimResults;
      if (options.maxAlternatives) this.recognition.maxAlternatives = options.maxAlternatives;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      this.onError?.('Failed to start speech recognition');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
  }

  public setOnResult(callback: (result: VoiceRecognitionResult) => void): void {
    this.onResult = callback;
  }

  public setOnError(callback: (error: string) => void): void {
    this.onError = callback;
  }

  public setOnStart(callback: () => void): void {
    this.onStart = callback;
  }

  public setOnEnd(callback: () => void): void {
    this.onEnd = callback;
  }

  public get supported(): boolean {
    return this.isSupported;
  }

  public get listening(): boolean {
    return this.isListening;
  }
}

export class VoiceSynthesisManager {
  private synthesis: SpeechSynthesis;
  private isSupported: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private defaultVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.checkSupport();
    if (this.isSupported) {
      this.initializeSynthesis();
    }
  }

  private checkSupport(): void {
    this.isSupported = !!window.speechSynthesis;
  }

  private initializeSynthesis(): void {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();

    // Handle voice loading for different browsers
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
    
    // Find a good default English voice
    this.defaultVoice = this.voices.find(voice => 
      voice.lang.startsWith('en') && voice.default
    ) || this.voices.find(voice => 
      voice.lang.startsWith('en')
    ) || this.voices[0] || null;
  }

  public speak(text: string, options?: VoiceSynthesisOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      if (options?.voice) {
        utterance.voice = options.voice;
      } else if (this.defaultVoice) {
        utterance.voice = this.defaultVoice;
      }

      utterance.rate = options?.rate ?? 1;
      utterance.pitch = options?.pitch ?? 1;
      utterance.volume = options?.volume ?? 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  public stop(): void {
    if (this.isSupported) {
      this.synthesis.cancel();
    }
  }

  public pause(): void {
    if (this.isSupported) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.isSupported) {
      this.synthesis.resume();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  public get supported(): boolean {
    return this.isSupported;
  }

  public get speaking(): boolean {
    return this.isSupported && this.synthesis.speaking;
  }

  public get paused(): boolean {
    return this.isSupported && this.synthesis.paused;
  }
}

// Utility functions
export function checkVoiceSupport(): {
  speechRecognition: boolean;
  speechSynthesis: boolean;
} {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      speechRecognition: false,
      speechSynthesis: false
    };
  }

  // Check for SpeechRecognition (with vendor prefixes)
  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;

  // Check for SpeechSynthesis
  const speechSynthesisSupported = !!(
    window.speechSynthesis && 
    typeof window.speechSynthesis.speak === 'function'
  );

  const speechRecognitionSupported = !!(
    SpeechRecognition && 
    typeof SpeechRecognition === 'function'
  );

  // Additional check for HTTPS requirement in many browsers
  const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  // Debug logging
  console.log('Voice Support Debug:', {
    SpeechRecognition: !!SpeechRecognition,
    speechSynthesis: !!window.speechSynthesis,
    speechSynthesisSpeak: !!(window.speechSynthesis && typeof window.speechSynthesis.speak === 'function'),
    isSecureContext,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent
  });

  const result = {
    speechRecognition: speechRecognitionSupported && isSecureContext,
    speechSynthesis: speechSynthesisSupported
  };

  console.log('Final voice support result:', result);
  return result;
}

export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Close the stream immediately as we only needed to check permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}
