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
import { BarChart, LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { format } from 'date-fns';
import { useDashboardStore, type PriceChartType } from '@/stores/dashboardStore';
import type { ChartPoint } from '@/types/market';

use([LineChart, BarChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

const props = defineProps<{
  title: string;
  subtitle?: string;
  data: ChartPoint[];
  chartType?: PriceChartType;
  color?: string;
  format?: 'price' | 'percent' | 'number';
}>();

const dashboard = useDashboardStore();
const lineColor = computed(() => props.color ?? '#00a884');
const isLight = computed(() => dashboard.theme === 'light');

const option = computed(() => {
  const timestamps = props.data.map((p) => p.timestamp);
  const values = props.data.map((p) => p.value);
  const chartType = props.chartType ?? 'area';
  const isBar = chartType === 'bar';

  return {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 8, bottom: 30, left: 60, containLabel: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isLight.value ? '#ffffff' : '#1a2a35',
      borderColor: isLight.value ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.08)',
      textStyle: { color: isLight.value ? '#12202b' : '#e9edef', fontSize: 12 },
      formatter: (params: any[]) => {
        const p = params[0];
        const time = format(new Date(timestamps[p.dataIndex] ?? Date.now()), 'HH:mm:ss');
        const val = props.format === 'price'
          ? `$${p.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : props.format === 'percent'
          ? `${p.value.toFixed(1)}%`
          : p.value.toFixed(2);
        return `<div style="padding:4px 8px"><div style="color:${isLight.value ? '#748391' : '#8696a0'};font-size:11px">${time}</div><div style="font-weight:600">${val}</div></div>`;
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
        showMaxLabel: true,
        interval: 'auto',
      },
      axisLine: { lineStyle: { color: isLight.value ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.06)' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: isLight.value ? '#748391' : '#667781',
        fontSize: 10,
        formatter: (val: number) =>
          props.format === 'price'
            ? val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val.toFixed(2)}`
            : props.format === 'percent'
            ? `${val.toFixed(0)}%`
            : val.toFixed(1),
      },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: isLight.value ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.04)' } },
    },
    series: [
      {
        type: isBar ? 'bar' : 'line',
        data: values,
        smooth: !isBar,
        symbol: isBar ? undefined : 'none',
        lineStyle: { color: lineColor.value, width: 2 },
        itemStyle: { color: lineColor.value, borderRadius: isBar ? [4, 4, 0, 0] : 0 },
        barMaxWidth: isBar ? 18 : undefined,
        areaStyle: chartType === 'area' ? {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: lineColor.value + '40' },
              { offset: 1, color: lineColor.value + '00' },
            ],
          },
        } : undefined,
      },
    ],
    animation: isBar,
    animationDuration: 250,
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
