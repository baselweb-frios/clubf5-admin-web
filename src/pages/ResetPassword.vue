<template>
  <div class="container-narrow card max-w-md mx-auto">
    <div class="flex flex-col items-center gap-3 mb-6">
      <div class="logo-icon bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center">
        <span class="font-bold">C5</span>
      </div>
      <h2 class="page-title text-center">Restablecer Contraseña</h2>
      <p class="text-text-secondary text-center">Ingresa tu nueva contraseña</p>
    </div>

    <!-- Success Message -->
    <div v-if="passwordReset" class="alert alert-success">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <div>
        <p class="font-semibold">Contraseña actualizada exitosamente</p>
        <p class="text-sm">Ya puedes iniciar sesión con tu nueva contraseña.</p>
      </div>
    </div>

    <form v-if="!passwordReset" class="space-y-4" @submit.prevent="handleSubmit">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="relative form-group">
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
          class="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          @click="togglePasswordVisibility"
        >
          <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
          </svg>
        </button>
      </div>

      <div class="relative form-group">
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
          class="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon"
          :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          @click="toggleConfirmPasswordVisibility"
        >
          <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
          </svg>
        </button>
      </div>

      <!-- Password Strength Indicator -->
      <div>
        <div class="h-2 bg-dark-border rounded overflow-hidden">
          <div :class="`h-full rounded strength-${passwordStrength.level}`" :style="{ width: `${passwordStrength.percentage}%` }"></div>
        </div>
        <p class="text-sm mt-2">{{ passwordStrength.text }}</p>
      </div>

      <!-- Password Requirements -->
      <div>
        <p class="text-sm font-medium mb-2">La contraseña debe contener:</p>
        <ul class="space-y-2 text-sm text-text-secondary">
          <li :class="{ 'text-success-400': hasMinLength }" class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Al menos 8 caracteres
          </li>
          <li :class="{ 'text-success-400': hasUpperCase }" class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Una letra mayúscula
          </li>
          <li :class="{ 'text-success-400': hasLowerCase }" class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Una letra minúscula
          </li>
          <li :class="{ 'text-success-400': hasNumber }" class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Un número
          </li>
        </ul>
      </div>

      <base-button type="submit" variant="primary" :loading="loading" :disabled="loading || !isPasswordValid" class="btn btn-primary w-full">
        {{ loading ? 'Actualizando...' : 'Restablecer contraseña' }}
      </base-button>
    </form>

    <div class="mt-4 text-center">
      <router-link v-if="passwordReset" to="/login" class="text-sm text-text-secondary flex items-center justify-center gap-2 hover:text-text-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Ir al inicio de sesión
      </router-link>
      <router-link v-else to="/login" class="text-sm text-text-secondary flex items-center justify-center gap-2 hover:text-text-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
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
import EmailApiService from '@/services/EmailApiService'

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
    await EmailApiService.sendCustomEmail(
      authStore.userEmail,
      'Contraseña Restablecida',
      `<p>Tu contraseña ha sido restablecida exitosamente.</p>`
    )
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

