<template>
  <router-link
    :to="to"
    class="sidebar-link"
    :class="{ 'active': active }"
  >
    <i
v-if="icon"
class="icon"
:class="iconClass"
/>
    <span class="label"><slot /></span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: false
  }
})

const iconClass = computed(() => {
  const icons = {
    'chart-pie-36': 'fas fa-chart-pie',
    'building': 'fas fa-building',
    'music': 'fas fa-music',
    'bullhorn': 'fas fa-bullhorn',
    'users': 'fas fa-users',
    'cog': 'fas fa-cog',
    'document': 'fas fa-file-alt',
    'microphone': 'fas fa-microphone',
    'play': 'fas fa-play-circle',
    'calendar': 'fas fa-calendar-alt'
  }
  return icons[props.icon] || 'fas fa-bars'
})
</script>

<style scoped>
/* Sidebar Link */
.sidebar-link {
  @apply flex items-center gap-3;
  @apply px-4 py-2.5 rounded-lg;
  @apply text-text-secondary text-sm font-medium;
  @apply transition-all duration-200;
  @apply hover:bg-dark-hover hover:text-text-primary;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset;
}

.light .sidebar-link {
  @apply text-text-light-secondary;
  @apply hover:bg-light-hover hover:text-text-light-primary;
}

/* Active State */
.sidebar-link.active {
  @apply bg-primary-500/10 text-primary-400;
}

.light .sidebar-link.active {
  @apply bg-primary-500/10 text-primary-600;
}

/* Icon */
.sidebar-link .icon {
  @apply w-5 text-center flex-shrink-0;
  @apply transition-colors duration-200;
}

.sidebar-link:hover .icon {
  @apply text-primary-400;
}

.light .sidebar-link:hover .icon {
  @apply text-primary-500;
}

.sidebar-link.active .icon {
  @apply text-primary-400;
}

.light .sidebar-link.active .icon {
  @apply text-primary-600;
}

/* Label */
.sidebar-link .label {
  @apply truncate;
}
</style>
