<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
        <svg
class="w-12 h-12 text-primary-600"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
          <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
/>
        </svg>
      </div>

      <h1 class="text-6xl font-bold text-gray-900 mb-4">
404
</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">
Página no encontrada
</h2>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>

      <div class="space-x-4">
        <base-button
variant="primary"
@click="goHome"
>
          <svg
class="w-5 h-5 mr-2"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
            <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
/>
          </svg>
          Volver al inicio
        </base-button>

        <base-button
variant="outline"
@click="goBack"
>
          <svg
class="w-5 h-5 mr-2"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
            <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M10 19l-7-7m0 0l7-7m-7 7h18"
/>
          </svg>
          Volver atrás
        </base-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>
