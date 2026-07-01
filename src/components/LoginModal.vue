<template>
  <Teleport to="body">
    <div
class="login-modal-overlay"
:class="{ active: show }"
@click.self="$emit('close')"
>
      <div class="login-modal-content">
        <div class="login-modal-header">
          <h3><i class="fas fa-sign-in-alt" /> Iniciar Sesion</h3>
          <button
class="modal-close"
type="button"
@click="$emit('close')"
>
            <i class="fas fa-times" />
          </button>
        </div>
        <div class="login-modal-body">
          <!-- Logo -->
          <div class="login-logo">
            <div class="logo-icon">
              <span>C5</span>
            </div>
            <h2>Bienvenido a ClubF5</h2>
            <p>Inicia sesion para continuar</p>
          </div>

          <!-- Error Alert -->
          <div
v-if="error"
class="login-alert error"
>
            <i class="fas fa-exclamation-circle" />
            <span>{{ error }}</span>
          </div>

          <!-- Form -->
          <form
class="login-form"
@submit.prevent="handleSubmit"
>
            <!-- Username -->
            <div class="form-group">
              <label>Usuario (email)</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <i class="fas fa-user" />
                </span>
                <input
                  v-model="form.username"
                  type="text"
                  class="form-input"
                  :class="{ 'input-error': errors.username }"
                  placeholder="Ingresa tu usuario"
                  autocomplete="username"
                  required
                >
              </div>
              <p
v-if="errors.username"
class="field-error"
>
{{ errors.username }}
</p>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label>Contrasena</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <i class="fas fa-lock" />
                </span>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  :class="{ 'input-error': errors.password }"
                  placeholder="Ingresa tu contrasena"
                  autocomplete="current-password"
                  required
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" />
                </button>
              </div>
              <p
v-if="errors.password"
class="field-error"
>
{{ errors.password }}
</p>
            </div>

            <!-- Options -->
            <div class="form-options">
              <label class="checkbox-wrapper">
                <input
v-model="form.remember"
type="checkbox"
>
                <span>Recordarme</span>
              </label>
              <a
href="forgot-password"
class="forgot-link"
>Olvidaste tu contrasena?</a>
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
              {{ loading ? 'Iniciando sesion...' : 'Iniciar sesion' }}
            </button>
          </form>

          <!-- Footer -->
          <div class="login-footer">
            <p>
              No tienes cuenta?
              <a
href="#registro"
@click="$emit('close')"
>Registrate aqui</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'login-success'])

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const errors = reactive({
  username: '',
  password: ''
})

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.username = ''
    form.password = ''
    form.remember = false
    error.value = ''
    errors.username = ''
    errors.password = ''
  }
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const validateForm = () => {
  errors.username = ''
  errors.password = ''
  let isValid = true

  if (!form.username) {
    errors.username = 'El usuario es requerido'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'La contrasena es requerida'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'La contrasena debe tener al menos 6 caracteres'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  error.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    await authStore.login(form.username, form.password)
    emit('login-success')
  } catch (err) {
    error.value = err || 'Error al iniciar sesion. Verifica tus credenciales.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Modal Overlay */
.login-modal-overlay {
  @apply fixed inset-0 z-[9999] flex-center p-4;
  @apply bg-black/85 backdrop-blur-lg;
  @apply opacity-0 invisible transition-all duration-300;
}

.login-modal-overlay.active {
  @apply opacity-100 visible;
}

/* Modal Content */
.login-modal-content {
  @apply relative w-full max-w-md max-h-[90vh] overflow-y-auto;
  @apply rounded-2xl glass-strong border border-primary-500/30;
  @apply shadow-2xl shadow-glow-primary;
  @apply transform translate-y-8 scale-95 transition-all duration-300;
  @apply scrollbar-thin;
}

.login-modal-overlay.active .login-modal-content {
  @apply translate-y-0 scale-100;
}

/* Modal Header */
.login-modal-header {
  @apply px-6 py-5 flex-between gap-4;
  @apply border-b border-white/10 bg-gradient-to-r from-primary-500/10 to-transparent;
}

.login-modal-header h3 {
  @apply text-xl font-bold text-text-primary flex items-center gap-3 m-0;
}

.login-modal-header h3 i {
  @apply text-primary-400;
}

.modal-close {
  @apply w-9 h-9 flex-center rounded-lg;
  @apply bg-white/5 border border-white/10;
  @apply text-white/85 text-lg cursor-pointer;
  @apply transition-all duration-200 hover-lift;
  @apply hover:bg-danger-500/15 hover:border-danger-500/30 hover:text-danger-400;
}

/* Modal Body */
.login-modal-body {
  @apply p-8;
}

/* Logo Section */
.login-logo {
  @apply text-center mb-8 animate-fade-in;
}

.logo-icon {
  @apply w-16 h-16 mx-auto mb-4 rounded-2xl;
  @apply bg-gradient-to-br from-primary-500 to-purple-500;
  @apply flex-center shadow-glow-primary;
  @apply animate-float;
}

.logo-icon span {
  @apply text-2xl font-bold text-white;
}

.login-logo h2 {
  @apply text-2xl font-bold text-text-primary mb-2 m-0;
  @apply text-gradient-primary;
}

.login-logo p {
  @apply text-text-secondary text-sm m-0;
}

/* Alert */
.login-alert {
  @apply p-3.5 rounded-lg mb-6 flex items-center gap-3;
  @apply animate-slide-in-up;
}

.login-alert.error {
  @apply alert alert-danger;
}

.login-alert i {
  @apply flex-shrink-0;
}

/* Form */
.login-form {
  @apply flex flex-col gap-5;
}

.form-group {
  @apply space-y-2;
}

.form-group label {
  @apply label text-sm font-semibold;
}

.input-wrapper {
  @apply relative flex items-center;
}

.input-icon {
  @apply absolute left-4 text-text-tertiary pointer-events-none;
}

.form-input {
  @apply input pl-11 pr-4;
}

.form-input.input-error {
  @apply border-danger-500 focus:border-danger-500 focus:ring-danger-500;
}

.password-toggle {
  @apply absolute right-4 p-0 bg-transparent border-0;
  @apply text-text-tertiary cursor-pointer;
  @apply transition-colors hover:text-text-primary;
}

.field-error {
  @apply text-danger-400 text-xs m-0;
}

/* Form Options */
.form-options {
  @apply flex-between text-sm flex-wrap gap-3;
}

.checkbox-wrapper {
  @apply flex items-center gap-2 cursor-pointer text-text-secondary;
  @apply transition-colors hover:text-text-primary;
}

.checkbox-wrapper input[type="checkbox"] {
  @apply checkbox;
}

.forgot-link {
  @apply text-primary-400 no-underline font-medium;
  @apply transition-colors hover:text-primary-300;
}

/* Submit Button */
.btn-submit {
  @apply w-full btn btn-primary btn-lg;
  @apply shadow-glow-primary;
  @apply gpu-accelerated;
}

.btn-submit:hover:not(:disabled) {
  @apply hover-lift shadow-xl;
}

.btn-submit:disabled {
  @apply opacity-60 cursor-not-allowed;
}

.spinner {
  @apply w-5 h-5 border-2 border-white/30 border-t-white rounded-full;
  @apply animate-spin;
}

/* Footer */
.login-footer {
  @apply mt-8 pt-6 border-t border-white/10 text-center;
}

.login-footer p {
  @apply text-text-secondary text-sm m-0;
}

.login-footer a {
  @apply text-primary-400 no-underline font-semibold;
  @apply transition-colors hover:text-primary-300;
}

/* Responsive */
@media (max-width: 480px) {
  .login-modal-content {
    @apply max-h-[95vh] m-2;
  }

  .login-modal-body {
    @apply p-6;
  }

  .form-options {
    @apply flex-col items-start gap-3;
  }
}
</style>
