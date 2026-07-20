<template>
  <Teleport to="body">
    <div
      class="sucursal-login-overlay"
      :class="{ active: show }"
      @click.self="$emit('close')"
    >
      <div class="sucursal-login-content">
        <div class="sucursal-login-header">
          <h3>
            <i class="fas fa-store" />
            Login Sucursal
          </h3>
          <button
            class="modal-close"
            type="button"
            @click="$emit('close')"
          >
            <i class="fas fa-times" />
          </button>
        </div>
        <div class="sucursal-login-body">
          <!-- Info Sucursal -->
          <div class="sucursal-info">
            <div class="info-icon">
              <i class="fas fa-building" />
            </div>
            <div class="info-details">
              <h4>{{ sucursalName }}</h4>
              <p class="username-display">
                <i class="fas fa-user" />
                {{ username }}
              </p>
            </div>
          </div>

          <!-- Error Alert -->
          <div
            v-if="error"
            class="login-alert error"
          >
            <i class="fas fa-exclamation-circle" />
            <span>{{ error }}</span>
          </div>

          <!-- Success Alert -->
          <div
            v-if="success"
            class="login-alert success"
          >
            <i class="fas fa-check-circle" />
            <span>{{ success }}</span>
          </div>

          <!-- Form -->
          <form
            class="login-form"
            @submit.prevent="handleSubmit"
          >
            <!-- Password -->
            <div class="form-group">
              <label>Contraseña</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <i class="fas fa-lock" />
                </span>
                <input
                  ref="passwordInput"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  :class="{ 'input-error': error }"
                  placeholder="Ingresa la contraseña"
                  autocomplete="current-password"
                  required
                  autofocus
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" />
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn-submit"
              :disabled="loading"
            >
              <span
                v-if="loading"
                class="spinner"
              />
              {{ loading ? 'Conectando...' : 'Conectar' }}
            </button>
          </form>

          <!-- Token Display (solo para debug/desarrollo) -->
          <div
            v-if="tokenData && showTokens"
            class="token-display"
          >
            <div class="token-header" @click="toggleTokenDisplay">
              <span>Tokens obtenidos</span>
              <i :class="expandedTokens ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" />
            </div>
            <div v-if="expandedTokens" class="token-content">
              <div class="token-item">
                <strong>Access Token:</strong>
                <code>{{ tokenData.token }}</code>
              </div>
              <div class="token-item">
                <strong>Refresh Token:</strong>
                <code>{{ tokenData.refreshToken }}</code>
              </div>
            </div>
          </div>

          <!-- Botón cerrar después del login exitoso -->
          <div
            v-if="success && tokenData"
            class="login-success-actions"
          >
            <button
              type="button"
              class="btn-close-modal"
              @click="$emit('close')"
            >
              <i class="fas fa-check" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import userService from '@/services/UserServices'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    required: true
  },
  sucursalName: {
    type: String,
    default: 'Sucursal'
  },
  showTokens: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'login-success', 'login-error'])

const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const password = ref('')
const tokenData = ref(null)
const expandedTokens = ref(false)
const passwordInput = ref(null)

// Reset form when modal opens
watch(() => props.show, async (newVal) => {
  if (newVal) {
    password.value = ''
    error.value = ''
    success.value = ''
    tokenData.value = null
    expandedTokens.value = false
    
    // Focus on password input when modal opens
    await nextTick()
    if (passwordInput.value) {
      passwordInput.value.focus()
    }
  }
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleTokenDisplay = () => {
  expandedTokens.value = !expandedTokens.value
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  if (!password.value) {
    error.value = 'La contraseña es requerida'
    return
  }

  loading.value = true

  try {
    // Realizar el login con el username y password
    const response = await userService.login(props.username, password.value)
    
    console.log('Login response:', response)
    console.log('Response data:', response.data)
    
    // Extraer tokens de la respuesta
    const tokens = {
      token: response.data.access_token || response.data.token || '',
      refreshToken: response.data.refresh_token || response.data.refreshToken || '',
      user: response.data
    }
    
    console.log('Tokens extraídos:', tokens)
    
    tokenData.value = tokens
    expandedTokens.value = true // Auto-expandir los tokens
    success.value = 'Login exitoso - Tokens obtenidos'
    
    // Emitir los tokens al componente padre
    emit('login-success', tokens)
    
    // NO cerrar automáticamente - el componente padre debe manejar el cierre
    // para poder usar los tokens antes de que se cierre el modal
  } catch (err) {
    console.error('Login error:', err)
    console.error('Error response:', err.response)
    const errorMessage = err?.message || err?.response?.data?.message || 'Error al iniciar sesión. Verifica la contraseña.'
    error.value = errorMessage
    emit('login-error', { error: errorMessage, username: props.username })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Modal Overlay */
.sucursal-login-overlay {
  @apply fixed inset-0 z-[9999] flex items-center justify-center p-4;
  @apply bg-black/85 backdrop-blur-lg;
  @apply opacity-0 invisible transition-all duration-300;
}

.sucursal-login-overlay.active {
  @apply opacity-100 visible;
}

/* Modal Content */
.sucursal-login-content {
  @apply relative w-full max-w-sm max-h-[90vh] overflow-y-auto;
  @apply rounded-2xl bg-gradient-to-b from-dark-primary to-dark-secondary;
  @apply border border-primary-500/30;
  @apply shadow-2xl;
  @apply transform translate-y-8 scale-95 transition-all duration-300;
}

.sucursal-login-overlay.active .sucursal-login-content {
  @apply translate-y-0 scale-100;
}

/* Modal Header */
.sucursal-login-header {
  @apply px-5 py-4 flex items-center justify-between;
  @apply border-b border-white/10 bg-primary-500/10;
}

.sucursal-login-header h3 {
  @apply text-lg font-bold text-text-primary flex items-center gap-2 m-0;
}

.sucursal-login-header h3 i {
  @apply text-primary-400;
}

.modal-close {
  @apply w-8 h-8 flex items-center justify-center rounded-lg;
  @apply bg-white/5 border border-white/10;
  @apply text-white/85 cursor-pointer;
  @apply transition-all duration-200;
  @apply hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400;
}

/* Modal Body */
.sucursal-login-body {
  @apply p-6;
}

/* Sucursal Info */
.sucursal-info {
  @apply flex items-center gap-4 p-4 mb-5 rounded-xl;
  @apply bg-primary-500/10 border border-primary-500/20;
}

.info-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center;
  @apply bg-primary-500/20 text-primary-400 text-xl;
}

.info-details h4 {
  @apply text-text-primary font-semibold m-0 mb-1;
}

.username-display {
  @apply text-text-secondary text-sm m-0 flex items-center gap-2;
}

.username-display i {
  @apply text-text-tertiary text-xs;
}

/* Alerts */
.login-alert {
  @apply p-3 rounded-lg mb-4 flex items-center gap-2 text-sm;
  @apply animate-pulse;
}

.login-alert.error {
  @apply bg-red-500/10 border border-red-500/30 text-red-400;
}

.login-alert.success {
  @apply bg-green-500/10 border border-green-500/30 text-green-400;
}

/* Form */
.login-form {
  @apply flex flex-col gap-4;
}

.form-group {
  @apply space-y-2;
}

.form-group label {
  @apply block text-sm font-medium text-text-secondary;
}

.input-wrapper {
  @apply relative flex items-center;
}

.input-icon {
  @apply absolute left-4 text-text-tertiary pointer-events-none;
}

.form-input {
  @apply w-full pl-11 pr-12 py-3 rounded-lg;
  @apply bg-dark-secondary border border-white/10;
  @apply text-text-primary placeholder-text-tertiary;
  @apply focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
  @apply transition-all duration-200;
}

.form-input.input-error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500;
}

.password-toggle {
  @apply absolute right-4 p-0 bg-transparent border-0;
  @apply text-text-tertiary cursor-pointer;
  @apply transition-colors hover:text-text-primary;
}

/* Submit Button */
.btn-submit {
  @apply w-full py-3 px-4 rounded-lg font-semibold;
  @apply bg-gradient-to-r from-primary-500 to-primary-600;
  @apply text-white border-0 cursor-pointer;
  @apply flex items-center justify-center gap-2;
  @apply transition-all duration-200;
  @apply hover:from-primary-600 hover:to-primary-700 hover:shadow-lg;
}

.btn-submit:disabled {
  @apply opacity-60 cursor-not-allowed;
}

.spinner {
  @apply w-5 h-5 border-2 border-white/30 border-t-white rounded-full;
  @apply animate-spin;
}

/* Login Success Actions */
.login-success-actions {
  @apply mt-4 flex justify-end;
}

.btn-close-modal {
  @apply px-4 py-2 rounded-lg font-medium text-sm;
  @apply bg-success-500/20 border border-success-500/30;
  @apply text-success-400 cursor-pointer;
  @apply flex items-center gap-2;
  @apply transition-all duration-200;
  @apply hover:bg-success-500/30 hover:border-success-500/50;
}

/* Token Display */
.token-display {
  @apply mt-5 p-3 rounded-lg;
  @apply bg-dark-secondary border border-white/10;
}

.token-header {
  @apply flex items-center justify-between cursor-pointer;
  @apply text-sm font-medium text-text-secondary;
  @apply hover:text-text-primary transition-colors;
}

.token-content {
  @apply mt-3 space-y-2;
}

.token-item {
  @apply p-2 rounded bg-dark-primary;
}

.token-item strong {
  @apply block text-xs text-text-tertiary mb-1;
}

.token-item code {
  @apply block text-xs text-green-400 break-all font-mono;
}
</style>