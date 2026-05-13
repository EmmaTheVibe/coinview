<template>
  <div class="coin-table-wrapper">
    <div class="table-header">
      <span class="table-title">Market Overview</span>
    </div>
    <div class="coin-table">
      <div class="table-head-row">
        <span>#</span>
        <span>Coin</span>
        <span>Price</span>
        <span>24h</span>
        <span>Volume</span>
      </div>
      <div
        v-for="coin in coins"
        :key="coin.id"
        class="table-row"
        :class="{ active: coin.id === selectedId }"
        @click="$emit('select', coin.id)"
      >
        <span class="rank">{{ coin.market_cap_rank }}</span>
        <span class="coin-name">
          <span class="name-text">{{ coin.name }}</span>
          <span class="symbol-text">{{ coin.symbol.toUpperCase() }}</span>
        </span>
        <span class="price">${{ formatPrice(coin.current_price) }}</span>
        <span class="change" :class="coin.price_change_percentage_24h >= 0 ? 'up' : 'down'">
          {{ coin.price_change_percentage_24h >= 0 ? '+' : '' }}{{ coin.price_change_percentage_24h?.toFixed(2) }}%
        </span>
        <span class="volume">{{ formatLarge(coin.total_volume) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Coin } from "@/types/market";

defineProps<{
  coins: Coin[];
  selectedId: string;
}>();

defineEmits<{
  select: [id: string];
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
.coin-table-wrapper {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border);
}

.table-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
}

.coin-table { display: flex; flex-direction: column; }

.table-head-row,
.table-row {
  display: grid;
  grid-template-columns: 32px 2fr 1.5fr 1fr 1.5fr;
  padding: 0.625rem 1rem;
  gap: 0.5rem;
  align-items: center;
}

.table-head-row {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
}

.table-row {
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border-soft);
}

.table-row:hover { background: var(--surface-hover); }
.table-row.active { background: var(--accent-soft); }

.rank,
.symbol-text,
.volume { color: var(--text-muted); }

.rank { font-size: 0.7rem; }
.coin-name { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.name-text { color: var(--text); font-weight: 600; }
.symbol-text { font-size: 0.65rem; }
.price { color: var(--text); font-variant-numeric: tabular-nums; }
.change { font-weight: 700; }
.up { color: var(--success); }
.down { color: var(--danger); }
.volume { font-size: 0.7rem; }

@media (max-width: 640px) {
  .table-head-row,
  .table-row {
    grid-template-columns: 28px 1.4fr 1fr 0.8fr;
  }

  .table-head-row span:last-child,
  .table-row .volume {
    display: none;
  }
}
</style>
