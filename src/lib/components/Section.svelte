<script lang="ts">
  import type { Snippet } from 'svelte'

  const { label, suffix, children, action }: {
    label: string;
    suffix?: string | undefined;
    children: Snippet;
    action?: Snippet | undefined;
  } = $props()
</script>

<section class="card-section">
  <div class="section-header">
    <h2 class="label">{label}{#if suffix}<span class="suffix"> {suffix}</span>{/if}</h2>
    {#if action}
      {@render action()}
    {/if}
  </div>
  {@render children()}
</section>

<style>
  .card-section {
    background-color: var(--ui-card-bg);
    border: 1px solid var(--ui-card-border);
    border-radius: 14px;
    padding: 20px 24px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: var(--ui-label-text);
    margin: 0;
  }

  .suffix {
    color: var(--ui-label-suffix);
    font-weight: 500;
  }
</style>
