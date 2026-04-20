<template>
  <div class="page-wrapper">
    <!-- Header Section - Mobile First -->
    <div
      class="page-header"
      data-tour="music-header"
    >
      <!-- Mobile: Stacked Layout -->
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Top Row: Back button + Title -->
        <div class="flex items-center gap-3">
          <button
            class="btn btn-secondary btn-sm lg:btn-md flex-shrink-0"
            @click="volverAtras"
          >
            <svg
              class="w-4 h-4 lg:w-5 lg:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span class="hidden sm:inline ml-1">Volver</span>
          </button>
          <div class="min-w-0 flex-1">
            <h1 class="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              {{ nombreProgramacion }}
            </h1>
            <p class="text-xs sm:text-sm text-text-secondary hidden sm:block">
              Programación semanal de música
            </p>
          </div>
        </div>
        
        <!-- Actions: Full width on mobile, auto on desktop -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            class="btn btn-success btn-sm sm:btn-md flex-1 sm:flex-none justify-center"
            data-tour="music-add"
            @click="abrirModalNuevaProgramacion"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span class="text-sm sm:text-base">Nueva Programación</span>
          </button>
          <button
            class="btn btn-primary btn-sm sm:btn-md flex-1 sm:flex-none justify-center"
            @click="irAEditarProgramacion"
          >
            <i class="fas fa-edit mr-1 sm:mr-2 text-sm" />
            <span class="text-sm sm:text-base">Editar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="page-content">
      <!-- Loading State -->
      <LoadingOverlay
        v-if="isLoading"
        message="Cargando programación..."
      />

      <div v-else>
        <!-- Header con info y controles - Mobile First -->
        <div class="mb-4 sm:mb-6">
          <!-- Info bar -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-info text-xs sm:text-sm">
                <svg
                  class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ horarioCliente.horaDesde }} - {{ horarioCliente.horaHasta }}
              </span>
              <span
                class="badge text-xs sm:text-sm"
                :class="hayFiltrosActivos ? 'badge-warning' : 'badge-secondary'"
              >
                <svg
                  class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <template v-if="hayFiltrosActivos">
                  {{ filteredProgramacionesPorRadio.length }}/{{ radios.length }}
                </template>
                <template v-else>
                  {{ radios.length }} carpeta{{ radios.length !== 1 ? 's' : '' }}
                </template>
              </span>
              <span
                class="badge text-xs sm:text-sm"
                :class="hayFiltrosActivos ? 'badge-warning' : 'badge-primary'"
              >
                <svg
                  class="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <template v-if="hayFiltrosActivos">
                  {{ totalProgramacionesFiltradas }}/{{ programaciones.length }} prog.
                </template>
                <template v-else>
                  {{ totalCarpetasProgramadas }} programada{{ totalCarpetasProgramadas !== 1 ? 's' : '' }}
                </template>
              </span>
            </div>
            
            <!-- Botones de acciones rápidas -->
            <div
              class="flex flex-wrap items-center gap-2"
              data-tour="music-filter"
            >
              <button
                class="btn btn-sm text-xs sm:text-sm"
                :class="showFilters ? 'btn-primary' : 'btn-secondary'"
                @click="showFilters = !showFilters"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span class="hidden sm:inline ml-1">Filtros</span>
                <span
                  v-if="hayFiltrosActivos"
                  class="ml-1 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full"
                >
                  !
                </span>
              </button>
              <button
                v-if="!modoSeleccion && totalProgramacionesVisibles > 0"
                class="btn btn-secondary btn-sm text-xs sm:text-sm"
                @click="toggleModoSeleccion"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span class="hidden sm:inline ml-1">Seleccionar</span>
              </button>
            </div>
          </div>

          <!-- Panel de Filtros Expandible - Mobile First -->
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-96"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-96"
            leave-to-class="opacity-0 max-h-0"
          >
            <div
              v-if="showFilters"
              class="overflow-hidden"
            >
              <div class="p-3 sm:p-4 mb-4 bg-dark-secondary border border-dark-border rounded-lg">
                <!-- Grid de filtros responsive -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  <!-- Búsqueda por nombre -->
                  <div class="sm:col-span-2">
                    <label class="text-xs text-text-secondary mb-1 block">Buscar carpeta</label>
                    <div class="relative">
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="input input-sm w-full pl-8 text-sm"
                        placeholder="Nombre, género..."
                        :disabled="modoSeleccion"
                      >
                      <svg
                        class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <button
                        v-if="searchQuery"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                        @click="searchQuery = ''"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Filtro por género -->
                  <div>
                    <label class="text-xs text-text-secondary mb-1 block">Género</label>
                    <select
                      v-model="selectedGeneroFilter"
                      class="select select-sm w-full text-sm"
                      :disabled="modoSeleccion"
                    >
                      <option :value="null">Todos</option>
                      <option
                        v-for="genero in generosUnicos"
                        :key="'genero-'+genero"
                        :value="genero"
                      >
                        {{ genero }}
                      </option>
                    </select>
                  </div>

                  <!-- Filtro por día -->
                  <div>
                    <label class="text-xs text-text-secondary mb-1 block">Día</label>
                    <select
                      v-model="selectedDayFilter"
                      class="select select-sm w-full text-sm"
                      :disabled="modoSeleccion"
                    >
                      <option :value="null">Todos los días</option>
                      <option
                        v-for="day in daysOfWeek"
                        :key="day.value"
                        :value="day.value"
                      >
                        {{ day.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Filtro hora desde -->
                  <div>
                    <label class="text-xs text-text-secondary mb-1 block">Hora desde</label>
                    <input
                      v-model="horaDesdeFilter"
                      type="time"
                      class="input input-sm w-full text-sm"
                      :disabled="modoSeleccion"
                      @focus="$event.target.showPicker?.()"
                      @click="$event.target.showPicker?.()"
                    >
                  </div>

                  <!-- Filtro hora hasta -->
                  <div>
                    <label class="text-xs text-text-secondary mb-1 block">Hora hasta</label>
                    <input
                      v-model="horaHastaFilter"
                      type="time"
                      class="input input-sm w-full text-sm"
                      :disabled="modoSeleccion"
                      @focus="$event.target.showPicker?.()"
                      @click="$event.target.showPicker?.()"
                    >
                  </div>
                </div>

                <!-- Fila de opciones adicionales y acciones -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 pt-3 border-t border-dark-border">
                  <!-- Checkbox solo programadas -->
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="soloProgramadas"
                      type="checkbox"
                      class="checkbox checkbox-sm checkbox-primary"
                      :disabled="modoSeleccion"
                    >
                    <span class="text-sm text-text-secondary">Solo carpetas con programaciones</span>
                  </label>

                  <!-- Botón limpiar filtros -->
                  <button
                    v-if="hayFiltrosActivos"
                    class="btn btn-ghost btn-sm text-xs sm:text-sm text-primary-400 hover:text-primary-300"
                    @click="limpiarFiltros"
                  >
                    <svg
                      class="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Limpiar filtros
                  </button>
                </div>

                <!-- Resumen de filtros activos -->
                <div
                  v-if="hayFiltrosActivos"
                  class="mt-3 pt-3 border-t border-dark-border"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs text-text-secondary">Filtros activos:</span>
                    <span
                      v-if="searchQuery"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs"
                    >
                      "{{ searchQuery }}"
                      <button
                        class="hover:text-primary-300"
                        @click="searchQuery = ''"
                      >×</button>
                    </span>
                    <span
                      v-if="selectedGeneroFilter"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs"
                    >
                      {{ selectedGeneroFilter }}
                      <button
                        class="hover:text-primary-300"
                        @click="selectedGeneroFilter = null"
                      >×</button>
                    </span>
                    <span
                      v-if="selectedDayFilter !== null"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs"
                    >
                      {{ daysOfWeek.find(d => d.value === selectedDayFilter)?.label }}
                      <button
                        class="hover:text-primary-300"
                        @click="selectedDayFilter = null"
                      >×</button>
                    </span>
                    <span
                      v-if="horaDesdeFilter"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs"
                    >
                      Desde {{ horaDesdeFilter }}
                      <button
                        class="hover:text-primary-300"
                        @click="horaDesdeFilter = null"
                      >×</button>
                    </span>
                    <span
                      v-if="horaHastaFilter"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs"
                    >
                      Hasta {{ horaHastaFilter }}
                      <button
                        class="hover:text-primary-300"
                        @click="horaHastaFilter = null"
                      >×</button>
                    </span>
                    <span
                      v-if="soloProgramadas"
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs"
                    >
                      Solo programadas
                      <button
                        class="hover:text-primary-300"
                        @click="soloProgramadas = false"
                      >×</button>
                    </span>
                  </div>
                  <p class="text-xs text-text-secondary mt-2">
                    Mostrando {{ filteredProgramacionesPorRadio.length }} de {{ radios.length }} carpetas
                  </p>
                </div>
              </div>
            </div>
          </transition>

          <!-- Barra de herramientas de selección múltiple - Responsive -->
          <div
            v-if="modoSeleccion"
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 mb-4 bg-primary-500/10 border border-primary-500/30 rounded-lg"
          >
            <div class="flex flex-wrap items-center gap-2 sm:gap-4">
              <span class="font-medium text-sm">
                {{ programacionesSeleccionadas.length }}/{{ totalProgramacionesVisibles }}
              </span>
              <button
                v-if="programacionesSeleccionadas.length < totalProgramacionesVisibles"
                class="btn btn-secondary btn-xs sm:btn-sm"
                @click="seleccionarTodasProgramaciones"
              >
                Todas
              </button>
              <button
                v-if="programacionesSeleccionadas.length > 0"
                class="btn btn-secondary btn-xs sm:btn-sm"
                @click="deseleccionarTodasProgramaciones"
              >
                Ninguna
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="btn btn-danger btn-sm flex-1 sm:flex-none"
                :disabled="programacionesSeleccionadas.length === 0"
                @click="abrirModalEliminarMultiple"
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span class="text-xs sm:text-sm">{{ programacionesSeleccionadas.length }}</span>
              </button>
              <button
                class="btn btn-secondary btn-sm"
                @click="cancelarModoSeleccion"
              >
                <span class="hidden sm:inline">Cancelar</span>
                <svg
                  class="w-4 h-4 sm:hidden"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Vista de Carpetas de Música - Grid Responsive -->
        <div
          v-if="filteredProgramacionesPorRadio.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
          data-tour="music-schedule"
        >
          <!-- Carpeta de Música -->
          <div
            v-for="radio in filteredProgramacionesPorRadio"
            :key="radio.codRadio"
            class="music-folder group relative bg-dark-secondary rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg"
            :class="[
              radio.tieneProgramaciones 
                ? 'border-dark-border hover:border-primary-500/50 hover:shadow-primary-500/10' 
                : 'border-dashed border-dark-border/50 hover:border-primary-500/30 opacity-80 hover:opacity-100',
              { 'ring-2 ring-primary-500': radioExpandido === radio.codRadio }
            ]"
          >
            <!-- Header de la carpeta con imagen -->
            <div
              class="relative cursor-pointer"
              @click="radio.tieneProgramaciones ? toggleRadioExpandido(radio.codRadio) : abrirModalProgramacionParaRadio(radio)"
            >
              <!-- Imagen de fondo -->
              <div class="aspect-[4/3] sm:aspect-video overflow-hidden bg-dark-primary">
                <img
                  v-if="radio.img"
                  :src="radio.img"
                  :alt="radio.nombre"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  :class="{ 'grayscale opacity-60': !radio.tieneProgramaciones }"
                  loading="lazy"
                  @error="$event.target.src = '/img/default-folder.png'"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-700/20"
                  :class="{ 'from-gray-500/10 to-gray-700/10': !radio.tieneProgramaciones }"
                >
                  <!-- Icono de carpeta de música -->
                  <svg
                    class="w-12 h-12 sm:w-16 sm:h-16"
                    :class="radio.tieneProgramaciones ? 'text-primary-500/60' : 'text-gray-500/40'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
              </div>
              
              <!-- Overlay gradiente -->
              <div class="absolute inset-0 bg-gradient-to-t from-dark-secondary via-transparent to-transparent" />
              
              <!-- Badge de cantidad de programaciones o indicador vacío -->
              <div class="absolute top-2 right-2 flex gap-1">
                <span
                  v-if="radio.tieneProgramaciones"
                  class="badge badge-primary text-xs font-semibold shadow-lg"
                >
                  {{ radio.programaciones.length }}
                </span>
                <span
                  v-else
                  class="badge text-xs font-medium shadow-lg bg-gray-600/80 text-gray-300"
                >
                  Sin prog.
                </span>
              </div>
              
              <!-- Botón agregar (siempre visible en hover) -->
              <button
                class="absolute top-2 left-2 p-1.5 rounded-lg bg-primary-500 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-600"
                title="Agregar programación"
                @click.stop="abrirModalProgramacionParaRadio(radio)"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
              
              <!-- Indicador de expandido -->
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <div class="flex items-end justify-between">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm sm:text-base font-semibold text-white truncate drop-shadow-lg">
                      {{ radio.nombre }}
                    </h3>
                    <p
                      v-if="radio.genero"
                      class="text-xs text-gray-300 truncate drop-shadow"
                    >
                      {{ radio.genero }}
                    </p>
                  </div>
                  <svg
                    v-if="radio.tieneProgramaciones"
                    class="w-5 h-5 text-white/70 transition-transform flex-shrink-0 ml-2"
                    :class="{ 'rotate-180': radioExpandido === radio.codRadio }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Contenido: Días y horarios -->
            <div class="p-3">
              <!-- Si no tiene programaciones: mostrar call-to-action -->
              <div
                v-if="!radio.tieneProgramaciones"
                class="text-center py-2"
              >
                <p class="text-xs text-text-secondary mb-2">Carpeta sin programar</p>
                <button
                  class="btn btn-primary btn-xs w-full"
                  @click="abrirModalProgramacionParaRadio(radio)"
                >
                  <svg
                    class="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Agregar horario
                </button>
              </div>
              
              <!-- Vista compacta: badges de días (si tiene programaciones) -->
              <div
                v-else-if="radioExpandido !== radio.codRadio"
                class="flex flex-wrap gap-1"
              >
                <span
                  v-for="dia in Object.keys(radio.programacionesPorDia).slice(0, 7)"
                  :key="'compact-'+radio.codRadio+'-'+dia"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-dark-primary text-text-secondary"
                >
                  {{ getDiaNombreCorto(parseInt(dia)) }}
                  <span class="ml-1 text-primary-400">{{ radio.programacionesPorDia[dia].length }}</span>
                </span>
              </div>
              
              <!-- Vista expandida: detalle de programaciones -->
              <div
                v-else
                class="space-y-2"
              >
                <!-- Botón agregar más -->
                <button
                  class="w-full py-1.5 px-2 rounded-lg border border-dashed border-primary-500/50 text-primary-400 text-xs hover:bg-primary-500/10 transition-colors flex items-center justify-center gap-1"
                  @click.stop="abrirModalProgramacionParaRadio(radio)"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Agregar horario
                </button>
                
                <div
                  v-for="(progs, dia) in radio.programacionesPorDia"
                  :key="'expanded-'+radio.codRadio+'-'+dia"
                  class="bg-dark-primary rounded-lg p-2"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-semibold text-primary-400 uppercase">
                      {{ getDiaNombre(parseInt(dia)) }}
                    </span>
                    <span class="text-xs text-text-secondary">
                      ({{ progs.length }})
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <div
                      v-for="prog in progs"
                      :key="prog.cod"
                      class="group/prog flex items-center gap-1 px-2 py-1 rounded bg-dark-secondary text-xs cursor-pointer hover:bg-dark-hover transition-colors"
                      :class="{ 'ring-1 ring-primary-500 bg-primary-500/20': modoSeleccion && isProgramacionSeleccionada(prog) }"
                      @click.stop="modoSeleccion ? toggleSeleccionProgramacion(prog) : null"
                    >
                      <input
                        v-if="modoSeleccion"
                        type="checkbox"
                        :checked="isProgramacionSeleccionada(prog)"
                        class="w-3 h-3 accent-primary-500"
                        @click.stop
                        @change="toggleSeleccionProgramacion(prog)"
                      >
                      <span class="font-mono text-primary-400">
                        {{ prog.horaInicio }}-{{ prog.horaFin }}
                      </span>
                      <!-- Botones de acción en hover -->
                      <div
                        v-if="!modoSeleccion"
                        class="hidden group-hover/prog:flex items-center gap-1 ml-1"
                      >
                        <button
                          class="p-0.5 hover:text-primary-400 transition-colors"
                          title="Editar"
                          @click.stop="editarProgramacion(prog)"
                        >
                          <svg
                            class="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          class="p-0.5 hover:text-red-400 transition-colors"
                          title="Eliminar"
                          @click.stop="eliminarProgramacion(prog)"
                        >
                          <svg
                            class="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío: No hay carpetas de música disponibles -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-12 sm:py-16 text-center"
        >
          <div class="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-full bg-dark-secondary flex items-center justify-center">
            <svg
              class="w-10 h-10 sm:w-12 sm:h-12 text-text-secondary opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h3 class="text-lg sm:text-xl font-semibold text-text-primary mb-2">
            Sin carpetas de música
          </h3>
          <p class="text-sm sm:text-base text-text-secondary mb-4 max-w-md">
            No hay carpetas de música disponibles. Crea carpetas de música primero desde la sección de Radios/Carpetas.
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de Nueva Programacion Multiple -->
    <Modal
v-model="showNuevaProgramacionModal"
size="lg"
:closable="true"
title="Nueva Programacion"
>
      <template #default>
        <div class="p-6 space-y-6">
          <!-- Selector de Radio -->
          <div class="form-group">
            <label class="label">Radio / Carpeta de musica</label>
            <select
v-model="formProgramacion.codRadio"
class="select"
>
              <option
:value="null"
disabled
>
Seleccionar radio...
</option>
              <option
v-for="r in radios"
:key="'modal-radio-'+r.codRadio"
:value="r.codRadio"
>
                {{ r.nombre }}
              </option>
            </select>
          </div>

          <!-- Selector de Dias -->
          <div class="form-group">
            <label class="label">Dias de la semana</label>
            <div class="flex flex-wrap gap-3 mt-2">
              <label
                v-for="day in daysOfWeek"
                :key="'day-check-'+day.value"
                class="flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors"
                :class="formProgramacion.diasSeleccionados.includes(day.value)
                  ? 'border-primary-500 bg-primary-500/20'
                  : 'border-dark-border hover:border-primary-400'"
              >
                <input
                  v-model="formProgramacion.diasSeleccionados"
                  type="checkbox"
                  :value="day.value"
                  class="accent-primary-500"
                >
                <span>{{ day.number }}</span>
              </label>
            </div>
            <!-- Botones de seleccion rapida -->
            <div class="flex flex-wrap gap-2 mt-3">
              <button
type="button"
class="btn btn-secondary btn-sm"
@click="seleccionarTodosDias"
>
                Todos
              </button>
              <button
type="button"
class="btn btn-secondary btn-sm"
@click="seleccionarLunesViernes"
>
                Lun-Vie
              </button>
              <button
type="button"
class="btn btn-secondary btn-sm"
@click="seleccionarFinDeSemana"
>
                Fin de semana
              </button>
              <button
type="button"
class="btn btn-secondary btn-sm"
@click="limpiarSeleccionDias"
>
                Limpiar
              </button>
            </div>
          </div>

          <!-- Rango Horario -->
          <div class="form-group">
            <label class="label">Horario</label>
            <div class="flex items-center gap-4 mt-2">
              <div class="flex-1">
                <label class="text-sm text-text-secondary">Desde:</label>
                <input
                  v-model="formProgramacion.horaInicio"
                  type="time"
                  class="input mt-1"
                  :min="horarioCliente.horaDesde"
                  :max="formProgramacion.horaFin"
                  @focus="$event.target.showPicker?.()"
                  @click="$event.target.showPicker?.()"
                >
              </div>
              <div class="flex-1">
                <label class="text-sm text-text-secondary">Hasta:</label>
                <input
                  v-model="formProgramacion.horaFin"
                  type="time"
                  class="input mt-1"
                  :min="formProgramacion.horaInicio"
                  :max="horarioCliente.horaHasta"
                  @focus="$event.target.showPicker?.()"
                  @click="$event.target.showPicker?.()"
                >
              </div>
              <div class="text-text-secondary text-sm pt-5">
                Duracion: {{ calculateDuration(formProgramacion.horaInicio, formProgramacion.horaFin) }}
              </div>
            </div>
          </div>

          <!-- Alerta de Conflictos -->
          <div
v-if="conflictos.length > 0"
class="alert alert-warning"
>
            <div class="flex items-start gap-3">
              <svg
class="w-6 h-6 flex-shrink-0 text-yellow-500"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
/>
              </svg>
              <div>
                <h4 class="font-semibold text-yellow-500">
CONFLICTOS DETECTADOS
</h4>
                <ul class="mt-2 space-y-1 text-sm">
                  <li
v-for="(conflicto, idx) in conflictos"
:key="'conflicto-'+idx"
>
                    <strong>{{ conflicto.dia }}:</strong>
                    <span
v-for="(prog, pIdx) in conflicto.programaciones"
:key="'prog-conflict-'+pIdx"
>
                      {{ prog.radioNombre }} ({{ prog.horaInicio }}-{{ prog.horaFin }}){{ pIdx < conflicto.programaciones.length - 1 ? ', ' : '' }}
                    </span>
                    se superpone
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div
v-if="formProgramacion.diasSeleccionados.length > 0"
class="p-4 bg-dark-secondary rounded-lg"
>
            <p class="text-sm text-text-secondary">
              Se crearan <strong class="text-primary-500">{{ formProgramacion.diasSeleccionados.length }}</strong> programacion(es)
              para los dias seleccionados.
            </p>
          </div>
        </div>

        <!-- Footer del modal -->
        <div class="flex justify-end gap-3 p-6 border-t border-dark-border">
          <button
class="btn btn-secondary"
@click="cerrarModalNuevaProgramacion"
>
            Cancelar
          </button>
          <button
            class="btn btn-success"
            :disabled="isLoading || !formProgramacion.codRadio || formProgramacion.diasSeleccionados.length === 0"
            @click="guardarProgramacionMultiple"
          >
            <svg
v-if="isLoading"
class="animate-spin w-4 h-4 mr-2"
fill="none"
viewBox="0 0 24 24"
>
              <circle
class="opacity-25"
cx="12"
cy="12"
r="10"
stroke="currentColor"
stroke-width="4"
/>
              <path
class="opacity-75"
fill="currentColor"
d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
/>
            </svg>
            Guardar Programacion
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal de Confirmación Eliminación Múltiple -->
    <Modal
v-model="showDeleteMultipleModal"
title="Confirmar eliminacion multiple"
>
      <template #default>
        <div class="p-6">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
class="w-6 h-6 text-red-500"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-lg">
¿Eliminar {{ programacionesSeleccionadas.length }} programacion(es)?
</p>
              <p class="text-text-secondary mt-2">
Esta accion no se puede deshacer.
</p>
            </div>
          </div>

          <!-- Lista de programaciones a eliminar -->
          <div class="mt-4 max-h-48 overflow-y-auto bg-dark-secondary rounded-lg p-3">
            <ul class="space-y-2 text-sm">
              <li
                v-for="prog in programacionesSeleccionadas"
                :key="'delete-'+prog.cod"
                class="flex items-center gap-2"
              >
                <span class="text-red-400">-</span>
                <span class="font-mono text-xs text-text-secondary">{{ prog.horaInicio }}-{{ prog.horaFin }}</span>
                <span>{{ prog.radioNombre }}</span>
                <span class="text-text-secondary">({{ getDiaNombre(prog.numeroDia) }})</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t border-dark-border">
          <button
class="btn btn-secondary"
@click="cancelarEliminarMultiple"
>
            Cancelar
          </button>
          <button
            class="btn btn-danger"
            :disabled="isLoading"
            @click="confirmarEliminarMultiple"
          >
            <svg
v-if="isLoading"
class="animate-spin w-4 h-4 mr-2"
fill="none"
viewBox="0 0 24 24"
>
              <circle
class="opacity-25"
cx="12"
cy="12"
r="10"
stroke="currentColor"
stroke-width="4"
/>
              <path
class="opacity-75"
fill="currentColor"
d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
/>
            </svg>
            Eliminar {{ programacionesSeleccionadas.length }} programacion(es)
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal de Confirmación Eliminar -->
    <Modal
v-model="showDeleteModal"
title="Confirmar eliminacion"
>
      <template #default>
        <div class="p-6">
          <p>¿Está seguro que desea eliminar la programación de <strong>{{ selectedProgramacion?.radioNombre }}</strong>?</p>
          <p class="text-text-secondary mt-2">
 Horario: {{ selectedProgramacion?.horaInicio }} - {{ selectedProgramacion?.horaFin }}
 </p>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t border-dark-border">
          <button
 class="btn btn-secondary"
 @click="cancelDelete"
 >
 Cancelar
 </button>
          <button
 class="btn btn-danger"
 @click="confirmDelete"
 >
 Eliminar
 </button>
        </div>
      </template>
    </Modal>

    <!-- Modal de Edición de Horario -->
    <Modal
v-model="showEditModal"
size="lg"
:colosable="true"
title="Editar Programación"
>
      <template #default> 
        <div>
<div class="space-y-4">
            <div class="mb-4">
              <h4 class="text-lg font-medium">
{{ editForm.radioNombre }}
</h4>
              <p class="text-text-secondary">
 {{ getDiaNombre(editForm.numeroDia) }}
 </p>
            </div>

            <div class="form-group">
              <label
class="label"
for="edit-hora-inicio"
>Hora de Inicio</label>
              <input
                id="edit-hora-inicio"
                v-model="editForm.horaInicio"
                type="time"
                class="ligth input"
                :min="horarioCliente.horaDesde"
                :max="editForm.horaFin"
                @focus="$event.target.showPicker?.()"
                @click="$event.target.showPicker?.()"
              >
            </div>

            <div class="form-group">
              <label
class="label"
for="edit-hora-fin"
>Hora de Fin</label>

              <input
                id="edit-hora-fin"
                v-model="editForm.horaFin"
                type="time"
                class="input"
                :min="editForm.horaInicio"
                :max="horarioCliente.horaHasta"
                @focus="$event.target.showPicker?.()"
                @click="$event.target.showPicker?.()"
              >
            </div>

            <div class="flex items-center gap-2 text-sm text-text-secondary">
              <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
                <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
 />
              </svg>
              <span>Duración: {{ calculateDuration(editForm.horaInicio, editForm.horaFin) }}</span>
            </div>

            <div
 v-if="editConflictMessage"
 class="alert alert-danger"
 >
              <svg
 class="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
                <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
 />
              </svg>
              {{ editConflictMessage }}
            </div>
          </div>
        
        <div class="flex justify-end gap-3 p-6 border-t border-dark-border">
          <button
 class="btn btn-secondary"
 @click="cancelEdit"
 >
 Cancelar
 </button>
          <button
            class="btn btn-primary"
            :disabled="!!editConflictMessage"
            @click="confirmEdit"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
      </template>
    </Modal>

    <!-- Tour Button -->
    <TourButton
v-if="hasTour() && !isTourViewed()"
variant="floating"
size="md"
:pulse="true"
/>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRadio } from '@/composables/useRadio'
import { useDriverTour } from '@/composables/useDriverTour'
import RadioServices from '@/services/RadioServices'
import ClienteProgramacionRadioServices from '@/services/ClienteProgramacionRadioServices'
import FiltroServices from '@/services/FiltroServices'
import generoMusicalServices from '@/services/GeneroMusicalServices'
import ClienteHorarioServices from '@/services/ClienteHorarioServices'
import DiaHabilService from '@/services/DiaHabilService'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import Modal from '@/components/ui/Modal.vue'
import { useSignalRAuth } from '@/composables/useSignalRAuth'

// SignalR para notificar cambios al reproductor
const signalR = useSignalRAuth()

const router = useRouter()
const route = useRoute()

// Driver.js tour
const { startTour, hasTour, isTourViewed } = useDriverTour({ autoStart: true })

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

// Filtros avanzados
const selectedGeneroFilter = ref(null) // Filtro por género musical
const horaDesdeFilter = ref(null) // Filtro hora inicio (desde)
const horaHastaFilter = ref(null) // Filtro hora fin (hasta)
const soloProgramadas = ref(false) // Mostrar solo carpetas con programaciones

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

// NUEVO: Estado para modal de programación múltiple
const showNuevaProgramacionModal = ref(false)
const formProgramacion = ref({
  codRadio: null,
  diasSeleccionados: [],
  horaInicio: '00:00',
  horaFin: '23:59'
})
const conflictos = ref([])
const diasColapsados = ref({}) // Para controlar el acordeón por día
const radioExpandido = ref(null) // Para controlar qué carpeta/radio está expandida

// Estado para eliminación múltiple
const modoSeleccion = ref(false)
const programacionesSeleccionadas = ref([])
const showDeleteMultipleModal = ref(false)

// Horario del cliente
const horarioCliente = ref({
  horaDesde: '00:00',
  horaHasta: '23:59',
  diasHabiles: [0, 1, 2, 3, 4, 5, 6] // Todos los días por defecto
})

// ============================================
// NOTIFICACIÓN SIGNALR AL REPRODUCTOR
// ============================================

/**
 * Obtiene el cli_usuari del cliente desde el token/localStorage
 * @returns {String|null} - El cli_usuari del cliente o null si no se encuentra
 */
const getClienteUsuario = () => {
  try {
    // Intentar obtener desde localStorage userData
    const userDataStr = localStorage.getItem('userData') || localStorage.getItem('user')
    if (userDataStr) {
      const userData = JSON.parse(userDataStr)
      if (userData.cliente?.cli_usuari) {
        return userData.cliente.cli_usuari
      }
      // Intentar parsear Cliente si viene como string
      if (userData.Cliente) {
        const cliente = typeof userData.Cliente === 'string'
          ? JSON.parse(userData.Cliente)
          : userData.Cliente
        if (cliente?.cli_usuari) {
          return cliente.cli_usuari
        }
      }
    }

    // Intentar obtener desde el token directamente
    const token = localStorage.getItem('token') || localStorage.getItem('access_token')
    if (token) {
      const tokenParts = token.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(window.atob(tokenParts[1]))
        if (payload.Cliente) {
          const cliente = typeof payload.Cliente === 'string'
            ? JSON.parse(payload.Cliente)
            : payload.Cliente
          if (cliente?.cli_usuari) {
            return cliente.cli_usuari
          }
        }
        // Fallback a unique_name
        return payload.unique_name || payload.usuario || null
      }
    }

    return null
  } catch (error) {
    console.error('[SignalR] Error obteniendo cli_usuari:', error)
    return null
  }
}

/**
 * Notifica al reproductor que hubo un cambio en la programación de música
 * Envía al grupo correcto basado en el cli_usuari del cliente
 * @param {String} action - 'created' | 'updated' | 'deleted' | 'bulk_deleted'
 * @param {Object} details - Detalles del cambio (cantidad, días afectados, etc.)
 */
const notifyProgrammingChanged = async (action, details = {}) => {
  try {
    if (!signalR.connected()) {
      console.warn('[SignalR] No conectado, intentando conectar...')
      await signalR.connect()
    }

    const clienteUsuario = getClienteUsuario()
    if (!clienteUsuario) {
      console.error('[SignalR] No se pudo obtener cli_usuari, no se puede enviar notificación')
      return
    }

    const groupName = `user_${clienteUsuario}`
    const payload = JSON.stringify({
      event: 'ProgrammingChanged',
      type: 'music',
      action: action,
      source: 'admin_programacion_semanal',
      codigoProgramacion: codigoProgramacion.value,
      nombreProgramacion: nombreProgramacion.value,
      timestamp: new Date().toISOString(),
      ...details
    })

    // Enviar al grupo del cliente (donde escuchan los reproductores)
    await signalR.sendMessageToGroup(groupName, payload)
    console.log(`[SignalR] Notificación enviada al grupo ${groupName}: ${action}`, details)

  } catch (error) {
    console.error('[SignalR] Error al notificar cambio de programación:', error)
  }
}

/**
 * Envía comando directo RemoteProgrammingChanged al reproductor
 * Usa múltiples estrategias para asegurar que el mensaje llegue
 * @param {String} action - 'created' | 'updated' | 'deleted' | 'bulk_deleted'
 * @param {Object} details - Detalles adicionales
 */
const sendRemoteProgrammingChanged = async (action, details = {}) => {
  try {
    if (!signalR.connected()) {
      console.warn('[SignalR] No conectado, intentando conectar...')
      await signalR.connect()
    }

    const clienteUsuario = getClienteUsuario()
    if (!clienteUsuario) {
      console.error('[SignalR] No se pudo obtener cli_usuari, no se puede enviar comando')
      return
    }

    const groupName = `user_${clienteUsuario}`
    const data = {
      type: 'music',
      action: action,
      source: 'admin_programacion_semanal',
      codigoProgramacion: codigoProgramacion.value,
      nombreProgramacion: nombreProgramacion.value,
      timestamp: new Date().toISOString(),
      ...details
    }

    // Estrategia 1: Enviar mensaje al grupo con evento ProgrammingChanged
    // Esto será capturado por el handler 'Receive' en el cliente
    const message = JSON.stringify({
      event: 'ProgrammingChanged',
      action: 'programming_changed',
      ...data
    })
    await signalR.sendMessageToGroup(groupName, message)
    console.log(`[SignalR] Mensaje ProgrammingChanged enviado al grupo ${groupName}`)

    // Estrategia 2: Intentar invocar método del hub si existe
    try {
      await signalR.invoke('NotifyProgrammingChanged', groupName, JSON.stringify(data))
      console.log(`[SignalR] Invoke NotifyProgrammingChanged exitoso`)
    } catch (invokeError) {
      // El método puede no existir en el hub, es esperado
      console.log('[SignalR] Invoke NotifyProgrammingChanged no disponible (esperado)')
    }

    console.log(`[SignalR] Comando RemoteProgrammingChanged enviado: ${action}`, details)

  } catch (error) {
    console.error('[SignalR] Error al enviar comando:', error)
    // Fallback: intentar con notifyProgrammingChanged
    await notifyProgrammingChanged(action, details)
  }
}

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

// Computed: Agrupar programaciones por radio (para vista de carpetas)
const programacionesPorRadio = computed(() => {
  // Crear un mapa de radios con sus programaciones
  const radioMap = new Map()
  
  // Agrupar programaciones por codRadio
  programaciones.value.forEach(prog => {
    if (!radioMap.has(prog.codRadio)) {
      // Buscar info de la radio
      const radioInfo = radios.value.find(r => r.codRadio === prog.codRadio)
      radioMap.set(prog.codRadio, {
        codRadio: prog.codRadio,
        nombre: prog.radioNombre,
        img: radioInfo?.img || null,
        genero: radioInfo?.genero || '',
        subGenero: radioInfo?.subGenero || '',
        programaciones: []
      })
    }
    radioMap.get(prog.codRadio).programaciones.push(prog)
  })
  
  // Convertir a array y ordenar programaciones por día y hora
  const result = Array.from(radioMap.values()).map(radio => ({
    ...radio,
    programaciones: radio.programaciones.sort((a, b) => {
      if (a.numeroDia !== b.numeroDia) return a.numeroDia - b.numeroDia
      return a.horaInicio.localeCompare(b.horaInicio)
    }),
    // Agrupar por día para mostrar de forma compacta
    programacionesPorDia: radio.programaciones.reduce((acc, prog) => {
      const dia = prog.numeroDia
      if (!acc[dia]) acc[dia] = []
      acc[dia].push(prog)
      return acc
    }, {})
  }))
  
  // Ordenar por nombre
  return result.sort((a, b) => a.nombre.localeCompare(b.nombre))
})

// Computed: Total de carpetas con programaciones
const totalCarpetasProgramadas = computed(() => programacionesPorRadio.value.length)

// Computed: Géneros únicos de las radios disponibles
const generosUnicos = computed(() => {
  const generos = new Set()
  radios.value.forEach(radio => {
    if (radio.genero) generos.add(radio.genero)
  })
  return Array.from(generos).sort()
})

// Computed: Verificar si hay filtros activos
const hayFiltrosActivos = computed(() => {
  return searchQuery.value || 
         selectedGeneroFilter.value || 
         selectedDayFilter.value !== null || 
         horaDesdeFilter.value || 
         horaHastaFilter.value ||
         soloProgramadas.value
})

// Computed: Total de programaciones después de aplicar filtros
const totalProgramacionesFiltradas = computed(() => {
  return filteredProgramacionesPorRadio.value.reduce((total, radio) => {
    return total + radio.programaciones.length
  }, 0)
})

// Función para limpiar todos los filtros
const limpiarFiltros = () => {
  searchQuery.value = ''
  selectedGeneroFilter.value = null
  selectedDayFilter.value = null
  horaDesdeFilter.value = null
  horaHastaFilter.value = null
  soloProgramadas.value = false
}

// Computed: TODAS las radios con sus programaciones (para vista de carpetas completa)
const todasLasRadiosConProgramaciones = computed(() => {
  // Crear mapa de programaciones por radio
  const progsMap = new Map()
  programaciones.value.forEach(prog => {
    if (!progsMap.has(prog.codRadio)) {
      progsMap.set(prog.codRadio, [])
    }
    progsMap.get(prog.codRadio).push(prog)
  })
  
  // Mapear TODAS las radios con sus programaciones (si las tienen)
  return radios.value.map(radio => {
    const progs = progsMap.get(radio.codRadio) || []
    const progsOrdenadas = progs.sort((a, b) => {
      if (a.numeroDia !== b.numeroDia) return a.numeroDia - b.numeroDia
      return a.horaInicio.localeCompare(b.horaInicio)
    })
    
    // Agrupar por día
    const programacionesPorDiaMap = progsOrdenadas.reduce((acc, prog) => {
      const dia = prog.numeroDia
      if (!acc[dia]) acc[dia] = []
      acc[dia].push(prog)
      return acc
    }, {})
    
    return {
      codRadio: radio.codRadio,
      nombre: radio.nombre,
      img: radio.img,
      genero: radio.genero || '',
      subGenero: radio.subGenero || '',
      programaciones: progsOrdenadas,
      programacionesPorDia: programacionesPorDiaMap,
      tieneProgramaciones: progs.length > 0
    }
  }).sort((a, b) => {
    // Ordenar: primero las que tienen programaciones, luego por nombre
    if (a.tieneProgramaciones !== b.tieneProgramaciones) {
      return a.tieneProgramaciones ? -1 : 1
    }
    return a.nombre.localeCompare(b.nombre)
  })
})

// Computed: Filtrar carpetas por todos los filtros activos
const filteredProgramacionesPorRadio = computed(() => {
  let resultado = todasLasRadiosConProgramaciones.value
  
  // Filtro por búsqueda de texto (nombre de radio)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    resultado = resultado.filter(radio => 
      radio.nombre.toLowerCase().includes(query) ||
      (radio.genero && radio.genero.toLowerCase().includes(query)) ||
      (radio.subGenero && radio.subGenero.toLowerCase().includes(query))
    )
  }
  
  // Filtro por género musical
  if (selectedGeneroFilter.value) {
    resultado = resultado.filter(radio => radio.genero === selectedGeneroFilter.value)
  }
  
  // Filtro solo carpetas programadas
  if (soloProgramadas.value) {
    resultado = resultado.filter(radio => radio.tieneProgramaciones)
  }
  
  // Aplicar filtros de programaciones (día y horario)
  resultado = resultado.map(radio => {
    let progsFiltered = [...radio.programaciones]
    
    // Filtro por día
    if (selectedDayFilter.value !== null) {
      progsFiltered = progsFiltered.filter(p => p.numeroDia === selectedDayFilter.value)
    }
    
    // Filtro por hora desde
    if (horaDesdeFilter.value) {
      progsFiltered = progsFiltered.filter(p => p.horaInicio >= horaDesdeFilter.value)
    }
    
    // Filtro por hora hasta
    if (horaHastaFilter.value) {
      progsFiltered = progsFiltered.filter(p => p.horaFin <= horaHastaFilter.value)
    }
    
    // Reagrupar por día
    const programacionesPorDiaMap = progsFiltered.reduce((acc, prog) => {
      const dia = prog.numeroDia
      if (!acc[dia]) acc[dia] = []
      acc[dia].push(prog)
      return acc
    }, {})
    
    return {
      ...radio,
      programaciones: progsFiltered,
      programacionesPorDia: programacionesPorDiaMap,
      tieneProgramaciones: progsFiltered.length > 0
    }
  })
  
  return resultado
})

// Función para abrir modal de programación con radio pre-seleccionada
const abrirModalProgramacionParaRadio = (radio) => {
  formProgramacion.value = {
    codRadio: radio.codRadio,
    diasSeleccionados: [],
    horaInicio: horarioCliente.value.horaDesde || '00:00',
    horaFin: horarioCliente.value.horaHasta || '23:59'
  }
  conflictos.value = []
  showNuevaProgramacionModal.value = true
}

// Toggle para expandir/contraer una carpeta de radio
const toggleRadioExpandido = (codRadio) => {
  radioExpandido.value = radioExpandido.value === codRadio ? null : codRadio
}

// Función para obtener el nombre corto del día
const getDiaNombreCorto = (numeroDia) => {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return dias[numeroDia] || '?'
}

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

    const deletedProg = { ...selectedProgramacion.value }

    await ClienteProgramacionRadioServices.bajaProgramacionRadio(
      parseInt(selectedProgramacion.value.cod)
    )

    // Recargar programaciones
    await cargarProgramaciones()

    showDeleteModal.value = false
    selectedProgramacion.value = null

    // Notificar al reproductor sobre el cambio
    await sendRemoteProgrammingChanged('deleted', {
      deletedCount: 1,
      affectedDays: [deletedProg.numeroDia],
      deletedItems: [{
        cod: deletedProg.cod,
        radioNombre: deletedProg.radioNombre,
        numeroDia: deletedProg.numeroDia,
        horaInicio: deletedProg.horaInicio,
        horaFin: deletedProg.horaFin
      }]
    })

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

    const editedData = { ...editForm.value }

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

    // Notificar al reproductor sobre el cambio
    await sendRemoteProgrammingChanged('updated', {
      updatedCount: 1,
      affectedDays: [editedData.numeroDia],
      updatedItem: {
        cod: editedData.cod,
        radioNombre: editedData.radioNombre,
        numeroDia: editedData.numeroDia,
        horaInicio: editedData.horaInicio,
        horaFin: editedData.horaFin
      }
    })

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

    // Notificar al reproductor sobre el cambio masivo
    if (programacionesCreadas > 0) {
      await sendRemoteProgrammingChanged('bulk_created', {
        createdCount: programacionesCreadas,
        affectedDays: daysOfWeek.value.map(d => d.value),
        distributionMode: distributionMode.value,
        radiosUsed: radiosToDistribute.map(r => r.nombre)
      })
    }

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
    const savedForm = { ...newProgForm.value }
    const selectedRadio = radios.value.find(r => r.codRadio === savedForm.codRadio)

    await ClienteProgramacionRadioServices.guardarProgRadio(
      parseInt(codigoProgramacion.value),
      parseInt(newProgForm.value.codRadio),
      parseInt(newProgForm.value.numeroDia),
      newProgForm.value.horaInicio,
      newProgForm.value.horaFin
    )
    await cargarProgramaciones()
    cancelarNuevoProg()

    // Notificar al reproductor sobre el cambio
    await sendRemoteProgrammingChanged('created', {
      createdCount: 1,
      affectedDays: [savedForm.numeroDia],
      radioNombre: selectedRadio?.nombre || 'Desconocido',
      horaInicio: savedForm.horaInicio,
      horaFin: savedForm.horaFin
    })
  } catch (error) {
    console.error('Error al crear programación:', error)
    alert('Error al crear la programación: ' + (error.message || error))
  } finally {
    isLoading.value = false
  }
}

// ===== FUNCIONES PARA MODAL DE PROGRAMACIÓN MÚLTIPLE =====

// Abrir modal de nueva programación
const abrirModalNuevaProgramacion = () => {
  formProgramacion.value = {
    codRadio: radios.value[0]?.codRadio ?? null,
    diasSeleccionados: [],
    horaInicio: horarioCliente.value.horaDesde || '00:00',
    horaFin: horarioCliente.value.horaHasta || '23:59'
  }
  conflictos.value = []
  showNuevaProgramacionModal.value = true
}

// Cerrar modal de nueva programación
const cerrarModalNuevaProgramacion = () => {
  showNuevaProgramacionModal.value = false
  formProgramacion.value = {
    codRadio: null,
    diasSeleccionados: [],
    horaInicio: '00:00',
    horaFin: '23:59'
  }
  conflictos.value = []
}

// Helpers para selección de días
const seleccionarTodosDias = () => {
  formProgramacion.value.diasSeleccionados = daysOfWeek.value.map(d => d.value)
}

const seleccionarLunesViernes = () => {
  formProgramacion.value.diasSeleccionados = daysOfWeek.value
    .filter(d => d.value >= 1 && d.value <= 5)
    .map(d => d.value)
}

const seleccionarFinDeSemana = () => {
  formProgramacion.value.diasSeleccionados = daysOfWeek.value
    .filter(d => d.value === 0 || d.value === 6)
    .map(d => d.value)
}

const limpiarSeleccionDias = () => {
  formProgramacion.value.diasSeleccionados = []
}

// Validar conflictos en tiempo real
const validarConflictos = () => {
  conflictos.value = []

  if (!formProgramacion.value.horaInicio || !formProgramacion.value.horaFin) {
    return
  }

  formProgramacion.value.diasSeleccionados.forEach(dia => {
    const conflictosDelDia = programaciones.value.filter(prog => {
      if (prog.numeroDia !== dia) return false
      // Verificar superposición de horarios
      return (
        (formProgramacion.value.horaInicio >= prog.horaInicio &&
         formProgramacion.value.horaInicio < prog.horaFin) ||
        (formProgramacion.value.horaFin > prog.horaInicio &&
         formProgramacion.value.horaFin <= prog.horaFin) ||
        (formProgramacion.value.horaInicio <= prog.horaInicio &&
         formProgramacion.value.horaFin >= prog.horaFin)
      )
    })

    if (conflictosDelDia.length > 0) {
      conflictos.value.push({
        dia: getDiaNombre(dia),
        numeroDia: dia,
        programaciones: conflictosDelDia
      })
    }
  })
}

// Guardar programación múltiple
const guardarProgramacionMultiple = async () => {
  // Validaciones básicas
  if (!formProgramacion.value.codRadio) {
    alert('Selecciona una radio')
    return
  }
  if (formProgramacion.value.diasSeleccionados.length === 0) {
    alert('Selecciona al menos un día')
    return
  }
  if (!formProgramacion.value.horaInicio || !formProgramacion.value.horaFin) {
    alert('Completa hora inicio y fin')
    return
  }
  if (formProgramacion.value.horaInicio >= formProgramacion.value.horaFin) {
    alert('La hora de inicio debe ser anterior a la hora de fin')
    return
  }

  // Preguntar si hay conflictos
  if (conflictos.value.length > 0) {
    if (!confirm(`Hay ${conflictos.value.length} conflicto(s) de horario. ¿Desea continuar de todas formas?`)) {
      return
    }
  }

  try {
    isLoading.value = true
    let programacionesCreadas = 0

    // Crear una programación por cada día seleccionado
    for (const dia of formProgramacion.value.diasSeleccionados) {
      try {
        await ClienteProgramacionRadioServices.guardarProgRadio(
          parseInt(codigoProgramacion.value),
          parseInt(formProgramacion.value.codRadio),
          dia,
          formProgramacion.value.horaInicio,
          formProgramacion.value.horaFin
        )
        programacionesCreadas++
      } catch (error) {
        console.error(`Error al crear programación para día ${dia}:`, error)
      }
    }

    await cargarProgramaciones()

    // Notificar al reproductor sobre el cambio
    if (programacionesCreadas > 0) {
      const selectedRadio = radios.value.find(r => r.codRadio === formProgramacion.value.codRadio)
      await sendRemoteProgrammingChanged('created', {
        createdCount: programacionesCreadas,
        affectedDays: [...formProgramacion.value.diasSeleccionados],
        radioNombre: selectedRadio?.nombre || 'Desconocido',
        horaInicio: formProgramacion.value.horaInicio,
        horaFin: formProgramacion.value.horaFin
      })
    }

    cerrarModalNuevaProgramacion()

    if (programacionesCreadas > 0) {
      alert(`Se crearon ${programacionesCreadas} programación(es) exitosamente`)
    }

  } catch (error) {
    console.error('Error al crear programaciones:', error)
    alert('Error al crear las programaciones: ' + (error.message || error))
  } finally {
    isLoading.value = false
  }
}

// Toggle para acordeón de días
const toggleDiaColapsado = (numeroDia) => {
  diasColapsados.value[numeroDia] = !diasColapsados.value[numeroDia]
}

// Verificar si un día está expandido
const isDiaExpandido = (numeroDia) => {
  // Por defecto expandido si no está definido
  return diasColapsados.value[numeroDia] !== true
}

// ===== FUNCIONES PARA ELIMINACIÓN MÚLTIPLE =====

// Activar/desactivar modo selección
const toggleModoSeleccion = () => {
  modoSeleccion.value = !modoSeleccion.value
  if (!modoSeleccion.value) {
    programacionesSeleccionadas.value = []
  }
}

// Cancelar modo selección
const cancelarModoSeleccion = () => {
  modoSeleccion.value = false
  programacionesSeleccionadas.value = []
}

// Toggle selección de una programación
const toggleSeleccionProgramacion = (prog) => {
  const index = programacionesSeleccionadas.value.findIndex(p => p.cod === prog.cod)
  if (index > -1) {
    programacionesSeleccionadas.value.splice(index, 1)
  } else {
    programacionesSeleccionadas.value.push(prog)
  }
}

// Verificar si una programación está seleccionada
const isProgramacionSeleccionada = (prog) => {
  return programacionesSeleccionadas.value.some(p => p.cod === prog.cod)
}

// Seleccionar todas las programaciones visibles
const seleccionarTodasProgramaciones = () => {
  const todasVisibles = []
  filteredDays.value.forEach(day => {
    programacionesPorDia(day.value).forEach(prog => {
      todasVisibles.push(prog)
    })
  })
  programacionesSeleccionadas.value = todasVisibles
}

// Deseleccionar todas
const deseleccionarTodasProgramaciones = () => {
  programacionesSeleccionadas.value = []
}

// Abrir modal de confirmación de eliminación múltiple
const abrirModalEliminarMultiple = () => {
  if (programacionesSeleccionadas.value.length === 0) {
    alert('Selecciona al menos una programacion para eliminar')
    return
  }
  showDeleteMultipleModal.value = true
}

// Cancelar eliminación múltiple
const cancelarEliminarMultiple = () => {
  showDeleteMultipleModal.value = false
}

// Confirmar eliminación múltiple
const confirmarEliminarMultiple = async () => {
  try {
    isLoading.value = true
    let eliminadas = 0
    let errores = 0

    // Guardar información antes de eliminar para la notificación
    const deletedItems = []
    const affectedDays = new Set()

    for (const prog of programacionesSeleccionadas.value) {
      try {
        await ClienteProgramacionRadioServices.bajaProgramacionRadio(parseInt(prog.cod))
        eliminadas++
        deletedItems.push({
          cod: prog.cod,
          radioNombre: prog.radioNombre,
          numeroDia: prog.numeroDia,
          horaInicio: prog.horaInicio,
          horaFin: prog.horaFin
        })
        affectedDays.add(prog.numeroDia)
      } catch (error) {
        console.error(`Error al eliminar programacion ${prog.cod}:`, error)
        errores++
      }
    }

    await cargarProgramaciones()
    showDeleteMultipleModal.value = false
    cancelarModoSeleccion()

    // Notificar al reproductor sobre el cambio
    if (eliminadas > 0) {
      await sendRemoteProgrammingChanged('bulk_deleted', {
        deletedCount: eliminadas,
        errorCount: errores,
        affectedDays: [...affectedDays],
        deletedItems: deletedItems
      })
    }

    if (errores > 0) {
      alert(`Se eliminaron ${eliminadas} programacion(es). ${errores} no se pudieron eliminar.`)
    } else {
      alert(`Se eliminaron ${eliminadas} programacion(es) exitosamente`)
    }

  } catch (error) {
    console.error('Error en eliminación múltiple:', error)
    alert('Error al eliminar las programaciones: ' + (error.message || error))
  } finally {
    isLoading.value = false
  }
}

// Obtener total de programaciones visibles
const totalProgramacionesVisibles = computed(() => {
  let total = 0
  filteredDays.value.forEach(day => {
    total += programacionesPorDia(day.value).length
  })
  return total
})

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

// Watchers para validación de conflictos en tiempo real (modal de programación múltiple)
watch(() => formProgramacion.value.diasSeleccionados, () => {
  if (showNuevaProgramacionModal.value) {
    validarConflictos()
  }
}, { deep: true })

watch(() => formProgramacion.value.horaInicio, () => {
  if (showNuevaProgramacionModal.value) {
    validarConflictos()
  }
})

watch(() => formProgramacion.value.horaFin, () => {
  if (showNuevaProgramacionModal.value) {
    validarConflictos()
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

