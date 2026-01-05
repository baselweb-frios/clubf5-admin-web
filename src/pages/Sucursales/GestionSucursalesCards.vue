<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="gestion-sucursales">
    <!-- SignalR Status Indicator -->
    <SignalRStatus :connectedCount="connectedCount" />

    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fa fa-building"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">Gestión de Sucursales</h1>
          <p class="page-subtitle">Administra y configura tus sucursales de manera eficiente</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openCreateModal">
          <i class="fa fa-plus"></i>
          Nueva Sucursal
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fa fa-building"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ sucursales.length }}</span>
          <span class="stat-label">Total Sucursales</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <i class="fa fa-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ sucursalesConectadas }}</span>
          <span class="stat-label">Conectadas</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-info">
          <i class="fa fa-music"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ programacionesRadio.length }}</span>
          <span class="stat-label">Prog. Música</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <i class="fa fa-bullhorn"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ programacionesSpot.length }}</span>
          <span class="stat-label">Prog. Spots</span>
        </div>
      </div>
      <div class="stat-card stat-card-audit" @click="showAuditModal = true">
        <div class="stat-icon stat-icon-audit">
          <i class="fa fa-chart-bar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalAuditRecords }}</span>
          <span class="stat-label">Registros Auditoría</span>
        </div>
      </div>
    </div>

    <!-- Search and View Toggle -->
    <div class="section-header">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Buscar sucursal por nombre o usuario..."
        class="search-input"
      >
      <div class="view-toggle">
        <button
          @click="viewMode = 'grid'"
          :class="['view-btn', { 'view-btn-active': viewMode === 'grid' }]"
          title="Vista en tarjetas"
        >
          <i class="fa fa-th"></i>
        </button>
        <button
          @click="viewMode = 'list'"
          :class="['view-btn', { 'view-btn-active': viewMode === 'list' }]"
          title="Vista en lista"
        >
          <i class="fa fa-list"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando sucursales...</p>
    </div>

    <!-- Sucursales Cards Grid -->
    <div v-else-if="viewMode === 'grid'" class="sucursales-grid">
      <div
        v-for="sucursal in filteredSucursales"
        :key="sucursal.clisuc_codigo"
        class="sucursal-card"
        :class="{ 'sucursal-card-offline': sucursal.conected !== 1 }"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="card-title-section">
            <div class="card-icon">
              <i class="fa fa-building"></i>
            </div>
            <div class="card-title-info">
              <h3 class="card-title">{{ sucursal.clisuc_nombre }}</h3>
              <span class="card-username">{{ sucursal.username }}</span>
            </div>
          </div>
          <span
            class="status-badge"
            :class="{ 'status-badge-online': sucursal.conected === 1, 'status-badge-offline': sucursal.conected !== 1 }"
          >
            <i class="fa fa-circle"></i>
            {{ sucursal.conected === 1 ? 'Conectada' : 'Desconectada' }}
          </span>
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <!-- Programaciones -->
          <div class="card-section">
            <div class="card-section-title">
              <i class="fa fa-calendar-alt"></i>
              Programaciones
            </div>
            <div class="card-badges">
              <div class="info-item">
                <span class="info-label">
                  <i class="fa fa-music"></i>
                  Música:
                </span>
                <span class="badge badge-info">
                  {{ getProgramacionRadioNombre(sucursal.sucpgr_codigoProgramacionRadio) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">
                  <i class="fa fa-bullhorn"></i>
                  Spots:
                </span>
                <span v-if="sucursal.sucpgr_codigoProgramacionSpot" class="badge badge-warning">
                  {{ getProgramacionSpotNombre(sucursal.sucpgr_codigoProgramacionSpot) }}
                </span>
                <span v-else class="badge badge-outline">Sin programación</span>
              </div>
              <div class="info-item">
                <span class="info-label">
                  <i class="fa fa-microphone"></i>
                  Spots propios:
                </span>
                <span :class="['badge', sucursal.clisuc_permisoSpotPropio ? 'badge-success' : 'badge-outline']">
                  {{ sucursal.clisuc_permisoSpotPropio ? 'Permitido' : 'No permitido' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Player Section (only if connected) -->
          <div v-if="sucursal.conected === 1" class="card-section">
            <div class="card-section-title">
              <i class="fa fa-play-circle"></i>
              Reproductor
            </div>

            <!-- Now Playing -->
            <div v-if="sucursal.currentSong" class="now-playing-card">
              <div class="now-playing-header">
                <i class="fa" :class="sucursal.isPlaying ? 'fa-play-circle playing-icon' : 'fa-pause-circle'"></i>
                <div class="song-details">
                  <div class="song-title">{{ sucursal.currentSong }}</div>
                  <div class="song-mode">{{ getPlayerModeLabel(sucursal.activePlayer) }}</div>
                </div>
              </div>
              <div v-if="sucursal.playbackProgress" class="progress-bar">
                <div class="progress-fill" :style="{ width: sucursal.playbackProgress.percentage + '%' }"></div>
              </div>
            </div>

            <!-- Player Controls -->
            <div class="player-controls-card">
              <div class="control-buttons">
                <button
                  class="control-btn"
                  @click="playerControl.play(sucursal.connectionId)"
                  :disabled="playerControl.executing.value"
                  title="Reproducir"
                >
                  <i class="fa fa-play"></i>
                  Play
                </button>
                <button
                  class="control-btn"
                  @click="playerControl.pause(sucursal.connectionId)"
                  :disabled="playerControl.executing.value"
                  title="Pausar"
                >
                  <i class="fa fa-pause"></i>
                  Pause
                </button>
              </div>

              <!-- Mode Toggle -->
              <div class="mode-toggle">
                <label class="switch-label">
                  <input
                    type="checkbox"
                    :checked="sucursal.playerStatus?.mode === 'radio'"
                    @change="togglePlayerMode(sucursal)"
                    :disabled="playerControl.executing.value"
                  />
                  <span class="switch-slider"></span>
                  <span class="switch-text">
                    {{ sucursal.playerStatus?.mode === 'radio' ? 'Radio' : 'Neuro' }}
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div v-else class="card-section">
            <div class="card-section-title">
              <i class="fa fa-play-circle"></i>
              Reproductor
            </div>
            <div class="offline-message">
              <i class="fa fa-exclamation-circle"></i>
              <span>Sucursal desconectada</span>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="card-footer">
          <button
            v-if="2 === 1"
            class="btn-card btn-card-audit"
            @click="openAuditForSucursal(sucursal)"
            :disabled="loadingAudit"
          >
            <i class="fa fa-chart-line"></i>
            Auditoría
          </button>
          <button
            v-if="2 === 1"
            class="btn-card btn-card-error-report"
            @click="openErrorReportsForSucursal(sucursal)"
            :disabled="loadingErrorReports"
            title="Ver reportes de errores"
          >
            <i class="fa fa-exclamation-triangle"></i>
            Reportes
          </button>
          <div class="card-actions">
            <button class="btn-card btn-card-edit" @click="openEditModal(sucursal,true)" title="Editar contraseña">
              <i class="fa fa-key"></i>
            </button>
            <button class="btn-card btn-card-edit" @click="openEditModal(sucursal)" title="Editar">
              <i class="fa fa-edit"></i>
              Editar
            </button>
            
            <button class="btn-card btn-card-delete" @click="confirmDelete(sucursal)" title="Eliminar">
              <i class="fa fa-trash"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredSucursales.length === 0" class="empty-state-grid">
        <i class="fa fa-building"></i>
        <p>No se encontraron sucursales</p>
        <button class="btn-primary" @click="openCreateModal">
          <i class="fa fa-plus"></i>
          Crear Primera Sucursal
        </button>
      </div>
    </div>

    <!-- Sucursales List View -->
    <div v-else class="sucursales-list">
      <div
        v-for="sucursal in filteredSucursales"
        :key="sucursal.clisuc_codigo"
        class="sucursal-list-item"
        :class="{ 'list-item-offline': sucursal.conected !== 1 }"
      >
        <div class="list-item-main">
          <div class="list-item-info">
            <span
              class="list-status-dot"
              :class="{ 'status-dot-online': sucursal.conected === 1, 'status-dot-offline': sucursal.conected !== 1 }"
            ></span>
            <div class="list-item-details">
              <h4 class="list-item-name">{{ sucursal.clisuc_nombre }}</h4>
              <span class="list-item-username">{{ sucursal.connectionId }}</span>
            </div>
          </div>

          <div class="list-item-badges">
            <span class="badge badge-info">
              <i class="fa fa-music"></i>
              {{ getProgramacionRadioNombre(sucursal.sucpgr_codigoProgramacionRadio) }}
            </span>
            <span v-if="sucursal.sucpgr_codigoProgramacionSpot" class="badge badge-warning">
              <i class="fa fa-bullhorn"></i>
              {{ getProgramacionSpotNombre(sucursal.sucpgr_codigoProgramacionSpot) }}
            </span>
          </div>

          <div class="list-item-actions">
            <button
              v-if="sucursal.conected === 1"
              class="btn-list btn-list-audit"
              @click="openAuditForSucursal(sucursal)"
            >
              <i class="fa fa-chart-line"></i>
            </button>
            <button
              v-if="sucursal.conected === 1"
              class="btn-list btn-list-error-report"
              @click="openErrorReportsForSucursal(sucursal)"
              title="Ver reportes de errores"
            >
              <i class="fa fa-exclamation-triangle"></i>
            </button>
            <button class="btn-list btn-list-edit" @click="openEditModal(sucursal,true)">
              <i class="fa fa-key"></i>
            </button>
            <button class="btn-list btn-list-edit" @click="openEditModal(sucursal)">
              <i class="fa fa-edit"></i>
            </button>
            
            <button class="btn-list btn-list-delete" @click="confirmDelete(sucursal)">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Expandable Player Controls (only if connected) -->
        <div v-if="sucursal.conected === 1 && sucursal.currentSong" class="list-item-player">
          <div class="list-player-info">
            <i class="fa" :class="sucursal.isPlaying ? 'fa-play-circle' : 'fa-pause-circle'"></i>
            <span class="list-song-title">{{ sucursal.currentSong }}</span>
          </div>
          <div class="list-player-controls">
            <button
              class="control-btn-small"
              @click="playerControl.play(sucursal.connectionId)"
              :disabled="playerControl.executing.value"
            >
              <i class="fa fa-play"></i>
            </button>
            <button
              class="control-btn-small"
              @click="playerControl.pause(sucursal.connectionId)"
              :disabled="playerControl.executing.value"
            >
              <i class="fa fa-pause"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State List -->
      <div v-if="filteredSucursales.length === 0" class="empty-state-list">
        <i class="fa fa-building"></i>
        <p>No se encontraron sucursales</p>
      </div>
    </div>

    <!-- Modals (same as before) -->
    <!-- Modal Crear/Editar Sucursal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i :class="['fa', isEditMode ? 'fa-edit' : 'fa-plus']"></i>
            {{ isEditMode ? 'Editar Sucursal' : 'Nueva Sucursal' }}
          </h3>
          <button class="modal-close" @click="closeModal">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveSucursal">
            <!-- Nombre de Sucursal -->
            <div class="form-group" v-if="!isEditPasswordVisible">
              <label class="form-label required">
                <i class="fa fa-building"></i>
                Nombre de la Sucursal
              </label>
              <input
                v-model="formData.nombreSucursal"
                @input="formData.usuario=formData.nombreSucursal.replace(/\s/g, '').toLowerCase()"
                type="text"
                class="form-input"
                placeholder="Ej: Sucursal Centro"
                required
              >
            </div>

            <!-- Usuario -->
            <div class="form-group" v-if="!isEditPasswordVisible">
              <label class="form-label required">
                <i class="fa fa-user"></i>
                Usuario (Login)
              </label>
              <div class="input-group">
                <input
                  v-model="formData.usuario"
                  type="text"
                  class="form-input"
                  placeholder="usuario"
                  :disabled="isEditMode"
                  required
                >
              </div>
              <small class="form-help">
                {{ isEditMode ? 'El usuario no puede modificarse' : '' }}
              </small>
            </div>

            <!-- Contraseña -->
            <div class="form-group" v-if="!isEditMode||isEditPasswordVisible">
              <label class="form-label" :class="{ 'required': !isEditMode }">
                <i class="fa fa-lock"></i>
                Contraseña
              </label>
              <input
                v-model="formData.contrasenia"
                type="password"
                class="form-input"
                placeholder="••••••••"
                :required="!isEditMode"
              >
              <small class="form-help" v-if="isEditMode">
                Dejar en blanco para mantener la contraseña actual
              </small>
            </div>

            <!-- Programación de Música -->
            <div class="form-group" v-if="!isEditPasswordVisible">
              <label class="form-label required">
                <i class="fa fa-music"></i>
                Programación de Música
              </label>
              <select v-model="formData.progRadioSelected" class="form-select" required>
                <option value="">Seleccionar programación</option>
                <option
                  v-for="prog in programacionesRadio"
                  :key="prog.clipro_codigo"
                  :value="prog.clipro_codigo"
                >
                  {{ prog.clipro_nombre }}
                </option>
              </select>
            </div>

            <!-- Permiso Spots Propios -->
            <div class="form-group" v-if="!isEditPasswordVisible">
              <label class="checkbox-label">
                <input
                  v-model="formData.permisoSpotPropio"
                  type="checkbox"
                  class="form-checkbox"
                  @change="onPermisoSpotChange"
                >
                <span class="checkbox-text">
                  <i class="fa fa-bullhorn"></i>
                  Permitir a la sucursal crear sus propios spots
                </span>
              </label>
            </div>

            <!-- Programación de Spots (solo si tiene permiso) -->
            <div v-if="formData.permisoSpotPropio&&!isEditPasswordVisible" class="form-group">
              <label class="form-label required">
                <i class="fa fa-calendar-alt"></i>
                Programación de Spots
              </label>
              <select v-model="formData.progSpotSelected" class="form-select" required>
                <option value="">Seleccionar programación de spots</option>
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
            <div class="form-preview">
              <h4>Vista Previa</h4>
              <div class="preview-grid">
                <div class="preview-item">
                  <span class="preview-label">Usuario completo:</span>
                  <span class="preview-value">{{ formData.usuario || '_____' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Nombre:</span>
                  <span class="preview-value">{{ formData.nombreSucursal || '(sin nombre)' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Música:</span>
                  <span class="preview-value">{{ getProgramacionRadioNombre(formData.progRadioSelected) }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Spots propios:</span>
                  <span class="preview-value">{{ formData.permisoSpotPropio ? 'Sí' : 'No' }}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">
            <i class="fa fa-times"></i>
            Cancelar
          </button>
          <button class="btn-primary" @click="saveSucursal" :disabled="isSaving">
            <i :class="['fa', isSaving ? 'fa-spinner fa-spin' : 'fa-save']"></i>
            {{ isSaving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content modal-confirm" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fa fa-exclamation-triangle"></i>
            Confirmar Eliminación
          </h3>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar la sucursal <strong>{{ sucursalToDelete?.clisuc_nombre }}</strong>?</p>
          <p class="text-warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteModal = false">
            <i class="fa fa-times"></i>
            Cancelar
          </button>
          <button class="btn-danger" @click="deleteSucursal">
            <i class="fa fa-trash"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Auditoría (incluir el modal original) -->
    <!-- ... (copiar el modal de auditoría del archivo original) -->

    <!-- Modal Reportes de Errores -->
    <div v-if="showErrorReportsModal" class="modal-overlay" @click="closeErrorReportsModal">
      <div class="modal-content modal-error-reports" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fa fa-exclamation-triangle"></i>
            Reportes de Errores - {{ selectedSucursalForReports?.clisuc_nombre }}
          </h3>
          <button class="modal-close" @click="closeErrorReportsModal">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="loadingErrorReports" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando reportes de errores...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="errorReportsError" class="error-state">
            <i class="fa fa-times-circle"></i>
            <p>{{ errorReportsError }}</p>
            <button class="btn-primary" @click="loadErrorReportsForSucursal(selectedSucursalForReports)">
              <i class="fa fa-sync"></i>
              Reintentar
            </button>
          </div>

          <!-- Reports Summary -->
          <div v-else-if="errorReportsSummary" class="reports-summary">
            <div class="summary-cards">
              <div class="summary-card summary-card-total">
                <div class="summary-icon">
                  <i class="fa fa-file-alt"></i>
                </div>
                <div class="summary-info">
                  <span class="summary-value">{{ errorReportsSummary.totalReports || 0 }}</span>
                  <span class="summary-label">Total Reportes</span>
                </div>
              </div>
              <div class="summary-card summary-card-error">
                <div class="summary-icon">
                  <i class="fa fa-times-circle"></i>
                </div>
                <div class="summary-info">
                  <span class="summary-value">{{ errorReportsSummary.errorCount || 0 }}</span>
                  <span class="summary-label">Errores</span>
                </div>
              </div>
              <div class="summary-card summary-card-warning">
                <div class="summary-icon">
                  <i class="fa fa-exclamation-triangle"></i>
                </div>
                <div class="summary-info">
                  <span class="summary-value">{{ errorReportsSummary.warningCount || 0 }}</span>
                  <span class="summary-label">Advertencias</span>
                </div>
              </div>
              <div class="summary-card summary-card-info">
                <div class="summary-icon">
                  <i class="fa fa-info-circle"></i>
                </div>
                <div class="summary-info">
                  <span class="summary-value">{{ errorReportsSummary.infoCount || 0 }}</span>
                  <span class="summary-label">Info</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="reports-actions">
              <button class="btn-secondary" @click="exportErrorReports" :disabled="loadingExport">
                <i :class="['fa', loadingExport ? 'fa-spinner fa-spin' : 'fa-download']"></i>
                {{ loadingExport ? 'Exportando...' : 'Exportar JSON' }}
              </button>
              <button class="btn-secondary" @click="toggleErrorReportsViewer">
                <i class="fa fa-eye"></i>
                Ver en Sucursal
              </button>
              <button class="btn-danger" @click="confirmClearErrorReports" :disabled="loadingClear">
                <i :class="['fa', loadingClear ? 'fa-spinner fa-spin' : 'fa-trash']"></i>
                {{ loadingClear ? 'Limpiando...' : 'Limpiar Todo' }}
              </button>
            </div>

            <!-- Recent Reports Preview -->
            <div v-if="errorReportsSummary.recentReports && errorReportsSummary.recentReports.length > 0" class="recent-reports">
              <h4>Reportes Recientes</h4>
              <div class="reports-list">
                <div
                  v-for="(report, index) in errorReportsSummary.recentReports"
                  :key="index"
                  class="report-item"
                  :class="'report-item-' + (report.severity || 'info')"
                >
                  <div class="report-header">
                    <span class="report-category">{{ report.category || 'general' }}</span>
                    <span class="report-time">{{ formatReportTime(report.timestamp) }}</span>
                  </div>
                  <div class="report-message">{{ report.message }}</div>
                  <div v-if="report.details" class="report-details">
                    <span class="report-details-label">Detalles:</span>
                    <pre>{{ JSON.stringify(report.details, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-reports">
              <i class="fa fa-check-circle"></i>
              <p>No hay reportes de errores</p>
              <p class="empty-reports-subtitle">Esta sucursal no tiene errores registrados</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeErrorReportsModal">
            <i class="fa fa-times"></i>
            Cerrar
          </button>
          <button class="btn-primary" @click="loadErrorReportsForSucursal(selectedSucursalForReports)">
            <i class="fa fa-sync"></i>
            Actualizar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación Limpiar Reportes -->
    <div v-if="showClearReportsModal" class="modal-overlay" @click="showClearReportsModal = false">
      <div class="modal-content modal-confirm" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fa fa-exclamation-triangle"></i>
            Confirmar Limpieza de Reportes
          </h3>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas limpiar todos los reportes de errores de <strong>{{ selectedSucursalForReports?.clisuc_nombre }}</strong>?</p>
          <p class="text-warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showClearReportsModal = false">
            <i class="fa fa-times"></i>
            Cancelar
          </button>
          <button class="btn-danger" @click="clearErrorReports">
            <i class="fa fa-trash"></i>
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

// Player control con callbacks
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

// State
const isLoading = ref(false)
const isSaving = ref(false)
const programacionesRadio = ref([])
const programacionesSpot = ref([])
const searchTerm = ref('')
const viewMode = ref('grid') // 'grid' or 'list'
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const sucursalToDelete = ref(null)
const isEditPasswordVisible = ref(false)
const codigoCliente = ref(0)
const usuarioCliente = ref('')

// Audit State
const showAuditModal = ref(false)
const loadingAudit = ref(false)
const auditStats = ref(null)
const selectedSucursalForAudit = ref(null)
const totalAuditRecords = ref(0)

// Error Reports State
const showErrorReportsModal = ref(false)
const showClearReportsModal = ref(false)
const loadingErrorReports = ref(false)
const loadingExport = ref(false)
const loadingClear = ref(false)
const errorReportsError = ref(null)
const errorReportsSummary = ref(null)
const selectedSucursalForReports = ref(null)

// Form Data
const formData = ref({
  clisuc_codigo: 0,
  nombreSucursal: '',
  usuario: '',
  contrasenia: '',
  progRadioSelected: '',
  progSpotSelected: '',
  permisoSpotPropio: false
})

// Computed
const sucursalesConectadas = computed(() => {
  // Usar el conteo del monitor si está disponible, sino contar manualmente
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

// Methods
const loadClienteData = () => {
  const currentUser = UserServices.current()
  if (currentUser && currentUser.Cliente) {
    const cliente = JSON.parse(currentUser.Cliente)
    codigoCliente.value = cliente.cli_codigo
    usuarioCliente.value = cliente.cli_usuari
    console.log('📋 Datos del cliente cargados:', { codigoCliente: codigoCliente.value })
  }
}

// useSucursal con real-time y monitor de conexiones habilitado
// useSucursal con real-time y monitor de conexiones habilitado
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
      // Usar sucursalesConnected que tiene el estado de conexión actualizado
      sucursales.value = sucursalesConnected.value
    }
    console.log('✅ Sucursales cargadas:', data?.length || 0)
    console.log('🔌 Sucursales conectadas:', connectedCount.value)
  } catch (error) {
    console.error('❌ Error cargando sucursales:', error)
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
    console.log('✅ Programaciones de radio cargadas:', progRadios.length)

    await ClienteProgramacionServices.listarProgSpot()
    const progSpots = JSON.parse(localStorage.getItem('listProgSpot') || '[]')
    programacionesSpot.value = progSpots
    console.log('✅ Programaciones de spot cargadas:', progSpots.length)
  } catch (error) {
    console.error('❌ Error cargando programaciones:', error)
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

const openEditModal = (sucursal,ispassword=false) => {
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
      alert('✅ Sucursal actualizada exitosamente')
    } else {
      await SucursalServices.altaSucursal(sucursalData)
      alert('✅ Sucursal creada exitosamente')
    }

    closeModal()
    await loadSucursales()
  } catch (error) {
    console.error('❌ Error guardando sucursal:', error)
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
    alert('✅ Sucursal eliminada exitosamente')
    showDeleteModal.value = false
    sucursalToDelete.value = null
    await loadSucursales()
  } catch (error) {
    console.error('❌ Error eliminando sucursal:', error)
    alert('Error al eliminar la sucursal')
  }
}

// Player Control Functions
const getPlayerModeLabel = (mode) => {
  const modes = {
    music: 'Música',
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
    console.error('[GestionSucursales] Error al cambiar modo:', error)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Error al cambiar modo: ${error.message}`, 'error')
    }
  }
}

// Audit Functions
const openAuditForSucursal = async (sucursal) => {
  selectedSucursalForAudit.value = sucursal
  showAuditModal.value = true
  // Implementar carga de auditoría según el modal original
}

// Error Reports Functions
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
    console.error('Sucursal no válida')
    return
  }

  try {
    loadingErrorReports.value = true
    errorReportsError.value = null

    console.log(`📊 Solicitando resumen de reportes de errores para ${sucursal.clisuc_nombre}`)

    // Enviar comando por SignalR para obtener resumen
    await playerControl.RemoteGetErrorReportSummary(sucursal.connectionId)

    // Esperar respuesta del reproductor (timeout de 10 segundos)
    const timeout = 10000
    const startTime = Date.now()

    // Polling para esperar la respuesta
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

    // Configurar listener temporal para capturar la respuesta
    // (Nota: Esto debería manejarse en el composable usePlayerControl)
    const summaryData = await checkResponse()

    console.log('✅ Resumen de reportes recibido:', summaryData)

    if (proxy && proxy.$toast) {
      proxy.$toast('Reportes de errores cargados correctamente', 'success')
    }
  } catch (error) {
    console.error('❌ Error cargando reportes:', error)
    errorReportsError.value = error.message || 'Error al cargar reportes de errores'

    if (proxy && proxy.$toast) {
      proxy.$toast(`Error al cargar reportes: ${error.message}`, 'error')
    }
  } finally {
    loadingErrorReports.value = false
  }
}

const exportErrorReports = async () => {
  if (!selectedSucursalForReports.value) return

  try {
    loadingExport.value = true
    console.log(`📥 Exportando reportes de errores de ${selectedSucursalForReports.value.clisuc_nombre}`)

    // Enviar comando por SignalR
    await playerControl.executeCommand('RemoteExportErrorReports', selectedSucursalForReports.value.userId, {
      filters: {} // Exportar todos
    })

    if (proxy && proxy.$toast) {
      proxy.$toast('Exportación iniciada. Los datos se descargarán cuando estén listos.', 'info')
    }
  } catch (error) {
    console.error('❌ Error exportando reportes:', error)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Error al exportar reportes: ${error.message}`, 'error')
    }
  } finally {
    loadingExport.value = false
  }
}

const toggleErrorReportsViewer = async () => {
  if (!selectedSucursalForReports.value) return

  try {
    console.log(`👁️ Toggling error reports viewer en ${selectedSucursalForReports.value.clisuc_nombre}`)

    // Enviar comando por SignalR
    await playerControl.executeCommand('RemoteToggleErrorReports', selectedSucursalForReports.value.userId, {})

    if (proxy && proxy.$toast) {
      proxy.$toast('Visualizador de reportes alternado en la sucursal', 'success')
    }
  } catch (error) {
    console.error('❌ Error toggling reports viewer:', error)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Error: ${error.message}`, 'error')
    }
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

    console.log(`🗑️ Limpiando reportes de errores de ${selectedSucursalForReports.value.clisuc_nombre}`)

    // Enviar comando por SignalR
    await playerControl.executeCommand('RemoteClearErrorReports', selectedSucursalForReports.value.userId, {})

    // Recargar resumen
    await loadErrorReportsForSucursal(selectedSucursalForReports.value)

    if (proxy && proxy.$toast) {
      proxy.$toast('Reportes de errores limpiados correctamente', 'success')
    }
  } catch (error) {
    console.error('❌ Error limpiando reportes:', error)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Error al limpiar reportes: ${error.message}`, 'error')
    }
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

// Lifecycle
onMounted(async () => {
  loadClienteData()
  await Promise.all([
    loadSucursales(),
    loadProgramaciones()
  ])

  // Sincronizar actualizaciones en tiempo real cada segundo
  setInterval(() => {
    if (sucursalesConnected.value && sucursalesConnected.value.length > 0) {
      // Usar sucursalesConnected que tiene el estado de conexión actualizado por el monitor
      sucursales.value = [...sucursalesConnected.value]
    }
  }, 1000)

  // Log periódico del estado de conexiones
  // setInterval(() => {
  //   if (connectionMonitor) {
  //     const connected = connectionMonitor.getAllConnected()
  //     console.log(`[GestionSucursales] 📊 Estado de conexiones:`, {
  //       total: sucursales.value.length,
  //       conectadas: connectedCount.value,
  //       sucursales: connected.map(c => ({
  //         nombre: c.branchName,
  //         usuario: c.username,
  //         ultimoHeartbeat: c.lastSeen
  //       }))
  //     })
  //   }
  // }, 30000) // Cada 30 segundos
})
</script>

<style scoped>
/* Variables */
:root {
  --color-primary: #667eea;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
  --color-bg-dark: #0f1419;
  --color-bg-card: #16181d;
  --color-border: rgba(255, 255, 255, 0.06);
  --color-text-primary: #e5e7eb;
  --color-text-secondary: rgba(255, 255, 255, 0.7);
}

.gestion-sucursales {
  min-height: 100vh;
  background: var(--color-bg-dark);
  color: var(--color-text-primary);
  padding: 2rem;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-card);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon-success {
  background: linear-gradient(135deg, var(--color-success) 0%, #059669 100%);
}

.stat-icon-info {
  background: linear-gradient(135deg, var(--color-info) 0%, #2563eb 100%);
}

.stat-icon-warning {
  background: linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%);
}

.stat-icon-audit {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.stat-card-audit {
  cursor: pointer;
}

.stat-card-audit:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Section Header with View Toggle */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
  padding: 0.75rem 1rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  width: 40px;
  height: 40px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-primary);
}

.view-btn-active {
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* Sucursales Grid */
.sucursales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

/* Sucursal Card */
.sucursal-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.sucursal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.sucursal-card-offline {
  opacity: 0.7;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.card-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.card-title-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-username {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  display: block;
}

.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge i {
  font-size: 0.625rem;
}

.status-badge-online {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge-online i {
  animation: pulse-online 2s infinite;
}

@keyframes pulse-online {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-badge-offline {
  background: rgba(100, 116, 139, 0.2);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.card-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-section {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.card-section-title {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-section-title i {
  color: var(--color-primary);
}

.card-badges {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.info-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-info {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-success {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-outline {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

/* Now Playing Card */
.now-playing-card {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 10px;
  padding: 1rem;
}

.now-playing-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 0.75rem;
}

.now-playing-header i {
  font-size: 1.75rem;
  color: #60a5fa;
  flex-shrink: 0;
}

.now-playing-header i.playing-icon {
  color: var(--color-success);
  animation: pulse-icon 2s infinite;
}

@keyframes pulse-icon {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.song-mode {
  font-size: 0.75rem;
  color: #60a5fa;
  text-transform: uppercase;
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Player Controls Card */
.player-controls-card {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.control-buttons {
  display: flex;
  gap: 0.75rem;
}

.control-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.control-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-toggle {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  cursor: pointer;
  user-select: none;
  font-size: 0.875rem;
}

.switch-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  transition: all 0.2s ease;
}

.switch-slider::before {
  content: '';
  position: absolute;
  width: 1.125rem;
  height: 1.125rem;
  left: 0.125rem;
  top: 0.125rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
}

.switch-label input:checked + .switch-slider {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.switch-label input:checked + .switch-slider::before {
  transform: translateX(1.5rem);
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.switch-label:hover .switch-slider {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(59, 130, 246, 0.3);
}

.switch-label input:disabled + .switch-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-text {
  font-weight: 600;
  color: var(--color-text-primary);
  min-width: 50px;
}

.offline-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.offline-message i {
  color: #64748b;
}

/* Card Footer */
.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.02);
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-card {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-card-audit {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
}

.btn-card-audit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.btn-card-error-report {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.btn-card-error-report:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.btn-card-edit {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-card-edit:hover {
  background: rgba(59, 130, 246, 0.3);
}

.btn-card-delete {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-card-delete:hover {
  background: rgba(239, 68, 68, 0.3);
}

.btn-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty States */
.empty-state-grid {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-secondary);
}

.empty-state-grid i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.4;
}

.empty-state-grid p {
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

/* List View */
.sucursales-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sucursal-list-item {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.sucursal-list-item:hover {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.list-item-offline {
  opacity: 0.7;
}

.list-item-main {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.list-item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 200px;
}

.list-status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-online {
  background: var(--color-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.status-dot-offline {
  background: #64748b;
}

.list-item-details {
  flex: 1;
  min-width: 0;
}

.list-item-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: white;
}

.list-item-username {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.list-item-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.list-item-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-list {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-list-audit {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.btn-list-audit:hover {
  background: rgba(139, 92, 246, 0.3);
}

.btn-list-error-report {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.btn-list-error-report:hover {
  background: rgba(245, 158, 11, 0.3);
}

.btn-list-edit {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.btn-list-edit:hover {
  background: rgba(59, 130, 246, 0.3);
}

.btn-list-delete {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.btn-list-delete:hover {
  background: rgba(239, 68, 68, 0.3);
}

.list-item-player {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: rgba(59, 130, 246, 0.05);
}

.list-player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.list-player-info i {
  color: #60a5fa;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.list-song-title {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-player-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn-small {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.control-btn-small:hover:not(:disabled) {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  transform: scale(1.1);
}

.control-btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state-list {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-secondary);
}

.empty-state-list i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.4;
}

/* Loading */
.loading-overlay {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: linear-gradient(135deg, var(--color-danger) 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
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
  padding: 2rem;
}

.modal-content {
  background: linear-gradient(135deg, rgba(26, 26, 64, 0.98) 0%, rgba(15, 15, 35, 0.98) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label.required::after {
  content: '*';
  color: var(--color-danger);
  margin-left: 0.25rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-prefix {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.input-group .form-input {
  border-radius: 0 8px 8px 0;
}

.form-help {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: rgba(255, 255, 255, 0.08);
}

.form-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

/* Preview */
.form-preview {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
}

.form-preview h4 {
  margin: 0 0 1rem 0;
  color: white;
  font-size: 1.1rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.preview-value {
  font-weight: 600;
  color: white;
}

.text-warning {
  color: var(--color-warning);
  margin-top: 0.5rem;
}

/* Responsive */
@media (min-width: 1200px) {
  .sucursales-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (min-width: 768px) {
  .gestion-sucursales {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }

  .view-toggle {
    justify-content: center;
  }

  .sucursales-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .btn-card-audit {
    width: 100%;
    justify-content: center;
  }

  .player-controls-card {
    flex-direction: column;
  }

  .control-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .mode-toggle {
    width: 100%;
    justify-content: center;
  }

  .list-item-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .list-item-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-footer button {
    width: 100%;
  }
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: row;
  }

  .header-icon, .stat-icon, .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.125rem;
  }
}

/* Error Reports Modal */
.modal-error-reports {
  max-width: 900px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 3rem 2rem;
}

.loading-state .spinner {
  margin: 0 auto 1rem;
}

.error-state i {
  font-size: 3rem;
  color: var(--color-danger);
  margin-bottom: 1rem;
}

.error-state p {
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

/* Reports Summary */
.reports-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-card-total {
  border-left: 3px solid var(--color-primary);
}

.summary-card-error {
  border-left: 3px solid var(--color-danger);
}

.summary-card-warning {
  border-left: 3px solid var(--color-warning);
}

.summary-card-info {
  border-left: 3px solid var(--color-info);
}

.summary-icon {
  width: 48px;
  height: 48px;
  background: rgba(102, 126, 234, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--color-primary);
}

.summary-card-error .summary-icon {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
}

.summary-card-warning .summary-icon {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.summary-card-info .summary-icon {
  background: rgba(59, 130, 246, 0.15);
  color: var(--color-info);
}

.summary-info {
  display: flex;
  flex-direction: column;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
}

.summary-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Reports Actions */
.reports-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.reports-actions button {
  flex: 1;
  min-width: 150px;
  justify-content: center;
}

/* Recent Reports */
.recent-reports {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.recent-reports h4 {
  margin: 0 0 1rem 0;
  color: white;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.report-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-info);
  border-radius: 8px;
  padding: 1rem;
}

.report-item-critical,
.report-item-high {
  border-left-color: var(--color-danger);
}

.report-item-medium,
.report-item-warning {
  border-left-color: var(--color-warning);
}

.report-item-low,
.report-item-info {
  border-left-color: var(--color-info);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.report-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
}

.report-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.report-message {
  color: var(--color-text-primary);
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.report-details {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.report-details-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}

.report-details pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  overflow-x: auto;
  margin: 0;
}

/* Empty Reports State */
.empty-reports {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-reports i {
  font-size: 4rem;
  color: var(--color-success);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-reports p {
  margin: 0.5rem 0;
  color: var(--color-text-primary);
  font-size: 1.125rem;
}

.empty-reports-subtitle {
  font-size: 0.95rem !important;
  color: var(--color-text-secondary) !important;
}

/* Responsive Error Reports */
@media (min-width: 768px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .reports-actions {
    flex-direction: column;
  }

  .reports-actions button {
    width: 100%;
  }
}

@media (min-width: 640px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
