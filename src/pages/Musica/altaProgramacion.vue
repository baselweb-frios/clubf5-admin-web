<template>
  <div class="alta-programacion-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
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
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
              </svg>
            </div>
            <div class="card-header-text">
              <h2 class="card-title">{{ isEditing ? 'Editar Programación Musical' : 'Crear Nueva Programación' }}</h2>
              <p class="card-description">Configure los detalles básicos de su programación</p>
            </div>
          </div>

          <form @submit.prevent="guardarProgramacion" class="programacion-form">
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
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span>Cancelar</span>
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading || !nombreProgramacion.trim()">
                <span v-if="isLoading" class="btn-loading">
                  <svg class="spinning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Guardando...
                </span>
                <span v-else>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
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

    <!-- Loading Overlay -->
    <LoadingOverlay v-if="isLoading" message="Guardando programación..." />

    <!-- Success Modal -->
    <div v-if="showSuccess" class="success-modal">
      <div class="success-content">
        <div class="success-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3>¡Programación {{ isEditing ? 'actualizada' : 'creada' }} exitosamente!</h3>
        <p>Redirigiendo al listado de programaciones...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import RadioServices from '@/services/RadioServices'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'

const router = useRouter()
const route = useRoute()

// State
const nombreProgramacion = ref('')
const codigoProgramacion = ref(route.params.codigoProgramacion || '0')
const isLoading = ref(false)
const showSuccess = ref(false)

// Computed
const isEditing = computed(() => {
  return codigoProgramacion.value && parseInt(codigoProgramacion.value) > 0
})

// Methods
const guardarProgramacion = async () => {
  if (!nombreProgramacion.value.trim()) {
    alert('El nombre de la programación es obligatorio')
    return
  }

  try {
    isLoading.value = true

    await RadioServices.altaProgramacion(
      parseInt(codigoProgramacion.value),
      nombreProgramacion.value
    )

    showSuccess.value = true

    setTimeout(() => {
      router.push({ name: 'ProgramaMusica' })
    }, 2000)

  } catch (error) {
    console.error('Error al guardar programación:', error)

    let mensaje = 'Error al guardar la programación'
    if (error.response?.data?.errorMessage) {
      mensaje = error.response.data.errorMessage
    } else if (error.message) {
      mensaje = error.message
    }

    alert(mensaje)

  } finally {
    isLoading.value = false
  }
}

const cancelar = () => {
  router.push({ name: 'ProgramaMusica' })
}

const verificarParametros = () => {
  const nombreParam = route.params.nombreProgramacion

  if (isEditing.value && nombreParam && nombreParam !== 'nueva') {
    nombreProgramacion.value = decodeURIComponent(nombreParam)
  }
}

// Lifecycle
onMounted(() => {
  verificarParametros()
})
</script>

<style scoped>
.alta-programacion-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #f5f5f5;
  overflow-x: hidden;
}

/* Animated background */
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

/* Header Section */
.page-header {
  position: relative;
  padding: 60px 40px 40px;
  background: linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 64, 0.95) 100%);
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
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
  animation: headerIconFloat 4s ease-in-out infinite;
}

.header-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 2.25rem;
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
  font-size: 1rem;
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

/* Form Container */
.form-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}

.form-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  align-items: start;
}

/* Form Card */
.form-card {
  background: linear-gradient(135deg, rgba(15, 15, 15, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 2px solid rgba(40, 40, 40, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  transition: all 0.3s;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border-color: rgba(50, 50, 50, 0.9);
}

.card-header {
  padding: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
}

.card-header-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.card-header-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.card-header-text {
  flex: 1;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f5f5f5;
  margin: 0 0 8px 0;
}

.card-description {
  font-size: 0.875rem;
  color: rgba(245, 245, 245, 0.7);
  margin: 0;
}

/* Form Styling */
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
  font-size: 0.875rem;
  font-weight: 600;
  color: #f5f5f5;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-icon {
  font-size: 1rem;
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
  border-radius: 8px;
  color: #f5f5f5;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
  outline: none;
}

.form-input:focus {
  border-color: #3b82f6;
  background: rgba(8, 8, 8, 0.95);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
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
  transition: transform 0.3s;
}

.form-input:focus ~ .input-focus-effect {
  transform: scaleX(1);
}

.form-help {
  font-size: 0.75rem;
  color: rgba(245, 245, 245, 0.6);
  font-style: italic;
  padding-left: 5px;
}

/* Form Actions */
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
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 48px;
  justify-content: center;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Info Sidebar */
.info-sidebar {
  position: sticky;
  top: 40px;
}

.info-card {
  background: linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(10, 10, 10, 0.95) 100%);
  border: 2px solid rgba(40, 40, 40, 0.9);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.info-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
}

.info-header h3 {
  font-size: 1rem;
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
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
  transition: all 0.3s;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-item:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateX(5px);
}

.tip-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  opacity: 0.8;
}

.tip-text {
  flex: 1;
}

.tip-text strong {
  color: #f5f5f5;
  font-size: 0.875rem;
  display: block;
  margin-bottom: 4px;
}

.tip-text p {
  color: rgba(245, 245, 245, 0.7);
  font-size: 0.75rem;
  line-height: 1.4;
  margin: 0;
}

/* Success Modal */
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
  animation: fadeIn 0.3s;
}

.success-content {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, rgba(15, 15, 15, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 2px solid rgba(16, 185, 129, 0.4);
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: successPulse 0.6s;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  animation: successIconBounce 0.6s;
}

.success-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.success-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
  margin: 0 0 10px 0;
}

.success-content p {
  font-size: 0.875rem;
  color: rgba(245, 245, 245, 0.7);
  margin: 0;
}

/* Animations */
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
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes successPulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

@keyframes successIconBounce {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Responsive */
@media (max-width: 1024px) {
  .form-wrapper {
    grid-template-columns: 1fr;
  }

  .info-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 20px 30px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .header-icon {
    width: 70px;
    height: 70px;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .form-container {
    padding: 20px;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
  }

  .programacion-form {
    padding: 25px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 30px 15px 20px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-container {
    padding: 15px;
  }
}
</style>
