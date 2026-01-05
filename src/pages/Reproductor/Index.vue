<template>
  <div class="space-y-6">
    <base-card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-white">Reproductor</h3>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span class="w-2 h-2 mr-1 bg-green-400 rounded-full"></span>
              En línea
            </span>
          </div>
        </div>
      </template>

      <div class="text-center py-16">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
          <svg class="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        <h3 class="text-xl font-medium text-gray-900 mb-2">Panel de Reproductor</h3>
        <p class="text-gray-500 mb-6">Esta funcionalidad estará disponible próximamente</p>

        <div class="max-w-md mx-auto space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gray-300 rounded-lg"></div>
              <div class="text-left">
                <div class="text-sm font-medium text-gray-900">Sin reproducción activa</div>
                <div class="text-xs text-gray-500">00:00 / 00:00</div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button class="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </base-card>
  </div>
</template>

<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
</script>
