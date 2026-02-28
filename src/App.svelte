<script lang="ts">
  import ErrorFallback from './lib/components/ErrorFallback.svelte'
  import ClearButton from './lib/components/ClearButton.svelte'
  import CouponForm from './lib/components/CouponForm.svelte'
  import CouponList from './lib/components/CouponList.svelte'
  import DownloadButton from './lib/components/DownloadButton.svelte'
  import PreviewPanel from './lib/components/PreviewPanel.svelte'
  import Section from './lib/components/Section.svelte'
  import StatusAnnouncer from './lib/components/StatusAnnouncer.svelte'
  import ThemePicker from './lib/components/ThemePicker.svelte'
  import { UuidGenerator } from './lib/domain/id-generator'
  import { THEME_REGISTRY } from './lib/domain/themes'
  import { LocalStorageAdapter } from './lib/persistence/local-storage-adapter'
  import { SessionSerializer } from './lib/persistence/session-serializer'
  import { AppContext } from './lib/stores/context'
  import { CouponStore } from './lib/stores/coupon-store.svelte'
  import { PersistenceManager } from './lib/stores/persistence-manager.svelte'
  import { StatusStore } from './lib/stores/status-store.svelte'
  import { ThemeStore } from './lib/stores/theme-store.svelte'

  const couponStore = new CouponStore(new UuidGenerator())
  const themeStore = new ThemeStore(THEME_REGISTRY)
  const statusStore = new StatusStore()

  const storage = new LocalStorageAdapter(localStorage)
  const serializer = new SessionSerializer(THEME_REGISTRY)
  const persistenceManager = new PersistenceManager(
    storage,
    serializer,
    couponStore,
    themeStore,
  )

  const ctx = new AppContext(couponStore, themeStore, statusStore, persistenceManager)
  ctx.provide()

  let showSheet = $state(false)
</script>

<svelte:boundary onerror={(error) => console.error('Petit Coupon rendering error:', error)}>
  <StatusAnnouncer />
  <header class="app-header">
    <h1 class="app-title">Petit Coupon</h1>
    <p class="app-subtitle">Printable love coupons, made simple</p>
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

  {#snippet failed(error, reset)}
    <ErrorFallback {error} {reset} />
  {/snippet}
</svelte:boundary>

<style>
  .app-header {
    text-align: center;
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 20px 10px;
  }

  .app-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 36px;
    font-weight: 400;
    color: var(--ui-text-primary);
    margin: 0;
    letter-spacing: -0.5px;
  }

  .app-subtitle {
    font-size: 15px;
    font-weight: 400;
    color: var(--ui-text-muted);
    margin: 6px 0 0;
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
    transition: all 0.15s ease;
  }

  .sheet-toggle:hover {
    background: var(--ui-bg-hover);
  }

  @media (max-width: 768px) {
    .layout {
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 16px 16px 40px;
    }

    .sidebar {
      position: static;
    }

    .app-header {
      padding: 24px 16px 8px;
    }

    .app-title {
      font-size: 30px;
    }

    .app-subtitle {
      font-size: 14px;
    }

    .sheet-toggle {
      min-height: 36px;
      padding: 6px 12px;
    }
  }

  @media (max-width: 480px) {
    .layout {
      gap: 16px;
      padding: 12px 12px 32px;
    }

    .app-header {
      padding: 16px 12px 6px;
    }

    .app-title {
      font-size: 24px;
    }

    .app-subtitle {
      font-size: 13px;
    }
  }
</style>
