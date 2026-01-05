<template>
  <div class="events-table-container">
    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Tipo de Evento</label>
          <select v-model="filters.eventType" @change="applyFilters" class="filter-select">
            <option :value="null">Todos</option>
            <option v-for="(label, type) in store.EventTypeLabels" :key="type" :value="Number(type)">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Severidad Minima</label>
          <select v-model="filters.minSeverity" @change="applyFilters" class="filter-select">
            <option :value="null">Todas</option>
            <option v-for="(label, severity) in store.EventSeverityLabels" :key="severity" :value="Number(severity)">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Desde</label>
          <input
            type="datetime-local"
            v-model="filters.fromStr"
            @change="applyFilters"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Hasta</label>
          <input
            type="datetime-local"
            v-model="filters.toStr"
            @change="applyFilters"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Usuario</label>
          <input
            type="text"
            v-model="filters.userId"
            @input="debounceApplyFilters"
            class="filter-input"
            placeholder="Filtrar por usuario..."
          />
        </div>

        <div class="filter-actions">
          <button @click="clearFilters" class="btn btn-ghost btn-sm">
            <i class="fa fa-times"></i>
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.eventsLoading" class="loading-state">
      <i class="fa fa-spinner fa-spin fa-2x"></i>
      <p>Cargando eventos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!store.hasEvents" class="empty-state">
      <i class="fa fa-inbox fa-3x"></i>
      <h3>No hay eventos</h3>
      <p>No se encontraron eventos con los filtros seleccionados</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Tipo</th>
            <th>Severidad</th>
            <th>Endpoint</th>
            <th>Usuario</th>
            <th>Mensaje</th>
            <th>Tiempo (ms)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in store.events" :key="event.id" @click="showDetail(event)" class="clickable-row">
            <td class="timestamp-cell">
              {{ formatDate(event.timestamp) }}
            </td>
            <td>
              <span class="badge badge-type">
                {{ store.getEventTypeLabel(event.eventType) }}
              </span>
            </td>
            <td>
              <span class="badge" :class="`badge-${store.getSeverityColor(event.severity)}`">
                {{ store.getSeverityLabel(event.severity) }}
              </span>
            </td>
            <td class="endpoint-cell">
              <span class="http-method" :class="`method-${event.httpMethod?.toLowerCase()}`">
                {{ event.httpMethod }}
              </span>
              <span class="endpoint-path">{{ event.endpoint }}</span>
            </td>
            <td>
              <span v-if="event.userId" class="user-badge">
                <i class="fa fa-user"></i>
                {{ event.userId }}
              </span>
              <span v-else class="text-muted">-</span>
            </td>
            <td class="message-cell">
              {{ truncateMessage(event.message) }}
            </td>
            <td class="time-cell">
              <span v-if="event.executionTimeMs" :class="getTimeClass(event.executionTimeMs)">
                {{ event.executionTimeMs }}ms
              </span>
              <span v-else class="text-muted">-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination-section">
        <div class="pagination-info">
          Mostrando {{ store.events.length }} de {{ store.eventsTotal }} eventos
        </div>
        <button
          v-if="store.events.length < store.eventsTotal"
          @click="loadMore"
          class="btn btn-outline btn-sm"
          :disabled="store.eventsLoading"
        >
          <i class="fa fa-plus"></i>
          Cargar mas
        </button>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedEvent" class="modal-overlay" @click.self="selectedEvent = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detalle del Evento</h3>
          <button @click="selectedEvent = null" class="btn-close">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID</label>
              <span class="mono">{{ selectedEvent.id }}</span>
            </div>
            <div class="detail-item">
              <label>Timestamp</label>
              <span>{{ formatDate(selectedEvent.timestamp) }}</span>
            </div>
            <div class="detail-item">
              <label>Tipo</label>
              <span class="badge badge-type">{{ store.getEventTypeLabel(selectedEvent.eventType) }}</span>
            </div>
            <div class="detail-item">
              <label>Severidad</label>
              <span class="badge" :class="`badge-${store.getSeverityColor(selectedEvent.severity)}`">
                {{ store.getSeverityLabel(selectedEvent.severity) }}
              </span>
            </div>
            <div class="detail-item">
              <label>Endpoint</label>
              <span class="mono">{{ selectedEvent.httpMethod }} {{ selectedEvent.endpoint }}</span>
            </div>
            <div class="detail-item">
              <label>Status Code</label>
              <span :class="getStatusClass(selectedEvent.statusCode)">{{ selectedEvent.statusCode }}</span>
            </div>
            <div class="detail-item">
              <label>Tiempo de Ejecucion</label>
              <span>{{ selectedEvent.executionTimeMs }}ms</span>
            </div>
            <div class="detail-item">
              <label>Usuario</label>
              <span>{{ selectedEvent.userId || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Rol</label>
              <span>{{ selectedEvent.userRole || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>IP</label>
              <span class="mono">{{ selectedEvent.clientIp || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Controller</label>
              <span>{{ selectedEvent.controller || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Action</label>
              <span>{{ selectedEvent.action || '-' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>Mensaje</label>
              <span>{{ selectedEvent.message }}</span>
            </div>
            <div class="detail-item full-width">
              <label>User Agent</label>
              <span class="mono small">{{ selectedEvent.userAgent || '-' }}</span>
            </div>
            <div v-if="selectedEvent.additionalData" class="detail-item full-width">
              <label>Datos Adicionales</label>
              <pre class="code-block">{{ formatJson(selectedEvent.additionalData) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useEventLogsStore } from '@/stores/eventLogs'

const store = useEventLogsStore()
const selectedEvent = ref(null)

const filters = reactive({
  eventType: null,
  minSeverity: null,
  fromStr: '',
  toStr: '',
  userId: ''
})

let debounceTimer = null

const applyFilters = () => {
  const params = {
    eventType: filters.eventType,
    minSeverity: filters.minSeverity,
    from: filters.fromStr ? new Date(filters.fromStr) : null,
    to: filters.toStr ? new Date(filters.toStr) : null,
    userId: filters.userId || null,
    skip: 0
  }
  store.setFilters(params)
  store.loadEvents(params)
}

const debounceApplyFilters = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(applyFilters, 500)
}

const clearFilters = () => {
  filters.eventType = null
  filters.minSeverity = null
  filters.fromStr = ''
  filters.toStr = ''
  filters.userId = ''
  store.resetFilters()
  store.loadEvents()
}

const loadMore = () => {
  store.loadMoreEvents()
}

const showDetail = (event) => {
  selectedEvent.value = event
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const truncateMessage = (message, maxLength = 60) => {
  if (!message) return '-'
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
}

const getTimeClass = (ms) => {
  if (ms < 100) return 'time-fast'
  if (ms < 500) return 'time-normal'
  if (ms < 1000) return 'time-slow'
  return 'time-very-slow'
}

const getStatusClass = (statusCode) => {
  if (!statusCode) return ''
  if (statusCode >= 200 && statusCode < 300) return 'status-success'
  if (statusCode >= 400 && statusCode < 500) return 'status-warning'
  if (statusCode >= 500) return 'status-error'
  return ''
}

const formatJson = (jsonStr) => {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2)
  } catch {
    return jsonStr
  }
}

onMounted(() => {
  // Events are loaded from parent
})
</script>

<style scoped>
/* Filtros */
.filters-section {
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.filter-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select,
.filter-input {
  padding: var(--spacing-2) var(--spacing-3);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: #e5e7eb;
  font-size: 0.875rem;
  min-width: 150px;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

/* Loading/Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-10);
  color: #6b7280;
  text-align: center;
}

.loading-state i,
.empty-state i {
  margin-bottom: var(--spacing-4);
  color: #4b5563;
}

.empty-state h3 {
  margin: 0 0 var(--spacing-2) 0;
  color: #9ca3af;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  text-align: left;
  padding: var(--spacing-3) var(--spacing-4);
  background: rgba(255, 255, 255, 0.02);
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.data-table td {
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #e5e7eb;
}

.data-table tr.clickable-row {
  cursor: pointer;
  transition: background 0.2s ease;
}

.data-table tr.clickable-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

/* Cells */
.timestamp-cell {
  white-space: nowrap;
  color: #9ca3af;
  font-size: 0.8rem;
}

.endpoint-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.http-method {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.method-get { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.method-post { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.method-put { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.method-delete { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.method-patch { background: rgba(168, 85, 247, 0.2); color: #a855f7; }

.endpoint-path {
  font-family: monospace;
  font-size: 0.8rem;
  color: #9ca3af;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-cell {
  text-align: right;
}

.time-fast { color: #22c55e; }
.time-normal { color: #60a5fa; }
.time-slow { color: #f59e0b; }
.time-very-slow { color: #ef4444; }

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-type {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
}

.badge-info { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.badge-success { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.badge-warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.badge-danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.badge-critical { background: rgba(220, 38, 38, 0.3); color: #fca5a5; }
.badge-secondary { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  color: #9ca3af;
}

.user-badge i {
  font-size: 0.7rem;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.pagination-info {
  font-size: 0.875rem;
  color: #9ca3af;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
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
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header h3 {
  margin: 0;
  color: #ffffff;
}

.btn-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: var(--spacing-2);
  font-size: 1.25rem;
}

.btn-close:hover {
  color: #ffffff;
}

.modal-body {
  padding: var(--spacing-5);
  overflow-y: auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item span {
  color: #e5e7eb;
}

.detail-item .mono {
  font-family: monospace;
  font-size: 0.85rem;
}

.detail-item .small {
  font-size: 0.75rem;
}

.code-block {
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  font-family: monospace;
  font-size: 0.8rem;
  color: #9ca3af;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 0;
}

.status-success { color: #22c55e; }
.status-warning { color: #f59e0b; }
.status-error { color: #ef4444; }

.text-muted {
  color: #6b7280;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-sm {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: 0.8rem;
}

.btn-ghost {
  background: transparent;
  color: #9ca3af;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e5e7eb;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select,
  .filter-input {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-item.full-width {
    grid-column: span 1;
  }
}
</style>
