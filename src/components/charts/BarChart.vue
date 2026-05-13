<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <span class="chart-title">{{ title }}</span>
      <span class="chart-subtitle">{{ subtitle }}</span>
    </div>
    <v-chart
      class="chart"
      :option="option"
      :update-options="{ notMerge: false, lazyUpdate: true }"
      autoresize
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { use } from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { useDashboardStore } from '@/stores/dashboardStore';
import type { Coin } from '@/types/market';

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const props = defineProps<{
  title: string;
  subtitle?: string;
  coins: Coin[];
  metric: 'volume' | 'market_cap' | 'price_change';
}>();

const dashboard = useDashboardStore();
const isLight = computed(() => dashboard.theme === 'light');

const option = computed(() => {
  const sorted = [...props.coins].slice(0, 8);

  const labels = sorted.map((c) => c.symbol.toUpperCase());
  const values = sorted.map((c) => {
    switch (props.metric) {
      case 'volume': return c.total_volume;
      case 'market_cap': return c.market_cap;
      case 'price_change': return c.price_change_percentage_24h;
    }
  });

  const colors = values.map((v) => {
    if (props.metric === 'price_change') {
      return v >= 0 ? '#00a884' : '#ef4444';
    }
    return '#63b3ed';
  });

  return {
    backgroundColor: 'transparent',
    grid: { top: 8, right: 8, bottom: 40, left: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isLight.value ? '#ffffff' : '#1a2a35',
      borderColor: isLight.value ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.08)',
      textStyle: { color: isLight.value ? '#12202b' : '#e9edef', fontSize: 12 },
      formatter: (params: any[]) => {
        const p = params[0];
        let val = '';
        if (props.metric === 'price_change') val = `${p.value.toFixed(2)}%`;
        else if (p.value >= 1e9) val = `$${(p.value / 1e9).toFixed(2)}B`;
        else if (p.value >= 1e6) val = `$${(p.value / 1e6).toFixed(2)}M`;
        else val = `$${p.value.toLocaleString()}`;
        return `<b>${p.name}</b>: ${val}`;
      },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: isLight.value ? '#748391' : '#667781', fontSize: 10 },
      axisLine: { lineStyle: { color: isLight.value ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.06)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: isLight.value ? '#748391' : '#667781',
        fontSize: 10,
        formatter: (val: number) => {
          if (props.metric === 'price_change') return `${val.toFixed(0)}%`;
          if (val >= 1e9) return `$${(val / 1e9).toFixed(0)}B`;
          if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
          return `$${val.toFixed(0)}`;
        },
      },
      splitLine: { lineStyle: { color: isLight.value ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.04)' } },
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] } })),
        barMaxWidth: 40,
      },
    ],
    animation: true,
    animationDuration: 300,
  };
});
</script>

<style scoped>
.chart-wrapper {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
  text-transform: uppercase;
}

.chart-subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.chart {
  height: 200px;
  width: 100%;
  min-width: 0; 
}
</style>
