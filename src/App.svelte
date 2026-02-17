<script lang="ts">
  import CouponForm from './lib/components/CouponForm.svelte'
  import CouponList from './lib/components/CouponList.svelte'
  import DownloadButton from './lib/components/DownloadButton.svelte'
  import ThemePicker from './lib/components/ThemePicker.svelte'
  import { UuidGenerator } from './lib/domain/id-generator'
  import { THEME_REGISTRY } from './lib/domain/themes'
  import { CouponStore } from './lib/stores/coupon-store.svelte'
  import { ThemeStore } from './lib/stores/theme-store.svelte'

  const store = new CouponStore(new UuidGenerator())
  const themeStore = new ThemeStore(THEME_REGISTRY)
</script>

<main>
  <h1>Petit Coupon</h1>

  <ThemePicker {themeStore} />

  <CouponForm {store} />

  <p>{store.count} coupon{store.count !== 1 ? 's' : ''}</p>

  <CouponList {store} theme={themeStore.selectedTheme} />
  <DownloadButton {store} theme={themeStore.selectedTheme} />
</main>
