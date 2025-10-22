/*
  # Big Snuggles Live - Conversations Database Schema

  ## Overview
  Creates the core database structure for storing conversation sessions, messages, 
  summaries, and user preferences for the Big Snuggles Live AI application.

  ## New Tables
  
  ### 1. `conversations`
  Main table storing all conversation messages between users and Big Snuggles AI.
  - `id` (uuid, primary key) - Unique message identifier
  - `session_id` (uuid) - Groups messages into conversation sessions
  - `user_id` (text, nullable) - Optional user identifier for future auth
  - `role` (text) - Message sender: 'user' or 'assistant'
  - `content` (text) - Message text content
  - `audio_duration` (integer, nullable) - Duration of audio playback in milliseconds
  - `created_at` (timestamptz) - Message timestamp
  - `metadata` (jsonb, nullable) - Additional data (voice settings, errors, etc)

  ### 2. `conversation_summaries`
  Stores compressed summaries of conversations for efficient context loading.
  - `id` (uuid, primary key) - Unique summary identifier
  - `session_id` (uuid) - Reference to conversation session
  - `summary` (text) - Compressed conversation context
  - `message_count` (integer) - Number of messages summarized
  - `created_at` (timestamptz) - Summary creation time
  - `updated_at` (timestamptz) - Last summary update

  ### 3. `user_preferences`
  Stores user settings and preferences for voice, UI, and memory options.
  - `id` (uuid, primary key) - Unique preference record identifier
  - `user_id` (text) - User identifier (device ID or future auth ID)
  - `voice_name` (text) - Selected TTS voice
  - `voice_rate` (real) - Speech rate (0.5 to 2.0)
  - `voice_pitch` (real) - Speech pitch (0.5 to 2.0)
  - `theme` (text) - UI theme: 'dark' or 'light'
  - `memory_enabled` (boolean) - Whether to persist conversations
  - `push_to_talk` (boolean) - Voice activation mode
  - `created_at` (timestamptz) - Preference creation time
  - `updated_at` (timestamptz) - Last preference update

  ## Security
  - Enable RLS on all tables
  - Public access for anonymous users (no auth required for MVP)
  - Future: policies can be added to restrict access by user_id

  ## Performance
  - Indexes on session_id for fast conversation retrieval
  - Indexes on created_at for chronological ordering
  - Indexes on user_id for future multi-user support
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id text,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  audio_duration integer,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create conversation_summaries table
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE,
  summary text NOT NULL,
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  voice_name text DEFAULT '',
  voice_rate real DEFAULT 1.0 CHECK (voice_rate BETWEEN 0.5 AND 2.0),
  voice_pitch real DEFAULT 1.0 CHECK (voice_pitch BETWEEN 0.5 AND 2.0),
  theme text DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  memory_enabled boolean DEFAULT true,
  push_to_talk boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_session_id ON conversation_summaries(session_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access (MVP - no authentication required)
-- Note: In production with auth, these should be restricted to authenticated users

CREATE POLICY "Allow public read access to conversations"
  ON conversations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to conversations"
  ON conversations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to conversations"
  ON conversations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from conversations"
  ON conversations FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to conversation_summaries"
  ON conversation_summaries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to conversation_summaries"
  ON conversation_summaries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to conversation_summaries"
  ON conversation_summaries FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from conversation_summaries"
  ON conversation_summaries FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to user_preferences"
  ON user_preferences FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to user_preferences"
  ON user_preferences FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to user_preferences"
  ON user_preferences FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from user_preferences"
  ON user_preferences FOR DELETE
  TO public
  USING (true);