<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Control de Aire</h1>
    </div>

    <base-card>
      <template #header>
        <h3 class="text-lg font-medium">Control en Tiempo Real</h3>
      </template>

      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Módulo en desarrollo</h3>
        <p class="mt-1 text-sm text-gray-500">Esta funcionalidad estará disponible próximamente</p>
      </div>
    </base-card>
  </div>
</template>

<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
</script>
