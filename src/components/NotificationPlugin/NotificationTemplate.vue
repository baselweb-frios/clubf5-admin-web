<template>
  <div class="notification-template">
    <div class="notification-icon">
      <i :class="icon || 'fas fa-info-circle'"></i>
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
.notification-template {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-icon {
  font-size: 24px;
  color: #1d8cf8;
}

.notification-content {
  flex: 1;
}
</style>
