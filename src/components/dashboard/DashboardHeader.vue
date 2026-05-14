<template>
  <header class="dashboard-header">
    <div class="header-left">
      <div class="logo">
        <!-- <span class="logo-icon" /> -->
        <img src="/public/favicon.svg" alt="logo" class="logo-img">
        <span class="logo-text">CoinView</span>
      </div>
      <div class="status-pill" :class="store.streamStatus">
        <span class="status-dot" />
        <span class="status-label">{{ statusLabel }}</span>
      </div>
    </div>

    <div class="header-controls">
      <div class="control-group">
        <button
          v-for="range in timeRanges"
          :key="range.value"
          class="range-btn"
          :class="{ active: store.timeRange === range.value }"
          type="button"
          @click="store.setTimeRange(range.value)"
        >
          {{ range.label }}
        </button>
      </div>

      <button
        class="control-btn icon-btn"
        :class="{ paused: store.isPaused }"
        type="button"
        :aria-label="store.isPaused ? 'Resume stream' : 'Pause stream'"
        :title="store.isPaused ? 'Resume stream' : 'Pause stream'"
        @click="store.togglePause()"
      >
        <svg
          v-if="store.isPaused"
          class="control-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
        </svg>
        <svg
          v-else
          class="control-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M7 5h3v14H7V5ZM14 5h3v14h-3V5Z" fill="currentColor" />
        </svg>
      </button>

      <button
        class="control-btn icon-btn"
        type="button"
        :aria-label="dashboard.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="dashboard.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="dashboard.toggleTheme()"
      >
        <svg
          v-if="dashboard.theme === 'dark'"
          class="theme-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
          <path
            d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
          />
        </svg>
        <svg
          v-else
          class="theme-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"
            stroke="currentColor"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      </button>
    </div>

    <div class="header-right">
      <span class="last-updated">{{ lastUpdatedLabel }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDistanceToNow } from "date-fns";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useMarketStore } from "@/stores/marketStore";
import type { TimeRange } from "@/types/market";

const store = useMarketStore();
const dashboard = useDashboardStore();

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
];

const statusLabel = computed(() => {
  switch (store.streamStatus) {
    case "live": return "Live";
    case "paused": return "Paused";
    case "connecting": return "Connecting";
    case "error": return "Error";
    default: return "Offline";
  }
});

const lastUpdatedLabel = computed(() => {
  if (!store.lastUpdated) return "";
  return `Updated ${formatDistanceToNow(new Date(store.lastUpdated), { addSuffix: true })}`;
});
</script>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: blur(12px);
  flex-wrap: wrap;
  gap: 0.75rem;
}

.header-left,
.logo,
.header-controls,
.header-right {
  display: flex;
  align-items: center;
}

.header-left { gap: 1rem; }
.logo { gap: 0.5rem; }
.header-controls { gap: 0.5rem; flex-wrap: wrap; }

/* .logo-icon {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
} */
.logo-img {
  width: 2rem;
  height: 2rem;
}

.logo-text {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--surface);
  border: 1px solid var(--border);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-pill.live .status-dot {
  background: var(--success);
  box-shadow: 0 0 6px var(--success);
  animation: pulse 2s infinite;
}

.status-pill.paused .status-dot { background: var(--warning); }
.status-pill.error .status-dot { background: var(--danger); }
.status-pill.connecting .status-dot { background: var(--info); animation: pulse 1s infinite; }
.status-pill.offline .status-dot { background: var(--text-muted); }
.status-label { color: var(--text); }

.control-group {
  display: flex;
  gap: 2px;
  background: var(--control-bg);
  border-radius: 8px;
  padding: 2px;
}

.range-btn,
.control-btn {
  border-radius: 7px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.range-btn {
  padding: 0.25rem 0.625rem;
  color: var(--text-soft);
  background: transparent;
  border: none;
}

.range-btn:hover { color: var(--text); }
.range-btn.active { background: var(--surface-strong); color: var(--text); }

.control-btn {
  padding: 0.3rem 0.75rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
}

.control-btn:hover { background: var(--surface-hover); }
.control-btn.paused { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }

.icon-btn {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.theme-icon,
.control-icon {
  width: 1rem;
  height: 1rem;
}

.last-updated {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
