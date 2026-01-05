<template>
  <div class="page-container">
    <!-- Alert Notifications -->
    <div v-if="alertMsg" class="notification-container">
      <div :class="['notification', `notification-${alertType}`]">
        <div class="notification-content">
          <i :class="getAlertIcon(alertType)" class="notification-icon"></i>
          <span class="notification-text">{{ alertMsg }}</span>
        </div>
        <button class="notification-close" @click="alertMsg = ''" aria-label="Cerrar notificación">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="card-title-section">
          <i class="fas fa-users card-title-icon"></i>
          <h1 class="card-title">Gestión de Usuarios Clientes</h1>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary" @click="limpiarCacheYRecargar" title="Limpiar caché y recargar datos">
            <i class="fas fa-sync-alt"></i>
            <span>Refrescar Datos</span>
          </button>
          <button v-if="activeTab === 'clientes'" class="btn btn-primary" @click="openCreateModal">
            <i class="fas fa-plus"></i>
            <span>Nuevo Usuario Cliente</span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'clientes' }"
          @click="activeTab = 'clientes'"
        >
          <i class="fas fa-users"></i>
          <span>Clientes Activos</span>
          <span class="tab-count">{{ usuariosClientesUnificados.length }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'provisorios', 'has-pending': pendingCount > 0 }"
          @click="activeTab = 'provisorios'"
          >
          <i class="fas fa-user-clock"></i>
          <span>Solicitudes Pendientes</span>
          <span v-if="pendingCount > 0" class="tab-count pending">{{ pendingCount }}</span>
        </button>
      </div>

      <div class="card-body">
        <!-- Loading State -->
        <loading-spinner v-if="loading" :loading="true" text="Cargando datos..." />

        <!-- Tab: Clientes Activos -->
        <div v-else-if="activeTab === 'clientes'">
          <!-- Vista de tabla para desktop -->
          <div class="table-wrapper desktop-view">
            <table class="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Cliente</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Paquete</th>
                  <th>Estado</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in usuariosClientesUnificados" :key="item.id" :class="{ 'inactive': item.estado !== 'A' }">
                  <td>
                    <span class="id-badge">{{ item.cli_codigo }}</span>
                  </td>
                  <td>
                    <div class="user-info">
                      <div class="user-avatar">
                        {{ getInitials(item.nombre) }}
                      </div>
                      <span class="user-name">{{ item.nombre }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="user-email">{{ item.username }}</span>
                  </td>
                  <td>
                    <span class="user-email">{{ item.email || 'N/A' }}</span>
                  </td>
                  <td>
                    <span class="phone-text">{{ item.telefono || 'N/A' }}</span>
                  </td>
                  <td>
                    <span class="badge badge-primary">
                      {{ getPaqueteLabel(item.paquete) }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" :class="item.estado === 'A' ? 'status-active' : 'status-inactive'">
                      <i class="fas" :class="item.estado === 'A' ? 'fa-check-circle' : 'fa-times-circle'"></i>
                      {{ item.estado === 'A' ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        @click="editarCliente(item)"
                        class="btn-icon"
                        title="Editar usuario cliente"
                      >
                        <i class="fas fa-edit"></i>
                      </button>

                      <button
                        @click="confirmarEliminar(item)"
                        class="btn-icon btn-danger"
                        title="Eliminar usuario cliente y dependientes"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vista de cards para móviles y tablets -->
          <div class="mobile-view">
            <div class="users-cards">
              <div
                v-for="item in usuariosClientesUnificados"
                :key="item.id"
                class="user-card"
                :class="{ 'inactive': item.estado !== 'A' }"
              >
                <div class="user-card-header">
                  <div class="user-info">
                    <div class="user-avatar">
                      {{ getInitials(item.nombre) }}
                    </div>
                    <div class="user-details">
                      <h3 class="user-name">{{ item.nombre }}</h3>
                      <p class="user-username">@{{ item.username }}</p>
                    </div>
                  </div>
                  <span class="status-badge" :class="item.estado === 'A' ? 'status-active' : 'status-inactive'">
                    <i class="fas" :class="item.estado === 'A' ? 'fa-check-circle' : 'fa-times-circle'"></i>
                  </span>
                </div>

                <div class="user-card-body">
                  <div class="info-row-mobile">
                    <div class="info-label">
                      <i class="fas fa-id-card"></i>
                      ID
                    </div>
                    <div class="info-value">
                      <span class="id-badge">{{ item.cli_codigo }}</span>
                    </div>
                  </div>

                  <div class="info-row-mobile">
                    <div class="info-label">
                      <i class="fas fa-envelope"></i>
                      Email
                    </div>
                    <div class="info-value">{{ item.email || 'N/A' }}</div>
                  </div>

                  <div class="info-row-mobile">
                    <div class="info-label">
                      <i class="fas fa-phone"></i>
                      Teléfono
                    </div>
                    <div class="info-value">{{ item.telefono || 'N/A' }}</div>
                  </div>

                  <div class="info-row-mobile">
                    <div class="info-label">
                      <i class="fas fa-box"></i>
                      Paquete
                    </div>
                    <div class="info-value">
                      <span class="badge badge-primary">
                        {{ getPaqueteLabel(item.paquete) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="user-card-footer">
                  <button
                    @click="editarCliente(item)"
                    class="btn btn-secondary btn-block"
                  >
                    <i class="fas fa-edit"></i>
                    Editar
                  </button>
                  <button
                    @click="confirmarEliminar(item)"
                    class="btn btn-danger btn-block"
                  >
                    <i class="fas fa-trash"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Solicitudes Pendientes (Provisorios) -->
        <div v-else-if="activeTab === 'provisorios'">
          <div v-if="pendingCount === 0" class="empty-state">
            <i class="fas fa-inbox empty-icon"></i>
            <h3>No hay solicitudes pendientes</h3>
            <p>Las nuevas solicitudes de registro aparecerán aquí</p>
          </div>

          <!-- Vista de tabla para desktop -->
          <div v-else class="table-wrapper desktop-view">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Paquete</th>
                  <th>Fecha Solicitud</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in clientesProvisorios.clientes" :key="item.idProvisorio">
                  <td>
                    <div class="user-info">
                      <div class="user-avatar provisorio">
                        {{ getInitials(item?.nombre || 'P') }}
                      </div>
                      <div>
                        <span class="user-name">{{ item?.nombre || 'Sin nombre' }}</span>
                        <span class="provisorio-badge">Pendiente</span>
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <span class="user-email">{{ item?.email || 'N/A' }}</span>
                  </td>
                  <td>
                    <span class="badge badge-primary">
                      {{ getPaqueteNombre(item?.codigoPaquete) }}
                    </span>
                  </td>
                  <td>
                    <span class="fecha-text">{{ formatFecha(item.fechaCreacion) }}</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        @click="aprobarProvisorioDirecto(item)"
                        class="btn-icon btn-success-icon"
                        title="Aprobar solicitud"
                        :disabled="saving"
                      >
                        <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                      </button>
                      <button
                        @click="rechazarProvisorioDirecto(item)"
                        class="btn-icon btn-warning-icon"
                        title="Rechazar solicitud"
                        :disabled="saving"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                      <button
                        @click="eliminarProvisorio(item)"
                        class="btn-icon btn-danger"
                        title="Eliminar solicitud"
                        :disabled="saving"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vista de cards para móviles -->
          <div v-if="pendingCount > 0" class="mobile-view">
            <div class="users-cards">
              <div
                v-for="item in clientesProvisorios.clientes"
                :key="item.idProvisorio"
                class="user-card provisorio-card"
              >
                <div class="user-card-header">
                  <div class="user-info">
                    <div class="user-avatar provisorio">
                      {{ getInitials(item?.nombre || 'P') }}
                    </div>
                    <div class="user-details">
                      <h3 class="user-name">{{ item?.nombre || 'Sin nombre' }}</h3>
                      <p class="user-username">{{ item?.email || 'N/A' }}</p>
                    </div>
                  </div>
                  <span class="provisorio-badge">Pendiente</span>
                </div>

                <div class="user-card-body">
                  <div class="info-row-mobile">
                    <div class="info-label">
                      <i class="fas fa-phone"></i>
                      Teléfono
                    </div>
                    <div class="info-value">{{ item?.telefono || 'N/A' }}</div>
                  </div>

                  <div class="info-row-mobile">
                    <div class="info-label">
                      <i class="fas fa-box"></i>
                      Paquete
                    </div>
                    <div class="info-value">
                      <span class="badge badge-primary">
                        {{ getPaqueteNombre(item?.codigoPaquete) }}
                      </span>
                    </div>
                  </div>

                  <div class="info-row-mobile">
                    <div class="info-label">
                      <i class="fas fa-calendar"></i>
                      Fecha
                    </div>
                    <div class="info-value">{{ formatFecha(item.fechaCreacion) }}</div>
                  </div>
                </div>

                <div class="user-card-footer user-card-footer-3">
                  <button
                    @click="aprobarProvisorioDirecto(item)"
                    class="btn btn-success btn-block"
                    :disabled="saving"
                  >
                    <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                    Aprobar
                  </button>
                  <button
                    @click="rechazarProvisorioDirecto(item)"
                    class="btn btn-warning btn-block"
                    :disabled="saving"
                  >
                    <i class="fas fa-times"></i>
                    Rechazar
                  </button>
                  <button
                    @click="eliminarProvisorio(item)"
                    class="btn btn-danger btn-block"
                    :disabled="saving"
                  >
                    <i class="fas fa-trash"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <transition name="modal-fade" appear>
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <transition name="modal-scale" appear>
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon">
                  <i class="fas" :class="editMode ? 'fa-user-edit' : 'fa-user-plus'"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">{{ editMode ? 'Editar Usuario Cliente' : 'Nuevo Usuario Cliente' }}</h2>
                  <p class="modal-subtitle">Complete los datos del formulario</p>
                </div>
              </div>
              <div class="modal-header-actions">
                <!-- Botón para generar datos aleatorios (solo en desarrollo y modo creación) -->
                <button
                  v-if="isDevelopment && !editMode"
                  @click="generarDatosAleatorios"
                  class="btn-dev-random"
                  type="button"
                  title="Generar datos aleatorios (solo desarrollo)"
                >
                  <i class="fas fa-dice"></i>
                  <span>Datos Random</span>
                </button>
                <button class="modal-close-btn" @click="closeModal" aria-label="Cerrar modal">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="modal-body">
              <!-- Banner informativo para edición -->
              <div v-if="editMode" class="edit-info-banner">
                <i class="fas fa-info-circle"></i>
                <span>La contraseña solo se puede blanquear y el usuario recibira la nueva contraseña en su casilla de correo.</span>
              </div>

              <form @submit.prevent="guardar">
                <div class="form-grid">
                  <!-- Formulario unificado para Usuario Cliente -->
                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-user"></i>
                      Nombre de Cliente
                    </label>
                    <input
                      v-model="formData.nombre"
                      type="text"
                      class="form-input"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-id-card"></i>
                      Username (sesión)
                    </label>
                    <input
                      v-model="formData.username"
                      type="text"
                      class="form-input"
                      :disabled="editMode"
                      required
                    />
                  </div>

                  <!-- Campos de contraseña solo para modo crear -->
                  <template v-if="!editMode">
                    <div class="form-group">
                      <label class="form-label">
                        <i class="fas fa-lock"></i>
                        Contraseña
                      </label>
                      <input
                        v-model="formData.password"
                        type="password"
                        class="form-input"
                        placeholder="Ingrese la contraseña"
                        required
                      />
                    </div>

                    <div class="form-group">
                      <label class="form-label">
                        <i class="fas fa-lock"></i>
                        Repetir Contraseña
                      </label>
                      <input
                        v-model="formData.re_password"
                        type="password"
                        class="form-input"
                        placeholder="Repita la contraseña"
                        required
                      />
                    </div>
                  </template>

                  <!-- Botón de blanqueo de contraseña solo para modo edición -->
                  <div v-else class="form-group">
                    <label class="form-label">
                      <i class="fas fa-lock"></i>
                      Contraseña
                    </label>
                    <div class="password-reset-container">
                      <p class="password-reset-info">
                        <i class="fas fa-info-circle"></i>
                        Para cambiar la contraseña, usa el botón de blanqueo. Se generará una contraseña segura y se enviará al email del usuario.
                      </p>
                      <button
                        type="button"
                        class="btn btn-warning"
                        @click="blanquearPassword"
                        :disabled="blanqueandoPassword"
                      >
                        <i class="fas" :class="blanqueandoPassword ? 'fa-spinner fa-spin' : 'fa-key'"></i>
                        <span>{{ blanqueandoPassword ? 'Blanqueando...' : 'Blanquear Contraseña' }}</span>
                      </button>
                    </div>
                  </div>
                   <div v-if="!editMode">
                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-envelope"></i>
                      Email
                    </label>
                    <input
                      v-model="formData.adm_email"
                      type="email"
                      class="form-input"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-phone"></i>
                      Teléfono
                    </label>
                    <input
                      v-model="formData.adm_telefo"
                      type="tel"
                      class="form-input"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-map-marker-alt"></i>
                      Domicilio
                    </label>
                    <input
                      v-model="formData.adm_domici"
                      type="text"
                      class="form-input"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-city"></i>
                      Localidad
                    </label>
                    <input
                      v-model="formData.adm_locali"
                      type="text"
                      class="form-input"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-box"></i>
                      Paquete
                    </label>
                    <select v-model="formData.cli_codpaq" class="form-select" required>
                      <option value="1">Premium</option>
                      <option value="6">Select</option>
                      <option value="7">Standar</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-toggle-on"></i>
                      Estado
                    </label>
                    <label class="switch">
                      <input
                        v-model="formData.adm_estado"
                        type="checkbox"
                        true-value="A"
                        false-value="B"
                        class="switch-input"
                      />
                      <span class="switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

                <div class="modal-footer" v-if="!editMode">
                  <button type="button" @click="closeModal" class="btn btn-secondary">
                    <i class="fas fa-times"></i>
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                    {{ saving ? 'Guardando...' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Modal Confirmación Eliminar -->
    <transition name="modal-fade" appear>
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
        <transition name="modal-scale" appear>
          <div class="modal-content modal-small">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon modal-icon-danger">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">Confirmar Eliminación</h2>
                  <p class="modal-subtitle">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="closeDeleteConfirm" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <p class="delete-message">
                ¿Estás seguro de que deseas eliminar el cliente <strong>{{ itemToDelete?.nombre }}</strong>?
              </p>
              <p class="delete-warning">
                <i class="fas fa-exclamation-circle"></i>
                Esta acción no se puede deshacer.
              </p>

              <div class="modal-footer">
                <button @click="closeDeleteConfirm" class="btn btn-secondary">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                <button @click="eliminar" class="btn btn-danger" :disabled="saving">
                  <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                  {{ saving ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Modal Confirmación Aprobar Provisorio -->
    <transition name="modal-fade" appear>
      <div v-if="showAprobarConfirm" class="modal-overlay" @click.self="closeAprobarConfirm">
        <transition name="modal-scale" appear>
          <div class="modal-content modal-small">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon modal-icon-success">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">Aprobar Solicitud</h2>
                  <p class="modal-subtitle">Se creará la cuenta de cliente</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="closeAprobarConfirm" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <p class="confirm-message">
                ¿Estás seguro de que deseas aprobar la solicitud de <strong>{{ selectedProvisorio?.nombre }}</strong>?
              </p>
              <div class="confirm-details">
                <div class="detail-row">
                  <i class="fas fa-envelope"></i>
                  <span>{{ selectedProvisorio?.email || 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <i class="fas fa-box"></i>
                  <span>{{ getPaqueteNombre(selectedProvisorio?.codigoPaquete) }}</span>
                </div>
              </div>
              <p class="confirm-info">
                <i class="fas fa-info-circle"></i>
                Se creará automáticamente la cuenta y el usuario podrá acceder al sistema.
              </p>

              <div class="modal-footer">
                <button @click="closeAprobarConfirm" class="btn btn-secondary">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                <button @click="confirmarAprobar" class="btn btn-success" :disabled="saving">
                  <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                  {{ saving ? 'Aprobando...' : 'Aprobar' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Modal Confirmación Rechazar Provisorio -->
    <transition name="modal-fade" appear>
      <div v-if="showRechazarConfirm" class="modal-overlay" @click.self="closeRechazarConfirm">
        <transition name="modal-scale" appear>
          <div class="modal-content modal-small">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon modal-icon-warning">
                  <i class="fas fa-times-circle"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">Rechazar Solicitud</h2>
                  <p class="modal-subtitle">Ingrese el motivo del rechazo</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="closeRechazarConfirm" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <p class="confirm-message">
                Rechazar la solicitud de <strong>{{ selectedProvisorio?.nombre }}</strong>
              </p>
              <div class="confirm-details">
                <div class="detail-row">
                  <i class="fas fa-envelope"></i>
                  <span>{{ selectedProvisorio?.email || 'N/A' }}</span>
                </div>
              </div>

              <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label">
                  <i class="fas fa-comment"></i>
                  Motivo del rechazo <span style="color: #ef4444;">*</span>
                </label>
                <textarea
                  v-model="motivoRechazo"
                  class="form-input textarea"
                  rows="3"
                  placeholder="Ingrese el motivo por el cual se rechaza la solicitud..."
                  required
                ></textarea>
              </div>

              <div class="modal-footer">
                <button @click="closeRechazarConfirm" class="btn btn-secondary">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                <button @click="confirmarRechazar" class="btn btn-warning" :disabled="saving || !motivoRechazo.trim()">
                  <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-times-circle'"></i>
                  {{ saving ? 'Rechazando...' : 'Rechazar' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import clienteService from '@/services/ClienteServices'
import clienteProvisorioService from '@/services/ClienteProvisorioServices'
import paqueteService from '@/services/PaqueteServices'
import adminService from '@/services/AdminServices'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

// Detectar modo desarrollo
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

// State
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editMode = ref(false)
const itemToDelete = ref(null)
const alertMsg = ref('')
const alertType = ref('is-info')

// Tab state
const activeTab = ref('clientes') // 'clientes' o 'provisorios'

const clientes = ref([])
const usuariosClientesUnificados = ref([])

// Provisorios state
const clientesProvisorios = ref({ count: 0, clientes: [] })
const paquetes = ref([])
const selectedProvisorio = ref(null)
const observaciones = ref('')

// Modales de confirmación para provisorios
const showAprobarConfirm = ref(false)
const showRechazarConfirm = ref(false)
const motivoRechazo = ref('')

// Estado para blanqueo de contraseña
const blanqueandoPassword = ref(false)

// Datos de ejemplo para modo desarrollo
const nombresFake = [
  'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez',
  'Carmen Fernández', 'José González', 'Laura Sánchez', 'Miguel Torres', 'Isabel Ramírez',
  'Antonio Flores', 'Cristina Díaz', 'Francisco Morales', 'Rosa Jiménez', 'Manuel Ruiz',
  'Patricia Álvarez', 'Pedro Romero', 'Lucía Navarro', 'Javier Domínguez', 'Elena Castro'
]

const ciudadesFake = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza',
  'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao',
  'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón'
]

const dominiosFake = ['gmail.com', 'hotmail.com', 'yahoo.es', 'outlook.com', 'empresa.com']

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

// Computed - ya no es necesario

// Methods
const showAlert = (msg, type = 'is-info') => {
  alertMsg.value = msg
  alertType.value = type
  setTimeout(() => (alertMsg.value = ''), 5000)
}

// Función para generar datos aleatorios (solo en desarrollo)
const generarDatosAleatorios = () => {
  if (!isDevelopment) {
    console.warn('Generación de datos aleatorios solo disponible en modo desarrollo')
    return
  }

  const nombreAleatorio = nombresFake[Math.floor(Math.random() * nombresFake.length)]
  const ciudadAleatoria = ciudadesFake[Math.floor(Math.random() * ciudadesFake.length)]
  const dominioAleatorio = dominiosFake[Math.floor(Math.random() * dominiosFake.length)]

  // Generar username a partir del nombre
  const usernameBase = nombreAleatorio
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\s+/g, '.')

  const randomNum = Math.floor(Math.random() * 999)
  const username = `${usernameBase}${randomNum}`

  // Generar email
  const emailBase = nombreAleatorio
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
  const email = `${emailBase}${randomNum}@${dominioAleatorio}`

  // Generar teléfono
  const telefono = `+34 ${Math.floor(Math.random() * 900) + 600} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`

  // Generar dirección
  const calles = ['Calle Mayor', 'Avenida Principal', 'Calle del Sol', 'Paseo Marítimo', 'Calle Real']
  const calle = calles[Math.floor(Math.random() * calles.length)]
  const numero = Math.floor(Math.random() * 200) + 1
  const domicilio = `${calle}, ${numero}`

  // Password por defecto en desarrollo
  const passwordDefault = 'Test1234'

  // Rellenar el formulario
  formData.value = {
    ...formData.value,
    username: username,
    nombre: nombreAleatorio,
    password: passwordDefault,
    re_password: passwordDefault,
    adm_email: email,
    adm_telefo: telefono,
    adm_domici: domicilio,
    adm_locali: ciudadAleatoria,
    adm_estado: 'A'
  }

  showAlert('✨ Datos aleatorios generados. Password: Test1234', 'is-info')
  console.log('📝 Datos generados:', formData.value)
}

const getAlertIcon = (type) => {
  const icons = {
    'is-success': 'fas fa-check-circle',
    'is-info': 'fas fa-info-circle',
    'is-warning': 'fas fa-exclamation-triangle',
    'is-danger': 'fas fa-exclamation-circle'
  }
  return icons[type] || 'fas fa-info-circle'
}

const getInitials = (nombre) => {
  if (!nombre) return 'U'
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}


const getPaqueteLabel = (codpag) => {
  const paqueteMap = {
    1: 'Premium',
    6: 'Select',
    7: 'Standar'
  }
  return paqueteMap[codpag] || 'N/A'
}

// ============================================
// SISTEMA DE CACHÉ AUTOMÁTICO
// ============================================
// Flujo de actualización automática:
// 1. Alta de cliente → guardar() → limpiarCacheYRecargar()
// 2. Modificación → guardar() → limpiarCacheYRecargar()
// 3. Eliminación → eliminar() → limpiarCacheYRecargar()
// 4. Manual → botón "Refrescar Datos" → limpiarCacheYRecargar(true)
//
// Esto asegura que siempre se muestren datos actualizados
// sin necesidad de refrescar manualmente la página
// ============================================

/**
 * Limpia el caché local y del servidor, luego recarga los datos
 * @param {boolean} showNotification - Si debe mostrar notificación al usuario
 */
const limpiarCacheYRecargar = async (showNotification = true) => {
  loading.value = true
  try {
    // Limpiar localStorage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.includes('cliente') || key.includes('admin') || key.includes('clientes')) {
        localStorage.removeItem(key)
      }
    })

    // Limpiar caché del servidor (Redis)
    try {
      await clienteService.clearCache()
    } catch (cacheError) {
      console.warn('Error limpiando caché del servidor:', cacheError)
      // No bloquear si falla la limpieza del caché del servidor
    }

    if (showNotification) {
      showAlert('Caché limpiado. Recargando datos...', 'is-success')
    }

    await cargarClientes()
  } catch (error) {
    console.error('Error limpiando caché:', error)
    if (showNotification) {
      showAlert('Error al limpiar caché, pero intentando recargar datos...', 'is-warning')
    }
    await cargarClientes()
  } finally {
    loading.value = false
  }
}

const cargarClientes = async () => {
  loading.value = true
  try {
    // Limpiar caché local antes de cargar
    localStorage.removeItem('clientes')
    localStorage.removeItem('clientesCompleto')

    // Limpiar todas las claves relacionadas con clientes
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('cliente_')) {
        localStorage.removeItem(key)
      }
    })

    // Usar el nuevo endpoint que devuelve información completa (Cliente + Admin)
    const data = await clienteService.getAllCompleto()
    clientes.value = Array.isArray(data) ? data : []
    console.log('✅ Clientes completos cargados:', clientes.value.length)

    // Log para ver la estructura de los datos
    if (clientes.value.length > 0) {
      console.log('📊 Ejemplo de cliente completo:', clientes.value[0])
      console.log('📊 Propiedades disponibles:', Object.keys(clientes.value[0]))
    }

    // Crear datos unificados con toda la información disponible
    usuariosClientesUnificados.value = clientes.value.map(cliente => {
      console.log('🔍 Mapeando cliente completo:', cliente)
      return {
        id: cliente.cli_codigo,
        cli_codigo: cliente.cli_codigo,
        nombre: cliente.nombre,
        username: cliente.username,
        paquete: cliente.cli_codpaq,
        prefijo: cliente.cli_prefijo,
        // Datos de Admin ahora disponibles
        email: cliente.adm_email,
        telefono: cliente.adm_telefo,
        domicilio: cliente.adm_domici,
        localidad: cliente.adm_locali,
        estado: cliente.adm_estado,
        // Referencia al objeto original
        _original: cliente
      }
    })

    console.log('✅ Datos unificados creados:', usuariosClientesUnificados.value.length)
    if (usuariosClientesUnificados.value.length > 0) {
      console.log('📊 Ejemplo de dato unificado:', usuariosClientesUnificados.value[0])
    }
  } catch (error) {
    console.error('❌ Error cargando clientes:', error)
    showAlert('Error al cargar los datos', 'is-danger')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editMode.value = false
  resetForm()
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

  // Ahora tenemos todos los datos disponibles gracias al endpoint completo
  formData.value = {
    cli_codigo: item.cli_codigo,
    cli_codpaq: item.paquete || 1,
    nombre: item.nombre || '',
    username: item.username || '',
    password: '',  // Dejar vacío en modo edición
    re_password: '',
    adm_email: item.email || '',
    adm_telefo: item.telefono || '',
    adm_domici: item.domicilio || '',
    adm_locali: item.localidad || '',
    adm_estado: item.estado || 'A'
  }

  showModal.value = true
}

const verDetalleCliente = (cliente) => {
  // Aquí podrías abrir un modal con información más detallada
  console.log('Ver detalle de cliente:', cliente)
  showAlert('Funcionalidad de detalle en desarrollo', 'is-info')
}

const confirmarEliminar = (item) => {
  console.log('=== CONFIRMAR ELIMINAR ===')
  console.log('Item completo:', item)
  console.log('ID Cliente:', item.cli_codigo)
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  itemToDelete.value = null
}

// Blanquear contraseña del usuario
const blanquearPassword = async () => {
  if (!formData.value.username) {
    showAlert('No se puede blanquear la contraseña: usuario no identificado', 'is-danger')
    return
  }

  if (!formData.value.adm_email) {
    showAlert('El usuario no tiene email configurado. Se requiere email para enviar la nueva contraseña.', 'is-warning')
    return
  }

  if (!confirm('¿Está seguro de blanquear la contraseña? Se generará una nueva contraseña segura y se enviará al email del usuario.')) {
    return
  }

  blanqueandoPassword.value = true
  try {
    const result = await adminService.blanquearPassword(formData.value.username)

    if (result.success) {
      // En modo desarrollo, mostrar la contraseña generada
      let mensaje = ''
      if (result.emailSent) {
        mensaje = 'Contraseña restablecida exitosamente. Se ha enviado un email con la nueva contraseña.'
      } else {
        mensaje = 'Contraseña restablecida pero hubo un problema al enviar el email. Contacte al usuario manualmente.'
      }

      // Mostrar contraseña en desarrollo
      if (isDevelopment && result.generatedPassword) {
        mensaje += ` [DEV] Nueva contraseña: ${result.generatedPassword}`
        console.log('🔐 [DEV] Contraseña generada:', result.generatedPassword)
      }

      showAlert(mensaje, result.emailSent ? 'is-success' : 'is-warning')
    } else {
      showAlert('Error al restablecer la contraseña', 'is-danger')
    }
  } catch (error) {
    console.error('Error al blanquear contraseña:', error)
    showAlert(`Error al blanquear contraseña: ${error.response?.data || error.message}`, 'is-danger')
  } finally {
    blanqueandoPassword.value = false
  }
}

const eliminar = async () => {
  saving.value = true
  try {
    const clienteId = itemToDelete.value.cli_codigo
    console.log('Eliminando cliente y usuarios dependientes ID:', clienteId, itemToDelete.value)

    // Usar el nuevo endpoint que elimina cliente + todos sus usuarios dependientes
    await clienteService.deleteCompleto(clienteId)

    showAlert('Cliente y usuarios dependientes eliminados correctamente', 'is-success')

    closeDeleteConfirm()

    // Limpiar caché y recargar datos automáticamente
    await limpiarCacheYRecargar(false)
  } catch (error) {
    console.error('Error al eliminar:', error)
    showAlert(`Error al eliminar el cliente: ${error.message}`, 'is-danger')
  } finally {
    saving.value = false
  }
}

const guardar = async () => {
  // Validaciones de contraseña solo en modo creación
  if (!editMode.value) {
    if (formData.value.password !== formData.value.re_password) {
      showAlert('Las contraseñas no coinciden', 'is-warning')
      return
    }
    if (!formData.value.password || formData.value.password.length < 6) {
      showAlert('La contraseña debe tener al menos 6 caracteres', 'is-warning')
      return
    }
  }

  saving.value = true
  try {
    if (editMode.value) {
      // Actualizar cliente existente usando el nuevo endpoint completo
      // En modo edición NO se envía la contraseña (se maneja con blanqueo)
      const clienteData = {
        cli_codpaq: formData.value.cli_codpaq,
        nombre: formData.value.nombre,
        adm_email: formData.value.adm_email,
        adm_telefo: formData.value.adm_telefo,
        adm_domici: formData.value.adm_domici,
        adm_locali: formData.value.adm_locali,
        adm_estado: formData.value.adm_estado
        // password: ya no se envía en edición, se usa blanqueo
      }

      await clienteService.updateCompleto(formData.value.cli_codigo, clienteData)

      showAlert('Cliente actualizado correctamente', 'is-success')
    } else {
      // Crear nuevo cliente
      const cliente = {
        cli_codpaq: formData.value.cli_codpaq
      }

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

      showAlert('Cliente creado correctamente', 'is-success')
    }

    closeModal()

    // Limpiar caché y recargar datos automáticamente
    await limpiarCacheYRecargar(false)
  } catch (error) {
    console.error('Error al guardar:', error)
    showAlert('Error al guardar el cliente', 'is-danger')
  } finally {
    saving.value = false
  }
}

// ========== PROVISORIOS METHODS ==========

const cargarProvisorios = async () => {
  try {
    const data = await clienteProvisorioService.getPendientes()
    // data es un objeto { count, clientes, message }
    clientesProvisorios.value = data.count > 0 ? data : { count: 0, clientes: [] }
    console.log('✅ Clientes provisorios cargados:', clientesProvisorios.value.count || 0)
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

const verProvisorio = (provisorio) => {
  selectedProvisorio.value = provisorio
  observaciones.value = ''
  showProvisorioModal.value = true
}

const cerrarProvisorioModal = () => {
  showProvisorioModal.value = false
  selectedProvisorio.value = null
  observaciones.value = ''
}

const aprobarProvisorio = async () => {
  if (!selectedProvisorio.value) return

  saving.value = true
  try {
    await clienteProvisorioService.aprobar(selectedProvisorio.value.idProvisorio, observaciones.value)
    showAlert('Cliente aprobado correctamente. Se ha creado la cuenta.', 'is-success')
    cerrarProvisorioModal()
    await cargarProvisorios()
    // También recargar clientes ya que se creó uno nuevo
    await limpiarCacheYRecargar(false)
  } catch (error) {
    console.error('Error al aprobar:', error)
    showAlert('Error al aprobar el cliente: ' + (error.response?.data?.message || error.message), 'is-danger')
  } finally {
    saving.value = false
  }
}

// Abrir modal de confirmación para aprobar
const aprobarProvisorioDirecto = (provisorio) => {
  selectedProvisorio.value = provisorio
  showAprobarConfirm.value = true
}

// Cerrar modal de aprobar
const closeAprobarConfirm = () => {
  showAprobarConfirm.value = false
  selectedProvisorio.value = null
}

// Ejecutar aprobación
const confirmarAprobar = async () => {
  if (!selectedProvisorio.value) return

  saving.value = true
  try {
    await clienteProvisorioService.aprobar(selectedProvisorio.value.idProvisorio, 'Aprobado desde panel')
    showAlert('Cliente aprobado correctamente. Se ha creado la cuenta.', 'is-success')
    closeAprobarConfirm()
    await cargarProvisorios()
    await limpiarCacheYRecargar(false)
  } catch (error) {
    console.error('Error al aprobar:', error)
    showAlert('Error al aprobar el cliente: ' + (error.response?.data?.message || error.message), 'is-danger')
  } finally {
    saving.value = false
  }
}

// Abrir modal de confirmación para rechazar
const rechazarProvisorioDirecto = (provisorio) => {
  selectedProvisorio.value = provisorio
  motivoRechazo.value = ''
  showRechazarConfirm.value = true
}

// Cerrar modal de rechazar
const closeRechazarConfirm = () => {
  showRechazarConfirm.value = false
  selectedProvisorio.value = null
  motivoRechazo.value = ''
}

// Ejecutar rechazo
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
    closeRechazarConfirm()
    await cargarProvisorios()
  } catch (error) {
    console.error('Error al rechazar:', error)
    showAlert('Error al rechazar la solicitud: ' + (error.response?.data?.message || error.message), 'is-danger')
  } finally {
    saving.value = false
  }
}

const rechazarProvisorio = async () => {
  if (!selectedProvisorio.value) return

  if (!observaciones.value.trim()) {
    showAlert('Por favor ingrese un motivo de rechazo', 'is-warning')
    return
  }

  saving.value = true
  try {
    await clienteProvisorioService.rechazar(selectedProvisorio.value.idProvisorio, observaciones.value)
    showAlert('Solicitud rechazada', 'is-info')
    cerrarProvisorioModal()
    await cargarProvisorios()
  } catch (error) {
    console.error('Error al rechazar:', error)
    showAlert('Error al rechazar la solicitud: ' + (error.response?.data?.message || error.message), 'is-danger')
  } finally {
    saving.value = false
  }
}

const eliminarProvisorio = async (provisorio) => {
  if (!confirm(`¿Eliminar la solicitud de "${provisorio.nombre || 'Sin nombre'}"?`)) {
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

// Computed for pending count
const pendingCount = computed(() => {
  // clientesProvisorios es un objeto { count, clientes } no un array
  if (clientesProvisorios.value?.count) {
    return clientesProvisorios.value.count
  }
  if (Array.isArray(clientesProvisorios.value?.clientes)) {
    return clientesProvisorios.value.clientes.length
  }
  if (Array.isArray(clientesProvisorios.value)) {
    return clientesProvisorios.value.length
  }
  return 0
})

// Lifecycle
onMounted(async () => {
  // Verificar permisos
  if (authStore.userRole !== 'Cliente' && authStore.userRole !== 'Administrador') {
    showAlert('No tienes permisos para acceder a esta sección', 'is-danger')
    router.push('/dashboard')
    return
  }

  // Cargar datos iniciales
  await Promise.all([
    cargarClientes(),
    cargarProvisorios(),
    cargarPaquetes()
  ])
})
</script>

<style scoped>
/* ===== VARIABLES ===== */
:root {
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  --color-bg-primary: #0f1419;
  --color-bg-secondary: #16181d;
  --color-surface-primary: #1c1f26;
  --color-surface-secondary: #22252d;
  --color-border-primary: rgba(255, 255, 255, 0.06);
  --color-border-secondary: rgba(255, 255, 255, 0.1);

  --color-text-primary: #e5e7eb;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-text-inverse: #ffffff;

  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;

  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-warning-500: #f59e0b;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;

  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
  --border-radius-2xl: 1rem;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}

/* ===== PAGE LAYOUT ===== */
.page-container {
  padding: var(--spacing-6);
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== NOTIFICATIONS ===== */
.notification-container {
  position: fixed;
  top: var(--spacing-6);
  right: var(--spacing-6);
  z-index: 9999;
  max-width: 400px;
  width: 100%;
}

.notification {
  background: var(--color-surface-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-primary);
  overflow: hidden;
  animation: slide-in-right var(--transition-base) ease-out;
  margin-bottom: var(--spacing-3);
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification-is-success {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), var(--color-surface-primary));
}

.notification-is-info {
  border-color: rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), var(--color-surface-primary));
}

.notification-is-warning {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--color-surface-primary));
}

.notification-is-danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--color-surface-primary));
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
}

.notification-icon {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.notification-is-success .notification-icon {
  color: var(--color-success-600);
}

.notification-is-info .notification-icon {
  color: var(--color-primary-500);
}

.notification-is-warning .notification-icon {
  color: var(--color-warning-500);
}

.notification-is-danger .notification-icon {
  color: var(--color-error-500);
}

.notification-text {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.375;
  color: var(--color-text-primary);
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.notification-close:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
}

/* ===== MAIN CONTENT CARD ===== */
.content-card {
  background: var(--color-surface-primary);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-primary);
  overflow: hidden;
  transition: all var(--transition-base);
}

.content-card:hover {
  box-shadow: var(--shadow-2xl);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid var(--color-border-primary);
  background: linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary));
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.card-title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.card-title-icon {
  font-size: 1.5rem;
  color: var(--color-primary-500);
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
}

.card-actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  flex-wrap: wrap;
}

/* ===== VIEW TOGGLE ===== */
.view-toggle {
  display: flex;
  gap: var(--spacing-1);
  background: var(--color-bg-secondary);
  padding: var(--spacing-1);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border-primary);
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-btn:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
}

.toggle-btn.active {
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.card-body {
  padding: var(--spacing-8);
}

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: #22252d;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: 1px solid var(--color-border-primary);
  border-radius: 0.375rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
  border-color: rgba(255, 255, 255, 0.1);
}

.btn-icon.btn-danger:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn-icon.btn-success-icon {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.btn-icon.btn-success-icon:hover {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.btn-icon.btn-warning-icon {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.btn-icon.btn-warning-icon:hover {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

/* ===== TABLE ===== */
.table-wrapper {
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border-primary);
  overflow-x: auto;
}

/* Vista desktop/tablet - ocultar en móvil */
.desktop-view {
  display: block;
}

/* Vista móvil - ocultar por defecto */
.mobile-view {
  display: none;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: var(--color-surface-secondary);
  border-bottom: 1px solid var(--color-border-primary);
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

.users-table tbody tr:hover {
  background: var(--color-surface-secondary);
}

.users-table tbody tr.inactive {
  opacity: 0.6;
}

.text-right {
  text-align: right;
}

/* ===== USER INFO ===== */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: #3b82f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-email {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.phone-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.client-tag, .prefix-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--color-surface-secondary);
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* ===== BADGES ===== */
.id-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--color-surface-secondary);
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-family: monospace;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
}

.badge-primary {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.badge-warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.badge-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.badge-secondary {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
}

.status-active {
  color: #4ade80;
}

.status-inactive {
  color: #f87171;
}

/* ===== ACTION BUTTONS ===== */
.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* ===== MODALS ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 20, 25, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
  backdrop-filter: blur(8px);
  animation: modal-backdrop-appear var(--transition-base) ease-out;
}

@keyframes modal-backdrop-appear {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--color-surface-primary);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--color-border-primary);
  max-width: 90vw;
  max-height: 90vh;
  width: 900px;
  overflow: hidden;
  position: relative;
}

.modal-content.modal-small {
  width: 600px;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all var(--transition-slow) cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-scale-enter-to,
.modal-scale-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.modal-header {
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary));
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent);
  opacity: 0.5;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  position: relative;
  z-index: 1;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  font-size: 1.125rem;
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.modal-icon-danger {
  background: linear-gradient(135deg, var(--color-error-500), var(--color-error-600));
}

.modal-icon-success {
  background: linear-gradient(135deg, var(--color-success-500), var(--color-success-600));
}

.modal-title-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
}

.modal-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  position: relative;
  z-index: 1;
}

/* Botón de desarrollo para datos aleatorios */
.btn-dev-random {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.btn-dev-random:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  border-color: rgba(251, 191, 36, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-dev-random:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.2);
}

.btn-dev-random i {
  font-size: 1rem;
  animation: spin-slow 3s linear infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  position: relative;
  z-index: 1;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-error-500);
  color: var(--color-error-500);
  transform: scale(1.05);
}

.modal-close-btn:active {
  transform: scale(0.95);
}

.modal-body {
  padding: var(--spacing-8);
  max-height: calc(90vh - 200px);
  overflow-y: auto;
  position: relative;
}

.edit-info-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--border-radius-lg);
  color: var(--color-primary-400);
  font-size: 0.875rem;
  line-height: 1.4;
}

.edit-info-banner i {
  font-size: 1.125rem;
  color: var(--color-primary-500);
  flex-shrink: 0;
}

.optional-label {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-text-muted);
  margin-left: var(--spacing-2);
  font-style: italic;
}

/* Custom scrollbar */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: 9999px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--color-border-secondary);
  border-radius: 9999px;
  transition: background var(--transition-fast);
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-primary);
}

.modal-footer {
  padding: var(--spacing-6) var(--spacing-8);
  border-top: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

/* Modal fade transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-base) ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}

/* ===== FORMS ===== */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.form-label i {
  color: var(--color-primary-500);
  font-size: 0.75rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
  outline: none;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

/* Password Reset Container */
.password-reset-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.password-reset-info {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--border-radius-md);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
}

.password-reset-info i {
  color: var(--color-primary-400);
  margin-top: 2px;
  flex-shrink: 0;
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-warning:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border-primary);
  transition: var(--transition-fast);
  border-radius: 24px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition-fast);
  border-radius: 50%;
}

.switch-input:checked + .switch-slider {
  background-color: var(--color-primary-500);
}

.switch-input:checked + .switch-slider:before {
  transform: translateX(26px);
}

/* ===== DELETE MESSAGE ===== */
.delete-message {
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.delete-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--border-radius-lg);
  color: #f87171;
  font-size: 0.875rem;
}

/* ===== CONFIRM MODAL STYLES ===== */
.confirm-message {
  color: var(--color-text-primary);
  font-size: 1rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.confirm-details {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  padding: var(--spacing-2) 0;
}

.detail-row:not(:last-child) {
  border-bottom: 1px solid var(--color-border-primary);
}

.detail-row i {
  color: var(--color-primary-500);
  width: 1.25rem;
  text-align: center;
}

.confirm-info {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--border-radius-lg);
  color: var(--color-primary-400);
  font-size: 0.875rem;
  line-height: 1.4;
}

.confirm-info i {
  margin-top: 0.125rem;
  flex-shrink: 0;
}

/* ===== MOBILE CARD VIEW ===== */
.users-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-4);
}

.user-card {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  transition: all var(--transition-base);
}

.user-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.user-card.inactive {
  opacity: 0.6;
}

.user-card-header {
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
}

.user-card-header .user-info {
  flex: 1;
  min-width: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-details .user-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-username {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-body {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.info-row-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-border-primary);
}

.info-row-mobile:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row-mobile .info-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.info-row-mobile .info-label i {
  font-size: 0.875rem;
  color: var(--color-primary-500);
}

.info-row-mobile .info-value {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-card-footer {
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-primary);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
}

.user-card-footer-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.btn-block {
  width: 100%;
  justify-content: center;
}
/* Responsive tabs */
@media (max-width: 768px) {
  .tabs-container {
    padding: var(--spacing-3) var(--spacing-4);
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1;
    justify-content: center;
    padding: var(--spacing-2) var(--spacing-3);
    font-size: 0.8125rem;
  }

  .tab-btn span:not(.tab-count) {
    display: none;
  }

  .tab-btn i {
    margin: 0;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .provisorio-footer {
    flex-direction: column-reverse;
  }

  .provisorio-footer .btn {
    width: 100%;
  }
}
/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .page-container {
    padding: var(--spacing-4);
  }

  .card-header {
    padding: var(--spacing-4) var(--spacing-6);
    flex-direction: column;
    align-items: stretch;
  }

  .card-title-section {
    justify-content: center;
  }

  .card-actions {
    justify-content: center;
    flex-direction: column;
  }

  .card-actions .btn {
    width: 100%;
  }

  .card-body {
    padding: var(--spacing-4);
  }

  .table-wrapper {
    padding: var(--spacing-4);
  }

  /* Cambiar a vista de cards en tablets */
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  /* Cards en 2 columnas para tablets */
  .users-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-3);
  }

  .modal-content {
    width: 95vw;
    margin: var(--spacing-2);
  }

  .modal-header,
  .modal-body {
    padding: var(--spacing-4) var(--spacing-6);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .notification-container {
    top: var(--spacing-4);
    right: var(--spacing-4);
    left: var(--spacing-4);
    max-width: none;
  }

  .page-container {
    padding: var(--spacing-3);
  }

  .card-header {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .card-body {
    padding: var(--spacing-3);
  }

  .card-title {
    font-size: 1.125rem;
    text-align: center;
  }

  .card-title-icon {
    font-size: 1.25rem;
  }

  /* Vista de cards en 1 columna para móviles */
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .users-cards {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }

  /* Botones de acción en móvil */
  .card-actions {
    flex-direction: column;
    width: 100%;
  }

  .card-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .card-actions .btn span {
    display: inline;
  }

  .modal-content {
    width: 95vw;
    max-width: 700px;
  }

  .modal-header {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .modal-title-section {
    gap: var(--spacing-3);
  }

  .modal-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .modal-subtitle {
    font-size: 0.75rem;
  }

  .modal-header-actions {
    gap: var(--spacing-2);
  }

  .btn-dev-random span {
    display: none;
  }

  .btn-dev-random {
    padding: 0.5rem;
    min-width: 40px;
    justify-content: center;
  }

  .modal-body {
    padding: var(--spacing-4);
    max-height: calc(90vh - 180px);
  }

  .modal-footer {
    padding: var(--spacing-3) var(--spacing-4);
    flex-direction: column-reverse;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }

  /* Card footer en móvil */
  .user-card-footer {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }

  .user-card-footer-3 {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 640px) {
  .page-container {
    padding: var(--spacing-2);
  }

  .card-body {
    padding: var(--spacing-4);
  }

  .table-wrapper {
    padding: var(--spacing-2);
  }

  .card-header {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .modal-header,
  .modal-body {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .modal-content {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  }

  .modal-overlay {
    padding: 0;
  }

  .modal-body {
    max-height: calc(100vh - 160px);
  }
}

/* ===== TABS ===== */
.tabs-container {
  display: flex;
  gap: var(--spacing-2);
  padding: var(--spacing-4) var(--spacing-8);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background: transparent;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
}

.tab-btn.active {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: white;
}

.tab-btn.has-pending {
  border-color: rgba(245, 158, 11, 0.5);
}

.tab-btn.has-pending:not(.active) {
  animation: pulse-pending 2s ease-in-out infinite;
}

@keyframes pulse-pending {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.tab-count.pending {
  background: var(--color-warning-500);
  color: #000;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8) var(--spacing-4);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.empty-state p {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

/* ===== PROVISORIO STYLES ===== */
.user-avatar.provisorio {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.provisorio-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fbbf24;
  margin-left: 0.5rem;
}

.fecha-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.btn-icon.btn-view {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--color-primary-400);
}

.btn-icon.btn-view:hover {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: white;
}

.provisorio-card {
  border-color: rgba(245, 158, 11, 0.2);
}

.provisorio-card:hover {
  border-color: rgba(245, 158, 11, 0.4);
}

/* ===== PROVISORIO MODAL ===== */
.modal-content.modal-medium {
  width: 700px;
}

.modal-icon-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.provisorio-section {
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.provisorio-section:last-of-type {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary-400);
  margin-bottom: var(--spacing-4);
}

.section-title i {
  font-size: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.info-label-small {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value-large {
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.provisorio-footer {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-primary);
}

.btn-success {
  background: var(--color-success-500);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: var(--color-success-600);
}


</style>
