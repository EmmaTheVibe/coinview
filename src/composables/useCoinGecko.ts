import { ref } from "vue";
import axios from "axios";
import type { Coin } from "@/types/market";
import { useMarketStore } from "@/stores/marketStore";

const BASE = "https://api.coingecko.com/api/v3";
const CACHE_KEY = "coinview:markets";
const CACHE_TTL_MS = 5 * 60_000;
const POLL_INTERVAL_MS = 60_000;
const MAX_RECONNECT_DELAY_MS = 5 * 60_000;

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

function readCachedMarkets(): { coins: Coin[]; isFresh: boolean } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw) as { savedAt?: unknown; coins?: unknown };
    if (!isNumber(cached.savedAt)) return null;

    return {
      coins: validateCoinsPayload(cached.coins),
      isFresh: Date.now() - cached.savedAt < CACHE_TTL_MS,
    };
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function cacheMarkets(coins: Coin[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), coins }));
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
    const coins = validateCoinsPayload(res.data);
    cacheMarkets(coins);
    return coins;
  }

  async function initialLoad() {
    const cached = readCachedMarkets();

    if (cached) {
      store.setCoins(cached.coins);
      store.setStatus("live");
      error.value = null;

      if (cached.isFresh) {
        loading.value = false;
        return;
      }
    }

    loading.value = !cached;
    error.value = null;
    if (!cached) store.setStatus("connecting");

    try {
      const coins = await fetchMarkets();
      store.setCoins(coins);
      store.setStatus("live");
    } catch (err) {
      if (!cached) {
        error.value = "Failed to load market data";
        store.setStatus("error");
      }
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
        retryCount += 1;
        const delay = getReconnectDelay();
        const cached = readCachedMarkets();

        if (cached) {
          store.setCoins(cached.coins);
          store.setStatus("live");
          error.value = `Using cached market data. Retrying in ${Math.round(delay / 1000)}s`;
        } else {
          store.setStatus("error");
          error.value = `Market data unavailable. Retrying in ${Math.round(delay / 1000)}s`;
        }

        scheduleNext(delay);
      }
    };

    const scheduleNext = (delay: number) => {
      if (stopped) return;
      if (pollTimer) clearTimeout(pollTimer);
      pollTimer = setTimeout(poll, delay);
    };

    const getReconnectDelay = () =>
      Math.min(MAX_RECONNECT_DELAY_MS, 30_000 * 2 ** Math.max(0, retryCount - 1));

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
