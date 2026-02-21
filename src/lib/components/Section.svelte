<script lang="ts">
  import type { Snippet } from 'svelte'

  const { label, suffix, children }: { label: string; suffix?: string | undefined; children: Snippet } = $props()
</script>

<section class="card-section">
  <h2 class="label">{label}{#if suffix}<span class="suffix"> {suffix}</span>{/if}</h2>
  {@render children()}
</section>

<style>
  .card-section {
    background-color: var(--ui-card-bg);
    border: 1px solid var(--ui-card-border);
    border-radius: 14px;
    padding: 20px 24px;
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: var(--ui-label-text);
    margin: 0 0 12px;
  }

  .suffix {
    color: var(--ui-label-suffix);
    font-weight: 500;
  }
</style>
