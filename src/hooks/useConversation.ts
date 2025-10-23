import { useState, useEffect, useCallback, useRef } from 'react';
import { databaseService } from '../services/database';
import { getGeminiService, isGeminiServiceInitialized } from '../services/gemini';
import { SpeechService } from '../services/speech';
import type { Message, AvatarState, UserPreferences } from '../types';
import { generateSessionId, getCurrentSessionId, setCurrentSessionId } from '../utils/session';

/**
 * A comprehensive hook for managing the entire conversation flow.
 * It handles state for messages, speech recognition, speech synthesis,
 * AI interaction, and avatar state. It also interfaces with database,
 * AI, and speech services.
 *
 * @param {UserPreferences} preferences - The user's current preferences, which affect
 *   speech synthesis and conversation memory.
 * @returns {object} An object containing the conversation state and control functions.
 * @property {Message[]} messages - An array of messages in the current conversation.
 * @property {string} currentTranscript - The real-time transcript from speech recognition.
 * @property {AvatarState} avatarState - The current state of the avatar ('idle', 'listening', 'thinking', 'speaking').
 * @property {boolean} isListening - True if the microphone is actively listening.
 * @property {boolean} isSpeaking - True if the AI is currently speaking.
 * @property {boolean} isProcessing - True if an AI response is being generated.
 * @property {string | null} error - Any error message that has occurred.
 * @property {string} sessionId - The unique identifier for the current conversation session.
 * @property {() => void} startListening - Function to start speech recognition.
 * @property {() => void} stopListening - Function to stop speech recognition.
 * @property {() => void} stopSpeaking - Function to interrupt and stop AI speech.
 * @property {() => void} clearError - Function to clear the current error message.
 */
export function useConversation(preferences: UserPreferences) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const speechServiceRef = useRef<SpeechService | null>(null);
  const pendingTranscriptRef = useRef<string>('');
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initSession = async () => {
      let currentSession = getCurrentSessionId();

      if (!currentSession) {
        currentSession = generateSessionId();
        setCurrentSessionId(currentSession);
      }

      setSessionId(currentSession);

      if (preferences.memory_enabled) {
        try {
          const loadedMessages = await databaseService.getConversationMessages(currentSession);
          setMessages(loadedMessages);
        } catch (err) {
          console.error('Failed to load conversation history:', err);
        }
      }
    };

    initSession();
  }, [preferences.memory_enabled]);

  useEffect(() => {
    const speechService = new SpeechService({
      voice_name: preferences.voice_name,
      rate: preferences.voice_rate,
      pitch: preferences.voice_pitch
    });

    speechService.onTranscript((transcript, isFinal) => {
      setCurrentTranscript(transcript);
      pendingTranscriptRef.current = transcript;

      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }

      if (isFinal && transcript.trim()) {
        transcriptTimeoutRef.current = setTimeout(() => {
          handleUserSpeech(transcript.trim());
        }, 1000);
      } else if (!isFinal) {
        transcriptTimeoutRef.current = setTimeout(() => {
          if (pendingTranscriptRef.current.trim()) {
            handleUserSpeech(pendingTranscriptRef.current.trim());
          }
        }, 2000);
      }
    });

    speechService.onError((errorMsg) => {
      setError(errorMsg);
      setIsListening(false);
      setAvatarState('idle');
    });

    speechService.onSpeakingStart(() => {
      setIsSpeaking(true);
      setAvatarState('speaking');
    });

    speechService.onSpeakingEnd(() => {
      setIsSpeaking(false);
      if (!isListening && !isProcessing) {
        setAvatarState('idle');
      }
    });

    speechServiceRef.current = speechService;

    return () => {
      speechService.cleanup();
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }
    };
  }, [preferences.voice_name, preferences.voice_rate, preferences.voice_pitch]);

  const handleUserSpeech = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
      transcriptTimeoutRef.current = null;
    }

    setCurrentTranscript('');
    pendingTranscriptRef.current = '';
    speechServiceRef.current?.stopListening();
    setIsListening(false);
    setIsProcessing(true);
    setAvatarState('thinking');

    const userMessage: Omit<Message, 'id' | 'created_at'> = {
      session_id: sessionId,
      role: 'user',
      content: text,
      metadata: {}
    };

    try {
      const savedUserMessage = await databaseService.saveMessage(userMessage);
      setMessages((prev) => [...prev, savedUserMessage]);

      if (!isGeminiServiceInitialized()) {
        throw new Error('Gemini API is not configured. Please set your API key in settings.');
      }

      const geminiService = getGeminiService();
      const allMessages = [...messages, savedUserMessage];

      const summary = await databaseService.getSummary(sessionId);
      const aiResponse = await geminiService.generateResponse(
        allMessages,
        summary?.summary
      );

      const aiMessage: Omit<Message, 'id' | 'created_at'> = {
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse,
        metadata: {}
      };

      const savedAiMessage = await databaseService.saveMessage(aiMessage);
      setMessages((prev) => [...prev, savedAiMessage]);

      setIsProcessing(false);

      await speechServiceRef.current?.speak(aiResponse);

      if (messages.length > 20) {
        await databaseService.saveSummary({
          session_id: sessionId,
          summary: `Conversation with ${messages.length} messages. Recent topics discussed.`,
          message_count: messages.length
        });
      }
    } catch (err) {
      console.error('Error processing message:', err);
      setError(err instanceof Error ? err.message : 'Failed to process message');
      setIsProcessing(false);
      setAvatarState('idle');
    }
  }, [sessionId, messages, isProcessing]);

  const startListening = useCallback(() => {
    if (!speechServiceRef.current?.isSupported()) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setError(null);
    speechServiceRef.current?.startListening();
    setIsListening(true);
    setAvatarState('listening');
  }, []);

  const stopListening = useCallback(() => {
    speechServiceRef.current?.stopListening();
    setIsListening(false);
    if (!isSpeaking && !isProcessing) {
      setAvatarState('idle');
    }
  }, [isSpeaking, isProcessing]);

  const stopSpeaking = useCallback(() => {
    speechServiceRef.current?.stopSpeaking();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    currentTranscript,
    avatarState,
    isListening,
    isSpeaking,
    isProcessing,
    error,
    sessionId,
    startListening,
    stopListening,
    stopSpeaking,
    clearError
  };
}
