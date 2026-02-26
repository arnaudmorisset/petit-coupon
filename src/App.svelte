<script lang="ts">
  import ClearButton from './lib/components/ClearButton.svelte'
  import CouponForm from './lib/components/CouponForm.svelte'
  import CouponList from './lib/components/CouponList.svelte'
  import DownloadButton from './lib/components/DownloadButton.svelte'
  import PreviewPanel from './lib/components/PreviewPanel.svelte'
  import Section from './lib/components/Section.svelte'
  import ThemePicker from './lib/components/ThemePicker.svelte'
  import { UuidGenerator } from './lib/domain/id-generator'
  import { THEME_REGISTRY } from './lib/domain/themes'
  import { LocalStorageAdapter } from './lib/persistence/local-storage-adapter'
  import { SessionSerializer } from './lib/persistence/session-serializer'
  import { AppContext } from './lib/stores/context'
  import { CouponStore } from './lib/stores/coupon-store.svelte'
  import { PersistenceManager } from './lib/stores/persistence-manager.svelte'
  import { StepperStore } from './lib/stores/stepper-store.svelte'
  import { ThemeStore } from './lib/stores/theme-store.svelte'

  const couponStore = new CouponStore(new UuidGenerator())
  const themeStore = new ThemeStore(THEME_REGISTRY)
  const stepperStore = new StepperStore(couponStore)

  const storage = new LocalStorageAdapter(localStorage)
  const serializer = new SessionSerializer(THEME_REGISTRY)
  const persistenceManager = new PersistenceManager(
    storage,
    serializer,
    couponStore,
    themeStore,
  )

  const ctx = new AppContext(couponStore, themeStore, stepperStore, persistenceManager)
  ctx.provide()

  let showSheet = $state(false)
</script>

<header>
  <h1>Petit Coupon</h1>
</header>

<div class="layout">
  <div class="workspace">
    <Section label="Choose a Theme">
      <ThemePicker />
    </Section>
    <Section label="Add a Coupon">
      <CouponForm />
    </Section>
    {#if !couponStore.isEmpty}
      <Section label="Your Coupons" suffix="({couponStore.count})">
        {#snippet action()}
          <button class="sheet-toggle" onclick={() => showSheet = !showSheet}
            type="button" aria-label="Toggle sheet preview">
            {showSheet ? 'Hide' : 'Show'} sheet preview
          </button>
        {/snippet}
        <CouponList />
      </Section>
    {/if}
  </div>

  <div class="sidebar">
    <Section label={showSheet ? 'Print Preview' : 'Preview'}>
      <PreviewPanel {showSheet} />
    </Section>
    <DownloadButton />
    {#if !couponStore.isEmpty}
      <ClearButton />
    {/if}
  </div>
</div>

<style>
  header {
    text-align: center;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .layout {
    max-width: 1100px;
    margin: 0 auto;
    padding: 20px 24px 60px;
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 32px;
    align-items: start;
  }

  .workspace {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .sidebar {
    position: sticky;
    top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sheet-toggle {
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--ui-border);
    background: var(--ui-card-bg);
    font-size: 11px;
    color: var(--ui-text-muted);
    cursor: pointer;
    transition: background 0.1s ease;
  }

  .sheet-toggle:hover {
    background: var(--ui-bg-hover);
  }

  @media (max-width: 768px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .sidebar {
      position: static;
    }
  }
</style>
