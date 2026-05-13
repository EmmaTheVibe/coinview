<template>
  <div class="spinner" :class="size" :style="{ borderTopColor: color }" />
</template>

<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}>();
</script>

<style scoped>
.spinner {
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.08);
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.sm { width: 16px; height: 16px; }
.md { width: 28px; height: 28px; border-width: 3px; }
.lg { width: 40px; height: 40px; border-width: 3px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>