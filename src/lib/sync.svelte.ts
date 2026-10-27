import { monthOf, todayDay } from './dates';
import { defaultData, type Data } from './model';
import { profileName } from './profile';
import { supabase } from './supabase';

const SAVE_DELAY = 400;
const RETRY_DELAY = 5000;

class Store {
  data = $state.raw<Data | null>(null);
  userId = $state<string | null>(null);
  profile = $state('');
  notice = $state<string | null>(null);
  ready = $state(false);
}

export const app = new Store();

let version = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let saving = false;

function flash(text: string) {
  app.notice = text;
  setTimeout(() => app.notice === text && (app.notice = null), 4000);
}

/** Loads the profile document; creates it with default data on first login. */
export async function load(): Promise<void> {
  if (!app.userId) return;
  const { data: row, error } = await supabase.from('profiles_data').select('data, version').eq('user_id', app.userId).maybeSingle();
  if (error) {
    flash('Laden fehlgeschlagen – bitte Internet prüfen');
    return;
  }
  if (row) {
    app.data = row.data as Data;
    version = row.version;
    return;
  }
  const fresh = defaultData(monthOf(todayDay()));
  const { error: insertError } = await supabase.from('profiles_data').insert({ user_id: app.userId, data: fresh, version: 1 });
  if (insertError) return load();
  app.data = fresh;
  version = 1;
}

async function flush(): Promise<void> {
  timer = null;
  if (!app.userId || !app.data) return;
  saving = true;
  const { data: rows, error } = await supabase
    .from('profiles_data')
    .update({ data: app.data, version: version + 1, updated_at: new Date().toISOString() })
    .eq('user_id', app.userId)
    .eq('version', version)
    .select('version');
  saving = false;
  if (error) {
    app.notice = 'Nicht gespeichert – erneuter Versuch';
    timer = setTimeout(flush, RETRY_DELAY);
    return;
  }
  if (!rows?.length) {
    await load();
    flash('Auf anderem Gerät geändert – neu geladen');
    return;
  }
  version = rows[0].version;
  if (app.notice === 'Nicht gespeichert – erneuter Versuch') app.notice = null;
}

/** Applies a change locally and saves it shortly after. */
export function commit(next: Data): void {
  app.data = next;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, SAVE_DELAY);
}

async function setUser(id: string | null, email?: string) {
  if (id === app.userId) return;
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
    if (document.visibilityState === 'visible' && !timer && !saving) load();
  };
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('focus', refresh);
}
