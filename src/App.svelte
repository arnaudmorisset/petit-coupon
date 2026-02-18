<script lang="ts">
  import AppStepper from './lib/components/AppStepper.svelte'
  import { UuidGenerator } from './lib/domain/id-generator'
  import { THEME_REGISTRY } from './lib/domain/themes'
  import { CouponStore } from './lib/stores/coupon-store.svelte'
  import { StepperStore } from './lib/stores/stepper-store.svelte'
  import { ThemeStore } from './lib/stores/theme-store.svelte'

  const store = new CouponStore(new UuidGenerator())
  const themeStore = new ThemeStore(THEME_REGISTRY)
  const stepperStore = new StepperStore(store)
</script>

<main>
  <h1>Petit Coupon</h1>
  <AppStepper {store} {themeStore} {stepperStore} />
</main>
