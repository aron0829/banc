import { monthOf, todayDay } from './dates';
import { defaultData, type Data } from './model';
import { profileName } from './profile';
import { Saver, type SaveResult } from './saver';
import { logout as authLogout, supabase } from './supabase';
import { refreshToday } from './ui.svelte';

const ERROR_NOTICE = 'Nicht gespeichert – erneuter Versuch';

class Store {
  data = $state.raw<Data | null>(null);
  userId = $state<string | null>(null);
  profile = $state('');
  notice = $state<string | null>(null);
  ready = $state(false);
}

export const app = new Store();

/** Counts local changes so a slow load can't overwrite a newer edit. */
let changes = 0;

function flash(text: string) {
  app.notice = text;
  setTimeout(() => app.notice === text && (app.notice = null), 4000);
}

async function update(data: unknown, expected: number): Promise<SaveResult> {
  const { data: rows, error } = await supabase
    .from('profiles_data')
    .update({ data, version: expected + 1, updated_at: new Date().toISOString() })
    .eq('user_id', app.userId!)
    .eq('version', expected)
    .select('version');
  if (error) return { ok: false, conflict: false };
  if (!rows?.length) return { ok: false, conflict: true };
  return { ok: true, version: rows[0].version };
}

const saver = new Saver(
  update,
  () => app.data,
  {
    onConflict: async () => {
      await load();
      flash('Auf anderem Gerät geändert – neu geladen');
    },
    onError: () => (app.notice = ERROR_NOTICE),
    onSaved: () => app.notice === ERROR_NOTICE && (app.notice = null),
  },
  400,
  5000,
);

/** Loads the profile document; creates it with default data on first login. */
export async function load(): Promise<void> {
  if (!app.userId) return;
  const stamp = changes;
  const { data: row, error } = await supabase.from('profiles_data').select('data, version').eq('user_id', app.userId).maybeSingle();
  if (error) {
    flash('Laden fehlgeschlagen – bitte Internet prüfen');
    return;
  }
  if (stamp !== changes || saver.busy) return;
  if (row) {
    app.data = row.data as Data;
    saver.version = row.version;
    return;
  }
  const fresh = defaultData(monthOf(todayDay()));
  const { error: insertError } = await supabase.from('profiles_data').insert({ user_id: app.userId, data: fresh, version: 1 });
  if (insertError) return load();
  app.data = fresh;
  saver.version = 1;
}

/** Applies a change locally and saves it shortly after. */
export function commit(next: Data): void {
  changes++;
  app.data = next;
  saver.schedule();
}

async function setUser(id: string | null, email?: string) {
  if (id === app.userId) return;
  saver.reset();
  app.userId = id;
  app.profile = profileName(email);
  app.data = null;
  if (id) await load();
}

export async function init(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  await setUser(data.session?.user.id ?? null, data.session?.user.email);
  app.ready = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => setUser(session?.user.id ?? null, session?.user.email));
  });
  const refresh = () => {
    if (document.visibilityState === 'hidden') {
      saver.flushNow();
      return;
    }
    refreshToday();
    if (!saver.busy) load();
  };
  setInterval(refreshToday, 60_000);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('focus', refresh);
}

/** Saves what is pending, then signs out. */
export async function logout(): Promise<void> {
  await saver.flushNow();
  await authLogout();
}
