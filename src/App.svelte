<script lang="ts">
  import AppStepper from './lib/components/AppStepper.svelte'
  import ClearButton from './lib/components/ClearButton.svelte'
  import { UuidGenerator } from './lib/domain/id-generator'
  import { THEME_REGISTRY } from './lib/domain/themes'
  import { LocalStorageAdapter } from './lib/persistence/local-storage-adapter'
  import { SessionSerializer } from './lib/persistence/session-serializer'
  import { CouponStore } from './lib/stores/coupon-store.svelte'
  import { PersistenceManager } from './lib/stores/persistence-manager.svelte'
  import { StepperStore } from './lib/stores/stepper-store.svelte'
  import { ThemeStore } from './lib/stores/theme-store.svelte'

  const store = new CouponStore(new UuidGenerator())
  const themeStore = new ThemeStore(THEME_REGISTRY)
  const stepperStore = new StepperStore(store)

  const storage = new LocalStorageAdapter(localStorage)
  const serializer = new SessionSerializer(THEME_REGISTRY)
  const persistenceManager = new PersistenceManager(
    storage,
    serializer,
    store,
    themeStore,
  )
</script>

<main>
  <header class="app-header">
    <h1>Petit Coupon</h1>
    <ClearButton onclear={() => persistenceManager.clearSession()} />
  </header>
  <AppStepper {store} {themeStore} {stepperStore} />
</main>

<style>
  .app-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 8px;
  }

  .app-header h1 {
    margin: 0;
  }
</style>
