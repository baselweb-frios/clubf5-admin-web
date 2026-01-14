<template>
  <Teleport to="body">
    <div class="login-modal-overlay" :class="{ active: show }" @click.self="$emit('close')">
      <div class="login-modal-content">
        <div class="login-modal-header">
          <h3><i class="fas fa-sign-in-alt"></i> Iniciar Sesion</h3>
          <button class="modal-close" type="button" @click="$emit('close')">
            <i class="fas fa-times"></i>
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
          <div v-if="error" class="login-alert error">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ error }}</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="login-form">
            <!-- Username -->
            <div class="form-group">
              <label>Usuario (email)</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <i class="fas fa-user"></i>
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
              <p v-if="errors.username" class="field-error">{{ errors.username }}</p>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label>Contrasena</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <i class="fas fa-lock"></i>
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
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
            </div>

            <!-- Options -->
            <div class="form-options">
              <label class="checkbox-wrapper">
                <input v-model="form.remember" type="checkbox">
                <span>Recordarme</span>
              </label>
              <a href="forgot-password" class="forgot-link">Olvidaste tu contrasena?</a>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Iniciando sesion...' : 'Iniciar sesion' }}
            </button>
          </form>

          <!-- Footer -->
          <div class="login-footer">
            <p>
              No tienes cuenta?
              <a href="#registro" @click="$emit('close')">Registrate aqui</a>
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
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.login-modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.login-modal-content {
  background: linear-gradient(135deg, rgba(20, 20, 30, 0.98), rgba(10, 10, 20, 0.98));
  border: 1px solid rgba(1, 137, 221, 0.3);
  border-radius: 1rem;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(30px) scale(0.95);
  transition: all 0.3s ease;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(1, 137, 221, 0.1);
}

.login-modal-overlay.active .login-modal-content {
  transform: translateY(0) scale(1);
}

.login-modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(1, 137, 221, 0.1), transparent);
}

.login-modal-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.login-modal-header h3 i {
  color: #0189DD;
}

.modal-close {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.login-modal-body {
  padding: 2rem;
}

.login-logo {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #0189DD, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(1, 137, 221, 0.3);
}

.logo-icon span {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.login-logo h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.login-logo p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.login-alert {
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-alert.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.login-alert i {
  flex-shrink: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  transition: all 0.25s ease;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.form-input:focus {
  outline: none;
  border-color: #0189DD;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(1, 137, 221, 0.15);
}

.form-input.input-error {
  border-color: #ef4444;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.8);
}

.field-error {
  color: #ef4444;
  font-size: 0.8rem;
  margin: 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
}

.checkbox-wrapper input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #0189DD;
}

.checkbox-wrapper:hover {
  color: #ffffff;
}

.forgot-link {
  color: #0189DD;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #3ba3e8;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #0189DD, #0175c0);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.25s ease;
  box-shadow: 0 8px 24px rgba(1, 137, 221, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(1, 137, 221, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.login-footer p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.login-footer a {
  color: #0189DD;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.login-footer a:hover {
  color: #3ba3e8;
}

/* Scrollbar */
.login-modal-content::-webkit-scrollbar {
  width: 6px;
}

.login-modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.login-modal-content::-webkit-scrollbar-thumb {
  background: rgba(1, 137, 221, 0.3);
  border-radius: 3px;
}

.login-modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(1, 137, 221, 0.5);
}

@media (max-width: 480px) {
  .login-modal-content {
    max-height: 95vh;
    margin: 0.5rem;
  }

  .login-modal-body {
    padding: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}
</style>
