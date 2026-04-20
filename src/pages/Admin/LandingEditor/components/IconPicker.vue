<template>
  <div class="icon-picker">
    <div
class="icon-picker-trigger"
@click="togglePicker"
>
      <div class="selected-icon">
        <i :class="modelValue || 'fas fa-icons'" />
      </div>
      <span class="trigger-text">{{ modelValue || 'Seleccionar icono' }}</span>
      <i
class="fas fa-chevron-down trigger-arrow"
:class="{ 'rotate-180': isOpen }"
/>
    </div>

    <transition name="fade">
      <div
v-if="isOpen"
class="icon-picker-dropdown"
>
        <div class="dropdown-header">
          <base-input
            v-model="searchQuery"
            placeholder="Buscar icono..."
            icon="search"
          />
        </div>

        <div class="categories-tabs">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-tab"
            :class="{ active: activeCategory === category.id }"
            @click="activeCategory = category.id"
          >
            <i :class="category.icon" />
            <span>{{ category.name }}</span>
          </button>
        </div>

        <div class="icons-grid">
          <button
            v-for="icon in filteredIcons"
            :key="icon"
            class="icon-option"
            :class="{ selected: modelValue === icon }"
            :title="icon"
            @click="selectIcon(icon)"
          >
            <i :class="icon" />
          </button>
          <div
v-if="filteredIcons.length === 0"
class="no-results"
>
            No se encontraron iconos
          </div>
        </div>
      </div>
    </transition>

    <div
v-if="isOpen"
class="backdrop"
@click="closePicker"
/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const activeCategory = ref('general')

const categories = [
  { id: 'general', name: 'General', icon: 'fas fa-icons' },
  { id: 'media', name: 'Media', icon: 'fas fa-play' },
  { id: 'business', name: 'Negocio', icon: 'fas fa-briefcase' },
  { id: 'tech', name: 'Tecnologia', icon: 'fas fa-microchip' },
  { id: 'communication', name: 'Comunicacion', icon: 'fas fa-comments' }
]

const iconsByCategory = {
  general: [
    'fas fa-home', 'fas fa-star', 'fas fa-heart', 'fas fa-check',
    'fas fa-times', 'fas fa-plus', 'fas fa-minus', 'fas fa-cog',
    'fas fa-user', 'fas fa-users', 'fas fa-bell', 'fas fa-bookmark',
    'fas fa-flag', 'fas fa-globe', 'fas fa-map-marker-alt', 'fas fa-search',
    'fas fa-eye', 'fas fa-lock', 'fas fa-unlock', 'fas fa-key',
    'fas fa-shield-alt', 'fas fa-trophy', 'fas fa-crown', 'fas fa-gem'
  ],
  media: [
    'fas fa-play', 'fas fa-pause', 'fas fa-stop', 'fas fa-music',
    'fas fa-headphones', 'fas fa-microphone', 'fas fa-microphone-alt',
    'fas fa-volume-up', 'fas fa-volume-down', 'fas fa-broadcast-tower',
    'fas fa-podcast', 'fas fa-radio', 'fas fa-video', 'fas fa-film',
    'fas fa-camera', 'fas fa-image', 'fas fa-photo-video', 'fas fa-compact-disc',
    'fas fa-record-vinyl', 'fas fa-sliders-h', 'fas fa-equalizer',
    'fas fa-waveform', 'fas fa-signal', 'fas fa-satellite-dish'
  ],
  business: [
    'fas fa-briefcase', 'fas fa-building', 'fas fa-store', 'fas fa-shopping-cart',
    'fas fa-dollar-sign', 'fas fa-chart-line', 'fas fa-chart-bar', 'fas fa-chart-pie',
    'fas fa-calculator', 'fas fa-receipt', 'fas fa-file-invoice', 'fas fa-file-invoice-dollar',
    'fas fa-handshake', 'fas fa-users-cog', 'fas fa-user-tie', 'fas fa-id-card',
    'fas fa-clipboard', 'fas fa-tasks', 'fas fa-project-diagram', 'fas fa-sitemap',
    'fas fa-bullhorn', 'fas fa-ad', 'fas fa-percentage', 'fas fa-tags'
  ],
  tech: [
    'fas fa-microchip', 'fas fa-laptop', 'fas fa-desktop', 'fas fa-mobile-alt',
    'fas fa-tablet-alt', 'fas fa-server', 'fas fa-database', 'fas fa-cloud',
    'fas fa-wifi', 'fas fa-network-wired', 'fas fa-code', 'fas fa-terminal',
    'fas fa-robot', 'fas fa-brain', 'fas fa-memory', 'fas fa-hdd',
    'fas fa-plug', 'fas fa-bolt', 'fas fa-cogs', 'fas fa-wrench',
    'fas fa-tools', 'fas fa-sync', 'fas fa-download', 'fas fa-upload'
  ],
  communication: [
    'fas fa-comments', 'fas fa-comment', 'fas fa-comment-alt', 'fas fa-envelope',
    'fas fa-paper-plane', 'fas fa-inbox', 'fas fa-phone', 'fas fa-phone-alt',
    'fas fa-fax', 'fas fa-at', 'fas fa-hashtag', 'fas fa-share',
    'fas fa-share-alt', 'fas fa-retweet', 'fas fa-reply', 'fas fa-forward',
    'fas fa-calendar', 'fas fa-calendar-alt', 'fas fa-clock', 'fas fa-history',
    'fas fa-rss', 'fas fa-satellite', 'fas fa-bullseye', 'fas fa-info-circle'
  ]
}

const filteredIcons = computed(() => {
  let icons = iconsByCategory[activeCategory.value] || []

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    // Search across all categories
    icons = Object.values(iconsByCategory)
      .flat()
      .filter(icon => icon.toLowerCase().includes(query))
  }

  return [...new Set(icons)] // Remove duplicates
})

const togglePicker = () => {
  isOpen.value = !isOpen.value
}

const closePicker = () => {
  isOpen.value = false
}

const selectIcon = (icon) => {
  emit('update:modelValue', icon)
  closePicker()
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closePicker()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.icon-picker {
  @apply relative;
}

.icon-picker-trigger {
  @apply flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer;
  @apply bg-dark-secondary border border-dark-border;
  @apply transition-all duration-200;
  @apply hover:border-primary-500;
}

.selected-icon {
  @apply w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center;
}

.selected-icon i {
  @apply text-primary-400;
}

.trigger-text {
  @apply flex-1 text-sm text-text-secondary truncate;
}

.trigger-arrow {
  @apply text-xs text-text-tertiary transition-transform duration-200;
}

.backdrop {
  @apply fixed inset-0 z-40;
}

.icon-picker-dropdown {
  @apply absolute top-full left-0 mt-2 w-80 z-50;
  @apply bg-dark-tertiary border border-dark-border rounded-xl;
  @apply shadow-2xl overflow-hidden;
}

.dropdown-header {
  @apply p-3 border-b border-dark-border;
}

.categories-tabs {
  @apply flex gap-1 p-2 border-b border-dark-border overflow-x-auto;
}

.category-tab {
  @apply flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs;
  @apply text-text-secondary bg-transparent;
  @apply transition-all duration-200 whitespace-nowrap;
  @apply hover:bg-dark-hover hover:text-text-primary;
}

.category-tab.active {
  @apply bg-primary-500/20 text-primary-400;
}

.category-tab i {
  @apply text-xs;
}

.icons-grid {
  @apply grid grid-cols-6 gap-1 p-3 max-h-60 overflow-y-auto;
}

.icon-option {
  @apply w-10 h-10 rounded-lg flex items-center justify-center;
  @apply text-text-secondary bg-transparent;
  @apply transition-all duration-200;
  @apply hover:bg-dark-hover hover:text-text-primary;
}

.icon-option.selected {
  @apply bg-primary-500/20 text-primary-400;
}

.icon-option i {
  @apply text-base;
}

.no-results {
  @apply col-span-6 text-center py-4 text-text-tertiary text-sm;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-200;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0 translate-y-2;
}
</style>
