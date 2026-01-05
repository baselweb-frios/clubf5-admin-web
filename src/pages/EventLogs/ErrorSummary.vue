<template>
  <div class="error-summary-container">
    <!-- Filtros de periodo -->
    <div class="period-filters">
      <button
        v-for="period in periods"
        :key="period.id"
        @click="selectPeriod(period)"
        class="period-btn"
        :class="{ active: selectedPeriod === period.id }"
      >
        {{ period.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="fa fa-spinner fa-spin fa-2x"></i>
      <p>Cargando resumen...</p>
    </div>

    <!-- Content -->
    <div v-else class="summary-content">
      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Events by Type -->
        <div class="chart-card">
          <h3 class="chart-title">
            <i class="fa fa-pie-chart"></i>
            Eventos por Tipo
          </h3>
          <div class="chart-content">
            <div v-if="hasEventsByType" class="bar-chart">
              <div
                v-for="(value, type) in store.dashboard?.last24Hours?.eventsByType || {}"
                :key="type"
                class="bar-item"
              >
                <div class="bar-label">{{ store.getEventTypeLabel(Number(type.split(':')[1] || type)) }}</div>
                <div class="bar-container">
                  <div
                    class="bar-fill type-fill"
                    :style="{ width: getBarWidth(value, maxEventsByType) }"
                  ></div>
                </div>
                <div class="bar-value">{{ value }}</div>
              </div>
            </div>
            <div v-else class="empty-chart">
              <i class="fa fa-inbox"></i>
              <span>Sin datos</span>
            </div>
          </div>
        </div>

        <!-- Errors by Category -->
        <div class="chart-card">
          <h3 class="chart-title">
            <i class="fa fa-exclamation-triangle"></i>
            Errores por Categoria
          </h3>
          <div class="chart-content">
            <div v-if="hasErrorsByCategory" class="bar-chart">
              <div
                v-for="(value, cat) in store.dashboard?.last24Hours?.errorsByCategory || {}"
                :key="cat"
                class="bar-item"
              >
                <div class="bar-label">{{ store.getErrorCategoryLabel(Number(cat.split(':')[1] || cat)) }}</div>
                <div class="bar-container">
                  <div
                    class="bar-fill error-fill"
                    :style="{ width: getBarWidth(value, maxErrorsByCategory) }"
                  ></div>
                </div>
                <div class="bar-value">{{ value }}</div>
              </div>
            </div>
            <div v-else class="empty-chart success">
              <i class="fa fa-check-circle"></i>
              <span>Sin errores</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Severity Distribution -->
      <div class="charts-row">
        <!-- Events by Severity -->
        <div class="chart-card">
          <h3 class="chart-title">
            <i class="fa fa-signal"></i>
            Eventos por Severidad
          </h3>
          <div class="chart-content">
            <div v-if="hasEventsBySeverity" class="severity-cards">
              <div
                v-for="(value, severity) in store.dashboard?.last24Hours?.eventsBySeverity || {}"
                :key="severity"
                class="severity-card"
                :class="getSeverityClass(severity)"
              >
                <span class="severity-value">{{ value }}</span>
                <span class="severity-label">{{ store.getSeverityLabel(Number(severity.split(':')[1] || severity)) }}</span>
              </div>
            </div>
            <div v-else class="empty-chart">
              <i class="fa fa-inbox"></i>
              <span>Sin datos</span>
            </div>
          </div>
        </div>

        <!-- Errors by Severity -->
        <div class="chart-card">
          <h3 class="chart-title">
            <i class="fa fa-signal"></i>
            Errores por Severidad
          </h3>
          <div class="chart-content">
            <div v-if="hasErrorsBySeverity" class="severity-cards">
              <div
                v-for="(value, severity) in store.dashboard?.last24Hours?.errorsBySeverity || {}"
                :key="severity"
                class="severity-card"
                :class="getSeverityClass(severity)"
              >
                <span class="severity-value">{{ value }}</span>
                <span class="severity-label">{{ store.getSeverityLabel(Number(severity.split(':')[1] || severity)) }}</span>
              </div>
            </div>
            <div v-else class="empty-chart success">
              <i class="fa fa-check-circle"></i>
              <span>Sin errores</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Errors -->
      <div class="top-errors-section">
        <h3 class="section-title">
          <i class="fa fa-fire"></i>
          Errores mas Frecuentes (Ultimas 24 horas)
        </h3>

        <div v-if="store.topErrors.length > 0" class="top-errors-list">
          <div v-for="(error, index) in store.topErrors" :key="error.errorHash" class="top-error-item">
            <div class="error-rank" :class="getRankClass(index)">
              {{ index + 1 }}
            </div>
            <div class="error-info">
              <div class="error-header">
                <span class="exception-type">{{ error.exceptionType }}</span>
                <span class="error-count">
                  <i class="fa fa-repeat"></i>
                  {{ error.count }}x
                </span>
              </div>
              <div class="error-message">{{ truncateMessage(error.message, 100) }}</div>
              <div class="error-meta">
                <span v-if="error.controller" class="meta-item">
                  <i class="fa fa-cube"></i>
                  {{ error.controller }}
                </span>
                <span v-if="error.action" class="meta-item">
                  <i class="fa fa-cog"></i>
                  {{ error.action }}
                </span>
                <span class="meta-item">
                  <i class="fa fa-clock-o"></i>
                  Primera: {{ formatDate(error.firstOccurrence) }}
                </span>
                <span class="meta-item">
                  <i class="fa fa-clock-o"></i>
                  Ultima: {{ formatDate(error.lastOccurrence) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-top-errors">
          <i class="fa fa-check-circle fa-3x"></i>
          <h4>Sin errores frecuentes</h4>
          <p>No se han detectado errores repetidos en las ultimas 24 horas</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventLogsStore } from '@/stores/eventLogs'

const store = useEventLogsStore()
const loading = ref(false)
const selectedPeriod = ref('24h')

const periods = [
  { id: '1h', label: 'Ultima hora', hours: 1 },
  { id: '6h', label: '6 horas', hours: 6 },
  { id: '24h', label: '24 horas', hours: 24 },
  { id: '7d', label: '7 dias', hours: 168 },
  { id: '30d', label: '30 dias', hours: 720 }
]

const hasEventsByType = computed(() => {
  const data = store.dashboard?.last24Hours?.eventsByType
  return data && Object.keys(data).length > 0
})

const hasErrorsByCategory = computed(() => {
  const data = store.dashboard?.last24Hours?.errorsByCategory
  return data && Object.keys(data).length > 0
})

const hasEventsBySeverity = computed(() => {
  const data = store.dashboard?.last24Hours?.eventsBySeverity
  return data && Object.keys(data).length > 0
})

const hasErrorsBySeverity = computed(() => {
  const data = store.dashboard?.last24Hours?.errorsBySeverity
  return data && Object.keys(data).length > 0
})

const maxEventsByType = computed(() => {
  const data = store.dashboard?.last24Hours?.eventsByType || {}
  return Math.max(...Object.values(data), 1)
})

const maxErrorsByCategory = computed(() => {
  const data = store.dashboard?.last24Hours?.errorsByCategory || {}
  return Math.max(...Object.values(data), 1)
})

const selectPeriod = async (period) => {
  selectedPeriod.value = period.id
  loading.value = true

  try {
    const now = new Date()
    const from = new Date(now.getTime() - period.hours * 60 * 60 * 1000)

    await store.loadStats({ from, to: now })
    await store.loadErrorSummary({ from, to: now })
  } finally {
    loading.value = false
  }
}

const getBarWidth = (value, max) => {
  return `${(value / max) * 100}%`
}

const getSeverityClass = (severityKey) => {
  const severity = Number(severityKey.split(':')[1] || severityKey)
  const classes = {
    0: 'severity-debug',
    1: 'severity-info',
    2: 'severity-warning',
    3: 'severity-error',
    4: 'severity-critical'
  }
  return classes[severity] || 'severity-info'
}

const getRankClass = (index) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return 'rank-other'
}

const truncateMessage = (message, maxLength = 100) => {
  if (!message) return '-'
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('es-ES', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  loading.value = true
  try {
    await store.loadErrorSummary()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Period Filters */
.period-filters {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-5);
  flex-wrap: wrap;
}

.period-btn {
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: #9ca3af;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
}

.period-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-10);
  color: #6b7280;
}

.loading-state i {
  margin-bottom: var(--spacing-4);
  color: #60a5fa;
}

/* Charts Row */
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.chart-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.chart-title {
  margin: 0 0 var(--spacing-4) 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.chart-title i {
  color: #60a5fa;
}

.chart-content {
  min-height: 150px;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.bar-item {
  display: grid;
  grid-template-columns: 120px 1fr 50px;
  align-items: center;
  gap: var(--spacing-3);
}

.bar-label {
  font-size: 0.8rem;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-container {
  height: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width 0.5s ease;
}

.bar-fill.type-fill {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.bar-fill.error-fill {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.bar-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e5e7eb;
  text-align: right;
}

/* Empty Chart */
.empty-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #6b7280;
  gap: var(--spacing-2);
}

.empty-chart i {
  font-size: 2rem;
  opacity: 0.5;
}

.empty-chart.success {
  color: #22c55e;
}

.empty-chart.success i {
  opacity: 1;
}

/* Severity Cards */
.severity-cards {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.severity-card {
  flex: 1;
  min-width: 80px;
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  text-align: center;
}

.severity-debug {
  background: rgba(107, 114, 128, 0.2);
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.severity-info {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.severity-warning {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.severity-error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.severity-critical {
  background: rgba(220, 38, 38, 0.3);
  border: 1px solid rgba(220, 38, 38, 0.4);
}

.severity-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.severity-label {
  display: block;
  font-size: 0.7rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--spacing-1);
}

/* Top Errors Section */
.top-errors-section {
  margin-top: var(--spacing-4);
}

.section-title {
  margin: 0 0 var(--spacing-4) 0;
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.section-title i {
  color: #f59e0b;
}

.top-errors-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.top-error-item {
  display: flex;
  gap: var(--spacing-4);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  transition: all 0.2s ease;
}

.top-error-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.error-rank {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.rank-1 {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1a1a1a;
}

.rank-2 {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: #1a1a1a;
}

.rank-3 {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #ffffff;
}

.rank-other {
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

.error-info {
  flex: 1;
  min-width: 0;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

.exception-type {
  font-family: monospace;
  font-size: 0.9rem;
  color: #f87171;
  font-weight: 500;
}

.error-count {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 600;
}

.error-message {
  color: #9ca3af;
  font-size: 0.85rem;
  margin-bottom: var(--spacing-2);
  line-height: 1.4;
}

.error-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #6b7280;
}

.meta-item i {
  font-size: 0.7rem;
}

/* Empty Top Errors */
.empty-top-errors {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-10);
  text-align: center;
  color: #22c55e;
}

.empty-top-errors i {
  margin-bottom: var(--spacing-4);
  opacity: 0.8;
}

.empty-top-errors h4 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: 1.1rem;
}

.empty-top-errors p {
  margin: 0;
  color: #9ca3af;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .charts-row {
    grid-template-columns: 1fr;
  }

  .bar-item {
    grid-template-columns: 80px 1fr 40px;
  }

  .severity-cards {
    flex-direction: column;
  }

  .severity-card {
    min-width: auto;
  }

  .top-error-item {
    flex-direction: column;
  }

  .error-rank {
    align-self: flex-start;
  }
}
</style>
