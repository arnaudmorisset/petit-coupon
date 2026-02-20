<script lang="ts">
  import AppStepper from './lib/components/AppStepper.svelte'
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
</script>

<main>
  <h1>Petit Coupon</h1>
  <AppStepper />
</main>
