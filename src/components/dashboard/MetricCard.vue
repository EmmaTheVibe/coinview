<template>
  <div class="metric-card">
    <div class="metric-header">
      <span class="metric-label">{{ label }}</span>
      <span class="metric-icon">{{ icon }}</span>
    </div>
    <div class="metric-value">
      <span class="value-text">{{ formattedValue }}</span>
      <span v-if="change !== undefined" class="metric-change" :class="changeClass">
        {{ change >= 0 ? "+" : "-" }}{{ Math.abs(change).toFixed(2) }}%
      </span>
    </div>
    <div v-if="subtitle" class="metric-subtitle">{{ subtitle }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  value: number | string;
  icon?: string;
  change?: number;
  subtitle?: string;
  format?: "price" | "percent" | "number" | "bytes" | "raw";
}>();

const formattedValue = computed(() => {
  if (typeof props.value === "string") return props.value;
  switch (props.format) {
    case "price":
      return props.value >= 1
        ? `$${props.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
        : `$${props.value.toFixed(6)}`;
    case "percent":
      return `${props.value.toFixed(1)}%`;
    case "bytes":
      return `${props.value.toFixed(1)} MB/s`;
    case "number":
      return props.value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    default:
      return String(props.value);
  }
});

const changeClass = computed(() => {
  if (props.change === undefined) return "";
  return props.change >= 0 ? "positive" : "negative";
});
</script>

<style scoped>
.metric-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: border-color 0.2s;
}

.metric-card:hover {
  border-color: color-mix(in srgb, var(--info) 35%, transparent);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-soft);
  text-transform: uppercase;
}

.metric-icon {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-muted);
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.value-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.positive {
  color: var(--success);
  background: rgba(0, 168, 132, 0.1);
}

.negative {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.metric-subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
}
</style>
