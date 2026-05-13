<template>
  <div v-if="metric" class="metrics-grid">
    <MetricCard label="CPU Usage" :value="metric.cpu" format="percent" icon="CPU" />
    <MetricCard label="Memory" :value="metric.memory" format="percent" icon="MEM" />
    <MetricCard label="Network I/O" :value="metric.network" format="percent" icon="NET" />
    <MetricCard label="Requests/sec" :value="metric.requests" format="number" icon="REQ" />
  </div>
</template>

<script setup lang="ts">
import MetricCard from "@/components/dashboard/MetricCard.vue";
import type { SystemMetric } from "@/types/market";

defineProps<{
  metric: SystemMetric | null;
}>();
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

@media (max-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .metrics-grid { grid-template-columns: 1fr 1fr; }
}
</style>
