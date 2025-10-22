import { supabase } from '../lib/supabase';
import type { Message, ConversationSummary, UserPreferences } from '../types';

export class DatabaseService {
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

  async getAllSessions(): Promise<Array<{ session_id: string; last_activity: string; message_count: number }>> {
    const { data, error } = await supabase
      .from('conversations')
      .select('session_id, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    const sessionMap = new Map<string, { last_activity: string; message_count: number }>();

    data?.forEach(msg => {
      const existing = sessionMap.get(msg.session_id);
      if (!existing) {
        sessionMap.set(msg.session_id, {
          last_activity: msg.created_at,
          message_count: 1
        });
      } else {
        existing.message_count++;
        if (msg.created_at > existing.last_activity) {
          existing.last_activity = msg.created_at;
        }
      }
    });

    return Array.from(sessionMap.entries()).map(([session_id, data]) => ({
      session_id,
      ...data
    }));
  }

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
