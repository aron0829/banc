<script lang="ts">
  let { on, label, onchange }: { on: boolean; label: string; onchange: (on: boolean) => void } = $props();
</script>

<button class="switch" class:on role="switch" aria-checked={on} aria-label={label} onclick={() => onchange(!on)}>
  <span class="knob"></span>
</button>

<style>
  .switch {
    position: relative;
    width: 42px;
    height: 22px;
    border-radius: 11px;
    border: 1px solid var(--frame);
    background: transparent;
    flex: none;
    transition: background 0.15s;
  }
  .knob {
    position: absolute;
    top: 50%;
    left: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--frame);
    transform: translateY(-50%);
    transition: left 0.15s, background 0.15s;
  }
  .switch.on {
    background: var(--frame);
  }
  .switch.on .knob {
    left: 25px;
    background: var(--surface);
  }
</style>
