import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Coin,
  PriceTick,
  ChartPoint,
  FeedEvent,
  SystemMetric,
  StreamStatus,
  TimeRange,
} from "@/types/market";
import { TIME_RANGE_MS } from "@/types/market";

const MAX_HISTORY = 300;
const MAX_FEED = 100;
const MAX_SYSTEM = 300;

export const useMarketStore = defineStore("market", () => {
  const coins = ref<Coin[]>([]);
  const selectedCoinId = ref<string>("bitcoin");
  const streamStatus = ref<StreamStatus>("connecting");
  const timeRange = ref<TimeRange>("5m");
  const isPaused = ref(false);
  const lastUpdated = ref<number>(0);

  const priceHistory = ref<Map<string, ChartPoint[]>>(new Map());

  const feedEvents = ref<FeedEvent[]>([]);

  const systemMetrics = ref<SystemMetric[]>([]);

  const selectedCoin = computed(
    () => coins.value.find((c) => c.id === selectedCoinId.value) ?? null,
  );

  const selectedCoinHistory = computed(() => {
    const history = priceHistory.value.get(selectedCoinId.value) ?? [];
    const cutoff = Date.now() - TIME_RANGE_MS[timeRange.value];
    return history.filter((p) => p.timestamp >= cutoff);
  });

  const topCoins = computed(() =>
    [...coins.value]
      .sort((a, b) => a.market_cap_rank - b.market_cap_rank)
      .slice(0, 10),
  );

  const recentFeed = computed(() => feedEvents.value.slice(0, 50));

  const latestSystemMetric = computed(
    () => systemMetrics.value[systemMetrics.value.length - 1] ?? null,
  );

  const systemHistory = computed(() => {
    const cutoff = Date.now() - TIME_RANGE_MS[timeRange.value];
    return systemMetrics.value.filter((m) => m.timestamp >= cutoff);
  });

  function setCoins(data: Coin[]) {
    coins.value = data;

    data.forEach((coin) => {
      if (!priceHistory.value.has(coin.id)) {
        priceHistory.value.set(coin.id, []);
      }
    });
  }

  function applyTick(tick: PriceTick) {
    if (isPaused.value) return;

    const idx = coins.value.findIndex((c) => c.id === tick.coinId);
    if (idx !== -1) {
      const coin = coins.value[idx];
      if (!coin) return;
      const prev = coin.current_price;
      coins.value[idx] = { ...coin, current_price: tick.price } as Coin;

      const change = ((tick.price - prev) / prev) * 100;
      if (Math.abs(change) > 0.5) {
        addFeedEvent({
          coinId: tick.coinId,
          symbol: tick.symbol,
          price: tick.price,
          change,
        });
      }
    }

    const history = priceHistory.value.get(tick.coinId) ?? [];
    history.push({ timestamp: tick.timestamp, value: tick.price });
    if (history.length > MAX_HISTORY)
      history.splice(0, history.length - MAX_HISTORY);
    priceHistory.value.set(tick.coinId, history);

    lastUpdated.value = tick.timestamp;
  }

  function addFeedEvent(data: {
    coinId: string;
    symbol: string;
    price: number;
    change: number;
  }) {
    const { coinId, symbol, price, change } = data;
    const isSpike = change > 0;
    const absChange = Math.abs(change);

    const event: FeedEvent = {
      id: crypto.randomUUID(),
      type: isSpike ? "price_spike" : "price_drop",
      coinId,
      symbol: symbol.toUpperCase(),
      message: `${symbol.toUpperCase()} ${isSpike ? "up" : "down"} ${absChange.toFixed(2)}% to $${price.toLocaleString()}`,
      value: change,
      timestamp: Date.now(),
      severity: absChange > 2 ? "critical" : absChange > 1 ? "warning" : "info",
    };

    feedEvents.value.unshift(event);
    if (feedEvents.value.length > MAX_FEED) feedEvents.value.pop();
  }

  function pushSystemMetric(metric: SystemMetric) {
    if (isPaused.value) return;
    systemMetrics.value.push(metric);
    if (systemMetrics.value.length > MAX_SYSTEM) {
      systemMetrics.value.splice(0, systemMetrics.value.length - MAX_SYSTEM);
    }
  }

  function setStatus(status: StreamStatus) {
    streamStatus.value = status;
  }

  function setSelectedCoin(id: string) {
    selectedCoinId.value = id;
  }

  function setTimeRange(range: TimeRange) {
    timeRange.value = range;
  }

  function togglePause() {
    isPaused.value = !isPaused.value;
  }

  function clearHistory() {
    priceHistory.value.clear();
    feedEvents.value = [];
    systemMetrics.value = [];
  }

  return {
    coins,
    selectedCoinId,
    streamStatus,
    timeRange,
    isPaused,
    lastUpdated,
    feedEvents,
    systemMetrics,

    selectedCoin,
    selectedCoinHistory,
    topCoins,
    recentFeed,
    latestSystemMetric,
    systemHistory,

    setCoins,
    applyTick,
    pushSystemMetric,
    setStatus,
    setSelectedCoin,
    setTimeRange,
    togglePause,
    clearHistory,
    addFeedEvent,
  };
});
