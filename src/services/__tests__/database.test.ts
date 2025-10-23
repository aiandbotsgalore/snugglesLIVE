import { DatabaseService } from '../database';
import { supabase } from '../../lib/supabase';
import type { ConversationSummary, Message, UserPreferences } from '../../types';

jest.mock('../../lib/supabase');

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  const fromMock = supabase.from as jest.Mock;

  beforeEach(() => {
    dbService = new DatabaseService();
    jest.clearAllMocks();
  });

  describe('saveMessage', () => {
    it('should save a message and return it', async () => {
      const message: Omit<Message, 'id' | 'created_at'> = { session_id: '1', role: 'user', content: 'Hi' };
      const expectedMessage: Message = { ...message, id: '1', created_at: 'now' };

      const single = jest.fn().mockResolvedValue({ data: expectedMessage, error: null });
      const select = jest.fn(() => ({ single }));
      const insert = jest.fn(() => ({ select }));
      fromMock.mockReturnValue({ insert });

      const result = await dbService.saveMessage(message);

      expect(result).toEqual(expectedMessage);
      expect(fromMock).toHaveBeenCalledWith('conversations');
      expect(insert).toHaveBeenCalledWith([message]);
    });

    it('should throw an error if saving fails', async () => {
      const message: Omit<Message, 'id' | 'created_at'> = { session_id: '1', role: 'user', content: 'Hi' };
      const error = { message: 'DB error' };

      const single = jest.fn().mockResolvedValue({ data: null, error });
      const select = jest.fn(() => ({ single }));
      const insert = jest.fn(() => ({ select }));
      fromMock.mockReturnValue({ insert });

      await expect(dbService.saveMessage(message)).rejects.toThrow(`Failed to save message: ${error.message}`);
    });
  });

  describe('getConversationMessages', () => {
    it('should fetch messages for a given session ID', async () => {
      const sessionId = 'session-1';
      const expectedMessages: Message[] = [{ id: '1', session_id: sessionId, role: 'user', content: 'Hello', created_at: 'now' }];

      const order = jest.fn().mockResolvedValue({ data: expectedMessages, error: null });
      const eq = jest.fn(() => ({ order }));
      const select = jest.fn(() => ({ eq }));
      fromMock.mockReturnValue({ select });

      const result = await dbService.getConversationMessages(sessionId);

      expect(result).toEqual(expectedMessages);
      expect(fromMock).toHaveBeenCalledWith('conversations');
      expect(select).toHaveBeenCalledWith('*');
      expect(eq).toHaveBeenCalledWith('session_id', sessionId);
    });
  });

  describe('getAllSessions', () => {
    it('should fetch and process all sessions correctly', async () => {
      const mockData = [
        { session_id: 'session-1', created_at: '2023-01-01T13:00:00Z' },
        { session_id: 'session-2', created_at: '2023-01-02T12:00:00Z' },
        { session_id: 'session-1', created_at: '2023-01-01T12:00:00Z' },
      ];
      const order = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const select = jest.fn(() => ({ order }));
      fromMock.mockReturnValue({ select });

      const result = await dbService.getAllSessions();

      expect(result).toEqual([
        { session_id: 'session-1', last_activity: '2023-01-01T13:00:00Z', message_count: 2 },
        { session_id: 'session-2', last_activity: '2023-01-02T12:00:00Z', message_count: 1 },
      ]);
    });
  });

  describe('deleteSession', () => {
    it('should delete messages and summaries for a session', async () => {
      const sessionId = 'session-to-delete';
      const eqDelete = jest.fn().mockResolvedValue({ error: null });
      const deleteMock = jest.fn(() => ({ eq: eqDelete }));
      fromMock.mockReturnValue({ delete: deleteMock });

      await dbService.deleteSession(sessionId);

      expect(fromMock).toHaveBeenCalledWith('conversations');
      expect(fromMock).toHaveBeenCalledWith('conversation_summaries');
      expect(deleteMock).toHaveBeenCalledTimes(2);
      expect(eqDelete).toHaveBeenCalledWith('session_id', sessionId);
    });
  });

  describe('saveSummary', () => {
    it('should save a summary and return it', async () => {
      const summary: Omit<ConversationSummary, 'id' | 'created_at' | 'updated_at'> = { session_id: '1', summary: 'Test summary', message_count: 1 };
      const expectedSummary: ConversationSummary = { ...summary, id: '1', created_at: 'now', updated_at: 'now' };

      const single = jest.fn().mockResolvedValue({ data: expectedSummary, error: null });
      const select = jest.fn(() => ({ single }));
      const upsert = jest.fn(() => ({ select }));
      fromMock.mockReturnValue({ upsert });

      const result = await dbService.saveSummary(summary);

      expect(result).toEqual(expectedSummary);
      expect(fromMock).toHaveBeenCalledWith('conversation_summaries');
      expect(upsert).toHaveBeenCalled();
    });
  });

  describe('getSummary', () => {
    it('should return a summary if it exists', async () => {
      const sessionId = 'session-1';
      const summary: ConversationSummary = { id: '1', session_id: sessionId, summary: 'Test summary', created_at: 'now', updated_at: 'now', message_count: 1 };

      const maybeSingle = jest.fn().mockResolvedValue({ data: summary, error: null });
      const eq = jest.fn(() => ({ maybeSingle }));
      const select = jest.fn(() => ({ eq }));
      fromMock.mockReturnValue({ select });

      const result = await dbService.getSummary(sessionId);

      expect(result).toEqual(summary);
      expect(fromMock).toHaveBeenCalledWith('conversation_summaries');
      expect(eq).toHaveBeenCalledWith('session_id', sessionId);
    });

    it('should return null if summary does not exist', async () => {
      const sessionId = 'session-2';

      const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
      const eq = jest.fn(() => ({ maybeSingle }));
      const select = jest.fn(() => ({ eq }));
      fromMock.mockReturnValue({ select });

      const result = await dbService.getSummary(sessionId);

      expect(result).toBeNull();
    });
  });

  describe('getOrCreatePreferences', () => {
    it('should return existing preferences if found', async () => {
      const userId = 'user-1';
      const prefs: UserPreferences = { id: 'p1', user_id: userId, theme: 'dark', voice_name: 'test', created_at: 'now', updated_at: 'now', memory_enabled: true, push_to_talk: false, voice_pitch: 1, voice_rate: 1 };

      const maybeSingle = jest.fn().mockResolvedValue({ data: prefs, error: null });
      const eq = jest.fn(() => ({ maybeSingle }));
      const select = jest.fn(() => ({ eq }));
      fromMock.mockReturnValue({ select });

      const result = await dbService.getOrCreatePreferences(userId);
      expect(result).toEqual(prefs);
      expect(fromMock).toHaveBeenCalledWith('user_preferences');
      expect(eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should create new preferences if none exist', async () => {
      const userId = 'user-new';
      const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
      const eq = jest.fn(() => ({ maybeSingle }));
      const select = jest.fn(() => ({ eq }));

      const newPrefs: UserPreferences = { id: 'p2', user_id: userId, theme: 'dark', voice_name: '', created_at: 'now', updated_at: 'now', memory_enabled: true, push_to_talk: false, voice_pitch: 1, voice_rate: 1 };
      const single = jest.fn().mockResolvedValue({ data: newPrefs, error: null });
      const selectSave = jest.fn(() => ({ single }));
      const upsert = jest.fn(() => ({ select: selectSave }));

      fromMock
        .mockReturnValueOnce({ select }) // For the getPreferences call
        .mockReturnValueOnce({ upsert }); // For the savePreferences call

      const result = await dbService.getOrCreatePreferences(userId);
      expect(result).toEqual(newPrefs);
      expect(upsert).toHaveBeenCalled();
    });
  });
});
