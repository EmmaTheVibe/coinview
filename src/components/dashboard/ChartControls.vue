<template>
  <div class="chart-controls">
    <div class="control-block">
      <span class="control-label">Price Chart</span>
      <div class="segmented">
        <button
          v-for="option in chartTypes"
          :key="option.value"
          class="segmented-btn"
          :class="{ active: selectedChartType === option.value }"
          type="button"
          @click="$emit('chart-type', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="control-block">
      <span class="control-label">System Data</span>
      <div class="toggle-row">
        <button
          v-for="series in seriesOptions"
          :key="series.value"
          class="dataset-toggle"
          :class="{ active: visibleSeries[series.value] }"
          type="button"
          @click="$emit('toggle-series', series.value)"
        >
          <span class="swatch" :style="{ background: series.color }" />
          {{ series.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PriceChartType, SystemSeriesKey } from "@/stores/dashboardStore";

defineProps<{
  selectedChartType: PriceChartType;
  visibleSeries: Record<SystemSeriesKey, boolean>;
}>();

defineEmits<{
  "chart-type": [type: PriceChartType];
  "toggle-series": [key: SystemSeriesKey];
}>();

const chartTypes: { label: string; value: PriceChartType }[] = [
  { label: "Line", value: "line" },
  { label: "Area", value: "area" },
  { label: "Bar", value: "bar" },
];

const seriesOptions: { label: string; value: SystemSeriesKey; color: string }[] = [
  { label: "CPU", value: "cpu", color: "#63b3ed" },
  { label: "Memory", value: "memory", color: "#9f7aea" },
  { label: "Network", value: "network", color: "#00a884" },
];
</script>

<style scoped>
.chart-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.control-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.control-label {
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.segmented,
.toggle-row {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.segmented {
  padding: 2px;
  border-radius: 8px;
  background: var(--control-bg);
}

.segmented-btn,
.dataset-toggle {
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.15s;
}

.segmented-btn {
  padding: 0.35rem 0.65rem;
}

.dataset-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.55rem;
  background: var(--surface);
  border-color: var(--border);
}

.segmented-btn.active,
.dataset-toggle.active {
  background: var(--surface-strong);
  color: var(--text);
  border-color: var(--border-strong);
}

.swatch {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  opacity: 0.45;
}

.dataset-toggle.active .swatch { opacity: 1; }
</style>
