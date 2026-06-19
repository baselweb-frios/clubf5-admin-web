<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-clipboard-list mr-3" />
          Logs del Sistema
        </h1>
        <p class="page-subtitle">Monitor de eventos y errores — solo administradores</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" :disabled="loading" @click="loadData()">
          <i class="fas fa-sync" :class="{ 'fa-spin': loading }" />
          Actualizar
        </button>
      </div>
    </div>

    <!-- Card principal -->
    <div class="card">
      <!-- Tabs -->
      <div class="flex items-center gap-2 mb-5 border-b border-dark-border pb-4">
        <button
          class="btn btn-sm"
          :class="activeTab === 'events' ? 'btn-primary' : 'btn-ghost'"
          @click="switchTab('events')"
        >
          <i class="fas fa-list-alt" />
          Eventos
        </button>
        <button
          class="btn btn-sm"
          :class="activeTab === 'errors' ? 'btn-danger' : 'btn-ghost'"
          @click="switchTab('errors')"
        >
          <i class="fas fa-exclamation-triangle" />
          Errores
        </button>
        <span v-if="!loading" class="ml-auto text-sm text-text-secondary">
          {{ totalCount.toLocaleString('es-AR') }} registros
        </span>
      </div>

      <!-- Filtros -->
      <div class="p-4 bg-dark-secondary rounded-lg border border-dark-border mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <!-- Desde -->
          <div class="form-group">
            <label class="label">Desde</label>
            <input v-model="filters.from" type="datetime-local" class="input" />
          </div>

          <!-- Hasta -->
          <div class="form-group">
            <label class="label">Hasta</label>
            <input v-model="filters.to" type="datetime-local" class="input" />
          </div>

          <!-- Tipo / Categoría -->
          <div class="form-group">
            <label class="label">{{ activeTab === 'events' ? 'Tipo de Evento' : 'Categoría' }}</label>
            <select v-if="activeTab === 'events'" v-model="filters.eventType" class="input">
              <option value="">Todos</option>
              <option v-for="(label, val) in EventTypeLabels" :key="val" :value="Number(val)">{{ label }}</option>
            </select>
            <select v-else v-model="filters.category" class="input">
              <option value="">Todas</option>
              <option v-for="(label, val) in ErrorCategoryLabels" :key="val" :value="Number(val)">{{ label }}</option>
            </select>
          </div>

          <!-- Severidad mínima -->
          <div class="form-group">
            <label class="label">Severidad mínima</label>
            <select v-model="filters.minSeverity" class="input">
              <option value="">Todas</option>
              <option v-for="(label, val) in EventSeverityLabels" :key="val" :value="Number(val)">{{ label }}</option>
            </select>
          </div>

          <!-- Usuario -->
          <div class="form-group">
            <label class="label">Usuario ID</label>
            <input v-model="filters.userId" type="text" class="input" placeholder="ID o nombre..." />
          </div>

          <!-- Controlador -->
          <div class="form-group">
            <label class="label">Controlador</label>
            <input v-model="filters.controller" type="text" class="input" placeholder="Nombre del controlador..." />
          </div>

          <!-- ActionCode (solo eventos) -->
          <div v-if="activeTab === 'events'" class="form-group">
            <label class="label">Código de Acción</label>
            <input v-model="filters.actionCode" type="text" class="input" placeholder="Código de acción..." />
          </div>

          <!-- isHandled (solo errores) -->
          <div v-if="activeTab === 'errors'" class="form-group">
            <label class="label">Manejado</label>
            <select v-model="filters.isHandled" class="input">
              <option value="">Todos</option>
              <option :value="true">Sí</option>
              <option :value="false">No</option>
            </select>
          </div>

          <!-- Botones de acción -->
          <div class="form-group flex items-end gap-2">
            <button class="btn btn-primary flex-1" :disabled="loading" @click="applyFilters()">
              <i class="fas fa-search" />
              Buscar
            </button>
            <button class="btn btn-ghost" title="Limpiar filtros" @click="clearFilters()">
              <i class="fas fa-times" />
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-container">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-12 gap-3 text-text-secondary">
          <i class="fas fa-spinner fa-spin text-2xl" />
          <span>Cargando...</span>
        </div>

        <table v-else class="table">
          <thead>
            <tr v-if="activeTab === 'events'">
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Severidad</th>
              <th>Usuario</th>
              <th>Controlador</th>
              <th>Acción</th>
              <th>Mensaje</th>
              <th class="text-center w-16">Ver</th>
            </tr>
            <tr v-else>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Severidad</th>
              <th>Usuario</th>
              <th>Controlador</th>
              <th>Mensaje</th>
              <th class="text-center">Manejado</th>
              <th class="text-center w-16">Ver</th>
            </tr>
          </thead>
          <tbody>
            <!-- Sin resultados -->
            <tr v-if="rows.length === 0">
              <td :colspan="activeTab === 'events' ? 8 : 8" class="text-center py-12 text-text-tertiary">
                <i class="fas fa-inbox text-3xl mb-3 block" />
                Sin registros para los filtros seleccionados
              </td>
            </tr>

            <!-- Filas de Eventos -->
            <template v-else-if="activeTab === 'events'">
              <tr v-for="(row, i) in rows" :key="i" class="cursor-pointer hover:bg-dark-hover" @click="openDetail(row)">
                <td class="text-sm whitespace-nowrap text-text-secondary">{{ formatDate(row) }}</td>
                <td>
                  <span class="badge badge-info badge-sm">{{ getEventTypeLabel(row.eventType) }}</span>
                </td>
                <td>
                  <span :class="['badge badge-sm', getSeverityClass(row.severity)]">
                    {{ getSeverityLabel(row.severity) }}
                  </span>
                </td>
                <td class="text-sm text-text-secondary max-w-[130px] truncate" :title="row.userId">
                  {{ row.userId || '-' }}
                </td>
                <td class="text-sm text-text-secondary">{{ row.controller || '-' }}</td>
                <td class="text-sm text-text-secondary">{{ row.actionCode || '-' }}</td>
                <td class="text-sm text-text-secondary max-w-[240px] truncate" :title="row.message || row.description">
                  {{ row.message || row.description || '-' }}
                </td>
                <td class="text-center">
                  <button class="btn btn-ghost btn-sm" @click.stop="openDetail(row)">
                    <i class="fas fa-eye" />
                  </button>
                </td>
              </tr>
            </template>

            <!-- Filas de Errores -->
            <template v-else>
              <tr v-for="(row, i) in rows" :key="i" class="cursor-pointer hover:bg-dark-hover" @click="openDetail(row)">
                <td class="text-sm whitespace-nowrap text-text-secondary">{{ formatDate(row) }}</td>
                <td>
                  <span class="badge badge-warning badge-sm">{{ getErrorCategoryLabel(row.category) }}</span>
                </td>
                <td>
                  <span :class="['badge badge-sm', getSeverityClass(row.severity)]">
                    {{ getSeverityLabel(row.severity) }}
                  </span>
                </td>
                <td class="text-sm text-text-secondary max-w-[130px] truncate" :title="row.userId">
                  {{ row.userId || '-' }}
                </td>
                <td class="text-sm text-text-secondary">{{ row.controller || '-' }}</td>
                <td class="text-sm text-text-secondary max-w-[240px] truncate" :title="row.errorMessage || row.message">
                  {{ row.errorMessage || row.message || '-' }}
                </td>
                <td class="text-center">
                  <span :class="row.isHandled ? 'badge badge-success badge-sm' : 'badge badge-danger badge-sm'">
                    {{ row.isHandled ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-ghost btn-sm" @click.stop="openDetail(row)">
                    <i class="fas fa-eye" />
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalCount > 0 && !loading" class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-dark-border">
        <span class="text-sm text-text-secondary">
          Mostrando {{ skip + 1 }}–{{ Math.min(skip + pageSize, totalCount) }} de {{ totalCount.toLocaleString('es-AR') }}
        </span>
        <div class="flex items-center gap-2">
          <select v-model.number="pageSize" class="input text-sm py-1 w-20" @change="applyFilters()">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <button class="btn btn-ghost btn-sm" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
            <i class="fas fa-chevron-left" />
          </button>
          <span class="text-sm font-medium">{{ currentPage }} / {{ totalPages }}</span>
          <button class="btn btn-ghost btn-sm" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
            <i class="fas fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Detalle -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="selectedRow" class="event-log-overlay" @click.self="closeDetail()">
          <div class="event-log-panel">
            <div class="flex items-center justify-between p-4 border-b border-dark-border">
              <h3 class="text-base font-semibold text-text-primary">
                <i class="fas fa-info-circle mr-2 text-primary-400" />
                Detalle del registro
              </h3>
              <button class="btn btn-ghost btn-sm" @click="closeDetail()">
                <i class="fas fa-times" />
              </button>
            </div>
            <div class="p-4 overflow-auto flex-1">
              <pre class="event-log-json">{{ JSON.stringify(selectedRow, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import eventLogService, {
  EventTypeLabels,
  EventSeverityLabels,
  EventSeverityColors,
  ErrorCategoryLabels,
  EventSeverity
} from '@/services/EventLogServices'

const toast = useToast()

// ===== STATE =====
const activeTab = ref('events')
const loading = ref(false)
const rows = ref([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(25)
const selectedRow = ref(null)

const emptyFilters = () => ({
  from: '',
  to: '',
  eventType: '',
  category: '',
  minSeverity: '',
  userId: '',
  controller: '',
  actionCode: '',
  isHandled: ''
})

const filters = ref(emptyFilters())

// ===== COMPUTED =====
const skip = computed(() => (currentPage.value - 1) * pageSize.value)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

// ===== HELPERS =====
const buildDateParam = (val) => {
  if (!val) return undefined
  return new Date(val)
}

const buildParams = () => {
  const p = {
    skip: skip.value,
    take: pageSize.value
  }
  if (filters.value.from) p.from = buildDateParam(filters.value.from)
  if (filters.value.to) p.to = buildDateParam(filters.value.to)
  if (filters.value.minSeverity !== '') p.minSeverity = filters.value.minSeverity
  if (filters.value.userId) p.userId = filters.value.userId
  if (filters.value.controller) p.controller = filters.value.controller
  return p
}

// ===== DATA LOADING =====
const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'events') {
      const params = buildParams()
      if (filters.value.eventType !== '') params.eventType = filters.value.eventType
      if (filters.value.actionCode) params.actionCode = filters.value.actionCode
      const res = await eventLogService.getEvents(params)
      rows.value = res.data ?? res
      totalCount.value = res.total ?? rows.value.length
    } else {
      const params = buildParams()
      if (filters.value.category !== '') params.category = filters.value.category
      if (filters.value.isHandled !== '') params.isHandled = filters.value.isHandled
      const res = await eventLogService.getErrors(params)
      rows.value = res.data ?? res
      totalCount.value = res.total ?? rows.value.length
    }
  } catch (err) {
    toast.error('Error al cargar los registros')
    rows.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// ===== ACTIONS =====
const applyFilters = () => {
  currentPage.value = 1
  loadData()
}

const clearFilters = () => {
  filters.value = emptyFilters()
  currentPage.value = 1
  loadData()
}

const switchTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  filters.value = emptyFilters()
  currentPage.value = 1
  rows.value = []
  totalCount.value = 0
  loadData()
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadData()
}

// ===== DETAIL MODAL =====
const openDetail = (row) => { selectedRow.value = row }
const closeDetail = () => { selectedRow.value = null }

// ===== FORMATTERS =====
const formatDate = (row) => {
  const raw = row.timestamp ?? row.createdAt ?? row.date ?? row.occurredAt
  if (!raw) return '-'
  try {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date(raw))
  } catch {
    return raw
  }
}

const getSeverityLabel = (val) => EventSeverityLabels[val] ?? val ?? '-'

const getSeverityClass = (val) => {
  const map = {
    [EventSeverity.Debug]: 'badge-secondary',
    [EventSeverity.Info]: 'badge-info',
    [EventSeverity.Warning]: 'badge-warning',
    [EventSeverity.Error]: 'badge-danger',
    [EventSeverity.Critical]: 'badge-danger'
  }
  return map[val] ?? 'badge-secondary'
}

const getEventTypeLabel = (val) => EventTypeLabels[val] ?? val ?? '-'
const getErrorCategoryLabel = (val) => ErrorCategoryLabels[val] ?? val ?? '-'

// ===== LIFECYCLE =====
onMounted(() => loadData())
</script>

<style scoped>
.event-log-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.event-log-panel {
  background: var(--color-dark-card, #1e2130);
  border: 1px solid var(--color-dark-border, #2e3347);
  border-radius: 0.75rem;
  width: 100%;
  max-width: 760px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.event-log-json {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--color-text-secondary, #a0aec0);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
