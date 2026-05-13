<template>
  <div class="coin-selector">
    <button
      v-for="coin in coins"
      :key="coin.id"
      class="coin-btn"
      :class="{ active: selectedId === coin.id }"
      @click="$emit('select', coin.id)"
    >
      <span class="coin-symbol">{{ coin.symbol.toUpperCase() }}</span>
      <span class="coin-price">${{ formatPrice(coin.current_price) }}</span>
      <span class="coin-change" :class="coin.price_change_percentage_24h >= 0 ? 'up' : 'down'">
        {{ coin.price_change_percentage_24h >= 0 ? '+' : '' }}{{ coin.price_change_percentage_24h?.toFixed(2) }}%
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Coin } from '@/types/market';

defineProps<{
  coins: Coin[];
  selectedId: string;
}>();

defineEmits<{
  select: [id: string];
}>();

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}
</script>

<style scoped>
.coin-selector {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
}

.coin-selector::-webkit-scrollbar { display: none; }

.coin-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}

.coin-btn:hover { background: var(--surface-hover); border-color: var(--border-strong); }
.coin-btn.active { background: var(--accent-soft); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }

.coin-symbol {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.02em;
}

.coin-price {
  font-size: 0.75rem;
  color: var(--text-soft);
  font-variant-numeric: tabular-nums;
}

.coin-change {
  font-size: 0.7rem;
  font-weight: 600;
}

.up { color: var(--success); }
.down { color: var(--danger); }
</style>
