import type { VoiceSettings } from '../types';

/**
 * A service class for handling browser-based speech recognition (Speech-to-Text)
 * and speech synthesis (Text-to-Speech). It wraps the Web Speech API.
 */
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

  /**
   * Creates an instance of the SpeechService.
   * @param {VoiceSettings} [voiceSettings={ voice_name: '', rate: 1.0, pitch: 1.0 }] - Initial voice settings for speech synthesis.
   */
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

  /**
   * Starts the speech recognition service.
   * Will request microphone permission if not already granted.
   * Emits transcripts via the `onTranscript` callback.
   */
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

  /**
   * Stops the speech recognition service.
   */
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

  /**
   * Checks if the speech recognition service is currently active.
   * @returns {boolean} True if listening, false otherwise.
   */
  isListening(): boolean {
    return this.isListeningFlag;
  }

  /**
   * Speaks the given text using speech synthesis.
   * @param {string} text - The text to be spoken.
   * @returns {Promise<void>} A promise that resolves when the speech is finished, or rejects on error.
   */
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

  /**
   * Immediately stops any ongoing speech synthesis.
   */
  stopSpeaking(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  /**
   * Checks if the speech synthesis is currently active.
   * @returns {boolean} True if speaking, false otherwise.
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  /**
   * Gets a list of available speech synthesis voices from the browser.
   * @returns {SpeechSynthesisVoice[]} An array of available voices.
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  /**
   * Updates the voice settings for speech synthesis.
   * @param {Partial<VoiceSettings>} settings - An object with the voice settings to update.
   */
  updateVoiceSettings(settings: Partial<VoiceSettings>): void {
    this.voiceSettings = { ...this.voiceSettings, ...settings };
  }

  /**
   * Registers a callback function to handle speech recognition transcripts.
   * @param {(transcript: string, isFinal: boolean) => void} callback - The function to call with new transcripts.
   */
  onTranscript(callback: (transcript: string, isFinal: boolean) => void): void {
    this.onTranscriptCallback = callback;
  }

  /**
   * Registers a callback function for when speech recognition ends.
   * @param {() => void} callback - The function to call when recognition ends.
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * Registers a callback function for speech recognition errors.
   * @param {(error: string) => void} callback - The function to call with an error message.
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Registers a callback for when speech synthesis starts.
   * @param {() => void} callback - The function to call.
   */
  onSpeakingStart(callback: () => void): void {
    this.onSpeakingStartCallback = callback;
  }

  /**
   * Registers a callback for when speech synthesis ends.
   * @param {() => void} callback - The function to call.
   */
  onSpeakingEnd(callback: () => void): void {
    this.onSpeakingEndCallback = callback;
  }

  /**
   * Checks if the Web Speech API is supported in the current browser.
   * @returns {boolean} True if both recognition and synthesis are supported.
   */
  isSupported(): boolean {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!(SpeechRecognition && window.speechSynthesis);
  }

  /**
   * Cleans up all resources and listeners used by the service.
   * This should be called when the component using the service unmounts.
   */
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
