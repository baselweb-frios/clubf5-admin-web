<template>
  <div class="page-content">
    <!-- SignalR Status -->
    <SignalRStatus :connected-count="connectedCount" />

    <!-- Header -->
    <div class="flex-between flex-wrap gap-4 mb-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-primary-500/20 flex-center text-primary-400">
          <svg
class="w-6 h-6"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
            <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
/>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-text-primary">
Gestion de Sucursales
</h1>
          <p class="text-text-secondary text-sm">
Administra y configura tus sucursales
</p>
        </div>
      </div>
      <button
class="btn btn-primary"
@click="openCreateModal"
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
d="M12 4v16m8-8H4"
/>
        </svg>
        Nueva Sucursal
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <div class="card flex items-center gap-3 p-4">
        <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex-center text-primary-400">
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
d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
/>
          </svg>
        </div>
        <div>
          <p class="text-xl font-bold text-text-primary">
{{ sucursales.length }}
</p>
          <p class="text-xs text-text-tertiary">
Total
</p>
        </div>
      </div>

      <div class="card flex items-center gap-3 p-4">
        <div class="w-10 h-10 rounded-lg bg-success-500/20 flex-center text-success-400">
          <svg
class="w-5 h-5"
fill="currentColor"
viewBox="0 0 24 24"
>
            <circle
cx="12"
cy="12"
r="6"
/>
          </svg>
        </div>
        <div>
          <p class="text-xl font-bold text-text-primary">
{{ sucursalesConectadas }}
</p>
          <p class="text-xs text-text-tertiary">
Conectadas
</p>
        </div>
      </div>

      <div class="card flex items-center gap-3 p-4">
        <div class="w-10 h-10 rounded-lg bg-info-500/20 flex-center text-info-400">
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
d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
/>
          </svg>
        </div>
        <div>
          <p class="text-xl font-bold text-text-primary">
{{ programacionesRadio.length }}
</p>
          <p class="text-xs text-text-tertiary">
Prog. Musica
</p>
        </div>
      </div>

      <div class="card flex items-center gap-3 p-4">
        <div class="w-10 h-10 rounded-lg bg-warning-500/20 flex-center text-warning-400">
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
d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
/>
          </svg>
        </div>
        <div>
          <p class="text-xl font-bold text-text-primary">
{{ programacionesSpot.length }}
</p>
          <p class="text-xs text-text-tertiary">
Prog. Spots
</p>
        </div>
      </div>

      <div
class="card flex items-center gap-3 p-4 cursor-pointer card-hover"
@click="showAuditModal = true"
>
        <div class="w-10 h-10 rounded-lg bg-accent-purple/20 flex-center text-accent-purple">
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
d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
/>
          </svg>
        </div>
        <div>
          <p class="text-xl font-bold text-text-primary">
{{ totalAuditRecords }}
</p>
          <p class="text-xs text-text-tertiary">
Auditoria
</p>
        </div>
      </div>
    </div>

    <!-- Search and View Toggle -->
    <div class="flex-between flex-wrap gap-4 mb-6">
      <div class="relative flex-1 max-w-md">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
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
d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
/>
          </svg>
        </span>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar sucursal..."
          class="input pl-10"
        >
      </div>
      <div class="flex gap-1 p-1 bg-dark-secondary rounded-lg">
        <button
          :class="['btn btn-sm btn-icon', viewMode === 'grid' ? 'btn-primary' : 'btn-ghost']"
          title="Vista en tarjetas"
          @click="viewMode = 'grid'"
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
          :class="['btn btn-sm btn-icon', viewMode === 'list' ? 'btn-primary' : 'btn-ghost']"
          title="Vista en lista"
          @click="viewMode = 'list'"
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

    <!-- Loading State -->
    <div
v-if="isLoading"
class="min-h-[40vh] flex-center flex-col gap-4"
>
      <div class="spinner w-8 h-8" />
      <p class="text-text-secondary">
Cargando sucursales...
</p>
    </div>

    <!-- Grid View -->
    <div
v-else-if="viewMode === 'grid'"
class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
>
      <div
        v-for="sucursal in filteredSucursales"
        :key="sucursal.clisuc_codigo"
        class="card group"
        :class="{ 'opacity-60': sucursal.conected !== 1 }"
      >
        <!-- Card Header -->
        <div class="flex-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex-center text-primary-400">
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
d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-text-primary">
{{ sucursal.clisuc_nombre }}
</h3>
              <p class="text-xs text-text-tertiary">
{{ sucursal.username }}
</p>
            </div>
          </div>
          <span
            class="badge text-xs"
            :class="sucursal.conected === 1 ? 'badge-success' : 'bg-dark-hover text-text-tertiary'"
          >
            <span
class="w-2 h-2 rounded-full mr-1.5"
:class="sucursal.conected === 1 ? 'bg-success-400' : 'bg-text-tertiary'"
/>
            {{ sucursal.conected === 1 ? 'Conectada' : 'Desconectada' }}
          </span>
        </div>

        <!-- Programaciones -->
        <div class="space-y-3 mb-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-text-tertiary flex items-center gap-2">
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
              Musica
            </span>
            <span class="badge badge-info text-xs">{{ getProgramacionRadioNombre(sucursal.sucpgr_codigoProgramacionRadio) }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-text-tertiary flex items-center gap-2">
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
d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
/>
              </svg>
              Spots
            </span>
            <span
v-if="sucursal.sucpgr_codigoProgramacionSpot"
class="badge badge-warning text-xs"
>
              {{ getProgramacionSpotNombre(sucursal.sucpgr_codigoProgramacionSpot) }}
            </span>
            <span
v-else
class="text-text-quaternary text-xs"
>Sin programacion</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-text-tertiary flex items-center gap-2">
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
d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
/>
              </svg>
              Spots propios
            </span>
            <span :class="['badge text-xs', sucursal.clisuc_permisoSpotPropio ? 'badge-success' : 'bg-dark-hover text-text-tertiary']">
              {{ sucursal.clisuc_permisoSpotPropio ? 'Permitido' : 'No permitido' }}
            </span>
          </div>
        </div>

        <!-- Player Section -->
        <div
v-if="sucursal.conected === 1"
class="pt-4 border-t border-dark-border"
>
          <div
v-if="sucursal.currentSong"
class="mb-3"
>
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-full bg-success-500/20 flex-center text-success-400 animate-pulse">
                <svg
class="w-3 h-3"
fill="currentColor"
viewBox="0 0 24 24"
>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-text-primary truncate">
{{ sucursal.currentSong }}
</p>
                <p class="text-xs text-text-tertiary">
{{ getPlayerModeLabel(sucursal.activePlayer) }}
</p>
              </div>
            </div>
            <div
v-if="sucursal.playbackProgress"
class="h-1 bg-dark-secondary rounded-full overflow-hidden"
>
              <div
class="h-full bg-primary-500 rounded-full transition-all"
:style="{ width: sucursal.playbackProgress.percentage + '%' }"
/>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="btn btn-sm btn-ghost flex-1"
              :disabled="playerControl.executing.value"
              @click="playerControl.play(sucursal.connectionId)"
            >
              <svg
class="w-4 h-4"
fill="currentColor"
viewBox="0 0 24 24"
>
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </button>
            <button
              class="btn btn-sm btn-ghost flex-1"
              :disabled="playerControl.executing.value"
              @click="playerControl.pause(sucursal.connectionId)"
            >
              <svg
class="w-4 h-4"
fill="currentColor"
viewBox="0 0 24 24"
>
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Pause
            </button>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                :checked="sucursal.playerStatus?.mode === 'radio'"
                :disabled="playerControl.executing.value"
                class="checkbox"
                @change="togglePlayerMode(sucursal)"
              >
              <span class="text-xs text-text-secondary">Radio</span>
            </label>
          </div>
        </div>

        <div
v-else
class="pt-4 border-t border-dark-border"
>
          <div class="flex items-center gap-2 text-text-tertiary text-sm">
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
d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
/>
            </svg>
            Sucursal desconectada
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="flex items-center gap-2 mt-4 pt-4 border-t border-dark-border">
          <button
class="btn btn-sm btn-ghost btn-icon"
title="Editar contrasena"
@click="openEditModal(sucursal, true)"
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
d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
/>
            </svg>
          </button>
          <button
class="btn btn-sm btn-secondary flex-1"
@click="openEditModal(sucursal)"
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
            Editar
          </button>
          <button
class="btn btn-sm btn-danger"
@click="confirmDelete(sucursal)"
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
      </div>

      <!-- Empty State -->
      <div
v-if="filteredSucursales.length === 0"
class="col-span-full flex-center flex-col gap-4 py-16"
>
        <div class="w-16 h-16 rounded-full bg-dark-secondary flex-center text-text-tertiary">
          <svg
class="w-8 h-8"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
            <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
/>
          </svg>
        </div>
        <p class="text-text-secondary">
No se encontraron sucursales
</p>
        <button
class="btn btn-primary"
@click="openCreateModal"
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
d="M12 4v16m8-8H4"
/>
          </svg>
          Crear Primera Sucursal
        </button>
      </div>
    </div>

    <!-- List View -->
    <div
v-else
class="space-y-2"
>
      <div
        v-for="sucursal in filteredSucursales"
        :key="sucursal.clisuc_codigo"
        class="card p-4"
        :class="{ 'opacity-60': sucursal.conected !== 1 }"
      >
        <div class="flex items-center gap-4">
          <span
            class="w-3 h-3 rounded-full flex-shrink-0"
            :class="sucursal.conected === 1 ? 'bg-success-400' : 'bg-text-tertiary'"
          />

          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-text-primary">
{{ sucursal.clisuc_nombre }}
</h4>
            <p class="text-xs text-text-tertiary">
{{ sucursal.connectionId }}
</p>
          </div>

          <div class="hidden sm:flex items-center gap-2">
            <span class="badge badge-info text-xs">
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
              {{ getProgramacionRadioNombre(sucursal.sucpgr_codigoProgramacionRadio) }}
            </span>
            <span
v-if="sucursal.sucpgr_codigoProgramacionSpot"
class="badge badge-warning text-xs"
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
d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
/>
              </svg>
              {{ getProgramacionSpotNombre(sucursal.sucpgr_codigoProgramacionSpot) }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <button
class="btn btn-sm btn-ghost btn-icon"
title="Contrasena"
@click="openEditModal(sucursal, true)"
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
d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
/>
              </svg>
            </button>
            <button
class="btn btn-sm btn-ghost btn-icon"
title="Editar"
@click="openEditModal(sucursal)"
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
class="btn btn-sm btn-ghost btn-icon text-danger-400"
title="Eliminar"
@click="confirmDelete(sucursal)"
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
        </div>

        <!-- Player Info (if connected and playing) -->
        <div
v-if="sucursal.conected === 1 && sucursal.currentSong"
class="mt-3 pt-3 border-t border-dark-border flex items-center gap-4"
>
          <div class="flex items-center gap-2 flex-1">
            <svg
class="w-4 h-4 text-success-400"
fill="currentColor"
viewBox="0 0 24 24"
>
              <path d="M8 5v14l11-7z" />
            </svg>
            <span class="text-sm text-text-primary truncate">{{ sucursal.currentSong }}</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="btn btn-sm btn-ghost btn-icon"
              :disabled="playerControl.executing.value"
              @click="playerControl.play(sucursal.connectionId)"
            >
              <svg
class="w-4 h-4"
fill="currentColor"
viewBox="0 0 24 24"
>
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button
              class="btn btn-sm btn-ghost btn-icon"
              :disabled="playerControl.executing.value"
              @click="playerControl.pause(sucursal.connectionId)"
            >
              <svg
class="w-4 h-4"
fill="currentColor"
viewBox="0 0 24 24"
>
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State List -->
      <div
v-if="filteredSucursales.length === 0"
class="flex-center flex-col gap-4 py-16"
>
        <div class="w-16 h-16 rounded-full bg-dark-secondary flex-center text-text-tertiary">
          <svg
class="w-8 h-8"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
            <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
/>
          </svg>
        </div>
        <p class="text-text-secondary">
No se encontraron sucursales
</p>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div
v-if="showModal"
class="modal-backdrop"
@click="closeModal"
>
      <div
class="modal max-w-xl"
@click.stop
>
        <div class="modal-header">
          <h3 class="text-lg font-semibold text-text-primary flex items-center gap-2">
            <svg
class="w-5 h-5 text-primary-400"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
              <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
:d="isEditMode ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M12 4v16m8-8H4'"
/>
            </svg>
            {{ isEditMode ? 'Editar Sucursal' : 'Nueva Sucursal' }}
          </h3>
          <button
class="btn btn-ghost btn-icon btn-sm"
@click="closeModal"
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
d="M6 18L18 6M6 6l12 12"
/>
            </svg>
          </button>
        </div>

        <div class="modal-body space-y-4">
          <!-- Nombre -->
          <div
v-if="!isEditPasswordVisible"
class="form-group"
>
            <label class="label">Nombre de la Sucursal *</label>
            <input
              v-model="formData.nombreSucursal"
              type="text"
              class="input"
              placeholder="Ej: Sucursal Centro"
              required
              @input="formData.usuario = formData.nombreSucursal.replace(/\s/g, '').toLowerCase()"
            >
          </div>

          <!-- Usuario -->
          <div
v-if="!isEditPasswordVisible"
class="form-group"
>
            <label class="label">Usuario (Login) *</label>
            <input
              v-model="formData.usuario"
              type="text"
              class="input"
              placeholder="usuario"
              :disabled="isEditMode"
              required
            >
            <p
v-if="isEditMode"
class="text-text-quaternary text-xs mt-1"
>
El usuario no puede modificarse
</p>
          </div>

          <!-- Contrasena -->
          <div
v-if="!isEditMode || isEditPasswordVisible"
class="form-group"
>
            <label class="label">Contrasena {{ !isEditMode ? '*' : '' }}</label>
            <input
              v-model="formData.contrasenia"
              type="password"
              class="input"
              placeholder="********"
              :required="!isEditMode"
            >
            <p
v-if="isEditMode"
class="text-text-quaternary text-xs mt-1"
>
Dejar en blanco para mantener la actual
</p>
          </div>

          <!-- Programacion Musica -->
          <div
v-if="!isEditPasswordVisible"
class="form-group"
>
            <label class="label">Programacion de Musica *</label>
            <select
v-model="formData.progRadioSelected"
class="select"
required
>
              <option value="">
Seleccionar programacion
</option>
              <option
v-for="prog in programacionesRadio"
:key="prog.clipro_codigo"
:value="prog.clipro_codigo"
>
                {{ prog.clipro_nombre }}
              </option>
            </select>
          </div>

          <!-- Permiso Spots -->
          <div
v-if="!isEditPasswordVisible"
class="form-group"
>
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="formData.permisoSpotPropio"
                type="checkbox"
                class="checkbox"
                @change="onPermisoSpotChange"
              >
              <span class="text-text-primary text-sm">Permitir spots propios</span>
            </label>
          </div>

          <!-- Programacion Spots -->
          <div
v-if="formData.permisoSpotPropio && !isEditPasswordVisible"
class="form-group"
>
            <label class="label">Programacion de Spots *</label>
            <select
v-model="formData.progSpotSelected"
class="select"
required
>
              <option value="">
Seleccionar programacion
</option>
              <option
v-for="prog in programacionesSpot"
:key="prog.clipro_codigo"
:value="prog.clipro_codigo"
>
                {{ prog.clipro_nombre }}
              </option>
            </select>
          </div>

          <!-- Preview -->
          <div class="card bg-dark-secondary p-4">
            <h4 class="text-sm font-medium text-text-secondary mb-3">
Vista Previa
</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-text-tertiary">Usuario:</span>
                <span class="text-text-primary ml-2">{{ formData.usuario || '---' }}</span>
              </div>
              <div>
                <span class="text-text-tertiary">Nombre:</span>
                <span class="text-text-primary ml-2">{{ formData.nombreSucursal || '---' }}</span>
              </div>
              <div>
                <span class="text-text-tertiary">Musica:</span>
                <span class="text-text-primary ml-2">{{ getProgramacionRadioNombre(formData.progRadioSelected) }}</span>
              </div>
              <div>
                <span class="text-text-tertiary">Spots:</span>
                <span class="text-text-primary ml-2">{{ formData.permisoSpotPropio ? 'Si' : 'No' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="closeModal"
>
Cancelar
</button>
          <button
class="btn btn-primary"
:disabled="isSaving"
@click="saveSucursal"
>
            <span
v-if="isSaving"
class="spinner w-4 h-4"
/>
            {{ isSaving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminacion -->
    <div
v-if="showDeleteModal"
class="modal-backdrop"
@click="showDeleteModal = false"
>
      <div
class="modal max-w-md"
@click.stop
>
        <div class="modal-header">
          <h3 class="text-lg font-semibold text-text-primary flex items-center gap-2">
            <svg
class="w-5 h-5 text-danger-400"
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
            Confirmar Eliminacion
          </h3>
        </div>
        <div class="modal-body">
          <p class="text-text-secondary">
            Estas seguro de eliminar la sucursal <strong class="text-text-primary">{{ sucursalToDelete?.clisuc_nombre }}</strong>?
          </p>
          <p class="text-danger-400 text-sm mt-2">
Esta accion no se puede deshacer.
</p>
        </div>
        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="showDeleteModal = false"
>
Cancelar
</button>
          <button
class="btn btn-danger"
@click="deleteSucursal"
>
Eliminar
</button>
        </div>
      </div>
    </div>

    <!-- Modal Error Reports -->
    <div
v-if="showErrorReportsModal"
class="modal-backdrop"
@click="closeErrorReportsModal"
>
      <div
class="modal max-w-2xl"
@click.stop
>
        <div class="modal-header">
          <h3 class="text-lg font-semibold text-text-primary flex items-center gap-2">
            <svg
class="w-5 h-5 text-warning-400"
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
            Reportes - {{ selectedSucursalForReports?.clisuc_nombre }}
          </h3>
          <button
class="btn btn-ghost btn-icon btn-sm"
@click="closeErrorReportsModal"
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
d="M6 18L18 6M6 6l12 12"
/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Loading -->
          <div
v-if="loadingErrorReports"
class="flex-center flex-col gap-4 py-8"
>
            <div class="spinner w-8 h-8" />
            <p class="text-text-secondary">
Cargando reportes...
</p>
          </div>

          <!-- Error -->
          <div
v-else-if="errorReportsError"
class="flex-center flex-col gap-4 py-8"
>
            <div class="w-12 h-12 rounded-full bg-danger-500/20 flex-center text-danger-400">
              <svg
class="w-6 h-6"
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
            </div>
            <p class="text-danger-400">
{{ errorReportsError }}
</p>
            <button
class="btn btn-primary btn-sm"
@click="loadErrorReportsForSucursal(selectedSucursalForReports)"
>
Reintentar
</button>
          </div>

          <!-- Summary -->
          <div v-else-if="errorReportsSummary">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div class="card p-3 text-center">
                <p class="text-2xl font-bold text-text-primary">
{{ errorReportsSummary.totalReports || 0 }}
</p>
                <p class="text-xs text-text-tertiary">
Total
</p>
              </div>
              <div class="card p-3 text-center">
                <p class="text-2xl font-bold text-danger-400">
{{ errorReportsSummary.errorCount || 0 }}
</p>
                <p class="text-xs text-text-tertiary">
Errores
</p>
              </div>
              <div class="card p-3 text-center">
                <p class="text-2xl font-bold text-warning-400">
{{ errorReportsSummary.warningCount || 0 }}
</p>
                <p class="text-xs text-text-tertiary">
Advertencias
</p>
              </div>
              <div class="card p-3 text-center">
                <p class="text-2xl font-bold text-info-400">
{{ errorReportsSummary.infoCount || 0 }}
</p>
                <p class="text-xs text-text-tertiary">
Info
</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mb-6">
              <button
class="btn btn-secondary btn-sm"
:disabled="loadingExport"
@click="exportErrorReports"
>
                <span
v-if="loadingExport"
class="spinner w-4 h-4"
/>
                <svg
v-else
class="w-4 h-4"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                  <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
/>
                </svg>
                Exportar
              </button>
              <button
class="btn btn-secondary btn-sm"
@click="toggleErrorReportsViewer"
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
d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
/>
                  <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
/>
                </svg>
                Ver en Sucursal
              </button>
              <button
class="btn btn-danger btn-sm"
:disabled="loadingClear"
@click="confirmClearErrorReports"
>
                <span
v-if="loadingClear"
class="spinner w-4 h-4"
/>
                <svg
v-else
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
                Limpiar
              </button>
            </div>

            <!-- Recent Reports -->
            <div v-if="errorReportsSummary.recentReports?.length > 0">
              <h4 class="text-sm font-medium text-text-secondary mb-3">
Reportes Recientes
</h4>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div
                  v-for="(report, index) in errorReportsSummary.recentReports"
                  :key="index"
                  class="card p-3"
                  :class="{
                    'border-l-2 border-l-danger-500': report.severity === 'error',
                    'border-l-2 border-l-warning-500': report.severity === 'warning',
                    'border-l-2 border-l-info-500': report.severity === 'info'
                  }"
                >
                  <div class="flex-between text-xs mb-1">
                    <span
class="badge"
:class="{
                      'badge-danger': report.severity === 'error',
                      'badge-warning': report.severity === 'warning',
                      'badge-info': report.severity === 'info'
                    }"
>{{ report.category || 'general' }}</span>
                    <span class="text-text-quaternary">{{ formatReportTime(report.timestamp) }}</span>
                  </div>
                  <p class="text-sm text-text-primary">
{{ report.message }}
</p>
                </div>
              </div>
            </div>

            <!-- Empty -->
            <div
v-else
class="flex-center flex-col gap-4 py-8"
>
              <div class="w-12 h-12 rounded-full bg-success-500/20 flex-center text-success-400">
                <svg
class="w-6 h-6"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                  <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M5 13l4 4L19 7"
/>
                </svg>
              </div>
              <p class="text-text-secondary">
No hay reportes de errores
</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="closeErrorReportsModal"
>
Cerrar
</button>
          <button
class="btn btn-primary"
@click="loadErrorReportsForSucursal(selectedSucursalForReports)"
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
d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
/>
            </svg>
            Actualizar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Limpiar Reportes -->
    <div
v-if="showClearReportsModal"
class="modal-backdrop"
@click="showClearReportsModal = false"
>
      <div
class="modal max-w-md"
@click.stop
>
        <div class="modal-header">
          <h3 class="text-lg font-semibold text-text-primary flex items-center gap-2">
            <svg
class="w-5 h-5 text-danger-400"
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
            Confirmar Limpieza
          </h3>
        </div>
        <div class="modal-body">
          <p class="text-text-secondary">
            Limpiar todos los reportes de <strong class="text-text-primary">{{ selectedSucursalForReports?.clisuc_nombre }}</strong>?
          </p>
          <p class="text-danger-400 text-sm mt-2">
Esta accion no se puede deshacer.
</p>
        </div>
        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="showClearReportsModal = false"
>
Cancelar
</button>
          <button
class="btn btn-danger"
@click="clearErrorReports"
>
Limpiar
</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import SucursalServices from '@/services/SucursalServices'
import ClienteProgramacionServices from '@/services/ClienteProgramacionServices'
import UserServices from '@/services/UserServices'
import { usePlayerControl } from '@/composables/usePlayerControl'
import { useSucursal } from '@/composables/useSucursal'
import SignalRStatus from '@/components/SignalRStatus.vue'

const router = useRouter()
const { proxy } = getCurrentInstance()

const playerControl = usePlayerControl({
  onCommandSuccess: (command, result) => {
    console.log(`[GestionSucursales] Comando ${command} ejecutado`, result)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Comando ${command} ejecutado correctamente`, 'success')
    }
  },
  onCommandError: (command, error) => {
    console.error(`[GestionSucursales] Error en comando ${command}`, error)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Error al ejecutar ${command}: ${error.message}`, 'error')
    }
  }
})

const isLoading = ref(false)
const isSaving = ref(false)
const programacionesRadio = ref([])
const programacionesSpot = ref([])
const searchTerm = ref('')
const viewMode = ref('grid')
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const sucursalToDelete = ref(null)
const isEditPasswordVisible = ref(false)
const codigoCliente = ref(0)
const usuarioCliente = ref('')

const showAuditModal = ref(false)
const loadingAudit = ref(false)
const auditStats = ref(null)
const selectedSucursalForAudit = ref(null)
const totalAuditRecords = ref(0)

const showErrorReportsModal = ref(false)
const showClearReportsModal = ref(false)
const loadingErrorReports = ref(false)
const loadingExport = ref(false)
const loadingClear = ref(false)
const errorReportsError = ref(null)
const errorReportsSummary = ref(null)
const selectedSucursalForReports = ref(null)

const formData = ref({
  clisuc_codigo: 0,
  nombreSucursal: '',
  usuario: '',
  contrasenia: '',
  progRadioSelected: '',
  progSpotSelected: '',
  permisoSpotPropio: false
})

const sucursalesConectadas = computed(() => {
  if (connectedCount && connectedCount.value !== undefined) {
    return connectedCount.value
  }
  return sucursales.value.filter(s => s.conected === 1).length
})

const filteredSucursales = computed(() => {
  if (!searchTerm.value) return sucursales.value
  const search = searchTerm.value.toLowerCase()
  return sucursales.value.filter(s =>
    s.clisuc_nombre.toLowerCase().includes(search) ||
    s.username.toLowerCase().includes(search)
  )
})

const loadClienteData = () => {
  const currentUser = UserServices.current()
  if (currentUser && currentUser.Cliente) {
    const cliente = JSON.parse(currentUser.Cliente)
    codigoCliente.value = cliente.cli_codigo
    usuarioCliente.value = cliente.cli_usuari
  }
}

const {
  sucursales,
  sucursalesConnected,
  connectedCount,
  connectionMonitor,
  loadSucursales: loadSucursalesRT
} = useSucursal({
  enableRealtime: true,
  enableConnectionMonitor: true
})

const loadSucursales = async () => {
  try {
    isLoading.value = true
    const data = await loadSucursalesRT()
    if (data) {
      sucursales.value = sucursalesConnected.value
    }
  } catch (error) {
    console.error('Error cargando sucursales:', error)
    alert('Error al cargar las sucursales')
  } finally {
    isLoading.value = false
  }
}

const loadProgramaciones = async () => {
  try {
    await ClienteProgramacionServices.listarProgRadios()
    const progRadios = JSON.parse(localStorage.getItem('listProgRadio') || '[]')
    programacionesRadio.value = progRadios

    await ClienteProgramacionServices.listarProgSpot()
    const progSpots = JSON.parse(localStorage.getItem('listProgSpot') || '[]')
    programacionesSpot.value = progSpots
  } catch (error) {
    console.error('Error cargando programaciones:', error)
  }
}

const getProgramacionRadioNombre = (codigo) => {
  if (!codigo) return '(sin asignar)'
  const prog = programacionesRadio.value.find(p => p.clipro_codigo == codigo)
  return prog ? prog.clipro_nombre : '(desconocida)'
}

const getProgramacionSpotNombre = (codigo) => {
  if (!codigo) return '(sin asignar)'
  const prog = programacionesSpot.value.find(p => p.clipro_codigo == codigo)
  return prog ? prog.clipro_nombre : '(desconocida)'
}

const openCreateModal = () => {
  isEditMode.value = false
  formData.value = {
    clisuc_codigo: 0,
    nombreSucursal: '',
    usuario: '',
    contrasenia: '',
    progRadioSelected: programacionesRadio.value.length === 1 ? programacionesRadio.value[0].clipro_codigo : '',
    progSpotSelected: '',
    permisoSpotPropio: false
  }
  showModal.value = true
}

const openEditModal = (sucursal, ispassword = false) => {
  isEditMode.value = true
  isEditPasswordVisible.value = ispassword
  formData.value = {
    clisuc_codigo: sucursal.clisuc_codigo,
    nombreSucursal: sucursal.clisuc_nombre,
    usuario: sucursal.username,
    contrasenia: '',
    progRadioSelected: sucursal.sucpgr_codigoProgramacionRadio || '',
    progSpotSelected: sucursal.sucpgr_codigoProgramacionSpot || '',
    permisoSpotPropio: sucursal.clisuc_permisoSpotPropio === 1
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    clisuc_codigo: 0,
    nombreSucursal: '',
    usuario: '',
    contrasenia: '',
    progRadioSelected: '',
    progSpotSelected: '',
    permisoSpotPropio: false
  }
}

const onPermisoSpotChange = () => {
  if (formData.value.permisoSpotPropio) {
    if (programacionesSpot.value.length === 1) {
      formData.value.progSpotSelected = programacionesSpot.value[0].clipro_codigo
    }
  } else {
    formData.value.progSpotSelected = ''
  }
}

const saveSucursal = async () => {
  try {
    isSaving.value = true

    const sucursalData = {
      codigoCliente: codigoCliente.value,
      nombreSucursal: formData.value.nombreSucursal,
      usuario: formData.value.usuario,
      usuarioCliente: usuarioCliente.value,
      progRadioSelected: parseInt(formData.value.progRadioSelected),
      permisoSpotPropio: formData.value.permisoSpotPropio ? 1 : 0,
      progSpotSelected: formData.value.permisoSpotPropio ? parseInt(formData.value.progSpotSelected || 0) : 0
    }

    if (formData.value.contrasenia) {
      sucursalData.contrasenia = formData.value.contrasenia
    }

    if (isEditMode.value) {
      sucursalData.idSucursal = formData.value.clisuc_codigo
      await SucursalServices.put({
        idSucursal: formData.value.clisuc_codigo,
        nombreSucu: formData.value.nombreSucursal,
        usernameSucu: formData.value.usuario,
        passSucu: formData.value.contrasenia || '',
        progRadio: parseInt(formData.value.progRadioSelected),
        progSpot: formData.value.permisoSpotPropio ? parseInt(formData.value.progSpotSelected || 0) : 0,
        programSpot: formData.value.permisoSpotPropio ? 1 : 0,
        iscliente: 0
      })
      alert('Sucursal actualizada exitosamente')
    } else {
      await SucursalServices.altaSucursal(sucursalData)
      alert('Sucursal creada exitosamente')
    }

    closeModal()
    await loadSucursales()
  } catch (error) {
    console.error('Error guardando sucursal:', error)
    alert('Error al guardar la sucursal: ' + (error.response?.data?.errorMessage || error.message))
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (sucursal) => {
  sucursalToDelete.value = sucursal
  showDeleteModal.value = true
}

const deleteSucursal = async () => {
  try {
    await SucursalServices.bajaSucursal([sucursalToDelete.value])
    alert('Sucursal eliminada exitosamente')
    showDeleteModal.value = false
    sucursalToDelete.value = null
    await loadSucursales()
  } catch (error) {
    console.error('Error eliminando sucursal:', error)
    alert('Error al eliminar la sucursal')
  }
}

const getPlayerModeLabel = (mode) => {
  const modes = {
    music: 'Musica',
    spots: 'Spots',
    neuro: 'Neuro/Mixto',
    radio: 'Radio'
  }
  return modes[mode] || mode
}

const togglePlayerMode = async (sucursal) => {
  const currentMode = sucursal.playerStatus?.mode || 'neuro'
  const newMode = currentMode === 'neuro' ? 'radio' : 'neuro'

  try {
    await playerControl.setMode(newMode, sucursal.userId)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Modo cambiado a ${newMode === 'neuro' ? 'Neuro' : 'Radio'}`, 'success')
    }
  } catch (error) {
    console.error('Error al cambiar modo:', error)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Error al cambiar modo: ${error.message}`, 'error')
    }
  }
}

const openAuditForSucursal = async (sucursal) => {
  selectedSucursalForAudit.value = sucursal
  showAuditModal.value = true
}

const openErrorReportsForSucursal = async (sucursal) => {
  selectedSucursalForReports.value = sucursal
  showErrorReportsModal.value = true
  await loadErrorReportsForSucursal(sucursal)
}

const closeErrorReportsModal = () => {
  showErrorReportsModal.value = false
  errorReportsSummary.value = null
  errorReportsError.value = null
}

const loadErrorReportsForSucursal = async (sucursal) => {
  if (!sucursal || !sucursal.userId) {
    console.error('Sucursal no valida')
    return
  }

  try {
    loadingErrorReports.value = true
    errorReportsError.value = null

    await playerControl.RemoteGetErrorReportSummary(sucursal.connectionId)

    const timeout = 10000
    const startTime = Date.now()

    const checkResponse = () => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (errorReportsSummary.value) {
            clearInterval(interval)
            resolve(errorReportsSummary.value)
          } else if (Date.now() - startTime > timeout) {
            clearInterval(interval)
            reject(new Error('Timeout esperando respuesta del reproductor'))
          }
        }, 500)
      })
    }

    await checkResponse()
  } catch (error) {
    console.error('Error cargando reportes:', error)
    errorReportsError.value = error.message || 'Error al cargar reportes de errores'
  } finally {
    loadingErrorReports.value = false
  }
}

const exportErrorReports = async () => {
  if (!selectedSucursalForReports.value) return

  try {
    loadingExport.value = true
    await playerControl.executeCommand('RemoteExportErrorReports', selectedSucursalForReports.value.userId, {
      filters: {}
    })
  } catch (error) {
    console.error('Error exportando reportes:', error)
  } finally {
    loadingExport.value = false
  }
}

const toggleErrorReportsViewer = async () => {
  if (!selectedSucursalForReports.value) return

  try {
    await playerControl.executeCommand('RemoteToggleErrorReports', selectedSucursalForReports.value.userId, {})
  } catch (error) {
    console.error('Error toggling reports viewer:', error)
  }
}

const confirmClearErrorReports = () => {
  showClearReportsModal.value = true
}

const clearErrorReports = async () => {
  if (!selectedSucursalForReports.value) return

  try {
    loadingClear.value = true
    showClearReportsModal.value = false
    await playerControl.executeCommand('RemoteClearErrorReports', selectedSucursalForReports.value.userId, {})
    await loadErrorReportsForSucursal(selectedSucursalForReports.value)
  } catch (error) {
    console.error('Error limpiando reportes:', error)
  } finally {
    loadingClear.value = false
  }
}

const formatReportTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(async () => {
  loadClienteData()
  await Promise.all([
    loadSucursales(),
    loadProgramaciones()
  ])

  setInterval(() => {
    if (sucursalesConnected.value && sucursalesConnected.value.length > 0) {
      sucursales.value = [...sucursalesConnected.value]
    }
  }, 1000)
})
</script>

<style scoped>
/* No custom styles needed */
</style>
