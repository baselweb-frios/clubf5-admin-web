<template>
  <div class="data-table-wrapper">
    <!-- Search -->
    <div v-if="config.global_search?.visibility !== 'false'" class="table-search">
      <div class="search-input-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="config.global_search?.placeholder || 'Buscar...'"
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <loading-spinner v-if="loading" :loading="true" text="Cargando datos..." size="40px" />
      
      <!-- Desktop/Tablet Table View -->
      <table v-else class="data-table desktop-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.name || column.field"
              @click="column.sortable ? toggleSort(column.field) : null"
              :class="{ sortable: column.sortable, active: sortColumn === column.field }"
            >
              <div class="th-content">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable" class="sort-icon">
                  <i v-if="sortColumn !== column.field" class="fas fa-sort"></i>
                  <i v-else-if="sortDirection === 'asc'" class="fas fa-sort-up"></i>
                  <i v-else class="fas fa-sort-down"></i>
                </span>
              </div>
            </th>
            <th v-if="rowButtons.length > 0" class="actions-column">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in paginatedData"
            :key="index"
            :class="{ 'highlight-row': config.highlight_row_hover }"
          >
            <td v-for="column in columns" :key="column.name || column.field" :data-label="column.label">
              <slot
                v-if="column.field === 'actions' || $slots[column.field]"
                :name="column.field"
                :row="row"
                :index="index"
              >
                {{ getCellValue(row, column.field) }}
              </slot>
              <template v-else>
                {{ getCellValue(row, column.field) }}
              </template>
            </td>
            <td v-if="rowButtons.length > 0" class="actions-cell" data-label="Acciones">
              <div class="action-buttons">
                <button
                  v-for="(button, btnIndex) in rowButtons"
                  :key="btnIndex"
                  @click="button.fn(row)"
                  :class="['action-btn', `btn-${button.type || 'primary'}`]"
                  :title="button.label"
                >
                  <i v-if="button.icon" :class="`fas fa-${button.icon}`"></i>
                  <span v-if="button.showLabel">{{ button.label }}</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="columns.length + (rowButtons.length > 0 ? 1 : 0)" class="empty-state">
              <div class="empty-state-content">
                <i class="fas fa-inbox empty-icon"></i>
                <slot name="empty-results">
                  <p class="empty-text">{{ noDataMessage }}</p>
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile Card View -->
      <div v-if="!loading" class="mobile-cards">
        <div
          v-for="(row, index) in paginatedData"
          :key="index"
          class="mobile-card"
        >
          <div class="mobile-card-content">
            <div v-for="column in columns" :key="column.field" class="mobile-card-row">
              <div class="mobile-card-label">{{ column.label }}</div>
              <div class="mobile-card-value">
                <slot
                  v-if="column.field === 'actions' || $slots[column.field]"
                  :name="column.field"
                  :row="row"
                  :index="index"
                >
                  {{ getCellValue(row, column.field) }}
                </slot>
                <template v-else>
                  {{ getCellValue(row, column.field) }}
                </template>
              </div>
            </div>
            <div v-if="rowButtons.length > 0" class="mobile-card-actions">
              <button
                v-for="(button, btnIndex) in rowButtons"
                :key="btnIndex"
                @click="button.fn(row)"
                :class="['action-btn', `btn-${button.type || 'primary'}`]"
                :title="button.label"
              >
                <i v-if="button.icon" :class="`fas fa-${button.icon}`"></i>
                <span v-if="button.showLabel">{{ button.label }}</span>
              </button>
            </div>
          </div>
        </div>
        <div v-if="paginatedData.length === 0" class="empty-state-content">
          <i class="fas fa-inbox empty-icon"></i>
          <slot name="empty-results">
            <p class="empty-text">{{ noDataMessage }}</p>
          </slot>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="table-pagination">
      <div class="pagination-info">
        <i class="fas fa-info-circle"></i>
        Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ filteredData.length }} registros
      </div>
      <div class="pagination-controls">
        <button
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="Primera página"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="Página anterior"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        <span class="page-number">{{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Página siguiente"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Última página"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
      <div class="pagination-size">
        <select v-model="perPage" @change="currentPage = 1" class="per-page-select">
          <option :value="5">5 por página</option>
          <option :value="10">10 por página</option>
          <option :value="25">25 por página</option>
          <option :value="50">50 por página</option>
          <option :value="100">100 por página</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  rows: {
    type: Array,
    required: true
  },
  config: {
    type: Object,
    default: () => ({
      per_page: 10,
      global_search: {
        visibility: true,
        placeholder: 'Buscar...'
      },
      highlight_row_hover: true
    })
  },
  rowButtons: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  noDataMessage: {
    type: String,
    default: 'No se encontraron registros'
  }
})

// Reactive state
const searchQuery = ref('')
const sortColumn = ref(null)
const sortDirection = ref('asc')
const currentPage = ref(1)
const perPage = ref(props.config.per_page || 10)

// Methods
const getCellValue = (row, columnName) => {
  return row[columnName] ?? ''
}

const toggleSort = (columnName) => {
  if (sortColumn.value === columnName) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = columnName
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

// Computed properties
const filteredData = computed(() => {
  let data = [...props.rows]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(row => {
      return props.columns.some(column => {
        const fieldName = column.field || column.name
        const value = getCellValue(row, fieldName)
        return String(value).toLowerCase().includes(query)
      })
    })
  }

  // Apply column filters
  props.columns.forEach(column => {
    if (column.filter && column.filter.value) {
      data = data.filter(row => {
        const fieldName = column.field || column.name
        const cellValue = getCellValue(row, fieldName)
        return String(cellValue).toLowerCase().includes(column.filter.value.toLowerCase())
      })
    }
  })

  // Apply sorting
  if (sortColumn.value) {
    data.sort((a, b) => {
      const aVal = getCellValue(a, sortColumn.value)
      const bVal = getCellValue(b, sortColumn.value)

      let comparison = 0
      if (aVal > bVal) comparison = 1
      if (aVal < bVal) comparison = -1

      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  }

  return data
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / perPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * perPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + perPage.value, filteredData.value.length)
})

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

// Watchers
watch(() => props.rows, () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.data-table-wrapper {
  width: 100%;
  background: #16181d;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-search {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: #1c1f26;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.75rem 0.625rem 2.75rem;
  background: #0f1419;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.5rem;
  color: #e5e7eb;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #4b5563;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #16181d;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
}

.clear-search:hover {
  color: #e5e7eb;
}

.table-container {
  overflow-x: auto;
}

.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #0f1419;
}

.table-container::-webkit-scrollbar-thumb {
  background: #22252d;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #2a2d35;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table thead {
  background: #1c1f26;
  border-bottom: 2px solid rgba(255, 255, 255, 0.06);
}

.data-table th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #9ca3af;
  white-space: nowrap;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.data-table th.sortable:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.02);
}

.data-table th.active {
  color: #3b82f6;
}

.sort-icon {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.data-table th.sortable:hover .sort-icon,
.data-table th.active .sort-icon {
  opacity: 1;
}

.data-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background-color 0.15s;
}

.data-table tbody tr.highlight-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.data-table tbody tr:last-child {
  border-bottom: none;
}

.data-table td {
  padding: 1rem 1.25rem;
  color: #e5e7eb;
}

.empty-state {
  padding: 0 !important;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-text {
  margin: 0;
  font-size: 0.9375rem;
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: #1c1f26;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #9ca3af;
}

.pagination-info i {
  font-size: 0.75rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.pagination-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #16181d;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.375rem;
  color: #9ca3af;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #22252d;
  border-color: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-number {
  padding: 0 0.75rem;
  font-size: 0.8125rem;
  color: #e5e7eb;
  font-weight: 500;
  min-width: 4rem;
  text-align: center;
}

.per-page-select {
  padding: 0.5rem 0.75rem;
  background: #16181d;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.375rem;
  color: #e5e7eb;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.per-page-select:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: #22252d;
}

.per-page-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.per-page-select option {
  background: #16181d;
  color: #e5e7eb;
}

/* ===== LOADING STATE ===== */
.table-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.loading-spinner-small {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== ACTION BUTTONS ===== */
.actions-column {
  text-align: center;
  width: 120px;
}

.actions-cell {
  text-align: center;
  padding: 0.5rem !important;
}

.action-buttons {
  display: flex;
  gap: 0.375rem;
  justify-content: center;
  align-items: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem 0.625rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn i {
  font-size: 0.875rem;
}

/* Button type variants */
.action-btn.btn-is-danger,
.action-btn.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.action-btn.btn-is-danger:hover,
.action-btn.btn-danger:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.action-btn.btn-is-success,
.action-btn.btn-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.action-btn.btn-is-success:hover,
.action-btn.btn-success:hover {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
}

.action-btn.btn-is-primary,
.action-btn.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.action-btn.btn-is-primary:hover,
.action-btn.btn-primary:hover {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

.action-btn.btn-is-warning,
.action-btn.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.action-btn.btn-is-warning:hover,
.action-btn.btn-warning:hover {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

/* ===== MOBILE CARDS VIEW ===== */
.mobile-cards {
  display: none;
}

.mobile-card {
  background: #1c1f26;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.2s;
}

.mobile-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.mobile-card-content {
  padding: 0;
}

.mobile-card-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  align-items: center;
}

.mobile-card-row:last-child {
  border-bottom: none;
}

.mobile-card-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mobile-card-value {
  color: #e5e7eb;
  font-size: 0.875rem;
}

.mobile-card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  justify-content: flex-end;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */
@media (max-width: 1024px) {
  /* Reduce paddings and allow wrapping on medium screens (notebooks) */
  .data-table th,
  .data-table td {
    padding: 0.75rem 0.875rem;
    font-size: 0.8125rem;
    white-space: normal;
    word-break: break-word;
  }

  /* Make actions column flexible on medium screens */
  .actions-column {
    width: auto;
    min-width: 80px;
  }

  /* Switch to mobile-cards earlier for better readability on notebooks */
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  /* Compact action buttons like on small screens */
  .action-btn span {
    display: none;
  }

  .action-btn {
    padding: 0.5rem;
  }

  /* Avoid horizontal scrollbar where possible */
  .table-container {
    overflow-x: visible;
  }
}

@media (max-width: 768px) {
  .table-search {
    padding: 1rem;
  }

  .search-input-wrapper {
    max-width: none;
  }

  /* Hide desktop table, show mobile cards */
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .table-pagination {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    gap: 0.75rem;
  }

  .pagination-info {
    justify-content: center;
    order: 3;
  }

  .pagination-controls {
    justify-content: center;
    order: 1;
  }

  .pagination-size {
    order: 2;
  }

  .per-page-select {
    width: 100%;
  }

  .action-btn span {
    display: none;
  }

  .action-btn {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .mobile-card-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .mobile-card-label {
    font-size: 0.7rem;
  }

  .mobile-card-value {
    font-size: 0.8125rem;
  }

  .pagination-btn {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.8125rem;
  }

  .page-number {
    font-size: 0.75rem;
    min-width: 3rem;
  }
}
</style>
