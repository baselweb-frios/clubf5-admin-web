<template>
  <div class="alta-programacion-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="icon-plus-circle"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">{{ isEditing ? 'Editar Programación' : 'Nueva Programación' }}</h1>
          <p class="page-subtitle">Crea una nueva programación musical para tu sistema</p>
        </div>
      </div>
      <div class="header-decoration">
        <div class="floating-orb orb-1"></div>
        <div class="floating-orb orb-2"></div>
        <div class="floating-orb orb-3"></div>
      </div>
    </div>

    <!-- Main Form Container -->
    <div class="form-container">
      <div class="form-wrapper">
        <!-- Form Card -->
        <div class="form-card">
          <div class="card-header">
            <div class="card-header-icon">
              <i class="icon-music-2"></i>
            </div>
            <div class="card-header-text">
              <h2 class="card-title">{{ isEditing ? 'Editar Programación Musical' : 'Crear Nueva Programación' }}</h2>
              <p class="card-description">Configure los detalles básicos de su programación</p>
            </div>
          </div>

          <form id="frmNuevaProgramacion" accept-charset="UTF-8" role="form" v-on:submit.prevent="guardarProgramacion" class="programacion-form">
            <div class="form-section">
              <div class="form-group">
                <label for="nombreProgramacion" class="form-label">
                  <span class="label-icon">📝</span>
                  Nombre de la Programación
                  <span class="required-indicator">*</span>
                </label>
                <div class="input-wrapper">
                  <input
                    id="nombreProgramacion"
                    v-model="nombreProgramacion"
                    type="text"
                    class="form-input"
                    placeholder="Ingrese el nombre de la programación musical"
                    required
                    autocomplete="off"
                  >
                  <div class="input-focus-effect"></div>
                </div>
                <small class="form-help">Este nombre identificará su programación en el sistema</small>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="cancelar">
                <i class="icon-times"></i>
                <span>Cancelar</span>
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading || !nombreProgramacion.trim()">
                <span v-if="isLoading" class="btn-loading">
                  <i class="icon-spinner spinning"></i>
                  Guardando...
                </span>
                <span v-else>
                  <i class="icon-check"></i>
                  {{ isEditing ? 'Actualizar' : 'Crear Programación' }}
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Info Sidebar -->
        <div class="info-sidebar">
          <div class="info-card">
            <div class="info-header">
              <h3>💡 Consejos</h3>
            </div>
            <div class="info-content">
              <div class="tip-item">
                <div class="tip-icon">🎯</div>
                <div class="tip-text">
                  <strong>Elija un nombre descriptivo</strong>
                  <p>Use nombres que identifiquen claramente el tipo de programación</p>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">⚡</div>
                <div class="tip-text">
                  <strong>Programe eficientemente</strong>
                  <p>Después de crear la programación podrá asignar radios y horarios</p>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">🎵</div>
                <div class="tip-text">
                  <strong>Organice por géneros</strong>
                  <p>Considere crear programaciones específicas por tipo de música</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-container">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <div class="loading-text">
          <h3>{{ isEditing ? 'Actualizando programación...' : 'Creando programación...' }}</h3>
          <p>Procesando su solicitud</p>
        </div>
      </div>
    </div>

    <!-- Success Animation Modal -->
    <div v-if="showSuccess" class="success-modal">
      <div class="success-content">
        <div class="success-icon">
          <i class="icon-check-circle"></i>
        </div>
        <h3>¡Programación {{ isEditing ? 'actualizada' : 'creada' }} exitosamente!</h3>
        <p>Redirigiendo al listado de programaciones...</p>
      </div>
    </div>
  </div>
</template>

<script>
import RadioServices from '@/services/RadioServices'
import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'

export default {
  layout: 'default',
  name: 'frmNuevaProgramacion',
  components: {
    ScaleLoader
  },

  data () {
    return {
      nombreProgramacion: '',
      notificacion: { mensaje: '', tipo: 'error' },
      type: ['', 'danger'],
      notifications: {
        topCenter: false
      },
      codigoProgramacion: this.$route.params.codigoProgramacion,
      isLoading: false,
      showSuccess: false,
      loading: true,
      width: '10px'
    }
  },

  computed: {
    isEditing() {
      return this.codigoProgramacion && this.codigoProgramacion > 0
    }
  },
  methods: {
    guardarProgramacion () {
      if (!this.nombreProgramacion.trim()) {
        this.showNotification('El nombre de la programación es obligatorio', 'warning')
        return
      }

      this.isLoading = true
      RadioServices.altaProgramacion(this.codigoProgramacion, this.nombreProgramacion)
        .then(res => {
          this.isLoading = false
          this.showSuccessAnimation()
          setTimeout(() => {
            this.$router.push({ path: '/programaMusica' })
          }, 2000)
        })
        .catch(err => {
          this.handleError(err)
          this.showNotification(this.notificacion.mensaje, 'danger')
          this.isLoading = false
        })
    },

    cancelar() {
      this.$router.push({ path: '/programaMusica' })
    },

    showSuccessAnimation() {
      this.showSuccess = true
    },
    verificarParametros () {
      const codigoProgramacion = this.$route.params.codigoProgramacion
      const nombreProg = this.$route.params.nombreProgramacion

      if (this.codigoProgramacion != 0) {
        this.nombreProgramacion = nombreProg
      }
      if (codigoProgramacion == null) {
        this.codigoProgramacion = 0
      }
    },
    handleError (err) {
      if (!err.response) {
        this.notificacion.mensaje = 'No se ha recibido respuesta del servidor. Int&eacute;ntelo nuevamente m&aacute;s tarde.'
      } else {
        if (err.response && err.response.data.hasOwnProperty('errorMessage')) {
          this.notificacion.mensaje = err.response.data.errorMessage
        } else {
          const erro = []
          console.log(err.response.data.split('at'))
          switch (err.response.status) {
            case 502:
              this.notificacion.mensaje = 'El servidor no se encuentra disponible.'
              break
            default:
              /* si obtengo un system.exception, hago un split para poder obtener la primer parte
              *luego, de la primer parte, con un substr para extraer lo que sigue de
              *"system.exception" (17 caracteres)
              */
              let error = []
              error = (err.response.data.split('at'))
              this.notificacion.mensaje = error[0].substr(18)
          }
        }
      }
    },
    notifyVue (verticalAlign, horizontalAlign, message) {
      const color = 1
      this.$notify({
        message: message,
        icon: 'tim-icons icon-alert-circle-exc',
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
        type: this.type[color],
        timeout: 3000
      })
    }
  },
  mounted () {
    this.verificarParametros()
  }
}

</script>
<style scoped>
/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   ALTA PROGRAMACION - DARK PROFESSIONAL INTERFACE
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

   Características principales:
   • Diseño ultra profesional con interfaz oscura optimizada
   • Formulario elegante con efectos visuales avanzados
   • Bordes rectos sin redondeo para estética minimalista
   • Animaciones fluidas y transiciones profesionales
   • Layout responsivo con diseño centrado y balanceado
   • Estados de carga y éxito con animaciones personalizadas
   • Tipografía optimizada para legibilidad en modo oscuro
*/

.alta-programacion-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #f5f5f5;
  overflow-x: hidden;
}

/* Animated background elements */
.alta-programacion-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   HEADER SECTION - HERO STYLE
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

.page-header {
  position: relative;
  padding: 60px 40px 40px;
  background: linear-gradient(135deg,
    rgba(15, 15, 35, 0.95) 0%,
    rgba(26, 26, 64, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 30px;
  position: relative;
  z-index: 2;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 8px 32px rgba(59, 130, 246, 0.3);
  animation: headerIconFloat 4s ease-in-out infinite;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #f5f5f5;
  margin: 0 0 8px 0;
  line-height: 1.2;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(245, 245, 245, 0.7);
  margin: 0;
  line-height: 1.4;
}

/* Floating decorative elements */
.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: orbFloat 8s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #3b82f6, #2563eb);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, #10b981, #059669);
  top: 60%;
  right: 10%;
  animation-delay: 3s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #8b5cf6, #7c3aed);
  top: 30%;
  right: 30%;
  animation-delay: 6s;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   FORM CONTAINER - MAIN CONTENT
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

.form-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
  position: relative;
}

.form-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  align-items: start;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   FORM CARD - ELEGANT DESIGN
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

.form-card {
  background: linear-gradient(135deg,
    rgba(15, 15, 15, 0.98) 0%,
    rgba(10, 10, 10, 0.98) 100%);
  border: 2px solid rgba(40, 40, 40, 0.9);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 20px 40px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 25px 50px rgba(0, 0, 0, 0.5);
  border-color: rgba(50, 50, 50, 0.9);
}

.card-header {
  padding: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg,
    rgba(59, 130, 246, 0.05) 0%,
    rgba(16, 185, 129, 0.05) 100%);
}

.card-header-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.card-header-text {
  flex: 1;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #f5f5f5;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.card-description {
  font-size: 14px;
  color: rgba(245, 245, 245, 0.7);
  margin: 0;
  line-height: 1.4;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   FORM STYLING - PROFESSIONAL INPUTS
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

.programacion-form {
  padding: 30px;
}

.form-section {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #f5f5f5;
  margin: 0 0 8px 0;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-icon {
  font-size: 16px;
  opacity: 0.8;
}

.required-indicator {
  color: #ef4444;
  font-weight: 700;
}

.input-wrapper {
  position: relative;
  margin-bottom: 5px;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  background: rgba(12, 12, 12, 0.9);
  border: 2px solid rgba(40, 40, 40, 0.8);
  color: #f5f5f5;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  outline: none;
}

.form-input:focus {
  border-color: #3b82f6;
  background: rgba(8, 8, 8, 0.95);
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.1),
    0 0 0 1px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.form-input:hover {
  border-color: rgba(60, 60, 60, 0.8);
  background: rgba(10, 10, 10, 0.95);
}

.form-input::placeholder {
  color: rgba(245, 245, 245, 0.5);
  font-style: italic;
}

.input-focus-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  border-radius: 0;
}

.form-input:focus ~ .input-focus-effect {
  transform: scaleX(1);
}

.form-help {
  font-size: 12px;
  color: rgba(245, 245, 245, 0.6);
  margin: 0;
  line-height: 1.4;
  font-style: italic;
  padding-left: 5px;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   FORM ACTIONS - PROFESSIONAL BUTTONS
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 30px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: 2px solid;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 48px;
  justify-content: center;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent);
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-secondary {
  background: rgba(12, 12, 12, 0.9);
  border-color: rgba(40, 40, 40, 0.8);
  color: rgba(245, 245, 245, 0.8);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(15, 15, 15, 0.95);
  border-color: rgba(60, 60, 60, 0.8);
  color: #f5f5f5;
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4);
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   INFO SIDEBAR - TIPS AND HELP
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

.info-sidebar {
  position: sticky;
  top: 40px;
}

.info-card {
  background: linear-gradient(135deg,
    rgba(15, 15, 15, 0.95) 0%,
    rgba(10, 10, 10, 0.95) 100%);
  border: 2px solid rgba(40, 40, 40, 0.9);
  backdrop-filter: blur(20px);
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 8px 32px rgba(0, 0, 0, 0.4);
}

.info-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg,
    rgba(59, 130, 246, 0.05) 0%,
    rgba(16, 185, 129, 0.05) 100%);
}

.info-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #f5f5f5;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-content {
  padding: 20px;
}

.tip-item {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0;
  border-left: 3px solid #3b82f6;
  transition: all 0.3s ease;
}

.tip-item:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateX(5px);
}

.tip-icon {
  font-size: 20px;
  flex-shrink: 0;
  opacity: 0.8;
}

.tip-text {
  flex: 1;
}

.tip-text strong {
  color: #f5f5f5;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.tip-text p {
  color: rgba(245, 245, 245, 0.7);
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   LOADING OVERLAY - PROFESSIONAL ANIMATION
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.loading-container {
  text-align: center;
  padding: 40px;
  background: rgba(15, 15, 15, 0.9);
  border: 2px solid rgba(40, 40, 40, 0.8);
  border-radius: 0;
  max-width: 400px;
  width: 90%;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #3b82f6;
  animation-duration: 1s;
}

.spinner-ring:nth-child(2) {
  border-top-color: #10b981;
  animation-duration: 1.5s;
  animation-direction: reverse;
}

.spinner-ring:nth-child(3) {
  border-top-color: #8b5cf6;
  animation-duration: 2s;
}

.spinner-ring:nth-child(4) {
  border-top-color: #f59e0b;
  animation-duration: 2.5s;
  animation-direction: reverse;
}

.loading-text h3 {
  font-size: 18px;
  font-weight: 600;
  color: #f5f5f5;
  margin: 0 0 8px 0;
}

.loading-text p {
  font-size: 14px;
  color: rgba(245, 245, 245, 0.7);
  margin: 0;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   SUCCESS MODAL - CELEBRATION ANIMATION
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.success-content {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg,
    rgba(15, 15, 15, 0.98) 0%,
    rgba(10, 10, 10, 0.98) 100%);
  border: 2px solid rgba(16, 185, 129, 0.4);
  border-radius: 0;
  max-width: 400px;
  width: 90%;
  box-shadow:
    0 0 0 1px rgba(16, 185, 129, 0.2) inset,
    0 20px 40px rgba(0, 0, 0, 0.5);
  animation: successPulse 0.6s ease;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #ffffff;
  margin: 0 auto 20px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  animation: successIconBounce 0.6s ease;
}

.success-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
  margin: 0 0 10px 0;
}

.success-content p {
  font-size: 14px;
  color: rgba(245, 245, 245, 0.7);
  margin: 0;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   ANIMATIONS - PROFESSIONAL EFFECTS
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

@keyframes headerIconFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes orbFloat {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.1; }
  50% { transform: translateY(-30px) scale(1.1); opacity: 0.15; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes successPulse {
  0% {
    box-shadow:
      0 0 0 0 rgba(16, 185, 129, 0.4),
      0 20px 40px rgba(0, 0, 0, 0.5);
  }
  70% {
    box-shadow:
      0 0 0 10px rgba(16, 185, 129, 0),
      0 25px 50px rgba(0, 0, 0, 0.6);
  }
  100% {
    box-shadow:
      0 0 0 0 rgba(16, 185, 129, 0),
      0 20px 40px rgba(0, 0, 0, 0.5);
  }
}

@keyframes successIconBounce {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   RESPONSIVE DESIGN - MOBILE OPTIMIZATION
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

@media (max-width: 1024px) {
  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .info-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .alta-programacion-page {
    padding: 20px;
  }

  .page-header {
    padding: 40px 20px 30px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .header-icon {
    width: 70px;
    height: 70px;
    font-size: 28px;
  }

  .page-title {
    font-size: 28px;
  }

  .form-container {
    padding: 20px;
  }

  .form-card {
    margin-bottom: 20px;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
    padding: 25px;
  }

  .programacion-form {
    padding: 25px;
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;
  }

  .btn {
    width: 100%;
    padding: 16px 24px;
  }
}

@media (max-width: 480px) {
  .alta-programacion-page {
    padding: 15px;
  }

  .page-header {
    padding: 30px 15px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-container {
    padding: 15px;
  }

  .card-header {
    padding: 20px;
  }

  .programacion-form {
    padding: 20px;
  }

  .client-stats {
    flex-wrap: wrap;
    gap: 15px;
  }

  .tip-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   ACCESSIBILITY ENHANCEMENTS
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  .alta-programacion-page * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .floating-orb,
  .header-icon,
  .spinner-ring {
    animation: none !important;
  }
}

@media (prefers-contrast: high) {
  .form-card,
  .info-card,
  .client-info-container {
    border-width: 3px;
  }

  .btn {
    border-width: 3px;
  }
}

/* Focus visible improvements */
.form-input:focus-visible,
.btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   ICON STYLES
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */

.icon-plus-circle::before { content: "➕"; }
.icon-music-2::before { content: "🎵"; }
.icon-times::before { content: "❌"; }
.icon-check::before { content: "✅"; }
.icon-spinner::before { content: "⟳"; }
.icon-check-circle::before { content: "✅"; }
</style>
