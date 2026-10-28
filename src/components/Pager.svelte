<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    index,
    dx = 0,
    dragging = false,
    width = $bindable(0),
    left,
    right,
  }: { index: 0 | 1; dx?: number; dragging?: boolean; width?: number; left: Snippet; right: Snippet } = $props();
</script>

<!-- Both pages sit side by side; while swiping the track follows the finger, otherwise it slides into place. -->
<div class="pager" bind:clientWidth={width}>
  <div class="track" class:dragging style:transform="translateX(calc({-index * 100}% + {dx}px))">
    <div class="pane" inert={!dragging && index !== 0}>{@render left()}</div>
    <div class="pane" inert={!dragging && index !== 1}>{@render right()}</div>
  </div>
</div>

<style>
  /* bleeds into the page padding so pages slide in from the screen edge */
  .pager {
    flex: 1 1 0;
    min-height: 0;
    margin: 0 -20px;
    overflow: hidden;
  }
  .track {
    display: flex;
    height: 100%;
    transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .track.dragging {
    transition: none;
  }
  .pane {
    flex: 0 0 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 0 20px;
  }
  @media (prefers-reduced-motion: reduce) {
    .track {
      transition: none;
    }
  }
</style>
