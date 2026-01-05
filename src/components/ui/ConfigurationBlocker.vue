<template>
  <div class="config-blocker-overlay">
    <div class="config-blocker-modal">
      <div class="config-blocker-header">
        <div class="blocker-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2 class="blocker-title">Configuración Incompleta</h2>
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
            ></div>
          </div>
        </div>

        <!-- Missing Items List -->
        <div class="missing-items-section">
          <h3 class="section-title">
            <i class="fas fa-list-check"></i>
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
                <i :class="item.isComplete ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
              </div>
              <div class="check-content">
                <span class="check-label">{{ item.label }}</span>
                <span v-if="!item.isComplete" class="check-description">{{ item.description }}</span>
              </div>
              <button
                v-if="!item.isComplete && item.route"
                @click="navigateTo(item.route)"
                class="btn-configure"
              >
                <i class="fas fa-arrow-right"></i>
                Configurar
              </button>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="info-box">
          <div class="info-icon">
            <i class="fas fa-info-circle"></i>
          </div>
          <div class="info-content">
            <p class="info-title">¿Por qué necesito configurar esto?</p>
            <p class="info-text">
              La configuración completa es necesaria para crear sucursales funcionales.
              Cada sucursal requiere programaciones de música y spots, horarios y días de operación.
            </p>
          </div>
        </div>
      </div>

      <div class="config-blocker-footer">
        <button
          @click="goToConfiguration"
          class="btn-primary"
        >
          <i class="fas fa-cog"></i>
          Ir a Configuración
        </button>
        <button
          @click="goBack"
          class="btn-secondary"
        >
          <i class="fas fa-arrow-left"></i>
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
.config-blocker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
}

.config-blocker-modal {
  background: linear-gradient(135deg, rgba(26, 26, 64, 0.98) 0%, rgba(15, 15, 35, 0.98) 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.config-blocker-header {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.blocker-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(245, 158, 11, 0);
  }
}

.blocker-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.blocker-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.config-blocker-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Progress Section */
.progress-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f59e0b;
}

.progress-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease, background 0.3s ease;
}

.progress-low {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.progress-medium {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-high {
  background: linear-gradient(90deg, #10b981, #059669);
}

/* Missing Items Section */
.missing-items-section {
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #667eea;
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.checklist-item.completed {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}

.checklist-item.missing {
  border-color: rgba(239, 68, 68, 0.3);
}

.checklist-item.missing:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(239, 68, 68, 0.4);
}

.check-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.checklist-item.completed .check-icon {
  color: #10b981;
}

.checklist-item.missing .check-icon {
  color: #ef4444;
}

.check-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.check-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.check-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.btn-configure {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-configure:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

/* Info Box */
.info-box {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
}

.info-icon {
  font-size: 1.5rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-title {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.5rem 0;
}

.info-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
}

/* Footer */
.config-blocker-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  min-width: 200px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 640px) {
  .config-blocker-overlay {
    padding: 1rem;
  }

  .blocker-title {
    font-size: 1.5rem;
  }

  .blocker-subtitle {
    font-size: 0.9rem;
  }

  .config-blocker-body {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .checklist-item {
    flex-wrap: wrap;
  }

  .btn-configure {
    width: 100%;
    margin-top: 0.5rem;
  }

  .config-blocker-footer {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    min-width: 100%;
  }
}
</style>
