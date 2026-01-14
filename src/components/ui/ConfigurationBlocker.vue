<template>
  <div class="config-blocker-overlay">
    <div class="config-blocker-modal">
      <div class="config-blocker-header">
        <div class="blocker-icon">
          <i class="fas fa-exclamation-triangle" />
        </div>
        <h2 class="blocker-title">
Configuración Incompleta
</h2>
        <p class="blocker-subtitle">
          Debes completar la configuración inicial antes de acceder a esta sección
        </p>
      </div>

      <div class="config-blocker-body">
        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Progreso de Configuración</span>
            <span class="progress-percentage">{{ completionPercentage }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: completionPercentage + '%' }"
              :class="getProgressClass(completionPercentage)"
            />
          </div>
        </div>

        <!-- Missing Items List -->
        <div class="missing-items-section">
          <h3 class="section-title">
            <i class="fas fa-list-check" />
            Configuraciones Requeridas
          </h3>

          <div class="checklist">
            <div
              v-for="(item, index) in allConfigItems"
              :key="index"
              class="checklist-item"
              :class="{ 'completed': item.isComplete, 'missing': !item.isComplete }"
            >
              <div class="check-icon">
                <i :class="item.isComplete ? 'fas fa-check-circle' : 'fas fa-times-circle'" />
              </div>
              <div class="check-content">
                <span class="check-label">{{ item.label }}</span>
                <span
v-if="!item.isComplete"
class="check-description"
>{{ item.description }}</span>
              </div>
              <button
                v-if="!item.isComplete && item.route"
                class="btn-configure"
                @click="navigateTo(item.route)"
              >
                <i class="fas fa-arrow-right" />
                Configurar
              </button>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="info-box">
          <div class="info-icon">
            <i class="fas fa-info-circle" />
          </div>
          <div class="info-content">
            <p class="info-title">
¿Por qué necesito configurar esto?
</p>
            <p class="info-text">
              La configuración completa es necesaria para crear sucursales funcionales.
              Cada sucursal requiere programaciones de música y spots, horarios y días de operación.
            </p>
          </div>
        </div>
      </div>

      <div class="config-blocker-footer">
        <button
          class="btn-primary"
          @click="goToConfiguration"
        >
          <i class="fas fa-cog" />
          Ir a Configuración
        </button>
        <button
          class="btn-secondary"
          @click="goBack"
        >
          <i class="fas fa-arrow-left" />
          Volver al Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  configStatus: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const completionPercentage = computed(() => {
  const total = 5
  const completed = total - props.configStatus.missing.length
  return Math.round((completed / total) * 100)
})

const allConfigItems = computed(() => {
  return [
    {
      label: 'Horarios Disponibles',
      description: 'Define los horarios de operación de tu negocio',
      isComplete: props.configStatus.details.hasHorario,
      route: 'configuracion-cliente'
    },
    {
      label: 'Días Hábiles',
      description: 'Selecciona los días de operación',
      isComplete: props.configStatus.details.hasDias,
      route: 'configuracion-cliente'
    },
    {
      label: 'Tipo de Empresa',
      description: 'Indica el tipo de negocio que tienes',
      isComplete: props.configStatus.details.hasTipoEmpresa,
      route: 'configuracion-cliente'
    },
    {
      label: 'Programación de Música',
      description: 'Crea al menos una programación de música para las radios',
      isComplete: props.configStatus.details.hasProgramacionRadio,
      route: 'ProgramaMusica'
    },
    {
      label: 'Programación de Spots',
      description: 'Crea al menos una programación de spots publicitarios',
      isComplete: props.configStatus.details.hasProgramacionSpot,
      route: 'programaSpot'
    }
  ]
})

const getProgressClass = (percentage) => {
  if (percentage >= 80) return 'progress-high'
  if (percentage >= 50) return 'progress-medium'
  return 'progress-low'
}

const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

const goToConfiguration = () => {
  router.push({ name: 'ConfiguracionCliente' })
}

const goBack = () => {
  router.push({ name: 'Dashboard' })
}
</script>

<style scoped>
/* ===== OVERLAY ===== */
.config-blocker-overlay {
  @apply fixed inset-0 z-modal;
  @apply bg-black/70 backdrop-blur-sm;
  @apply flex items-center justify-center;
  @apply p-4;
}

/* ===== MODAL ===== */
.config-blocker-modal {
  @apply w-full max-w-2xl max-h-[90vh];
  @apply bg-dark-tertiary rounded-2xl;
  @apply border border-dark-border shadow-2xl;
  @apply overflow-hidden flex flex-col;
}

.light .config-blocker-modal {
  @apply bg-light-elevated border-light-border;
}

/* ===== HEADER ===== */
.config-blocker-header {
  @apply px-6 py-6 text-center;
  @apply bg-gradient-to-b from-warning-500/10 to-transparent;
  @apply border-b border-dark-border;
}

.light .config-blocker-header {
  @apply border-light-border;
}

.blocker-icon {
  @apply w-16 h-16 mx-auto mb-4;
  @apply flex items-center justify-center;
  @apply bg-warning-500/20 rounded-full;
  @apply text-warning-400 text-3xl;
}

.blocker-title {
  @apply text-xl font-bold text-text-primary mb-2;
}

.light .blocker-title {
  @apply text-text-light-primary;
}

.blocker-subtitle {
  @apply text-sm text-text-secondary;
}

.light .blocker-subtitle {
  @apply text-text-light-secondary;
}

/* ===== BODY ===== */
.config-blocker-body {
  @apply px-6 py-4 space-y-6 overflow-y-auto flex-1;
}

/* ===== PROGRESS SECTION ===== */
.progress-section {
  @apply space-y-2;
}

.progress-header {
  @apply flex items-center justify-between;
}

.progress-label {
  @apply text-sm font-medium text-text-secondary;
}

.light .progress-label {
  @apply text-text-light-secondary;
}

.progress-percentage {
  @apply text-sm font-bold text-text-primary;
}

.light .progress-percentage {
  @apply text-text-light-primary;
}

.progress-bar {
  @apply h-3 bg-dark-secondary rounded-full overflow-hidden;
}

.light .progress-bar {
  @apply bg-light-secondary;
}

.progress-fill {
  @apply h-full rounded-full transition-all duration-500 ease-apple;
}

.progress-fill.progress-low {
  @apply bg-danger-500;
}

.progress-fill.progress-medium {
  @apply bg-warning-500;
}

.progress-fill.progress-high {
  @apply bg-success-500;
}

/* ===== MISSING ITEMS SECTION ===== */
.missing-items-section {
  @apply space-y-3;
}

.section-title {
  @apply flex items-center gap-2;
  @apply text-sm font-semibold text-text-primary;
}

.light .section-title {
  @apply text-text-light-primary;
}

.section-title i {
  @apply text-primary-400;
}

/* ===== CHECKLIST ===== */
.checklist {
  @apply space-y-2;
}

.checklist-item {
  @apply flex items-center gap-3;
  @apply p-3 rounded-lg;
  @apply border border-dark-border;
  @apply transition-all duration-200;
}

.light .checklist-item {
  @apply border-light-border;
}

.checklist-item.completed {
  @apply bg-success-500/5 border-success-500/30;
}

.checklist-item.missing {
  @apply bg-dark-secondary;
}

.light .checklist-item.missing {
  @apply bg-light-secondary;
}

.check-icon {
  @apply flex-shrink-0 text-lg;
}

.checklist-item.completed .check-icon {
  @apply text-success-400;
}

.checklist-item.missing .check-icon {
  @apply text-danger-400;
}

.check-content {
  @apply flex-1 min-w-0;
}

.check-label {
  @apply block text-sm font-medium text-text-primary;
}

.light .check-label {
  @apply text-text-light-primary;
}

.check-description {
  @apply block text-xs text-text-tertiary mt-0.5;
}

.light .check-description {
  @apply text-text-light-tertiary;
}

.btn-configure {
  @apply flex items-center gap-2;
  @apply px-3 py-1.5 rounded-lg;
  @apply text-xs font-medium;
  @apply bg-primary-600 text-white;
  @apply hover:bg-primary-500;
  @apply transition-all duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
}

/* ===== INFO BOX ===== */
.info-box {
  @apply flex items-start gap-3;
  @apply p-4 rounded-lg;
  @apply bg-info-500/10 border border-info-500/30;
}

.info-icon {
  @apply flex-shrink-0 text-info-400 text-lg;
}

.info-content {
  @apply flex-1;
}

.info-title {
  @apply text-sm font-semibold text-info-300 mb-1;
}

.light .info-title {
  @apply text-info-700;
}

.info-text {
  @apply text-xs text-info-300/80;
}

.light .info-text {
  @apply text-info-600;
}

/* ===== FOOTER ===== */
.config-blocker-footer {
  @apply px-6 py-4;
  @apply border-t border-dark-border;
  @apply flex flex-col sm:flex-row items-center justify-center gap-3;
}

.light .config-blocker-footer {
  @apply border-light-border;
}

.btn-primary {
  @apply inline-flex items-center justify-center gap-2;
  @apply w-full sm:w-auto px-6 py-2.5 rounded-lg;
  @apply text-sm font-medium;
  @apply bg-primary-600 text-white;
  @apply hover:bg-primary-500;
  @apply transition-all duration-200 ease-apple;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
  @apply active:scale-[0.98];
}

.btn-secondary {
  @apply inline-flex items-center justify-center gap-2;
  @apply w-full sm:w-auto px-6 py-2.5 rounded-lg;
  @apply text-sm font-medium;
  @apply bg-dark-elevated text-text-primary;
  @apply border border-dark-border;
  @apply hover:bg-dark-hover hover:border-dark-hover;
  @apply transition-all duration-200 ease-apple;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-border;
  @apply active:scale-[0.98];
}

.light .btn-secondary {
  @apply bg-light-secondary text-text-light-primary border-light-border;
  @apply hover:bg-light-hover;
}
</style>

