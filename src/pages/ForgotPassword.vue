<template>
  <div class="forgot-password-card">
    <div class="forgot-password-header">
      <div class="logo-icon">
        <span>C5</span>
      </div>
      <h2 class="forgot-password-title">Recuperar Contraseña</h2>
      <p class="forgot-password-subtitle">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
      </p>
    </div>

    <!-- Success Message -->
    <div v-if="emailSent" class="alert alert-success">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <div>
        <p class="font-semibold">Correo enviado exitosamente</p>
        <p class="text-sm">Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
      </div>
    </div>

    <form v-if="!emailSent" @submit.prevent="handleSubmit" class="forgot-password-form">
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

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

      <base-button
        type="submit"
        variant="primary"
        :loading="loading"
        :disabled="loading"
        block
      >
        {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
      </base-button>
    </form>

    <div class="forgot-password-footer">
      <router-link to="/login" class="back-to-login">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
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
    await authStore.requestPasswordReset(form.email)
    emailSent.value = true
  } catch (err) {
    error.value = err || 'Error al enviar el correo. Intenta nuevamente.'
    console.error('Password reset error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ===== PREMIUM FORGOT PASSWORD CARD - DARK MODE ===== */
.forgot-password-card {
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

.forgot-password-card:hover {
  border-color: rgba(59, 130, 246, 0.2);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 30px 60px -15px rgba(0, 0, 0, 0.6),
    0 0 80px rgba(59, 130, 246, 0.25);
  transform: translateY(-4px);
}

/* ===== HEADER ===== */
.forgot-password-header {
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

.forgot-password-title {
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

.forgot-password-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.6;
}

/* ===== FORM ===== */
.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
.forgot-password-footer {
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
  .forgot-password-card {
    padding: 2rem 1.5rem;
  }

  .forgot-password-title {
    font-size: 1.5rem;
  }

  .forgot-password-subtitle {
    font-size: 0.875rem;
  }
}
</style>
