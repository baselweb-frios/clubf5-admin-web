<template>
  <div class="reset-password-card">
    <div class="reset-password-header">
      <div class="logo-icon">
        <span>C5</span>
      </div>
      <h2 class="reset-password-title">Restablecer Contraseña</h2>
      <p class="reset-password-subtitle">
        Ingresa tu nueva contraseña
      </p>
    </div>

    <!-- Success Message -->
    <div v-if="passwordReset" class="alert alert-success">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <div>
        <p class="font-semibold">Contraseña actualizada exitosamente</p>
        <p class="text-sm">Ya puedes iniciar sesión con tu nueva contraseña.</p>
      </div>
    </div>

    <form v-if="!passwordReset" @submit.prevent="handleSubmit" class="reset-password-form">
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div class="password-input-wrapper">
        <base-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Nueva Contraseña"
          placeholder="Ingresa tu nueva contraseña"
          icon="lock"
          required
          autocomplete="new-password"
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

      <div class="password-input-wrapper">
        <base-input
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          label="Confirmar Contraseña"
          placeholder="Confirma tu nueva contraseña"
          icon="lock"
          required
          autocomplete="new-password"
          :error="errors.confirmPassword"
        />
        <button
          type="button"
          @click="toggleConfirmPasswordVisibility"
          class="toggle-password-btn"
          :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        >
          <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
          </svg>
        </button>
      </div>

      <!-- Password Strength Indicator -->
      <div class="password-strength">
        <div class="strength-bar">
          <div
            class="strength-bar-fill"
            :class="`strength-${passwordStrength.level}`"
            :style="{ width: `${passwordStrength.percentage}%` }"
          ></div>
        </div>
        <p class="strength-text" :class="`text-${passwordStrength.level}`">
          {{ passwordStrength.text }}
        </p>
      </div>

      <!-- Password Requirements -->
      <div class="password-requirements">
        <p class="requirements-title">La contraseña debe contener:</p>
        <ul class="requirements-list">
          <li :class="{ 'met': hasMinLength }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Al menos 8 caracteres
          </li>
          <li :class="{ 'met': hasUpperCase }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Una letra mayúscula
          </li>
          <li :class="{ 'met': hasLowerCase }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Una letra minúscula
          </li>
          <li :class="{ 'met': hasNumber }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Un número
          </li>
        </ul>
      </div>

      <base-button
        type="submit"
        variant="primary"
        :loading="loading"
        :disabled="loading || !isPasswordValid"
        block
      >
        {{ loading ? 'Actualizando...' : 'Restablecer contraseña' }}
      </base-button>
    </form>

    <div class="reset-password-footer">
      <router-link v-if="passwordReset" to="/login" class="back-to-login">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Ir al inicio de sesión
      </router-link>
      <router-link v-else to="/login" class="back-to-login">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Volver al inicio de sesión
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const passwordReset = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  password: '',
  confirmPassword: '',
  token: route.query.token || ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

// Password validation
const hasMinLength = computed(() => form.password.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(form.password))
const hasLowerCase = computed(() => /[a-z]/.test(form.password))
const hasNumber = computed(() => /[0-9]/.test(form.password))

const isPasswordValid = computed(() => {
  return hasMinLength.value &&
         hasUpperCase.value &&
         hasLowerCase.value &&
         hasNumber.value &&
         form.password === form.confirmPassword
})

// Password strength
const passwordStrength = computed(() => {
  if (!form.password) {
    return { level: 'none', percentage: 0, text: '' }
  }

  let strength = 0
  if (hasMinLength.value) strength++
  if (hasUpperCase.value) strength++
  if (hasLowerCase.value) strength++
  if (hasNumber.value) strength++
  if (/[^A-Za-z0-9]/.test(form.password)) strength++

  const percentage = (strength / 5) * 100

  if (strength <= 2) {
    return { level: 'weak', percentage, text: 'Débil' }
  } else if (strength === 3) {
    return { level: 'medium', percentage, text: 'Media' }
  } else {
    return { level: 'strong', percentage, text: 'Fuerte' }
  }
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const validateForm = () => {
  errors.password = ''
  errors.confirmPassword = ''
  let isValid = true

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (!isPasswordValid.value) {
    errors.password = 'La contraseña no cumple con los requisitos'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  if (!form.token) {
    error.value = 'Token de recuperación inválido o expirado'
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
    await authStore.resetPassword(form.token, form.password)
    passwordReset.value = true

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err) {
    error.value = err || 'Error al restablecer la contraseña. El enlace puede haber expirado.'
    console.error('Password reset error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ===== PREMIUM RESET PASSWORD CARD - DARK MODE ===== */
.reset-password-card {
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

.reset-password-card:hover {
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 30px 60px -15px rgba(0, 0, 0, 0.6),
    0 0 80px rgba(59, 130, 246, 0.25);
  transform: translateY(-4px);
}

/* ===== HEADER ===== */
.reset-password-header {
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

.reset-password-title {
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

.reset-password-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
}

/* ===== FORM ===== */
.reset-password-form {
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

/* ===== PASSWORD STRENGTH ===== */
.password-strength {
  margin-top: -0.5rem;
}

.strength-bar {
  width: 100%;
  height: 0.375rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-bar-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 9999px;
}

.strength-weak {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.strength-medium {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.strength-strong {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.text-weak {
  color: #ef4444;
}

.text-medium {
  color: #f59e0b;
}

.text-strong {
  color: #22c55e;
}

/* ===== PASSWORD REQUIREMENTS ===== */
.password-requirements {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-top: -0.5rem;
}

.requirements-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.requirements-list li svg {
  width: 1rem;
  height: 1rem;
  color: rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.requirements-list li.met {
  color: #22c55e;
}

.requirements-list li.met svg {
  color: #22c55e;
}

/* ===== ALERTS ===== */
.alert {
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.alert-success svg {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
}

/* ===== FOOTER ===== */
.reset-password-footer {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.back-to-login {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary-500);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.back-to-login:hover {
  color: var(--color-primary-400);
  background: rgba(59, 130, 246, 0.1);
}

.back-to-login svg {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.2s ease;
}

.back-to-login:hover svg {
  transform: translateX(-4px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .reset-password-card {
    padding: 2rem 1.5rem;
  }

  .reset-password-title {
    font-size: 1.5rem;
  }

  .reset-password-subtitle {
    font-size: 0.875rem;
  }
}
</style>
