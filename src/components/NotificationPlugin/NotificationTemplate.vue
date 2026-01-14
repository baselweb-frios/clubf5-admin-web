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
}

/* Icon */
.notification-icon {
  @apply flex-shrink-0;
  @apply text-lg;
}

/* Content */
.notification-content {
  @apply flex-1 min-w-0;
  @apply text-sm;
}
</style>
