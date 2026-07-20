<template>
  <div class="login-demo-page">
    <div class="demo-container">
      <h1>Demo Login Modal</h1>
      <p>Página de ejemplo para demostrar el uso del modal de login</p>

      <!-- Botón para abrir el modal -->
      <button class="btn-open-modal" @click="showLoginModal = true">
        <i class="fas fa-sign-in-alt"></i>
        Abrir Modal de Login
      </button>

      <!-- Panel de resultados -->
      <div v-if="loginResult" class="result-panel">
        <h3>Resultado del Login:</h3>
        <div class="result-item">
          <strong>Token:</strong>
          <code>{{ loginResult.token }}</code>
        </div>
        <div class="result-item">
          <strong>Refresh Token:</strong>
          <code>{{ loginResult.refreshToken }}</code>
        </div>
        <div class="result-item">
          <strong>Usuario:</strong>
          <pre>{{ JSON.stringify(loginResult.user, null, 2) }}</pre>
        </div>
      </div>

      <!-- Modal de Login -->
      <LoginModal
        :show="showLoginModal"
        @close="showLoginModal = false"
        @login-success="handleLoginSuccess"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LoginModal } from '@/components'

const showLoginModal = ref(false)
const loginResult = ref(null)

const handleLoginSuccess = (data) => {
  console.log('Login exitoso:', data)
  
  // Guardar los datos recibidos
  loginResult.value = {
    token: data.token,
    refreshToken: data.refreshToken,
    user: data.user
  }
  
  // Cerrar el modal
  showLoginModal.value = false
  
  // Aquí puedes usar los tokens como necesites
  // Por ejemplo, guardarlos en localStorage, enviarlos a otra API, etc.
}
</script>

<style scoped>
.login-demo-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
}

.demo-container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  color: #a0a0a0;
  margin-bottom: 2rem;
}

.btn-open-modal {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-open-modal:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.result-panel {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.result-panel h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
}

.result-item {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.result-item strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #a0a0a0;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.result-item code {
  display: block;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  color: #4ade80;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  word-break: break-all;
  white-space: pre-wrap;
}

.result-item pre {
  margin: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  color: #4ade80;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  white-space: pre-wrap;
}
</style>