<template>
  <div class="sucursales-container" role="main" aria-label="Gestión de Sucursales">
    <!-- Page Header -->
    <header class="page-header" role="banner">
      <div class="header-content">
        <div class="header-icon" aria-hidden="true">
          <i class="fas fa-building"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title" id="main-heading">Gestión de Sucursales</h1>
          <p class="page-subtitle" aria-describedby="main-heading">
            Administra y configura tus sucursales de manera eficiente
          </p>
        </div>
      </div>
      <div class="header-actions">
        <button
          class="btn-primary"
          @click="showCreateModal = true"
          :aria-describedby="showCreateModal ? 'create-modal-describedby' : null"
          aria-label="Crear nueva sucursal"
        >
          <i class="fas fa-plus" aria-hidden="true"></i>
          <span>Nueva Sucursal</span>
        </button>
      </div>
    </header>

    <div class="content-grid">
      <!-- Stats Cards -->
      <section class="stats-section stats-grid-4" aria-label="Estadísticas de sucursales" role="region">
        <div class="stat-card" role="article" aria-labelledby="stat-total-label">
          <div class="stat-icon" aria-hidden="true">
            <i class="fas fa-building"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" aria-label="Cantidad total de sucursales">
              {{ sucursales.length }}
            </span>
            <span class="stat-label" id="stat-total-label">Total Sucursales</span>
          </div>
        </div>
        <div class="stat-card" role="article" aria-labelledby="stat-active-label">
          <div class="stat-icon" aria-hidden="true">
            <i class="fas fa-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" aria-label="Cantidad de sucursales activas">
              {{ sucursales.filter(s => s.activa).length }}
            </span>
            <span class="stat-label" id="stat-active-label">Activas</span>
          </div>
        </div>
        <div class="stat-card" role="article" aria-labelledby="stat-music-label">
          <div class="stat-icon stat-icon-info" aria-hidden="true">
            <i class="fas fa-music"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" aria-label="Cantidad de canciones en cola">
              {{ totalMusicRemaining }}
            </span>
            <span class="stat-label" id="stat-music-label">Canciones en Cola</span>
          </div>
        </div>
        <div class="stat-card" role="article" aria-labelledby="stat-spots-label">
          <div class="stat-icon stat-icon-warning" aria-hidden="true">
            <i class="fas fa-bullhorn"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value" aria-label="Cantidad total de spots">
              {{ totalSpots }}
            </span>
            <span class="stat-label" id="stat-spots-label">Total Spots</span>
          </div>
        </div>
      </section>

      <!-- Sucursales List -->
      <section class="sucursales-section" aria-label="Lista de sucursales" role="region">
        <header class="section-header">
          <h2 class="section-title" id="sucursales-heading">Lista de Sucursales</h2>
          <div class="section-actions">
            <label for="search-input" class="sr-only">Buscar sucursales</label>
            <input
              id="search-input"
              type="text"
              v-model="searchTerm"
              placeholder="Buscar sucursal por nombre o usuario..."
              class="search-input"
              aria-describedby="search-help"
              autocomplete="off"
            >
            <div id="search-help" class="sr-only">
              Busque por nombre de sucursal o nombre de usuario
            </div>
          </div>
        </header>

        <!-- Loading state -->
        <div v-if="loading" class="loading-overlay" aria-live="polite" aria-label="Cargando sucursales">
          <div class="loading-spinner" aria-hidden="true"></div>
          <span class="sr-only">Cargando lista de sucursales...</span>
        </div>

        <div
          v-else-if="filteredSucursales.length === 0"
          class="empty-state"
          role="status"
          aria-live="polite"
        >
          <div class="empty-state-icon" aria-hidden="true">
            <i class="fas fa-search"></i>
          </div>
          <h3>No se encontraron sucursales</h3>
          <p>{{ searchTerm ? 'No hay sucursales que coincidan con la búsqueda' : 'Aún no hay sucursales registradas' }}</p>
        </div>

        <div
          v-else
          class="sucursales-grid"
          role="list"
          :aria-label="`${filteredSucursales.length} sucursal${filteredSucursales.length !== 1 ? 'es' : ''} encontrada${filteredSucursales.length !== 1 ? 's' : ''}`"
        >
          <article
            v-for="sucursal in filteredSucursales"
            :key="sucursal.id"
            class="sucursal-card"
            :class="{ 'inactive': !sucursal.activa }"
            role="listitem"
            :aria-labelledby="`sucursal-${sucursal.id}-name`"
            tabindex="0"
            @keydown.enter="editSucursal(sucursal)"
            @keydown.delete="deleteSucursal(sucursal)"
          >
            <header class="card-header">
              <div class="sucursal-icon" aria-hidden="true">
                <i class="fas fa-building"></i>
              </div>
              <div class="sucursal-info">
                <h3
                  class="sucursal-name"
                  :id="`sucursal-${sucursal.id}-name`"
                >
                  {{ sucursal.nombre }}
                </h3>
                <span
                  class="sucursal-status"
                  :class="{ 'active': sucursal.activa }"
                  :aria-label="`Estado: ${sucursal.activa ? 'Activa' : 'Inactiva'}`"
                >
                  <i :class="sucursal.activa ? 'fas fa-circle' : 'fas fa-circle'" aria-hidden="true"></i>
                  <span>{{ sucursal.activa ? 'Activa' : 'Inactiva' }}</span>
                </span>
              </div>
            </header>

            <div class="card-content">
              <!-- Player Status -->
              <div v-if="sucursal.currentSong" class="player-status">
                <div class="now-playing">
                  <i class="fas" :class="sucursal.isPlaying ? 'fa-play-circle playing' : 'fa-pause-circle'"></i>
                  <div class="song-info">
                    <span class="song-title">{{ sucursal.currentSong }}</span>
                    <span class="player-mode">{{ getPlayerModeLabel(sucursal.activePlayer) }}</span>
                  </div>
                </div>
                <div v-if="sucursal.playbackProgress" class="progress-bar">
                  <div class="progress-fill" :style="{ width: sucursal.playbackProgress.percentage + '%' }"></div>
                  <span class="progress-text">{{ sucursal.playbackProgress.percentage }}%</span>
                </div>
              </div>

              <dl class="sucursal-details">
                <div class="sucursal-detail">
                  <dt class="detail-label">Usuario:</dt>
                  <dd class="detail-value">{{ sucursal.usuario }}</dd>
                </div>
                <div class="sucursal-detail">
                  <dt class="detail-label">Última conexión:</dt>
                  <dd class="detail-value">{{ sucursal.ultimaConexion }}</dd>
                </div>
                <div v-if="sucursal.musicRemaining" class="sucursal-detail">
                  <dt class="detail-label">En cola:</dt>
                  <dd class="detail-value">{{ sucursal.musicRemaining }} canciones</dd>
                </div>
                <div v-if="sucursal.totalSpots" class="sucursal-detail">
                  <dt class="detail-label">Spots:</dt>
                  <dd class="detail-value">{{ sucursal.totalSpots }} disponibles</dd>
                </div>
              </dl>
            </div>

            <div class="card-actions" role="group" aria-label="Acciones de sucursal">
              <button
                class="btn-secondary"
                @click="editSucursal(sucursal)"
                :aria-label="`Editar sucursal ${sucursal.nombre}`"
              >
                <i class="fas fa-edit" aria-hidden="true"></i>
                <span>Editar</span>
              </button>
              <button
                class="btn-danger"
                @click="deleteSucursal(sucursal)"
                :aria-label="`Eliminar sucursal ${sucursal.nombre}`"
              >
                <i class="fas fa-trash" aria-hidden="true"></i>
                <span>Eliminar</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal"
      class="modal-overlay"
      @click="showCreateModal = false"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="editingSucursal ? 'edit-modal-title' : 'create-modal-title'"
      aria-describedby="modal-description"
    >
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h3
            :id="editingSucursal ? 'edit-modal-title' : 'create-modal-title'"
            class="modal-title"
          >
            {{ editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal' }}
          </h3>
          <button
            class="modal-close"
            @click="showCreateModal = false"
            aria-label="Cerrar modal"
            type="button"
          >
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </header>

        <form @submit.prevent="saveSucursal" class="modal-form" novalidate>
          <div id="modal-description" class="sr-only">
            Complete el formulario para {{ editingSucursal ? 'editar la sucursal seleccionada' : 'crear una nueva sucursal' }}
          </div>

          <div class="form-group">
            <label class="form-label" for="sucursal-nombre">
              Nombre de la Sucursal <span aria-label="campo requerido">*</span>
            </label>
            <input
              id="sucursal-nombre"
              type="text"
              v-model="formData.nombre"
              class="form-input"
              required
              aria-required="true"
              :aria-invalid="formData.nombre === '' ? 'true' : 'false'"
              autocomplete="organization"
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="sucursal-usuario">
              Usuario <span aria-label="campo requerido">*</span>
            </label>
            <input
              id="sucursal-usuario"
              type="text"
              v-model="formData.usuario"
              class="form-input"
              required
              aria-required="true"
              :aria-invalid="formData.usuario === '' ? 'true' : 'false'"
              autocomplete="username"
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="sucursal-password">
              Contraseña <span aria-label="campo requerido">*</span>
            </label>
            <input
              id="sucursal-password"
              type="password"
              v-model="formData.password"
              class="form-input"
              required
              aria-required="true"
              :aria-invalid="formData.password === '' ? 'true' : 'false'"
              :aria-describedby="editingSucursal ? 'password-help' : null"
              autocomplete="new-password"
            >
            <div v-if="editingSucursal" id="password-help" class="form-help">
              Deje vacío para mantener la contraseña actual
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="sucursal-confirm-password">
              Confirmar Contraseña <span aria-label="campo requerido">*</span>
            </label>
            <input
              id="sucursal-confirm-password"
              type="password"
              v-model="formData.confirmPassword"
              class="form-input"
              required
              aria-required="true"
              :aria-invalid="formData.confirmPassword === '' || formData.password !== formData.confirmPassword ? 'true' : 'false'"
              aria-describedby="formData.password !== formData.confirmPassword ? 'password-match-error' : null"
              autocomplete="new-password"
            >
            <div
              v-if="formData.password !== formData.confirmPassword && formData.confirmPassword"
              id="password-match-error"
              class="form-error"
              role="alert"
            >
              Las contraseñas no coinciden
            </div>
          </div>

          <div class="form-actions" role="group" aria-label="Acciones del formulario">
            <button
              type="button"
              class="btn-secondary"
              @click="showCreateModal = false"
              :disabled="loading"
            >
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="loading || !isFormValid"
              :aria-label="`${editingSucursal ? 'Actualizar' : 'Crear'} sucursal`"
            >
              <span v-if="loading" class="loading-text">
                <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                {{ editingSucursal ? 'Actualizando' : 'Creando' }}...
              </span>
              <span v-else>
                <i v-if="editingSucursal" class="fas fa-save" aria-hidden="true"></i>
                <i v-else class="fas fa-plus" aria-hidden="true"></i>
                {{ editingSucursal ? 'Actualizar' : 'Crear' }} Sucursal
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import sucursalService from '@/services/SucursalServices'

export default {
  name: 'ABM_Sucursales',
  data() {
    return {
      showCreateModal: false,
      editingSucursal: null,
      searchTerm: '',
      formData: {
        nombre: '',
        usuario: '',
        password: '',
        confirmPassword: ''
      },
      sucursales: [],
      loading: false
    }
  },
  computed: {
    filteredSucursales() {
      if (!this.searchTerm) return this.sucursales
      return this.sucursales.filter(sucursal =>
        (sucursal.clisuc_nombre || sucursal.nombre || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (sucursal.cli_usuari || sucursal.usuario || '').toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    },
    totalMusicRemaining() {
      return this.sucursales.reduce((total, sucursal) => total + (sucursal.musicRemaining || 0), 0)
    },
    totalSpots() {
      return this.sucursales.reduce((total, sucursal) => total + (sucursal.totalSpots || 0), 0)
    },
    isFormValid() {
      return this.formData.nombre.trim() !== '' &&
             this.formData.usuario.trim() !== '' &&
             (this.editingSucursal || this.formData.password.trim() !== '') &&
             (this.editingSucursal || this.formData.password === this.formData.confirmPassword)
    }
  },
  async mounted() {
    await this.loadSucursales()
  },
  methods: {
    async loadSucursales() {
      try {
        this.loading = true
        const data = await sucursalService.getcliSucursalByCliente()

        // Transformar datos de la API al formato esperado por el componente
        this.sucursales = data.map(sucursal => ({
          id: sucursal.clisuc_codigo,
          nombre: sucursal.clisuc_nombre,
          usuario: sucursal.cli_usuari,
          activa: sucursal.conected === 1,
          ultimaConexion: this.formatLastConnection(sucursal.clisuc_fechaAlta),
          // Mantener datos originales para operaciones
          ...sucursal
        }))
      } catch (error) {
        console.error('Error cargando sucursales:', error)
        this.$buefy.toast.open({
          message: 'Error al cargar las sucursales',
          type: 'is-danger'
        })
      } finally {
        this.loading = false
      }
    },

    formatLastConnection(dateString) {
      if (!dateString) return 'Nunca'

      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

      if (diffInHours < 1) return 'Hace menos de 1 hora'
      if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 30) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`

      return date.toLocaleDateString()
    },

    getPlayerModeLabel(mode) {
      const modes = {
        music: 'Música',
        spots: 'Spots',
        neuro: 'Neuro/Mixto'
      }
      return modes[mode] || mode
    },

    editSucursal(sucursal) {
      this.editingSucursal = sucursal
      this.formData = {
        nombre: sucursal.clisuc_nombre || sucursal.nombre,
        usuario: sucursal.cli_usuari || sucursal.usuario,
        password: '',
        confirmPassword: ''
      }
      this.showCreateModal = true
    },
    async deleteSucursal(sucursal) {
      if (confirm(`¿Estás seguro de eliminar la sucursal "${sucursal.nombre}"?`)) {
        try {
          await sucursalService.bajaSucursal([{
            clisuc_codigo: sucursal.clisuc_codigo || sucursal.id,
            username: sucursal.cli_usuari || sucursal.usuario
          }])

          this.$buefy.toast.open({
            message: 'Sucursal eliminada correctamente',
            type: 'is-success'
          })

          // Recargar lista
          await this.loadSucursales()
        } catch (error) {
          console.error('Error eliminando sucursal:', error)
          this.$buefy.toast.open({
            message: 'Error al eliminar la sucursal',
            type: 'is-danger'
          })
        }
      }
    },

    async saveSucursal() {
      if (this.formData.password !== this.formData.confirmPassword) {
        this.$buefy.toast.open({
          message: 'Las contraseñas no coinciden',
          type: 'is-warning'
        })
        return
      }

      try {
        if (this.editingSucursal) {
          // Actualizar existente
          await sucursalService.put({
            idSucursal: this.editingSucursal.clisuc_idSucursal,
            nombreSucu: this.formData.nombre,
            usernameSucu: this.formData.usuario,
            passSucu: this.formData.password,
            progRadio: this.editingSucursal.progRadio || 1,
            progSpot: this.editingSucursal.progSpot || 1,
            programSpot: this.editingSucursal.programSpot || 1,
            iscliente: this.editingSucursal.iscliente || 0
          })

          this.$buefy.toast.open({
            message: 'Sucursal actualizada correctamente',
            type: 'is-success'
          })
        } else {
          // Crear nueva
          await sucursalService.altaSucursal({
            nombreSucursal: this.formData.nombre,
            nombreUsuarioSucursal: this.formData.usuario,
            contrasenia: this.formData.password
          })

          this.$buefy.toast.open({
            message: 'Sucursal creada correctamente',
            type: 'is-success'
          })
        }

        // Cerrar modal y recargar datos
        this.showCreateModal = false
        this.editingSucursal = null
        this.formData = {
          nombre: '',
          usuario: '',
          password: '',
          confirmPassword: ''
        }

        await this.loadSucursales()
      } catch (error) {
        console.error('Error guardando sucursal:', error)
        this.$buefy.toast.open({
          message: 'Error al guardar la sucursal',
          type: 'is-danger'
        })
      }
    }
  }
}
</script>

<style scoped>
/* ===== CSS CUSTOM PROPERTIES (DESIGN TOKENS) ===== */
:root {
  /* Clean Color System */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-500: #0ea5e9;
  --color-primarciy-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-900: #0c4a6e;

  --color-secondary-50: #f8fafc;
  --color-secondary-100: #f1f5f9;
  --color-secondary-200: #e2e8f0;
  --color-secondary-300: #cbd5e0;
  --color-secondary-400: #94a3b8;
  --color-secondary-500: #64748b;
  --color-secondary-600: #475569;
  --color-secondary-700: #334155;
  --color-secondary-800: #1e293b;
  --color-secondary-900: #0f172a;

  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;

  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  /* Neutral Colors */
  --color-white: #ffffff;
  --color-gray-50: #f8fafc;
  --color-gray-100: #f1f5f9;
  --color-gray-200: #e2e8f0;
  --color-gray-300: #cbd5e0;
  --color-gray-400: #94a3b8;
  --color-gray-500: #64748b;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1e293b;
  --color-gray-900: #0f172a;

  /* Typography Scale */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;

  /* Spacing Scale */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* Border Radius */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;

  /* Clean Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* Breakpoints (for reference) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* ===== BASE STYLES ===== */
.sucursales-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: var(--line-height-normal);
  color: var(--color-secondary-800);
  background: #ffffff;
  min-height: 100vh;
}

/* ===== HEADER SECTION ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-12);
  padding: var(--space-8);
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
  border-radius: var(--radius-2xl);
  color: var(--color-white);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

/* ===== HEADER CONTENT ===== */
.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  transition: all var(--transition-normal);
}

.header-icon:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.25);
}

.header-text h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
}

.header-text p {
  margin: 0;
  opacity: 0.95;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-relaxed);
}

/* ===== HEADER ACTIONS ===== */
.header-actions .btn-primary {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: var(--color-white);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all var(--transition-normal);
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 1;
  box-shadow: var(--shadow-lg);
}

.header-actions .btn-primary:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: var(--shadow-2xl);
}

.header-actions .btn-primary:active {
  transform: translateY(0);
}

.header-actions .btn-primary:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

/* ===== CONTENT GRID ===== */
.content-grid {
  display: grid;
  gap: var(--space-8);
}

/* ===== STATS SECTION ===== */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.stat-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-6);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  border: 1px solid var(--color-gray-200);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-200);
}

.stat-card:nth-child(2)::before {
  background: linear-gradient(90deg, var(--color-success-500), var(--color-success-600));
}

.stat-card:nth-child(3)::before {
  background: linear-gradient(90deg, var(--color-warning-500), var(--color-warning-600));
}

.stat-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: var(--font-size-2xl);
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, var(--color-success-500), var(--color-success-600));
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, var(--color-warning-500), var(--color-warning-600));
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  display: block;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-secondary-800);
  margin-bottom: var(--space-1);
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-secondary-500);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: var(--line-height-normal);
}

/* ===== SUCURSALES SECTION ===== */
.sucursales-section {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-gray-200);
  position: relative;
  overflow: hidden;
}

/* ===== SECTION HEADER ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
  gap: var(--space-4);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary-800);
  margin: 0;
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
}

/* ===== SEARCH INPUT ===== */
.search-input {
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  width: 320px;
  transition: all var(--transition-normal);
  background: var(--color-white);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
}

.search-input::placeholder {
  color: var(--color-secondary-400);
  font-weight: var(--font-weight-normal);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  background: var(--color-white);
}

.search-input:hover:not(:focus) {
  border-color: var(--color-gray-300);
}

/* ===== SUCURSALES GRID ===== */
.sucursales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: var(--space-6);
}

/* ===== SUCURSAL CARDS ===== */
.sucursal-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  border: 2px solid transparent;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.sucursal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
  opacity: 0;
  transition: all var(--transition-normal);
}

.sucursal-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-300);
}

.sucursal-card:hover::before {
  opacity: 1;
}

.sucursal-card:focus-within {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.sucursal-card.inactive {
  opacity: 0.75;
  background: var(--color-gray-50);
  border-color: var(--color-gray-300);
}

.sucursal-card.inactive::before {
  background: linear-gradient(90deg, var(--color-secondary-400), var(--color-secondary-500));
  opacity: 1;
}

.sucursal-card.inactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-secondary-400);
}

/* ===== CARD HEADER ===== */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.sucursal-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: var(--font-size-xl);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.sucursal-card:hover .sucursal-icon {
  transform: scale(1.1) rotate(-5deg);
}

.sucursal-card.inactive .sucursal-icon {
  background: linear-gradient(135deg, var(--color-secondary-400), var(--color-secondary-500));
}

.sucursal-info {
  flex: 1;
  min-width: 0;
}

.sucursal-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary-800);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
  word-break: break-word;
}

/* ===== STATUS BADGES ===== */
.sucursal-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all var(--transition-normal);
}

.sucursal-status.active {
  background: var(--color-success-50);
  color: var(--color-success-700);
  border: 1px solid var(--color-success-200);
}

.sucursal-status.active::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--color-success-500);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.sucursal-status:not(.active) {
  background: var(--color-error-50);
  color: var(--color-error-700);
  border: 1px solid var(--color-error-200);
}

.sucursal-status:not(.active)::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--color-error-500);
  border-radius: 50%;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* ===== CARD CONTENT ===== */
.card-content {
  margin-bottom: var(--space-6);
}

.sucursal-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  padding: var(--space-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-100);
  transition: all var(--transition-normal);
}

.sucursal-card:hover .sucursal-detail {
  background: var(--color-primary-50);
  border-color: var(--color-primary-100);
}

.detail-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary-600);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  color: var(--color-secondary-800);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  word-break: break-word;
  text-align: right;
}

/* ===== CARD ACTIONS ===== */
.card-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.btn-secondary, .btn-danger {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.btn-secondary {
  background: var(--color-secondary-100);
  color: var(--color-secondary-700);
  border: 1px solid var(--color-secondary-200);
}

.btn-secondary:hover {
  background: var(--color-secondary-200);
  border-color: var(--color-secondary-300);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:active {
  transform: translateY(0);
}

.btn-danger {
  background: var(--color-error-50);
  color: var(--color-error-700);
  border: 1px solid var(--color-error-200);
}

.btn-danger:hover {
  background: var(--color-error-100);
  border-color: var(--color-error-300);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-danger:active {
  transform: translateY(0);
}

.btn-secondary:focus-visible,
.btn-danger:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* ===== PRIMARY BUTTONS ===== */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  color: var(--color-white);
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

/* ===== MODAL STYLES ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-gray-200);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===== MODAL HEADER ===== */
.modal-header {
  padding: var(--space-8) var(--space-8) var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
}

.modal-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary-800);
  margin: 0;
  line-height: var(--line-height-tight);
  letter-spacing: -0.025em;
}

.modal-close {
  background: var(--color-gray-100);
  border: 1px solid var(--color-gray-200);
  font-size: var(--font-size-xl);
  color: var(--color-secondary-500);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--color-gray-200);
  color: var(--color-secondary-700);
  border-color: var(--color-gray-300);
  transform: scale(1.05);
}

.modal-close:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* ===== MODAL FORM ===== */
.modal-form {
  padding: var(--space-8);
}

/* ===== FORM GROUPS ===== */
.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary-700);
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: var(--line-height-normal);
}

.form-input {
  width: 100%;
  padding: var(--space-4) var(--space-4);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
  background: var(--color-white);
  color: var(--color-secondary-800);
}

.form-input::placeholder {
  color: var(--color-secondary-400);
  font-weight: var(--font-weight-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  background: var(--color-white);
}

.form-input:hover:not(:focus) {
  border-color: var(--color-gray-300);
}

.form-input:invalid:not(:placeholder-shown) {
  border-color: var(--color-error-500);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input:valid:not(:placeholder-shown) {
  border-color: var(--color-success-500);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* ===== FORM ACTIONS ===== */
.form-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-gray-200);
}

/* ===== RESPONSIVE DESIGN ===== */

/* Large screens */
@media (min-width: 1536px) {
  .sucursales-container {
    max-width: 1600px;
    padding: var(--space-8) var(--space-8);
  }

  .sucursales-grid {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  }
}

/* Tablet and small desktop */
@media (max-width: 1024px) {
  .sucursales-container {
    padding: var(--space-6) var(--space-4);
  }

  .sucursales-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--space-4);
  }

  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

/* Mobile and tablet */
@media (max-width: 768px) {
  .sucursales-container {
    padding: var(--space-4) var(--space-3);
  }

  .page-header {
    flex-direction: column;
    gap: var(--space-6);
    text-align: center;
    padding: var(--space-6);
  }

  .header-content {
    flex-direction: column;
    gap: var(--space-4);
  }

  .header-icon {
    width: 56px;
    height: 56px;
    font-size: var(--font-size-xl);
  }

  .header-text h1 {
    font-size: var(--font-size-3xl);
  }

  .header-text p {
    font-size: var(--font-size-base);
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .stat-card {
    padding: var(--space-6);
  }

  .stat-value {
    font-size: var(--font-size-3xl);
  }

  .sucursales-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .section-header {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }

  .search-input {
    width: 100%;
    max-width: none;
  }

  .card-actions {
    flex-direction: column;
    gap: var(--space-2);
  }

  .btn-secondary,
  .btn-danger {
    justify-content: center;
    padding: var(--space-3) var(--space-4);
  }

  .form-actions {
    flex-direction: column;
    gap: var(--space-3);
  }

  .form-actions button {
    width: 100%;
    justify-content: center;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .sucursales-container {
    padding: var(--space-3) var(--space-2);
  }

  .page-header {
    padding: var(--space-4);
    margin-bottom: var(--space-8);
  }

  .header-text h1 {
    font-size: var(--font-size-2xl);
  }

  .header-text p {
    font-size: var(--font-size-sm);
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .stat-card {
    padding: var(--space-4);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: var(--font-size-lg);
  }

  .stat-value {
    font-size: var(--font-size-2xl);
  }

  .sucursales-section {
    padding: var(--space-4);
  }

  .section-title {
    font-size: var(--font-size-xl);
  }

  .sucursal-card {
    padding: var(--space-4);
  }

  .sucursal-icon {
    width: 48px;
    height: 48px;
    font-size: var(--font-size-lg);
  }

  .sucursal-name {
    font-size: var(--font-size-lg);
  }

  .modal-content {
    margin: var(--space-2);
    max-height: 95vh;
  }

  .modal-header,
  .modal-form {
    padding: var(--space-4);
  }

  .modal-title {
    font-size: var(--font-size-xl);
  }

  .form-group {
    margin-bottom: var(--space-4);
  }
}

/* Extra small screens */
@media (max-width: 320px) {
  .sucursales-container {
    padding: var(--space-2) var(--space-2);
  }

  .page-header {
    padding: var(--space-3);
  }

  .header-text h1 {
    font-size: var(--font-size-xl);
  }

  .sucursal-card {
    padding: var(--space-3);
  }

  .card-header {
    gap: var(--space-3);
  }

  .card-content {
    margin-bottom: var(--space-4);
  }
}

/* Print styles */
@media print {
  .sucursales-container {
    background: white;
    padding: 0;
    max-width: none;
  }

  .page-header {
    background: white;
    box-shadow: none;
    border-bottom: 2px solid var(--color-gray-300);
  }

  .modal-overlay,
  .header-actions,
  .card-actions {
    display: none !important;
  }

  .sucursal-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid var(--color-gray-300);
  }
}

/* ===== ACCESSIBILITY ENHANCEMENTS ===== */

/* Focus management */
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  transition: outline-color var(--transition-fast);
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .stat-card:hover,
  .sucursal-card:hover,
  .btn-primary:hover,
  .btn-secondary:hover,
  .btn-danger:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .sucursal-card {
    border-width: 2px;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    border-width: 2px;
  }

  .stat-card {
    border-width: 2px;
  }
}

/* Dark mode support (if needed in future) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary-50: #0c4a6e;
    --color-primary-100: #0369a1;
    --color-primary-500: #0ea5e9;
    --color-primary-600: #0284c7;
    --color-primary-700: #0369a1;

    --color-secondary-50: #0f172a;
    --color-secondary-100: #1e293b;
    --color-secondary-800: #f1f5f9;
    --color-secondary-900: #f8fafc;

    --color-white: #0f172a;
    --color-gray-50: #1e293b;
    --color-gray-100: #334155;
    --color-gray-200: #475569;
    --color-gray-800: #cbd5e0;
    --color-gray-900: #f1f5f9;
  }
}

/* ===== LOADING STATES ===== */
.loading-skeleton {
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== MICRO-INTERACTIONS ===== */
.sucursal-card {
  position: relative;
  overflow: hidden;
}

.sucursal-card::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all var(--transition-slow);
  pointer-events: none;
}

.sucursal-card:active::after {
  width: 300px;
  height: 300px;
}

/* ===== SCROLLBAR STYLING ===== */
.sucursales-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.sucursales-container::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
}

.sucursales-container::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
  transition: background var(--transition-normal);
}

.sucursales-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

/* ===== SELECTION STYLING ===== */
::selection {
  background: rgba(14, 165, 233, 0.3);
  color: var(--color-secondary-800);
}

::-moz-selection {
  background: rgba(14, 165, 233, 0.3);
  color: var(--color-secondary-800);
}

/* ===== UTILITY CLASSES ===== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-gradient {
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-effect {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%),
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-glass);
}

/* ===== PROFESSIONAL STATUS INDICATORS ===== */
.sucursal-status {
  position: relative;
  overflow: hidden;
}

/* ===== MINIMALIST SCROLL INDICATORS ===== */
.sucursales-container::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
}

.sucursales-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

/* ===== SIMPLE SELECTION ===== */
::selection {
  background: rgba(14, 165, 233, 0.3);
  color: var(--color-secondary-800);
}

::-moz-selection {
  background: rgba(14, 165, 233, 0.3);
  color: var(--color-secondary-800);
}

/* ===== SUBTLE PERFORMANCE OPTIMIZATIONS ===== */
.sucursal-card,
.stat-card {
  will-change: transform;
  backface-visibility: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .sucursal-card,
  .stat-card {
    will-change: auto;
  }
}


/* ===== ENHANCED FOCUS STATES ===== */
.sucursal-card:focus-within {
  outline: 2px solid rgba(14, 165, 233, 0.6);
  outline-offset: 3px;
  box-shadow:
    var(--shadow-glass-lg),
    0 0 0 4px rgba(14, 165, 233, 0.1);
}

/* ===== CREATIVE HOVER EFFECTS ===== */
.sucursal-icon {
  position: relative;
  overflow: hidden;
}

.sucursal-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all var(--transition-normal);
}

.sucursal-card:hover .sucursal-icon::before {
  width: 120%;
  height: 120%;
}

/* ===== PROFESSIONAL TOUCHES ===== */
.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 10% 10%, rgba(14, 165, 233, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 90% 90%, rgba(14, 165, 233, 0.01) 0%, transparent 50%);
  pointer-events: none;
  border-radius: inherit;
}

/* ===== MINIMALIST SPACING ===== */
.sucursales-container {
  position: relative;
  isolation: isolate;
}

.content-grid {
  position: relative;
  z-index: 1;
}

/* ===== FORM ENHANCEMENTS ===== */
.form-help {
  font-size: var(--font-size-sm);
  color: var(--color-secondary-500);
  margin-top: var(--space-1);
  line-height: var(--line-height-normal);
}

.form-error {
  font-size: var(--font-size-sm);
  color: var(--color-error-600);
  margin-top: var(--space-1);
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-medium);
}

/* ===== LOADING TEXT ===== */
.loading-text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: var(--space-16) var(--space-8);
  color: var(--color-secondary-500);
}

.empty-state-icon {
  font-size: var(--font-size-5xl);
  color: var(--color-secondary-300);
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary-700);
  margin: 0 0 var(--space-2) 0;
}

.empty-state p {
  font-size: var(--font-size-base);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* ===== FORM VALIDATION STYLES ===== */
.form-input:invalid:not(:placeholder-shown) {
  border-color: var(--color-error-500);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input:invalid:not(:placeholder-shown):focus {
  border-color: var(--color-error-500);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.form-input:valid:not(:placeholder-shown) {
  border-color: var(--color-success-500);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.form-input:valid:not(:placeholder-shown):focus {
  border-color: var(--color-success-500);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

/* ===== FOCUS TRAP FOR MODAL ===== */
.modal-content {
  position: relative;
}

.modal-content::before {
  content: '';
  position: fixed;
  top: -1000px;
  left: -1000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ===== ENHANCED BUTTON STATES ===== */
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary:disabled:hover,
.btn-secondary:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* ===== CARD SEMANTIC STYLES ===== */
.sucursal-details {
  margin: 0;
  padding: 0;
}

.sucursal-details .sucursal-detail {
  margin-bottom: var(--space-3);
}

.sucursal-details dt {
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary-600);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: var(--space-1);
}

.sucursal-details dd {
  margin: 0;
  color: var(--color-secondary-800);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  word-break: break-word;
}
body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #18181b;
  color: #ececec;
  margin: 0;
  padding: 0;
}

header, nav {
  background: #23272f;
  color: #fff;
  padding: 16px 32px;
  font-size: 1.15em;
  box-shadow: 0 2px 8px rgba(20,25,35,0.24);
}

.container {
  max-width: 1200px;
  margin: 32px auto;
  background: #23272f;
  padding: 32px 40px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.22);
  border-radius: 24px;
}

h1, h2, h3 {
  font-weight: 600;
  color: #e1e1e6;
  margin-bottom: 12px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.sucursal-card {
  background: #282c34;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(30,41,59,0.18);
  padding: 24px 22px 18px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: box-shadow 0.2s, background 0.25s;
}

.sucursal-card:hover {
  box-shadow: 0 8px 32px rgba(30,41,59,0.27);
  background: #313544;
}

.sucursal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sucursal-nombre {
  font-size: 1.13em;
  font-weight: 600;
  color: #7dd3fc;
}

.estado-inactiva {
  color: #f87171;
  background: #2e2632;
  border-radius: 6px;
  padding: 3px 12px;
  font-size: 0.95em;
}

.estado-activa {
  color: #22c55e;
  background: #20402f;
  border-radius: 6px;
  padding: 3px 12px;
  font-size: 0.95em;
}

.sucursal-info {
  color: #d1d5db;
  margin-bottom: 18px;
  font-size: 0.99em;
  line-height: 1.5;
}

.sucursal-botones {
  margin-top: auto;
}

.sucursal-botones button {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 20px;
  margin-right: 8px;
  cursor: pointer;
  font-size: 0.97em;
  transition: background 0.15s, color 0.15s;
}

.sucursal-botones button:hover {
  background: #1e40af;
  color: #7dd3fc;
}

input[aria-label*="Buscar"] {
  background: #20232a;
  color: #ececec;
  border: 1px solid #34313f;
  border-radius: 9px;
  margin-bottom: 16px;
  font-size: 1em;
  padding: 8px 14px;
  width: 92%;
}

/* ===== STATS GRID - 4 COLUMNAS ===== */
.stats-grid-4 {
  grid-template-columns: repeat(4, 1fr) !important;
}

@media (max-width: 1200px) {
  .stats-grid-4 {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  .stats-grid-4 {
    grid-template-columns: 1fr !important;
  }
}

/* ===== PLAYER STATUS STYLES ===== */
.player-status {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #bae6fd;
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.now-playing i {
  font-size: 32px;
  color: #0284c7;
  flex-shrink: 0;
}

.now-playing i.playing {
  color: #22c55e;
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

.song-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-title {
  font-weight: 600;
  color: #0c4a6e;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-mode {
  font-size: 12px;
  color: #0369a1;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.progress-bar {
  position: relative;
  height: 8px;
  background: #e0f2fe;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 600;
  color: #0c4a6e;
}

/* Stat Card Icon Variants */
.stat-icon-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-card:nth-child(3)::before {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.stat-card:nth-child(4) .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-card:nth-child(4)::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

</style>
