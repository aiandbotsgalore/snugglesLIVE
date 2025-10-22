import type { VoiceSettings } from '../types';

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private voiceSettings: VoiceSettings;
  private onTranscriptCallback?: (transcript: string, isFinal: boolean) => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: string) => void;
  private onSpeakingStartCallback?: () => void;
  private onSpeakingEndCallback?: () => void;
  private isListeningFlag = false;

  constructor(voiceSettings: VoiceSettings = { voice_name: '', rate: 1.0, pitch: 1.0 }) {
    this.synthesis = window.speechSynthesis;
    this.voiceSettings = voiceSettings;
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1] as any;
      const transcript = lastResult[0].transcript;
      const isFinal = lastResult.isFinal;

      if (this.onTranscriptCallback) {
        this.onTranscriptCallback(transcript, isFinal);
      }
    };

    this.recognition.onend = () => {
      if (this.isListeningFlag) {
        this.recognition?.start();
      } else if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        return;
      }

      if (event.error === 'aborted') {
        return;
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(`Speech recognition error: ${event.error}`);
      }
    };
  }

  startListening(): void {
    if (!this.recognition) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Speech recognition not available in this browser');
      }
      return;
    }

    if (this.isListeningFlag) {
      return;
    }

    this.isListeningFlag = true;
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  stopListening(): void {
    if (!this.recognition || !this.isListeningFlag) {
      return;
    }

    this.isListeningFlag = false;
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  isListening(): boolean {
    return this.isListeningFlag;
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);

      const voices = this.synthesis.getVoices();
      if (this.voiceSettings.voice_name) {
        const selectedVoice = voices.find(v => v.name === this.voiceSettings.voice_name);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.rate = this.voiceSettings.rate;
      utterance.pitch = this.voiceSettings.pitch;

      utterance.onstart = () => {
        if (this.onSpeakingStartCallback) {
          this.onSpeakingStartCallback();
        }
      };

      utterance.onend = () => {
        if (this.onSpeakingEndCallback) {
          this.onSpeakingEndCallback();
        }
        resolve();
      };

      utterance.onerror = (event) => {
        if (this.onSpeakingEndCallback) {
          this.onSpeakingEndCallback();
        }
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  updateVoiceSettings(settings: Partial<VoiceSettings>): void {
    this.voiceSettings = { ...this.voiceSettings, ...settings };
  }

  onTranscript(callback: (transcript: string, isFinal: boolean) => void): void {
    this.onTranscriptCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  onSpeakingStart(callback: () => void): void {
    this.onSpeakingStartCallback = callback;
  }

  onSpeakingEnd(callback: () => void): void {
    this.onSpeakingEndCallback = callback;
  }

  isSupported(): boolean {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!(SpeechRecognition && window.speechSynthesis);
  }

  cleanup(): void {
    this.stopListening();
    this.stopSpeaking();
    this.onTranscriptCallback = undefined;
    this.onEndCallback = undefined;
    this.onErrorCallback = undefined;
    this.onSpeakingStartCallback = undefined;
    this.onSpeakingEndCallback = undefined;
  }
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognition = any;
type SpeechRecognitionEvent = any;
