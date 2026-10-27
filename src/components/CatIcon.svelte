<script lang="ts">
  import { Ellipsis } from '@lucide/svelte';
  import { CATEGORY_ICONS } from '../lib/icons';

  let { name, size = 18 }: { name: string; size?: number } = $props();
  const Icon = $derived(CATEGORY_ICONS[name] ?? Ellipsis);
</script>

<Icon {size} strokeWidth={1.6} />
