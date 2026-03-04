<template>
  <div class="page-wrapper">
    <div class="page-content space-y-6">
      <header class="page-header">
        <h1 class="page-title flex items-center gap-3">
          <i class="fas fa-cloud text-primary-400" />
          OBS API Console
        </h1>
        <p class="text-text-secondary light:text-text-light-secondary mt-2">
          Vista operativa para utilizar todas las funciones disponibles en
          <span class="font-semibold">obsServices</span>.
        </p>
      </header>

      <div class="card">
        <div class="flex flex-wrap gap-2">
          <button
            class="btn btn-secondary btn-sm"
            :class="{ 'btn-primary': activeTab === 'browse' }"
            @click="activeTab = 'browse'"
          >
            <i class="fas fa-folder-open" />
            Listado y búsqueda
          </button>
          <button
            class="btn btn-secondary btn-sm"
            :class="{ 'btn-primary': activeTab === 'transfer' }"
            @click="activeTab = 'transfer'"
          >
            <i class="fas fa-cloud-upload-alt" />
            Upload y descarga
          </button>
          <button
            class="btn btn-secondary btn-sm"
            :class="{ 'btn-primary': activeTab === 'ops' }"
            @click="activeTab = 'ops'"
          >
            <i class="fas fa-random" />
            Operaciones de objetos
          </button>
          <button
            class="btn btn-secondary btn-sm"
            :class="{ 'btn-primary': activeTab === 'utils' }"
            @click="activeTab = 'utils'"
          >
            <i class="fas fa-tools" />
            Utilidades y música
          </button>
        </div>
      </div>

      <ObsBrowsePanel
        v-if="activeTab === 'browse'"
        @result="handleResult"
        @error="handleError"
      />

      <ObsTransferPanel
        v-if="activeTab === 'transfer'"
        @result="handleResult"
        @error="handleError"
      />

      <ObsOperationsPanel
        v-if="activeTab === 'ops'"
        @result="handleResult"
        @error="handleError"
      />

      <ObsUtilitiesPanel
        v-if="activeTab === 'utils'"
        @result="handleResult"
        @error="handleError"
      />

      <div class="card">
        <div class="flex items-center justify-between gap-3 mb-3">
          <h2 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
            Consola de resultados
          </h2>
          <button
            class="btn btn-ghost btn-sm"
            @click="clearLogs"
          >
            <i class="fas fa-trash-alt" />
            Limpiar
          </button>
        </div>

        <div class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          <article
            v-for="entry in logs"
            :key="entry.id"
            class="p-3 rounded-lg border border-dark-border bg-dark-secondary light:border-light-border light:bg-light-secondary"
          >
            <div class="flex items-center justify-between gap-3 mb-2">
              <strong class="text-sm text-text-primary light:text-text-light-primary">{{ entry.action }}</strong>
              <span class="text-xs text-text-tertiary light:text-text-light-tertiary">{{ formatTime(entry.at) }}</span>
            </div>
            <pre class="text-xs overflow-auto text-text-secondary light:text-text-light-secondary">{{ pretty(entry.payload) }}</pre>
          </article>

          <div
            v-if="!logs.length"
            class="text-center text-text-secondary py-6"
          >
            Sin ejecuciones todavía.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ObsBrowsePanel from './components/ObsBrowsePanel.vue'
import ObsTransferPanel from './components/ObsTransferPanel.vue'
import ObsOperationsPanel from './components/ObsOperationsPanel.vue'
import ObsUtilitiesPanel from './components/ObsUtilitiesPanel.vue'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const activeTab = ref('browse')
const logs = ref([])

const pushLog = (entry, type = 'info') => {
  logs.value.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...entry
  })
  if (logs.value.length > 30) {
    logs.value = logs.value.slice(0, 30)
  }

  if (type === 'success') {
    toast(`${entry.action} ejecutado correctamente`, 'success')
  } else if (type === 'error') {
    toast(`Error en ${entry.action}`, 'error')
  }
}

const handleResult = ({ action, payload, at }) => {
  pushLog({ action, payload, at }, 'success')
}

const handleError = ({ action, error }) => {
  const payload = {
    message: error?.response?.data || error?.message || 'Error desconocido',
    status: error?.response?.status
  }
  pushLog({ action, payload, at: new Date().toISOString() }, 'error')
}

const clearLogs = () => {
  logs.value = []
}

const pretty = (value) => {
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

const formatTime = (isoDate) => {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleTimeString('es-AR')
}
</script>
