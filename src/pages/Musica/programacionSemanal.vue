<template>
  <div class="programacion-semanal-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <button class="btn-back" @click="volverAtras">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Volver
        </button>
        <div class="header-text">
          <h1 class="page-title">{{ nombreProgramacion }}</h1>
          <p class="page-subtitle">Programación semanal de música</p>
        </div>
        <div class="header-actions">
          <button class="btn-edit-programacion" @click="irAEditarProgramacion">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Editar Programación
          </button>
          <button class="btn-save" @click="guardarProgramacion" :disabled="isLoading">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-container">
      <!-- Loading State -->
      <LoadingOverlay v-if="isLoading" message="Cargando programación..." />

      <div v-else class="content-wrapper">
        <!-- Radios Sidebar -->
        <div class="radios-sidebar">
          <div class="sidebar-header">
            <h2>Biblioteca de Radios</h2>
            <span class="radios-count">{{ filteredRadios.length }} radios</span>
          </div>

          <!-- Filters Section -->
          <div class="filters-section">
            <button class="filters-toggle" @click="showFilters = !showFilters">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Filtros
              <svg class="chevron" :class="{ 'rotate': showFilters }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            <div class="filters-content" :class="{ 'expanded': showFilters }">
              <div class="search-box">
                <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar radio..."
                  class="search-input"
                >
              </div>

              <div class="filter-group">
                <label>Género Musical</label>
                <select v-model="filtroSelected.genero" @change="applyFilters" class="filter-select">
                  <option value="0">Todos los géneros</option>
                  <option v-for="genero in generosMusicales" :key="genero.codigo" :value="genero.codigo">
                    {{ genero.nombre }}
                  </option>
                </select>
              </div>

              <div class="filter-group">
                <label>Estilo</label>
                <select v-model="filtroSelected.estilo" @change="applyFilters" class="filter-select">
                  <option value="0">Todos los estilos</option>
                  <option v-for="estilo in filtros.estiloEmpresa" :key="estilo.cod" :value="estilo.cod">
                    {{ estilo.nombre }}
                  </option>
                </select>
              </div>

              <div class="filter-group">
                <label>Ritmo</label>
                <select v-model="filtroSelected.ritmo" @change="applyFilters" class="filter-select">
                  <option value="0">Todos los ritmos</option>
                  <option v-for="ritmo in filtros.ritmo" :key="ritmo.cod" :value="ritmo.cod">
                    {{ ritmo.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Radios List -->
          <div class="radios-list">
            <div
              v-for="radio in filteredRadios"
              :key="radio.codRadio"
              @click="toggleRadioSelection(radio)"
              class="radio-card"
              :class="{ 'selected': isRadioSelected(radio) }"
            >
              <div class="radio-header">
                <div class="radio-checkbox">
                  <input
                    type="checkbox"
                    :checked="isRadioSelected(radio)"
                    @click.stop="toggleRadioSelection(radio)"
                    class="radio-checkbox-input"
                  >
                </div>
                <div class="radio-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                  </svg>
                </div>
              </div>
              <div class="radio-content">
                <h4 class="radio-name">{{ radio.nombre }}</h4>
                <div class="radio-meta">
                  <span v-if="radio.genero" class="radio-genre">{{ radio.genero }}</span>
                  <span v-if="radio.subGenero" class="radio-subgenre">{{ radio.subGenero }}</span>
                </div>
              </div>
            </div>

            <div v-if="filteredRadios.length === 0" class="empty-radios">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>No se encontraron radios</p>
            </div>
          </div>
        </div>

        <!-- Tabla Responsiva de Programaciones -->
        <div class="programaciones-table-section">
          <div class="table-header">
            <div class="table-header-left">
              <h2>Programación Semanal</h2>
              <span class="info-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; display: inline-block; margin-right: 4px;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ horarioCliente.horaDesde }} - {{ horarioCliente.horaHasta }}
              </span>
            </div>
            <div class="table-header-right">
              <div class="filter-day-group">
                <label>Filtrar por día:</label>
                <select v-model="selectedDayFilter" class="filter-day-select">
                  <option :value="null">Todos los días</option>
                  <option v-for="day in daysOfWeek" :key="day.value" :value="day.value">
                    {{ day.label }}
                  </option>
                </select>
              </div>
              <button  class="btn-view-toggle" @click="viewMode = viewMode === 'table' ? 'cards' : 'table'">
                <svg v-if="viewMode === 'table'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                {{ viewMode === 'table' ? 'Vista Tarjetas' : 'Vista Tabla' }}
              </button>
            </div>
          </div>

          <!-- Vista Tabla (Desktop) -->
          <div v-if="viewMode === 'table'" class="table-container">
            <div class="responsive-table-wrapper">
              <table class="programaciones-table">
                <thead>
                  <tr>
                    <th class="th-sticky">Día</th>
                    <th>Programaciones</th>
                    <th class="th-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="day in filteredDays" :key="day.value" class="table-row">
                    <td class="td-day">
                      <div class="day-cell">
                        <span class="day-name-table">{{ day.label }}</span>
                        <span class="day-badge">{{ programacionesPorDia(day.value).length }}</span>
                      </div>
                    </td>
                    <td class="td-programs">
                      <!-- Formulario inline -->
                      <div v-if="showNewProgForDay === day.value" class="inline-form-table">
                        <select v-model="newProgForm.codRadio" class="form-select-inline">
                          <option :value="null" disabled>Radio...</option>
                          <option v-for="r in radios" :key="'nr-'+r.codRadio" :value="r.codRadio">
                            {{ r.nombre }}
                          </option>
                        </select>
                        <input type="time" v-model="newProgForm.horaInicio" class="form-time-inline" :min="horarioCliente.horaDesde" :max="horarioCliente.horaHasta" />
                        <span class="time-separator">-</span>
                        <input type="time" v-model="newProgForm.horaFin" class="form-time-inline" :min="horarioCliente.horaDesde" :max="horarioCliente.horaHasta" />
                        <button class="btn-save-inline" @click="guardarNuevaProgramacion" :disabled="isLoading" title="Guardar">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button class="btn-cancel-inline" @click="cancelarNuevoProg" title="Cancelar">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>

                      <!-- Lista de programaciones -->
                      <div class="programs-list" v-if="programacionesPorDia(day.value).length > 0">
                        <div
                          v-for="prog in programacionesPorDia(day.value)"
                          :key="prog.cod"
                          class="program-item"
                        >
                          <div class="program-icon-small">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
                          </div>
                          <div class="program-details">
                            <span class="program-name">{{ prog.radioNombre }}</span>
                            <span class="program-time">{{ prog.horaInicio }} - {{ prog.horaFin }}</span>
                          </div>
                          <div class="program-actions-inline">
                            <button class="btn-icon-edit" @click="editarProgramacion(prog)" title="Editar">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </button>
                            <button class="btn-icon-delete" @click="eliminarProgramacion(prog)" title="Eliminar">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div v-else class="empty-programs">
                        Sin programaciones
                      </div>
                    </td>
                    <td class="td-actions">
                      <button class="btn-add-program" @click="abrirNuevoProg(day.value)" title="Agregar programación">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Agregar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Vista Tarjetas (Mobile) -->
          <div v-else class="cards-view">
            <div
              v-for="day in filteredDays"
              :key="day.value"
              class="day-card"
            >
              <div class="day-card-header">
                <div class="day-info">
                  <span class="day-name-card">{{ day.label }}</span>
                  <span class="day-count-badge">{{ programacionesPorDia(day.value).length }}</span>
                </div>
                <button class="btn-add-card" @click="abrirNuevoProg(day.value)">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </button>
              </div>

              <!-- Formulario inline para tarjetas -->
              <div v-if="showNewProgForDay === day.value" class="inline-form-card">
                <select v-model="newProgForm.codRadio" class="form-select-card">
                  <option :value="null" disabled>Seleccionar radio...</option>
                  <option v-for="r in radios" :key="'nr-'+r.codRadio" :value="r.codRadio">{{ r.nombre }}</option>
                </select>
                <div class="time-inputs-card">
                  <input type="time" v-model="newProgForm.horaInicio" class="form-time-card" :min="horarioCliente.horaDesde" :max="horarioCliente.horaHasta" />
                  <span>-</span>
                  <input type="time" v-model="newProgForm.horaFin" class="form-time-card" :min="horarioCliente.horaDesde" :max="horarioCliente.horaHasta" />
                </div>
                <div class="form-actions-card">
                  <button class="btn-save-card" @click="guardarNuevaProgramacion" :disabled="isLoading">Guardar</button>
                  <button class="btn-cancel-card" @click="cancelarNuevoProg">Cancelar</button>
                </div>
              </div>

              <!-- Programaciones del día -->
              <div class="day-card-body">
                <div v-if="programacionesPorDia(day.value).length > 0" class="programs-list-card">
                  <div v-for="prog in programacionesPorDia(day.value)" :key="prog.cod" class="program-card-item">
                    <div class="program-card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
                    </div>
                    <div class="program-card-info">
                      <span class="program-card-name">{{ prog.radioNombre }}</span>
                      <span class="program-card-time">{{ prog.horaInicio }} - {{ prog.horaFin }}</span>
                    </div>
                    <div class="program-card-actions">
                      <button class="btn-card-edit" @click="editarProgramacion(prog)">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button class="btn-card-delete" @click="eliminarProgramacion(prog)">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-day-card">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                  <p>No hay programaciones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación Eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button class="modal-close" @click="cancelDelete">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Está seguro que desea eliminar la programación de <strong>{{ selectedProgramacion?.radioNombre }}</strong>?</p>
          <p class="modal-info">Horario: {{ selectedProgramacion?.horaInicio }} - {{ selectedProgramacion?.horaFin }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="cancelDelete">Cancelar</button>
          <button class="btn-confirm" @click="confirmDelete">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal de Edición de Horario -->
    <div v-if="showEditModal" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content edit-modal" @click.stop>
        <div class="modal-header">
          <h3>Editar Programación</h3>
          <button class="modal-close" @click="cancelEdit">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="edit-section">
            <div class="edit-info">
              <h4>{{ editForm.radioNombre }}</h4>
              <p class="edit-day">{{ getDiaNombre(editForm.numeroDia) }}</p>
            </div>

            <div class="form-group">
              <label for="edit-hora-inicio">Hora de Inicio</label>
              <input
                id="edit-hora-inicio"
                v-model="editForm.horaInicio"
                type="time"
                class="form-input"
                :min="horarioCliente.horaDesde"
                :max="editForm.horaFin"
              >
            </div>

            <div class="form-group">
              <label for="edit-hora-fin">Hora de Fin</label>
              <input
                id="edit-hora-fin"
                v-model="editForm.horaFin"
                type="time"
                class="form-input"
                :min="editForm.horaInicio"
                :max="horarioCliente.horaHasta"
              >
            </div>

            <div class="duration-info">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Duración: {{ calculateDuration(editForm.horaInicio, editForm.horaFin) }}</span>
            </div>

            <div v-if="editConflictMessage" class="conflict-warning">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              {{ editConflictMessage }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="cancelEdit">Cancelar</button>
          <button
            class="btn-confirm btn-primary"
            @click="confirmEdit"
            :disabled="!!editConflictMessage"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>

    <!-- Botón Flotante para Distribución Mágica -->
    <button
      v-if="selectedRadios.length > 0"
      @click="showMagicDistributionModal = true"
      class="floating-magic-btn"
      :class="{ 'pulse': selectedRadios.length > 0 }"
    >
      <div class="floating-btn-content">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="magic-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
        </svg>
        <span class="floating-btn-count">{{ selectedRadios.length }}</span>
      </div>
      <span class="floating-btn-label">Distribución Mágica</span>
    </button>

    <!-- Modal de Distribución Mágica -->
    <div v-if="showMagicDistributionModal" class="modal-overlay" @click="showMagicDistributionModal = false">
      <div class="modal-content magic-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle; margin-right: 8px;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
            Distribución Mágica de Radios
          </h3>
          <button class="modal-close" @click="showMagicDistributionModal = false">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <!-- Resumen de radios seleccionadas -->
          <div class="magic-summary">
            <h4>Radios Seleccionadas ({{ selectedRadios.length }})</h4>
            <div class="selected-radios-preview">
              <span v-for="radio in selectedRadios" :key="radio.codRadio" class="radio-tag">
                {{ radio.nombre }}
              </span>
            </div>
          </div>

          <!-- Configuración de distribución -->
          <div class="magic-config">
            <h4>Modo de Distribución</h4>
            <div class="distribution-modes">
              <label class="mode-option" :class="{ 'active': distributionMode === 'sequential' }">
                <input type="radio" v-model="distributionMode" value="sequential">
                <div class="mode-content">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                  <span class="mode-title">Secuencial</span>
                  <small>Distribuye radios en orden (Radio 1, Radio 2, Radio 3...)</small>
                </div>
              </label>
              <label class="mode-option" :class="{ 'active': distributionMode === 'random' }">
                <input type="radio" v-model="distributionMode" value="random">
                <div class="mode-content">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                  </svg>
                  <span class="mode-title">Aleatorio</span>
                  <small>Distribuye radios de forma aleatoria</small>
                </div>
              </label>
            </div>

            <!-- Opción de llenar solo horas vacías -->
            <label class="checkbox-option">
              <input type="checkbox" v-model="fillEmptyHoursOnly">
              <span>Llenar solo horas vacías (no sobrescribir programaciones existentes)</span>
            </label>
          </div>

          <!-- Vista previa -->
          <div class="magic-preview">
            <div class="preview-info">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p><strong>Días a programar:</strong> {{ daysOfWeek.length }} días hábiles ({{ getDaysNames() }})</p>
                <p><strong>Horas por día:</strong> {{ hours.length }} horas ({{ horarioCliente.horaDesde }} - {{ horarioCliente.horaHasta }})</p>
                <p><strong>Total de programaciones:</strong> {{ calculateTotalSlots() }} slots</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showMagicDistributionModal = false">Cancelar</button>
          <button class="btn-confirm btn-magic" @click="executeMagicDistribution">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
            Ejecutar Distribución Mágica
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRadio } from '@/composables/useRadio'
import RadioServices from '@/services/RadioServices'
import ClienteProgramacionRadioServices from '@/services/ClienteProgramacionRadioServices'
import FiltroServices from '@/services/FiltroServices'
import generoMusicalServices from '@/services/GeneroMusicalServices'
import ClienteHorarioServices from '@/services/ClienteHorarioServices'
import DiaHabilService from '@/services/DiaHabilService'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'

const router = useRouter()
const route = useRoute()

// Props from route
const codigoProgramacion = ref(route.params.codigoProgramacion)
const nombreProgramacion = ref(decodeURIComponent(route.params.nombreProgramacion || ''))

// State
const isLoading = ref(false)
const radios = ref([])
const programaciones = ref([])
const searchQuery = ref('')
const showDeleteModal = ref(false)
const selectedProgramacion = ref(null)
const viewMode = ref('card') // 'table' o 'cards'
// Inicializar filtros según el tamaño de pantalla
const showFilters = ref(window.innerWidth > 1024) // Colapsado en móvil/tablet por defecto
const selectedDayFilter = ref(null) // Filtro de día (null = todos)

// Estado para distribución automática mágica
const selectedRadios = ref([])
const showMagicDistributionModal = ref(false)
const distributionMode = ref('sequential') // 'sequential' o 'random'
const fillEmptyHoursOnly = ref(false)

// Estado para edición
const showEditModal = ref(false)
const editForm = ref({
  cod: null,
  radioNombre: '',
  numeroDia: 0,
  horaInicio: '00:00',
  horaFin: '23:59',
  codRadio: null
})
const editConflictMessage = ref('')

// Horario del cliente
const horarioCliente = ref({
  horaDesde: '00:00',
  horaHasta: '23:59',
  diasHabiles: [0, 1, 2, 3, 4, 5, 6] // Todos los días por defecto
})

// Filtros
const filtroSelected = ref({
  genero: 0,
  estilo: 0,
  ritmo: 0,
  tipoEmpresa: 0
})

const filtros = ref({
  estiloEmpresa: [],
  ritmo: [],
  tipoEmpresa: []
})

const generosMusicales = ref([])

// Days of the week
const daysOfWeek = computed(() => {
  const days = [
    { label: 'Domingo', value: 0, number: 'Dom' },
    { label: 'Lunes', value: 1, number: 'Lun' },
    { label: 'Martes', value: 2, number: 'Mar' },
    { label: 'Miércoles', value: 3, number: 'Mié' },
    { label: 'Jueves', value: 4, number: 'Jue' },
    { label: 'Viernes', value: 5, number: 'Vie' },
    { label: 'Sábado', value: 6, number: 'Sáb' }
  ]

  // Filtrar solo días hábiles del cliente
  return days.filter(day => horarioCliente.value.diasHabiles.includes(day.value))
})

// Filtered days based on selected day filter
const filteredDays = computed(() => {
  if (selectedDayFilter.value === null) {
    return daysOfWeek.value
  }
  return daysOfWeek.value.filter(day => day.value === selectedDayFilter.value)
})

// Hours range based on client schedule
const hours = computed(() => {
  const startHour = parseInt(horarioCliente.value.horaDesde.split(':')[0])
  const endHour = parseInt(horarioCliente.value.horaHasta.split(':')[0])

  const hoursArray = []
  for (let i = startHour; i <= endHour; i++) {
    hoursArray.push(i)
  }
  return hoursArray
})

// Filtered radios
const filteredRadios = computed(() => {
  let filtered = radios.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(radio =>
      radio.nombre.toLowerCase().includes(query) ||
      (radio.genero && radio.genero.toLowerCase().includes(query)) ||
      (radio.subGenero && radio.subGenero.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Nueva función para obtener programaciones por día
const programacionesPorDia = (numeroDia) => {
  return programaciones.value
    .filter(p => p.numeroDia === numeroDia)
    .sort((a, b) => {
      // Orden por horaInicio ascendente
      if (a.horaInicio < b.horaInicio) return -1
      if (a.horaInicio > b.horaInicio) return 1
      return 0
    })
}

// Methods
const volverAtras = () => {
  router.push({ name: 'ProgramaMusica' })
}

const irAEditarProgramacion = () => {
  router.push({
    name: 'Nueva programación de música',
    params: {
      codigoProgramacion: String(codigoProgramacion.value),
      nombreProgramacion: encodeURIComponent(nombreProgramacion.value)
    }
  })
}

const formatHour = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const eliminarProgramacion = (prog) => {
  selectedProgramacion.value = prog
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedProgramacion.value) return

  try {
    isLoading.value = true

    await ClienteProgramacionRadioServices.bajaProgramacionRadio(
      parseInt(selectedProgramacion.value.cod)
    )

    // Recargar programaciones
    await cargarProgramaciones()

    showDeleteModal.value = false
    selectedProgramacion.value = null

  } catch (error) {
    console.error('Error al eliminar programación:', error)
    alert('Error al eliminar la programación')
  } finally {
    isLoading.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  selectedProgramacion.value = null
}

// Funciones de edición
const editarProgramacion = (prog) => {
  editForm.value = {
    cod: prog.cod,
    radioNombre: prog.radioNombre,
    numeroDia: prog.numeroDia,
    horaInicio: prog.horaInicio,
    horaFin: prog.horaFin,
    codRadio: prog.codRadio
  }
  showEditModal.value = true
  checkEditConflicts()
}

const cancelEdit = () => {
  showEditModal.value = false
  editForm.value = {
    cod: null,
    radioNombre: '',
    numeroDia: 0,
    horaInicio: '00:00',
    horaFin: '23:59',
    codRadio: null
  }
  editConflictMessage.value = ''
}

const checkEditConflicts = () => {
  if (!editForm.value.horaInicio || !editForm.value.horaFin) {
    editConflictMessage.value = ''
    return
  }

  // Verificar que hora inicio < hora fin
  if (editForm.value.horaInicio >= editForm.value.horaFin) {
    editConflictMessage.value = 'La hora de inicio debe ser anterior a la hora de fin'
    return
  }

  // Verificar conflictos con otras programaciones del mismo día (excluyendo la actual)
  const hayConflicto = programaciones.value.some(prog => {
    // Excluir la programación actual
    if (prog.cod === editForm.value.cod) return false

    // Solo verificar programaciones del mismo día
    if (prog.numeroDia !== editForm.value.numeroDia) return false

    // Verificar superposición de horarios
    return (
      (editForm.value.horaInicio >= prog.horaInicio && editForm.value.horaInicio < prog.horaFin) ||
      (editForm.value.horaFin > prog.horaInicio && editForm.value.horaFin <= prog.horaFin) ||
      (editForm.value.horaInicio <= prog.horaInicio && editForm.value.horaFin >= prog.horaFin)
    )
  })

  if (hayConflicto) {
    editConflictMessage.value = 'El horario se superpone con otra programación existente'
  } else {
    editConflictMessage.value = ''
  }
}

const confirmEdit = async () => {
  if (editConflictMessage.value) {
    return
  }

  try {
    isLoading.value = true

    await ClienteProgramacionRadioServices.editarProgRadio(
      parseInt(editForm.value.cod),
      parseInt(codigoProgramacion.value),
      parseInt(editForm.value.codRadio),
      parseInt(editForm.value.numeroDia),
      editForm.value.horaInicio,
      editForm.value.horaFin
    )

    // Recargar programaciones
    await cargarProgramaciones()

    showEditModal.value = false
    cancelEdit()

  } catch (error) {
    console.error('Error al editar programación:', error)
    alert('Error al editar la programación: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

const calculateDuration = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return '0 horas'

  const inicio = horaInicio.split(':').map(Number)
  const fin = horaFin.split(':').map(Number)

  const minutosInicio = inicio[0] * 60 + inicio[1]
  const minutosFin = fin[0] * 60 + fin[1]

  const duracionMinutos = minutosFin - minutosInicio

  const horas = Math.floor(duracionMinutos / 60)
  const minutos = duracionMinutos % 60

  if (horas > 0 && minutos > 0) {
    return `${horas}h ${minutos}min`
  } else if (horas > 0) {
    return `${horas} hora${horas > 1 ? 's' : ''}`
  } else {
    return `${minutos} minutos`
  }
}

const guardarProgramacion = async () => {
  // Ya se guarda automáticamente al hacer drop
  alert('Programación guardada exitosamente')
  volverAtras()
}

const applyFilters = async () => {
  await cargarRadios()
}

// Load data methods
const cargarRadios = async () => {
  try {
    isLoading.value = true

    const result = await generoMusicalServices.buscar(
      0,
      0,
      filtroSelected.value.ritmo,
      filtroSelected.value.tipoEmpresa,
      filtroSelected.value.estilo
    )

    const jsonRes = []
    result.forEach(element => {
      if (element.rad_codigo != 0) {
        jsonRes.push({
          nombre: element.rad_nombre,
          codRadio: element.rad_codigo,
          img: element.rad_imagen,
          genero: element.genmus_nombre,
          subGenero: element.gemusu_nombre,
          enlaceStream: element.rad_enlace
        })
      }
    })

    radios.value = jsonRes

  } catch (error) {
    console.error('Error al cargar radios:', error)
  } finally {
    isLoading.value = false
  }
}

const cargarProgramaciones = async () => {
  try {
    isLoading.value = true

    const result = await ClienteProgramacionRadioServices.getProgramacionesByProg(
      parseInt(codigoProgramacion.value)
    )

    console.log('Programaciones cargadas desde API:', result)

    const programacionesData = []
    result.forEach(element => {
      // Normalizar formato de horas (eliminar segundos si existen)
      const horaInicio = element.clprra_horaDesde?.substring(0, 5) || element.clprra_horaDesde
      const horaFin = element.clprra_horaHasta?.substring(0, 5) || element.clprra_horaHasta

      programacionesData.push({
        cod: element.clprra_codigo,
        radioNombre: element.rad_nombre,
        numeroDia: element.clprra_numeroDia,
        diaSemana: getDiaNombre(element.clprra_numeroDia),
        horaInicio: horaInicio,
        horaFin: horaFin,
        codRadio: element.rad_codigo
      })
    })

    console.log('Programaciones procesadas:', programacionesData)
    programaciones.value = programacionesData

  } catch (error) {
    console.error('Error al cargar programaciones:', error)
  } finally {
    isLoading.value = false
  }
}

const cargarFiltros = async () => {
  try {
    // Cargar filtros de estilos
    const estilosResult = await FiltroServices.listarEstilo()
    const estilosJson = [{ nombre: 'Todos los estilos', cod: 0 }]
    estilosResult.forEach(element => {
      estilosJson.push({
        nombre: element.estilo_nombre,
        cod: element.estilo_codigo
      })
    })
    filtros.value.estiloEmpresa = estilosJson

    // Cargar filtros de ritmos
    const ritmosResult = await FiltroServices.listarRitmo()
    const ritmosJson = [{ nombre: 'Todos los ritmos', cod: 0 }]
    ritmosResult.forEach(element => {
      ritmosJson.push({
        nombre: element.ritmos_nombre,
        cod: element.ritmos_codigo
      })
    })
    filtros.value.ritmo = ritmosJson

    // Cargar tipos de empresa
    const tiposResult = await FiltroServices.listarTipoEmpresa()
    const tiposJson = [{ nombre: 'Todas las empresas', cod: 0 }]
    tiposResult.forEach(element => {
      tiposJson.push({
        nombre: element.tipEmp_nombre,
        cod: element.tipEmp_codigo
      })
    })
    filtros.value.tipoEmpresa = tiposJson

  } catch (error) {
    console.error('Error al cargar filtros:', error)
  }
}

const cargarGenerosMusicales = async () => {
  try {
    const result = await generoMusicalServices.getGeneros()
    const generosJson = []

    result.forEach(element => {
      generosJson.push({
        nombre: element.genmus_nombre,
        codigo: element.genmus_codigo
      })
    })

    generosMusicales.value = generosJson

  } catch (error) {
    console.error('Error al cargar géneros:', error)
  }
}

const getDiaNombre = (numeroDia) => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return dias[numeroDia] || 'Desconocido'
}

// ===== FUNCIONES PARA DISTRIBUCIÓN MÁGICA =====

// Alternar selección de radio
const toggleRadioSelection = (radio) => {
  const index = selectedRadios.value.findIndex(r => r.codRadio === radio.codRadio)
  if (index > -1) {
    selectedRadios.value.splice(index, 1)
  } else {
    selectedRadios.value.push(radio)
  }
}

// Verificar si una radio está seleccionada
const isRadioSelected = (radio) => {
  return selectedRadios.value.some(r => r.codRadio === radio.codRadio)
}

// Obtener nombres de días
const getDaysNames = () => {
  return daysOfWeek.value.map(d => d.label).join(', ')
}

// Calcular total de slots disponibles
const calculateTotalSlots = () => {
  const totalDays = daysOfWeek.value.length
  const totalHours = hours.value.length

  if (fillEmptyHoursOnly.value) {
    // Contar solo slots vacíos
    let emptySlots = 0
    daysOfWeek.value.forEach(day => {
      hours.value.forEach(hour => {
        const horaInicio = formatHour(hour)
        const hasProgram = programaciones.value.some(prog =>
          prog.numeroDia === day.value && prog.horaInicio === horaInicio
        )
        if (!hasProgram) emptySlots++
      })
    })
    return emptySlots
  }

  return totalDays * totalHours
}

// Ejecutar distribución mágica
const executeMagicDistribution = async () => {
  if (selectedRadios.value.length === 0) {
    alert('Selecciona al menos una radio para distribuir')
    return
  }

  try {
    isLoading.value = true
    let programacionesCreadas = 0
    let radioIndex = 0

    // Preparar lista de radios según modo
    let radiosToDistribute = [...selectedRadios.value]
    if (distributionMode.value === 'random') {
      // Mezclar aleatoriamente
      radiosToDistribute = radiosToDistribute.sort(() => Math.random() - 0.5)
    }

    console.log('🎨 Iniciando distribución mágica:', {
      modo: distributionMode.value,
      radios: radiosToDistribute.length,
      soloVacios: fillEmptyHoursOnly.value,
      dias: daysOfWeek.value.length,
      horas: hours.value.length
    })

    // Iterar sobre cada día hábil
    for (const day of daysOfWeek.value) {
      // Iterar sobre cada hora
      for (const hour of hours.value) {
        const horaInicio = formatHour(hour)
        const horaFin = formatHour(hour + 1)

        // Verificar si ya existe programación en este slot
        const hayProgramacion = programaciones.value.some(prog =>
          prog.numeroDia === day.value && prog.horaInicio === horaInicio
        )

        // Si fillEmptyHoursOnly está activado y ya hay programación, saltar
        if (fillEmptyHoursOnly.value && hayProgramacion) {
          console.log(`⏭️ Saltando ${day.label} ${horaInicio} (ya programado)`)
          continue
        }

        // Eliminar programación existente si no está en modo "solo vacíos"
        if (!fillEmptyHoursOnly.value && hayProgramacion) {
          const progExistente = programaciones.value.find(prog =>
            prog.numeroDia === day.value && prog.horaInicio === horaInicio
          )
          if (progExistente) {
            try {
              await ClienteProgramacionRadioServices.bajaProgramacionRadio(parseInt(progExistente.cod))
              console.log(`🗑️ Eliminada programación existente en ${day.label} ${horaInicio}`)
            } catch (error) {
              console.error('Error eliminando programación existente:', error)
            }
          }
        }

        // Seleccionar radio según modo
        let radioToProgram
        if (distributionMode.value === 'random') {
          // Seleccionar aleatoriamente
          radioToProgram = radiosToDistribute[Math.floor(Math.random() * radiosToDistribute.length)]
        } else {
          // Modo secuencial: rotar entre las radios
          radioToProgram = radiosToDistribute[radioIndex % radiosToDistribute.length]
          radioIndex++
        }

        // Crear programación
        try {
          await ClienteProgramacionRadioServices.guardarProgRadio(
            parseInt(codigoProgramacion.value),
            parseInt(radioToProgram.codRadio),
            parseInt(day.value),
            horaInicio,
            horaFin
          )
          programacionesCreadas++
          console.log(`✅ Programado ${radioToProgram.nombre} en ${day.label} ${horaInicio}`)
        } catch (error) {
          console.error(`❌ Error programando ${day.label} ${horaInicio}:`, error)
        }
      }
    }

    // Recargar programaciones
    await cargarProgramaciones()

    showMagicDistributionModal.value = false
    selectedRadios.value = []

    alert(`✨ Distribución mágica completada!\n\n${programacionesCreadas} programaciones creadas exitosamente.`)

  } catch (error) {
    console.error('Error en distribución mágica:', error)
    alert('Error al ejecutar la distribución mágica: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

// NUEVO: estado para formulario inline por día
const showNewProgForDay = ref(null)
const newProgForm = ref({
  codRadio: null,
  numeroDia: null,
  horaInicio: '00:00',
  horaFin: '23:59'
})

// Abrir formulario para un día específico
const abrirNuevoProg = (numeroDia) => {
  showNewProgForDay.value = numeroDia
  newProgForm.value = {
    codRadio: radios.value[0]?.codRadio ?? null,
    numeroDia: numeroDia,
    horaInicio: horarioCliente.value.horaDesde || '00:00',
    horaFin: (() => {
      const start = horarioCliente.value.horaDesde || '00:00'
      const h = Math.min(23, (parseInt(start.split(':')[0], 10) + 1))
      return String(h).padStart(2, '0') + ':00'
    })()
  }
}

// Cancelar creación
const cancelarNuevoProg = () => {
  showNewProgForDay.value = null
  newProgForm.value = {
    codRadio: null,
    numeroDia: null,
    horaInicio: '00:00',
    horaFin: '23:59'
  }
}

// Guardar nueva programación (validaciones mínimas + conflicto)
const guardarNuevaProgramacion = async () => {
  if (!newProgForm.value.codRadio) {
    alert('Selecciona una radio')
    return
  }
  if (!newProgForm.value.horaInicio || !newProgForm.value.horaFin) {
    alert('Completa hora inicio y fin')
    return
  }
  if (newProgForm.value.horaInicio >= newProgForm.value.horaFin) {
    alert('La hora de inicio debe ser anterior a la hora de fin')
    return
  }

  // Verificar conflictos con programaciones existentes en el mismo día
  const conflict = programaciones.value.some(prog => {
    if (prog.numeroDia !== newProgForm.value.numeroDia) return false
    return (
      (newProgForm.value.horaInicio >= prog.horaInicio && newProgForm.value.horaInicio < prog.horaFin) ||
      (newProgForm.value.horaFin > prog.horaInicio && newProgForm.value.horaFin <= prog.horaFin) ||
      (newProgForm.value.horaInicio <= prog.horaInicio && newProgForm.value.horaFin >= prog.horaFin)
    )
  })
  if (conflict) {
    if (!confirm('Existe una programación que se superpone. ¿Deseas continuar y crear igualmente?')) {
      return
    }
  }

  try {
    isLoading.value = true
    await ClienteProgramacionRadioServices.guardarProgRadio(
      parseInt(codigoProgramacion.value),
      parseInt(newProgForm.value.codRadio),
      parseInt(newProgForm.value.numeroDia),
      newProgForm.value.horaInicio,
      newProgForm.value.horaFin
    )
    await cargarProgramaciones()
    cancelarNuevoProg()
  } catch (error) {
    console.error('Error al crear programación:', error)
    alert('Error al crear la programación: ' + (error.message || error))
  } finally {
    isLoading.value = false
  }
}

/* Watchers */
watch(() => editForm.value.horaInicio, () => {
  if (showEditModal.value) {
    checkEditConflicts()
  }
})

watch(() => editForm.value.horaFin, () => {
  if (showEditModal.value) {
    checkEditConflicts()
  }
})

/* Lifecycle */
// Cargar horario del cliente
const cargarHorarioCliente = async () => {
  try {
    const horario = await ClienteHorarioServices.get()
    console.log('Horario del cliente cargado:', horario)

    if (horario) {
      horarioCliente.value = {
        horaDesde: horario.cliHor_horaDesde || '00:00',
        horaHasta: horario.cliHor_horaHasta || '23:59',
        diasHabiles: [0, 1, 2, 3, 4, 5, 6] // Todos los días por defecto
      }

      console.log('Horario configurado:', horarioCliente.value)
    }
  } catch (error) {
    console.error('Error cargando horario del cliente:', error)
    // Mantener valores por defecto si hay error
    console.warn('Usando horario por defecto (00:00 - 23:59)')
  }
}

// Cargar días hábiles del cliente
const cargarDiasHabilesCliente = async () => {
  try {
    const dias = await DiaHabilService.get()
    console.log('Días hábiles del cliente cargados:', dias)

    if (dias && dias.length > 0) {
      const diasHabiles = []
      dias.forEach(element => {
        diasHabiles.push(element.cliDha_codigoDia)
      })
      horarioCliente.value.diasHabiles = diasHabiles
      console.log('Días hábiles configurados:', horarioCliente.value.diasHabiles)
    }
  } catch (error) {
    console.error('Error cargando días hábiles del cliente:', error)
    console.warn('Usando todos los días por defecto')
  }
}

onMounted(async () => {
  console.log('Parámetros recibidos:', {
    codigoProgramacion: codigoProgramacion.value,
    nombreProgramacion: nombreProgramacion.value
  })

  if (!codigoProgramacion.value || !nombreProgramacion.value) {
    console.warn('Faltan parámetros, redirigiendo...')
    router.push({ name: 'ProgramaMusica' })
    return
  }

  console.log('Iniciando carga de datos...')

  // Cargar horario y días hábiles primero
  await cargarHorarioCliente()
  await cargarDiasHabilesCliente()

  // Luego cargar el resto de datos en paralelo
  await Promise.all([
    cargarRadios(),
    cargarProgramaciones(),
    cargarFiltros(),
    cargarGenerosMusicales()
  ])
  console.log('Carga de datos completada')

  // Listener para controlar filtros según tamaño de pantalla
  window.addEventListener('resize', handleFiltersResize)
})

// Función para controlar filtros según tamaño de pantalla
const handleFiltersResize = () => {
  if (window.innerWidth > 1024) {
    showFilters.value = true // Siempre expandido en desktop
  }
}

// Cleanup
onUnmounted(() => {
  window.removeEventListener('resize', handleFiltersResize)
})
</script>

<style scoped>
.programacion-semanal-page {
  min-height: 100vh;
  background: #0f1419;
  position: relative;
  color: #e5e7eb;
}

/* Header */
.page-header {
  padding: 1.5rem 0;
  background: #16181d;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #22252d;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.5rem;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-back:hover {
  background: #2a2d35;
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateX(-2px);
}

.btn-back svg {
  width: 16px;
  height: 16px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0 0 5px 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-edit-programacion {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit-programacion:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.btn-edit-programacion svg {
  width: 16px;
  height: 16px;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(67, 233, 123, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save svg {
  width: 16px;
  height: 16px;
}

/* Content */
.content-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  align-items: start;
}

/* Radios Sidebar */
.radios-sidebar {
  background: #16181d;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  overflow: hidden;
  max-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 20px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 1.2rem;
  color: white;
  margin: 0;
}

.radios-count {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

.filters-section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filters-toggle {
  display: none; /* Oculto por defecto en desktop */
  width: 100%;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
}

.filters-toggle:hover {
  background: rgba(255, 255, 255, 0.08);
}

.filters-toggle svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.filters-toggle .chevron {
  transition: transform 0.3s;
}

.filters-toggle .chevron.rotate {
  transform: rotate(180deg);
}

.filters-content {
  padding: 20px;
  /* En desktop siempre visible */
  max-height: none;
  overflow: visible;
}

.search-box {
  position: relative;
  margin-bottom: 15px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.5);
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  background: rgba(12, 12, 12, 0.9);
  border: 2px solid rgba(40, 40, 40, 0.8);
  border-radius: 8px;
  color: #f5f5f5;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.filter-group {
  margin-bottom: 15px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  width: 100%;
  padding: 10px;
  background: rgba(12, 12, 12, 0.9);
  border: 2px solid rgba(40, 40, 40, 0.8);
  border-radius: 8px;
  color: #f5f5f5;
  font-size: 14px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Radios List */
.radios-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.radio-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: move;
  transition: all 0.2s;
}

.radio-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.radio-card.dragging {
  opacity: 0.5;
}

.radio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.radio-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-icon svg {
  width: 16px;
  height: 16px;
  color: white;
}

.drag-handle {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.4);
}

.drag-handle svg {
  width: 16px;
  height: 16px;
}

.radio-content {
  padding-left: 8px;
}

.radio-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0 0 6px 0;
}

.radio-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.radio-genre,
.radio-subgenre {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-radios {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-radios svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-radios p {
  margin: 0;
  font-size: 14px;
}

/* ===== NUEVA TABLA RESPONSIVA DE PROGRAMACIONES ===== */

.programaciones-table-section {
  background: #16181d;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: 16px;
}

.table-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.table-header-left h2 {
  font-size: 1.3rem;
  color: white;
  margin: 0;
  font-weight: 700;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  color: rgba(59, 130, 246, 1);
  font-size: 0.85rem;
  font-weight: 600;
}

.table-header-right {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-day-group {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-day-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.filter-day-select {
  padding: 6px 12px;
  background: rgba(10, 10, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 150px;
  transition: all 0.2s;
}

.filter-day-select:hover {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(15, 15, 25, 0.9);
}

.filter-day-select:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.8);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-toggle:hover {
  background: rgba(102, 126, 234, 0.25);
  transform: translateY(-1px);
}

.btn-view-toggle svg {
  width: 18px;
  height: 18px;
}

/* ===== VISTA TABLA ===== */

.table-container {
  padding: 0;
  overflow: hidden;
}

.responsive-table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
}

.programaciones-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.programaciones-table thead {
  background: rgba(255, 255, 255, 0.03);
}

.programaciones-table th {
  padding: 16px 20px;
  text-align: left;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.th-sticky {
  position: sticky;
  left: 0;
  background: rgba(26, 26, 45, 0.98);
  z-index: 10;
  min-width: 140px;
}

.th-actions {
  text-align: center;
  width: 140px;
}

.table-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.programaciones-table td {
  padding: 16px 20px;
  vertical-align: top;
}

.td-day {
  position: sticky;
  left: 0;
  background: #16181d;
  z-index: 5;
  min-width: 140px;
}

.table-row:hover .td-day {
  background: rgba(20, 20, 35, 1);
}

.day-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day-name-table {
  font-weight: 700;
  color: white;
  font-size: 1rem;
}

.day-badge {
  background: rgba(102, 126, 234, 0.2);
  color: rgba(102, 126, 234, 1);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.td-programs {
  width: auto;
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.program-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 8px;
  transition: all 0.2s;
}

.program-item:hover {
  background: rgba(102, 126, 234, 0.12);
  border-color: rgba(102, 126, 234, 0.25);
  transform: translateX(2px);
}

.program-icon-small {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.program-icon-small svg {
  width: 18px;
  height: 18px;
  color: white;
}

.program-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.program-name {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.program-time {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.program-actions-inline {
  display: flex;
  gap: 6px;
}

.btn-icon-edit,
.btn-icon-delete {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-edit {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: rgba(59, 130, 246, 1);
}

.btn-icon-edit:hover {
  background: rgba(59, 130, 246, 0.25);
  transform: scale(1.05);
}

.btn-icon-delete {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgba(239, 68, 68, 1);
}

.btn-icon-delete:hover {
  background: rgba(239, 68, 68, 0.25);
  transform: scale(1.05);
}

.btn-icon-edit svg,
.btn-icon-delete svg {
  width: 16px;
  height: 16px;
}

.empty-programs {
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-style: italic;
}

.td-actions {
  text-align: center;
  vertical-align: middle;
}

.btn-add-program {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add-program:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
}

.btn-add-program svg {
  width: 16px;
  height: 16px;
}

/* Formulario inline en tabla */
.inline-form-table {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.form-select-inline,
.form-time-inline {
  padding: 8px 12px;
  background: rgba(10, 10, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
}

.form-select-inline {
  min-width: 180px;
  flex: 1;
}

.form-time-inline {
  width: auto;
}

.time-separator {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.btn-save-inline,
.btn-cancel-inline {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-inline {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: rgba(16, 185, 129, 1);
}

.btn-save-inline:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.3);
  transform: scale(1.05);
}

.btn-save-inline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel-inline {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: rgba(239, 68, 68, 1);
}

.btn-cancel-inline:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.05);
}

.btn-save-inline svg,
.btn-cancel-inline svg {
  width: 16px;
  height: 16px;
}

/* ===== VISTA TARJETAS (MOBILE) ===== */

.cards-view {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.day-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.day-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.day-card-header {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day-name-card {
  font-weight: 700;
  color: white;
  font-size: 1.1rem;
}

.day-count-badge {
  background: rgba(102, 126, 234, 0.2);
  color: rgba(102, 126, 234, 1);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.btn-add-card {
  width: 36px;
  height: 36px;
  padding: 0;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-add-card:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4);
}

.btn-add-card svg {
  width: 20px;
  height: 20px;
}

.inline-form-card {
  padding: 16px;
  background: rgba(59, 130, 246, 0.08);
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-select-card {
  width: 100%;
  padding: 10px 14px;
  background: rgba(10, 10, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
}

.time-inputs-card {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.time-inputs-card span {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  font-size: 1.2rem;
}

.form-time-card {
  flex: 1;
  padding: 10px 14px;
  background: rgba(10, 10, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  text-align: center;
}

.form-actions-card {
  display: flex;
  gap: 10px;
}

.btn-save-card,
.btn-cancel-card {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-card {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.btn-save-card:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4);
}

.btn-save-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel-card {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: rgba(239, 68, 68, 1);
}

.btn-cancel-card:hover {
  background: rgba(239, 68, 68, 0.3);
}

.day-card-body {
  padding: 16px;
}

.programs-list-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.program-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 8px;
  transition: all 0.2s;
}

.program-card-item:hover {
  background: rgba(102, 126, 234, 0.12);
  border-color: rgba(102, 126, 234, 0.25);
}

.program-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.program-card-icon svg {
  width: 20px;
  height: 20px;
  color: white;
}

.program-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.program-card-name {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.program-card-time {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.program-card-actions {
  display: flex;
  gap: 6px;
}

.btn-card-edit,
.btn-card-delete {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-card-edit {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: rgba(59, 130, 246, 1);
}

.btn-card-edit:hover {
  background: rgba(59, 130, 246, 0.25);
  transform: scale(1.05);
}

.btn-card-delete {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgba(239, 68, 68, 1);
}

.btn-card-delete:hover {
  background: rgba(239, 68, 68, 0.25);
  transform: scale(1.05);
}

.btn-card-edit svg,
.btn-card-delete svg {
  width: 18px;
  height: 18px;
}

.empty-day-card {
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.empty-day-card svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-day-card p {
  margin: 0;
  font-size: 0.9rem;
}

/* ===== RESPONSIVE DESIGN ===== */

/* Desktop - Filtros siempre visibles */
@media (min-width: 1025px) {
  .filters-content {
    max-height: none !important;
    overflow: visible !important;
    padding: 20px !important;
  }

  .filters-toggle {
    display: none !important;
  }
}

@media (min-width: 1024px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-header-right {
    width: 100%;
  }

  .btn-view-toggle {
    width: 100%;
    justify-content: center;
  }

  /* Cambiar automáticamente a vista tarjetas en tablets */
  .viewMode {
    display: none;
  }
}

@media (min-width: 768px) {
  .btn-view-toggle{
    display: none; /* Ocultar botón de cambio de vista en móviles */
  }
  .table-container {
    display: none; /* Ocultar tabla en móviles */
  }

  .cards-view {
    display: grid !important; /* Forzar vista tarjetas */
  }

  .table-header {
    padding: 16px;
  }

  .table-header-left h2 {
    font-size: 1.1rem;
  }

  .info-badge {
    font-size: 0.75rem;
    padding: 5px 12px;
  }

  .btn-view-toggle {
    padding: 8px 14px;
    font-size: 0.85rem;
  }

  .cards-view {
    padding: 16px;
    gap: 12px;
  }

  .day-card-header {
    padding: 14px;
  }

  .day-name-card {
    font-size: 1rem;
  }

  .day-card-body {
    padding: 14px;
  }

  .program-card-item {
    padding: 10px;
  }
}

@media (min-width: 576px) {
  .btn-view-toggle{
    display: none; /* Ocultar botón de cambio de vista en móviles */
  }
  .table-header {
    padding: 12px;
  }

  .table-header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .table-header-left h2 {
    font-size: 1rem;
  }

  .cards-view {
    padding: 12px;
  }

  .day-card-header {
    padding: 12px;
  }

  .day-name-card {
    font-size: 0.95rem;
  }

  .program-card-icon {
    width: 36px;
    height: 36px;
  }

  .program-card-icon svg {
    width: 18px;
    height: 18px;
  }

  .program-card-name {
    font-size: 0.9rem;
  }

  .program-card-time {
    font-size: 0.8rem;
  }

  .btn-card-edit,
  .btn-card-delete {
    width: 32px;
    height: 32px;
  }

  .btn-card-edit svg,
  .btn-card-delete svg {
    width: 16px;
    height: 16px;
  }
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
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, rgba(26, 26, 64, 0.98) 0%, rgba(15, 15, 35, 0.98) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
}

.modal-close {
  width: 32px;
  height: 32px;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.15);
}

.modal-close svg {
  width: 16px;
  height: 16px;
}

.modal-body {
  display: flex;
  flex-flow: wrap;
  max-height: 400px;
  overflow-y: scroll;
  padding: 20px;
}

.modal-body p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.modal-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.2);
}

.btn-cancel,
.btn-confirm {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn-confirm {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: 2px solid rgba(239, 68, 68, 0.5);
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(239, 68, 68, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: 2px solid rgba(59, 130, 246, 0.5);
}

.btn-confirm.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4);
}

/* Edit Modal Styles */
.edit-modal {
  max-width: 600px;
  background: linear-gradient(135deg, rgba(26, 26, 64, 0.98) 0%, rgba(15, 15, 35, 0.98) 100%) !important;
}

.edit-modal .modal-body {
  background: transparent !important;
  padding: 30px;
}

.edit-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.edit-info {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.edit-info h4 {
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.edit-day {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.form-group .form-input {
  padding: 14px 18px;
  background: rgba(20, 20, 45, 0.6);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 500;
  transition: all 0.3s;
}

.form-group .form-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(20, 20, 50, 0.8);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.form-group .form-input:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(20, 20, 50, 0.7);
}

.duration-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  border: 2px solid rgba(16, 185, 129, 0.4);
  border-radius: 10px;
  color: rgba(16, 185, 129, 1);
  font-weight: 600;
  font-size: 1rem;
}

.duration-info svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.conflict-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
  border: 2px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  color: rgba(255, 100, 100, 1);
  font-size: 0.95rem;
  font-weight: 600;
}

.conflict-warning svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

/* Programming Block Styles */
.programming-block {
  cursor: pointer;
  transition: all 0.2s;
}

.programming-block:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.programming-actions {
  display: flex;
  gap: 4px;
}

.btn-edit {
  width: 20px;
  height: 20px;
  padding: 0;
  background: rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-edit:hover {
  background: rgba(59, 130, 246, 0.5);
}

.btn-edit svg {
  width: 12px;
  height: 12px;
}

/* Responsive */
@media (min-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .radios-sidebar {
    max-height: 50vh;
    position: static;
  }

  .calendar-grid {
    font-size: 12px;
  }

  .time-slot,
  .hour-slot {
    height: 50px;
  }

  /* Mostrar botón de filtros en tablets */
  .filters-toggle {
    display: flex;
  }

  /* Solo colapsar en tablets si no está expandido */
  .filters-section .filters-content {
    max-height: 0;
    overflow: hidden;
    padding: 0;
    transition: all 0.3s ease-in-out;
  }

  .filters-section .filters-content.expanded {
    max-height: 800px;
    padding: 20px;
  }

  /* Ajustar filtro de día en tablets */
  .filter-day-group {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 8px;
  }

  .filter-day-select {
    width: 100%;
  }
}

@media (min-width: 768px) {
  .page-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-edit-programacion,
  .btn-save {
    width: 100%;
    justify-content: center;
  }

  .content-container {
    padding: 20px;
  }

  .calendar-grid {
    grid-template-columns: 60px repeat(auto-fit, minmax(100px, 1fr));
  }

  /* Filtros colapsados por defecto en móvil */
  .filters-toggle {
    display: flex;
  }

  .filters-section .filters-content {
    max-height: 0;
    padding: 0;
    overflow: hidden;
  }

  .filters-section .filters-content.expanded {
    max-height: 1000px;
    padding: 16px;
    overflow: visible;
  }

  /* Filtro de día en móvil */
  .table-header-right {
    width: 100%;
    flex-direction: column;
  }

  .filter-day-group {
    width: 100%;
  }

  .btn-view-toggle {
    width: 100%;
    justify-content: center;
  }
}

@media (min-width: 576px) {
  .programacion-semanal-page {
    padding: 10px;
  }

  .page-header {
    padding: 15px;
    margin-bottom: 15px;
  }

  .header-content {
    gap: 15px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  /* Optimizar filtros en móviles pequeños */
  .filters-toggle {
    padding: 12px 16px;
    font-size: 0.9rem;
  }

  .filters-section .filters-content.expanded {
    padding: 12px;
  }

  .filter-group {
    margin-bottom: 12px;
  }

  .filter-group label {
    font-size: 11px;
  }

  .filter-select,
  .search-input {
    padding: 8px;
    font-size: 13px;
  }

  /* Filtro de día compacto */
  .filter-day-group {
    padding: 6px 12px;
  }

  .filter-day-group label {
    font-size: 0.8rem;
  }

  .filter-day-select {
    padding: 5px 10px;
    font-size: 0.85rem;
    min-width: unset;
  }
}

  .page-subtitle {
    font-size: 0.8rem;
  }

  .header-actions {
    gap: 8px;
   }

  .btn-edit-programacion,
  .btn-save {
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  .content-container {
    padding: 15px;
  }

  .content-wrapper {
    gap: 20px;
  }

  .radios-sidebar {
    max-height: 100vh;
  }

  .sidebar-header {
    padding: 15px;
  }

  .sidebar-header h2 {
    font-size: 1rem;
  }

  .radios-count {
    font-size: 0.8rem;
    padding: 3px 8px;
  }

  .filters-section {
    padding: 15px;
  }

  .search-box {
    margin-bottom: 12px;
  }

  .search-input {
    padding: 8px 8px 8px 35px;
    font-size: 13px;
  }

  .search-icon {
    width: 16px;
    height: 16px;
    left: 10px;
  }

  .filter-group label {
    font-size: 11px;
  }

  .filter-select {
    padding: 8px;
    font-size: 13px;
  }

  .radios-list {
    padding: 15px;
  }

  .radio-card {
    padding: 10px;
    margin-bottom: 8px;
  }

  .radio-header {
    margin-bottom: 6px;
  }

  .radio-icon {
    width: 28px;
    height: 28px;
  }

  .radio-icon svg {
    width: 14px;
    height: 14px;
  }

  .drag-handle svg {
    width: 14px;
    height: 14px;
  }

  .radio-content {
    padding-left: 6px;
  }

  .radio-name {
    font-size: 13px;
    margin-bottom: 4px;
  }

  .radio-meta {
    gap: 4px;
  }

  .radio-genre,
  .radio-subgenre {
    font-size: 10px;
    padding: 1px 6px;
  }

  .empty-radios {
    padding: 30px 15px;
  }

  .empty-radios svg {
    width: 40px;
    height: 40px;
    margin-bottom: 10px;
  }

  .empty-radios p {
    font-size: 13px;
  }

  .calendar-section {
    overflow-x: auto;
  }

  .calendar-header {
    padding: 15px;
  }

  .calendar-header h2 {
    font-size: 1rem;
  }

  .calendar-info {
    gap: 8px;
  }

  .info-badge {
    font-size: 0.75rem;
    padding: 5px 10px;
  }

  .calendar-grid {
    grid-template-columns: 50px repeat(auto-fit, minmax(80px, 1fr));
    font-size: 11px;
  }

  .time-column,
  .day-column {
    min-width: 80px;
  }

  .time-header,
  .day-header {
    padding: 10px;
  }

  .day-name {
    font-size: 12px;
  }

  .day-number {
    font-size: 10px;
  }

  .time-slot,
  .hour-slot {
    height: 45px;
    padding: 6px;
  }

  .programming-block {
    padding: 6px;
    min-height: 45px;
  }

  .programming-content {
    gap: 2px;
  }

  .programming-header {
    margin-bottom: 2px;
  }

  .programming-name {
    font-size: 12px;
    line-height: 1.2;
  }

  .programming-actions {
    gap: 2px;
  }

  .btn-edit,
  .btn-remove {
    width: 18px;
    height: 18px;
  }

  .btn-edit svg,
  .btn-remove svg {
    width: 10px;
    height: 10px;
  }

  .programming-time {
    font-size: 10px;
    margin-top: auto;
  }

  .modal-overlay {
    padding: 15px;
  }

  .modal-content {
    max-width: 95vw;
    margin: 0;
  }

  .modal-header {
    padding: 15px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-body {
    padding: 15px;
  }

  .modal-body p {
    font-size: 0.9rem;
  }

  .modal-info {
    font-size: 13px;
    padding: 8px;
  }

  .modal-footer {
    padding: 15px 20px;
    gap: 10px;
  }

  .btn-cancel,
  .btn-confirm {
    padding: 10px 24px;
    font-size: 0.9rem;
  }

  .edit-modal .modal-body {
    padding: 20px;
  }

  .edit-section {
    gap: 18px;
  }

  .edit-info {
    padding: 18px;
  }

  .edit-info h4 {
    font-size: 1.2rem;
  }

  .edit-day {
    font-size: 0.9rem;
  }

  .form-group {
    gap: 8px;
  }

  .form-group label {
    font-size: 0.85rem;
  }

  .form-group .form-input {
    padding: 12px 16px;
    font-size: 0.95rem;
  }

  .duration-info {
    padding: 12px 18px;
    font-size: 0.9rem;
  }

  .duration-info svg {
    width: 20px;
    height: 20px;
  }

  .conflict-warning {
    padding: 12px 18px;
    font-size: 0.85rem;
  }

  .conflict-warning svg {
    width: 20px;
    height: 20px;
  }

  .floating-magic-btn {
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    font-size: 0.9rem;
  }

  .floating-btn-content {
    gap: 8px;
  }

  .magic-icon {
    width: 20px;
    height: 20px;
  }

  .floating-btn-count {
    padding: 2px 8px;
    font-size: 0.8rem;
  }

  .floating-btn-label {
    font-size: 0.7rem;
  }

  .magic-modal {
    max-width: 95vw;
  }

  .magic-summary {
    padding: 15px;
  }

  .magic-summary h4 {
    font-size: 1rem;
  }

  .selected-radios-preview {
    gap: 6px;
  }

  .radio-tag {
    padding: 5px 10px;
    font-size: 0.8rem;
  }

  .magic-config {
    margin-bottom: 18px;
  }

  .magic-config h4 {
    font-size: 1rem;
  }

  .distribution-modes {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .mode-option {
    padding: 14px;
  }

  .mode-content svg {
    width: 28px;
    height: 28px;
  }

  .mode-title {
    font-size: 0.9rem;
  }

  .mode-content small {
    font-size: 0.75rem;
  }

  .checkbox-option {
    padding: 14px;
  }

  .checkbox-option span {
    font-size: 0.9rem;
  }

  .magic-preview {
    padding: 15px;
  }

  .preview-info {
    gap: 12px;
  }

  .preview-info svg {
    width: 20px;
    height: 20px;
  }

  .preview-info p {
    font-size: 0.9rem;
  }

  .btn-magic {
    padding: 12px 24px;
    font-size: 0.9rem;
  }

  .btn-magic svg {
    width: 18px;
    height: 18px;
  }


/* ===== ESTILOS PARA DISTRIBUCIÓN MÁGICA ===== */

/* Checkbox en radios */
.radio-checkbox {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.radio-checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.radio-card.selected {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
}

/* Botón flotante mágico */
.floating-magic-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50px;
  padding: 15px 25px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.floating-magic-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
}

.floating-magic-btn.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.floating-btn-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.magic-icon {
  width: 24px;
  height: 24px;
}

.floating-btn-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
}

.floating-btn-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

/* Modal mágico */
.magic-modal {
  max-width: 700px;
}

.magic-summary {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.magic-summary h4 {
  color: white;
  margin: 0 0 12px 0;
  font-size: 1.1rem;
}

.selected-radios-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.radio-tag {
  background: rgba(102, 126, 234, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid rgba(102, 126, 234, 0.4);
}

.magic-config {
  margin-bottom: 24px;
}

.magic-config h4 {
  color: white;
  margin: 0 0 16px 0;
  font-size: 1.1rem;
}

.distribution-modes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.mode-option {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
}

.mode-option:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.mode-option.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.6);
}

.mode-option input[type="radio"] {
  display: none;
}

.mode-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.mode-content svg {
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.8);
}

.mode-title {
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.mode-content small {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  line-height: 1.3;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-option:hover {
  background: rgba(255, 255, 255, 0.08);
}

.checkbox-option input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-option span {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.magic-preview {
  padding: 20px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.preview-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.preview-info svg {
  width: 24px;
  height: 24px;
  color: rgba(16, 185, 129, 1);
  flex-shrink: 0;
  margin-top: 2px;
}

.preview-info div {
  flex: 1;
}

.preview-info p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.preview-info p:last-child {
  margin-bottom: 0;
}

.preview-info strong {
  color: white;
  font-weight: 600;
}

.btn-magic {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid rgba(102, 126, 234, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-magic:hover:not(:disabled) {
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8a 100%);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
}

.btn-magic svg {
  width: 20px;
  height: 20px;
}

/* Estilos para formulario inline de nueva programación */
.new-prog-form {
  padding: 10px 0 8px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.03);
}

.form-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.form-select {
  min-width: 220px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(12,12,12,0.9);
  color: #fff;
  border: 1px solid rgba(40,40,40,0.8);
}

.form-input-time {
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(12,12,12,0.9);
  color: #fff;
  border: 1px solid rgba(40,40,40,0.8);
  width: 120px;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.btn-add {
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 700;
}
</style>
