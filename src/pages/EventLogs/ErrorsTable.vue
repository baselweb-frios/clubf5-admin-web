<template>
  <div class="errors-table-container">
    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Categoria</label>
          <select v-model="filters.category" @change="applyFilters" class="filter-select">
            <option :value="null">Todas</option>
            <option v-for="(label, cat) in store.ErrorCategoryLabels" :key="cat" :value="Number(cat)">
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
          <label class="filter-label">Estado</label>
          <select v-model="filters.isHandled" @change="applyFilters" class="filter-select">
            <option :value="null">Todos</option>
            <option :value="true">Manejados</option>
            <option :value="false">No Manejados</option>
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

        <div class="filter-actions">
          <button @click="clearFilters" class="btn btn-ghost btn-sm">
            <i class="fa fa-times"></i>
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.errorsLoading" class="loading-state">
      <i class="fa fa-spinner fa-spin fa-2x"></i>
      <p>Cargando errores...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!store.hasErrors" class="empty-state success">
      <i class="fa fa-check-circle fa-3x"></i>
      <h3>Sin errores</h3>
      <p>No se encontraron errores con los filtros seleccionados</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Categoria</th>
            <th>Severidad</th>
            <th>Endpoint</th>
            <th>Tipo Excepcion</th>
            <th>Mensaje</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="error in store.errors" :key="error.id" @click="showDetail(error)" class="clickable-row">
            <td class="timestamp-cell">
              {{ formatDate(error.timestamp) }}
            </td>
            <td>
              <span class="badge badge-category">
                <i :class="getCategoryIcon(error.category)"></i>
                {{ store.getErrorCategoryLabel(error.category) }}
              </span>
            </td>
            <td>
              <span class="badge" :class="`badge-${store.getSeverityColor(error.severity)}`">
                {{ store.getSeverityLabel(error.severity) }}
              </span>
            </td>
            <td class="endpoint-cell">
              <span class="http-method" :class="`method-${error.httpMethod?.toLowerCase()}`">
                {{ error.httpMethod }}
              </span>
              <span class="endpoint-path">{{ error.endpoint }}</span>
            </td>
            <td class="exception-cell">
              <span class="exception-type">{{ getShortExceptionType(error.exceptionType) }}</span>
            </td>
            <td class="message-cell">
              {{ truncateMessage(error.message) }}
            </td>
            <td>
              <span class="status-indicator" :class="error.isHandled ? 'handled' : 'unhandled'">
                <i :class="error.isHandled ? 'fa fa-check' : 'fa fa-exclamation'"></i>
                {{ error.isHandled ? 'Manejado' : 'No Manejado' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination-section">
        <div class="pagination-info">
          Mostrando {{ store.errors.length }} de {{ store.errorsTotal }} errores
        </div>
        <button
          v-if="store.errors.length < store.errorsTotal"
          @click="loadMore"
          class="btn btn-outline btn-sm"
          :disabled="store.errorsLoading"
        >
          <i class="fa fa-plus"></i>
          Cargar mas
        </button>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedError" class="modal-overlay" @click.self="selectedError = null">
      <div class="modal-content">
        <div class="modal-header" :class="`header-${store.getSeverityColor(selectedError.severity)}`">
          <div class="header-info">
            <span class="badge" :class="`badge-${store.getSeverityColor(selectedError.severity)}`">
              {{ store.getSeverityLabel(selectedError.severity) }}
            </span>
            <h3>{{ getShortExceptionType(selectedError.exceptionType) }}</h3>
          </div>
          <button @click="selectedError = null" class="btn-close">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <!-- Error Info -->
          <div class="detail-section">
            <h4>Informacion General</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>ID</label>
                <span class="mono">{{ selectedError.id }}</span>
              </div>
              <div class="detail-item">
                <label>Timestamp</label>
                <span>{{ formatDate(selectedError.timestamp) }}</span>
              </div>
              <div class="detail-item">
                <label>Categoria</label>
                <span class="badge badge-category">
                  <i :class="getCategoryIcon(selectedError.category)"></i>
                  {{ store.getErrorCategoryLabel(selectedError.category) }}
                </span>
              </div>
              <div class="detail-item">
                <label>HTTP Status</label>
                <span :class="getStatusClass(selectedError.httpStatusCode)">
                  {{ selectedError.httpStatusCode }}
                </span>
              </div>
              <div class="detail-item">
                <label>Endpoint</label>
                <span class="mono">{{ selectedError.httpMethod }} {{ selectedError.endpoint }}</span>
              </div>
              <div class="detail-item">
                <label>Estado</label>
                <span class="status-indicator" :class="selectedError.isHandled ? 'handled' : 'unhandled'">
                  {{ selectedError.isHandled ? 'Manejado' : 'No Manejado' }}
                </span>
              </div>
              <div class="detail-item">
                <label>Ocurrencias</label>
                <span class="occurrence-count">{{ selectedError.occurrenceCount }}x</span>
              </div>
              <div class="detail-item">
                <label>Error Hash</label>
                <span class="mono small">{{ selectedError.errorHash }}</span>
              </div>
            </div>
          </div>

          <!-- User Info -->
          <div class="detail-section">
            <h4>Usuario</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Usuario</label>
                <span>{{ selectedError.userId || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>Rol</label>
                <span>{{ selectedError.userRole || '-' }}</span>
              </div>
              <div class="detail-item">
                <label>IP</label>
                <span class="mono">{{ selectedError.clientIp || '-' }}</span>
              </div>
              <div class="detail-item full-width">
                <label>User Agent</label>
                <span class="mono small">{{ selectedError.userAgent || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Exception Details -->
          <div class="detail-section">
            <h4>Detalles de la Excepcion</h4>
            <div class="detail-grid">
              <div class="detail-item full-width">
                <label>Tipo</label>
                <span class="mono">{{ selectedError.exceptionType }}</span>
              </div>
              <div class="detail-item full-width">
                <label>Mensaje</label>
                <div class="error-message">{{ selectedError.message }}</div>
              </div>
              <div v-if="selectedError.source" class="detail-item full-width">
                <label>Source</label>
                <span class="mono">{{ selectedError.source }}</span>
              </div>
              <div v-if="selectedError.innerException" class="detail-item full-width">
                <label>Inner Exception</label>
                <div class="inner-exception">{{ selectedError.innerException }}</div>
              </div>
            </div>
          </div>

          <!-- Stack Trace -->
          <div v-if="selectedError.stackTrace" class="detail-section">
            <h4>
              <i class="fa fa-code"></i>
              Stack Trace
            </h4>
            <pre class="stack-trace">{{ selectedError.stackTrace }}</pre>
          </div>

          <!-- Request Info -->
          <div v-if="selectedError.queryString || selectedError.requestBody" class="detail-section">
            <h4>Informacion de la Solicitud</h4>
            <div class="detail-grid">
              <div v-if="selectedError.queryString" class="detail-item full-width">
                <label>Query String</label>
                <span class="mono">{{ selectedError.queryString }}</span>
              </div>
              <div v-if="selectedError.requestBody" class="detail-item full-width">
                <label>Request Body</label>
                <pre class="code-block">{{ formatJson(selectedError.requestBody) }}</pre>
              </div>
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
const selectedError = ref(null)

const filters = reactive({
  category: null,
  minSeverity: null,
  isHandled: null,
  fromStr: '',
  toStr: ''
})

const applyFilters = () => {
  const params = {
    category: filters.category,
    minSeverity: filters.minSeverity,
    isHandled: filters.isHandled,
    from: filters.fromStr ? new Date(filters.fromStr) : null,
    to: filters.toStr ? new Date(filters.toStr) : null,
    skip: 0
  }
  store.setFilters(params)
  store.loadErrors(params)
}

const clearFilters = () => {
  filters.category = null
  filters.minSeverity = null
  filters.isHandled = null
  filters.fromStr = ''
  filters.toStr = ''
  store.resetFilters()
  store.loadErrors()
}

const loadMore = () => {
  store.loadMoreErrors()
}

const showDetail = (error) => {
  selectedError.value = error
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

const truncateMessage = (message, maxLength = 50) => {
  if (!message) return '-'
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
}

const getShortExceptionType = (exceptionType) => {
  if (!exceptionType) return 'Unknown'
  const parts = exceptionType.split('.')
  return parts[parts.length - 1]
}

const getCategoryIcon = (category) => {
  const icons = {
    1: 'fa fa-check-circle',      // Validation
    2: 'fa fa-lock',              // Authentication
    3: 'fa fa-shield',            // Authorization
    4: 'fa fa-database',          // Database
    5: 'fa fa-cloud',             // ExternalService
    6: 'fa fa-briefcase',         // Business
    7: 'fa fa-server',            // Internal
    8: 'fa fa-wifi',              // Network
    9: 'fa fa-clock-o',           // Timeout
    10: 'fa fa-question-circle'   // Unknown
  }
  return icons[category] || 'fa fa-exclamation-circle'
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
  // Errors are loaded from parent
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

.loading-state i {
  margin-bottom: var(--spacing-4);
  color: #4b5563;
}

.empty-state.success i {
  color: #22c55e;
  margin-bottom: var(--spacing-4);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-2) 0;
  color: #9ca3af;
}

.empty-state.success h3 {
  color: #22c55e;
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
  background: rgba(239, 68, 68, 0.05);
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

.endpoint-path {
  font-family: monospace;
  font-size: 0.8rem;
  color: #9ca3af;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exception-cell {
  max-width: 150px;
}

.exception-type {
  font-family: monospace;
  font-size: 0.8rem;
  color: #f87171;
}

.message-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
}

.status-indicator.handled {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-indicator.unhandled {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-category {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}

.badge-category i {
  font-size: 0.7rem;
}

.badge-info { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.badge-success { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.badge-warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.badge-danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.badge-critical { background: rgba(220, 38, 38, 0.3); color: #fca5a5; }
.badge-secondary { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }

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
  background: rgba(0, 0, 0, 0.8);
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
  max-width: 900px;
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

.modal-header.header-danger {
  background: rgba(239, 68, 68, 0.1);
  border-bottom-color: rgba(239, 68, 68, 0.2);
}

.modal-header.header-warning {
  background: rgba(245, 158, 11, 0.1);
  border-bottom-color: rgba(245, 158, 11, 0.2);
}

.modal-header.header-critical {
  background: rgba(220, 38, 38, 0.15);
  border-bottom-color: rgba(220, 38, 38, 0.3);
}

.header-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.header-info h3 {
  margin: 0;
  color: #ffffff;
  font-family: monospace;
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

/* Detail Sections */
.detail-section {
  margin-bottom: var(--spacing-6);
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 var(--spacing-3) 0;
  color: #9ca3af;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
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
  font-size: 0.7rem;
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

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  color: #fca5a5;
  font-size: 0.9rem;
}

.inner-exception {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  color: #fcd34d;
  font-size: 0.85rem;
}

.stack-trace {
  background: rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  font-family: monospace;
  font-size: 0.75rem;
  color: #9ca3af;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  max-height: 300px;
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

.occurrence-count {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.status-success { color: #22c55e; }
.status-warning { color: #f59e0b; }
.status-error { color: #ef4444; }

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
