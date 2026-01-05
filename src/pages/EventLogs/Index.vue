<template>
  <div class="event-logs-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fa fa-list-alt"></i>
          Monitor de Eventos del Sistema
        </h1>
        <p class="page-subtitle">Visualiza y analiza los eventos y errores de la aplicacion</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-outline" :disabled="store.isLoading">
          <i class="fa fa-refresh" :class="{ 'fa-spin': store.isLoading }"></i>
          Actualizar
        </button>
        <button @click="showClearModal = true" class="btn btn-danger-outline" :disabled="store.isLoading || store.clearingLogs">
          <i class="fa fa-trash"></i>
          Limpiar Logs
        </button>
      </div>
    </div>

    <!-- Modal de Limpieza -->
    <div v-if="showClearModal" class="modal-overlay" @click.self="showClearModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fa fa-trash"></i> Limpiar Logs del Sistema</h3>
          <button class="modal-close" @click="showClearModal = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="warning-box">
            <i class="fa fa-exclamation-triangle"></i>
            <p><strong>Advertencia:</strong> Esta accion eliminara los logs seleccionados de forma permanente.</p>
          </div>

          <div class="form-group">
            <label>Que deseas eliminar?</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="clearType" value="all" />
                <span class="radio-label">Todos los logs (eventos y errores)</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="clearType" value="events" />
                <span class="radio-label">Solo eventos</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="clearType" value="errors" />
                <span class="radio-label">Solo errores</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Periodo de eliminacion</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="clearPeriod" value="all" />
                <span class="radio-label">Eliminar todo (sin filtro de fecha)</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="clearPeriod" value="30" />
                <span class="radio-label">Anteriores a 30 dias</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="clearPeriod" value="7" />
                <span class="radio-label">Anteriores a 7 dias</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="clearPeriod" value="1" />
                <span class="radio-label">Anteriores a 1 dia</span>
              </label>
            </div>
          </div>

          <div v-if="clearResult" class="result-box" :class="{ success: !clearError, error: clearError }">
            <i :class="clearError ? 'fa fa-times-circle' : 'fa fa-check-circle'"></i>
            <span>{{ clearResult }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showClearModal = false" :disabled="store.clearingLogs">
            Cancelar
          </button>
          <button class="btn btn-danger" @click="executeClear" :disabled="store.clearingLogs">
            <i v-if="store.clearingLogs" class="fa fa-spinner fa-spin"></i>
            <i v-else class="fa fa-trash"></i>
            {{ store.clearingLogs ? 'Eliminando...' : 'Eliminar Logs' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="dashboard-grid">
      <!-- Health Status -->
      <div class="stat-card" :class="healthStatusClass">
        <div class="stat-icon">
          <i :class="healthIcon"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ healthStatusLabel }}</span>
          <span class="stat-label">Estado del Sistema</span>
        </div>
      </div>

      <!-- Eventos Ultima Hora -->
      <div class="stat-card info">
        <div class="stat-icon">
          <i class="fa fa-clock-o"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ store.lastHourEvents }}</span>
          <span class="stat-label">Eventos (ultima hora)</span>
        </div>
      </div>

      <!-- Eventos 24h -->
      <div class="stat-card primary">
        <div class="stat-icon">
          <i class="fa fa-calendar"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ store.last24HoursEvents }}</span>
          <span class="stat-label">Eventos (24h)</span>
        </div>
      </div>

      <!-- Errores 24h -->
      <div class="stat-card" :class="store.last24HoursErrors > 0 ? 'danger' : 'success'">
        <div class="stat-icon">
          <i class="fa fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ store.last24HoursErrors }}</span>
          <span class="stat-label">Errores (24h)</span>
        </div>
      </div>

      <!-- Error Rate -->
      <div class="stat-card" :class="errorRateClass">
        <div class="stat-icon">
          <i class="fa fa-percent"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ store.errorRate }}%</span>
          <span class="stat-label">Tasa de Errores</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="tab-badge">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Eventos Tab -->
      <div v-if="activeTab === 'events'" class="events-section">
        <EventsTable />
      </div>

      <!-- Errores Tab -->
      <div v-if="activeTab === 'errors'" class="errors-section">
        <ErrorsTable />
      </div>

      <!-- Resumen Tab -->
      <div v-if="activeTab === 'summary'" class="summary-section">
        <ErrorSummary />
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="store.dashboardLoading && !store.dashboard" class="loading-overlay">
      <div class="loader-content">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
        <p>Cargando datos del sistema...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventLogsStore } from '@/stores/eventLogs'
import EventsTable from './EventsTable.vue'
import ErrorsTable from './ErrorsTable.vue'
import ErrorSummary from './ErrorSummary.vue'

const store = useEventLogsStore()
const activeTab = ref('events')

// Clear logs modal
const showClearModal = ref(false)
const clearType = ref('all')
const clearPeriod = ref('all')
const clearResult = ref('')
const clearError = ref(false)

const executeClear = async () => {
  clearResult.value = ''
  clearError.value = false

  const olderThanDays = clearPeriod.value === 'all' ? null : parseInt(clearPeriod.value)

  try {
    let result
    if (clearType.value === 'all') {
      result = await store.clearAllLogs(olderThanDays)
      clearResult.value = `Eliminados ${result.totalDeleted} logs (${result.eventsDeleted} eventos, ${result.errorsDeleted} errores)`
    } else if (clearType.value === 'events') {
      result = await store.clearEvents(olderThanDays)
      clearResult.value = `Eliminados ${result.deletedCount} eventos`
    } else {
      result = await store.clearErrors(olderThanDays)
      clearResult.value = `Eliminados ${result.deletedCount} errores`
    }

    // Cerrar modal despues de 2 segundos en caso de exito
    setTimeout(() => {
      showClearModal.value = false
      clearResult.value = ''
    }, 2000)
  } catch (err) {
    clearError.value = true
    clearResult.value = err.message || 'Error al eliminar logs'
  }
}

const tabs = computed(() => [
  { id: 'events', label: 'Eventos', icon: 'fa fa-list', count: store.eventsTotal },
  { id: 'errors', label: 'Errores', icon: 'fa fa-exclamation-circle', count: store.errorsTotal },
  { id: 'summary', label: 'Resumen', icon: 'fa fa-pie-chart' }
])

const healthStatusClass = computed(() => {
  const status = store.healthStatus
  return {
    success: status === 'healthy',
    warning: status === 'warning',
    danger: status === 'degraded' || status === 'critical',
    secondary: status === 'unknown'
  }
})

const healthStatusLabel = computed(() => {
  const labels = {
    healthy: 'Saludable',
    warning: 'Advertencia',
    degraded: 'Degradado',
    critical: 'Critico',
    unknown: 'Desconocido'
  }
  return labels[store.healthStatus] || 'Desconocido'
})

const healthIcon = computed(() => {
  const icons = {
    healthy: 'fa fa-check-circle',
    warning: 'fa fa-exclamation-circle',
    degraded: 'fa fa-times-circle',
    critical: 'fa fa-times-circle',
    unknown: 'fa fa-question-circle'
  }
  return icons[store.healthStatus] || 'fa fa-question-circle'
})

const errorRateClass = computed(() => {
  const rate = store.errorRate
  if (rate < 1) return 'success'
  if (rate < 5) return 'warning'
  return 'danger'
})

const refreshData = async () => {
  await store.refreshAll()
}

onMounted(async () => {
  await store.loadDashboard()
  await store.loadEvents()
  await store.loadErrors()
})
</script>

<style scoped>
.event-logs-page {
  padding: var(--spacing-6);
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1d24 100%);
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-6);
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.page-title i {
  color: #60a5fa;
}

.page-subtitle {
  margin: var(--spacing-2) 0 0 0;
  color: #9ca3af;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.stat-card {
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-5);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-card.success .stat-icon { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.stat-card.warning .stat-icon { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.stat-card.danger .stat-icon { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.stat-card.info .stat-icon { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.stat-card.primary .stat-icon { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
.stat-card.secondary .stat-icon { background: rgba(107, 114, 128, 0.2); color: #6b7280; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: var(--spacing-1);
}

/* Tabs */
.tabs-container {
  margin-bottom: var(--spacing-4);
}

.tabs {
  display: flex;
  gap: var(--spacing-2);
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  color: #9ca3af;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.tab-btn.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.tab-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
}

.tab-btn.active .tab-badge {
  background: rgba(59, 130, 246, 0.3);
}

/* Tab Content */
.tab-content {
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-5);
  min-height: 400px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 20, 25, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loader-content {
  text-align: center;
  color: #ffffff;
}

.loader-content i {
  color: #60a5fa;
  margin-bottom: var(--spacing-4);
}

.loader-content p {
  margin: 0;
  font-size: 1rem;
  color: #9ca3af;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-outline {
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: #e5e7eb;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger-outline {
  background: transparent;
  border: 1.5px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.btn-danger-outline:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.6);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.btn-secondary {
  background: rgba(107, 114, 128, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.3);
  color: #9ca3af;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.modal-header h3 i {
  color: #ef4444;
}

.modal-close {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.modal-body {
  padding: var(--spacing-5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Warning box */
.warning-box {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  display: flex;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-5);
}

.warning-box i {
  color: #f59e0b;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.warning-box p {
  margin: 0;
  color: #fbbf24;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Form group */
.form-group {
  margin-bottom: var(--spacing-4);
}

.form-group > label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: var(--spacing-3);
}

/* Radio group */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-option:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.radio-option input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.radio-option input[type="radio"]:checked {
  border-color: #60a5fa;
}

.radio-option input[type="radio"]:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #60a5fa;
  border-radius: 50%;
}

.radio-label {
  color: #d1d5db;
  font-size: 0.9rem;
}

/* Result box */
.result-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-4);
}

.result-box.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.result-box.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.result-box i {
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1 1 45%;
  }
}
</style>
