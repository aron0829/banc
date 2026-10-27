import { createClient } from '@supabase/supabase-js';
import { profileEmail, profilePassword } from './profile';

// Public by design: access is protected by row level security (see supabase/schema.sql).
const URL = 'https://dmgdamwewwdnkvzllsna.supabase.co';
const KEY = 'sb_publishable_nc6-t19izVzys0IJhNMDAA_6aIxoO31';

export const supabase = createClient(URL, KEY);

export async function login(password: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({
    email: profileEmail(password),
    password: profilePassword(password),
  });
  return !error;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
