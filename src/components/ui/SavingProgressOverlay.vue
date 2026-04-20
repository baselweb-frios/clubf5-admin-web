<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isSaving"
        class="fixed inset-0 z-modal bg-black/70 flex items-center justify-center"
        style="pointer-events: auto;"
      >
        <div class="bg-dark-secondary rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-dark-border">
          <!-- Icono animado -->
          <div class="flex justify-center mb-6">
            <div class="relative">
              <div class="w-20 h-20 rounded-full border-4 border-primary-500/20 flex items-center justify-center">
                <i class="fa fa-save text-4xl text-primary-400 fa-spin" />
              </div>
              <div
                class="absolute inset-0 rounded-full border-4 border-t-primary-500 animate-spin"
                style="animation-duration: 1.5s;"
              />
            </div>
          </div>

          <!-- Título -->
          <h3 class="text-xl font-semibold text-text-primary text-center mb-2">
            Guardando programaciones...
          </h3>

          <!-- Progreso -->
          <p class="text-text-secondary text-center mb-4">
            {{ savedCount }} de {{ totalToSave }} programaciones guardadas
          </p>

          <!-- Barra de progreso -->
          <div class="h-3 bg-dark-tertiary rounded-full overflow-hidden mb-2">
            <div
              class="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300 ease-out"
              :style="{ width: `${progress}%` }"
            />
          </div>

          <!-- Porcentaje -->
          <p class="text-primary-400 text-center font-semibold">
            {{ progress }}%
          </p>

          <!-- Mensaje de espera -->
          <p class="text-text-tertiary text-xs text-center mt-4">
            Por favor, no cierre esta ventana...
          </p>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'SavingProgressOverlay',
  props: {
    isSaving: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0
    },
    totalToSave: {
      type: Number,
      default: 0
    },
    savedCount: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out;
  will-change: opacity;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Spinner animation - GPU accelerated */
.fa-spin {
  animation: fa-spin 1s linear infinite;
  will-change: transform;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
