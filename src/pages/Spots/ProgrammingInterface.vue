<template>
  
  <div class="space-y-6">
    <!-- Alerta de programación no seleccionada -->
    <div
      v-if="!codigoProgramacion"
      class="alert alert-warning"
    >
      <i class="fa fa-exclamation-triangle text-xl" />
      <div class="flex-1">
        <h4 class="font-semibold mb-1">No hay programación seleccionada</h4>
        <p class="text-sm opacity-90">Debes seleccionar o crear una programación antes de poder programar spots.</p>
      </div>
    </div>

    <!-- Panel de programación -->
    <div class="card">
      <div class="flex-between mb-6">
        <h3 class="text-xl font-semibold text-text-primary">Programar Spots</h3>
      </div>

      <!-- Selector de spots -->
      <div class="form-group mb-4">
        <div class="space-y-3">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="spot in selectedSpots"
              :key="spot.spo_codigo"
              class="badge badge-primary inline-flex items-center gap-2"
            >
              {{ spot.spo_nombre }}
              <button
                class="hover:bg-white/20 rounded p-0.5 transition-colors"
                aria-label="Remover spot"
                @click="removeSpot(spot)"
              >
                ×
              </button>
            </span>
          </div>

          <!-- Indicador de spots seleccionados -->
          <div
            class="p-3 rounded-lg border transition-colors"
            :class="exceedsSpotLimit ? 'bg-danger-500/10 border-danger-500/30' : 'bg-dark-secondary border-dark-border'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-text-secondary">
                <i class="fa fa-list" />
                <span>Spots Seleccionados:</span>
              </div>
              <div class="flex items-center gap-1 font-semibold">
                <span :class="exceedsSpotLimit ? 'text-danger-400' : 'text-text-primary'">{{ selectedSpots.length }}</span>
                <span class="text-text-tertiary">/</span>
                <span class="text-text-secondary">{{ maxSpotsAllowed }}</span>
              </div>
            </div>
            <div v-if="!exceedsSpotLimit" class="mt-2">
              <small class="text-success-400 flex items-center gap-1">
                <i class="fa fa-check-circle" />
                Puedes agregar {{ remainingSpots }} spot{{ remainingSpots !== 1 ? 's' : '' }} más
              </small>
            </div>
            <div v-if="exceedsSpotLimit" class="mt-2">
              <small class="text-danger-400 flex items-center gap-1">
                <i class="fa fa-exclamation-triangle" />
                Límite de spots alcanzado
              </small>
            </div>
          </div>

          <!-- Botón para abrir modal de selección de spots -->
          <button
            class="btn btn-secondary w-full flex items-center justify-center gap-2"
            @click="showSpotSelectorModal = true"
          >
            <i class="fa fa-plus-circle" />
            <span>Seleccionar Spots</span>
            <span class="badge badge-info ml-2">{{ spots.length }} disponibles</span>
          </button>
        </div>
        <div class="form-group mt-4">
          <label class="label">
            Reproductor
            <span
              v-if="isReproductor"
              class="badge badge-info ml-2 text-xs"
            >Bloqueado</span>
          </label>
          <select
            v-model="selectedReproductor"
            class="select"
            aria-label="Seleccionar reproductor"
            :disabled="isReproductor"
            :class="{ 'opacity-50 cursor-not-allowed': isReproductor }"
          >
            <option value="">Todos</option>
            <option
              v-for="reproductor in reproductores"
              :key="reproductor.clisuc_nombre"
              :value="reproductor.clisuc_nombre"
            >
              {{ reproductor.clisuc_nombre }}
            </option>
          </select>
          <small
            v-if="isReproductor"
            class="text-xs text-text-secondary mt-1 block"
          >
            <i class="fa fa-info-circle mr-1" />
            Como reproductor solo se puede programar para si mismo
          </small>
        </div>
        <!-- Configuración de días de la semana -->
        <div class="form-group mt-4">
          <label class="label">
            Días de la Semana
            <span
              v-if="diasHabiles.length > 0"
              class="badge badge-info ml-2 text-xs"
            >
              Días hábiles de tu comercio
            </span>
          </label>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="day in weekDays"
              :key="day.value"
              class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all"
              :class="{
                'bg-primary-500/20 border-primary-500 text-primary-400': isDaySelected(day.value),
                'bg-dark-secondary border-dark-border text-text-secondary hover:border-dark-hover': !isDaySelected(day.value) && (day.isHabil || diasHabiles.length === 0),
                'bg-dark-secondary/50 border-dark-border/50 text-text-tertiary cursor-not-allowed opacity-50': !day.isHabil && diasHabiles.length > 0
              }"
              :title="
                !day.isHabil && diasHabiles.length > 0
                  ? 'Día no hábil según configuración del cliente'
                  : ''
              "
              @click="toggleDaySelection(day.value)"
            >
              <input
                type="checkbox"
                :checked="isDaySelected(day.value)"
                :disabled="!day.isHabil && diasHabiles.length > 0"
                class="checkbox"
              >
              <span class="text-sm font-medium">{{ day.text }}</span>
              <i
                v-if="!day.isHabil && diasHabiles.length > 0"
                class="fa fa-ban text-xs opacity-70"
              />
            </div>
          </div>
          <div v-if="selectedDays.length > 0" class="mt-2">
            <small class="text-text-secondary">Días seleccionados: {{ getSelectedDaysText() }}</small>
          </div>
          <!-- Advertencia de días inválidos -->
          <div v-if="hasInvalidDays" class="alert alert-warning mt-2">
            <i class="fa fa-exclamation-triangle" />
            <span>
              Has seleccionado días no hábiles:
              <strong>{{ invalidSelectedDays.map(d => getWeekDayName(d)).join(', ') }}</strong>. Por favor, selecciona solo días hábiles configurados.
            </span>
          </div>
        </div>

        <!-- Selector de Múltiples Minutos en Hora Específica -->
        <div class="form-group mt-4 p-4 bg-dark-secondary rounded-lg border border-dark-border">
          <div class="flex items-center justify-between mb-3">
            <label class="label mb-0">
              <i class="fa fa-clock-o mr-2" />
              Programar Múltiples Minutos
            </label>
            <button
              class="btn btn-ghost btn-sm"
              :class="{ 'bg-dark-elevated': showMultiMinuteSelector }"
              @click="showMultiMinuteSelector = !showMultiMinuteSelector"
            >
              <i
                class="fa"
                :class="showMultiMinuteSelector ? 'fa-chevron-up' : 'fa-chevron-down'"
              />
              {{ showMultiMinuteSelector ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>

          <p v-if="!showMultiMinuteSelector" class="text-sm text-text-secondary">
            Selecciona una hora específica y múltiples minutos para programar spots.
          </p>

          <div v-if="showMultiMinuteSelector" class="space-y-4">
            <!-- Selector de Hora (usa los días seleccionados globalmente) -->
            <div class="form-group">
              <label for="multiMinuteHour" class="label">Hora:</label>
              <select
                id="multiMinuteHour"
                v-model="selectedHourForMultiMinute"
                class="select"
                @change="onDayHourChange"
              >
                <option value="">Selecciona una hora</option>
                <option
                  v-for="hour in 24"
                    :key="hour - 1"
                    :value="`${(hour - 1).toString().padStart(2, '0')}:00`"
                >
                  {{ (hour - 1).toString().padStart(2, '0') }}
                </option>
              </select>
            </div>

            <!-- Información de días seleccionados -->
            <div v-if="selectedDays.length > 0" class="flex items-center gap-2 text-sm text-info-400 bg-info-500/10 p-2 rounded-lg">
              <i class="fa fa-calendar" />
              <span>Se programará en: <strong>{{ getSelectedDaysText() }}</strong></span>
            </div>

            <!-- Grid de Minutos -->
            <div
              v-if="selectedHourForMultiMinute && selectedDays.length > 0"
              class="space-y-4"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-text-primary">Minutos disponibles:</span>
                <div class="flex items-center gap-4 text-sm">
                  <span class="flex items-center gap-1 text-success-400">
                    <i class="fa fa-check-circle" />
                    Disponibles: <strong>{{ availableMinutesCount }}</strong>
                  </span>
                  <span class="flex items-center gap-1 text-primary-400">
                    <i class="fa fa-calendar-check-o" />
                    Seleccionados: <strong>{{ selectedMinutesCount }}</strong>
                  </span>
                </div>
              </div>

              <!-- Grid de minutos -->
              <div class="grid grid-cols-6 sm:grid-cols-10 gap-2">
                <div
                  v-for="minute in availableMinutesInHour"
                  :key="minute"
                  class="flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-all border"
                  :class="{
                    'bg-dark-hover border-dark-border text-text-tertiary cursor-not-allowed': isMinuteProgrammed(minute),
                    'bg-primary-500/20 border-primary-500 text-primary-400': isMinuteSelected(minute),
                    'bg-dark-secondary border-dark-border text-text-secondary hover:border-primary-500/50': !isMinuteProgrammed(minute) && !isMinuteSelected(minute)
                  }"
                  @click="toggleMinuteSelection(minute)"
                >
                  <span>:{{ minute.toString().padStart(2, '0') }}</span>
                  <i v-if="isMinuteProgrammed(minute)" class="fa fa-ban text-xs" />
                  <i v-else-if="isMinuteSelected(minute)" class="fa fa-check-circle text-xs" />
                </div>
              </div>

              <!-- Controles de selección -->
              <div class="flex flex-wrap gap-2">
                <button
                  class="btn btn-secondary btn-sm"
                  :disabled="availableMinutesCount === 0"
                  @click="selectAllAvailableMinutes"
                >
                  <i class="fa fa-check-square-o" />
                  Seleccionar Todos Disponibles
                </button>
                <button
                  class="btn btn-secondary btn-sm"
                  :disabled="selectedMinutesCount === 0"
                  @click="clearMinuteSelection"
                >
                  <i class="fa fa-times" />
                  Limpiar Selección
                </button>
              </div>

              <!-- Preview de programaciones -->
              <div v-if="selectedMinutesCount > 0" class="p-4 bg-dark-tertiary rounded-lg border border-dark-border">
                <div class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                  <i class="fa fa-eye" />
                  <span>Vista previa</span>
                </div>
                <p class="text-sm text-text-secondary mb-2">
                  Se programarán <strong class="text-text-primary">{{ selectedSpots.length }}</strong> spot(s) en
                  <strong class="text-text-primary">{{ selectedMinutesCount }}</strong> minuto(s) para
                  <strong class="text-text-primary">{{ selectedDays.length }}</strong> día(s) seleccionado(s) (<strong class="text-text-primary">{{ getSelectedDaysText() }}</strong>) a las <strong class="text-text-primary">{{ selectedHourForMultiMinute }}</strong>.
                </p>
                <p class="text-sm text-text-secondary flex items-center gap-2 mb-3">
                  <i class="fa fa-calculator" />
                  Total de programaciones:
                  <strong class="text-primary-400">{{ selectedMinutesCount * selectedDays.length }}</strong>
                </p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="minute in selectedMinutes.slice(0, 6)"
                    :key="minute"
                    class="badge badge-primary"
                  >
                    {{ selectedHourForMultiMinute.split(':')[0] }}:{{ minute.toString().padStart(2, '0') }}
                  </span>
                  <span v-if="selectedMinutesCount > 6" class="badge badge-info">
                    +{{ selectedMinutesCount - 6 }} más
                  </span>
                </div>
              </div>

              <!-- Botón de programar -->
              <button
                :disabled="!canProgramSelectedMinutes"
                class="btn btn-primary w-full"
                @click="programSelectedMinutes"
              >
                <i class="fa fa-calendar-plus-o" />
                Programar {{ selectedMinutesCount }} Minuto(s)
              </button>
            </div>

            <!-- Mensaje cuando no hay día/hora seleccionados -->
            <div v-else class="text-center py-8 text-text-secondary">
              <i class="fa fa-hand-pointer-o text-3xl mb-3 opacity-50" />
              <p v-if="selectedDays.length === 0" class="text-sm">
                Primero selecciona al menos un día en los filtros globales
              </p>
              <p v-else class="text-sm">Selecciona una hora para ver los minutos disponibles</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón Flotante para Programaciones Pendientes -->
      <button
        v-if="pendingProgramaciones.length > 0"
        class="fixed bottom-6 right-6 z-fixed flex flex-col items-center gap-1 px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg transition-all animate-pulse"
        @click="showPendingModal = true"
      >
        <div class="flex items-center gap-2">
          <i class="fa fa-clock-o" />
          <span class="font-bold text-lg">{{ pendingProgramaciones.length }}</span>
        </div>
        <span class="text-xs opacity-90">Pendientes</span>
      </button>
    </div>

    <!-- Modal de Programaciones Pendientes -->
    <Modal v-model="showPendingModal" size="lg" :closable="true">
      <template #header>
        <div class="flex items-center gap-3">
          <i class="fa fa-clock-o text-primary-400" />
          <h3 class="text-lg font-semibold text-text-primary">Programaciones Pendientes</h3>
          <span class="badge badge-primary">{{ pendingProgramaciones.length }}</span>
        </div>
      </template>

      <template #default>
        <div v-if="pendingProgramaciones.length > 0" class="space-y-4">
          <div class="alert alert-info">
            <i class="fa fa-info-circle" />
            <p>Las programaciones se guardarán en el servidor al confirmar.</p>
          </div>

          <!-- Resumen de programaciones pendientes -->
          <div class="grid grid-cols-3 gap-3">
            <div class="stat-card">
              <i class="fa fa-calendar-check-o text-primary-400 text-xl" />
              <div class="flex flex-col">
                <span class="stat-value">{{ getPendingDaysCount() }}</span>
                <span class="stat-label">Días</span>
              </div>
            </div>
            <div class="stat-card">
              <i class="fa fa-music text-success-400 text-xl" />
              <div class="flex flex-col">
                <span class="stat-value">{{ getPendingSpotsCount() }}</span>
                <span class="stat-label">Spots únicos</span>
              </div>
            </div>
            <div class="stat-card">
              <i class="fa fa-list text-info-400 text-xl" />
              <div class="flex flex-col">
                <span class="stat-value">{{ pendingProgramaciones.length }}</span>
                <span class="stat-label">Programaciones</span>
              </div>
            </div>
          </div>

          <!-- Lista de programaciones pendientes -->
          <div>
            <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
              <i class="fa fa-list-ul" />
              Todas las programaciones ({{ pendingProgramaciones.length }})
            </h4>
            <div class="max-h-64 overflow-y-auto space-y-2" @scroll="handlePendingScroll">
              <div
                v-for="(prog, index) in displayedPendingProgramaciones"
                :key="`pending-${index}`"
                class="flex items-center gap-3 p-3 bg-dark-secondary rounded-lg border border-dark-border"
              >
                <div class="w-8 h-8 flex items-center justify-center bg-dark-tertiary rounded-full text-xs font-bold text-text-secondary">
                  {{ index + 1 }}
                </div>
                <div class="flex items-center gap-3 flex-1">
                  <span class="badge badge-info">{{ getWeekDayName(prog.clprsp_numeroDia) }}</span>
                  <span class="flex items-center gap-1 text-sm text-text-secondary">
                    <i class="fa fa-clock-o" />
                    {{ prog.clprsp_horaDesde.slice(0, 5) }}
                  </span>
                  <span v-if="prog.clprsp_orden" class="flex items-center gap-1 text-xs text-text-tertiary">
                    <i class="fa fa-layer-group" />
                    Slot {{ prog.clprsp_orden }}
                  </span>
                </div>
                <div class="text-sm font-medium text-text-primary truncate max-w-[150px]">
                  {{ prog._spot?.spo_nombre || 'Spot' }}
                </div>
              </div>

              <!-- Indicador de carga de más items pendientes -->
              <div v-if="hasMorePendingItems" class="flex items-center justify-center gap-2 py-3 text-text-secondary">
                <div class="spinner" />
                <span class="text-sm">Cargando más programaciones...</span>
              </div>

              <!-- Mensaje cuando se han cargado todos los items pendientes -->
              <div v-else-if="pendingProgramaciones.length > 0" class="flex items-center justify-center gap-2 py-3 text-success-400">
                <i class="fa fa-check-circle" />
                <span class="text-sm">Has visto todas las {{ pendingProgramaciones.length }} programaciones pendientes</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button
          class="btn btn-secondary"
          @click="clearPendingProgramaciones(); showPendingModal = false"
        >
          <i class="fa fa-trash" />
          Limpiar Todo
        </button>
        <button
          class="btn btn-primary"
          :disabled="isSaving || !codigoProgramacion"
          @click="openConfirmModal(); showPendingModal = false"
        >
          <i class="fa fa-check" />
          Confirmar y Guardar ({{ pendingProgramaciones.length }})
        </button>
      </template>
    </Modal>

    <!-- Modal de filtros y configuración -->
    <Modal v-model="showFiltersModal" size="md" :closable="true">
      <template #header>
        <div class="flex items-center gap-3">
          <i class="fa fa-cog text-primary-400" />
          <h3 class="text-lg font-semibold text-text-primary">Configuración de Programación</h3>
        </div>
      </template>

      <template #default>
        <div class="space-y-4">
          <!-- Configuración de reproductor -->
        </div>
      </template>

      <template #footer>
        <button
          class="btn btn-secondary"
          aria-label="Limpiar todos los filtros"
          @click="clearAllFilters"
        >
          <i class="fa fa-trash" />
          Limpiar Filtros
        </button>
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost" aria-label="Cancelar" @click="showFiltersModal = false">
            Cancelar
          </button>
          <button
            class="btn btn-primary"
            aria-label="Aplicar configuración"
            @click="showFiltersModal = false"
          >
            <i class="fa fa-check" />
            Aplicar
          </button>
        </div>
      </template>
    </Modal>

    <!-- Programaciones existentes -->
    <div class="card mt-6">
      <div class="flex-between mb-4">
        <h3 class="text-xl font-semibold text-text-primary">Programaciones Publicitarias</h3>
        <div v-if="hasActiveFilters" class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-sm text-text-secondary">
            <i class="fa fa-filter" />
            <span>{{ activeFiltersCount }} filtro{{ activeFiltersCount > 1 ? 's' : '' }} activo{{ activeFiltersCount > 1 ? 's' : '' }}</span>
          </div>
          <button class="btn btn-ghost btn-sm" @click="clearAllFilters">
            <i class="fa fa-times" />
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Sección de filtros -->
      <div class="p-4 bg-dark-secondary rounded-lg border border-dark-border mb-4">
        <div class="form-group">
          <label class="label flex items-center gap-2">
            <i class="fa fa-clock-o" />
            Filtrar por Rango Horario
          </label>
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-2">
              <label class="text-xs text-text-tertiary">Desde:</label>
              <input
                v-model="filterStartTime"
                type="time"
                class="input w-auto"
                placeholder="HH:MM"
                aria-label="Hora de inicio del filtro"
              >
            </div>
            <span class="text-text-tertiary">—</span>
            <div class="flex items-center gap-2">
              <label class="text-xs text-text-tertiary">Hasta:</label>
              <input
                v-model="filterEndTime"
                type="time"
                class="input w-auto"
                placeholder="HH:MM"
                aria-label="Hora de fin del filtro"
              >
            </div>
            <button
              v-if="filterStartTime || filterEndTime"
              class="btn btn-ghost btn-sm btn-icon"
              aria-label="Limpiar filtro de horario"
              @click="clearTimeFilter"
            >
              <i class="fa fa-times" />
            </button>
          </div>
          <small v-if="filterStartTime && filterEndTime" class="text-xs text-info-400 mt-2 flex items-center gap-1">
            <i class="fa fa-info-circle" />
            Mostrando programaciones entre {{ filterStartTime }} y {{ filterEndTime }}
          </small>
        </div>
      </div>

      <!-- Mensaje cuando no hay programaciones -->
      <div v-if="filteredProgramaciones.length === 0" class="text-center py-12">
        <div class="mb-4">
          <i class="fa fa-calendar-times-o text-5xl text-text-tertiary" />
        </div>
        <div class="text-lg text-text-secondary mb-2">
          No hay programaciones {{ hasActiveFilters ? 'que coincidan con los filtros' : 'disponibles' }}
        </div>
        <div class="text-sm text-text-tertiary">
          <span v-if="hasActiveFilters">
            Intenta ajustar los filtros o
            <button class="text-primary-400 hover:text-primary-300 underline" @click="clearAllFilters">limpiar todos los filtros</button>
          </span>
          <span v-else>Comienza creando una programación usando el panel superior</span>
        </div>
      </div>

      <div v-else ref="tableContainer" class="table-container">
        <table class="table" role="table" aria-label="Programaciones activas">
          <thead>
            <tr>
              <th scope="col" class="w-10">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  class="checkbox"
                  aria-label="Seleccionar todas las programaciones"
                  @change="toggleSelectAll"
                >
              </th>
              <th scope="col">Día / Horario</th>
              <th scope="col">Slot</th>
              <th scope="col">Spot</th>
              <th scope="col">Categoría</th>
              <th scope="col">Para</th>
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
                  @change="toggleSelection(programacion)"
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
                <span class="badge" :class="getSlotClass(programacion.clprsp_orden)">
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

      <!-- Controles de Paginación -->
      <div v-if="filteredProgramaciones.length > 0" class="mt-4 p-4 bg-dark-secondary rounded-lg">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="text-sm text-text-secondary">
            Mostrando {{ paginationInfo.start }} - {{ paginationInfo.end }} de {{ paginationInfo.total }} programaciones
          </div>

          <div class="flex items-center gap-2">
            <button
              class="btn btn-secondary btn-sm btn-icon"
              :disabled="currentPage === 1"
              aria-label="Primera página"
              @click="goToFirstPage"
            >
              <i class="fa fa-angle-double-left" />
            </button>
            <button
              class="btn btn-secondary btn-sm btn-icon"
              :disabled="currentPage === 1"
              aria-label="Página anterior"
              @click="goToPreviousPage"
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
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>

            <button
              class="btn btn-secondary btn-sm btn-icon"
              :disabled="currentPage === totalPages"
              aria-label="Página siguiente"
              @click="goToNextPage"
            >
              <i class="fa fa-angle-right" />
            </button>
            <button
              class="btn btn-secondary btn-sm btn-icon"
              :disabled="currentPage === totalPages"
              aria-label="Última página"
              @click="goToLastPage"
            >
              <i class="fa fa-angle-double-right" />
            </button>
          </div>

          <div>
            <select v-model="pageSize" class="select w-auto" @change="handlePageSizeChange">
              <option :value="10">10 por página</option>
              <option :value="25">25 por página</option>
              <option :value="50">50 por página</option>
              <option :value="100">100 por página</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="selectedProgramaciones.length > 0" class="mt-4 p-3 bg-dark-secondary rounded-lg flex items-center justify-between">
        <span class="text-sm text-text-secondary">{{ selectedProgramaciones.length }} programación(es) seleccionada(s)</span>
        <button
          class="btn btn-danger btn-sm"
          aria-label="Eliminar programaciones seleccionadas"
          @click="deleteSelectedProgramaciones"
        >
          <i class="fa fa-trash" />
          Eliminar Seleccionadas
        </button>
      </div>
    </div>

    <!-- Modal de Confirmación de Guardado -->
    <Modal v-model="showConfirmModal" size="md" :closable="true" @close="closeConfirmModal">
      <template #header>
        <div class="flex items-center gap-3">
          <i class="fa fa-question-circle text-primary-400" />
          <h3 class="text-lg font-semibold text-text-primary">Confirmar Guardado de Programaciones</h3>
        </div>
      </template>

      <template #default>
        <div class="space-y-4">
          <div class="alert alert-info">
            <i class="fa fa-info-circle" />
            <p>
              Estás a punto de guardar <strong>{{ pendingProgramaciones.length }}</strong>
              programación(es) en el servidor.
            </p>
          </div>

          <div class="p-4 bg-dark-secondary rounded-lg space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-secondary">Total de programaciones:</span>
              <span class="font-semibold text-text-primary">{{ pendingProgramaciones.length }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-secondary">Días involucrados:</span>
              <span class="font-semibold text-text-primary">{{ getPendingDaysCount() }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-secondary">Spots únicos:</span>
              <span class="font-semibold text-text-primary">{{ getPendingSpotsCount() }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button class="btn btn-ghost" @click="closeConfirmModal">
          <i class="fa fa-times" />
          Cancelar
        </button>
        <button class="btn btn-primary" @click="confirmAndSaveProgramaciones">
          <i class="fa fa-check" />
          Confirmar y Guardar
        </button>
      </template>
    </Modal>

    <!-- Modal de Selección de Spots -->
    <Modal v-model="showSpotSelectorModal" size="xl" :closable="true">
      <template #header>
        <div class="flex items-center gap-3">
          <i class="fa fa-music text-primary-400" />
          <h3 class="text-lg font-semibold text-text-primary">Seleccionar Spots</h3>
          <span class="badge badge-primary">{{ selectedSpots.length }}/{{ maxSpotsAllowed }}</span>
        </div>
      </template>

      <template #default>
        <div class="space-y-4">
          <!-- Filtros -->
          <div class="p-4 bg-dark-secondary rounded-lg border border-dark-border">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa fa-filter text-text-secondary" />
              <span class="text-sm font-semibold text-text-primary">Filtros</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Filtro por nombre -->
              <div class="form-group">
                <label class="label text-xs">Buscar por nombre</label>
                <div class="relative">
                  <input
                    v-model="spotModalSearch"
                    type="text"
                    class="input pl-9"
                    placeholder="Nombre del spot..."
                  >
                  <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                </div>
              </div>

              <!-- Filtro por tipo de spot -->
              <div class="form-group">
                <label class="label text-xs">Tipo de Spot</label>
                <select v-model="spotModalFilterTipo" class="select">
                  <option value="">Todos los tipos</option>
                  <option value="inst">Institucional</option>
                  <option value="prom">Promocional</option>
                  <option value="noti">Noticias</option>
                </select>
              </div>

              <!-- Filtro por tipo de media -->
              <div class="form-group">
                <label class="label text-xs">Tipo de Media</label>
                <select v-model="spotModalFilterMedia" class="select">
                  <option value="">Todos los medios</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="streaming">Streaming</option>
                </select>
              </div>
            </div>

            <!-- Botón limpiar filtros -->
            <div v-if="hasSpotModalFilters" class="mt-3 flex justify-end">
              <button class="btn btn-ghost btn-sm" @click="clearSpotModalFilters">
                <i class="fa fa-times" />
                Limpiar filtros
              </button>
            </div>
          </div>

          <!-- Contador de resultados -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-text-secondary">
              Mostrando <strong class="text-text-primary">{{ filteredSpotsForModal.length }}</strong> spots
            </span>
            <div v-if="selectedSpots.length > 0" class="flex items-center gap-2">
              <span class="text-success-400">
                <i class="fa fa-check-circle" />
                {{ selectedSpots.length }} seleccionado{{ selectedSpots.length !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <!-- Grid de Cards de Spots -->
          <div class="max-h-[50vh] overflow-y-auto pr-2">
            <div v-if="filteredSpotsForModal.length === 0" class="text-center py-12">
              <i class="fa fa-search text-4xl text-text-tertiary mb-3" />
              <p class="text-text-secondary">No se encontraron spots con los filtros aplicados</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="spot in filteredSpotsForModal"
                :key="spot.spo_codigo"
                class="spot-card p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg"
                :class="{
                  'border-primary-500 bg-primary-500/10 shadow-primary-500/20': isSpotSelected(spot),
                  'border-dark-border bg-dark-tertiary hover:border-dark-hover': !isSpotSelected(spot),
                  'opacity-50 cursor-not-allowed': !canAddMoreSpots && !isSpotSelected(spot)
                }"
                @click="toggleSpotSelection(spot)"
              >
                <!-- Header de la card -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <!-- Icono según tipo de media -->
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                      :class="getMediaTypeIconClass(spot.spo_mediaTipo)"
                    >
                      <i :class="getMediaTypeIcon(spot.spo_mediaTipo)" />
                    </div>
                    <div>
                      <span
                        class="badge text-xs"
                        :class="`badge-${getCategoryVariant(spot.spo_tipo)}`"
                      >
                        {{ getCategoryLabel(spot.spo_tipo) }}
                      </span>
                    </div>
                  </div>
                  <!-- Checkbox de selección -->
                  <div
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                    :class="{
                      'border-primary-500 bg-primary-500 text-white': isSpotSelected(spot),
                      'border-dark-border': !isSpotSelected(spot)
                    }"
                  >
                    <i v-if="isSpotSelected(spot)" class="fa fa-check text-xs" />
                  </div>
                </div>

                <!-- Nombre del spot -->
                <h4 class="font-semibold text-text-primary mb-2 line-clamp-2">
                  {{ spot.spo_nombre }}
                </h4>

                <!-- Información adicional -->
                <div class="flex items-center gap-3 text-xs text-text-tertiary">
                  <span class="flex items-center gap-1">
                    <i :class="getMediaTypeIcon(spot.spo_mediaTipo)" />
                    {{ getMediaTypeLabel(spot.spo_mediaTipo) }}
                  </span>
                  <span v-if="spot.spo_duracion" class="flex items-center gap-1">
                    <i class="fa fa-clock-o" />
                    {{ formatSpotDuration(spot.spo_duracion) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div class="text-sm text-text-secondary">
            <span v-if="!canAddMoreSpots && selectedSpots.length >= maxSpotsAllowed" class="text-warning-400">
              <i class="fa fa-exclamation-triangle" />
              Límite de spots alcanzado
            </span>
            <span v-else>
              Puedes seleccionar hasta {{ maxSpotsAllowed }} spots
            </span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost" @click="showSpotSelectorModal = false">
              Cancelar
            </button>
            <button
              class="btn btn-primary"
              :disabled="selectedSpots.length === 0"
              @click="confirmSpotSelection"
            >
              <i class="fa fa-check" />
              Confirmar Selección ({{ selectedSpots.length }})
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Indicador de Progreso de Guardado -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="isSaving" class="fixed inset-0 z-modal bg-black/70 flex items-center justify-center" style="pointer-events: auto;">
          <div class="bg-dark-tertiary rounded-2xl border border-dark-border shadow-2xl p-6 w-full max-w-md mx-4">
            <div class="flex items-center gap-3 mb-4">
              <i class="fa fa-spinner fa-spin text-primary-400 text-xl" />
              <h3 class="text-lg font-semibold text-text-primary">Guardando Programaciones...</h3>
            </div>

            <div class="space-y-3">
              <div class="h-2 bg-dark-secondary rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full transition-all duration-300"
                  :style="{ width: savingProgress + '%' }"
                />
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="font-semibold text-primary-400">{{ savingProgress }}%</span>
                <span class="text-text-secondary">{{ savedCount }} / {{ totalToSave }}</span>
              </div>
            </div>

            <div class="mt-4 flex items-center gap-2 text-sm text-text-secondary">
              <i class="fa fa-info-circle" />
              <p>Guardando programaciones... Por favor espera.</p>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import { useProgramacionSpotsStore } from '@/stores/programacionSpots'
import Modal from '@/components/ui/Modal.vue'
import configValidationService from '@/services/ConfigValidationService'
import { useSignalRAuth } from '@/composables/useSignalRAuth'

export default {
  name: 'ProgrammingInterface',
  components: {
    Modal
  },
  props: {
    spots: {
      type: Array,
      default: () => []
    },
    programaciones: {
      type: Array,
      default: () => []
    },
    reproductores: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    // Código de programación activa
    codigoProgramacion: {
      type: [String, Number],
      default: null
    },
    // Props para sincronización de filtros con componente padre
    initialReproductor: {
      type: String,
      default: ''
    },
    initialStartTime: {
      type: String,
      default: ''
    },
    initialEndTime: {
      type: String,
      default: ''
    },
    initialSelectedDays: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // Inicializar SignalR
    const signalR = useSignalRAuth()

    return {
      signalR, // Instancia de SignalR para notificaciones
      selectedSpots: [],
      spotSearch: '',
      showSpotsDropdown: false,
      selectedReproductor: '',
      selectedProgramaciones: [],
      showFiltersModal: false,
      // Propiedades para programación (sincronizadas con componente padre)
      startTime: String(this.initialStartTime || ''),
      endTime: String(this.initialEndTime || ''),
      selectedDays:
        Array.isArray(this.initialSelectedDays) && this.initialSelectedDays.length > 0
          ? this.initialSelectedDays.map(d => Number(d))
          : [],
      // Propiedades de paginación para tabla de programaciones
      currentPage: 1,
      pageSize: 25,
      // Propiedades de scroll infinito para modal pendientes
      displayedPendingCount: 20, // Número inicial de items pendientes a mostrar
      pendingIncrement: 20, // Cuántos items pendientes cargar cada vez
      // Filtros de visualización de programaciones
      filterStartTime: '',
      filterEndTime: '',
      // Propiedades para programación de múltiples minutos en una hora específica
      showMultiMinuteSelector: true,
      selectedHourForMultiMinute: '',
      selectedMinutes: [], // Array de minutos seleccionados [0, 5, 10, 15, etc.]
      currentSpotIndexForMinutes: 0, // Para rotar spots cuando se programan múltiples minutos
      // Propiedades para sistema de vista previa y confirmación
      pendingProgramaciones: [], // Programaciones pendientes de confirmar
      showConfirmModal: false,
      showPendingModal: false,
      isSaving: false,
      savingProgress: 0,
      totalToSave: 0,
      savedCount: 0,
      // Configuración del cliente
      clientConfig: null,
      configLoading: false,
      // Modal de selección de spots
      showSpotSelectorModal: false,
      spotModalSearch: '',
      spotModalFilterTipo: '',
      spotModalFilterMedia: ''
    }
  },

  computed: {
    // Días hábiles configurados por el cliente
    diasHabiles() {
      return this.clientConfig?.details?.dias || []
    },
    
    // Horario hábil configurado por el cliente
    horarioHabil() {
      return this.clientConfig?.details?.horario || null
    },

    // Verificar si un día es hábil
    isDiaHabil() {
      return dayValue => {
        if (!this.diasHabiles || this.diasHabiles.length === 0) return true
        return this.diasHabiles.some(d => d.cliDha_codigoDia === dayValue)
      }
    },

    // Obtener días de la semana con indicador de si son hábiles
    weekDays() {
      return [
        { text: 'Lun', value: 1, isHabil: this.isDiaHabil(1) },
        { text: 'Mar', value: 2, isHabil: this.isDiaHabil(2) },
        { text: 'Mié', value: 3, isHabil: this.isDiaHabil(3) },
        { text: 'Jue', value: 4, isHabil: this.isDiaHabil(4) },
        { text: 'Vie', value: 5, isHabil: this.isDiaHabil(5) },
        { text: 'Sáb', value: 6, isHabil: this.isDiaHabil(6) },
        { text: 'Dom', value: 0, isHabil: this.isDiaHabil(0) }
      ]
    },

    // Validar si el rango horario está dentro del horario hábil
    isTimeRangeValid() {
      if (!this.horarioHabil || !this.startTime || !this.endTime) return true

      const horaDesdeHabil = this.horarioHabil.cliHor_horaDesde
      const horaHastaHabil = this.horarioHabil.cliHor_horaHasta

      if (!horaDesdeHabil || !horaHastaHabil) return true

      // Comparar solo HH:MM
      const startTimeStr = this.startTime.slice(0, 5)
      const endTimeStr = this.endTime.slice(0, 5)
      const horaDesdeStr = horaDesdeHabil.slice(0, 5)
      const horaHastaStr = horaHastaHabil.slice(0, 5)

      return startTimeStr >= horaDesdeStr && endTimeStr <= horaHastaStr
    },

    // Mensaje de validación de horario
    timeRangeValidationMessage() {
      if (!this.isTimeRangeValid && this.horarioHabil) {
        const horaDesde = this.horarioHabil.cliHor_horaDesde?.slice(0, 5) || ''
        const horaHasta = this.horarioHabil.cliHor_horaHasta?.slice(0, 5) || ''
        return `El horario debe estar entre ${horaDesde} y ${horaHasta} (horario hábil configurado)`
      }
      return ''
    },

    // Verificar si hay días seleccionados que no son hábiles
    hasInvalidDays() {
      if (!this.clientConfig || this.diasHabiles.length === 0) return false
      return this.selectedDays.some(day => !this.isDiaHabil(day))
    },

    // Obtener lista de días inválidos seleccionados
    invalidSelectedDays() {
      if (!this.hasInvalidDays) return []
      return this.selectedDays.filter(day => !this.isDiaHabil(day))
    },

    timeSlots() {
      const slots = []
      // Crear slots de horarios desde 6:00 hasta 23:00 cada 30 minutos
      for (let hour = 6; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          slots.push({
            value: timeString,
            label: timeString,
            hour,
            minute
          })
        }
      }
      return slots
    },

    filteredSpots() {
      if (!this.spotSearch) return this.spots
      return this.spots.filter(spot =>
        spot.spo_nombre.toLowerCase().includes(this.spotSearch.toLowerCase())
      )
    },

    // Spots filtrados para el modal de selección
    filteredSpotsForModal() {
      let filtered = [...this.spots]

      // Filtro por nombre
      if (this.spotModalSearch) {
        const searchLower = this.spotModalSearch.toLowerCase()
        filtered = filtered.filter(spot =>
          spot.spo_nombre.toLowerCase().includes(searchLower)
        )
      }

      // Filtro por tipo de spot
      if (this.spotModalFilterTipo) {
        filtered = filtered.filter(spot => spot.spo_tipo === this.spotModalFilterTipo)
      }

      // Filtro por tipo de media
      if (this.spotModalFilterMedia) {
        filtered = filtered.filter(spot => spot.spo_mediaTipo === this.spotModalFilterMedia)
      }

      return filtered
    },

    // Verificar si hay filtros activos en el modal
    hasSpotModalFilters() {
      return !!(this.spotModalSearch || this.spotModalFilterTipo || this.spotModalFilterMedia)
    },
    getUsuario() {
      return JSON.parse(localStorage.getItem('user') || '{}')
    },
    getCliente() {
      try {
        const usuario = this.getUsuario
        return usuario && usuario.Cliente ? JSON.parse(usuario.Cliente) : {}
      } catch (error) {
        console.error('Error parsing cliente:', error)
        return {}
      }
    },
    // Verificar si el usuario actual es un reproductor
    isReproductor() {
      const currentUser = this.getUsuario
      return currentUser?.role === 'Reproductor'
    },
    // Obtener el nombre de usuario del reproductor logeado
    reproductorUsername() {
      const currentUser = this.getUsuario
      return currentUser?.unique_name || ''
    },
    // Obtener el reproductor efectivo (el que se debe usar en las programaciones)
    // Si el usuario es reproductor, siempre usa su propio usuario, sino usa el selectedReproductor
    effectiveReproductor() {
      if (this.isReproductor) {
        return this.reproductorUsername
      }
      return this.selectedReproductor || null
    },
    groupedSpots() {
      const groups = {}
      this.filteredSpots.forEach(spot => {
        const category = spot.spo_tipo || 'otros'
        if (!groups[category]) {
          groups[category] = {
            label: this.getCategoryLabel(category),
            variant: this.getCategoryVariant(category),
            spots: []
          }
        }
        groups[category].spots.push(spot)
      })
      return groups
    },

    groupedSpotsArray() {
      return Object.entries(this.groupedSpots).map(([key, group]) => ({
        category: key,
        ...group
      }))
    },

    // Máximo de spots permitidos
    maxSpotsAllowed() {
      return 5
    },

    // Verificar si excede el límite de spots
    exceedsSpotLimit() {
      return this.selectedSpots.length > this.maxSpotsAllowed
    },

    // Spots restantes que se pueden agregar
    remainingSpots() {
      return Math.max(0, this.maxSpotsAllowed - this.selectedSpots.length)
    },

    // Verificar si puede agregar más spots
    canAddMoreSpots() {
      return this.selectedSpots.length < this.maxSpotsAllowed
    },

    // ===== COMPUTED PARA SELECTOR DE MÚLTIPLES MINUTOS =====

    // Generar array de minutos disponibles (cada 5 minutos)
    availableMinutesInHour() {
      const minutes = []
      const cliente = this.getCliente
      const intervaloMinutos = cliente?.cli_frqspo != 0 ? cliente?.cli_frqspo : 5
      for (let min = 0; min < 60; min += intervaloMinutos) {
        minutes.push(min)
      }
      return minutes
    },

    // Verificar si un minuto específico está programado
    // NOTA: Este computed fue removido y movido a methods para evitar crear funciones en cada acceso

    // Verificar si un minuto está seleccionado
    // NOTA: Este computed fue removido y movido a methods para evitar crear funciones en cada acceso

    // Contar minutos disponibles (no programados)
    availableMinutesCount() {
      return this.availableMinutesInHour.filter(min => !this.isMinuteProgrammed(min)).length
    },

    // Contar minutos seleccionados
    selectedMinutesCount() {
      return this.selectedMinutes.length
    },

    // Verificar si se puede programar los minutos seleccionados
    canProgramSelectedMinutes() {
      return (
        this.codigoProgramacion &&
        this.selectedMinutes.length > 0 &&
        this.selectedSpots.length > 0 &&
        this.selectedHourForMultiMinute &&
        this.selectedDays.length > 0
      )
    },

    // Contar total de programaciones
    getTotalProgramaciones() {
      return this.filteredProgramaciones.length
    },

    // Verificar si se puede editar una programación
    canEditProgramacion(programacion) {
      // Aquí puedes agregar lógica para verificar permisos de edición
      return true // Por ahora permite editar todas
    },

    // Verificar si puede programar spots
    canProgram() {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const hasValidProgramacion = this.getCurrentProgramacionCode() > 0
      const hasSelectedSpots = this.selectedSpots && this.selectedSpots.length > 0
      const hasSelectedDays = this.selectedDays && this.selectedDays.length > 0
      const hasValidTimeRange = this.startTime && this.endTime && this.startTime < this.endTime
      const canFitSpots = this.canSpotsFitInTimeRange
      const withinSpotLimit = !this.exceedsSpotLimit

      return (
        hasValidProgramacion &&
        hasSelectedSpots &&
        hasSelectedDays &&
        hasValidTimeRange &&
        canFitSpots &&
        currentUser.unique_name &&
        withinSpotLimit
      )
    },

    /**
     * Verifica si los spots seleccionados pueden caber en el rango horario seleccionado
     * @returns {boolean} True si todos los spots pueden ser acomodados
     */
    canSpotsFitInTimeRange() {
      if (!this.startTime || !this.endTime || this.selectedSpots.length === 0) {
        return false
      }

      try {
        const start = this.$moment(this.startTime, 'HH:mm')
        const end = this.$moment(this.endTime, 'HH:mm')

        if (!start.isValid() || !end.isValid() || start >= end) {
          return false
        }

        const totalTimeAvailable = end.diff(start, 'seconds')
        const totalSpotsDuration = this.totalDuration

        // Debe haber al menos 30 segundos disponibles por spot más la duración del spot
        const minRequiredTime = this.selectedSpots.length * 30 + totalSpotsDuration

        return totalTimeAvailable >= minRequiredTime
      } catch (error) {
        console.error('Error verificando si spots caben en rango horario:', error)
        return false
      }
    },

    // Modo debug (para desarrollo)
    isDebugMode() {
      return localStorage.getItem('debugMode') === 'true'
    },

    isAllSelected() {
      return (
        this.displayedProgramaciones.length > 0 &&
        this.selectedProgramaciones.length > 0 &&
        this.displayedProgramaciones.every(prog =>
          this.selectedProgramaciones.some(
            selected => selected.clprsp_codigo === prog.clprsp_codigo
          )
        )
      )
    },

    // Información sobre filtros activos
    hasActiveFilters() {
      // Considerar filtro de días solo si hay menos de 7 días seleccionados (no todos)
      const hasDaysFilter = this.selectedDays.length > 0 && this.selectedDays.length < 7
      return !!(
        this.selectedReproductor ||
        hasDaysFilter ||
        (this.filterStartTime && this.filterEndTime)
      )
    },

    activeFiltersCount() {
      let count = 0
      if (this.selectedReproductor) count++
      // Solo contar como filtro si hay menos de 7 días (no todos)
      if (this.selectedDays.length > 0 && this.selectedDays.length < 7) count++
      if (this.filterStartTime && this.filterEndTime) count++
      return count
    },

    // Programaciones visibles según paginación
    displayedProgramaciones() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredProgramaciones.slice(start, end)
    },

    // Total de páginas
    totalPages() {
      return Math.ceil(this.filteredProgramaciones.length / this.pageSize) || 1
    },

    // Páginas visibles en el paginador
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          pages.push(1, 2, 3, 4, 5, '...', total)
        } else if (current >= total - 3) {
          pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
        } else {
          pages.push(1, '...', current - 1, current, current + 1, '...', total)
        }
      }

      return pages
    },

    // Información de paginación
    paginationInfo() {
      const start = (this.currentPage - 1) * this.pageSize + 1
      const end = Math.min(this.currentPage * this.pageSize, this.filteredProgramaciones.length)
      return { start, end, total: this.filteredProgramaciones.length }
    },

    // Programaciones pendientes visibles según scroll infinito
    displayedPendingProgramaciones() {
      return this.pendingProgramaciones.slice(0, this.displayedPendingCount)
    },

    // Verificar si hay más items pendientes para cargar
    hasMorePendingItems() {
      return this.displayedPendingCount < this.pendingProgramaciones.length
    },

    // Programaciones filtradas según criterios del formulario
    filteredProgramaciones() {
      let filtered = [...this.programaciones]

      // Filtro por reproductor
      // IMPORTANTE: Si el usuario es reproductor, NO aplicar este filtro
      // para que pueda ver todas las programaciones del cliente al cual pertenece
      if (this.selectedReproductor && !this.isReproductor) {
        filtered = filtered.filter(
          prog =>
            prog.clprsp_usuario === this.selectedReproductor ||
            (prog.clprsp_usuario === null && this.selectedReproductor === 'Todos')
        )
      }

      // Filtro por días de la semana seleccionados
      // NO aplicar si no hay días seleccionados o si están todos los días (7)
      if (this.selectedDays.length > 0 && this.selectedDays.length < 7) {
        filtered = filtered.filter(prog => this.selectedDays.includes(prog.clprsp_numeroDia))
      }

      // Filtro por rango horario DE VISUALIZACIÓN (independiente de la programación)
      // SOLO aplicar si AMBOS filterStartTime Y filterEndTime están definidos
      if (this.filterStartTime && this.filterEndTime) {
        filtered = filtered.filter(prog => {
          const progTime = prog.clprsp_horaDesde.slice(0, 5) // Obtener solo HH:MM
          return progTime >= this.filterStartTime && progTime <= this.filterEndTime
        })
      }

      // ORDENAR: Primero por día, luego por horario, luego por slot
      filtered.sort((a, b) => {
        // 1. Ordenar por día (numeroDia)
        if (a.clprsp_numeroDia !== b.clprsp_numeroDia) {
          return a.clprsp_numeroDia - b.clprsp_numeroDia
        }

        // 2. Ordenar por horario (horaDesde)
        if (a.clprsp_horaDesde !== b.clprsp_horaDesde) {
          return a.clprsp_horaDesde.localeCompare(b.clprsp_horaDesde)
        }

        // 3. Ordenar por slot
        const slotA = a.clprsp_orden || 0
        const slotB = b.clprsp_orden || 0
        return slotA - slotB
      })

      return filtered
    },

    // Programaciones agrupadas por día y horario para contar slots
    programacionesPorHorario() {
      const grupos = {}

      this.filteredProgramaciones.forEach(prog => {
        const key = `${prog.clprsp_numeroDia}-${prog.clprsp_horaDesde}`
        if (!grupos[key]) {
          grupos[key] = []
        }
        grupos[key].push(prog)
      })

      return grupos
    },


    // Detectar si es móvil
    isMobile() {
      return window.innerWidth <= 768
    }

    // Verificar si un día es fin de semana
    // NOTA: Este computed fue removido y movido a methods

    // Verificar si es la hora actual
    // NOTA: Este computed fue removido y movido a methods
  },
  watch: {
    spotSearch(newVal) {
      if (newVal === '') {
        this.showSpotsDropdown = false
      }
    },
    selectedReproductor() {
      // Limpiar selección de programaciones al cambiar filtros
      this.selectedProgramaciones = []
      this.resetPagination()

      // Emitir evento de cambio de filtros
      this.emitFilterChange()
    },
    selectedDays: {
      handler() {
        // Limpiar selección al cambiar días seleccionados
        this.selectedProgramaciones = []
        this.resetPagination()

        // Emitir evento de cambio de filtros
        this.emitFilterChange()
      },
      deep: true
    },
    startTime() {
      // Limpiar selección al cambiar rango horario
      this.selectedProgramaciones = []
      this.resetPagination()

      // Emitir evento de cambio de filtros
      this.emitFilterChange()
    },
    endTime() {
      // Limpiar selección al cambiar rango horario
      this.selectedProgramaciones = []
      this.resetPagination()

      // Emitir evento de cambio de filtros
      this.emitFilterChange()
    },
    filterStartTime() {
      // Resetear scroll al cambiar filtro de inicio
      this.resetPagination()
    },
    filterEndTime() {
      // Resetear scroll al cambiar filtro de fin
      this.resetPagination()
    },
    programaciones: {
      handler(newVal, oldVal) {
        console.log('🔄 ProgrammingInterface: Programaciones watcher triggered')
        console.log('🔄 ProgrammingInterface: Valor anterior:', oldVal?.length || 0, 'programaciones')
        console.log('🔄 ProgrammingInterface: Valor nuevo:', newVal?.length || 0, 'programaciones')
        console.log('🔄 ProgrammingInterface: Datos recibidos:', newVal)

        if (Array.isArray(newVal) && newVal.length > 0) {
          console.log('✅ ProgrammingInterface: Programaciones recibidas correctamente')
          console.log('📋 ProgrammingInterface: Primera programación:', newVal[0])
        } else if (Array.isArray(newVal) && newVal.length === 0) {
          console.warn('⚠️ ProgrammingInterface: Array de programaciones vacío')
        } else {
          console.error('❌ ProgrammingInterface: Programaciones no es un array válido:', newVal)
        }

        // Limpiar selección al actualizar programaciones
        this.selectedProgramaciones = []
      },
      immediate: true,
      deep: true
    }
  },

  async mounted() {
    // Conectar SignalR para notificaciones en tiempo real
    if (this.signalR && !this.signalR.isConnected.value) {
      try {
        const hubUrl = import.meta.env.VITE_API_BASE_URL_WS + 'hubs/notifications'
        await this.signalR.connect(hubUrl)
        console.log('[ProgrammingInterface] ✅ SignalR conectado')
      } catch (error) {
        console.warn('[ProgrammingInterface] ⚠️ Error conectando SignalR:', error)
      }
    }

    // Cargar configuración del cliente
    await this.loadClientConfiguration()

    // Inicializar filtros
    this.initializeFilters()

    // Cargar preferencia de tamaño de página guardada
    const savedPageSize = localStorage.getItem('programacionesPageSize')
    if (savedPageSize) {
      this.pageSize = parseInt(savedPageSize)
    }

    // Si el usuario es reproductor, setear automáticamente su usuario
    if (this.isReproductor) {
      this.selectedReproductor = this.reproductorUsername
      console.log('👤 Usuario reproductor detectado:', this.reproductorUsername)
      console.log(
        '🔒 Campo de reproductor bloqueado - Solo puede crear programaciones para sí mismo'
      )
      console.log('👁️ Puede ver todas las programaciones del cliente al que pertenece')
    }
  },

  beforeUnmount() {
    // Desconectar SignalR al desmontar el componente
    if (this.signalR && this.signalR.isConnected.value) {
      this.signalR.disconnect()
      console.log('[ProgrammingInterface] 👋 SignalR desconectado')
    }
  },

  methods: {
    // ===== MÉTODOS PARA SELECTOR DE MÚLTIPLES MINUTOS =====

    // Alternar selección de un minuto
    toggleMinuteSelection(minute) {
      // No permitir seleccionar minutos ya programados
      if (this.isMinuteProgrammed(minute)) {
        this.$toast('Este minuto ya está programado', 'warning')
        return
      }

      const index = this.selectedMinutes.indexOf(minute)
      if (index > -1) {
        // Deseleccionar
        this.selectedMinutes.splice(index, 1)
      } else {
        // Seleccionar
        this.selectedMinutes.push(minute)
      }

      // Ordenar array para mantener orden cronológico
      this.selectedMinutes.sort((a, b) => a - b)
    },

    // Seleccionar todos los minutos disponibles
    selectAllAvailableMinutes() {
      this.selectedMinutes = this.availableMinutesInHour.filter(
        min => !this.isMinuteProgrammed(min)
      )
      this.$toast(`${this.selectedMinutes.length} minutos seleccionados`, 'success')
    },

    // Limpiar selección de minutos
    clearMinuteSelection() {
      this.selectedMinutes = []
    },

    // Limpiar selección cuando cambia día u hora
    onDayHourChange() {
      this.selectedMinutes = []
    },

    // Obtener nombre del día de la semana
    getWeekDayName(dayValue) {
      const day = this.weekDays.find(d => d.value === dayValue)
      return day ? day.text : ''
    },

    // Programar spots en los minutos seleccionados
    async programSelectedMinutes() {
      if (!this.canProgramSelectedMinutes) {
        this.$toast('Completa todos los campos requeridos', 'warning')
        return
      }

      try {
        const programaciones = []
        const hour = parseInt(this.selectedHourForMultiMinute.split(':')[0])

        // Iterar sobre cada día seleccionado
        let then = this
        this.selectedDays.forEach(day => {
          // Iterar sobre cada minuto seleccionado
          then.selectedMinutes.forEach(minute => {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`

            // CAMBIO IMPORTANTE: Programar TODOS los spots juntos en la misma hora
            // usando el campo 'slot' para determinar el orden de reproducción
            let ocupados = then.filteredProgramaciones.filter(prog => {
              return prog.clprsp_numeroDia == day && prog.clprsp_horaDesde  == timeString
            })
            let slot = ocupados.length>0 ? ocupados.length : 1
            
            then.selectedSpots.forEach((spot) => {
              
              if(slot<=5){
                programaciones.push({
                  clprsp_numeroDia: day,
                  clprsp_horaDesde: timeString,
                  clprsp_codigoSpot: spot.spo_codigo,
                  clprsp_codigoReproductor: this.effectiveReproductor,
                  clprsp_orden: slot, // Orden de reproducción: 1, 2, 3, 4, 5
                  // Datos adicionales para visualización
                  _spot: spot,
                  _isNew: true,
                  _isPending: true // Marcar como pendiente
                })
                slot++
              }
            })
          })
        })

        console.log('📅 Agregando múltiples minutos a vista previa:', {
          totalProgramaciones: programaciones.length,
          spotsJuntosPorMinuto: this.selectedSpots.length,
          dias: this.selectedDays.map(d => this.getWeekDayName(d)).join(', '),
          hora: this.selectedHourForMultiMinute,
          minutos: this.selectedMinutes,
          minutosSeleccionados: this.selectedMinutes.length
        })

        // Agregar a programaciones pendientes en lugar de enviar al servidor
        this.pendingProgramaciones.push(...programaciones)

        this.$toast(
          `${programaciones.length} programación(es) agregada(s) a vista previa. Total pendientes: ${this.pendingProgramaciones.length}`,
          'info'
        )

        // Limpiar selección después de programar
        this.clearMinuteSelection()
      } catch (error) {
        console.error('Error agregando múltiples minutos:', error)
        this.$toast('Error al agregar minutos', 'error')
      }
    },

    // Abrir modal de confirmación
    openConfirmModal() {
      if (this.pendingProgramaciones.length === 0) {
        this.$toast('No hay programaciones pendientes para confirmar', 'warning')
        return
      }
      // Resetear el contador de items mostrados para empezar desde el inicio
      this.displayedPendingCount = 20
      this.showConfirmModal = true
    },

    // Cerrar modal de confirmación
    closeConfirmModal() {
      this.showConfirmModal = false
    },

    // Limpiar todas las programaciones pendientes
    clearPendingProgramaciones() {
      this.pendingProgramaciones = []
      this.displayedPendingCount = 20 // Resetear contador
      this.$toast('Programaciones pendientes limpiadas', 'info')
    },

    // Confirmar y guardar programaciones
    async confirmAndSaveProgramaciones() {
      if (this.pendingProgramaciones.length === 0) {
        this.$toast('No hay programaciones para guardar', 'warning')
        return
      }

      this.showConfirmModal = false

      try {
        console.log(
          `💾 Confirmando guardado de ${this.pendingProgramaciones.length} programaciones...`
        )

        // Usar la función unificada con barra de progreso y limpieza de pendientes
        await this.sendProgramacionesToServer(this.pendingProgramaciones, {
          showProgress: true,
          clearPending: true
        })
      } catch (error) {
        console.error('❌ Error al confirmar y guardar programaciones:', error)
        // El error ya fue mostrado por sendProgramacionesToServer
      }
    },

    // Obtener conteo de días únicos en programaciones pendientes
    getPendingDaysCount() {
      const uniqueDays = new Set(this.pendingProgramaciones.map(p => p.clprsp_numeroDia))
      return uniqueDays.size
    },

    // Obtener conteo de spots únicos en programaciones pendientes
    getPendingSpotsCount() {
      const uniqueSpots = new Set(this.pendingProgramaciones.map(p => p.clprsp_codigoSpot))
      return uniqueSpots.size
    },

    // Verificar si hay programación existente en slot
    hasProgramacionInSlot(day, timeSlot) {
      return !!this.filteredProgramaciones.find(prog => {
        return prog.clprsp_numeroDia == day && prog.clprsp_horaDesde.slice(0, 5) == timeSlot
      })
    },

    // Obtener programación existente en slot
    getProgramacionInSlot(day, timeSlot) {
      return this.filteredProgramaciones.find(
        prog => prog.clprsp_numeroDia === day && prog.clprsp_horaDesde.slice(0, 5) == timeSlot
      )
    },

    // Contar programaciones por día
    getDayProgramacionesCount(day) {
      return this.filteredProgramaciones.filter(prog => prog.clprsp_numeroDia === day).length
    },
    // Inicializar filtros con valores recibidos del componente padre
    initializeFilters() {
      if (this.initialReproductor) {
        this.selectedReproductor = this.initialReproductor
      }
      if (this.initialStartTime) {
        this.startTime = this.initialStartTime
      } else {
        this.startTime = '06:00'
      }
      if (this.initialEndTime) {
        this.endTime = this.initialEndTime
      } else {
        this.endTime = '23:00'
      }
      if (this.initialSelectedDays && this.initialSelectedDays.length > 0) {
        this.selectedDays = [...this.initialSelectedDays]
      }
    },

    isSpotSelected(spot) {
      return this.selectedSpots.some(s => s.spo_codigo === spot.spo_codigo)
    },

    addSpot(spot) {
      // Verificar límite de spots antes de agregar
      if (!this.canAddMoreSpots && !this.isSpotSelected(spot)) {
        this.$toast(
          `No se puede agregar más spots. Límite máximo: ${this.maxSpotsAllowed} spots.`,
          'warning'
        )
        return
      }

      if (!this.isSpotSelected(spot)) {
        this.selectedSpots.push(spot)
        this.$toast(
          `Spot agregado (${this.selectedSpots.length}/${this.maxSpotsAllowed})`,
          'success'
        )
      }
    },

    removeSpot(spot) {
      const index = this.selectedSpots.findIndex(s => s.spo_codigo === spot.spo_codigo)
      if (index > -1) {
        this.selectedSpots.splice(index, 1)
      }
    },

    filterSpots() {
      this.showSpotsDropdown = true
    },

    hideSpotsDropdown() {
      setTimeout(() => {
        this.showSpotsDropdown = false
      }, 200)
    },

    // ===== MÉTODOS PARA MODAL DE SELECCIÓN DE SPOTS =====

    // Toggle de selección de spot en el modal
    toggleSpotSelection(spot) {
      if (this.isSpotSelected(spot)) {
        // Deseleccionar
        this.removeSpot(spot)
      } else {
        // Seleccionar (verificar límite)
        if (this.canAddMoreSpots) {
          this.selectedSpots.push(spot)
        } else {
          this.$toast(`Límite de ${this.maxSpotsAllowed} spots alcanzado`, 'warning')
        }
      }
    },

    // Limpiar filtros del modal
    clearSpotModalFilters() {
      this.spotModalSearch = ''
      this.spotModalFilterTipo = ''
      this.spotModalFilterMedia = ''
    },

    // Confirmar selección de spots y cerrar modal
    confirmSpotSelection() {
      if (this.selectedSpots.length > 0) {
        this.$toast(`${this.selectedSpots.length} spot(s) seleccionado(s)`, 'success')
      }
      this.showSpotSelectorModal = false
      this.clearSpotModalFilters()
    },

    // Obtener icono según tipo de media
    getMediaTypeIcon(mediaTipo) {
      const icons = {
        audio: 'fa fa-volume-up',
        video: 'fa fa-film',
        streaming: 'fa fa-wifi'
      }
      return icons[mediaTipo] || 'fa fa-file'
    },

    // Obtener clase de icono según tipo de media
    getMediaTypeIconClass(mediaTipo) {
      const classes = {
        audio: 'bg-primary-500/20 text-primary-400',
        video: 'bg-success-500/20 text-success-400',
        streaming: 'bg-info-500/20 text-info-400'
      }
      return classes[mediaTipo] || 'bg-dark-secondary text-text-secondary'
    },

    // Obtener etiqueta según tipo de media
    getMediaTypeLabel(mediaTipo) {
      const labels = {
        audio: 'Audio',
        video: 'Video',
        streaming: 'Streaming'
      }
      return labels[mediaTipo] || mediaTipo || 'Media'
    },

    // Formatear duración del spot
    formatSpotDuration(duration) {
      if (!duration) return '--:--'
      const totalSeconds = typeof duration === 'string' ? parseInt(duration) : duration
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },

    // ===== FIN MÉTODOS MODAL SELECCIÓN SPOTS =====

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedProgramaciones = []
      } else {
        // Seleccionar todas las programaciones visibles actualmente
        this.selectedProgramaciones = [...this.displayedProgramaciones]
      }
    },

    toggleSelection(programacion) {
      const index = this.selectedProgramaciones.findIndex(
        p => p.clprsp_codigo === programacion.clprsp_codigo
      )
      if (index > -1) {
        this.selectedProgramaciones.splice(index, 1)
      } else {
        this.selectedProgramaciones.push(programacion)
      }
    },

    isSelected(programacion) {
      return this.selectedProgramaciones.some(p => p.clprsp_codigo === programacion.clprsp_codigo)
    },

    deleteSelectedProgramaciones() {
      if (this.selectedProgramaciones.length > 0) {
        this.$emit('delete-programaciones', this.selectedProgramaciones)
      }
    },

    getDayName(dayNumber) {
      return this.weekDays.find(d => d.value === dayNumber)?.text || ''
    },

    getCategoryVariant(tipo) {
      const variants = {
        inst: 'primary',
        prom: 'warning',
        noti: 'info'
      }
      return variants[tipo] || 'secondary'
    },

    getCategoryLabel(tipo) {
      const labels = {
        inst: 'Institucional',
        prom: 'Promocional',
        noti: 'Noticias'
      }
      return labels[tipo] || tipo
    },

    getSlotClass(slot) {
      const slotNumber = slot || 0
      const slotClasses = [
        'slot-0', // Sin slot o slot 0
        'slot-1', // Slot 1
        'slot-2', // Slot 2
        'slot-3', // Slot 3
        'slot-4', // Slot 4
        'slot-5' // Slot 5
      ]
      return slotClasses[slotNumber] || 'slot-0'
    },

    // Obtener el número de slots en el mismo horario
    getSlotsCountForSchedule(programacion) {
      const key = `${programacion.clprsp_numeroDia}-${programacion.clprsp_horaDesde}`
      const programacionesEnHorario = this.programacionesPorHorario[key] || []
      return programacionesEnHorario.length
    },

    // Verificar si esta programación es el primer slot en su horario
    isFirstSlotInSchedule(programacion) {
      const key = `${programacion.clprsp_numeroDia}-${programacion.clprsp_horaDesde}`
      const programacionesEnHorario = this.programacionesPorHorario[key] || []
      if (programacionesEnHorario.length === 0) return false
      return programacionesEnHorario[0].clprsp_codigo === programacion.clprsp_codigo
    },

    getTargetName(usuario) {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const client = currentUser.Cliente ? JSON.parse(currentUser.Cliente) : {}
        return client && usuario === client.cli_usuari ? 'Todos' : usuario
      } catch (error) {
        console.error('Error in getTargetName:', error)
        return usuario || 'Desconocido'
      }
    },

    getCurrentProgramacionCode() {
      try {
        // Primero intentar usar la prop si está disponible
        if (this.codigoProgramacion) {
          console.log('✅ Código de programación obtenido desde prop:', this.codigoProgramacion)
          return this.codigoProgramacion
        }

        // Fallback 1: buscar en localStorage.selectedProgramacion
        console.log('⚠️ Prop codigoProgramacion no disponible, buscando en localStorage...')
        const selectedProgData = localStorage.getItem('selectedProgramacion')
        if (selectedProgData) {
          try {
            const selectedProg = JSON.parse(selectedProgData)
            if (selectedProg && selectedProg.clipro_codigo) {
              console.log(
                '✅ Código de programación obtenido desde localStorage.selectedProgramacion:',
                selectedProg.clipro_codigo
              )
              return selectedProg.clipro_codigo
            }
          } catch (e) {
            console.warn('Error parseando selectedProgramacion:', e)
          }
        }

        // Fallback 2: buscar en localStorage.listProgSpot
        const progSpotsData = localStorage.getItem('listProgSpot')
        console.log('Datos de programación en localStorage.listProgSpot:', progSpotsData)

        if (!progSpotsData) {
          console.warn('No se encontraron datos de programación en localStorage')
          return 0
        }

        const progSpots = JSON.parse(progSpotsData)
        console.log('Objeto de programación parseado:', progSpots)

        if (!Array.isArray(progSpots)) {
          console.warn('Los datos de programación no son un array:', progSpots)
          return 0
        }

        if (progSpots.length === 0) {
          console.warn('El array de programación está vacío')
          return 0
        }

        const codigo = progSpots[0].clipro_codigo
        console.log('Código de programación obtenido del localStorage:', codigo)

        if (!codigo) {
          console.warn('El código de programación es inválido:', progSpots[0])
          return 0
        }

        return codigo
      } catch (error) {
        console.error('Error obteniendo código de programación:', error)
        return 0
      }
    },

    /**
     * FUNCIÓN UNIFICADA PARA ENVIAR PROGRAMACIONES AL SERVIDOR
     * Esta es la única función que debe usarse para enviar datos a la API
     *
     * @param {Array} programaciones - Array de programaciones a enviar
     * @param {Object} options - Opciones adicionales
     * @param {boolean} options.showProgress - Mostrar barra de progreso
     * @param {boolean} options.clearPending - Limpiar programaciones pendientes después de guardar
     * @returns {Promise} Promesa que se resuelve cuando se completa el guardado
     */
    async sendProgramacionesToServer(programaciones, options = {}) {
      const { showProgress = false, clearPending = false } = options

      try {
        // ===== DEBUG: Ver prop recibida =====
        console.log('🔍 DEBUG - codigoProgramacion prop:', this.codigoProgramacion)

        // ===== VALIDACIÓN 1: Usuario logueado =====
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (!currentUser || !currentUser.unique_name) {
          throw new Error('Debe estar logueado para guardar programaciones')
        }

        // ===== VALIDACIÓN 2: Código de programación válido =====
        const codigoProgramacion = this.getCurrentProgramacionCode()
        console.log(
          '🔍 DEBUG - Código obtenido por getCurrentProgramacionCode():',
          codigoProgramacion
        )

        if (!codigoProgramacion || codigoProgramacion === 0) {
          const errorMsg = this.codigoProgramacion
            ? 'El código de programación no es válido'
            : 'No hay una programación seleccionada. Por favor, seleccione una programación antes de guardar.'
          throw new Error(errorMsg)
        }

        // ===== VALIDACIÓN 3: Hay programaciones para guardar =====
        if (!programaciones || !Array.isArray(programaciones) || programaciones.length === 0) {
          throw new Error('No hay programaciones para guardar')
        }

        console.log('📤 Enviando programaciones al servidor:', {
          total: programaciones.length,
          codigoProgramacion,
          usuario: currentUser.unique_name,
          reproductor: this.effectiveReproductor,
          isReproductor: this.isReproductor
        })

        // ===== NORMALIZACIÓN DE DATOS =====
        // Convertir todas las programaciones al formato esperado por la API
        const normalizedProgramaciones = programaciones
          .map(prog => {
            // Detectar formato y normalizar
            let normalized = {}

            // Formato 1: Sistema de calendario (codigoProgramacion, codigoSpot, horaDesde, numeroDia)
            if (
              prog.codigoProgramacion &&
              prog.codigoSpot &&
              prog.horaDesde !== undefined &&
              prog.numeroDia !== undefined
            ) {
              normalized = {
                codigoProgramacion: prog.codigoProgramacion,
                codigoSpot: prog.codigoSpot,
                horaDesde: prog.horaDesde.length === 5 ? `${prog.horaDesde}:00` : prog.horaDesde, // Asegurar formato HH:MM:SS
                numeroDia: prog.numeroDia,
                slot: prog.slot || 0,
                codigoProgSpotDestino: prog.codigoProgSpotDestino || 0,
                for: prog.for || this.effectiveReproductor || 'Todos'
              }
            }
            // Formato 2: Sistema de programación manual/automática (clprsp_*)
            else if (
              prog.clprsp_numeroDia !== undefined &&
              prog.clprsp_horaDesde &&
              prog.clprsp_codigoSpot
            ) {
              normalized = {
                codigoProgramacion: codigoProgramacion,
                codigoSpot: prog.clprsp_codigoSpot,
                horaDesde:
                  prog.clprsp_horaDesde.length === 5
                    ? `${prog.clprsp_horaDesde}:00`
                    : prog.clprsp_horaDesde,
                numeroDia: prog.clprsp_numeroDia,
                slot: prog.clprsp_orden || 0, // ⭐ Usar el slot de la programación
                codigoProgSpotDestino: 0,
                for: prog.clprsp_codigoReproductor || this.effectiveReproductor || 'Todos'
              }
            }
            // Formato desconocido, loggear error
            else {
              console.error('Formato de programación desconocido:', prog)
              return null
            }

            return normalized
          })
          .filter(p => p !== null) // Remover programaciones inválidas

        if (normalizedProgramaciones.length === 0) {
          throw new Error('No se pudieron normalizar las programaciones al formato esperado')
        }

        console.log('✅ Programaciones normalizadas:', {
          original: programaciones.length,
          normalizadas: normalizedProgramaciones.length
        })

        // ===== GUARDADO CON PROGRESO =====
        if (showProgress) {
          this.isSaving = true
          this.savedCount = 0
          this.totalToSave = normalizedProgramaciones.length
          this.savingProgress = 0
        }

        let result

        try {
          // Si hay más de 50 programaciones, guardar en lotes de 10 (transparente para el usuario)
          if (normalizedProgramaciones.length > 50) {
            console.log(
              `📦 Guardando ${normalizedProgramaciones.length} programaciones en lotes de 10...`
            )
            result = await this.saveProgramacionesInBatches(
              normalizedProgramaciones,
              10,
              showProgress
            )
          } else {
            // Guardar todas directamente
            console.log(
              `💾 Guardando ${normalizedProgramaciones.length} programaciones directamente...`
            )
            result = await this.saveProgramacionesDirect(normalizedProgramaciones, showProgress)
          }

          // ===== POST-GUARDADO =====
          console.log('✅ Programaciones guardadas exitosamente:', result)

          // Limpiar programaciones pendientes si se solicitó
          if (clearPending) {
            this.pendingProgramaciones = []
            this.displayedPendingCount = 20 // Resetear contador
          }

          // Notificar éxito ANTES de operaciones que pueden fallar
          this.$toast(
            `✅ ${normalizedProgramaciones.length} programación(es) guardada(s) exitosamente`,
            'success'
          )

        } finally {
          // Resetear el estado de guardado SIEMPRE antes de operaciones post-guardado
          if (showProgress) {
            this.isSaving = false
            this.savingProgress = 0
            this.totalToSave = 0
            this.savedCount = 0
          }
        }

        // ===== OPERACIONES POST-GUARDADO (no bloquean UI) =====
        // Estas operaciones se ejecutan después de cerrar el overlay

        // Usar nextTick para permitir que Vue actualice el DOM
        this.$nextTick(async () => {
          try {
            // Recargar programaciones desde el servidor para ver los cambios
            console.log('🔄 Recargando programaciones desde el servidor...')
            await this.reloadProgramacionesFromServer()

            // ===== NOTIFICAR A REPRODUCTORES POR SIGNALR (con timeout) =====
            console.log('📡 Notificando a reproductores por SignalR...')

            // Usar Promise.race con timeout para evitar bloqueos
            const notifyPromise = this.notifyReproductoresNewSpots({
              count: normalizedProgramaciones.length,
              spots: programaciones,
              targetReproductor: this.effectiveReproductor
            })

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout notificando reproductores')), 5000)
            )

            await Promise.race([notifyPromise, timeoutPromise]).catch(err => {
              console.warn('⚠️ Notificación SignalR timeout o error:', err.message)
            })

          } catch (postError) {
            console.warn('⚠️ Error en operaciones post-guardado:', postError)
            // No propagamos el error para no afectar la experiencia del usuario
          }
        })

        return result
      } catch (error) {
        console.error('❌ Error enviando programaciones al servidor:', error)
        this.$toast('Error al guardar programaciones: ' + (error.message || error), 'error')

        // Asegurar que el overlay se cierre en caso de error
        if (showProgress) {
          this.isSaving = false
          this.savingProgress = 0
          this.totalToSave = 0
          this.savedCount = 0
        }

        throw error
      }
    },

    /**
     * Guardar programaciones en lotes
     */
    async saveProgramacionesInBatches(programaciones, batchSize, updateProgress = false) {
      const totalBatches = Math.ceil(programaciones.length / batchSize)

      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, programaciones.length)
        const batch = programaciones.slice(start, end)

        console.log(`📤 Lote ${i + 1}/${totalBatches}: ${batch.length} registros`)

        try {
          await this.saveProgramacionesDirect(batch, false)

          if (updateProgress) {
            this.savedCount += batch.length
            this.savingProgress = Math.round((this.savedCount / this.totalToSave) * 100)
          }

          // Pausa entre lotes
          if (i < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        } catch (error) {
          console.error(`❌ Error en lote ${i + 1}:`, error)
          throw error
        }
      }
    },

    /**
     * Guardar programaciones directamente (llama al store de Pinia)
     */
    async saveProgramacionesDirect(programaciones, updateProgress = false) {
      try {
        // Obtener el store de programaciones directamente
        const programacionSpotsStore = useProgramacionSpotsStore()

        if (!programacionSpotsStore) {
          throw new Error('No se pudo acceder al store de programaciones')
        }

        console.log('💾 Guardando programaciones en el servidor...', programaciones.length)

        // Llamar directamente al store para guardar
        const result = await programacionSpotsStore.saveProgramacionesSpot(programaciones)

        console.log('✅ Programaciones guardadas en servidor:', result)

        if (updateProgress) {
          this.savedCount = programaciones.length
          this.savingProgress = 100
        }

        return result
      } catch (error) {
        console.error('❌ Error guardando programaciones en servidor:', error)
        throw error
      }
    },

    /**
     * Recargar programaciones desde el servidor
     * @param {boolean} emitEvent - Si emitir evento al padre (default: false para evitar doble carga)
     */
    async reloadProgramacionesFromServer(emitEvent = false) {
      try {
        const programacionSpotsStore = useProgramacionSpotsStore()
        const codigoProgramacion = this.getCurrentProgramacionCode()

        if (!programacionSpotsStore || !codigoProgramacion) {
          console.warn('No se puede recargar programaciones: store o código no disponible')
          return
        }

        console.log('🔄 Recargando programaciones para código:', codigoProgramacion)

        await programacionSpotsStore.loadProgramacionesByPrograma(codigoProgramacion, '00:00')

        console.log('✅ Programaciones recargadas correctamente')

        // Solo emitir si se solicita explícitamente (evita doble carga)
        if (emitEvent) {
          this.$emit('refresh-programaciones')
        }
      } catch (error) {
        console.error('❌ Error recargando programaciones:', error)
      }
    },

    // Método para forzar recarga de programaciones (legacy)
    refreshProgramaciones() {
      this.reloadProgramacionesFromServer()
    },

    /**
     * Notifica a los reproductores que hay nuevas programaciones de spots
     * Envía la notificación por SignalR al grupo del reproductor correspondiente
     *
     * @param {Object} options - Opciones de notificación
     * @param {number} options.count - Número de programaciones guardadas
     * @param {Array} options.spots - Lista de spots programados
     * @param {string} options.targetReproductor - Reproductor destino (opcional)
     */
    async notifyReproductoresNewSpots(options = {}) {
      try {
        const { count = 0, spots = [], targetReproductor = null } = options

        // Verificar que SignalR esté conectado
        if (!this.signalR || !this.signalR.isConnected.value) {
          console.warn('[ProgrammingInterface] SignalR no está conectado, no se puede notificar')
          return
        }

        // Obtener información del usuario actual
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const cliente = this.getCliente

        // Preparar datos de la notificación
        const notificationData = {
          type: 'SpotsUpdated',
          action: 'spots_programmed',
          timestamp: new Date().toISOString(),
          // Información del origen
          source: {
            userId: currentUser.unique_name,
            clientId: cliente?.cli_codigo,
            clientName: cliente?.cli_nombre
          },
          // Información de las programaciones
          programaciones: {
            count: count,
            codigoProgramacion: this.codigoProgramacion,
            spots: spots.map(s => ({
              codigo: s.spo_codigo || s.clprsp_codigoSpot,
              nombre: s.spo_nombre || s._spot?.spo_nombre || 'Spot'
            }))
          },
          // Reproductor destino
          targetReproductor: targetReproductor || this.effectiveReproductor || 'Todos'
        }

        console.log('📡 [ProgrammingInterface] Notificando nuevos spots por SignalR:', notificationData)

        // Determinar a quién enviar la notificación
        const reproductor = targetReproductor || this.effectiveReproductor

        if (reproductor && reproductor !== 'Todos') {
          // Enviar al grupo específico del reproductor
          const groupName = `user_${reproductor}`
          const message = JSON.stringify({
            event: 'NotifyNewSpots',
            ...notificationData
          })

          await this.signalR.sendMessageToGroup(groupName, message)
          console.log(`✅ [ProgrammingInterface] Notificación enviada al grupo: ${groupName}`)

          // También invocar el método del hub directamente para mayor compatibilidad
          try {
            await this.signalR.invoke('NotifyNewSpots', groupName, notificationData)
          } catch (invokeError) {
            // El método puede no existir en el hub, ignorar
            console.log('[ProgrammingInterface] Invoke NotifyNewSpots no disponible, usando sendMessageToGroup')
          }
        } else {
          // Enviar a todos los reproductores del cliente
          // Usar el grupo del cliente si existe, o broadcast
          const clienteUsuario = cliente?.cli_usuari
          if (clienteUsuario) {
            const groupName = `user_${clienteUsuario}`
            const message = JSON.stringify({
              event: 'NotifyNewSpots',
              ...notificationData
            })

            await this.signalR.sendMessageToGroup(groupName, message)
            console.log(`✅ [ProgrammingInterface] Notificación enviada al grupo del cliente: ${groupName}`)
          } else {
            // Fallback: enviar a todos
            const message = JSON.stringify({
              event: 'NotifyNewSpots',
              ...notificationData
            })

            await this.signalR.sendMessageToAll(message)
            console.log('✅ [ProgrammingInterface] Notificación enviada a todos')
          }
        }

        this.$toast('Reproductores notificados de las nuevas programaciones', 'info')

      } catch (error) {
        console.error('❌ [ProgrammingInterface] Error notificando por SignalR:', error)
        // No lanzar error para no interrumpir el flujo principal
      }
    },

    // Métodos de paginación
    goToPage(page) {
      if (page === '...') return
      this.currentPage = page
    },

    goToFirstPage() {
      this.currentPage = 1
    },

    goToLastPage() {
      this.currentPage = this.totalPages
    },

    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    handlePageSizeChange() {
      this.currentPage = 1
      localStorage.setItem('programacionesPageSize', this.pageSize)
    },

    resetPagination() {
      // Resetear a la primera página cuando cambian los filtros
      this.currentPage = 1
    },

    // Método de scroll infinito para modal de pendientes
    handlePendingScroll(event) {
      const container = event.target
      const scrollPosition = container.scrollTop + container.clientHeight
      const scrollHeight = container.scrollHeight

      // Cargar más items cuando estamos cerca del final (50px del fondo o 80%)
      const threshold = Math.min(scrollHeight * 0.8, scrollHeight - 50)
      if (scrollPosition >= threshold && this.hasMorePendingItems) {
        this.displayedPendingCount += this.pendingIncrement
      }
    },

    // Métodos para selección de días
    toggleDaySelection(dayValue) {
      const index = this.selectedDays.indexOf(dayValue)
      if (index > -1) {
        this.selectedDays.splice(index, 1)
      } else {
        this.selectedDays.push(dayValue)
      }
      this.selectedDays.sort((a, b) => a - b) // Ordenar los días

      // Emitir evento de cambio de filtros hacia el componente padre
      this.emitFilterChange()
    },

    isDaySelected(dayValue) {
      return this.selectedDays.includes(dayValue)
    },

    getSelectedDaysText() {
      if (this.selectedDays.length === 0) return 'Ninguno'
      if (this.selectedDays.length === 7) return 'Todos los días'

      return this.selectedDays.map(day => this.weekDays.find(d => d.value === day)?.text).join(', ')
    },

    // Método para limpiar todos los filtros
    clearAllFilters() {
      this.selectedReproductor = ''
      this.selectedDays = []
      this.startTime = '06:00'
      this.endTime = '23:00'
      this.filterStartTime = ''
      this.filterEndTime = ''
      this.resetPagination()
      this.selectedProgramaciones = []

      // Emitir evento de filtros limpiados
      this.emitFilterChange()
    },

    // Método para limpiar solo el filtro de horario
    clearTimeFilter() {
      this.filterStartTime = ''
      this.filterEndTime = ''
      this.resetPagination()
    },

    // Emitir evento de cambio de filtros hacia el componente padre
    emitFilterChange() {
      const filterData = {
        reproductor: this.selectedReproductor,
        startTime: this.startTime,
        endTime: this.endTime,
        selectedDays: [...this.selectedDays]
      }
      this.$emit('filter-change', filterData)
    },

    // Cargar configuración del cliente
    async loadClientConfiguration() {
      try {
        this.configLoading = true
        this.clientConfig = await configValidationService.checkConfigurationStatus()
        console.log(
          '[ProgrammingInterface] 📋 Configuración del cliente cargada:',
          this.clientConfig
        )

        // Si hay horario hábil configurado, establecer valores por defecto
        if (this.clientConfig?.details?.horario) {
          const horario = this.clientConfig.details.horario
          if (!this.startTime && horario.cliHor_horaDesde) {
            this.startTime = horario.cliHor_horaDesde.slice(0, 5)
          }
          if (!this.endTime && horario.cliHor_horaHasta) {
            this.endTime = horario.cliHor_horaHasta.slice(0, 5)
          }
        }

        // Si hay días hábiles configurados y no hay días seleccionados, mostrar advertencia
        if (this.clientConfig?.details?.dias && this.clientConfig.details.dias.length > 0) {
          console.log(
            '[ProgrammingInterface] ℹ️ Días hábiles configurados:',
            this.clientConfig.details.dias.map(d => d.cliDha_codigoDia)
          )
        }
      } catch (error) {
        console.error('[ProgrammingInterface] Error cargando configuración del cliente:', error)
      } finally {
        this.configLoading = false
      }
    },

    // Formatear duración de segundos a formato legible (MM:SS o HH:MM:SS)
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      } else {
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
    },

    // Manejar click en slot del calendario
    handleSlotClick(day, timeSlot) {
      const programacion = this.getProgramacionInSlot(day, timeSlot)

      if (programacion) {
        // Si hay programación existente, seleccionarla para edición/eliminación
        this.toggleSelection(programacion)
      } else if (this.selectedSpots.length > 0) {
        // Si no hay nada y hay spots seleccionados, crear programación pendiente
        console.log('Click en slot vacío - funcionalidad de agregar spot pendiente de implementar')
      }
    },

    // Seleccionar programación para edición
    selectProgramacion(programacion) {
      // Buscar si ya está seleccionada
      const index = this.selectedProgramaciones.findIndex(
        p => p.clprsp_codigo === programacion.clprsp_codigo
      )
      if (index === -1) {
        this.selectedProgramaciones.push(programacion)
      }
    },

    // Remover programación existente
    removeProgramacionFromSlot(day, timeSlot) {
      const programacion = this.getProgramacionInSlot(day, timeSlot)
      if (programacion) {
        this.$emit('delete-programaciones', [programacion])
      }
    },

    // ===== MÉTODOS MOVIDOS DESDE COMPUTED (Performance Fix) =====

    // Verificar si un minuto específico está programado (todos los 5 slots ocupados)
    isMinuteProgrammed(minute) {
      if (!this.selectedHourForMultiMinute || this.selectedDays.length === 0) {
        return false
      }

      const hour = parseInt(this.selectedHourForMultiMinute.split(':')[0])
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

      // Contar cuántos slots están ocupados en este horario para los días seleccionados
      const slotsOcupados = this.filteredProgramaciones.filter(
        prog =>
          this.selectedDays.includes(prog.clprsp_numeroDia) &&
          prog.clprsp_horaDesde.slice(0, 5) === timeString
      ).length

      // Marcar como programado si ya hay 5 slots ocupados (máximo permitido)
      return (slotsOcupados/this.selectedDays.length) >= 5
    },

    // Obtener número de slots disponibles para un minuto específico
    getSlotsDisponiblesEnMinuto(minute,day) {
      let programaciones = this.filteredProgramaciones
      if (!this.selectedHourForMultiMinute || this.selectedDays.length === 0) {
        return 5
      }

      const hour = parseInt(this.selectedHourForMultiMinute.split(':')[0])
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`

      // Contar slots ocupados
      let slotsOcupadosPerDay = programaciones.filter(
        prog =>
          prog.clprsp_numeroDia===day &&
          prog.clprsp_horaDesde === timeString
        ).length
      
      
      return Math.max(0, 5 - slotsOcupadosPerDay)
    },

    // Verificar si un minuto está seleccionado
    isMinuteSelected(minute) {
      return this.selectedMinutes.includes(minute)
    },

    // Verificar si un día es fin de semana
    isWeekend(dayValue) {
      return dayValue === 0 || dayValue === 6
    },

    // Verificar si es la hora actual
    isCurrentHour(timeSlot) {
      const now = new Date()
      const currentHour =
        now.getHours().toString().padStart(2, '0') +
        ':' +
        now.getMinutes().toString().padStart(2, '0')
      return timeSlot.value === currentHour
    },

    // ===== FIN DE MÉTODOS MOVIDOS =====

    // Método de debug para verificar el estado del calendario
    debugCalendar() {
      const debugInfo = {
        hasChanges: this.hasChanges,
        calendarHasSpots: this.calendarHasSpots,
        calendarData: this.calendarData,
        selectedSpots: this.selectedSpots,
        selectedReproductor: this.selectedReproductor,
        selectedDays: this.selectedDays,
        startTime: this.startTime,
        endTime: this.endTime,
        codigoProgramacion: this.getCurrentProgramacionCode(),
        canSaveProgramacion: this.canSaveProgramacion,
        totalDuration: this.totalDuration,
        spotsCount: this.selectedSpots.length,
        maxSpotsAllowed: this.maxSpotsAllowed,
        exceedsSpotLimit: this.exceedsSpotLimit,
        hasActiveFilters: this.hasActiveFilters,
        activeFiltersCount: this.activeFiltersCount,
        user: JSON.parse(localStorage.getItem('user') || '{}'),
        localStorageProgSpot: localStorage.getItem('listProgSpot'),
        // Información de filtros del usuario
        userSelectedDays: this.selectedDays,
        userSelectedReproductor: this.selectedReproductor,
        userTimeRange: `${this.startTime} - ${this.endTime}`
      }

      console.log('=== DEBUG INFO CALENDARIO ===')
      console.table(debugInfo)
      console.log('Datos del calendario:', this.calendarData)

      this.$buefy.toast.open({
        message: 'Información de debug enviada a consola',
        type: 'is-info',
        duration: 3000
      })
    }
  }
}
</script>

<style scoped>
/* Table Container - Scrollable */
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

/* Fade Transition - Optimizado para evitar bloqueo de render */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease-out;
  will-change: opacity;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Spinner animation - GPU accelerated */
.fa-spin {
  animation: fa-spin 1s linear infinite;
  will-change: transform;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Spot Cards Styles */
.spot-card {
  @apply relative;
}

.spot-card:hover:not(.opacity-50) {
  transform: translateY(-2px);
}

.spot-card.border-primary-500 {
  box-shadow: 0 0 0 1px rgba(var(--color-primary-500), 0.3);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar for modal */
.max-h-\[50vh\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[50vh\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[50vh\]::-webkit-scrollbar-thumb {
  background: var(--color-dark-border);
  border-radius: 3px;
}

.max-h-\[50vh\]::-webkit-scrollbar-thumb:hover {
  background: var(--color-dark-hover);
}
</style>

