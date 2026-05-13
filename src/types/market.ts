export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
};

export type PriceTick = {
  coinId: string;
  symbol: string;
  price: number;
  timestamp: number;
};

export type ChartPoint = {
  timestamp: number;
  value: number;
};

export type FeedEventType =
  | "price_spike"
  | "price_drop"
  | "volume_surge"
  | "new_high"
  | "new_low"
  | "alert";

export type FeedEvent = {
  id: string;
  type: FeedEventType;
  coinId: string;
  symbol: string;
  message: string;
  value: number;
  timestamp: number;
  severity: "info" | "warning" | "critical";
};

export type SystemMetric = {
  timestamp: number;
  cpu: number;
  memory: number;
  network: number;
  requests: number;
};

export type TimeRange = "1m" | "5m" | "15m" | "1h";

export const TIME_RANGE_MS: Record<TimeRange, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "1h": 60 * 60_000,
};

export type StreamStatus =
  | "connecting"
  | "live"
  | "paused"
  | "error"
  | "offline";
