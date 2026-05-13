<template>
  <div class="charts-section">
    <ChartControls
      :selected-chart-type="dashboard.priceChartType"
      :visible-series="dashboard.visibleSystemSeries"
      @chart-type="dashboard.setPriceChartType"
      @toggle-series="dashboard.toggleSystemSeries"
    />

    <div class="charts-grid">
      <div class="chart-full">
        <LineChart
          :title="`${selectedSymbol} Price`"
          :subtitle="timeRange"
          :data="priceHistory"
          :chart-type="dashboard.priceChartType"
          color="#00a884"
          format="price"
        />
      </div>

      <BarChart title="24h Volume" subtitle="Top coins" :coins="coins" metric="volume" />
      <BarChart title="24h Change" subtitle="% change" :coins="coins" metric="price_change" />

      <div class="chart-full">
        <AreaChart
          title="System Metrics"
          subtitle="CPU · Memory · Network"
          :data="systemHistory"
          :visible-series="dashboard.visibleSystemSeries"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AreaChart from "@/components/charts/AreaChart.vue";
import BarChart from "@/components/charts/BarChart.vue";
import LineChart from "@/components/charts/LineChart.vue";
import ChartControls from "@/components/dashboard/ChartControls.vue";
import { useDashboardStore } from "@/stores/dashboardStore";
import type { ChartPoint, Coin, SystemMetric, TimeRange } from "@/types/market";

const props = defineProps<{
  selectedCoin: Coin | null;
  coins: Coin[];
  priceHistory: ChartPoint[];
  systemHistory: SystemMetric[];
  timeRange: TimeRange;
}>();

const dashboard = useDashboardStore();

const selectedSymbol = computed(() => props.selectedCoin?.symbol.toUpperCase() ?? "");
</script>

<style scoped>
.charts-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.chart-full { grid-column: 1 / -1; }

@media (max-width: 640px) {
  .charts-grid { grid-template-columns: 1fr; }
  .chart-full { grid-column: 1; }
}
</style>
