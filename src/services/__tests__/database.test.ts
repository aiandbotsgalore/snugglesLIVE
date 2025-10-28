import { databaseService } from '../database';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe('DatabaseService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all sessions correctly', async () => {
    const mockData = [
      {
        session_id: '123',
        last_activity: new Date().toISOString(),
        message_count: 5,
      },
    ];

    (supabase.rpc as jest.Mock).mockReturnValue({
      data: mockData,
      error: null,
    });

    const sessions = await databaseService.getAllSessions();

    expect(supabase.rpc).toHaveBeenCalledWith('get_all_sessions');
    expect(sessions).toEqual(mockData);
  });
});
