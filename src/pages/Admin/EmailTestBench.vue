<template>
  <div class="email-test-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fa fa-envelope" />
          Banco de Pruebas de Email
        </h1>
        <p class="page-subtitle">
          Diagnostica y prueba el servicio de email (Node.js/Nodemailer)
        </p>
      </div>
      <div class="header-actions">
        <button
          class="btn btn-outline"
          :disabled="checkingHealth"
          @click="checkHealth"
        >
          <i
            class="fa fa-heartbeat"
            :class="{ 'fa-spin': checkingHealth }"
          />
          Health Check
        </button>
      </div>
    </div>

    <!-- Service Status Card -->
    <div class="config-card">
      <div class="card-header">
        <h3><i class="fa fa-server" /> Estado del Servicio de Email</h3>
      </div>
      <div class="card-body">
        <div class="config-grid">
          <div class="config-item">
            <span class="config-label">Servicio</span>
            <span class="config-value">clubf5-email-service (Nodemailer)</span>
          </div>
          <div class="config-item">
            <span class="config-label">URL</span>
            <span class="config-value">{{ serviceUrl }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">Estado</span>
            <span class="config-value">
              <span
                v-if="serviceStatus === null"
                class="badge badge-warning"
              >
                <i class="fa fa-question" /> Sin verificar
              </span>
              <span
                v-else-if="serviceStatus"
                class="badge badge-success"
              >
                <i class="fa fa-check" /> Conectado
              </span>
              <span
                v-else
                class="badge badge-danger"
              >
                <i class="fa fa-times" /> No disponible
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Form -->
    <div class="test-card">
      <div class="card-header">
        <h3><i class="fa fa-paper-plane" /> Enviar Email de Prueba</h3>
      </div>
      <div class="card-body">
        <form
          class="test-form"
          @submit.prevent="sendTestEmail"
        >
          <div class="form-row">
            <div class="form-group">
              <label for="toEmail">Email de Destino *</label>
              <input
                id="toEmail"
                v-model="testForm.toEmail"
                type="email"
                placeholder="ejemplo@correo.com"
                required
                :disabled="sending"
              >
            </div>
            <div class="form-group">
              <label for="username">Nombre de Usuario</label>
              <input
                id="username"
                v-model="testForm.username"
                type="text"
                placeholder="Usuario de prueba"
                :disabled="sending"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Tipo de Email</label>
            <div class="test-type-options">
              <label
                class="test-type-option"
                :class="{ active: testForm.testType === 'welcome' }"
              >
                <input
                  v-model="testForm.testType"
                  type="radio"
                  value="welcome"
                  :disabled="sending"
                >
                <div class="option-content">
                  <i class="fa fa-user-plus" />
                  <span class="option-title">Bienvenida</span>
                  <span class="option-desc">Email de bienvenida al sistema</span>
                </div>
              </label>
              <label
                class="test-type-option"
                :class="{ active: testForm.testType === 'reset' }"
              >
                <input
                  v-model="testForm.testType"
                  type="radio"
                  value="reset"
                  :disabled="sending"
                >
                <div class="option-content">
                  <i class="fa fa-key" />
                  <span class="option-title">Recuperacion</span>
                  <span class="option-desc">Email de reset de password</span>
                </div>
              </label>
              <label
                class="test-type-option"
                :class="{ active: testForm.testType === 'notification' }"
              >
                <input
                  v-model="testForm.testType"
                  type="radio"
                  value="notification"
                  :disabled="sending"
                >
                <div class="option-content">
                  <i class="fa fa-bell" />
                  <span class="option-title">Notificacion</span>
                  <span class="option-desc">Notificacion personalizada</span>
                </div>
              </label>
              <label
                class="test-type-option"
                :class="{ active: testForm.testType === 'custom' }"
              >
                <input
                  v-model="testForm.testType"
                  type="radio"
                  value="custom"
                  :disabled="sending"
                >
                <div class="option-content">
                  <i class="fa fa-code" />
                  <span class="option-title">Personalizado</span>
                  <span class="option-desc">Email con contenido libre</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Campos adicionales segun tipo -->
          <div
            v-if="testForm.testType === 'notification'"
            class="form-row"
          >
            <div class="form-group">
              <label for="notificationTitle">Titulo de la Notificacion</label>
              <input
                id="notificationTitle"
                v-model="testForm.notificationTitle"
                type="text"
                placeholder="Titulo de la notificacion"
                :disabled="sending"
              >
            </div>
          </div>

          <div
            v-if="testForm.testType === 'notification' || testForm.testType === 'custom'"
            class="form-group"
          >
            <label for="customMessage">{{ testForm.testType === 'custom' ? 'Contenido HTML' : 'Mensaje' }}</label>
            <textarea
              id="customMessage"
              v-model="testForm.customMessage"
              :placeholder="testForm.testType === 'custom' ? '<h1>Mi email personalizado</h1><p>Contenido...</p>' : 'Escribe el mensaje de la notificacion...'"
              rows="4"
              :disabled="sending"
            />
          </div>

          <div
            v-if="testForm.testType === 'custom'"
            class="form-group"
          >
            <label for="customSubject">Asunto del Email</label>
            <input
              id="customSubject"
              v-model="testForm.customSubject"
              type="text"
              placeholder="Asunto del email"
              :disabled="sending"
            >
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="sending || !testForm.toEmail || !serviceStatus"
            >
              <i
                v-if="sending"
                class="fa fa-spinner fa-spin"
              />
              <i
                v-else
                class="fa fa-paper-plane"
              />
              {{ sending ? 'Enviando...' : 'Enviar Email de Prueba' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Results -->
    <div
      v-if="testResults.length > 0"
      class="results-card"
    >
      <div class="card-header">
        <h3><i class="fa fa-history" /> Historial de Pruebas</h3>
        <button
          class="btn btn-sm btn-outline"
          @click="clearResults"
        >
          <i class="fa fa-trash" /> Limpiar
        </button>
      </div>
      <div class="card-body">
        <div class="results-list">
          <div
            v-for="(result, index) in testResults"
            :key="index"
            class="result-item"
            :class="{ success: result.success, error: !result.success }"
          >
            <div class="result-icon">
              <i :class="result.success ? 'fa fa-check-circle' : 'fa fa-times-circle'" />
            </div>
            <div class="result-content">
              <div class="result-header">
                <span class="result-email">{{ result.toEmail }}</span>
                <span class="result-type badge">{{ result.testType }}</span>
              </div>
              <div class="result-message">
                {{ result.message }}
              </div>
              <div class="result-meta">
                <span v-if="result.messageId"><i class="fa fa-tag" /> {{ result.messageId }}</span>
                <span><i class="fa fa-calendar" /> {{ formatTimestamp(result.timestamp) }}</span>
              </div>
              <div
                v-if="result.errorDetails"
                class="result-error-details"
              >
                <details>
                  <summary>Ver detalles del error</summary>
                  <pre>{{ result.errorDetails }}</pre>
                </details>
              </div>
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

const serviceUrl = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:3001'
const serviceStatus = ref(null)
const checkingHealth = ref(false)

const testForm = ref({
  toEmail: '',
  username: 'Usuario de Prueba',
  testType: 'welcome',
  notificationTitle: 'Notificacion de Prueba',
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

const sendTestEmail = async () => {
  sending.value = true

  try {
    let result
    const { toEmail, username, testType, notificationTitle, customMessage, customSubject } = testForm.value
    const user = username || 'Usuario'

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
          notificationTitle || 'Notificacion',
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

    testResults.value.unshift({
      success: result.success,
      message: result.success ? 'Email enviado correctamente' : result.error,
      messageId: result.messageId,
      toEmail,
      testType,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    testResults.value.unshift({
      success: false,
      message: err.message || 'Error al enviar el email',
      toEmail: testForm.value.toEmail,
      testType: testForm.value.testType,
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
  const date = new Date(timestamp)
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  checkHealth()
})
</script>

<style scoped>
.email-test-page {
  padding: var(--spacing-6);
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1d24 100%);
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-6);
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.page-title i {
  color: #60a5fa;
}

.page-subtitle {
  margin: var(--spacing-2) 0 0 0;
  color: #9ca3af;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

/* Cards */
.config-card,
.test-card,
.results-card {
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-5);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.card-header h3 i {
  color: #60a5fa;
}

.card-body {
  padding: var(--spacing-5);
}

/* Config Grid */
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.config-label {
  font-size: 0.8rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.config-value {
  font-size: 1rem;
  color: #e5e7eb;
  font-weight: 500;
}

.text-success {
  color: #22c55e;
}

.text-warning {
  color: #f59e0b;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-success {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.badge-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

/* Form */
.test-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #e5e7eb;
}

.form-group input,
.form-group textarea {
  padding: var(--spacing-3) var(--spacing-4);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #60a5fa;
  background: rgba(255, 255, 255, 0.08);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #6b7280;
}

.form-group input:disabled,
.form-group textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Test Type Options */
.test-type-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-3);
}

.test-type-option {
  display: block;
  cursor: pointer;
}

.test-type-option input {
  display: none;
}

.test-type-option .option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all 0.2s ease;
}

.test-type-option:hover .option-content {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.test-type-option.active .option-content {
  background: rgba(59, 130, 246, 0.1);
  border-color: #60a5fa;
}

.test-type-option .option-content i {
  font-size: 1.5rem;
  color: #9ca3af;
}

.test-type-option.active .option-content i {
  color: #60a5fa;
}

.option-title {
  font-weight: 600;
  color: #e5e7eb;
}

.option-desc {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-3);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: #e5e7eb;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: 0.8rem;
}

/* Results */
.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.result-item {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.result-item.success {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.result-item.error {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.result-icon {
  font-size: 1.5rem;
}

.result-item.success .result-icon {
  color: #22c55e;
}

.result-item.error .result-icon {
  color: #ef4444;
}

.result-content {
  flex: 1;
}

.result-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-1);
}

.result-email {
  font-weight: 600;
  color: #e5e7eb;
}

.result-type {
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

.result-message {
  color: #d1d5db;
  margin-bottom: var(--spacing-2);
}

.result-meta {
  display: flex;
  gap: var(--spacing-4);
  font-size: 0.8rem;
  color: #6b7280;
}

.result-meta span {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.result-error-details {
  margin-top: var(--spacing-3);
}

.result-error-details summary {
  cursor: pointer;
  color: #9ca3af;
  font-size: 0.85rem;
}

.result-error-details pre {
  margin-top: var(--spacing-2);
  padding: var(--spacing-3);
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  color: #ef4444;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .test-type-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
