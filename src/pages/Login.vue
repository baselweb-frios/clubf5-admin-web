<template>
  <div class="min-h-screen flex-center bg-dark-primary p-4">
    <div class="card-glass w-full max-w-md animate-scale-in">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple flex-center shadow-glow-primary">
          <span class="text-2xl font-bold text-white">C5</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
Bienvenido a ClubF5
</h2>
        <p class="text-text-secondary text-sm">
Inicia sesión para continuar
</p>
      </div>

      <!-- Form -->
      <form
class="space-y-5"
@submit.prevent="handleSubmit"
>
        <!-- Error Alert -->
        <div
v-if="error"
class="alert alert-danger"
>
          <svg
class="w-5 h-5 flex-shrink-0"
fill="currentColor"
viewBox="0 0 20 20"
>
            <path
fill-rule="evenodd"
d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
clip-rule="evenodd"
/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Username -->
        <div class="form-group">
          <label class="label">Usuario</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <svg
class="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
/>
              </svg>
            </span>
            <input
              v-model="form.username"
              type="text"
              class="input pl-10"
              :class="{ 'input-error': errors.username }"
              placeholder="Ingresa tu usuario"
              autocomplete="username"
              required
            >
          </div>
          <p
v-if="errors.username"
class="text-danger-400 text-xs mt-1"
>
{{ errors.username }}
</p>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="label">Contraseña</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <svg
class="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
/>
              </svg>
            </span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="input pl-10 pr-10"
              :class="{ 'input-error': errors.password }"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
              required
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="togglePasswordVisibility"
            >
              <svg
v-if="!showPassword"
class="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
/>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
/>
              </svg>
              <svg
v-else
class="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
/>
              </svg>
            </button>
          </div>
          <p
v-if="errors.password"
class="text-danger-400 text-xs mt-1"
>
{{ errors.password }}
</p>
        </div>

        <!-- Options -->
        <div class="flex-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer group">
            <input
              v-model="form.remember"
              type="checkbox"
              class="checkbox"
            >
            <span class="text-text-secondary group-hover:text-text-primary transition-colors">Recordarme</span>
          </label>
          <router-link
            to="/forgot-password"
            class="text-primary-400 hover:text-primary-300 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="loading"
        >
          <span
v-if="loading"
class="spinner"
/>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </button>
      </form>

      <!-- Footer -->
      <div class="mt-8 pt-6 border-t border-glass-border text-center">
        <p class="text-text-tertiary text-sm">
          ¿No tienes cuenta?
          <a
href="#"
class="text-primary-400 hover:text-primary-300 transition-colors font-medium"
>
            Contacta con soporte
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
/* No custom styles needed - using global classes from main.css */
</style>
