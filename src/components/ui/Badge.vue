<template>
  <span class="badge" :class="[variant, size]">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}>();
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.sm { font-size: 0.65rem; padding: 0.125rem 0.375rem; }
.md { font-size: 0.75rem; padding: 0.2rem 0.5rem; }

.default { background: rgba(255,255,255,0.08); color: #e9edef; }
.success { background: rgba(0,168,132,0.15); color: #00a884; }
.warning { background: rgba(251,191,36,0.15); color: #fbbf24; }
.danger  { background: rgba(239,68,68,0.15); color: #ef4444; }
.info    { background: rgba(99,179,237,0.15); color: #63b3ed; }
</style>