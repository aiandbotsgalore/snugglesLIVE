import { supabase } from '../lib/supabase';
import type { Message, ConversationSummary, UserPreferences } from '../types';

/**
 * Provides a service layer for interacting with the Supabase database.
 * This class encapsulates all database operations related to conversations,
 * user preferences, and session management.
 */
export class DatabaseService {
  /**
   * Saves a single message to the database.
   * @param {Omit<Message, 'id' | 'created_at'>} message - The message object to save.
   * @returns {Promise<Message>} A promise that resolves with the saved message, including its new ID and timestamp.
   * @throws {Error} If the database operation fails.
   */
  async saveMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const { data, error } = await supabase
      .from('conversations')
      .insert([message])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves all messages for a given session ID, ordered by creation time.
   * @param {string} sessionId - The ID of the session to retrieve messages for.
   * @returns {Promise<Message[]>} A promise that resolves with an array of messages.
   * @throws {Error} If the database operation fails.
   */
  async getConversationMessages(sessionId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Fetches a summary of all conversation sessions, including session ID, last activity, and message count.
   * @returns {Promise<Array<{ session_id: string; last_activity: string; message_count: number }>>} A promise that resolves with an array of session summary objects.
   * @throws {Error} If the database operation fails.
   */
  async getAllSessions(): Promise<Array<{ session_id: string; last_activity: string; message_count: number }>> {
    const { data, error } = await supabase.rpc('get_all_sessions');

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    return data;
  }

  /**
   * Deletes all messages and the summary for a specific session ID.
   * @param {string} sessionId - The ID of the session to delete.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   * @throws {Error} If the database operation fails.
   */
  async deleteSession(sessionId: string): Promise<void> {
    const { error: messagesError } = await supabase
      .from('conversations')
      .delete()
      .eq('session_id', sessionId);

    if (messagesError) {
      throw new Error(`Failed to delete messages: ${messagesError.message}`);
    }

    const { error: summaryError } = await supabase
      .from('conversation_summaries')
      .delete()
      .eq('session_id', sessionId);

    if (summaryError && summaryError.code !== 'PGRST116') {
      throw new Error(`Failed to delete summary: ${summaryError.message}`);
    }
  }

  /**
   * Saves or updates a conversation summary.
   * @param {Omit<ConversationSummary, 'id' | 'created_at' | 'updated_at'>} summary - The summary object to save.
   * @returns {Promise<ConversationSummary>} A promise that resolves with the saved summary.
   * @throws {Error} If the database operation fails.
   */
  async saveSummary(summary: Omit<ConversationSummary, 'id' | 'created_at' | 'updated_at'>): Promise<ConversationSummary> {
    const { data, error } = await supabase
      .from('conversation_summaries')
      .upsert([{ ...summary, updated_at: new Date().toISOString() }], {
        onConflict: 'session_id'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save summary: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves the summary for a specific session ID.
   * @param {string} sessionId - The ID of the session to get the summary for.
   * @returns {Promise<ConversationSummary | null>} A promise that resolves with the summary, or null if not found.
   * @throws {Error} If the database operation fails.
   */
  async getSummary(sessionId: string): Promise<ConversationSummary | null> {
    const { data, error } = await supabase
      .from('conversation_summaries')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch summary: ${error.message}`);
    }

    return data;
  }

  /**
   * Saves or updates user preferences.
   * @param {Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>} preferences - The preferences object to save.
   * @returns {Promise<UserPreferences>} A promise that resolves with the saved preferences.
   * @throws {Error} If the database operation fails.
   */
  async savePreferences(preferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{ ...preferences, updated_at: new Date().toISOString() }], {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save preferences: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves user preferences for a given user ID.
   * @param {string} userId - The ID of the user to retrieve preferences for.
   * @returns {Promise<UserPreferences | null>} A promise that resolves with the user's preferences, or null if not found.
   * @throws {Error} If the database operation fails.
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch preferences: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves user preferences for a given user ID, creating them with default values if they don't exist.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<UserPreferences>} A promise that resolves with the user's preferences.
   */
  async getOrCreatePreferences(userId: string): Promise<UserPreferences> {
    const existing = await this.getPreferences(userId);

    if (existing) {
      return existing;
    }

    return this.savePreferences({
      user_id: userId,
      voice_name: '',
      voice_rate: 1.0,
      voice_pitch: 1.0,
      theme: 'dark',
      memory_enabled: true,
      push_to_talk: false
    });
  }
}

export const databaseService = new DatabaseService();
