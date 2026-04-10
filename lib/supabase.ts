import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Clinic = {
  id: string;
  name: string;
  slug: string;
  city: string;
  city_slug: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviews_count: number | null;
  working_hours: unknown;
  photos: string[];
  services: string[];
  is_claimed: boolean;
  is_verified: boolean;
  is_active: boolean;
  source: string;
  created_at: string;
  updated_at: string;
};
