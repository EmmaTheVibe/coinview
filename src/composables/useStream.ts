import { ref } from "vue";
import { useMarketStore } from "@/stores/marketStore";
import type { PriceTick, SystemMetric } from "@/types/market";
import { TRACKED_COINS } from "./useCoinGecko";

function nudgePrice(current: number, volatility = 0.002): number {
  const change = (Math.random() - 0.5) * 2 * volatility;
  return Math.max(0.01, current * (1 + change));
}

function nudgeMetric(
  current: number,
  min: number,
  max: number,
  step = 5,
): number {
  const next = current + (Math.random() - 0.5) * step;
  return Math.min(max, Math.max(min, next));
}

export function useStream() {
  const store = useMarketStore();
  let tickInterval: ReturnType<typeof setInterval> | null = null;
  let systemInterval: ReturnType<typeof setInterval> | null = null;

  const lastPrices = ref<Map<string, number>>(new Map());

  const sysState = ref({ cpu: 42, memory: 61, network: 28, requests: 340 });

  function startPriceTicks() {
    tickInterval = setInterval(() => {
      if (store.isPaused) return;

      store.coins.forEach((coin) => {
        const last = lastPrices.value.get(coin.id) ?? coin.current_price;
        const price = nudgePrice(last);
        lastPrices.value.set(coin.id, price);

        const tick: PriceTick = {
          coinId: coin.id,
          symbol: coin.symbol,
          price,
          timestamp: Date.now(),
        };

        store.applyTick(tick);
      });
    }, 1_000);
  }

  function startSystemMetrics() {
    systemInterval = setInterval(() => {
      if (store.isPaused) return;

      sysState.value = {
        cpu: nudgeMetric(sysState.value.cpu, 5, 95, 8),
        memory: nudgeMetric(sysState.value.memory, 30, 90, 4),
        network: nudgeMetric(sysState.value.network, 0, 100, 10),
        requests: nudgeMetric(sysState.value.requests, 100, 800, 30),
      };

      const metric: SystemMetric = {
        timestamp: Date.now(),
        ...sysState.value,
      };

      store.pushSystemMetric(metric);
    }, 2_000);
  }

  function start() {
    stop();
    startPriceTicks();
    startSystemMetrics();
  }

  function stop() {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
    if (systemInterval) {
      clearInterval(systemInterval);
      systemInterval = null;
    }
  }

  return { start, stop };
}
