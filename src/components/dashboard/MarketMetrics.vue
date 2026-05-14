<template>
  <div class="metrics-grid">
    <MetricCard
      label="Price"
      :value="coin?.current_price ?? 0"
      format="price"
      icon="$"
      :change="coin?.price_change_percentage_24h"
      :subtitle="coin?.name ?? ''"
    />
    <MetricCard
      label="24h Volume"
      :value="formatLarge(coin?.total_volume ?? 0)"
      icon="VOL"
      :subtitle="`High: $${formatPrice(coin?.high_24h ?? 0)}`"
    />
    <MetricCard
      label="Market Cap"
      :value="formatLarge(coin?.market_cap ?? 0)"
      icon="MC"
      :subtitle="`Rank #${coin?.market_cap_rank ?? '-'}`"
    />
    <MetricCard
      label="24h Range"
      :value="`$${formatPrice(coin?.low_24h ?? 0)} - $${formatPrice(coin?.high_24h ?? 0)}`"
      icon="HL"
      :subtitle="`Circulating: ${formatLarge(coin?.circulating_supply ?? 0)}`"
    />
  </div>
</template>

<script setup lang="ts">
import MetricCard from "@/components/dashboard/MetricCard.vue";
import type { Coin } from "@/types/market";

defineProps<{
  coin: Coin | null;
}>();

function formatPrice(price: number): string {
  if (!price) return "0";
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

function formatLarge(value: number): string {
  if (!value) return "$0";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (max-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
