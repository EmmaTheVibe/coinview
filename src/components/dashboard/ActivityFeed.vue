<template>
  <div class="feed-wrapper" :class="{ constrained: maxHeight }" :style="wrapperStyle">
    <div class="feed-header">
      <span class="feed-title">Live Activity</span>
      <span class="feed-count">{{ events.length }} events</span>
    </div>
    <div class="feed-list" ref="listRef">
      <TransitionGroup name="feed">
        <div
          v-for="event in events"
          :key="event.id"
          class="feed-item"
          :class="event.severity"
        >
          <span class="feed-dot" :class="event.severity" />
          <div class="feed-body">
            <span class="feed-message">{{ event.message }}</span>
            <span class="feed-time">{{ formatTime(event.timestamp) }}</span>
          </div>
        </div>
      </TransitionGroup>
      <div v-if="events.length === 0" class="feed-empty">
        Waiting for activity...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { format } from 'date-fns';
import type { FeedEvent } from '@/types/market';

const props = defineProps<{
  events: FeedEvent[];
  maxHeight?: number | null;
}>();

const listRef = ref<HTMLElement | null>(null);

const wrapperStyle = computed(() => {
  if (!props.maxHeight) return undefined;
  return {
    height: `${props.maxHeight}px`,
    maxHeight: `${props.maxHeight}px`,
  };
});

function formatTime(ts: number) {
  return format(new Date(ts), 'HH:mm:ss');
}


watch(
  () => props.events.length,
  async () => {
    await nextTick();
    if (listRef.value) listRef.value.scrollTop = 0;
  }
);
</script>

<style scoped>
.feed-wrapper {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: fit-content;
  overflow: hidden;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.feed-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.feed-count {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.feed-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 320px;
}

.feed-list::-webkit-scrollbar { width: 4px; }
.feed-list::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 2px; }

.feed-item {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border-soft);
}

.feed-item.critical { border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.04); }
.feed-item.warning  { border-color: rgba(251, 191, 36, 0.2); background: rgba(251, 191, 36, 0.04); }

.feed-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.feed-dot.info     { background: var(--success); }
.feed-dot.warning  { background: var(--warning); }
.feed-dot.critical { background: var(--danger); }

.feed-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.feed-message {
  font-size: 0.75rem;
  color: var(--text);
  line-height: 1.4;
}

.feed-time {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.feed-empty {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
  padding: 1rem;
}


.feed-enter-active {
  transition: all 0.3s ease;
}
.feed-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.feed-wrapper.constrained .feed-list {
  max-height: none;
}
</style>
