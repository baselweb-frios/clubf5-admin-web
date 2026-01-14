<template>
  <div class="data-table-wrapper">
    <!-- Search -->
    <div
v-if="config.global_search?.visibility !== 'false'"
class="table-search"
>
      <div class="search-input-wrapper">
        <i class="fas fa-search search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="config.global_search?.placeholder || 'Buscar...'"
          class="search-input"
        >
        <button
v-if="searchQuery"
class="clear-search"
@click="searchQuery = ''"
>
          <i class="fas fa-times" />
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <loading-spinner
v-if="loading"
:loading="true"
text="Cargando datos..."
size="40px"
/>
      
      <!-- Desktop/Tablet Table View -->
      <table
v-else
class="data-table desktop-table"
>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.name || column.field"
              :class="{ sortable: column.sortable, active: sortColumn === column.field }"
              @click="column.sortable ? toggleSort(column.field) : null"
            >
              <div class="th-content">
                <span>{{ column.label }}</span>
                <span
v-if="column.sortable"
class="sort-icon"
>
                  <i
v-if="sortColumn !== column.field"
class="fas fa-sort"
/>
                  <i
v-else-if="sortDirection === 'asc'"
class="fas fa-sort-up"
/>
                  <i
v-else
class="fas fa-sort-down"
/>
                </span>
              </div>
            </th>
            <th
v-if="rowButtons.length > 0"
class="actions-column"
>
Acciones
</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in paginatedData"
            :key="index"
            :class="{ 'highlight-row': config.highlight_row_hover }"
          >
            <td
v-for="column in columns"
:key="column.name || column.field"
:data-label="column.label"
>
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
            <td
v-if="rowButtons.length > 0"
class="actions-cell"
data-label="Acciones"
>
              <div class="action-buttons">
                <button
                  v-for="(button, btnIndex) in rowButtons"
                  :key="btnIndex"
                  :class="['action-btn', `btn-${button.type || 'primary'}`]"
                  :title="button.label"
                  @click="button.fn(row)"
                >
                  <i
v-if="button.icon"
:class="`fas fa-${button.icon}`"
/>
                  <span v-if="button.showLabel">{{ button.label }}</span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedData.length === 0">
            <td
:colspan="columns.length + (rowButtons.length > 0 ? 1 : 0)"
class="empty-state"
>
              <div class="empty-state-content">
                <i class="fas fa-inbox empty-icon" />
                <slot name="empty-results">
                  <p class="empty-text">
{{ noDataMessage }}
</p>
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile Card View -->
      <div
v-if="!loading"
class="mobile-cards"
>
        <div
          v-for="(row, index) in paginatedData"
          :key="index"
          class="mobile-card"
        >
          <div class="mobile-card-content">
            <div
v-for="column in columns"
:key="column.field"
class="mobile-card-row"
>
              <div class="mobile-card-label">
{{ column.label }}
</div>
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
            <div
v-if="rowButtons.length > 0"
class="mobile-card-actions"
>
              <button
                v-for="(button, btnIndex) in rowButtons"
                :key="btnIndex"
                :class="['action-btn', `btn-${button.type || 'primary'}`]"
                :title="button.label"
                @click="button.fn(row)"
              >
                <i
v-if="button.icon"
:class="`fas fa-${button.icon}`"
/>
                <span v-if="button.showLabel">{{ button.label }}</span>
              </button>
            </div>
          </div>
        </div>
        <div
v-if="paginatedData.length === 0"
class="empty-state-content"
>
          <i class="fas fa-inbox empty-icon" />
          <slot name="empty-results">
            <p class="empty-text">
{{ noDataMessage }}
</p>
          </slot>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
v-if="totalPages > 1"
class="table-pagination"
>
      <div class="pagination-info">
        <i class="fas fa-info-circle" />
        Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ filteredData.length }} registros
      </div>
      <div class="pagination-controls">
        <button
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="Primera página"
          @click="currentPage = 1"
        >
          <i class="fas fa-angle-double-left" />
        </button>
        <button
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="Página anterior"
          @click="currentPage--"
        >
          <i class="fas fa-angle-left" />
        </button>
        <span class="page-number">{{ currentPage }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Página siguiente"
          @click="currentPage++"
        >
          <i class="fas fa-angle-right" />
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Última página"
          @click="currentPage = totalPages"
        >
          <i class="fas fa-angle-double-right" />
        </button>
      </div>
      <div class="pagination-size">
        <select
v-model="perPage"
class="per-page-select"
@change="currentPage = 1"
>
          <option :value="5">
5 por página
</option>
          <option :value="10">
10 por página
</option>
          <option :value="25">
25 por página
</option>
          <option :value="50">
50 por página
</option>
          <option :value="100">
100 por página
</option>
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
/* ===== WRAPPER ===== */
.data-table-wrapper {
  @apply space-y-4;
}

/* ===== SEARCH ===== */
.table-search {
  @apply flex items-center;
}

.search-input-wrapper {
  @apply relative w-full max-w-md;
}

.search-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2;
  @apply text-text-tertiary text-sm;
  @apply pointer-events-none;
}

.light .search-icon {
  @apply text-text-light-tertiary;
}

.search-input {
  @apply w-full pl-10 pr-10 py-2.5 rounded-lg text-sm;
  @apply bg-dark-secondary text-text-primary;
  @apply border border-dark-border;
  @apply placeholder:text-text-tertiary;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
}

.light .search-input {
  @apply bg-light-secondary text-text-light-primary border-light-border;
  @apply placeholder:text-text-light-tertiary;
}

.clear-search {
  @apply absolute right-3 top-1/2 -translate-y-1/2;
  @apply p-1 rounded text-text-tertiary;
  @apply hover:text-text-primary hover:bg-dark-hover;
  @apply transition-colors duration-200;
}

.light .clear-search {
  @apply text-text-light-tertiary;
  @apply hover:text-text-light-primary hover:bg-light-hover;
}

/* ===== TABLE CONTAINER ===== */
.table-container {
  @apply w-full overflow-x-auto rounded-xl;
  @apply border border-dark-border;
  @apply bg-dark-tertiary;
}

.light .table-container {
  @apply border-light-border bg-light-elevated;
}

/* ===== DESKTOP TABLE ===== */
.data-table {
  @apply w-full text-sm;
}

.data-table th {
  @apply px-4 py-3 text-left font-semibold text-text-secondary;
  @apply bg-dark-secondary border-b border-dark-border;
  @apply whitespace-nowrap;
}

.light .data-table th {
  @apply text-text-light-secondary bg-light-secondary border-light-border;
}

.data-table th.sortable {
  @apply cursor-pointer select-none;
  @apply hover:bg-dark-hover;
}

.light .data-table th.sortable:hover {
  @apply bg-light-hover;
}

.data-table th.active {
  @apply text-primary-400;
}

.light .data-table th.active {
  @apply text-primary-600;
}

.th-content {
  @apply flex items-center gap-2;
}

.sort-icon {
  @apply text-xs opacity-60;
}

.data-table th.active .sort-icon {
  @apply opacity-100 text-primary-400;
}

.data-table td {
  @apply px-4 py-3 text-text-primary;
  @apply border-b border-dark-border;
}

.light .data-table td {
  @apply text-text-light-primary border-light-border;
}

.data-table tbody tr:last-child td {
  @apply border-b-0;
}

.data-table tbody tr {
  @apply transition-colors duration-150;
}

.data-table tbody tr.highlight-row:hover {
  @apply bg-dark-hover;
}

.light .data-table tbody tr.highlight-row:hover {
  @apply bg-light-hover;
}

/* Actions Column */
.actions-column {
  @apply text-center w-32;
}

.actions-cell {
  @apply text-center;
}

.action-buttons {
  @apply flex items-center justify-center gap-2;
}

.action-btn {
  @apply p-2 rounded-lg text-sm;
  @apply transition-all duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-primary;
}

.action-btn.btn-primary {
  @apply text-primary-400 hover:bg-primary-500/20;
  @apply focus-visible:ring-primary-500;
}

.action-btn.btn-danger {
  @apply text-danger-400 hover:bg-danger-500/20;
  @apply focus-visible:ring-danger-500;
}

.action-btn.btn-success {
  @apply text-success-400 hover:bg-success-500/20;
  @apply focus-visible:ring-success-500;
}

.action-btn.btn-warning {
  @apply text-warning-400 hover:bg-warning-500/20;
  @apply focus-visible:ring-warning-500;
}

.action-btn.btn-info {
  @apply text-info-400 hover:bg-info-500/20;
  @apply focus-visible:ring-info-500;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  @apply text-center py-12;
}

.empty-state-content {
  @apply flex flex-col items-center justify-center gap-3 py-8;
}

.empty-icon {
  @apply text-4xl text-text-tertiary;
}

.light .empty-icon {
  @apply text-text-light-tertiary;
}

.empty-text {
  @apply text-text-secondary text-sm;
}

.light .empty-text {
  @apply text-text-light-secondary;
}

/* ===== MOBILE CARDS ===== */
.mobile-cards {
  @apply hidden space-y-3;
}

.mobile-card {
  @apply bg-dark-tertiary rounded-xl border border-dark-border;
  @apply overflow-hidden;
}

.light .mobile-card {
  @apply bg-light-elevated border-light-border;
}

.mobile-card-content {
  @apply p-4 space-y-3;
}

.mobile-card-row {
  @apply flex items-start justify-between gap-4;
  @apply pb-2 border-b border-dark-border last:border-b-0 last:pb-0;
}

.light .mobile-card-row {
  @apply border-light-border;
}

.mobile-card-label {
  @apply text-xs font-medium text-text-secondary uppercase tracking-wide;
  @apply flex-shrink-0;
}

.light .mobile-card-label {
  @apply text-text-light-secondary;
}

.mobile-card-value {
  @apply text-sm text-text-primary text-right;
}

.light .mobile-card-value {
  @apply text-text-light-primary;
}

.mobile-card-actions {
  @apply flex items-center justify-end gap-2 pt-3 mt-3;
  @apply border-t border-dark-border;
}

.light .mobile-card-actions {
  @apply border-light-border;
}

/* ===== PAGINATION ===== */
.table-pagination {
  @apply flex flex-wrap items-center justify-between gap-4;
  @apply px-4 py-3 rounded-xl;
  @apply bg-dark-secondary border border-dark-border;
}

.light .table-pagination {
  @apply bg-light-secondary border-light-border;
}

.pagination-info {
  @apply flex items-center gap-2;
  @apply text-sm text-text-secondary;
}

.light .pagination-info {
  @apply text-text-light-secondary;
}

.pagination-info i {
  @apply text-info-500;
}

.pagination-controls {
  @apply flex items-center gap-1;
}

.pagination-btn {
  @apply p-2 rounded-lg text-text-secondary;
  @apply transition-all duration-200;
  @apply hover:bg-dark-hover hover:text-text-primary;
  @apply disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent;
}

.light .pagination-btn {
  @apply text-text-light-secondary;
  @apply hover:bg-light-hover hover:text-text-light-primary;
}

.page-number {
  @apply px-3 py-1 text-sm font-medium text-text-primary;
}

.light .page-number {
  @apply text-text-light-primary;
}

.pagination-size {
  @apply flex items-center;
}

.per-page-select {
  @apply px-3 py-2 rounded-lg text-sm;
  @apply bg-dark-tertiary text-text-primary;
  @apply border border-dark-border;
  @apply cursor-pointer appearance-none;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
  @apply pr-8;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
}

.light .per-page-select {
  @apply bg-light-tertiary text-text-light-primary border-light-border;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .desktop-table {
    @apply hidden;
  }

  .mobile-cards {
    @apply block;
  }

  .table-pagination {
    @apply flex-col items-stretch gap-3;
  }

  .pagination-info {
    @apply justify-center;
  }

  .pagination-controls {
    @apply justify-center;
  }

  .pagination-size {
    @apply justify-center;
  }

  .per-page-select {
    @apply w-full;
  }
}
</style>

