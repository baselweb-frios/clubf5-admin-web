<template>
  <div id="ProgramaMusicaContainer" class="programa-musica-page">
    <!-- Header Section with Gradient Background -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="tim-icons icon-music-2"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">{{ data.title }}</h1>
          <p class="hero-subtitle">Gestión creativa de programaciones musicales</p>
        </div>
        <div class="hero-actions">

        </div>
      </div>
      <div class="hero-decoration">
        <div class="floating-element element-1"></div>
        <div class="floating-element element-2"></div>
        <div class="floating-element element-3"></div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="content-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-card">
          <div class="loading-spinner">
            <scale-loader :loading="true" :color="'#8b5cf6'" :height="'120px'"></scale-loader>
          </div>
          <p class="loading-text">Cargando programaciones...</p>
        </div>
      </div>

      <!-- Enhanced Filter and Search Section -->
      <div v-else class="controls-section">
        <!-- Main Filter Section -->


        <!-- Search and Quick Filters -->
        <div class="search-section" v-if="!isLoading && filteredProgramaciones.length > 3">
          <div class="search-container">
            <div class="search-input-wrapper">
              <i class="tim-icons icon-zoom-split"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar programaciones..."
                class="search-input"
                @input="filterProgramaciones"
              >
            </div>
          </div>

          <div class="filter-buttons">
            <button
              v-for="filter in filterOptions"
              :key="filter.key"
              :class="['filter-btn', { active: activeFilter === filter.key }]"
              @click="setActiveFilter(filter.key)"
            >
              <i :class="filter.icon"></i>
              <span>{{ filter.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && filteredProgramaciones.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <i class="tim-icons icon-music-2"></i>
        </div>
        <h3 class="empty-state-title">No hay programaciones</h3>
        <p class="empty-state-subtitle">Crea tu primera programación musical para comenzar</p>
        <button class="btn-create-empty" @click="redirectAlta">
          <i class="tim-icons icon-plus"></i>
          Crear programación
        </button>
      </div>

      <!-- Programaciones Cards Grid -->
      <div v-else class="cards-container">
        <div class="cards-grid">
          <!-- Programación Cards -->
          <div
            v-for="(programacion, index) in paginatedProgramaciones"
            :key="programacion.clipro_codigo"
            :class="['programacion-card', `card-${getCardTheme(index)}`]"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="selectProgramacion(programacion)"
          >
            <!-- Card Header -->
            <div class="card-header-section">
              <div class="card-icon">
                <i class="tim-icons icon-radio-2"></i>
              </div>
              <div class="card-status">
                <div class="status-indicator active">
                  <span class="status-pulse"></span>
                </div>
                <span class="status-text">Activa</span>
              </div>
            </div>

            <!-- Card Content -->
            <div class="card-content">
              <h3 class="card-title">{{ programacion.clipro_nombre }}</h3>

              <!-- Metadata Section -->
              <div class="card-metadata">
                <div class="metadata-item">
                  <i class="tim-icons icon-calendar-60"></i>
                  <p>Fecha de alta: </p><span>{{ formatDate(programacion.clipro_fechaAlta) }}</span>
                </div>
            
              </div>

              
              <!-- Tags Section -->
              <div class="card-tags">
                <span v-for="tag in getProgramacionTags(programacion)" :key="tag" class="card-tag">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="card-actions">
           
              <button
                class="action-btn calendar-btn"
                @click.stop="calendarRedirect(programacion, $event.target)"
                :title="'Programar ' + programacion.clipro_nombre"
              >
                <i class="tim-icons icon-calendar-60"></i>
                <span>Programar</span>
              </button>

              <button
                class="action-btn delete-btn"
                @click.stop="btnEliminar(programacion.clipro_codigo, $event.target)"
                :title="'Eliminar ' + programacion.clipro_nombre"
              >
                <i class="tim-icons icon-trash-simple"></i>
                <span>Eliminar</span>
              </button>
            </div>

            <!-- Card Hover Effect -->
            <div class="card-hover-overlay">
              <div class="hover-content">
                <i class="fa fa-pencil"></i>
                <span>Editar</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-container">
          <div class="pagination-wrapper">
            <button
              class="pagination-btn prev-btn"
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
            >
              <i class="tim-icons icon-minimal-left"></i>
              Anterior
            </button>

            <div class="pagination-numbers">
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="['pagination-number', { active: page === currentPage }]"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </div>

            <button
              class="pagination-btn next-btn"
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              Siguiente
              <i class="tim-icons icon-minimal-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <vue-confirm-dialog></vue-confirm-dialog>

    <!-- Card Detail Modal (Optional for future enhancement) -->
    <div v-if="selectedProgramacion" class="card-modal-overlay" @click="closeModal">
      <div class="card-modal" @click.stop>
        <div class="modal-header">
          <h2>Editar programaci&oacute;n</h2>
          <button class="modal-close" @click="closeModal">
            <i class="tim-icons icon-simple-remove"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="modal-details">
            <div class="detail-section">
              <h4>Nombre de la Programaci&oacute;n</h4>
              <input
                v-model="programacion.clipro_nombre"
                type="text"
                placeholder="Nombre de la programación"
                class="input-full"
              >
            </div>
            <div class="detail-section">
                 <button
                class="action-btn calendar-btn"
                @click.stop=""
                :title="'Programar ' + programacion.clipro_nombre"
              >
                <i class="tim-icons icon-calendar-60"></i>
                <span>Guardar cambios</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
 import { Card, BaseButton } from '@/components'
 import RadioServices from '../../services/RadioServices'
 import filtros from '../../services/FiltroServices'
 import clienteConfigService from '../../services/ClienteConfigServices'
 import Vue from 'vue'
 import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'
 import moment from 'moment'
 import {
   BFormSelect,
   BOverlay
 } from 'bootstrap-vue'

 export default {
   name: 'ProgramaMusica',
   components: {
     Card,
     BaseButton,
     ScaleLoader,
     BFormSelect,
     BOverlay
   },
   data () {
     const i18labels = this.$t('modulo_radios.principal')

     return {
       // Existing data
       data: {
         title: i18labels.titulo,
         rows: []
       },
       ruta: 'Nueva programación de música',
       isLoading: false,

       // New card-based data
       searchQuery: '',
       activeFilter: 'all',
       selectedProgramacion: null,
       currentPage: 1,
       itemsPerPage: 8,

       // Filter options
       filterOptions: [
         { key: 'all', label: 'Todas', icon: 'tim-icons icon-apps' },
         { key: 'recent', label: 'Recientes', icon: 'tim-icons icon-time-alarm' },
         { key: 'active', label: 'Activas', icon: 'tim-icons icon-check-2' }
       ],

       // Card themes for variety
       cardThemes: [
         'aurora',
         'nebula',
         'cosmic',
         'stellar',
         'galaxy',
         'quantum',
         'plasma',
         'photon'
       ],

       // Filter data
       filtros: {
         tipoEmpresa: [],
         estiloEmpresa: [],
         ritmo: []
       },
       filtroSelected: {
         tipoEmpresa: 0,
         estiloEmpresa: 0,
         ritmo: 0
       },
       // User's configured business types for filtering
       userTiposEmpresa: [],
       isLoadingUserConfig: false
     }
   },

   computed: {
     // Filtered programaciones based on search and filter
     filteredProgramaciones() {
       let filtered = this.data.rows

       // Apply search filter
       if (this.searchQuery) {
         const query = this.searchQuery.toLowerCase()
         filtered = filtered.filter(programacion =>
           programacion.clipro_nombre.toLowerCase().includes(query)
         )
       }

       // Apply active filter
       if (this.activeFilter === 'recent') {
         // Sort by most recent (assuming fecha_creacion exists)
         filtered = filtered.sort((a, b) => {
           const dateA = new Date(a.fecha_creacion || Date.now())
           const dateB = new Date(b.fecha_creacion || Date.now())
           return dateB - dateA
         })
       }

       if (this.activeFilter === 'active') {
         // Filter only active programaciones (you can adjust this logic)
         filtered = filtered.filter(programacion => programacion.estado === 'activa')
       }

       return filtered
     },

     // Paginated programaciones
     paginatedProgramaciones() {
       const start = (this.currentPage - 1) * this.itemsPerPage
       const end = start + this.itemsPerPage
       return this.filteredProgramaciones.slice(start, end)
     },

     // Total pages for pagination
     totalPages() {
       return Math.ceil(this.filteredProgramaciones.length / this.itemsPerPage)
     },

     // Visible page numbers for pagination
     visiblePages() {
       const total = this.totalPages
       const current = this.currentPage
       const delta = 2
       const range = []
       const rangeWithDots = []

       for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
         range.push(i)
       }

       if (current - delta > 2) {
         rangeWithDots.push(1, '...')
       } else {
         rangeWithDots.push(1)
       }

       rangeWithDots.push(...range)

       if (current + delta < total - 1) {
         rangeWithDots.push('...', total)
       } else if (total > 1) {
         rangeWithDots.push(total)
       }

       return rangeWithDots.filter(item => item !== '...' || rangeWithDots.indexOf(item) === rangeWithDots.lastIndexOf(item))
     }
   },
  created () {
    // llamar los metodos que necesito al cargar esta página
    this.getUserTiposEmpresa()
    this.getProgramacionesByCli()
    this.cargarDatosFiltros()
  },
  methods: {
    guardarProgramacion (programacion) {
      RadioServices.altaProgramacion(programacion.clipro_codigo, programacion.clipro_nombre)
        .then(res => {
          
        })
    },
    // Existing methods
    getProgramacionesByCli () {
      this.isLoading = true
      RadioServices.getProgramacionesByCliente().then((res) => {
        this.data.rows = res
        this.isLoading = false
      }).catch(error => {
        console.error('Error loading programaciones:', error)
        this.isLoading = false
      })
    },

    redirectAlta () {
      this.$router.push({
        name: this.ruta,
        params: {
          codigoProgramacion: 0,
          nombreProgramacion: ''
        }
      })
    },

    btnEditar (item, button) {
      debugger
      this.$router.push({
        path: '/altaProgramacionRadio',
        params: {
          codigoProgramacion: item.clipro_codigo,
          nombreProgramacion: item.clipro_nombre
        }
      })
    },

    btnEliminar (item, button) {
      this.$confirm(
        {
          message: `¿Estás seguro de que deseas eliminar la programación "${this.getProgramacionName(item)}"?`,
          button: {
            no: 'Cancelar',
            yes: 'Eliminar'
          },
          callback: confirm => {
            if (confirm) {
              RadioServices.bajaProgramacion(item).then(res => {
                this.getProgramacionesByCli()
                this.showNotification('Programación eliminada exitosamente', 'success')
              }).catch(error => {
                console.error('Error deleting programacion:', error)
                this.showNotification('Error al eliminar la programación', 'danger')
              })
            }
          }
        }
      )
    },

    calendarRedirect (item, button) {
      this.$router.push({
        name: 'Programaciones de música',
        params: {
          codigoProgramacion: item.clipro_codigo,
          nombreProgramacion: item.clipro_nombre
        }
      })
    },

    // New card-based methods
    filterProgramaciones() {
      this.currentPage = 1 // Reset to first page when filtering
    },

    setActiveFilter(filterKey) {
      this.activeFilter = filterKey
      this.currentPage = 1
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.scrollToTop()
      }
    },

    selectProgramacion(programacion) {
      this.selectedProgramacion = programacion
    },

    closeModal() {
      this.selectedProgramacion = null
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    // Card utility methods
    getCardTheme(index) {
      return this.cardThemes[index % this.cardThemes.length]
    },

    formatDate(dateString) {
      if (!dateString) return 'Fecha no disponible'
      return moment(dateString).format('DD/MM/YYYY')
    },

    getProgramacionDuration(programacion) {
      // You can customize this based on your data structure
      return 'Programada'
    },

    getProgramacionDescription(programacion) {
      // Return a description based on your data structure
      return `Programación musical activa con múltiples estaciones de radio.`
    },

    getProgramacionTags(programacion) {
      // Return tags based on your data structure
      return ['Música']
    },

    getProgramacionName(item) {
      return item?.clipro_nombre || 'Programación sin nombre'
    },

    getProgramacionStats(programacion) {
      return {
        radios: 'N/A',
        duration: 'N/A'
      }
    },

    showNotification(message, type = 'info') {
      this.$notify({
        message: message,
        icon: type === 'success' ? 'tim-icons icon-check-2' : 'tim-icons icon-alert-circle-exc',
        horizontalAlign: 'center',
        verticalAlign: 'top',
        type: type,
        timeout: 3000
      })
    },

    // User configuration methods
    async getUserTiposEmpresa () {
      try {
        this.isLoadingUserConfig = true
        const tiposEmpresa = await clienteConfigService.getTiposEmpresaCliente()
        this.userTiposEmpresa = tiposEmpresa.map(te => te.tipEmp_codigo)
        console.log('✅ Tipos de empresa del usuario:', this.userTiposEmpresa)
      } catch (error) {
        console.error('Error al cargar tipos de empresa del usuario:', error)
        // Si hay error, permitir ver todas las radios
        this.userTiposEmpresa = []
      } finally {
        this.isLoadingUserConfig = false
      }
    },

    // Filter methods
    cargarDatosFiltros () {
      const tipEmpJson = [{ nombre: 'Todas las empresas', cod: 0 }]
      const tipEmpGrJson = []
      const ritmoJson = [{ nombre: 'Todos los ritmos', cod: 0 }]
      const estiloJson = [{ nombre: 'Todos los estilos', cod: 0 }]

      filtros.listarTipoEmpresa().then(res => {
        res.forEach(element => {
          tipEmpJson.push({
            nombre: element.tipEmp_nombre,
            cod: element.tipEmp_codigo
          })
        })
        this.filtros.tipoEmpresa = tipEmpJson
      })

      filtros.listarTipoEmpresaGrupo().then(res => {
        // Handle group response if needed
      })

      filtros.listarRitmo().then(res => {
        res.forEach(element => {
          ritmoJson.push({
            nombre: element.ritmos_nombre,
            cod: element.ritmos_codigo
          })
        })
        this.filtros.ritmo = ritmoJson
      })

      filtros.listarEstilo().then(res => {
        res.forEach(element => {
          estiloJson.push({
            nombre: element.estilo_nombre,
            cod: element.estilo_codigo
          })
        })
        this.filtros.estiloEmpresa = estiloJson
      })
    },

    selectFiltro () {
      // Reload programaciones with new filters
      this.getProgramacionesByCli()
    }
  }
}
</script>
<style scoped>
/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
    PROGRAMA MUSICA - MINIMALISTA DARK INTERFACE
    ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

    Características principales:
    • Interfaz oscura optimizada con diseño minimalista
    • Bordes rectos sin redondeo para estética limpia
    • Sistema de filtros integrado para búsqueda avanzada
    • Tarjetas de programación con información de tiempo
    • Animaciones sutiles y transiciones fluidas
    • Diseño responsivo optimizado para diferentes dispositivos
*/

/* CSS Custom Properties for theming */
:root {
  --gradient-aurora: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-nebula: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-cosmic: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --gradient-stellar: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  --gradient-galaxy: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  --gradient-quantum: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  --gradient-plasma: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  --gradient-photon: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);

  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.12);
  --shadow-strong: 0 20px 40px rgba(0, 0, 0, 0.15);
  --shadow-glow: 0 0 20px rgba(102, 126, 234, 0.3);

  /* Border Radius - All set to 0px for minimalistic dark interface */
  --border-radius-sm: 0px;
  --border-radius-md: 0px;
  --border-radius-lg: 0px;
  --border-radius-xl: 0px;
  --border-radius-2xl: 0px;

  --transition-fast: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-medium: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Main page container */
#ProgramaMusicaContainer.programa-musica-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a40 50%, #2d2d5f 100%);
  position: relative;
  overflow-x: hidden;
}

/* Animated background elements */
.programa-musica-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 198, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 60px 40px;
  background: linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 64, 0.95) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.hero-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: var(--gradient-aurora);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30px;
  box-shadow: var(--shadow-glow);
  animation: float 3s ease-in-out infinite;
}

.hero-icon i {
  font-size: 32px;
  color: white;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #a8a8ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.hero-actions {
  display: flex;
  align-items: center;
}

.btn-create-programming {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: var(--border-radius-lg);
  padding: 15px 30px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: var(--transition-medium);
  box-shadow: var(--shadow-medium);
  text-transform: none;
  letter-spacing: 0.5px;
}

.btn-create-programming:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-strong);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.btn-create-programming i {
  font-size: 18px;
}

/* Floating decorative elements */
.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.element-1 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.element-2 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, #f093fb, #f5576c);
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.element-3 {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  top: 30%;
  right: 30%;
  animation-delay: 4s;
}

/* Content container */
.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}

/* Loading state */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-card {
  text-align: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-2xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
}

/* Enhanced Controls section with filters */
.controls-section {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Filter Section - Dark Minimalistic Design */
.filter-section {
  width: 100%;
  max-width: 100%;
  position: relative;
}

.filter-card {
  background: linear-gradient(135deg,
    rgba(15, 15, 15, 0.95) 0%,
    rgba(10, 10, 10, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(40, 40, 40, 0.9);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 30px;
  margin: 0;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.filter-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(59, 130, 246, 0.6) 50%,
    transparent 100%);
  opacity: 0.8;
}

.filter-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 12px 40px rgba(0, 0, 0, 0.5);
  border-color: rgba(50, 50, 50, 0.9);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  align-items: start;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.filter-field label {
  font-size: 14px;
  font-weight: 600;
  color: #f5f5f5;
  margin: 0;
  line-height: 1.2;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: relative;
  padding-left: 12px;
}

.filter-field label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: linear-gradient(180deg, #3b82f6, #2563eb);
}

.filter-field .form-control,
.filter-field select {
  background: rgba(12, 12, 12, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(40, 40, 40, 0.8);
  color: #f5f5f5;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow:
    0 0 0 0 rgba(59, 130, 246, 0);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23f5f5f5' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
}

.filter-field .form-control:focus,
.filter-field select:focus {
  border-color: #3b82f6;
  background: rgba(8, 8, 8, 0.95);
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.filter-field .form-control:hover,
.filter-field select:hover {
  border-color: rgba(60, 60, 60, 0.8);
  background: rgba(10, 10, 10, 0.95);
}

.filter-field .form-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.4;
  padding-left: 12px;
  font-style: italic;
}

/* Search Section */
.search-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-container {
  max-width: 500px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper i {
  position: absolute;
  left: 15px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
}

.search-input {
  width: 100%;
  padding: 15px 15px 15px 50px;
  background: rgba(12, 12, 12, 0.9);
  border: 2px solid rgba(40, 40, 40, 0.8);
  color: #f5f5f5;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(8, 8, 8, 0.95);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: rgba(245, 245, 245, 0.5);
}

.search-input-wrapper i {
  position: absolute;
  left: 15px;
  color: rgba(245, 245, 245, 0.5);
  font-size: 18px;
}

.filter-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(12, 12, 12, 0.9);
  border: 2px solid rgba(40, 40, 40, 0.8);
  color: rgba(245, 245, 245, 0.8);
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.filter-btn:hover {
  background: rgba(15, 15, 15, 0.95);
  border-color: rgba(60, 60, 60, 0.8);
  color: #f5f5f5;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-2xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.empty-state-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow);
  animation: pulse 2s infinite;
}

.empty-state-icon i {
  font-size: 40px;
  color: white;
}

.empty-state-title {
  font-size: 1.8rem;
  color: white;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.empty-state-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0 0 30px 0;
}

.btn-create-empty {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: var(--border-radius-lg);
  padding: 15px 30px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: var(--transition-medium);
  cursor: pointer;
}

.btn-create-empty:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-strong);
}

/* Cards container */
.cards-container {
  position: relative;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 100px;
  margin-bottom: 40px;
}

/* Enhanced Programación cards - Dark Minimalistic */
.programacion-card {
  background: linear-gradient(135deg,
    rgba(15, 15, 15, 0.95) 0%,
    rgba(10, 10, 10, 0.95) 100%);
  border: 2px solid rgba(40, 40, 40, 0.9);
  backdrop-filter: blur(20px);
  padding: 25px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  animation: cardSlideIn 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 8px 32px rgba(0, 0, 0, 0.4);
}

.programacion-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-strong);
  border-color: rgba(255, 255, 255, 0.3);
}

.programacion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-aurora);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.programacion-card:hover::before {
  opacity: 1;
}

/* Card themes */
.card-aurora {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.card-nebula {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
}

.card-cosmic {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
}

.card-stellar {
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%);
}

.card-galaxy {
  background: linear-gradient(135deg, rgba(250, 112, 154, 0.1) 0%, rgba(254, 225, 64, 0.1) 100%);
}

.card-quantum {
  background: linear-gradient(135deg, rgba(168, 237, 234, 0.1) 0%, rgba(254, 214, 227, 0.1) 100%);
}

.card-plasma {
  background: linear-gradient(135deg, rgba(255, 154, 158, 0.1) 0%, rgba(254, 207, 239, 0.1) 100%);
}

.card-photon {
  background: linear-gradient(135deg, rgba(255, 236, 210, 0.1) 0%, rgba(252, 182, 159, 0.1) 100%);
}

/* Card header section */
.card-header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-lg);
  background: var(--gradient-aurora);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-soft);
}

.card-icon i {
  font-size: 20px;
  color: white;
}

.card-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #43e97b;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator.active {
  box-shadow: 0 0 10px rgba(67, 233, 123, 0.5);
}

.status-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: pulse 1.5s infinite;
}

.status-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Card content */
.card-content {
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin: 0 0 15px 0;
  line-height: 1.3;
}

.card-metadata {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.metadata-item i {
  font-size: 14px;
}

.card-description {
  margin-bottom: 15px;
}

.card-description p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-tag {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 10px;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Card actions */
.card-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.calendar-btn:hover {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #f5576c 0%, #fa709a 100%);
}

.action-btn i {
  font-size: 14px;
}

/* Card hover overlay - Fixed to not block button clicks */
.card-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: var(--border-radius-2xl);
  pointer-events: none; /* This allows clicks to pass through */
  z-index: 1;
}

.programacion-card:hover .card-hover-overlay {
  opacity: 1;
}

.hover-content {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 500;
  pointer-events: none; /* Ensure text doesn't interfere with clicks */
}

.hover-content i {
  font-size: 20px;
  pointer-events: none; /* Ensure icon doesn't interfere with clicks */
}

/* Enhanced hover effect for better visual feedback */
.programacion-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: var(--border-radius-2xl);
  pointer-events: none;
  z-index: 0;
}

.programacion-card:hover::after {
  opacity: 1;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 25px;
  border-radius: var(--border-radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-md);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 5px;
}

.pagination-number {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-md);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-number:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.pagination-number.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: var(--shadow-glow);
}

/* Modal styles */
.card-modal-overlay {
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

.card-modal {
  background: linear-gradient(135deg, rgba(26, 26, 64, 0.95) 0%, rgba(15, 15, 35, 0.95) 100%);
  border-radius: var(--border-radius-2xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: var(--border-radius-md);
  transition: var(--transition-fast);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-content {
  padding: 30px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  color: white;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.detail-section p {
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0;
  line-height: 1.5;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Responsive design */
@media (max-width: 1200px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
  }

  .content-container {
    padding: 30px;
  }

  .hero-section {
    padding: 50px 30px;
  }
}

/* Tablet styles */
@media (max-width: 768px) {
  .content-container {
    padding: 20px;
  }

  .hero-section {
    padding: 40px 20px;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .hero-icon {
    margin-right: 0;
    width: 70px;
    height: 70px;
  }

  .hero-icon i {
    font-size: 28px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .controls-section {
    gap: 20px;
  }

  .filter-card {
    padding: 20px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .filter-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .filter-btn {
    flex: 1 1 auto;
    min-width: 120px;
  }

  .pagination-wrapper {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .pagination-btn {
    padding: 10px 15px;
    font-size: 0.9rem;
  }

  .search-section {
    gap: 15px;
    flex-direction: column;
  }

  .search-container {
    width: 100%;
  }

  .programacion-card {
    padding: 24px;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .card-metadata {
    gap: 15px;
  }

  .itemsPerPage-select {
    width: 100%;
  }
}

/* Mobile styles */
@media (max-width: 480px) {
  .hero-section {
    padding: 30px 15px;
  }

  .hero-icon {
    width: 60px;
    height: 60px;
  }

  .hero-icon i {
    font-size: 24px;
  }

  .hero-title {
    font-size: 1.6rem;
  }

  .hero-subtitle {
    font-size: 0.9rem;
  }

  .content-container {
    padding: 15px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .programacion-card {
    padding: 20px;
  }

  .card-title {
    font-size: 1.2rem;
  }

  .card-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }

  .filter-card {
    padding: 15px;
  }

  .filter-btn {
    font-size: 0.85rem;
    padding: 8px 12px;
  }

  .pagination-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .pagination-numbers {
    gap: 5px;
  }

  .pagination-number {
    min-width: 35px;
    height: 35px;
    font-size: 0.85rem;
  }

  .empty-state {
    padding: 40px 20px;
  }

  .empty-state-icon i {
    font-size: 60px;
  }

  .empty-state-title {
    font-size: 1.3rem;
  }

  .btn-create-empty {
    padding: 12px 20px;
    font-size: 0.9rem;
  }

  /* Modal responsive */
  .card-modal {
    width: 95%;
    margin: 10px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .input-full {
    font-size: 0.9rem;
  }

  /* Search section mobile */
  .search-input-wrapper {
    font-size: 0.9rem;
  }

  .search-input {
    padding: 12px 12px 12px 40px;
  }

  /* Filter buttons mobile - stack vertically */
  .filter-buttons {
    flex-direction: column;
    width: 100%;
  }

  .filter-btn {
    width: 100%;
  }

  /* Card metadata mobile - single column */
  .card-metadata {
    flex-direction: column;
    gap: 10px;
  }

  /* Card tags mobile */
  .card-tags {
    flex-wrap: wrap;
    gap: 6px;
  }

  .card-tag {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
}

/* Extra small devices (landscape phones) */
@media (max-width: 360px) {
  .hero-title {
    font-size: 1.4rem;
  }

  .hero-subtitle {
    font-size: 0.85rem;
  }

  .programacion-card {
    padding: 15px;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .action-btn {
    padding: 10px;
    font-size: 0.85rem;
  }
}

/* Landscape orientation optimizations */
@media (max-height: 600px) and (orientation: landscape) {
  .hero-section {
    padding: 30px 20px;
  }

  .hero-icon {
    width: 50px;
    height: 50px;
  }

  .hero-icon i {
    font-size: 22px;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .card-modal {
    max-height: 85vh;
  }
}

/* Print styles */
@media print {
  .programa-musica-page {
    background: white;
  }

  .hero-section,
  .controls-section,
  .card-actions,
  .pagination-container {
    display: none;
  }

  .programacion-card {
    background: white;
    border: 1px solid #ccc;
    color: black;
    break-inside: avoid;
    margin-bottom: 20px;
  }

  .card-title,
  .metadata-item,
  .card-description p {
    color: black;
  }
}
</style>
