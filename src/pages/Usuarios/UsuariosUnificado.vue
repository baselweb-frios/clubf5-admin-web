<template>
  <div class="page-content">
    <!-- Alert Notification -->
    <transition
enter-active-class="transition duration-200 ease-out"
enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
leave-to-class="opacity-0 -translate-y-2"
>
      <div
v-if="alertMsg"
class="fixed top-4 right-4 z-notification max-w-md"
>
        <div :class="['alert', getAlertClass(alertType)]">
          <svg
class="w-5 h-5 flex-shrink-0"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
            <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
:d="getAlertIconPath(alertType)"
/>
          </svg>
          <span class="flex-1">{{ alertMsg }}</span>
          <button
class="btn btn-ghost btn-icon btn-sm"
@click="alertMsg = ''"
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
    </transition>

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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
/>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-text-primary">
            Gestion de Usuarios
          </h1>
          <p class="text-text-secondary text-sm">
            Administra clientes y solicitudes pendientes
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
class="btn btn-secondary"
title="Refrescar datos"
@click="limpiarCacheYRecargar"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
/>
          </svg>
          <span class="hidden sm:inline">Refrescar</span>
        </button>
        <button
v-if="activeTab === 'clientes'"
data-tour="user-add"
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
          <span class="hidden sm:inline">Nuevo Cliente</span>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div
data-tour="user-tabs"
class="flex gap-2 p-1 bg-dark-secondary rounded-lg mb-6 w-fit"
>
      <button
:class="[
        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
        activeTab === 'clientes'
          ? 'bg-primary-500 text-white'
          : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover'
      ]"
@click="activeTab = 'clientes'"
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
/>
        </svg>
        Clientes
        <span class="badge bg-dark-hover text-text-primary">{{ usuariosClientesUnificados.length }}</span>
      </button>
      <button
:class="[
        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
        activeTab === 'provisorios'
          ? 'bg-warning-500 text-white'
          : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover'
      ]"
@click="activeTab = 'provisorios'"
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
/>
        </svg>
        Pendientes
        <span
v-if="pendingCount > 0"
class="badge bg-warning-500 text-white"
>{{ pendingCount }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div
v-if="loading"
class="min-h-[40vh] flex-center flex-col gap-4"
>
      <div class="spinner w-8 h-8" />
      <p class="text-text-secondary">
        Cargando datos...
      </p>
    </div>

    <!-- Tab: Clientes -->
    <div v-else-if="activeTab === 'clientes'">
      <!-- Desktop Table -->
      <div class="hidden lg:block table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Username</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Paquete</th>
              <th>Estado</th>
              <th class="text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
v-for="item in usuariosClientesUnificados"
:key="item.id"
              :class="{ 'opacity-50': item.estado !== 'A' }"
>
              <td>
                <span class="badge bg-dark-hover text-text-primary">{{ item.cli_codigo }}</span>
              </td>
              <td>
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex-center text-white text-xs font-medium"
>
                    {{ getInitials(item.nombre) }}
                  </div>
                  <span class="font-medium text-text-primary">{{ item.nombre }}</span>
                </div>
              </td>
              <td class="text-text-secondary">
                {{ item.username }}
              </td>
              <td class="text-text-secondary">
                {{ item.email || 'N/A' }}
              </td>
              <td class="text-text-secondary">
                {{ item.telefono || 'N/A' }}
              </td>
              <td>
                <span class="badge badge-primary">{{ getPaqueteLabel(item.paquete) }}</span>
              </td>
              <td>
                <span :class="['badge', item.estado === 'A' ? 'badge-success' : 'bg-dark-hover text-text-tertiary']">
                  {{ item.estado === 'A' ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="flex items-center justify-end gap-1">
                  <button
class="btn btn-sm btn-ghost btn-icon"
title="Editar"
@click="editarCliente(item)"
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
                    @click="confirmarEliminar(item)"
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

      <!-- Mobile Cards -->
      <div class="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
v-for="item in usuariosClientesUnificados"
:key="item.id"
class="card"
          :class="{ 'opacity-50': item.estado !== 'A' }"
>
          <div class="flex-between mb-4">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex-center text-white font-medium"
>
                {{ getInitials(item.nombre) }}
              </div>
              <div>
                <h3 class="font-semibold text-text-primary">
                  {{ item.nombre }}
                </h3>
                <p class="text-xs text-text-tertiary">
                  @{{ item.username }}
                </p>
              </div>
            </div>
            <span :class="['badge', item.estado === 'A' ? 'badge-success' : 'bg-dark-hover text-text-tertiary']">
              {{ item.estado === 'A' ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="space-y-2 text-sm mb-4">
            <div class="flex-between">
              <span class="text-text-tertiary">ID</span>
              <span class="badge bg-dark-hover text-text-primary">{{ item.cli_codigo }}</span>
            </div>
            <div class="flex-between">
              <span class="text-text-tertiary">Email</span>
              <span class="text-text-primary">{{ item.email || 'N/A' }}</span>
            </div>
            <div class="flex-between">
              <span class="text-text-tertiary">Telefono</span>
              <span class="text-text-primary">{{ item.telefono || 'N/A' }}</span>
            </div>
            <div class="flex-between">
              <span class="text-text-tertiary">Paquete</span>
              <span class="badge badge-primary">{{ getPaqueteLabel(item.paquete) }}</span>
            </div>
          </div>

          <div class="flex gap-2 pt-4 border-t border-dark-border">
            <button
class="btn btn-secondary btn-sm flex-1"
@click="editarCliente(item)"
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
class="btn btn-danger btn-sm"
@click="confirmarEliminar(item)"
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
      </div>

      <!-- Empty State -->
      <div
v-if="usuariosClientesUnificados.length === 0"
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
/>
          </svg>
        </div>
        <p class="text-text-secondary">
          No hay clientes registrados
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
          Crear Primer Cliente
        </button>
      </div>
    </div>

    <!-- Tab: Provisorios -->
    <div v-else-if="activeTab === 'provisorios'">
      <!-- Empty State -->
      <div
v-if="pendingCount === 0"
class="flex-center flex-col gap-4 py-16"
>
        <div class="w-16 h-16 rounded-full bg-success-500/20 flex-center text-success-400">
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
d="M5 13l4 4L19 7"
/>
          </svg>
        </div>
        <p class="text-text-secondary">
          No hay solicitudes pendientes
        </p>
        <p class="text-text-tertiary text-sm">
          Las nuevas solicitudes apareceran aqui
        </p>
      </div>

      <!-- Desktop Table -->
      <div
v-else
class="hidden lg:block table-container"
>
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Paquete</th>
              <th>Fecha</th>
              <th class="text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
v-for="item in clientesProvisorios.clientes"
:key="item.idProvisorio"
>
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-warning-500/20 flex-center text-warning-400 text-xs font-medium">
                    {{ getInitials(item?.nombre || 'P') }}
                  </div>
                  <div>
                    <span class="font-medium text-text-primary">{{ item?.nombre || 'Sin nombre' }}</span>
                    <span class="badge badge-warning text-xs ml-2">Pendiente</span>
                  </div>
                </div>
              </td>
              <td class="text-text-secondary">
                {{ item?.email || 'N/A' }}
              </td>
              <td>
                <span class="badge badge-primary">{{ getPaqueteNombre(item?.codigoPaquete) }}</span>
              </td>
              <td class="text-text-secondary">
                {{ formatFecha(item.fechaCreacion) }}
              </td>
              <td>
                <div class="flex items-center justify-end gap-1">
                  <button
class="btn btn-sm btn-ghost btn-icon text-success-400"
title="Aprobar"
:disabled="saving"
                    @click="aprobarProvisorioDirecto(item)"
>
                    <svg
v-if="!saving"
class="w-4 h-4"
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
                    <span
v-else
class="spinner w-4 h-4"
/>
                  </button>
                  <button
class="btn btn-sm btn-ghost btn-icon text-warning-400"
title="Rechazar"
:disabled="saving"
                    @click="rechazarProvisorioDirecto(item)"
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
                  <button
class="btn btn-sm btn-ghost btn-icon text-danger-400"
title="Eliminar"
:disabled="saving"
                    @click="eliminarProvisorio(item)"
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

      <!-- Mobile Cards -->
      <div
v-if="pendingCount > 0"
class="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4"
>
        <div
v-for="item in clientesProvisorios.clientes"
:key="item.idProvisorio"
          class="card border-l-4 border-l-warning-500"
>
          <div class="flex-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-warning-500/20 flex-center text-warning-400 font-medium">
                {{ getInitials(item?.nombre || 'P') }}
              </div>
              <div>
                <h3 class="font-semibold text-text-primary">
                  {{ item?.nombre || 'Sin nombre' }}
                </h3>
                <p class="text-xs text-text-tertiary">
                  {{ item?.email || 'N/A' }}
                </p>
              </div>
            </div>
            <span class="badge badge-warning">Pendiente</span>
          </div>

          <div class="space-y-2 text-sm mb-4">
            <div class="flex-between">
              <span class="text-text-tertiary">Telefono</span>
              <span class="text-text-primary">{{ item?.telefono || 'N/A' }}</span>
            </div>
            <div class="flex-between">
              <span class="text-text-tertiary">Paquete</span>
              <span class="badge badge-primary">{{ getPaqueteNombre(item?.codigoPaquete) }}</span>
            </div>
            <div class="flex-between">
              <span class="text-text-tertiary">Fecha</span>
              <span class="text-text-primary">{{ formatFecha(item.fechaCreacion) }}</span>
            </div>
          </div>

          <div class="flex gap-2 pt-4 border-t border-dark-border">
            <button
class="btn btn-success btn-sm flex-1"
:disabled="saving"
@click="aprobarProvisorioDirecto(item)"
>
              <svg
v-if="!saving"
class="w-4 h-4"
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
              <span
v-else
class="spinner w-4 h-4"
/>
              Aprobar
            </button>
            <button
class="btn btn-secondary btn-sm flex-1"
:disabled="saving"
@click="rechazarProvisorioDirecto(item)"
>
              Rechazar
            </button>
            <button
class="btn btn-danger btn-sm"
:disabled="saving"
@click="eliminarProvisorio(item)"
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
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div
v-if="showModal"
class="modal-backdrop"
>
      <div
class="modal max-w-2xl"
@click.stop
>
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <div
              :class="['w-10 h-10 rounded-xl flex-center', editMode ? 'bg-warning-500/20 text-warning-400' : 'bg-primary-500/20 text-primary-400']"
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
                  :d="editMode ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'"
/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-text-primary">
                {{ editMode ? 'Editar Cliente' : 'Nuevo Cliente' }}
              </h3>
              <p class="text-sm text-text-tertiary">
                Complete los datos del formulario
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
v-if="isDevelopment && !editMode"
class="btn btn-secondary btn-sm"
type="button"
              title="Generar datos aleatorios"
@click="generarDatosAleatorios"
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
              Random
            </button>
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
        </div>

        <div class="modal-body">
          <!-- Info Banner -->
          <div
v-if="editMode"
class="alert alert-info mb-4"
>
            <svg
class="w-5 h-5 flex-shrink-0"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
              <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
/>
            </svg>
            <span>La contrasena solo se puede blanquear. El usuario recibira la nueva en su email.</span>
          </div>

          <form
:key="formKey"
class="space-y-4"
autocomplete="off"
@submit.prevent="guardar"
>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nombre -->
              <div class="form-group">
                <label class="label">Nombre de Cliente *</label>
                <input
v-model="formData.nombre"
type="text"
class="input"
autocomplete="off"
required
>
              </div>

              <!-- Username -->
              <div class="form-group">
                <label class="label">Username *</label>
                <input
v-model="formData.username"
type="text"
class="input"
autocomplete="off"
:disabled="editMode"
required
>
              </div>

              <!-- Password (solo crear) -->
              <template v-if="!editMode">
                <div class="form-group">
                  <label class="label">Contrasena *</label>
                  <input
v-model="formData.password"
type="password"
class="input"
autocomplete="new-password"
placeholder="********"
required
>
                </div>
                <div class="form-group">
                  <label class="label">Repetir Contrasena *</label>
                  <input
v-model="formData.re_password"
type="password"
class="input"
autocomplete="new-password"
placeholder="********"
required
>
                </div>
              </template>

              <!-- Blanquear Password (solo editar) -->
              <div
v-else
class="form-group md:col-span-2"
>
                <label class="label">Contrasena</label>
                <div class="card bg-dark-secondary p-4">
                  <p class="text-text-tertiary text-sm mb-3">
                    Para cambiar la contrasena, usa el boton de blanqueo. Se generara una nueva y se enviara al email.
                  </p>
                  <button
type="button"
class="btn btn-secondary"
:disabled="blanqueandoPassword"
                    @click="blanquearPassword"
>
                    <span
v-if="blanqueandoPassword"
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
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
/>
                    </svg>
                    {{ blanqueandoPassword ? 'Blanqueando...' : 'Blanquear Contrasena' }}
                  </button>
                </div>
              </div>

              <!-- Solo mostrar estos campos en modo crear -->
              <template v-if="!editMode">
                <div class="form-group">
                  <label class="label">Email *</label>
                  <input
v-model="formData.adm_email"
type="email"
class="input"
autocomplete="off"
required
>
                </div>

                <div class="form-group">
                  <label class="label">Telefono *</label>
                  <input
v-model="formData.adm_telefo"
type="tel"
class="input"
autocomplete="off"
required
>
                </div>

                <div class="form-group">
                  <label class="label">Domicilio *</label>
                  <input
v-model="formData.adm_domici"
type="text"
class="input"
autocomplete="off"
required
>
                </div>

                <div class="form-group">
                  <label class="label">Localidad *</label>
                  <input
v-model="formData.adm_locali"
type="text"
class="input"
autocomplete="off"
required
>
                </div>

                <div class="form-group">
                  <label class="label">Paquete *</label>
                  <select
v-model="formData.cli_codpaq"
class="select"
required
>
                    <option value="1">
                      Premium
                    </option>
                    <option value="6">
                      Select
                    </option>
                    <option value="7">
                      Standar
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="label">Estado</label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
v-model="formData.adm_estado"
type="checkbox"
true-value="A"
false-value="B"
                      class="checkbox"
>
                    <span class="text-text-primary">{{ formData.adm_estado === 'A' ? 'Activo' : 'Inactivo' }}</span>
                  </label>
                </div>
              </template>
            </div>

            <div
v-if="!editMode"
class="modal-footer"
>
              <button
type="button"
class="btn btn-secondary"
@click="closeModal"
>
                Cancelar
              </button>
              <button
type="submit"
class="btn btn-primary"
:disabled="saving"
>
                <span
v-if="saving"
class="spinner w-4 h-4"
/>
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminar -->
    <div
v-if="showDeleteConfirm"
class="modal-backdrop"
>
      <div
class="modal max-w-md"
@click.stop
>
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-danger-500/20 flex-center text-danger-400">
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
            </div>
            <div>
              <h3 class="text-lg font-semibold text-text-primary">
                Confirmar Eliminacion
              </h3>
              <p class="text-sm text-text-tertiary">
                Esta accion no se puede deshacer
              </p>
            </div>
          </div>
        </div>
        <div class="modal-body">
          <p class="text-text-secondary">
            Estas seguro de eliminar el cliente <strong class="text-text-primary">{{ itemToDelete?.nombre }}</strong>?
          </p>
          <p class="text-danger-400 text-sm mt-2">
            Se eliminaran todos los usuarios y datos asociados.
          </p>
        </div>
        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="closeDeleteConfirm"
>
            Cancelar
          </button>
          <button
class="btn btn-danger"
:disabled="saving"
@click="eliminar"
>
            <span
v-if="saving"
class="spinner w-4 h-4"
/>
            {{ saving ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Aprobar -->
    <div
v-if="showAprobarConfirm"
class="modal-backdrop"
>
      <div
class="modal max-w-md"
@click.stop
>
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-success-500/20 flex-center text-success-400">
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
d="M5 13l4 4L19 7"
/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-text-primary">
                Aprobar Solicitud
              </h3>
              <p class="text-sm text-text-tertiary">
                Se creara la cuenta de cliente
              </p>
            </div>
          </div>
        </div>
        <div class="modal-body">
          <p class="text-text-secondary mb-4">
            Aprobar la solicitud de <strong class="text-text-primary">{{ selectedProvisorio?.nombre }}</strong>?
          </p>
          <div class="card bg-dark-secondary p-4 space-y-2 text-sm">
            <div class="flex items-center gap-2 text-text-secondary">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
/>
              </svg>
              {{ selectedProvisorio?.email || 'N/A' }}
            </div>
            <div class="flex items-center gap-2 text-text-secondary">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
/>
              </svg>
              {{ getPaqueteNombre(selectedProvisorio?.codigoPaquete) }}
            </div>
          </div>
          <p class="text-info-400 text-sm mt-4">
            Se creara automaticamente la cuenta y el usuario podra acceder al sistema.
          </p>
        </div>
        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="closeAprobarConfirm"
>
            Cancelar
          </button>
          <button
class="btn btn-success"
:disabled="saving"
@click="confirmarAprobar"
>
            <span
v-if="saving"
class="spinner w-4 h-4"
/>
            {{ saving ? 'Aprobando...' : 'Aprobar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Rechazar -->
    <div
v-if="showRechazarConfirm"
class="modal-backdrop"
>
      <div
class="modal max-w-md"
@click.stop
>
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-warning-500/20 flex-center text-warning-400">
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
            </div>
            <div>
              <h3 class="text-lg font-semibold text-text-primary">
                Rechazar Solicitud
              </h3>
              <p class="text-sm text-text-tertiary">
                Ingrese el motivo del rechazo
              </p>
            </div>
          </div>
        </div>
        <div class="modal-body">
          <p class="text-text-secondary mb-4">
            Rechazar la solicitud de <strong class="text-text-primary">{{ selectedProvisorio?.nombre }}</strong>
          </p>
          <div class="form-group">
            <label class="label">Motivo del rechazo *</label>
            <textarea
v-model="motivoRechazo"
class="input"
rows="3"
placeholder="Ingrese el motivo..."
required
/>
          </div>
        </div>
        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="closeRechazarConfirm"
>
            Cancelar
          </button>
          <button
class="btn btn-warning"
:disabled="saving || !motivoRechazo.trim()"
@click="confirmarRechazar"
>
            <span
v-if="saving"
class="spinner w-4 h-4"
/>
            {{ saving ? 'Rechazando...' : 'Rechazar' }}
          </button>
        </div>
      </div>
    </div>

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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDriverTour } from '@/composables/useDriverTour'
import clienteService from '@/services/ClienteServices'
import clienteProvisorioService from '@/services/ClienteProvisorioServices'
import paqueteService from '@/services/PaqueteServices'
import adminService from '@/services/AdminServices'
import EmailApiService from '@/services/EmailApiService'
const router = useRouter()
const authStore = useAuthStore()

// Driver.js tour
const { startTour, hasTour, isTourViewed } = useDriverTour({ autoStart: true })

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editMode = ref(false)
const itemToDelete = ref(null)
const alertMsg = ref('')
const alertType = ref('is-info')

// key for forcing form rerender (prevents browser autofill of old values)
const formKey = ref(0)

const activeTab = ref('clientes')

const clientes = ref([])
const usuariosClientesUnificados = ref([])

const clientesProvisorios = ref({ count: 0, clientes: [] })
const paquetes = ref([])
const selectedProvisorio = ref(null)
const observaciones = ref('')

const showAprobarConfirm = ref(false)
const showRechazarConfirm = ref(false)
const motivoRechazo = ref('')

const blanqueandoPassword = ref(false)

const nombresFake = [
  'Juan Perez', 'Maria Garcia', 'Carlos Lopez', 'Ana Martinez', 'Luis Rodriguez',
  'Carmen Fernandez', 'Jose Gonzalez', 'Laura Sanchez', 'Miguel Torres', 'Isabel Ramirez'
]
const ciudadesFake = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Malaga', 'Murcia', 'Bilbao']
const dominiosFake = ['gmail.com', 'hotmail.com', 'yahoo.es', 'outlook.com']

const formData = ref({
  username: '',
  cli_codigo: 0,
  nombre: '',
  password: '',
  re_password: '',
  adm_email: '',
  adm_telefo: '',
  adm_domici: '',
  adm_locali: '',
  adm_estado: 'A',
  cli_codpaq: 1
})

const showAlert = (msg, type = 'is-info') => {
  alertMsg.value = msg
  alertType.value = type
  setTimeout(() => (alertMsg.value = ''), 5000)
}

const getAlertClass = (type) => {
  const classes = {
    'is-success': 'alert-success',
    'is-info': 'alert-info',
    'is-warning': 'alert-warning',
    'is-danger': 'alert-danger'
  }
  return classes[type] || 'alert-info'
}

const getAlertIconPath = (type) => {
  const paths = {
    'is-success': 'M5 13l4 4L19 7',
    'is-info': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'is-warning': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    'is-danger': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
  return paths[type] || paths['is-info']
}

const generarDatosAleatorios = () => {
  if (!isDevelopment) return

  const nombreAleatorio = nombresFake[Math.floor(Math.random() * nombresFake.length)]
  const ciudadAleatoria = ciudadesFake[Math.floor(Math.random() * ciudadesFake.length)]
  const dominioAleatorio = dominiosFake[Math.floor(Math.random() * dominiosFake.length)]

  const usernameBase = nombreAleatorio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.')
  const randomNum = Math.floor(Math.random() * 999)
  const username = `${usernameBase}${randomNum}`
  const email = `${usernameBase}${randomNum}@${dominioAleatorio}`
  const telefono = `+34 ${Math.floor(Math.random() * 900) + 600} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`
  const calles = ['Calle Mayor', 'Avenida Principal', 'Calle del Sol', 'Paseo Maritimo']
  const domicilio = `${calles[Math.floor(Math.random() * calles.length)]}, ${Math.floor(Math.random() * 200) + 1}`

  formData.value = {
    ...formData.value,
    username,
    nombre: nombreAleatorio,
    password: 'Test1234',
    re_password: 'Test1234',
    adm_email: email,
    adm_telefo: telefono,
    adm_domici: domicilio,
    adm_locali: ciudadAleatoria,
    adm_estado: 'A'
  }

  showAlert('Datos aleatorios generados. Password: Test1234', 'is-info')
}

const getInitials = (nombre) => {
  if (!nombre) return 'U'
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const getPaqueteLabel = (codpag) => {
  const paqueteMap = { 1: 'Premium', 6: 'Select', 7: 'Standar' }
  return paqueteMap[codpag] || 'N/A'
}

const limpiarCacheYRecargar = async (showNotification = true) => {
  loading.value = true
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.includes('cliente') || key.includes('admin') || key.includes('clientes')) {
        localStorage.removeItem(key)
      }
    })

    try {
      await clienteService.clearCache()
    } catch (cacheError) {
      console.warn('Error limpiando cache del servidor:', cacheError)
    }

    if (showNotification) {
      showAlert('Cache limpiado. Recargando datos...', 'is-success')
    }

    await cargarClientes()
  } catch (error) {
    console.error('Error limpiando cache:', error)
    if (showNotification) {
      showAlert('Error al limpiar cache', 'is-warning')
    }
    await cargarClientes()
  } finally {
    loading.value = false
  }
}

const cargarClientes = async () => {
  loading.value = true
  try {
    localStorage.removeItem('clientes')
    localStorage.removeItem('clientesCompleto')

    const data = await clienteService.getAllCompleto()
    clientes.value = Array.isArray(data) ? data : []

    usuariosClientesUnificados.value = clientes.value.map(cliente => ({
      id: cliente.cli_codigo,
      cli_codigo: cliente.cli_codigo,
      nombre: cliente.nombre,
      username: cliente.username,
      paquete: cliente.cli_codpaq,
      prefijo: cliente.cli_prefijo,
      email: cliente.adm_email,
      telefono: cliente.adm_telefo,
      domicilio: cliente.adm_domici,
      localidad: cliente.adm_locali,
      estado: cliente.adm_estado,
      _original: cliente
    }))

    
  } catch (error) {
    console.error('Error cargando clientes:', error)
    showAlert('Error al cargar los datos', 'is-danger')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editMode.value = false
  resetForm()
  // in development, prefill with fake data
  if (isDevelopment) {
    generarDatosAleatorios()
  }
  // bump key to force form rerender (avoids autofill)
  formKey.value = Date.now()
  showModal.value = true
}

const resetForm = () => {
  formData.value = {
    username: '',
    cli_codigo: 0,
    nombre: '',
    password: '',
    re_password: '',
    adm_email: '',
    adm_telefo: '',
    adm_domici: '',
    adm_locali: '',
    adm_estado: 'A',
    cli_codpaq: 1
  }
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const editarCliente = (item) => {
  editMode.value = true
  // bump key so browser won't reuse previous inputs
  formKey.value = Date.now()
  formData.value = {
    cli_codigo: item.cli_codigo,
    cli_codpaq: item.paquete || 1,
    nombre: item.nombre || '',
    username: item.username || '',
    password: '',
    re_password: '',
    adm_email: item.email || '',
    adm_telefo: item.telefono || '',
    adm_domici: item.domicilio || '',
    adm_locali: item.localidad || '',
    adm_estado: item.estado || 'A'
  }
  showModal.value = true
}

const confirmarEliminar = (item) => {
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  itemToDelete.value = null
}

const blanquearPassword = async () => {
  if (!formData.value.username) {
    showAlert('No se puede blanquear: usuario no identificado', 'is-danger')
    return
  }

  if (!formData.value.adm_email) {
    showAlert('El usuario no tiene email configurado', 'is-warning')
    return
  }

  if (!confirm('Se generara una nueva contrasena y se enviara al email del usuario.')) {
    return
  }

  blanqueandoPassword.value = true
  try {
    const result = await adminService.blanquearPassword(formData.value.username)

    if (result.success) {
      let mensaje = result.emailSent
        ? 'Contrasena restablecida. Se ha enviado un email.'
        : 'Contrasena restablecida pero hubo un problema al enviar el email.'

      if (isDevelopment && result.generatedPassword) {
        mensaje += ` [DEV] Nueva: ${result.generatedPassword}`
      }
      await EmailApiService.sendPasswordReset(
        formData.value.adm_email,
        formData.value.nombre,
        result.generatedPassword
      )
      showAlert(mensaje, result.emailSent ? 'is-success' : 'is-warning')
    } else {
      showAlert('Error al restablecer la contrasena', 'is-danger')
    }
  } catch (error) {
    console.error('Error al blanquear contrasena:', error)
    showAlert(`Error: ${error.response?.data || error.message}`, 'is-danger')
  } finally {
    blanqueandoPassword.value = false
  }
}

const eliminar = async () => {
  saving.value = true
  try {
    await clienteService.deleteCompleto(itemToDelete.value.cli_codigo)
    showAlert('Cliente eliminado correctamente', 'is-success')
    closeDeleteConfirm()
    await limpiarCacheYRecargar(false)
  } catch (error) {
    console.error('Error al eliminar:', error)
    showAlert(`Error al eliminar: ${error.message}`, 'is-danger')
  } finally {
    saving.value = false
  }
}

const guardar = async () => {
  if (!editMode.value) {
    if (formData.value.password !== formData.value.re_password) {
      showAlert('Las contrasenas no coinciden', 'is-warning')
      return
    }
    if (!formData.value.password || formData.value.password.length < 6) {
      showAlert('La contrasena debe tener al menos 6 caracteres', 'is-warning')
      return
    }
  }

  saving.value = true
  try {
    if (editMode.value) {
      const clienteData = {
        cli_codpaq: formData.value.cli_codpaq,
        nombre: formData.value.nombre,
        adm_email: formData.value.adm_email,
        adm_telefo: formData.value.adm_telefo,
        adm_domici: formData.value.adm_domici,
        adm_locali: formData.value.adm_locali,
        adm_estado: formData.value.adm_estado
      }
      await clienteService.updateCompleto(formData.value.cli_codigo, clienteData)
      showAlert('Cliente actualizado correctamente', 'is-success')
    } else {
      const cliente = { cli_codpaq: formData.value.cli_codpaq }
      const admin = {
        username: formData.value.username,
        password: formData.value.password,
        nombre: formData.value.nombre,
        adm_email: formData.value.adm_email,
        adm_telefo: formData.value.adm_telefo,
        adm_domici: formData.value.adm_domici,
        adm_locali: formData.value.adm_locali,
        adm_estado: formData.value.adm_estado
      }
      await clienteService.altaCuenta(cliente, admin)
      let welcomeEmailSent = true
      try {
        await EmailApiService.sendWelcome(formData.value.adm_email, formData.value.username)
      } catch (emailError) {
        console.error('Error enviando email de alta:', emailError)
        welcomeEmailSent = false
      }

      if (welcomeEmailSent) {
        showAlert('Cliente creado correctamente y email de bienvenida enviado', 'is-success')
      } else {
        showAlert('Cliente creado, pero no se pudo enviar el email de bienvenida', 'is-warning')
      }
    }

    closeModal()
    await limpiarCacheYRecargar(false)
  } catch (error) {
    console.error('Error al guardar:', error)
    showAlert('Error al guardar el cliente', 'is-danger')
  } finally {
    saving.value = false
  }
}

const cargarProvisorios = async () => {
  try {
    const data = await clienteProvisorioService.getPendientes()
    clientesProvisorios.value = data.count > 0 ? data : { count: 0, clientes: [] }
  
  } catch (error) {
    console.error('Error cargando provisorios:', error)
    showAlert('Error al cargar solicitudes pendientes', 'is-danger')
  }
}

const cargarPaquetes = async () => {
  try {
    const data = await paqueteService.getAll()
    paquetes.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error cargando paquetes:', error)
  }
}

const getPaqueteNombre = (codigo) => {
  const paquete = paquetes.value.find(p => p.paq_codigo === codigo)
  return paquete ? paquete.paq_descri : `Paquete ${codigo}`
}

const aprobarProvisorioDirecto = (provisorio) => {
  selectedProvisorio.value = provisorio
  showAprobarConfirm.value = true
}

const closeAprobarConfirm = () => {
  showAprobarConfirm.value = false
  selectedProvisorio.value = null
}

const confirmarAprobar = async () => {
  if (!selectedProvisorio.value) return

  saving.value = true
  try {
    let result = await clienteProvisorioService.aprobar(selectedProvisorio.value.idProvisorio, 'Aprobado desde panel')
    showAlert('Cliente aprobado correctamente', 'is-success')
    await EmailApiService.sendCustomEmail(
      selectedProvisorio.value.email,
      "Aprobacion de Solicitud de Cliente",
      result.message
    )
    closeAprobarConfirm()
    await cargarProvisorios()
    await limpiarCacheYRecargar(false)
  } catch (error) {
    console.error('Error al aprobar:', error)
    showAlert('Error al aprobar: ' + (error.response?.data?.message || error.message), 'is-danger')
  } finally {
    saving.value = false
  }
}

const rechazarProvisorioDirecto = (provisorio) => {
  selectedProvisorio.value = provisorio
  motivoRechazo.value = ''
  showRechazarConfirm.value = true
}

const closeRechazarConfirm = () => {
  showRechazarConfirm.value = false
  selectedProvisorio.value = null
  motivoRechazo.value = ''
}

const confirmarRechazar = async () => {
  if (!selectedProvisorio.value) return
  if (!motivoRechazo.value.trim()) {
    showAlert('Debe ingresar un motivo de rechazo', 'is-warning')
    return
  }

  saving.value = true
  try {
    await clienteProvisorioService.rechazar(selectedProvisorio.value.idProvisorio, motivoRechazo.value)
    showAlert('Solicitud rechazada', 'is-info')
    await EmailApiService.sendNotification(
      selectedProvisorio.value.email,
      selectedProvisorio.value.nombre,
      'Rechazo de Solicitud',
      `Su solicitud ha sido rechazada por el siguiente motivo:\n\n${motivoRechazo.value}`
    )
    closeRechazarConfirm()
    await cargarProvisorios()
  } catch (error) {
    console.error('Error al rechazar:', error)
    showAlert('Error al rechazar: ' + (error.response?.data?.message || error.message), 'is-danger')
  } finally {
    saving.value = false
  }
}

const eliminarProvisorio = async (provisorio) => {
  if (!confirm(`Eliminar la solicitud de "${provisorio.nombre || 'Sin nombre'}"?`)) {
    return
  }

  saving.value = true
  try {
    await clienteProvisorioService.eliminar(provisorio.idProvisorio)
    showAlert('Solicitud eliminada', 'is-success')
    await cargarProvisorios()
  } catch (error) {
    console.error('Error al eliminar:', error)
    showAlert('Error al eliminar la solicitud', 'is-danger')
  } finally {
    saving.value = false
  }
}

const formatFecha = (fecha) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const pendingCount = computed(() => {
  if (clientesProvisorios.value?.count) return clientesProvisorios.value.count
  if (Array.isArray(clientesProvisorios.value?.clientes)) return clientesProvisorios.value.clientes.length
  if (Array.isArray(clientesProvisorios.value)) return clientesProvisorios.value.length
  return 0
})

onMounted(async () => {
  if (authStore.userRole !== 'Cliente' && authStore.userRole !== 'Administrador') {
    showAlert('No tienes permisos para acceder a esta seccion', 'is-danger')
    router.push('/dashboard')
    return
  }

  await Promise.all([
    cargarClientes(),
    cargarProvisorios(),
    cargarPaquetes()
  ])
})
</script>

<style scoped>
/* No custom styles needed */
</style>
