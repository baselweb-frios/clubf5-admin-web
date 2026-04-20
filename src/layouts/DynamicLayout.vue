<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import DashboardLayout from './DashboardLayout.vue'

const layoutComponent = computed(() => {
  return DashboardLayout
})
</script>
