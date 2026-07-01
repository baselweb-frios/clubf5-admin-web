<template>
  <div class="notification-template">
    <div class="notification-icon">
      <i :class="icon || 'fas fa-info-circle'" />
    </div>
    <div class="notification-content">
      <slot>{{ message }}</slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'fas fa-info-circle'
  }
})
</script>

<style scoped>
/* Notification Template */
.notification-template {
  @apply flex items-start gap-3;
  @apply animate-slide-in-right;
}

/* Icon */
.notification-icon {
  @apply flex-shrink-0 text-lg;
  @apply animate-bounce-in;
  @apply shadow-glow-primary;
}

/* Content */
.notification-content {
  @apply flex-1 min-w-0 text-sm;
  @apply animate-fade-in;
}
</style>
