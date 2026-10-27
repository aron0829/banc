<script lang="ts">
  let { size = 24, strokeWidth = 2 }: { size?: number; strokeWidth?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="5" r="3" />
  <path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z" />
  <path d="M12 10.6v8.3" />
  <path d="M14.2 12H11.3a1.45 1.45 0 0 0 0 2.9h1.4a1.45 1.45 0 0 1 0 2.9H9.8" />
</svg>
