<template>
  <div class="programming-interface">
    <!-- Alerta de programación no seleccionada -->
    <div v-if="!codigoProgramacion" class="alert-no-programacion">
      <i class="fa fa-exclamation-triangle"></i>
      <div class="alert-content">
        <h4>No hay programación seleccionada</h4>
        <p>Debes seleccionar o crear una programación antes de poder programar spots.</p>
      </div>
    </div>

    <!-- Panel de programación -->
    <div class="programming-panel">
      <div class="panel-header">
        <h3 class="panel-title">Programar Spots</h3>
      </div>

      <!-- Selector de spots -->
      <div class="form-section">
        <div class="spots-selector">
          <div class="selected-spots">
            <span v-for="spot in selectedSpots" :key="spot.spo_codigo" class="selected-spot-tag">
              {{ spot.spo_nombre }}
              <button @click="removeSpot(spot)" class="remove-spot-btn" aria-label="Remover spot">
                ×
              </button>
            </span>
          </div>

          <!-- Indicador de spots seleccionados -->
          <div class="spots-counter" :class="{ 'exceeds-limit': exceedsSpotLimit }">
            <div class="counter-info">
              <div class="counter-label">
                <i class="fa fa-list"></i>
                Spots Seleccionados:
              </div>
              <div class="counter-values">
                <span class="current-spots">{{ selectedSpots.length }}</span>
                <span class="counter-separator">/</span>
                <span class="spots-limit">{{ maxSpotsAllowed }}</span>
              </div>
            </div>
            <div class="remaining-spots" v-if="!exceedsSpotLimit">
              <small class="remaining-text">
                <i class="fa fa-check-circle"></i>
                Puedes agregar {{ remainingSpots }} spot{{ remainingSpots !== 1 ? 's' : '' }} más
              </small>
            </div>
            <div class="limit-warning" v-if="exceedsSpotLimit">
              <small class="warning-text">
                <i class="fa fa-exclamation-triangle"></i>
                Límite de spots alcanzado
              </small>
            </div>
          </div>

          <div class="spots-dropdown-container">
            <input
              ref="spotInput"
              v-model="spotSearch"
              @input="filterSpots"
              @focus="showSpotsDropdown = true"
              @blur="hideSpotsDropdown"
              class="form-input"
              placeholder="Buscar y seleccionar spots..."
              aria-label="Buscar spots"
            />

            <div
              v-if="showSpotsDropdown && (filteredSpots.length > 0 || spotSearch)"
              class="spots-dropdown"
              role="listbox"
            >
              <div v-for="group in groupedSpotsArray" :key="group.category" class="category-group">
                <div class="category-header">
                  <span class="category-label" :class="`category-${group.variant}`">
                    {{ group.label }}
                  </span>
                  <span class="category-count">({{ group.spots.length }})</span>
                </div>
                <div
                  v-for="spot in group.spots"
                  :key="spot.spo_codigo"
                  @mousedown.prevent="addSpot(spot)"
                  class="dropdown-item"
                  role="option"
                  :aria-selected="isSpotSelected(spot)"
                >
                  <span class="spot-name">{{ spot.spo_nombre }}</span>
                  <span class="spot-category-badge" :class="`category-${group.variant}`">
                    {{ group.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-section">
          <label class="form-label">
            Reproductor
            <span
              v-if="isReproductor"
              class="badge badge-info"
              style="margin-left: 8px; font-size: 0.75rem"
              >Bloqueado</span
            >
          </label>
          <select
            v-model="selectedReproductor"
            class="form-select"
            aria-label="Seleccionar reproductor"
            :disabled="isReproductor"
            :class="{ 'disabled-field': isReproductor }"
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
          <small v-if="isReproductor" class="field-help-text">
            <i class="fa fa-info-circle" />
            Como reproductor solo se puede programar para si mismo
          </small>
        </div>
        <!-- Configuración de días de la semana -->
        <div class="form-section">
          <label class="form-label">
            Días de la Semana
            <span
              v-if="diasHabiles.length > 0"
              class="badge badge-info"
              style="margin-left: 8px; font-size: 0.75rem"
            >
              Días hábiles de tu comercio
            </span>
          </label>
          <div class="days-selector">
            <div
              v-for="day in weekDays"
              :key="day.value"
              @click="toggleDaySelection(day.value)"
              class="day-option"
              :class="{
                selected: isDaySelected(day.value),
                'invalid-day': !day.isHabil && diasHabiles.length > 0,
                disabled: !day.isHabil && diasHabiles.length > 0
              }"
              :title="
                !day.isHabil && diasHabiles.length > 0
                  ? 'Día no hábil según configuración del cliente'
                  : ''
              "
            >
              <input
                type="checkbox"
                :checked="isDaySelected(day.value)"
                :disabled="!day.isHabil && diasHabiles.length > 0"
                class="day-checkbox"
              />
              <span class="day-label">{{ day.text }}</span>
              <i
                v-if="!day.isHabil && diasHabiles.length > 0"
                class="fa fa-ban"
                style="margin-left: 4px; font-size: 0.75rem; opacity: 0.7"
              ></i>
            </div>
          </div>
          <div class="selected-days-summary" v-if="selectedDays.length > 0">
            <small class="text-muted"> Días seleccionados: {{ getSelectedDaysText() }} </small>
          </div>
          <!-- Advertencia de días inválidos -->
          <div v-if="hasInvalidDays" class="config-validation-warning">
            <i class="fa fa-exclamation-triangle"></i>
            <span>
              Has seleccionado días no hábiles:
              <strong>{{ invalidSelectedDays.map(d => getWeekDayName(d)).join(', ') }}</strong
              >. Por favor, selecciona solo días hábiles configurados.
            </span>
          </div>
        </div>

        <!-- Selector de Múltiples Minutos en Hora Específica -->
        <div class="form-section multi-minute-section">
          <div class="section-header">
            <label class="form-label">
              <i class="fa fa-clock-o"></i>
              Programar Múltiples Minutos
            </label>
            <button
              @click="showMultiMinuteSelector = !showMultiMinuteSelector"
              class="btn-toggle"
              :class="{ active: showMultiMinuteSelector }"
            >
              <i
                class="fa"
                :class="showMultiMinuteSelector ? 'fa-chevron-up' : 'fa-chevron-down'"
              ></i>
              {{ showMultiMinuteSelector ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>

          <p class="section-description" v-if="!showMultiMinuteSelector">
            Selecciona una hora específica y múltiples minutos para programar spots.
          </p>

          <div v-if="showMultiMinuteSelector" class="multi-minute-content">
            <!-- Selector de Hora (usa los días seleccionados globalmente) -->
            <div class="hour-day-selector">
              <div class="input-group full-width">
                <label for="multiMinuteHour" class="input-label">Hora:</label>
                <select
                  id="multiMinuteHour"
                  v-model="selectedHourForMultiMinute"
                  class="form-select"
                  @change="onDayHourChange"
                >
                  <option value="">Selecciona una hora</option>
                  <option
                    v-for="hour in 24"
                    :key="hour - 1"
                    :value="`${(hour - 1).toString().padStart(2, '0')}:00`"
                  >
                    {{ (hour - 1).toString().padStart(2, '0') }}:00
                  </option>
                </select>
              </div>
            </div>

            <!-- Información de días seleccionados -->
            <div v-if="selectedDays.length > 0" class="selected-days-info">
              <i class="fa fa-calendar"></i>
              <span
                >Se programará en: <strong>{{ getSelectedDaysText() }}</strong></span
              >
            </div>

            <!-- Grid de Minutos -->
            <div
              v-if="selectedHourForMultiMinute && selectedDays.length > 0"
              class="minutes-selector"
            >
              <div class="minutes-header">
                <span class="minutes-title">Minutos disponibles:</span>
                <div class="minutes-stats">
                  <span class="stat-item">
                    <i class="fa fa-check-circle"></i>
                    Disponibles: <strong>{{ availableMinutesCount }}</strong>
                  </span>
                  <span class="stat-item">
                    <i class="fa fa-calendar-check-o"></i>
                    Seleccionados: <strong>{{ selectedMinutesCount }}</strong>
                  </span>
                </div>
              </div>

              <!-- Grid de minutos -->
              <div class="minutes-grid">
                <div
                  v-for="minute in availableMinutesInHour"
                  :key="minute"
                  class="minute-option"
                  :class="{
                    programmed: isMinuteProgrammed(minute),
                    selected: isMinuteSelected(minute),
                    available: !isMinuteProgrammed(minute),
                    partial: !isMinuteProgrammed(minute) 
                  }"
                  
                  @click="toggleMinuteSelection(minute)"
                >
                  <span class="minute-value">:{{ minute.toString().padStart(2, '0') }}</span>
                
                  <i v-if="isMinuteProgrammed(minute)" class="fa fa-ban minute-icon" />
                  <i v-else-if="isMinuteSelected(minute)" class="fa fa-check-circle minute-icon" />
                </div>
              </div>

              <!-- Controles de selección -->
              <div class="minutes-controls">
                <button
                  class="btn btn-outline btn-sm"
                  :disabled="availableMinutesCount === 0"
                  @click="selectAllAvailableMinutes"
                >
                  <i class="fa fa-check-square-o"></i>
                  Seleccionar Todos Disponibles
                </button>
                <button
                  @click="clearMinuteSelection"
                  class="btn btn-outline btn-sm"
                  :disabled="selectedMinutesCount === 0"
                >
                  <i class="fa fa-times"></i>
                  Limpiar Selección
                </button>
              </div>

              <!-- Preview de programaciones -->
              <div v-if="selectedMinutesCount > 0" class="minutes-preview">
                <div class="preview-header">
                  <i class="fa fa-eye"></i>
                  <span>Vista previa</span>
                </div>
                <p class="preview-text">
                  Se programarán <strong>{{ selectedSpots.length }}</strong> spot(s) en
                  <strong>{{ selectedMinutesCount }}</strong> minuto(s) para
                  <strong>{{ selectedDays.length }}</strong> día(s) seleccionado(s) (<strong>{{
                    getSelectedDaysText()
                  }}</strong
                  >) a las <strong>{{ selectedHourForMultiMinute }}</strong
                  >.
                </p>
                <p class="preview-total">
                  <i class="fa fa-calculator"></i>
                  Total de programaciones:
                  <strong>{{ selectedMinutesCount * selectedDays.length }}</strong>
                </p>
                <div class="preview-times">
                  <span
                    v-for="minute in selectedMinutes.slice(0, 6)"
                    :key="minute"
                    class="time-badge"
                  >
                    {{ selectedHourForMultiMinute.split(':')[0] }}:{{
                      minute.toString().padStart(2, '0')
                    }}
                  </span>
                  <span v-if="selectedMinutesCount > 6" class="time-badge more">
                    +{{ selectedMinutesCount - 6 }} más
                  </span>
                </div>
              </div>

              <!-- Botón de programar -->
              <button
                @click="programSelectedMinutes"
                :disabled="!canProgramSelectedMinutes"
                class="btn btn-primary btn-program-minutes"
              >
                <i class="fa fa-calendar-plus-o"></i>
                Programar {{ selectedMinutesCount }} Minuto(s)
              </button>
            </div>

            <!-- Mensaje cuando no hay día/hora seleccionados -->
            <div v-else class="empty-state">
              <i class="fa fa-hand-pointer-o"></i>
              <p v-if="selectedDays.length === 0">
                Primero selecciona al menos un día en los filtros globales
              </p>
              <p v-else>Selecciona una hora para ver los minutos disponibles</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen de configuración actual -->

      <!-- Botón Flotante para Programaciones Pendientes -->
      <button
        v-if="pendingProgramaciones.length > 0"
        @click="showPendingModal = true"
        class="floating-pending-btn"
        :class="{ pulse: pendingProgramaciones.length > 0 }"
      >
        <div class="floating-btn-content">
          <i class="fa fa-clock-o"></i>
          <span class="floating-btn-count">{{ pendingProgramaciones.length }}</span>
        </div>
        <span class="floating-btn-label">Pendientes</span>
      </button>
    </div>

    <!-- Modal de Programaciones Pendientes -->
    <Modal v-model="showPendingModal" size="lg" :closable="true">
      <template #header>
        <div class="modal-title-group">
          <i class="fa fa-clock-o"></i>
          <h3 class="modal-title">Programaciones Pendientes</h3>
          <span class="pending-badge">{{ pendingProgramaciones.length }}</span>
        </div>
      </template>

      <template #default>
        <div v-if="pendingProgramaciones.length > 0">
          <div class="pending-alert">
            <i class="fa fa-info-circle"></i>
            <div class="alert-content">
              <p>Las programaciones se guardarán en el servidor al confirmar.</p>
            </div>
          </div>

          <!-- Resumen de programaciones pendientes -->
          <div class="pending-stats">
            <div class="stat-card">
              <i class="fa fa-calendar-check-o"></i>
              <div class="stat-info">
                <span class="stat-value">{{ getPendingDaysCount() }}</span>
                <span class="stat-label">Días</span>
              </div>
            </div>
            <div class="stat-card">
              <i class="fa fa-music"></i>
              <div class="stat-info">
                <span class="stat-value">{{ getPendingSpotsCount() }}</span>
                <span class="stat-label">Spots únicos</span>
              </div>
            </div>
            <div class="stat-card">
              <i class="fa fa-list"></i>
              <div class="stat-info">
                <span class="stat-value">{{ pendingProgramaciones.length }}</span>
                <span class="stat-label">Programaciones</span>
              </div>
            </div>
          </div>

          <!-- Lista de programaciones pendientes -->
          <div class="pending-list-container">
            <h4 class="list-title">
              <i class="fa fa-list-ul"></i>
              Todas las programaciones ({{ pendingProgramaciones.length }})
            </h4>
            <div class="pending-list-scroll" @scroll="handlePendingScroll">
              <div
                v-for="(prog, index) in displayedPendingProgramaciones"
                :key="`pending-${index}`"
                class="pending-item-card"
              >
                <div class="item-index">{{ index + 1 }}</div>
                <div class="item-details">
                  <span class="item-day">{{ getWeekDayName(prog.clprsp_numeroDia) }}</span>
                  <span class="item-time">
                    <i class="fa fa-clock-o"></i>
                    {{ prog.clprsp_horaDesde.slice(0, 5) }}
                  </span>
                  <span class="item-slot" v-if="prog.clprsp_orden">
                    <i class="fa fa-layer-group"></i>
                    Slot {{ prog.clprsp_orden }}
                  </span>
                </div>
                <div class="item-spot">{{ prog._spot?.spo_nombre || 'Spot' }}</div>
              </div>

              <!-- Indicador de carga de más items pendientes -->
              <div v-if="hasMorePendingItems" class="pending-scroll-loader">
                <div class="loader-spinner"></div>
                <span>Cargando más programaciones...</span>
              </div>

              <!-- Mensaje cuando se han cargado todos los items pendientes -->
              <div v-else-if="pendingProgramaciones.length > 0" class="pending-scroll-end-message">
                <i class="fa fa-check-circle"></i>
                <span>Has visto todas las {{ pendingProgramaciones.length }} programaciones pendientes</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button
          @click="
            clearPendingProgramaciones();
            showPendingModal = false
          "
          class="btn btn-outline"
        >
          <i class="fa fa-trash"></i>
          Limpiar Todo
        </button>
        <button
          @click="
            openConfirmModal();
            showPendingModal = false
          "
          class="btn btn-primary"
          :disabled="isSaving || !codigoProgramacion"
        >
          <i class="fa fa-check"></i>
          Confirmar y Guardar ({{ pendingProgramaciones.length }})
        </button>
      </template>
    </Modal>

    <!-- Modal de filtros y configuración -->
    <Modal v-model="showFiltersModal" size="md" :closable="true">
      <template #header>
        <div class="modal-title-group">
          <i class="fa fa-cog"></i>
          <h3>Configuración de Programación</h3>
        </div>
      </template>

      <template #default>
        <div>
          <!-- Configuración de reproductor -->

          <!-- Acciones del calendario -->
          <!-- <div class="form-section">
            <div class="calendar-actions">
              <button
                @click="showCalendar = true"
                class="btn btn-outline"
                aria-label="Ver calendario semanal"
              >
                <i class="fa fa-calendar"></i>
                Ver Calendario
              </button>
              <button
                @click="showCalendar = false"
                class="btn btn-outline"
                aria-label="Ver programaciones activas"
              >
                <i class="fa fa-list"></i>
                Ver Lista
              </button>
            </div>
          </div> -->
        </div>
      </template>

      <template #footer>
        <button
          @click="clearAllFilters"
          class="btn btn-outline"
          aria-label="Limpiar todos los filtros"
        >
          <i class="fa fa-trash"></i>
          Limpiar Filtros
        </button>
        <div class="modal-actions-right">
          <button @click="showFiltersModal = false" class="btn btn-outline" aria-label="Cancelar">
            Cancelar
          </button>
          <button
            @click="showFiltersModal = false"
            class="btn btn-primary"
            aria-label="Aplicar configuración"
          >
            <i class="fa fa-check"></i>
            Aplicar
          </button>
        </div>
      </template>
    </Modal>

    <!-- Programaciones existentes -->
    <div class="programming-results">
      <div class="results-header">
        <h3 class="results-title">Programaciones Publicitarias</h3>
        <div v-if="hasActiveFilters" class="active-filters">
          <div class="filters-summary">
            <i class="fa fa-filter"></i>
            <span class="filters-count"
              >{{ activeFiltersCount }} filtro{{ activeFiltersCount > 1 ? 's' : '' }} activo{{
                activeFiltersCount > 1 ? 's' : ''
              }}</span
            >
          </div>
          <button @click="clearAllFilters" class="btn btn-outline btn-sm clear-filters-btn">
            <i class="fa fa-times"></i>
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Sección de filtros -->
      <div class="filters-section">
        <div class="filters-container">
          <div class="filter-group">
            <label class="filter-label">
              <i class="fa fa-clock-o"></i>
              Filtrar por Rango Horario
            </label>
            <div class="time-range-filter">
              <div class="time-input-wrapper">
                <label class="time-label">Desde:</label>
                <input
                  v-model="filterStartTime"
                  type="time"
                  class="time-input"
                  placeholder="HH:MM"
                  aria-label="Hora de inicio del filtro"
                />
              </div>
              <span class="time-separator">—</span>
              <div class="time-input-wrapper">
                <label class="time-label">Hasta:</label>
                <input
                  v-model="filterEndTime"
                  type="time"
                  class="time-input"
                  placeholder="HH:MM"
                  aria-label="Hora de fin del filtro"
                />
              </div>
              <button
                v-if="filterStartTime || filterEndTime"
                @click="clearTimeFilter"
                class="btn-clear-time"
                aria-label="Limpiar filtro de horario"
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
            <small v-if="filterStartTime && filterEndTime" class="filter-hint">
              <i class="fa fa-info-circle"></i>
              Mostrando programaciones entre {{ filterStartTime }} y {{ filterEndTime }}
            </small>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay programaciones -->
      <div v-if="filteredProgramaciones.length === 0" class="no-results">
        <div class="no-results-icon">
          <i class="fa fa-calendar-times-o" style="font-size: 3rem; color: #6b7280"></i>
        </div>
        <div class="no-results-text">
          No hay programaciones
          {{ hasActiveFilters ? 'que coincidan con los filtros' : 'disponibles' }}
        </div>
        <div class="no-results-hint">
          <span v-if="hasActiveFilters">
            Intenta ajustar los filtros o
            <button @click="clearAllFilters" class="btn-link">limpiar todos los filtros</button>
          </span>
          <span v-else> Comienza creando una programación usando el panel superior </span>
        </div>
      </div>

      <div v-else class="table-container" ref="tableContainer" @scroll="handleScroll">
        <table class="tabla-categorias" role="table" aria-label="Programaciones activas">
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  aria-label="Seleccionar todas las programaciones"
                />
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
              :class="{ 'is-selected': isSelected(programacion) }"
              @click="toggleSelection(programacion)"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="isSelected(programacion)"
                  @change="toggleSelection(programacion)"
                  aria-label="Seleccionar programación"
                />
              </td>
              <td>
                <div class="programacion-datetime">
                  <span class="badge badge-dark">
                    {{ getDayName(programacion.clprsp_numeroDia) }}
                  </span>
                  <span class="programacion-time">
                    <i class="fa fa-clock-o"></i>
                    {{
                      programacion.clprsp_horaDesde ? programacion.clprsp_horaDesde.slice(0, 5) : ''
                    }}
                  </span>
                </div>
              </td>
              <td>
                <span class="badge badge-slot" :class="getSlotClass(programacion.clprsp_orden)">
                  <i class="fa fa-layer-group"></i>
                  Slot {{ programacion.clprsp_orden || 0 }}
                </span>
              </td>
              <td>
                <div class="spot-info">
                  <span class="spot-name">{{ programacion.spo_nombre }}</span>
                </div>
              </td>
              <td>
                <span :class="`badge badge-${getCategoryVariant(programacion.spo_tipo)}`">
                  {{ getCategoryLabel(programacion.spo_tipo) }}
                </span>
              </td>
              <td>
                <span class="badge badge-outline">
                  {{ getTargetName(programacion.clprsp_usuario) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Indicador de carga de más items -->
        <div v-if="hasMoreItems" class="scroll-loader">
          <div class="loader-spinner"></div>
          <span>Cargando más programaciones...</span>
        </div>

        <!-- Mensaje cuando se han cargado todos los items -->
        <div v-else-if="filteredProgramaciones.length > 0" class="scroll-end-message">
          <i class="fa fa-check-circle"></i>
          <span>Has visto todas las {{ filteredProgramaciones.length }} programaciones</span>
        </div>
      </div>

      <div v-if="selectedProgramaciones.length > 0" class="bulk-actions">
        <button
          @click="deleteSelectedProgramaciones"
          class="btn btn-danger btn-sm"
          aria-label="Eliminar programaciones seleccionadas"
        >
          <i class="icon delete"></i>
          Eliminar Programación
        </button>
      </div>
    </div>

    <!-- Mensaje cuando no hay resultados -->
    <div v-if="spotSearch && filteredSpots.length === 0" class="no-results">
      <div class="no-results-icon">🔍</div>
      <div class="no-results-text">No se encontraron spots para "{{ spotSearch }}"</div>
      <div class="no-results-hint">Intenta con otros términos de búsqueda</div>
    </div>

    <!-- Modal de Confirmación de Guardado -->
    <Modal v-model="showConfirmModal" size="md" :closable="true" @close="closeConfirmModal">
      <template #header>
        <div class="modal-title-group">
          <i class="fa fa-question-circle"></i>
          <h3>Confirmar Guardado de Programaciones</h3>
        </div>
      </template>

      <template #default>
        <div class="confirm-info">
          <i class="fa fa-info-circle"></i>
          <p>
            Estás a punto de guardar <strong>{{ pendingProgramaciones.length }}</strong>
            programación(es) en el servidor.
          </p>
        </div>


        <div class="confirm-summary">
          <div class="summary-row">
            <span class="summary-label">Total de programaciones:</span>
            <span class="summary-value">{{ pendingProgramaciones.length }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Días involucrados:</span>
            <span class="summary-value">{{ getPendingDaysCount() }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Spots únicos:</span>
            <span class="summary-value">{{ getPendingSpotsCount() }}</span>
          </div>
        </div>
      </template>

      <template #footer>
        <button @click="closeConfirmModal" class="btn btn-outline">
          <i class="fa fa-times"></i>
          Cancelar
        </button>
        <button @click="confirmAndSaveProgramaciones" class="btn btn-primary">
          <i class="fa fa-check"></i>
          Confirmar y Guardar
        </button>
      </template>
    </Modal>

    <!-- Indicador de Progreso de Guardado -->
    <div v-if="isSaving" class="saving-overlay">
      <div class="saving-container">
        <div class="saving-header">
          <i class="fa fa-spinner fa-spin"></i>
          <h3>Guardando Programaciones...</h3>
        </div>

        <div class="saving-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: savingProgress + '%' }"></div>
          </div>
          <div class="progress-text">
            <span class="progress-percentage">{{ savingProgress }}%</span>
            <span class="progress-count">{{ savedCount }} / {{ totalToSave }}</span>
          </div>
        </div>

        <div class="saving-info">
          <i class="fa fa-info-circle"></i>
          <p>Guardando programaciones... Por favor espera.</p>
        </div>
      </div>
    </div>
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
      // Propiedades de scroll infinito
      displayedItemsCount: 20, // Número inicial de items a mostrar
      itemsIncrement: 20, // Cuántos items cargar cada vez
      // Propiedades de scroll infinito para modal pendientes
      displayedPendingCount: 20, // Número inicial de items pendientes a mostrar
      pendingIncrement: 20, // Cuántos items pendientes cargar cada vez
      // Filtros de visualización de programaciones
      filterStartTime: '',
      filterEndTime: '',
      // Propiedades para programación de múltiples minutos en una hora específica
      showMultiMinuteSelector: false,
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
      configLoading: false
    }
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
      this.resetDisplayedItems()

      // Emitir evento de cambio de filtros
      this.emitFilterChange()
    },
    selectedDays: {
      handler() {
        // Limpiar selección al cambiar días seleccionados
        this.selectedProgramaciones = []
        this.resetDisplayedItems()

        // Emitir evento de cambio de filtros
        this.emitFilterChange()
      },
      deep: true
    },
    startTime() {
      // Limpiar selección al cambiar rango horario
      this.selectedProgramaciones = []
      this.resetDisplayedItems()

      // Emitir evento de cambio de filtros
      this.emitFilterChange()
    },
    endTime() {
      // Limpiar selección al cambiar rango horario
      this.selectedProgramaciones = []
      this.resetDisplayedItems()

      // Emitir evento de cambio de filtros
      this.emitFilterChange()
    },
    filterStartTime() {
      // Resetear scroll al cambiar filtro de inicio
      this.resetDisplayedItems()
    },
    filterEndTime() {
      // Resetear scroll al cambiar filtro de fin
      this.resetDisplayedItems()
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

    // Programaciones visibles según scroll infinito
    displayedProgramaciones() {
      return this.filteredProgramaciones.slice(0, this.displayedItemsCount)
    },

    // Verificar si hay más items para cargar
    hasMoreItems() {
      return this.displayedItemsCount < this.filteredProgramaciones.length
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
      this.showConfirmModal = true
    },

    // Cerrar modal de confirmación
    closeConfirmModal() {
      this.showConfirmModal = false
    },

    // Limpiar todas las programaciones pendientes
    clearPendingProgramaciones() {
      this.pendingProgramaciones = []
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
      this.spotSearch = ''
      this.showSpotsDropdown = false
      this.$refs.spotInput.focus()
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
        }

        // Recargar programaciones desde el servidor para ver los cambios
        console.log('🔄 Recargando programaciones desde el servidor...')
        await this.reloadProgramacionesFromServer()

        // ===== NOTIFICAR A REPRODUCTORES POR SIGNALR =====
        // Enviar notificación para que actualicen sus spots
        console.log('📡 Notificando a reproductores por SignalR...')
        await this.notifyReproductoresNewSpots({
          count: normalizedProgramaciones.length,
          spots: programaciones, // Usar las programaciones originales que tienen info de spots
          targetReproductor: this.effectiveReproductor
        })

        // Notificar éxito
        this.$toast(
          `✅ ${normalizedProgramaciones.length} programación(es) guardada(s) exitosamente`,
          'success'
        )

        return result
      } catch (error) {
        console.error('❌ Error enviando programaciones al servidor:', error)
        this.$toast('Error al guardar programaciones: ' + (error.message || error), 'error')
        throw error
      } finally {
        if (showProgress) {
          this.isSaving = false
          this.savingProgress = 0
          this.totalToSave = 0
          this.savedCount = 0
        }
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
     */
    async reloadProgramacionesFromServer() {
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

        // Emitir evento para que el padre también se entere del refresh
        this.$emit('refresh-programaciones')
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

    // Método de scroll infinito
    handleScroll(event) {
      const container = event.target
      const scrollPosition = container.scrollTop + container.clientHeight
      const scrollHeight = container.scrollHeight

      // Cargar más items cuando estamos cerca del final (90% del scroll)
      if (scrollPosition >= scrollHeight * 0.9 && this.hasMoreItems) {
        this.loadMoreItems()
      }
    },

    loadMoreItems() {
      // Incrementar el número de items mostrados
      this.displayedItemsCount += this.itemsIncrement
    },

    resetDisplayedItems() {
      // Resetear a la cantidad inicial cuando cambian los filtros
      this.displayedItemsCount = 20
    },

    // Método de scroll infinito para modal de pendientes
    handlePendingScroll(event) {
      const container = event.target
      const scrollPosition = container.scrollTop + container.clientHeight
      const scrollHeight = container.scrollHeight

      // Cargar más items cuando estamos cerca del final (90% del scroll)
      if (scrollPosition >= scrollHeight * 0.9 && this.hasMorePendingItems) {
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
      this.resetDisplayedItems()
      this.selectedProgramaciones = []

      // Emitir evento de filtros limpiados
      this.emitFilterChange()
    },

    // Método para limpiar solo el filtro de horario
    clearTimeFilter() {
      this.filterStartTime = ''
      this.filterEndTime = ''
      this.resetDisplayedItems()
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
  }
}
</script>

<style scoped>
/* ===== PREMIUM PROGRAMMING INTERFACE ===== */

.programming-interface {
  min-height: 100vh;
  padding: var(--spacing-6);
  background: linear-gradient(135deg, #0f1419 0%, #1a1d24 100%);
}

/* ===== ALERT NO PROGRAMACION ===== */
.alert-no-programacion {
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-8);
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  margin-bottom: var(--spacing-6);
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.2);
}

.alert-no-programacion i {
  font-size: 3rem;
  color: #f87171;
  filter: drop-shadow(0 0 10px rgba(248, 113, 113, 0.5));
}

.alert-content h4 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f87171;
}

.alert-content p {
  margin: 0;
  color: #9ca3af;
}

/* ===== PROGRAMMING PANEL ===== */
.programming-panel {
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-6);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.panel-header {
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), transparent);
}

.panel-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ===== FORM SECTIONS ===== */
.form-section {
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.form-section:last-child {
  border-bottom: none;
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
  font-size: 0.8125rem;
  font-weight: 600;
  color: #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-label i {
  color: #60a5fa;
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--spacing-4) var(--spacing-5);
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  font-size: 0.875rem;
  color: #e5e7eb;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  outline: none;
}

.form-input::placeholder {
  color: #6b7280;
}

.form-input:focus,
.form-select:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2360a5fa' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 3rem;
}

/* ===== SPOTS SELECTOR ===== */
.spots-selector {
  margin-bottom: var(--spacing-4);
}

.selected-spots {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.selected-spot-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-lg);
  color: #60a5fa;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.selected-spot-tag:hover {
  background: rgba(59, 130, 246, 0.25);
  transform: translateY(-2px);
}

.remove-spot-btn {
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.remove-spot-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
  transform: rotate(90deg);
}

/* ===== SPOTS COUNTER ===== */
.spots-counter {
  padding: var(--spacing-4);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-4);
}

.spots-counter.exceeds-limit {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.counter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

.counter-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
}

.counter-values {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 1.5rem;
  font-weight: 700;
}

.current-spots {
  color: #60a5fa;
}

.counter-separator {
  color: #6b7280;
}

.spots-limit {
  color: #9ca3af;
}

.exceeds-limit .current-spots {
  color: #f87171;
}

.remaining-spots,
.limit-warning {
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.remaining-text {
  color: #6b7280;
}

.warning-text {
  color: #f87171;
  font-weight: 600;
}

/* ===== SPOTS DROPDOWN ===== */
.spots-dropdown-container {
  position: relative;
}

.spots-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-2));
  left: 0;
  right: 0;
  background: rgba(26, 26, 26, 0.98);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-xl);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
  animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-group {
  padding: var(--spacing-3);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  margin-bottom: var(--spacing-2);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.category-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-inst {
  color: #60a5fa;
}
.category-prom {
  color: #a78bfa;
}
.category-noti {
  color: #34d399;
}

.category-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.dropdown-item {
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: var(--radius-md);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: var(--spacing-1);
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.spot-name {
  color: #e5e7eb;
  font-weight: 500;
}

.spot-category-badge {
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.spot-category-badge.category-inst {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.spot-category-badge.category-prom {
  background: rgba(167, 139, 250, 0.15);
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.3);
}

.spot-category-badge.category-noti {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
}

/* ===== DAYS SELECTOR ===== */
.days-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.day-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.day-option:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.day-option.selected {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.day-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.day-label {
  font-weight: 500;
  color: #e5e7eb;
  cursor: pointer;
  user-select: none;
}

.selected-days-summary {
  margin-top: var(--spacing-2);
}

.text-muted {
  color: #6b7280;
  font-size: 0.875rem;
}

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  outline: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.btn-outline {
  background: transparent;
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-link {
  background: none;
  border: none;
  color: #60a5fa;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.btn-link:hover {
  color: #93c5fd;
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: 0.8125rem;
}

.btn-generate {
  width: 100%;
  padding: var(--spacing-4);
  font-size: 1rem;
}

/* ===== TABLES ===== */
.programming-results {
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-2xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.results-header {
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), transparent);
}

.results-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
}

/* ===== FILTERS SECTION ===== */
.filters-section {
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-label i {
  color: #60a5fa;
  font-size: 1rem;
}

.time-range-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.time-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.time-label {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
  min-width: 50px;
}

.time-input {
  padding: var(--spacing-3) var(--spacing-4);
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  color: #e5e7eb;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  outline: none;
  min-width: 120px;
}

.time-input:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.time-separator {
  color: #6b7280;
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0 var(--spacing-2);
}

.btn-clear-time {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
  color: #f87171;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.btn-clear-time:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  transform: scale(1.05);
}

.btn-clear-time i {
  font-size: 1rem;
}

.filter-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: #6b7280;
  font-size: 0.8125rem;
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(59, 130, 246, 0.05);
  border-left: 3px solid rgba(59, 130, 246, 0.4);
  border-radius: var(--radius-md);
}

.filter-hint i {
  color: #60a5fa;
}

/* Estilos para active filters (ya existentes, mejorados) */
.active-filters {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.filters-summary {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-lg);
}

.filters-summary i {
  color: #60a5fa;
  font-size: 0.875rem;
}

.filters-count {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #93c5fd;
}

.clear-filters-btn {
  white-space: nowrap;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 600px;
  position: relative;
}

.tabla-categorias {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.tabla-categorias th {
  background: rgba(255, 255, 255, 0.03);
  padding: var(--spacing-4) var(--spacing-6);
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.tabla-categorias td {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #e5e7eb;
  font-size: 0.875rem;
}

.tabla-categorias tr:last-child td {
  border-bottom: none;
}

.tabla-categorias tr:hover td {
  background: rgba(255, 255, 255, 0.05);
}

.tabla-categorias tr.is-selected td {
  background: rgba(59, 130, 246, 0.1);
}

/* ===== BADGES ===== */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.badge-dark {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #9ca3af;
}

/* ===== SLOT BADGES ===== */
.badge-slot {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-lg);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1.5px solid;
  transition: all 0.2s ease;
}

.badge-slot i {
  font-size: 0.875rem;
}

/* Colores para cada slot */
.badge-slot.slot-0 {
  background: rgba(107, 114, 128, 0.15);
  border-color: rgba(107, 114, 128, 0.3);
  color: #9ca3af;
}

.badge-slot.slot-1 {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  color: #60a5fa;
}

.badge-slot.slot-2 {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.badge-slot.slot-3 {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fbbf24;
}

.badge-slot.slot-4 {
  background: rgba(236, 72, 153, 0.15);
  border-color: rgba(236, 72, 153, 0.4);
  color: #f472b6;
}

.badge-slot.slot-5 {
  background: rgba(139, 92, 246, 0.15);
  border-color: rgba(139, 92, 246, 0.4);
  color: #a78bfa;
}

/* ===== PROGRAMACION DATETIME ===== */
.programacion-datetime {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.programacion-time {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: #60a5fa;
  font-family: 'Courier New', monospace;
}

.programacion-time i {
  font-size: 0.75rem;
  opacity: 0.7;
}

.multiple-slots-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-md);
  font-size: 0.6875rem;
  font-weight: 600;
  color: #93c5fd;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.multiple-slots-indicator i {
  font-size: 0.75rem;
  color: #60a5fa;
}

/* ===== SPOT INFO ===== */
.spot-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.spot-name {
  font-weight: 500;
  color: #e5e7eb;
}

/* ===== SCROLL INFINITO ===== */
.scroll-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  color: #9ca3af;
  font-size: 0.875rem;
}

.loader-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.scroll-end-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-6);
  color: #6b7280;
  font-size: 0.875rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.scroll-end-message i {
  color: #10b981;
  font-size: 1rem;
}

/* Estilos personalizados para la barra de scroll del contenedor de tabla */
.table-container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.table-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-md);
}

.table-container::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-md);
  transition: background 0.2s ease;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* ===== MODALS ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 20, 25, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.modal-content,
.modal-container {
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-2xl);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), transparent);
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.modal-close-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.modal-body {
  padding: var(--spacing-6);
  overflow-y: auto;
  flex: 1;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

.modal-footer {
  padding: var(--spacing-6);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.02));
}

/* ===== MANUAL MODE - HOUR SELECTOR IMPROVED ===== */
.hour-day-selector {
  margin-bottom: var(--spacing-5);
}

.hour-day-selector .input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.hour-day-selector .input-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.8125rem;
  font-weight: 600;
  color: #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hour-day-selector .form-select {
  font-size: 1rem;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  padding: var(--spacing-4) var(--spacing-5);
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  color: #60a5fa;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hour-day-selector .form-select:hover {
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.hour-day-selector .form-select option {
  background: #1a1d24;
  color: #e5e7eb;
  padding: var(--spacing-3);
  font-weight: 500;
}

/* ===== PAGINATION STYLES ===== */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-6);
  padding: var(--spacing-6);
  background: rgba(26, 26, 26, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xl);
  margin-top: var(--spacing-6);
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.filter-indicator {
  color: #60a5fa;
  font-size: 0.8125rem;
  margin-left: var(--spacing-2);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: #e5e7eb;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(59, 130, 246, 0.5);
  color: #60a5fa;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: var(--spacing-2);
}

.pagination-page {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-page:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.pagination-page.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.pagination-options {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.pagination-options label {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.pagination-select {
  padding: var(--spacing-2) var(--spacing-3);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: #e5e7eb;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-select:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
}

.pagination-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* ===== FLOATING PENDING BUTTON ===== */
.floating-pending-btn {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: var(--radius-2xl);
  box-shadow:
    0 8px 24px rgba(59, 130, 246, 0.4),
    0 0 0 1px rgba(59, 130, 246, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 999;
}

.floating-pending-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
}

.floating-pending-btn.pulse {
  animation: pulse-btn 2s ease-in-out infinite;
}

@keyframes pulse-btn {
  0%,
  100% {
    box-shadow:
      0 8px 24px rgba(59, 130, 246, 0.4),
      0 0 0 1px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow:
      0 8px 32px rgba(59, 130, 246, 0.6),
      0 0 0 8px rgba(59, 130, 246, 0.1);
  }
}

.floating-btn-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: white;
}

.floating-btn-content i {
  font-size: 1.5rem;
}

.floating-btn-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

.floating-btn-label {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ===== PENDING MODAL ===== */
.pending-modal {
  max-width: 800px;
  max-height: 90vh;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.pending-badge {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.pending-alert {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-6);
}

.pending-alert i {
  font-size: 1.5rem;
  color: #60a5fa;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-content p {
  margin: 0;
  color: #e5e7eb;
  font-size: 0.875rem;
  line-height: 1.6;
}

.batch-warning {
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-2);
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  color: #fbbf24;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.pending-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xl);
  transition: all 0.2s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
}

.stat-card i {
  font-size: 1.5rem;
  color: #60a5fa;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}

.pending-list-container {
  margin-top: var(--spacing-6);
}

.list-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0 0 var(--spacing-4) 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pending-list-scroll {
  max-height: 300px;
  overflow-y: auto;
  padding-right: var(--spacing-2);
}

.pending-list-scroll::-webkit-scrollbar {
  width: 6px;
}

.pending-list-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 3px;
}

.pending-list-scroll::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}

.pending-list-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

.pending-item-card {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: var(--spacing-4);
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2);
  transition: all 0.2s ease;
}

.pending-item-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateX(4px);
}

.item-index {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 8px;
  color: #60a5fa;
  font-size: 0.875rem;
  font-weight: 700;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  align-items: center;
}

.item-day {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #e5e7eb;
}

.item-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #60a5fa;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.item-slot {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 6px;
  font-size: 0.75rem;
  color: #a78bfa;
  font-weight: 600;
}

.item-spot {
  font-size: 0.875rem;
  color: #e5e7eb;
  font-weight: 500;
  text-align: right;
}

.pending-scroll-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  margin-top: var(--spacing-2);
  color: #9ca3af;
  font-size: 0.875rem;
}

.pending-scroll-end-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  margin-top: var(--spacing-2);
  color: #6b7280;
  font-size: 0.875rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* ===== RESPONSIVE ===== */
@media (min-width: 768px) {
  .programming-interface {
    padding: var(--spacing-4);
  }

  .panel-header,
  .form-section,
  .results-header {
    padding: var(--spacing-4);
  }

  .programming-mode-selector {
    grid-template-columns: 1fr;
  }

  .days-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .automatic-config-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }

  .time-range-inline {
    flex-direction: column;
    align-items: stretch;
  }

  .time-input-compact {
    text-align: center;
    width: 100%;
  }

  .time-separator-compact {
    text-align: center;
  }

  .modal-footer .btn {
    width: 100%;
  }

  /* Paginación responsive */
  .pagination-container {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .pagination-controls {
    flex-direction: column;
    width: 100%;
  }

  .pagination-pages {
    width: 100%;
    justify-content: center;
  }

  .pagination-btn,
  .pagination-options {
    width: 100%;
    justify-content: center;
  }

  /* Botón flotante responsive */
  .floating-pending-btn {
    bottom: 16px;
    right: 16px;
    padding: var(--spacing-3);
  }

  .floating-btn-content i {
    font-size: 1.25rem;
  }

  /* Modal pendiente responsive */
  .pending-stats {
    grid-template-columns: 1fr;
  }

  .pending-item-card {
    grid-template-columns: 32px 1fr;
    gap: var(--spacing-2);
  }

  .item-spot {
    grid-column: 2;
    text-align: left;
    margin-top: var(--spacing-1);
  }
}

/* ===== MULTI-MINUTE SECTION STYLING ===== */
.multi-minute-section {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(139, 92, 246, 0.03));
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-6);
  overflow: hidden;
}

.multi-minute-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.multi-minute-section .section-description {
  color: #9ca3af;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: var(--spacing-3);
}

.btn-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-lg);
  color: #60a5fa;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

.btn-toggle.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

.multi-minute-content {
  animation: slideDownFade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideDownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.selected-days-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-5);
  color: #e5e7eb;
  font-size: 0.9375rem;
}

.selected-days-info i {
  color: #60a5fa;
  font-size: 1.125rem;
}

.selected-days-info strong {
  color: #60a5fa;
  font-weight: 700;
}

/* Minutes Selector Container */
.minutes-selector {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-5);
}

/* Minutes Header */
.minutes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
  padding-bottom: var(--spacing-4);
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
}

.minutes-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.minutes-title::before {
  content: '⏰';
  font-size: 1.25rem;
}

.minutes-stats {
  display: flex;
  gap: var(--spacing-5);
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
  color: #9ca3af;
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item i {
  color: #60a5fa;
  font-size: 1rem;
}

.stat-item strong {
  color: #60a5fa;
  font-weight: 700;
  font-size: 1rem;
}

/* Minutes Grid - IMPROVED */
.minutes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-xl);
}

.minute-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  min-height: 70px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.minute-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.minute-option:hover::before {
  opacity: 1;
}

.minute-option.available {
  border-color: rgba(59, 130, 246, 0.3);
  cursor: pointer;
}

.minute-option.available:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.minute-option.selected {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
  border-color: rgba(59, 130, 246, 0.7);
  box-shadow:
    0 8px 20px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.minute-option.selected::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.4), transparent 70%);
}

.minute-option.programmed {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  cursor: not-allowed;
  opacity: 0.6;
}

.minute-option.programmed:hover {
  transform: none;
  box-shadow: none;
}

.minute-value {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  color: #e5e7eb;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.minute-option.selected .minute-value {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
  transform: scale(1.15);
}

.minute-option.programmed .minute-value {
  color: #9ca3af;
  text-decoration: line-through;
}

.minute-icon {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 0.875rem;
  opacity: 0.7;
  z-index: 1;
}

.minute-option.selected .minute-icon {
  color: #ffffff;
  opacity: 1;
  animation: checkPulse 0.5s ease-in-out;
}

.minute-option.programmed .minute-icon {
  color: #f87171;
}

/* Minuto con slots parcialmente ocupados */
.minute-option.partial {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.minute-option.partial:hover {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.5);
}

.slots-info {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
}

@keyframes checkPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

/* Minutes Controls */
.minutes-controls {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  margin-bottom: var(--spacing-5);
  flex-wrap: wrap;
}

.minutes-controls .btn {
  flex: 1;
  min-width: 200px;
}

/* Minutes Preview */
.minutes-preview {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: var(--radius-xl);
  padding: var(--spacing-5);
  margin-bottom: var(--spacing-5);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
  color: #60a5fa;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-header i {
  font-size: 1rem;
}

.preview-text {
  color: #e5e7eb;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin-bottom: var(--spacing-3);
}

.preview-text strong {
  color: #60a5fa;
  font-weight: 700;
}

.preview-total {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: rgba(59, 130, 246, 0.15);
  border-radius: var(--radius-lg);
  color: #e5e7eb;
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: var(--spacing-4);
}

.preview-total i {
  color: #60a5fa;
}

.preview-total strong {
  color: #60a5fa;
  font-size: 1.125rem;
  font-weight: 700;
}

.preview-times {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.time-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: var(--radius-md);
  color: #60a5fa;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  transition: all 0.2s ease;
}

.time-badge:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.time-badge.more {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  color: #a78bfa;
}

/* Button to program minutes */
.btn-program-minutes {
  width: 100%;
  padding: var(--spacing-5);
  font-size: 1.0625rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
  border: none;
  border-radius: var(--radius-xl);
  position: relative;
  overflow: hidden;
}

.btn-program-minutes::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-program-minutes:hover::before {
  left: 100%;
}

.btn-program-minutes:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.5);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-10);
  color: #9ca3af;
}

.empty-state i {
  font-size: 4rem;
  color: #6b7280;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
}

.empty-state p {
  font-size: 1rem;
  line-height: 1.6;
  color: #9ca3af;
}

/* Responsive adjustments for minutes grid */
@media (min-width: 1024px) {
  .minutes-grid {
    grid-template-columns: repeat(auto-fill, minmax(65px, 1fr));
    gap: var(--spacing-2);
  }

  .minute-option {
    min-height: 60px;
    padding: var(--spacing-3);
  }

  .minute-value {
    font-size: 1.125rem;
  }
}

@media (min-width: 768px) {
  .minutes-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .minutes-stats {
    width: 100%;
    justify-content: space-between;
  }

  .minutes-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: var(--spacing-2);
  }

  .minute-option {
    min-height: 55px;
    padding: var(--spacing-2);
  }

  .minute-value {
    font-size: 1rem;
  }

  .minutes-controls {
    flex-direction: column;
  }

  .minutes-controls .btn {
    width: 100%;
    min-width: auto;
  }

  .preview-times {
    justify-content: center;
  }
}

@media (min-width: 480px) {
  .minutes-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: var(--spacing-1);
  }

  .minute-option {
    min-height: 50px;
    padding: var(--spacing-1);
  }

  .minute-value {
    font-size: 0.875rem;
  }

  .stat-item {
    font-size: 0.75rem;
    padding: var(--spacing-1) var(--spacing-2);
  }
}

/* ===== ESTILOS PARA VALIDACIÓN DE CONFIGURACIÓN ===== */

/* Advertencia de validación de configuración */
.config-validation-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  margin-top: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #f87171;
  font-size: 0.875rem;
  animation: slideDown 0.3s ease-out;
}

.config-validation-warning i {
  flex-shrink: 0;
  margin-top: 0.125rem;
  font-size: 1rem;
}

/* Días deshabilitados */
.day-option.invalid-day {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
}

.day-option.disabled {
  pointer-events: none;
}

.day-option.invalid-day .day-checkbox {
  cursor: not-allowed;
}

/* Badge para indicar solo días hábiles */
.badge-info {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 9999px;
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Animación para advertencias */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
