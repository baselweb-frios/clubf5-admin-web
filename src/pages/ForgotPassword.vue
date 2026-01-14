<template>
  <div class="container-narrow card max-w-md mx-auto">
    <div class="flex flex-col items-center gap-3 mb-6">
      <div class="logo-icon bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center">
        <span class="font-bold">C5</span>
      </div>
      <h2 class="page-title text-center">Recuperar Contraseña</h2>
      <p class="text-text-secondary text-center">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña</p>
    </div>

    <!-- Success Message -->
    <div v-if="emailSent" class="alert alert-success">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <div>
        <p class="font-semibold">Correo enviado exitosamente</p>
        <p class="text-sm">Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
      </div>
    </div>

    <form v-if="!emailSent" class="space-y-4" @submit.prevent="handleSubmit">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="form-group">
        <base-input
          v-model="form.email"
          type="email"
          label="Correo Electrónico"
          placeholder="tu@email.com"
          icon="mail"
          required
          autocomplete="email"
          :error="errors.email"
        />
        <p v-if="errors.email" class="text-sm text-danger-400 mt-1">{{ errors.email }}</p>
      </div>

      <base-button type="submit" variant="primary" :loading="loading" :disabled="loading" class="btn btn-primary w-full">
        {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
      </base-button>
    </form>

    <div class="mt-4 text-center">
      <router-link to="/login" class="text-sm text-text-secondary flex items-center justify-center gap-2 hover:text-text-primary">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Volver al inicio de sesión
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmailApiService from '@/services/EmailApiService'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const emailSent = ref(false)

const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const validateForm = () => {
  errors.email = ''
  let isValid = true

  if (!form.email) {
    errors.email = 'El correo electrónico es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un correo electrónico válido'
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
     const htmlResp = await authStore.requestPasswordReset(form.email)
    let isSend = false
    if (htmlResp.length > 0) {
      isSend = await EmailApiService.sendCustomEmail(
        form.email,
        'Restablecimiento de Contraseña',
        htmlResp
      )
    }
    emailSent.value = isSend
  } catch (err) {
    error.value = err || 'Error al enviar el correo. Intenta nuevamente.'
    console.error('Password reset error:', err)
  } finally {
    loading.value = false
  }
}
</script>

