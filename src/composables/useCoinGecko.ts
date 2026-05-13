import { ref } from "vue";
import axios from "axios";
import type { Coin } from "@/types/market";
import { useMarketStore } from "@/stores/marketStore";

const BASE = "https://api.coingecko.com/api/v3";
const POLL_INTERVAL_MS = 15_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export const TRACKED_COINS = [
  "bitcoin",
  "ethereum",
  "solana",
  "binancecoin",
  "ripple",
  "cardano",
  "avalanche-2",
  "dogecoin",
  "polkadot",
  "chainlink",
];

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCoin(value: unknown): value is Coin {
  if (!value || typeof value !== "object") return false;

  const coin = value as Record<string, unknown>;

  return (
    isString(coin.id) &&
    isString(coin.symbol) &&
    isString(coin.name) &&
    isString(coin.image) &&
    isNumber(coin.current_price) &&
    isNumber(coin.market_cap) &&
    isNumber(coin.market_cap_rank) &&
    isNumber(coin.price_change_percentage_24h) &&
    isNumber(coin.total_volume) &&
    isNumber(coin.high_24h) &&
    isNumber(coin.low_24h) &&
    isNumber(coin.circulating_supply)
  );
}

function validateCoinsPayload(payload: unknown): Coin[] {
  if (!Array.isArray(payload)) {
    throw new Error("CoinGecko response was not a list");
  }

  const coins = payload.filter(isCoin);

  if (coins.length === 0) {
    throw new Error("CoinGecko response did not include valid coins");
  }

  return coins;
}

export function useCoinGecko() {
  const store = useMarketStore();
  const error = ref<string | null>(null);
  const loading = ref(false);
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = true;
  let retryCount = 0;

  async function fetchMarkets(): Promise<Coin[]> {
    const res = await axios.get<unknown>(`${BASE}/coins/markets`, {
      params: {
        vs_currency: "usd",
        ids: TRACKED_COINS.join(","),
        order: "market_cap_desc",
        per_page: 10,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      },
      timeout: 10_000,
    });
    return validateCoinsPayload(res.data);
  }

  async function initialLoad() {
    loading.value = true;
    error.value = null;
    store.setStatus("connecting");

    try {
      const coins = await fetchMarkets();
      store.setCoins(coins);
      store.setStatus("live");
    } catch (err) {
      error.value = "Failed to load market data";
      store.setStatus("error");
    } finally {
      loading.value = false;
    }
  }

  function startPolling() {
    stopped = false;

    const poll = async () => {
      if (stopped) return;

      if (store.isPaused) {
        scheduleNext(POLL_INTERVAL_MS);
        return;
      }

      try {
        const coins = await fetchMarkets();
        store.setCoins(coins);
        store.setStatus("live");
        error.value = null;
        retryCount = 0;
        scheduleNext(POLL_INTERVAL_MS);
      } catch {
        store.setStatus("error");
        retryCount += 1;
        const delay = getReconnectDelay();
        error.value = `Market data unavailable. Reconnecting in ${Math.round(delay / 1000)}s`;
        scheduleNext(delay);
      }
    };

    const scheduleNext = (delay: number) => {
      if (stopped) return;
      if (pollTimer) clearTimeout(pollTimer);
      pollTimer = setTimeout(poll, delay);
    };

    const getReconnectDelay = () =>
      Math.min(MAX_RECONNECT_DELAY_MS, 2_000 * 2 ** Math.max(0, retryCount - 1));

    scheduleNext(POLL_INTERVAL_MS);
  }

  function stopPolling() {
    stopped = true;
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  return {
    loading,
    error,
    initialLoad,
    startPolling,
    stopPolling,
  };
}
