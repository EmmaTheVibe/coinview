# CoinView

CoinView is a real-time cryptocurrency analytics dashboard built with Vue 3, TypeScript, Pinia, and ECharts. It combines live CoinGecko market polling with a mocked streaming layer so the dashboard keeps updating without a page refresh.

## Features

- Live crypto price simulation for tracked assets
- Real-time metric cards for price, volume, market cap, range, and system telemetry
- Line chart for selected coin price history
- Bar charts for volume and 24h price movement
- Area chart for CPU, memory, and network telemetry
- Live activity feed with severity indicators and newest events first
- Coin filtering, time-range controls, pause/resume streaming, chart tooltips, and clickable market rows
- Switchable price chart modes: line, area, and bar
- Dataset toggles for CPU, memory, and network telemetry
- Dark and light theme support
- Loading and error states for market data requests
- Reconnect attempts with exponential backoff after market request failures
- Responsive layouts for desktop, tablet, and mobile

## Setup

```sh
npm install
npm run dev
```

Build for production:

```sh
npm run build
```

## Architecture

The app is organized around a single dashboard route in `src/views/DashboardView.vue`.

- `src/stores/marketStore.ts` centralizes market data, selected coin state, time range, stream status, price history, system metrics, and activity feed events.
- `src/composables/useCoinGecko.ts` handles external market data loading, polling, timeout handling, and payload validation.
- `src/composables/useStream.ts` simulates real-time price ticks and system telemetry using managed intervals.
- `src/components/charts` contains reusable ECharts-based chart components.
- `src/components/dashboard` contains reusable dashboard UI components such as metric cards, coin selector, header controls, and activity feed.
- `src/components/dashboard/DashboardCharts.vue` coordinates chart controls, chart type switching, and dataset visibility.
- `src/components/dashboard/MarketMetrics.vue`, `SystemMetrics.vue`, and `MarketTable.vue` keep the dashboard view compact and focused on composition.
- `src/types/market.ts` defines the shared TypeScript models used across the dashboard.

## State Management Strategy

Pinia is used as the centralized state layer. Components read reactive state and computed selectors from `marketStore`, while data ingestion is kept inside composables. This keeps chart and UI components mostly presentational and makes the streaming flow easier to scale.

Dashboard UI preferences such as theme mode, price chart type, and visible system datasets are held in `dashboardStore`.

Important store constraints:

- Price history is capped at 300 points per coin.
- System metric history is capped at 300 points.
- Activity feed events are capped at 100 items.
- The visible feed only renders the newest 50 events.

## Data Streaming Approach

CoinView uses two data flows:

1. CoinGecko polling fetches real market snapshots every 15 seconds.
2. A mocked streaming generator updates tracked coin prices every second and system metrics every 2 seconds.

The mocked stream gives the dashboard continuous real-time movement while the polling layer keeps the base market data realistic.

## Rendering And Performance

- ECharts renders charts on canvas through `vue-echarts`.
- Chart history is capped to avoid unbounded memory growth.
- Chart updates use lazy ECharts updates where appropriate.
- High-frequency line and area charts disable animation to reduce flicker and keep updates stable.
- Store computed values derive the selected time-window data instead of duplicating filtered state.
- Intervals are cleared when the dashboard unmounts to prevent memory leaks.
- Dataset visibility is applied before chart rendering so hidden telemetry series are not sent to ECharts.

## Error Handling And Stability

- Market requests use a 10-second timeout.
- Loading and error states are shown in the UI.
- External CoinGecko payloads are validated before entering the store.
- Malformed response rows are ignored, and fully invalid responses are routed through the existing error state.
- Polling failures schedule reconnect attempts with exponential backoff up to 30 seconds.
- Streaming and polling intervals are cleaned up on unmount.
- Vue template interpolation is used for dynamic text, avoiding unsafe DOM injection.

## Trade-Offs

- The real-time stream is simulated instead of using WebSockets, which keeps the app simple and reliable for a frontend-only submission.
- Polling is used for external market snapshots because CoinGecko's public API is simple to consume without backend credentials.
- The activity feed is capped instead of virtualized because the rendered list is intentionally small.
- Web Workers are not included because the current data volume is modest and already bounded.
