<template>
  <div class="login-card">
    <div class="login-header">
      <div class="logo-icon">
        <span>C5</span>
      </div>
      <h2 class="login-title">Bienvenido a ClubF5</h2>
      <p class="login-subtitle">Inicia sesión para continuar</p>
    </div>

    <form @submit.prevent="handleSubmit" class="login-form">
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <base-input
        v-model="form.username"
        type="text"
        label="Usuario"
        placeholder="Ingresa tu usuario"
        icon="user"
        required
        autocomplete="username"
        :error="errors.username"
      />

      <div class="password-input-wrapper">
        <base-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          icon="lock"
          required
          autocomplete="current-password"
          :error="errors.password"
        />
        <button
          type="button"
          @click="togglePasswordVisibility"
          class="toggle-password-btn"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        >
          <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
          </svg>
        </button>
      </div>

      <div class="login-options">
        <label class="remember-checkbox">
          <input
            type="checkbox"
            v-model="form.remember"
            class="checkbox-input"
          />
          <span class="checkbox-label">Recordarme</span>
        </label>

        <router-link to="/forgot-password" class="forgot-password">
          ¿Olvidaste tu contraseña?
        </router-link>
      </div>

      <base-button
        type="submit"
        variant="primary"
        :loading="loading"
        :disabled="loading"
        block
      >
        {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
      </base-button>
    </form>

    <div class="login-footer">
      <p>¿No tienes cuenta? <a href="#" class="support-link">Contacta con soporte</a></p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
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
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
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

    // Redirect based on user role
    const userRole = authStore.userRole
    router.push('/dashboard')

  } catch (err) {
    error.value = err || 'Error al iniciar sesión. Verifica tus credenciales.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ===== PREMIUM LOGIN CARD - DARK MODE ===== */
.login-card {
  background: rgba(26, 26, 26, 0.7);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(59, 130, 246, 0.15);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.login-card:hover {
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 30px 60px -15px rgba(0, 0, 0, 0.6),
    0 0 80px rgba(59, 130, 246, 0.25);
  transform: translateY(-4px);
}

/* ===== LOGIN HEADER ===== */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 10px 20px -5px rgba(59, 130, 246, 0.5),
    0 0 40px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: floatLogo 3s ease-in-out infinite;
}

@keyframes floatLogo {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.logo-icon:hover {
  transform: scale(1.1) rotate(-5deg);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.2),
    0 15px 30px -5px rgba(59, 130, 246, 0.7),
    0 0 60px rgba(59, 130, 246, 0.5);
}

.login-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
}

/* ===== LOGIN FORM ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ===== PASSWORD INPUT WRAPPER ===== */
.password-input-wrapper {
  position: relative;
}

.toggle-password-btn {
  position: absolute;
  right: 1rem;
  top: 2.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
}

.toggle-password-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.1);
}

.toggle-password-btn:active {
  transform: scale(0.95);
}

.toggle-password-btn svg {
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.2s ease;
}

/* ===== LOGIN OPTIONS ===== */
.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.remember-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  appearance: none;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.checkbox-input:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.5);
}

.checkbox-input:checked {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
}

.checkbox-input:checked::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 0.375rem;
  height: 0.625rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -60%) rotate(45deg) scale(1);
  animation: checkmark 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkmark {
  from {
    transform: translate(-50%, -60%) rotate(45deg) scale(0);
  }
  to {
    transform: translate(-50%, -60%) rotate(45deg) scale(1);
  }
}

.checkbox-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  user-select: none;
}

.forgot-password {
  color: var(--color-primary-500);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.forgot-password:hover {
  color: var(--color-primary-400);
  text-decoration: underline;
}

/* ===== LOGIN FOOTER ===== */
.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.login-footer p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.support-link {
  color: var(--color-primary-500);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.support-link:hover {
  color: var(--color-primary-400);
  text-decoration: underline;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .login-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
