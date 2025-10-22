export type MessageRole = 'user' | 'assistant';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type Theme = 'dark' | 'light';

export interface Message {
  id: string;
  session_id: string;
  user_id?: string;
  role: MessageRole;
  content: string;
  audio_duration?: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ConversationSummary {
  id: string;
  session_id: string;
  summary: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  voice_name: string;
  voice_rate: number;
  voice_pitch: number;
  theme: Theme;
  memory_enabled: boolean;
  push_to_talk: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoiceSettings {
  voice_name: string;
  rate: number;
  pitch: number;
}

export interface ConversationSession {
  session_id: string;
  messages: Message[];
  summary?: ConversationSummary;
  started_at: string;
  last_activity: string;
}

export interface GeminiRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  systemPrompt?: string;
}

export interface GeminiResponse {
  content: string;
  error?: string;
}

export interface AudioLevel {
  input: number;
  output: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface AppState {
  avatarState: AvatarState;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  connectionStatus: ConnectionStatus;
  currentSession: string | null;
  audioLevels: AudioLevel;
}
