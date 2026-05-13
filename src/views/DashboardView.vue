<template>
  <div class="dashboard" :class="`theme-${dashboard.theme}`">
    <DashboardHeader />

    <div class="dashboard-body">
      <div class="section">
        <CoinSelector
          :coins="market.topCoins"
          :selected-id="market.selectedCoinId"
          @select="market.setSelectedCoin"
        />
      </div>

      <MarketMetrics :coin="market.selectedCoin" />
      <SystemMetrics :metric="market.latestSystemMetric" />

      <DashboardCharts
        :selected-coin="market.selectedCoin"
        :coins="market.topCoins"
        :price-history="market.selectedCoinHistory"
        :system-history="market.systemHistory"
        :time-range="market.timeRange"
      />

      <div class="bottom-grid">
        <ActivityFeed :events="market.recentFeed" :max-height="activityFeedMaxHeight" />
        <div ref="marketTableRef">
          <MarketTable
            :coins="market.topCoins"
            :selected-id="market.selectedCoinId"
            @select="market.setSelectedCoin"
          />
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loader-ring" />
      <p>Connecting to markets...</p>
    </div>

    <div v-if="error" class="error-banner">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { useMarketStore } from "@/stores/marketStore";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useCoinGecko } from "@/composables/useCoinGecko";
import { useStream } from "@/composables/useStream";
import ActivityFeed from "@/components/dashboard/ActivityFeed.vue";
import CoinSelector from "@/components/dashboard/CoinSelector.vue";
import DashboardCharts from "@/components/dashboard/DashboardCharts.vue";
import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";
import MarketMetrics from "@/components/dashboard/MarketMetrics.vue";
import MarketTable from "@/components/dashboard/MarketTable.vue";
import SystemMetrics from "@/components/dashboard/SystemMetrics.vue";

const market = useMarketStore();
const dashboard = useDashboardStore();
const { loading, error, initialLoad, startPolling, stopPolling } = useCoinGecko();
const stream = useStream();
const marketTableRef = ref<HTMLElement | null>(null);
const activityFeedMaxHeight = ref<number | null>(null);

let tableObserver: ResizeObserver | null = null;

function syncActivityHeight() {
  if (window.innerWidth <= 1024) {
    activityFeedMaxHeight.value = null;
    return;
  }

  const tableHeight = marketTableRef.value?.getBoundingClientRect().height ?? 0;
  activityFeedMaxHeight.value = tableHeight > 0 ? Math.round(tableHeight) : null;
}

onMounted(async () => {
  await initialLoad();
  startPolling();
  stream.start();

  await nextTick();
  syncActivityHeight();
  tableObserver = new ResizeObserver(syncActivityHeight);
  if (marketTableRef.value) tableObserver.observe(marketTableRef.value);
  window.addEventListener("resize", syncActivityHeight);
});

onUnmounted(() => {
  stopPolling();
  stream.stop();
  tableObserver?.disconnect();
  window.removeEventListener("resize", syncActivityHeight);
});
</script>

<style scoped>
.dashboard {
  --bg: #0a0f14;
  --surface: rgba(255, 255, 255, 0.03);
  --surface-strong: rgba(255, 255, 255, 0.08);
  --surface-hover: rgba(255, 255, 255, 0.05);
  --control-bg: rgba(255, 255, 255, 0.04);
  --border: rgba(255, 255, 255, 0.08);
  --border-soft: rgba(255, 255, 255, 0.03);
  --border-strong: rgba(255, 255, 255, 0.16);
  --text: #e9edef;
  --text-soft: #8696a0;
  --text-muted: #667781;
  --accent: #00a884;
  --accent-soft: rgba(0, 168, 132, 0.1);
  --success: #00a884;
  --danger: #ef4444;
  --warning: #fbbf24;
  --info: #63b3ed;

  min-height: 100dvh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: background 0.2s ease, color 0.2s ease;
}

.dashboard.theme-light {
  --bg: #f5f7f9;
  --surface: rgba(255, 255, 255, 0.92);
  --surface-strong: #ffffff;
  --surface-hover: rgba(15, 23, 42, 0.05);
  --control-bg: rgba(15, 23, 42, 0.06);
  --border: rgba(15, 23, 42, 0.1);
  --border-soft: rgba(15, 23, 42, 0.06);
  --border-strong: rgba(15, 23, 42, 0.18);
  --text: #12202b;
  --text-soft: #50616f;
  --text-muted: #748391;
  --accent-soft: rgba(0, 132, 104, 0.1);
}

.dashboard-body {
  flex: 1;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0.75rem;
  align-items: stretch;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 50;
  color: var(--text-soft);
  font-size: 0.875rem;
}

.loader-ring {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-banner {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--danger);
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.8rem;
  z-index: 40;
}

@media (max-width: 1024px) {
  .bottom-grid {
    grid-template-columns: 1fr;
    align-items: start;
  }
}

@media (max-width: 640px) {
  .dashboard-body { padding: 1rem; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
