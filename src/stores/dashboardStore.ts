import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export type ThemeMode = "dark" | "light";
export type PriceChartType = "line" | "area" | "bar";
export type SystemSeriesKey = "cpu" | "memory" | "network";

export const useDashboardStore = defineStore("dashboard", () => {
  const sidebarOpen = ref(true);
  const activeTab = ref<"overview" | "markets" | "system">("overview");
  const theme = ref<ThemeMode>("dark");
  const priceChartType = ref<PriceChartType>("area");
  const visibleSystemSeries = reactive<Record<SystemSeriesKey, boolean>>({
    cpu: true,
    memory: true,
    network: true,
  });

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function setActiveTab(tab: typeof activeTab.value) {
    activeTab.value = tab;
  }

  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
  }

  function setPriceChartType(type: PriceChartType) {
    priceChartType.value = type;
  }

  function toggleSystemSeries(key: SystemSeriesKey) {
    const enabledCount = Object.values(visibleSystemSeries).filter(Boolean).length;
    if (visibleSystemSeries[key] && enabledCount === 1) return;
    visibleSystemSeries[key] = !visibleSystemSeries[key];
  }

  return {
    sidebarOpen,
    activeTab,
    theme,
    priceChartType,
    visibleSystemSeries,
    toggleSidebar,
    setActiveTab,
    toggleTheme,
    setPriceChartType,
    toggleSystemSeries,
  };
});
