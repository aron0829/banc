<script lang="ts">
  import { Check, Lock, User } from '@lucide/svelte';
  import { login } from '../lib/supabase';
  import Field from './Field.svelte';
  import RoundButton from './RoundButton.svelte';

  let password = $state('');
  let wrong = $state(false);
  let busy = $state(false);

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!password.trim() || busy) return;
    busy = true;
    wrong = !(await login(password));
    busy = false;
  }
</script>

<form class="login" onsubmit={submit}>
  <h1><User size={22} strokeWidth={1.6} />Anmelden</h1>
  <Field icon={Lock} label="Password" invalid={wrong}>
    <input
      type="password"
      bind:value={password}
      oninput={() => (wrong = false)}
      autocomplete="current-password"
      aria-label="Passwort"
    />
  </Field>
  {#if wrong}<p class="error">Falsches Passwort</p>{/if}
  <div class="submit">
    <!-- RoundButton renders a plain <button>, which submits the form -->
    <RoundButton label="Anmelden" size={38} strong disabled={busy}>
      <Check size={22} strokeWidth={2.2} />
    </RoundButton>
  </div>
</form>

<style>
  .login {
    margin: 26dvh auto 0;
    max-width: 360px;
    border: 1px solid var(--frame);
    border-radius: 22px;
    box-shadow: var(--shadow);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  h1 {
    margin: 0;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  .error {
    margin: -6px 0 0;
    text-align: center;
    color: var(--danger);
    font-size: 13px;
  }
  .submit {
    display: flex;
    justify-content: center;
  }
</style>
