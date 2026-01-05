<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ClienteLayout from './ClienteLayout.vue'
//import OperadorLayout from './ReproductorLayout.vue'
import ReproductorLayout from './ReproductorLayout.vue'
import DashboardLayout from './DashboardLayout.vue'

const authStore = useAuthStore()

const layoutComponent = computed(() => {
  const role = authStore.userRole

  switch (role) {
    case 'Cliente':
    case 'Administrador':
      return ClienteLayout
    case 'Reproductor':
    case 'Usuario':
      return ReproductorLayout
    default:
      return DashboardLayout
  }
})
</script>
