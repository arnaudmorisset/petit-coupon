<script lang="ts">
  import CouponForm from './lib/components/CouponForm.svelte'
  import CouponList from './lib/components/CouponList.svelte'
  import DownloadButton from './lib/components/DownloadButton.svelte'
  import { UuidGenerator } from './lib/domain/id-generator'
  import { CouponStore } from './lib/stores/coupon-store.svelte'

  const store = new CouponStore(new UuidGenerator())
</script>

<main>
  <h1>Petit Coupon</h1>
  <p>{store.count} coupon{store.count !== 1 ? 's' : ''}</p>

  <CouponForm {store} />
  <CouponList {store} />
  <DownloadButton {store} />
</main>
