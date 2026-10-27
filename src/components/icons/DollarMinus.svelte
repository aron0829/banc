<script lang="ts">
  let { size = 24, strokeWidth = 2 }: { size?: number; strokeWidth?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 3.5v17" />
  <path d="M13.5 6.5H7.25a2.75 2.75 0 0 0 0 5.5h3.5a2.75 2.75 0 0 1 0 5.5H4.5" />
  <path d="M16.5 7h6" />
</svg>
