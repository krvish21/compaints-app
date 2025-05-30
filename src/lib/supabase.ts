import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = 'Vish' | 'Sabaa';

// Type definitions for our database schema
export interface Complaint {
  id: number;
  user_name: User;
  title: string;
  description: string;
  mood: string;
  escalated: boolean;
  resolved: boolean;
  created_at: string;
}

export interface Reply {
  id: number;
  complaint_id: number;
  user_name: User;
  text: string;
  created_at: string;
  parent_reply_id: number | null;
}

export interface Reaction {
  id: number;
  reply_id: number;
  user_name: User;
  emoji: string;
}

export interface Compensation {
  id: number;
  title: string;
  description: string;
  created_by: 'Sabaa';
  created_at: string;
}

export interface OfferedCompensation {
  id: number;
  complaint_id: number;
  compensation_id: number;
  scratched: boolean;
  selected: boolean;
  order: number;
}

export interface FulfilledCompensation {
  id: number;
  offered_compensation_id: number;
  fulfilled_by: 'Vish';
  fulfilled_at: string;
} 