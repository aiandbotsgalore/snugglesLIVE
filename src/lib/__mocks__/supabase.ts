// src/lib/__mocks__/supabase.ts
const fromObj = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
  single: jest.fn(),
};

export const supabase = {
  from: jest.fn(() => fromObj),
};
