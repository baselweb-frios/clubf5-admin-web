<template>
  <div class="card">
    <!-- Header -->
    <div class="flex-between mb-4">
      <h3 class="text-xl font-semibold text-text-primary">
Pautas Publicitarias Programadas
</h3>
      <div
v-if="hasActiveFilters"
class="flex items-center gap-3"
>
        <div class="flex items-center gap-2 text-sm text-text-secondary">
          <i class="fa fa-filter" />
          <span>{{ activeFiltersCount }} filtro{{ activeFiltersCount > 1 ? 's' : '' }} activo{{ activeFiltersCount > 1 ? 's' : '' }}</span>
        </div>
        <button
class="btn btn-ghost btn-sm"
@click="$emit('clear-filters')"
>
          <i class="fa fa-times" />
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-4 bg-dark-secondary rounded-lg border border-dark-border mb-4 space-y-4">
      <!-- Fila 1: Filtros de texto y selects -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Filtro por nombre de spot -->
        <div class="form-group">
          <label class="label flex items-center gap-2">
            <i class="fa fa-search" />
            Spot
          </label>
          <div class="flex items-center gap-2">
            <input
              :value="filterSpotName"
              type="text"
              class="input flex-1"
              placeholder="Buscar por nombre..."
              aria-label="Filtrar por nombre de spot"
              @input="$emit('update:filterSpotName', $event.target.value)"
            >
            <button
              v-if="filterSpotName"
              class="btn btn-ghost btn-sm btn-icon"
              aria-label="Limpiar filtro de nombre"
              @click="$emit('update:filterSpotName', '')"
            >
              <i class="fa fa-times" />
            </button>
          </div>
        </div>

        <!-- Filtro por slot -->
        <div class="form-group">
          <label class="label flex items-center gap-2">
            <i class="fa fa-layer-group" />
            Slot
          </label>
          <select
            :value="filterSlot"
            class="select"
            aria-label="Filtrar por slot"
            @change="$emit('update:filterSlot', $event.target.value)"
          >
            <option value="">
Todos los slots
</option>
            <option
              v-for="slot in 5"
              :key="slot"
              :value="slot"
            >
              Slot {{ slot }}
            </option>
          </select>
        </div>

        <!-- Filtro por reproductor -->
        <div class="form-group">
          <label class="label flex items-center gap-2">
            <i class="fa fa-desktop" />
            Para
          </label>
          <select
            :value="filterReproductor"
            class="select"
            aria-label="Filtrar por reproductor"
            @change="$emit('update:filterReproductor', $event.target.value)"
          >
            <option value="">
Todos
</option>
            <option
              v-for="rep in reproductores"
              :key="rep.clisuc_nombre || rep"
              :value="rep.clisuc_nombre || rep"
            >
              {{ rep.clisuc_nombre || rep }}
            </option>
          </select>
        </div>

        <!-- Filtro de rango horario -->
        <div class="form-group">
          <label class="label flex items-center gap-2">
            <i class="fa fa-clock-o" />
            Rango Horario
          </label>
          <div class="flex items-center gap-2">
            <input
              :value="filterStartTime"
              type="time"
              class="input flex-1"
              placeholder="Desde"
              aria-label="Hora de inicio"
              @input="$emit('update:filterStartTime', $event.target.value)"
            >
            <span class="text-text-tertiary">—</span>
            <input
              :value="filterEndTime"
              type="time"
              class="input flex-1"
              placeholder="Hasta"
              aria-label="Hora de fin"
              @input="$emit('update:filterEndTime', $event.target.value)"
            >
            <button
              v-if="filterStartTime || filterEndTime"
              class="btn btn-ghost btn-sm btn-icon"
              aria-label="Limpiar filtro de horario"
              @click="$emit('clear-time-filter')"
            >
              <i class="fa fa-times" />
            </button>
          </div>
        </div>
      </div>

      <!-- Fila 2: Filtro por días -->
      <div class="form-group">
        <label class="label flex items-center gap-2">
          <i class="fa fa-calendar" />
          Días
        </label>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="day in weekDays"
            :key="day.value"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-sm"
            :class="isDayFilterSelected(day.value) ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-dark-tertiary border-dark-border text-text-secondary hover:border-primary-500/50'"
            @click="toggleDayFilter(day.value)"
          >
            <input
              type="checkbox"
              :checked="isDayFilterSelected(day.value)"
              class="checkbox checkbox-sm"
              @click.stop
              @change="toggleDayFilter(day.value)"
            >
            <span>{{ day.text }}</span>
          </div>
          <button
            v-if="filterDays.length > 0 && filterDays.length < 7"
            class="btn btn-ghost btn-sm"
            @click="$emit('update:filterDays', [])"
          >
            <i class="fa fa-times" />
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay salidas -->
    <div
v-if="programaciones.length === 0"
class="text-center py-12"
>
      <div class="mb-4">
        <i class="fa fa-calendar-times-o text-5xl text-text-tertiary" />
      </div>
      <div class="text-lg text-text-secondary mb-2">
        No hay salidas pautadas {{ hasActiveFilters ? 'que coincidan con los filtros' : 'disponibles' }}
      </div>
      <div class="text-sm text-text-tertiary">
        <span v-if="hasActiveFilters">
          Intenta ajustar los filtros o
          <button
class="text-primary-400 hover:text-primary-300 underline"
@click="$emit('clear-filters')"
>limpiar todos los filtros</button>
        </span>
        <span v-else>Comienza creando una pauta usando el panel superior</span>
      </div>
    </div>

    <!-- Tabla -->
    <div
v-else
ref="tableContainer"
class="table-container"
>
      <table
class="table"
role="table"
aria-label="Pautas activas"
>
        <thead>
          <tr>
            <th
scope="col"
class="w-10"
>
              <input
                type="checkbox"
                :checked="isAllSelected"
                class="checkbox"
                aria-label="Seleccionar todas las pautas"
                @change="toggleSelectAll"
              >
            </th>
            <th scope="col">
Día / Horario
</th>
            <th scope="col">
Slot
</th>
            <th scope="col">
Spot
</th>
            <th scope="col">
Categoría
</th>
            <th scope="col">
Para
</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="programacion in displayedProgramaciones"
            :key="programacion.clprsp_codigo"
            class="cursor-pointer"
            :class="{ 'bg-primary-500/10': isSelected(programacion) }"
            @click="toggleSelection(programacion)"
          >
            <td>
              <input
                type="checkbox"
                :checked="isSelected(programacion)"
                class="checkbox"
                aria-label="Seleccionar programación"
                @change.stop="toggleSelection(programacion)"
              >
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span class="badge badge-info">
                  {{ getDayName(programacion.clprsp_numeroDia) }}
                </span>
                <span class="flex items-center gap-1 text-sm text-text-secondary">
                  <i class="fa fa-clock-o" />
                  {{ programacion.clprsp_horaDesde ? programacion.clprsp_horaDesde.slice(0, 5) : '' }}
                </span>
              </div>
            </td>
            <td>
              <span
class="badge"
:class="getSlotClass(programacion.clprsp_orden)"
>
                <i class="fa fa-layer-group" />
                 Slot {{ programacion.clprsp_orden || 0 }}
              </span>
            </td>
            <td>
              <span class="text-sm font-medium text-text-primary">{{ programacion.spo_nombre }}</span>
            </td>
            <td>
              <span :class="`badge badge-${getCategoryVariant(programacion.spo_tipo)}`">
                {{ getCategoryLabel(programacion.spo_tipo) }}
              </span>
            </td>
            <td>
              <span class="text-sm text-text-secondary">
                {{ getTargetName(programacion.clprsp_usuario) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div
v-if="programaciones.length > 0"
class="mt-4 p-4 bg-dark-secondary rounded-lg"
>
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="text-sm text-text-secondary">
          Mostrando {{ paginationInfo.start }} - {{ paginationInfo.end }} de {{ paginationInfo.total }} programaciones
        </div>

        <div class="flex items-center gap-2">
          <button
            class="btn btn-secondary btn-sm btn-icon"
            :disabled="currentPage === 1"
            aria-label="Primera página"
            @click="$emit('go-to-page', 1)"
          >
            <i class="fa fa-angle-double-left" />
          </button>
          <button
            class="btn btn-secondary btn-sm btn-icon"
            :disabled="currentPage === 1"
            aria-label="Página anterior"
            @click="$emit('go-to-page', currentPage - 1)"
          >
            <i class="fa fa-angle-left" />
          </button>

          <div class="flex items-center gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="btn btn-sm min-w-[36px]"
              :class="page === currentPage ? 'btn-primary' : 'btn-ghost'"
              :disabled="page === '...'"
              @click="$emit('go-to-page', page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="btn btn-secondary btn-sm btn-icon"
            :disabled="currentPage === totalPages"
            aria-label="Página siguiente"
            @click="$emit('go-to-page', currentPage + 1)"
          >
            <i class="fa fa-angle-right" />
          </button>
          <button
            class="btn btn-secondary btn-sm btn-icon"
            :disabled="currentPage === totalPages"
            aria-label="Última página"
            @click="$emit('go-to-page', totalPages)"
          >
            <i class="fa fa-angle-double-right" />
          </button>
        </div>

        <div>
          <select
            :value="pageSize"
            class="select w-auto"
            @change="$emit('update:pageSize', parseInt($event.target.value))"
          >
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

    <!-- Barra de acciones de selección -->
    <div
v-if="selectedProgramaciones.length > 0"
class="mt-4 p-3 bg-dark-secondary rounded-lg flex items-center justify-between"
>
      <span class="text-sm text-text-secondary">{{ selectedProgramaciones.length }} pauta(s) seleccionada(s)</span>
      <button
        class="btn btn-danger btn-sm"
        aria-label="Eliminar programaciones seleccionadas"
        @click="$emit('delete-selected', selectedProgramaciones)"
      >
        <i class="fa fa-trash" />
        Eliminar Seleccionadas
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ProgramacionesTable',
  props: {
    programaciones: {
      type: Array,
      default: () => []
    },
    displayedProgramaciones: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    hasActiveFilters: {
      type: Boolean,
      default: false
    },
    activeFiltersCount: {
      type: Number,
      default: 0
    },
    filterStartTime: {
      type: String,
      default: ''
    },
    filterEndTime: {
      type: String,
      default: ''
    },
    filterSpotName: {
      type: String,
      default: ''
    },
    filterSlot: {
      type: [String, Number],
      default: ''
    },
    filterDays: {
      type: Array,
      default: () => []
    },
    filterReproductor: {
      type: String,
      default: ''
    },
    reproductores: {
      type: Array,
      default: () => []
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 25
    },
    totalPages: {
      type: Number,
      default: 1
    },
    visiblePages: {
      type: Array,
      default: () => []
    },
    paginationInfo: {
      type: Object,
      default: () => ({ start: 0, end: 0, total: 0 })
    },
    weekDays: {
      type: Array,
      default: () => [
        { text: 'Lun', value: 1 },
        { text: 'Mar', value: 2 },
        { text: 'Mié', value: 3 },
        { text: 'Jue', value: 4 },
        { text: 'Vie', value: 5 },
        { text: 'Sáb', value: 6 },
        { text: 'Dom', value: 0 }
      ]
    }
  },
  emits: [
    'update:filterStartTime',
    'update:filterEndTime',
    'update:filterSpotName',
    'update:filterSlot',
    'update:filterDays',
    'update:filterReproductor',
    'update:pageSize',
    'go-to-page',
    'clear-filters',
    'clear-time-filter',
    'delete-selected'
  ],
  setup(props, { emit }) {
    // ===== STATE =====
    const selectedProgramaciones = ref([])

    // ===== COMPUTED =====
    const isAllSelected = computed(() => {
      return (
        props.displayedProgramaciones.length > 0 &&
        selectedProgramaciones.value.length > 0 &&
        props.displayedProgramaciones.every(prog =>
          selectedProgramaciones.value.some(
            selected => selected.clprsp_codigo === prog.clprsp_codigo
          )
        )
      )
    })

    // ===== METHODS =====
    const isSelected = (programacion) => {
      return selectedProgramaciones.value.some(
        p => p.clprsp_codigo === programacion.clprsp_codigo
      )
    }

    const toggleSelection = (programacion) => {
      const index = selectedProgramaciones.value.findIndex(
        p => p.clprsp_codigo === programacion.clprsp_codigo
      )
      if (index > -1) {
        selectedProgramaciones.value.splice(index, 1)
      } else {
        selectedProgramaciones.value.push(programacion)
      }
    }

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedProgramaciones.value = []
      } else {
        selectedProgramaciones.value = [...props.displayedProgramaciones]
      }
    }

    const getDayName = (dayNumber) => {
      const day = props.weekDays.find(d => d.value === dayNumber)
      return day ? day.text : ''
    }

    const getSlotClass = (slot) => {
      const slotNumber = slot || 0
      const slotClasses = [
        'slot-0',
        'slot-1',
        'slot-2',
        'slot-3',
        'slot-4',
        'slot-5'
      ]
      return slotClasses[slotNumber] || 'slot-0'
    }

    const getCategoryVariant = (tipo) => {
      const variants = {
        inst: 'primary',
        prom: 'warning',
        noti: 'info'
      }
      return variants[tipo] || 'secondary'
    }

    const getCategoryLabel = (tipo) => {
      const labels = {
        inst: 'Institucional',
        prom: 'Promocional',
        noti: 'Noticias'
      }
      return labels[tipo] || tipo
    }

    const getTargetName = (usuario) => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const client = currentUser.Cliente ? JSON.parse(currentUser.Cliente) : {}
        return client && usuario === client.cli_usuari ? 'Todos' : usuario
      } catch (error) {
        console.error('Error in getTargetName:', error)
        return usuario || 'Desconocido'
      }
    }

    const isDayFilterSelected = (dayValue) => {
      return props.filterDays.includes(dayValue)
    }

    const toggleDayFilter = (dayValue) => {
      const newDays = [...props.filterDays]
      const index = newDays.indexOf(dayValue)
      if (index > -1) {
        newDays.splice(index, 1)
      } else {
        newDays.push(dayValue)
      }
      newDays.sort((a, b) => a - b)
      emit('update:filterDays', newDays)
    }

    return {
      // State
      selectedProgramaciones,

      // Computed
      isAllSelected,

      // Methods
      isSelected,
      toggleSelection,
      toggleSelectAll,
      getDayName,
      getSlotClass,
      getCategoryVariant,
      getCategoryLabel,
      getTargetName,
      isDayFilterSelected,
      toggleDayFilter
    }
  }
}
</script>

<style scoped>
/* Table Container */
.table-container {
  @apply max-h-[60vh] overflow-y-auto overflow-x-auto;
  @apply rounded-xl border border-dark-border;
  @apply bg-dark-tertiary;
}

.light .table-container {
  @apply border-light-border bg-light-elevated;
}

/* Make thead sticky */
.table-container .table thead {
  @apply sticky top-0 z-10;
}

.table-container .table th {
  @apply bg-dark-secondary;
}

.light .table-container .table th {
  @apply bg-light-secondary;
}
</style>
