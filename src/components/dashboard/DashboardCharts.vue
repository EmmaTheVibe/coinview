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
          :key="`price-${chartRenderKey}`"
          :title="`${selectedSymbol} Price`"
          :subtitle="timeRange"
          :data="priceHistory"
          :chart-type="dashboard.priceChartType"
          color="#00a884"
          format="price"
        />
      </div>

      <BarChart
        :key="`volume-${chartRenderKey}`"
        title="24h Volume"
        subtitle="Top coins"
        :coins="coins"
        metric="volume"
      />
      <BarChart
        :key="`change-${chartRenderKey}`"
        title="24h Change"
        subtitle="% change"
        :coins="coins"
        metric="price_change"
      />

      <div class="chart-full">
        <AreaChart
          :key="`system-${chartRenderKey}`"
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
import { computed, onMounted, onUnmounted, ref } from "vue";
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
const chartRenderKey = ref(0);
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

const selectedSymbol = computed(() => props.selectedCoin?.symbol.toUpperCase() ?? "");

function refreshChartsAfterResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    chartRenderKey.value += 1;
  }, 120);
}

onMounted(() => {
  window.addEventListener("resize", refreshChartsAfterResize);
});

onUnmounted(() => {
  if (resizeTimer) clearTimeout(resizeTimer);
  window.removeEventListener("resize", refreshChartsAfterResize);
});
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
