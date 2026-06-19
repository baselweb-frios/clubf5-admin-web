<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-if="needRefresh"
        class="fixed bottom-6 right-6 z-[9999] flex items-center gap-4 rounded-xl border border-white/10 bg-dark-surface px-5 py-4 shadow-2xl shadow-black/40"
      >
        <!-- Icono -->
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>

        <!-- Texto -->
        <div class="flex flex-col gap-0.5">
          <span class="text-sm font-semibold text-text-primary">Nueva versión disponible</span>
          <span class="text-xs text-text-tertiary">Actualizá para obtener los últimos cambios</span>
        </div>

        <!-- Botones -->
        <div class="flex items-center gap-2">
          <button
            class="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent/80"
            @click="updateNow"
          >
            Actualizar ahora
          </button>
          <button
            class="rounded-lg px-2 py-1.5 text-text-tertiary transition hover:text-text-primary"
            aria-label="Cerrar"
            @click="dismiss"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useAppUpdate } from '@/composables/useAppUpdate'

const { needRefresh, updateNow } = useAppUpdate()

function dismiss() {
  needRefresh.value = false
}
</script>
