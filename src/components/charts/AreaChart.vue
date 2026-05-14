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
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { format } from 'date-fns';
import { useDashboardStore, type SystemSeriesKey } from '@/stores/dashboardStore';
import type { SystemMetric } from '@/types/market';

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const props = defineProps<{
  title: string;
  subtitle?: string;
  data: SystemMetric[];
  visibleSeries?: Record<SystemSeriesKey, boolean>;
}>();

const dashboard = useDashboardStore();
const isLight = computed(() => dashboard.theme === 'light');

const SERIES = [
  { key: 'cpu' as const, name: 'CPU', color: '#63b3ed' },
  { key: 'memory' as const, name: 'Memory', color: '#9f7aea' },
  { key: 'network' as const, name: 'Network', color: '#00a884' },
];

const option = computed(() => {
  const timestamps = props.data.map((m) => m.timestamp);
  const visibleSeries = SERIES.filter((series) => props.visibleSeries?.[series.key] ?? true);

  return {
    backgroundColor: 'transparent',
    grid: { top: 30, right: 8, bottom: 30, left: 44 },
    legend: {
      top: 0,
      textStyle: { color: isLight.value ? '#50616f' : '#8696a0', fontSize: 10 },
      itemWidth: 12,
      itemHeight: 6,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isLight.value ? '#ffffff' : '#1a2a35',
      borderColor: isLight.value ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.08)',
      textStyle: { color: isLight.value ? '#12202b' : '#e9edef', fontSize: 11 },
      formatter: (params: any[]) => {
        const time = format(new Date(timestamps[params[0].dataIndex] ?? Date.now()), 'HH:mm:ss');
        const lines = params.map((p: any) => `<div>${p.marker}${p.seriesName}: <b>${p.value.toFixed(1)}%</b></div>`).join('');
        return `<div style="padding:4px 8px"><div style="color:${isLight.value ? '#748391' : '#8696a0'};font-size:10px">${time}</div>${lines}</div>`;
      },
    },
    xAxis: {
      type: 'category',
      data: timestamps,
      axisLabel: {
        color: isLight.value ? '#748391' : '#667781',
        fontSize: 10,
        formatter: (val: number) => {
          if (!val || isNaN(val)) return '';
          try {
            return format(new Date(val), 'HH:mm');
          } catch {
            return '';
          }
        },
        interval: 'auto',
      },
      axisLine: { lineStyle: { color: isLight.value ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.06)' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: isLight.value ? '#748391' : '#667781', fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { color: isLight.value ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.04)' } },
    },
    series: visibleSeries.map(({ key, name, color }) => ({
      name,
      type: 'line',
      data: props.data.map((m) => m[key]),
      smooth: true,
      symbol: 'none',
      lineStyle: { color, width: 1.5 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: color + '30' },
            { offset: 1, color: color + '00' },
          ],
        },
      },
    })),
    animation: false,
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
