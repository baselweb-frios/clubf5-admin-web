<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-envelope mr-3 text-primary-400" />
          Banco de Pruebas de Email
        </h1>
        <p class="page-subtitle">
          Diagnostica y prueba el servicio de email (clubf5-email-service / Nodemailer)
        </p>
      </div>
      <div class="header-actions">
        <button
          class="btn btn-secondary"
          :disabled="checkingHealth"
          @click="checkHealth"
        >
          <i
            class="fas fa-heartbeat"
            :class="{ 'fa-spin': checkingHealth }"
          />
          Health Check
        </button>
      </div>
    </div>

    <!-- Status row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <!-- Microservicio status -->
      <div class="card flex items-center gap-4">
        <div
          :class="[
            'w-11 h-11 rounded-xl flex-center text-xl flex-shrink-0',
            serviceStatus === null ? 'bg-warning-500/20 text-warning-400' :
            serviceStatus ? 'bg-success-500/20 text-success-400' :
            'bg-danger-500/20 text-danger-400'
          ]"
        >
          <i class="fas fa-microchip" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-text-tertiary uppercase tracking-wide mb-0.5">
            Email Microservice
          </p>
          <p class="font-semibold text-text-primary truncate text-sm">
            {{ serviceUrl }}
          </p>
          <span
            :class="[
              'badge badge-sm mt-1',
              serviceStatus === null ? 'badge-warning' :
              serviceStatus ? 'badge-success' : 'badge-danger'
            ]"
          >
            <i
              :class="[
                'mr-1',
                serviceStatus === null ? 'fas fa-question' :
                serviceStatus ? 'fas fa-check' : 'fas fa-times'
              ]"
            />
            {{ serviceStatus === null ? 'Sin verificar' : serviceStatus ? 'Conectado' : 'No disponible' }}
          </span>
        </div>
      </div>

      <!-- Config items from API -->
      <div
        v-if="emailConfig"
        class="card flex items-center gap-4"
      >
        <div class="w-11 h-11 rounded-xl flex-center text-xl flex-shrink-0 bg-primary-500/20 text-primary-400">
          <i class="fas fa-cog" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-text-tertiary uppercase tracking-wide mb-0.5">
            Configuración API
          </p>
          <p class="font-semibold text-text-primary text-sm">
            {{ emailConfig.provider || 'Nodemailer' }}
          </p>
          <p class="text-xs text-text-secondary truncate">
            {{ emailConfig.from || emailConfig.smtpHost || '—' }}
          </p>
        </div>
      </div>
      <div
        v-else
        class="card flex items-center gap-4 opacity-50"
      >
        <div class="w-11 h-11 rounded-xl flex-center bg-dark-secondary text-text-tertiary text-xl flex-shrink-0">
          <i class="fas fa-cog" />
        </div>
        <div>
          <p class="text-xs text-text-tertiary uppercase tracking-wide mb-0.5">
            Configuración API
          </p>
          <p class="text-sm text-text-tertiary">
            No disponible
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="card flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex-center text-xl flex-shrink-0 bg-blue-500/20 text-blue-400">
          <i class="fas fa-history" />
        </div>
        <div>
          <p class="text-xs text-text-tertiary uppercase tracking-wide mb-0.5">
            Pruebas realizadas
          </p>
          <p class="text-2xl font-bold text-text-primary">
            {{ testResults.length }}
          </p>
          <p class="text-xs">
            <span class="text-success-400">{{ testResults.filter(r => r.success).length }} OK</span>
            <span class="text-text-tertiary mx-1">·</span>
            <span class="text-danger-400">{{ testResults.filter(r => !r.success).length }} error</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Main grid -->
    <div class="grid grid-cols-1 xl:grid-cols-5 gap-5">
      <!-- Form panel -->
      <div class="xl:col-span-2 card">
        <div class="flex items-center gap-3 mb-5 pb-4 border-b border-dark-border">
          <i class="fas fa-paper-plane text-primary-400 text-lg" />
          <h3 class="text-base font-semibold text-text-primary">
            Enviar Email de Prueba
          </h3>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="sendTestEmail"
        >
          <!-- Destino -->
          <div class="form-group">
            <label class="label">Email de Destino *</label>
            <div class="relative">
              <input
                v-model="testForm.toEmail"
                type="email"
                class="input pl-9"
                placeholder="ejemplo@correo.com"
                required
                :disabled="sending"
              >
              <i class="fas fa-at absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm" />
            </div>
          </div>

          <!-- Username -->
          <div class="form-group">
            <label class="label">Nombre de Usuario</label>
            <div class="relative">
              <input
                v-model="testForm.username"
                type="text"
                class="input pl-9"
                placeholder="Usuario de prueba"
                :disabled="sending"
              >
              <i class="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm" />
            </div>
          </div>

          <!-- Tipo de email -->
          <div class="form-group">
            <label class="label">Tipo de Email</label>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="opt in emailTypes"
                :key="opt.value"
                class="email-type-card"
                :class="{ 'email-type-card--active': testForm.testType === opt.value }"
              >
                <input
                  v-model="testForm.testType"
                  type="radio"
                  :value="opt.value"
                  class="sr-only"
                  :disabled="sending"
                >
                <i :class="[opt.icon, 'text-lg mb-1']" />
                <span class="text-xs font-semibold">{{ opt.label }}</span>
                <span class="text-[10px] text-text-tertiary leading-tight text-center">{{ opt.desc }}</span>
              </label>
            </div>
          </div>

          <!-- Campos condicionales -->
          <div
            v-if="testForm.testType === 'notification'"
            class="form-group"
          >
            <label class="label">Título</label>
            <input
              v-model="testForm.notificationTitle"
              type="text"
              class="input"
              placeholder="Título de la notificación"
              :disabled="sending"
            >
          </div>

          <div
            v-if="testForm.testType === 'notification' || testForm.testType === 'custom'"
            class="form-group"
          >
            <label class="label">{{ testForm.testType === 'custom' ? 'Contenido HTML' : 'Mensaje' }}</label>
            <textarea
              v-model="testForm.customMessage"
              class="input font-mono text-xs"
              :placeholder="testForm.testType === 'custom' ? '<h1>Mi email</h1><p>Contenido...</p>' : 'Escribe el mensaje...'"
              rows="4"
              :disabled="sending"
            />
          </div>

          <div
            v-if="testForm.testType === 'custom'"
            class="form-group"
          >
            <label class="label">Asunto</label>
            <input
              v-model="testForm.customSubject"
              type="text"
              class="input"
              placeholder="Asunto del email"
              :disabled="sending"
            >
          </div>

          <!-- Método de envío -->
          <div class="form-group">
            <label class="label">Enviar vía</label>
            <div class="flex gap-2">
              <label
                class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all flex-1 justify-center"
                :class="sendMethod === 'microservice' ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-dark-border text-text-secondary hover:border-dark-hover'"
              >
                <input
                  v-model="sendMethod"
                  type="radio"
                  value="microservice"
                  class="sr-only"
                >
                <i class="fas fa-microchip" />
                Microservicio
              </label>
              <label
                class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all flex-1 justify-center"
                :class="sendMethod === 'api' ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-dark-border text-text-secondary hover:border-dark-hover'"
              >
                <input
                  v-model="sendMethod"
                  type="radio"
                  value="api"
                  class="sr-only"
                >
                <i class="fas fa-server" />
                API Backend
              </label>
            </div>
            <p class="text-xs text-text-tertiary mt-1">
              <span v-if="sendMethod === 'microservice'">
                Llama directo a <code class="bg-dark-secondary px-1 rounded">{{ serviceUrl }}</code>
              </span>
              <span v-else>
                Llama a <code class="bg-dark-secondary px-1 rounded">/EmailTest/send</code> en el API
              </span>
            </p>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="sending || !testForm.toEmail"
          >
            <i
              class="fas"
              :class="sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'"
            />
            {{ sending ? 'Enviando...' : 'Enviar Email' }}
          </button>
        </form>
      </div>

      <!-- Results panel -->
      <div class="xl:col-span-3 card">
        <div class="flex items-center justify-between mb-5 pb-4 border-b border-dark-border">
          <div class="flex items-center gap-3">
            <i class="fas fa-history text-primary-400 text-lg" />
            <h3 class="text-base font-semibold text-text-primary">
              Historial de Pruebas
            </h3>
          </div>
          <button
            v-if="testResults.length > 0"
            class="btn btn-ghost btn-sm text-text-tertiary"
            @click="clearResults"
          >
            <i class="fas fa-trash" />
            Limpiar
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-if="testResults.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center gap-3"
        >
          <div class="w-14 h-14 rounded-full bg-dark-secondary flex-center text-text-tertiary">
            <i class="fas fa-inbox text-2xl" />
          </div>
          <p class="text-text-secondary font-medium">
            Sin resultados aún
          </p>
          <p class="text-text-tertiary text-sm">
            Envía un email de prueba para ver los resultados aquí
          </p>
        </div>

        <!-- Results list -->
        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="(result, index) in testResults"
            :key="index"
            class="rounded-xl border p-4 flex gap-3 transition-all"
            :class="result.success
              ? 'border-success-500/30 bg-success-500/5'
              : 'border-danger-500/30 bg-danger-500/5'"
          >
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-9 h-9 rounded-lg flex-center text-lg"
              :class="result.success ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400'"
            >
              <i :class="result.success ? 'fas fa-check' : 'fas fa-times'" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="font-semibold text-text-primary text-sm truncate">{{ result.toEmail }}</span>
                <span class="badge badge-sm bg-dark-secondary text-text-secondary">{{ result.testType }}</span>
                <span class="badge badge-sm bg-dark-secondary text-text-tertiary">{{ result.via }}</span>
              </div>
              <p
                class="text-sm mb-1"
                :class="result.success ? 'text-success-300' : 'text-danger-300'"
              >
                {{ result.message }}
              </p>
              <div class="flex flex-wrap gap-3 text-xs text-text-tertiary">
                <span v-if="result.messageId">
                  <i class="fas fa-tag mr-1" />{{ result.messageId }}
                </span>
                <span>
                  <i class="fas fa-clock mr-1" />{{ formatTimestamp(result.timestamp) }}
                </span>
                <span v-if="result.elapsedMs">
                  <i class="fas fa-stopwatch mr-1" />{{ result.elapsedMs }}ms
                </span>
              </div>
              <details
                v-if="result.errorDetails"
                class="mt-2"
              >
                <summary class="text-xs text-text-tertiary cursor-pointer hover:text-text-secondary">
                  <i class="fas fa-chevron-right mr-1" />Ver detalles del error
                </summary>
                <pre class="mt-2 p-3 bg-dark-secondary rounded-lg text-xs text-danger-300 overflow-x-auto whitespace-pre-wrap break-all">{{ result.errorDetails }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import EmailApiService from '@/services/EmailApiService'
import emailTestService from '@/services/EmailTestServices'

const serviceUrl = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:3001'
const serviceStatus = ref(null)
const checkingHealth = ref(false)
const emailConfig = ref(null)
const sendMethod = ref('microservice')

const emailTypes = [
  { value: 'welcome', label: 'Bienvenida', icon: 'fas fa-user-plus text-primary-400', desc: 'Alta de usuario' },
  { value: 'reset', label: 'Recuperación', icon: 'fas fa-key text-warning-400', desc: 'Reset de password' },
  { value: 'notification', label: 'Notificación', icon: 'fas fa-bell text-blue-400', desc: 'Personalizada' },
  { value: 'custom', label: 'HTML libre', icon: 'fas fa-code text-purple-400', desc: 'Contenido libre' }
]

const testForm = ref({
  toEmail: '',
  username: 'Usuario de Prueba',
  testType: 'welcome',
  notificationTitle: 'Notificación de Prueba',
  customMessage: '',
  customSubject: 'Email de Prueba - ClubF5'
})

const sending = ref(false)
const testResults = ref([])

const checkHealth = async () => {
  checkingHealth.value = true
  try {
    serviceStatus.value = await EmailApiService.healthCheck()
  } catch {
    serviceStatus.value = false
  } finally {
    checkingHealth.value = false
  }
}

const loadConfig = async () => {
  try {
    emailConfig.value = await emailTestService.getEmailConfig()
  } catch {
    emailConfig.value = null
  }
}

const sendTestEmail = async () => {
  sending.value = true
  const startTime = Date.now()
  const { toEmail, username, testType, notificationTitle, customMessage, customSubject } = testForm.value
  const user = username || 'Usuario'

  try {
    let result

    if (sendMethod.value === 'api') {
      // Via API backend
      const payload = {
        toEmail,
        testType,
        customMessage: customMessage || undefined,
        subject: customSubject || undefined
      }
      result = await emailTestService.sendTestEmail(payload)
    } else {
      // Via microservice directo
      switch (testType) {
        case 'welcome':
          result = await EmailApiService.sendWelcome(toEmail, user)
          break
        case 'reset':
          result = await EmailApiService.sendPasswordReset(toEmail, user, 'test-token-' + Date.now())
          break
        case 'notification':
          result = await EmailApiService.sendNotification(
            toEmail,
            user,
            notificationTitle || 'Notificación',
            customMessage || 'Este es un mensaje de prueba desde el banco de pruebas de email.'
          )
          break
        case 'custom':
          result = await EmailApiService.sendCustomEmail(
            toEmail,
            customSubject || 'Email de Prueba',
            customMessage || '<h1>Email de Prueba</h1><p>Este es un email de prueba desde el banco de pruebas.</p>'
          )
          break
        default:
          throw new Error('Tipo de email no soportado')
      }
    }

    testResults.value.unshift({
      success: result.success !== false,
      message: result.success !== false ? (result.message || 'Email enviado correctamente') : (result.error || 'Error desconocido'),
      messageId: result.messageId,
      elapsedMs: result.elapsedMs ?? (Date.now() - startTime),
      toEmail,
      testType,
      via: sendMethod.value === 'api' ? 'API' : 'Microservicio',
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    testResults.value.unshift({
      success: false,
      message: err.message || 'Error al enviar el email',
      elapsedMs: Date.now() - startTime,
      toEmail,
      testType,
      via: sendMethod.value === 'api' ? 'API' : 'Microservicio',
      timestamp: new Date().toISOString(),
      errorDetails: err.toString()
    })
  } finally {
    sending.value = false
  }
}

const clearResults = () => {
  testResults.value = []
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

onMounted(() => {
  checkHealth()
  loadConfig()
})
</script>

<style scoped>
.email-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0.75rem 0.5rem;
  border: 1.5px solid var(--color-dark-border, rgba(255,255,255,0.1));
  border-radius: 0.625rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  min-height: 76px;
}

.email-type-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
}

.email-type-card--active {
  border-color: var(--color-primary-500, #6366f1);
  background: rgba(99, 102, 241, 0.08);
}

.email-type-card--active span {
  color: #c7d2fe;
}
</style>
