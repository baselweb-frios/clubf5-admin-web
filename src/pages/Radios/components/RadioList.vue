<template>
  <div>
    <!-- Header Section - Mobile First -->
    <div class="page-header">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Top Row: Title -->
        <div class="min-w-0 flex-1">
          <h1 class="text-lg sm:text-xl lg:text-2xl font-bold truncate">
            Gestión de Radios
          </h1>
          <p class="text-xs sm:text-sm text-text-secondary hidden sm:block">
            Administra las carpetas de música del sistema
          </p>
        </div>
        
        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            class="btn btn-success btn-sm sm:btn-md flex-1 sm:flex-none justify-center"
            @click="$emit('create')"
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
            <span class="text-sm sm:text-base">Nueva Radio</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="page-content">
      <!-- Loading State -->
      <loading-spinner
        v-if="loading"
        class="py-12"
      />

      <div v-else>
        <!-- Info bar y controles -->
        <div class="mb-4 sm:mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <!-- Badges de info -->
            <div class="flex flex-wrap items-center gap-2">
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
                  {{ filteredRadios.length }}/{{ radios.length }}
                </template>
                <template v-else>
                  {{ radios.length }} carpeta{{ radios.length !== 1 ? 's' : '' }}
                </template>
              </span>
              <span class="badge badge-success text-xs sm:text-sm">
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
                {{ radiosActivas }} activa{{ radiosActivas !== 1 ? 's' : '' }}
              </span>
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
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
                {{ totalArchivos }} archivos
              </span>
            </div>
            
            <!-- Botón de filtros -->
            <div class="flex flex-wrap items-center gap-2">
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
              <!-- Toggle vista -->
              <div class="flex items-center gap-1 bg-dark-secondary rounded-lg p-1">
                <button
                  class="p-1.5 rounded transition-colors"
                  :class="viewMode === 'cards' ? 'bg-primary-500 text-white' : 'text-text-secondary hover:text-text-primary'"
                  title="Vista de carpetas"
                  @click="viewMode = 'cards'"
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded transition-colors"
                  :class="viewMode === 'table' ? 'bg-primary-500 text-white' : 'text-text-secondary hover:text-text-primary'"
                  title="Vista de tabla"
                  @click="viewMode = 'table'"
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Panel de Filtros Expandible -->
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
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <!-- Búsqueda -->
                  <div class="sm:col-span-2">
                    <label class="text-xs text-text-secondary mb-1 block">Buscar</label>
                    <div class="relative">
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="input input-sm w-full pl-8 text-sm"
                        placeholder="Nombre, descripción, identificador..."
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

                  <!-- Filtro por estado -->
                  <div>
                    <label class="text-xs text-text-secondary mb-1 block">Estado</label>
                    <select
                      v-model="selectedEstadoFilter"
                      class="select select-sm w-full text-sm"
                    >
                      <option :value="null">
                        Todos
                      </option>
                      <option value="A">
                        Activas
                      </option>
                      <option value="I">
                        Inactivas
                      </option>
                    </select>
                  </div>

                  <!-- Filtro por archivos -->
                  <div>
                    <label class="text-xs text-text-secondary mb-1 block">Archivos</label>
                    <select
                      v-model="selectedArchivosFilter"
                      class="select select-sm w-full text-sm"
                    >
                      <option :value="null">
                        Todos
                      </option>
                      <option value="con">
                        Con archivos
                      </option>
                      <option value="sin">
                        Sin archivos
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Acciones de filtros -->
                <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-dark-border">
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
              </div>
            </div>
          </transition>
        </div>

        <!-- Estado vacío -->
        <div
          v-if="filteredRadios.length === 0"
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
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h3 class="text-lg sm:text-xl font-semibold text-text-primary mb-2">
            {{ hayFiltrosActivos ? 'Sin resultados' : 'Sin radios registradas' }}
          </h3>
          <p class="text-sm sm:text-base text-text-secondary mb-4 max-w-md">
            {{ hayFiltrosActivos 
              ? 'No hay radios que coincidan con los filtros aplicados.' 
              : 'Comienza creando una nueva carpeta de música para el sistema.' 
            }}
          </p>
          <button
            v-if="!hayFiltrosActivos"
            class="btn btn-primary"
            @click="$emit('create')"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Crear Primera Radio
          </button>
          <button
            v-else
            class="btn btn-secondary"
            @click="limpiarFiltros"
          >
            Limpiar filtros
          </button>
        </div>

        <!-- Vista de Carpetas (Cards) -->
        <div
          v-else-if="viewMode === 'cards'"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
        >
          <div
            v-for="radio in filteredRadios"
            :key="radio.rad_codigo"
            class="group relative bg-dark-secondary rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg"
            :class="[
              radio.rad_estado === 'A'
                ? 'border-dark-border hover:border-primary-500/50 hover:shadow-primary-500/10'
                : 'border-dashed border-dark-border/50 hover:border-danger-500/30 opacity-70 hover:opacity-100'
            ]"
          >
            <!-- Header con imagen -->
            <div class="relative cursor-pointer">
              <div class="aspect-[4/3] sm:aspect-video overflow-hidden bg-dark-primary">
                <img
                  v-if="radio.rad_imagen"
                  :src="radio.rad_imagen"
                  :alt="radio.rad_identi"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  :class="{ 'grayscale opacity-60': radio.rad_estado !== 'A' }"
                  loading="lazy"
                  @error="handleImageError"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br"
                  :class="radio.rad_estado === 'A' 
                    ? 'from-primary-500/20 to-primary-700/20' 
                    : 'from-gray-500/10 to-gray-700/10'"
                >
                  <svg
                    class="w-12 h-12 sm:w-16 sm:h-16"
                    :class="radio.rad_estado === 'A' ? 'text-primary-500/60' : 'text-gray-500/40'"
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
              
              <!-- Badges superiores -->
              <div class="absolute top-2 right-2 flex gap-1">
                <span
                  :class="[
                    'badge text-xs font-semibold shadow-lg',
                    radio.rad_estado === 'A' ? 'badge-success' : 'badge-danger'
                  ]"
                >
                  {{ radio.rad_estado === 'A' ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <!-- Botones de acción rápida (hover) -->
              <div class="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  class="p-1.5 rounded-lg bg-dark-primary/80 text-white shadow-lg hover:bg-primary-500 transition-colors"
                  title="Ver música"
                  @click.stop="$emit('view-music', radio)"
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
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded-lg bg-dark-primary/80 text-white shadow-lg hover:bg-primary-500 transition-colors"
                  title="Configurar"
                  @click.stop="$emit('manage-relations', radio)"
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
              
              <!-- Info en overlay -->
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <div class="flex items-end justify-between">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm sm:text-base font-semibold text-white truncate drop-shadow-lg">
                      {{ radio.rad_nombre }}
                    </h3>
                    <p
                      v-if="radio.rad_identi"
                      class="text-xs text-gray-300 truncate drop-shadow"
                    >
                      {{ radio.rad_identi }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contenido de la card -->
            <div class="p-3">
              <!-- Descripción -->
              <p
                v-if="radio.rad_descri"
                class="text-xs text-text-secondary line-clamp-2 mb-3"
              >
                {{ radio.rad_descri }}
              </p>

              <!-- Badges de info -->
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <!-- Contador de archivos -->
                <span
                  v-if="fileCounts[radio.rad_identi] === undefined"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-dark-primary text-text-secondary"
                >
                  <svg
                    class="animate-spin w-3 h-3 mr-1"
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
                  Cargando...
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="fileCounts[radio.rad_identi] > 0 
                    ? 'bg-info-500/20 text-info-400' 
                    : 'bg-dark-primary text-text-secondary'"
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
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  {{ fileCounts[radio.rad_identi] }} archivo{{ fileCounts[radio.rad_identi] !== 1 ? 's' : '' }}
                </span>
              </div>

              <!-- Acciones -->
              <div class="flex items-center gap-2 pt-2 border-t border-dark-border">
                <button
                  class="btn btn-ghost btn-xs flex-1 text-xs"
                  @click="$emit('edit', radio)"
                >
                  <svg
                    class="w-3.5 h-3.5 mr-1"
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
                  Editar
                </button>
                <button
                  class="btn btn-ghost btn-xs text-xs text-danger-400 hover:text-danger-300 hover:bg-danger-500/10"
                  @click="$emit('delete', radio)"
                >
                  <svg
                    class="w-3.5 h-3.5"
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

        <!-- Vista de Tabla -->
        <div
          v-else
          class="table-container"
        >
          <table class="table">
            <thead>
              <tr>
                <th>
                  Radio
                </th>
                <th class="hidden sm:table-cell">
                  Identificador
                </th>
                <th>
                  Estado
                </th>
                <th class="hidden md:table-cell">
                  Archivos
                </th>
                <th class="text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="radio in filteredRadios"
                :key="'table-'+radio.rad_codigo"
              >
                <td>
                  <div class="flex items-center gap-3">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img
                        v-if="radio.rad_imagen"
                        class="h-10 w-10 rounded-lg object-cover"
                        :src="radio.rad_imagen"
                        :alt="radio.rad_identi"
                        @error="handleImageError"
                      >
                      <div
                        v-else
                        class="h-10 w-10 rounded-lg bg-dark-primary flex items-center justify-center"
                      >
                        <svg
                          class="h-5 w-5 text-text-tertiary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                      </div>
                    </div>
                    <div class="min-w-0">
                      <div class="text-sm font-medium text-text-primary truncate">
                        {{ radio.rad_nombre }}
                      </div>
                      <div class="text-xs text-text-secondary truncate max-w-[200px]">
                        {{ radio.rad_descri }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="hidden sm:table-cell">
                  <span class="text-sm text-text-primary">{{ radio.rad_identi || '-' }}</span>
                </td>
                <td>
                  <span
                    :class="[
                      'badge text-xs',
                      radio.rad_estado === 'A' ? 'badge-success' : 'badge-danger'
                    ]"
                  >
                    {{ radio.rad_estado === 'A' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="hidden md:table-cell">
                  <span
                    v-if="fileCounts[radio.rad_identi] === undefined"
                    class="text-text-tertiary"
                  >
                    <svg
                      class="animate-spin h-4 w-4"
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
                  </span>
                  <span
                    v-else
                    class="badge badge-info text-xs"
                  >
                    {{ fileCounts[radio.rad_identi] }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      class="btn btn-ghost btn-icon btn-xs"
                      title="Ver música"
                      @click="$emit('view-music', radio)"
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
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </button>
                    <button
                      class="btn btn-ghost btn-icon btn-xs"
                      title="Configurar"
                      @click="$emit('manage-relations', radio)"
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                    <button
                      class="btn btn-ghost btn-icon btn-xs"
                      title="Editar"
                      @click="$emit('edit', radio)"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      class="btn btn-ghost btn-icon btn-xs text-danger-400 hover:text-danger-300"
                      title="Eliminar"
                      @click="$emit('delete', radio)"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import obsServices from '@/services/obsServicesApi'

const props = defineProps({
  radios: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['create', 'edit', 'delete', 'view-music', 'manage-relations', 'sync-obs'])

// Estado de UI
const searchQuery = ref('')
const showFilters = ref(false)
const viewMode = ref('cards') // 'cards' o 'table'
const fileCounts = ref({})

// Filtros avanzados
const selectedEstadoFilter = ref(null)
const selectedArchivosFilter = ref(null)

// Computed: Verificar si hay filtros activos
const hayFiltrosActivos = computed(() => {
  return searchQuery.value || 
         selectedEstadoFilter.value || 
         selectedArchivosFilter.value
})

// Computed: Radios activas
const radiosActivas = computed(() => {
  return props.radios.filter(r => r.rad_estado === 'A').length
})

// Computed: Total de archivos
const totalArchivos = computed(() => {
  return Object.values(fileCounts.value).reduce((sum, count) => sum + (count || 0), 0)
})

// Función para limpiar filtros
const limpiarFiltros = () => {
  searchQuery.value = ''
  selectedEstadoFilter.value = null
  selectedArchivosFilter.value = null
}

// Computed: Radios filtradas
const filteredRadios = computed(() => {
  let resultado = props.radios

  // Filtro por búsqueda de texto
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    resultado = resultado.filter(radio =>
      radio.rad_identi?.toLowerCase().includes(query) ||
      radio.rad_descri?.toLowerCase().includes(query) ||
      radio.rad_identi?.toLowerCase().includes(query)
    )
  }

  // Filtro por estado
  if (selectedEstadoFilter.value) {
    resultado = resultado.filter(radio => radio.rad_estado === selectedEstadoFilter.value)
  }

  // Filtro por archivos
  if (selectedArchivosFilter.value) {
    if (selectedArchivosFilter.value === 'con') {
      resultado = resultado.filter(radio => 
        fileCounts.value[radio.rad_identi] !== undefined && 
        fileCounts.value[radio.rad_identi] > 0
      )
    } else if (selectedArchivosFilter.value === 'sin') {
      resultado = resultado.filter(radio => 
        fileCounts.value[radio.rad_identi] === undefined || 
        fileCounts.value[radio.rad_identi] === 0
      )
    }
  }

  return resultado
})

// Cargar conteo de archivos para cada radio
const loadFileCounts = async () => {
  for (const radio of props.radios) {
    if (!radio.rad_identi) continue

    try {
      const result = await obsServices.ListarObject(radio.rad_identi)
      const fileCount = countFiles(result, radio.rad_identi)
      fileCounts.value[radio.rad_identi] = fileCount
    } catch (error) {
      console.error(`Error al cargar archivos de ${radio.rad_identi}:`, error)
      fileCounts.value[radio.rad_identi] = 0
    }
  }
}

// Función recursiva para contar archivos (excluyendo carpetas)
const countFiles = (objects) => {
  let count = 0
  for (const obj of objects) {
    const isFolder = obj.objectKey.endsWith('/')
    if (!isFolder) {
      count++
    }
  }
  return count
}

// Observar cambios en las radios para recargar conteos
watch(() => props.radios, (newRadios) => {
  if (newRadios && newRadios.length > 0) {
    fileCounts.value = {}
    loadFileCounts()
  }
}, { immediate: true })

const handleImageError = (event) => {
  event.target.style.display = 'none'
  if (event.target.nextElementSibling) {
    event.target.nextElementSibling.style.display = 'flex'
  }
}
</script>

