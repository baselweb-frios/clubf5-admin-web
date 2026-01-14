<template>
  <div class="page-wrapper">
    <!-- Radio List -->
    <radio-list
      :radios="radios"
      :loading="loading"
      @create="openCreateModal"
      @edit="openEditModal"
      @delete="handleDelete"
      @view-music="openMusicBrowser"
      @manage-relations="openRelationsManager"
    />

    <!-- Radio Form Modal -->
    <radio-form
      v-model:show="showFormModal"
      :radio="selectedRadio"
      @submit="handleSaveRadio"
    />

    <!-- Manage Radio Relations Modal -->
    <manage-radio-relations
      v-model:show="showRelationsModal"
      :radio="selectedRadio"
      @updated="handleRelationsUpdated"
    />

    <!-- OBS Music Browser Modal -->
    <obs-music-browser
      v-model:show="showMusicBrowser"
      :radio="selectedRadio"
    />

    <!-- Loading Overlay -->
    <loading-overlay v-if="processing" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import RadioList from './components/RadioList.vue'
import RadioForm from './components/RadioForm.vue'
import ManageRadioRelations from './components/ManageRadioRelations.vue'
import ObsMusicBrowser from './components/ObsMusicBrowser.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import RadioService from '@/services/RadioServices'
import obsServices from '@/services/obsServices'

const toast = useToast()

// State
const loading = ref(false)
const processing = ref(false)
const radios = ref([])

// Modals
const showFormModal = ref(false)
const showRelationsModal = ref(false)
const showMusicBrowser = ref(false)
const selectedRadio = ref(null)

// ========== CRUD Operations ==========

const loadRadios = async () => {
  try {
    loading.value = true
    const data = await RadioService.getAllRadios()
    console.log('=== loadRadios ===')
    console.log('Radios cargadas:', data)
    console.log('Primera radio (si existe):', data[0])
    console.log('Propiedades de la primera radio:', data[0] ? Object.keys(data[0]) : 'No hay radios')
    radios.value = data
  } catch (error) {
    console.error('Error al cargar radios:', error)
    toast('Error al cargar las radios', 'error')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedRadio.value = null
  showFormModal.value = true
}

const openEditModal = (radio) => {
  console.log('=== openEditModal ===')
  console.log('Radio recibida:', radio)
  console.log('Propiedades de radio:', radio ? Object.keys(radio) : 'radio es null/undefined')
  console.log('Código de radio:', radio?.rad_codigo)
  console.log('Nombre de radio:', radio?.rad_nombre)

  selectedRadio.value = { ...radio }
  console.log('selectedRadio.value después de asignar:', selectedRadio.value)

  showFormModal.value = true
}

const handleSaveRadio = async (radioData) => {
  try {
    processing.value = true

    if (radioData.rad_codigo) {
      // Editar radio existente
      await RadioService.modificarRadio(radioData)
      toast('Radio actualizada correctamente', 'success')
    } else {
      // Crear nueva radio
      await RadioService.crearRadio(radioData)
      toast('Radio creada correctamente', 'success')
    }

    await loadRadios()
    showFormModal.value = false
  } catch (error) {
    console.error('Error al guardar radio:', error)
    toast(error.response?.data?.message || 'Error al guardar la radio', 'error')
  } finally {
    processing.value = false
  }
}

const handleDelete = async (radio) => {
  if (!confirm(`¿Está seguro de eliminar la radio "${radio.rad_nombre}"?`)) {
    return
  }

  try {
    processing.value = true
    await RadioService.eliminarRadio(radio.rad_codigo)
    toast('Radio eliminada correctamente', 'success')
    await loadRadios()
  } catch (error) {
    console.error('Error al eliminar radio:', error)
    toast(error.response?.data?.message || 'Error al eliminar la radio', 'error')
  } finally {
    processing.value = false
  }
}

// ========== Relations Management ==========

const openRelationsManager = (radio) => {
  console.log('=== openRelationsManager ===')
  console.log('Radio recibida:', radio)
  selectedRadio.value = radio
  showRelationsModal.value = true
}

const handleRelationsUpdated = async () => {
  console.log('✅ Relaciones de radio actualizadas')
  toast('Configuración de la radio actualizada correctamente', 'success')
  showRelationsModal.value = false
}

// ========== OBS Integration ==========

const openMusicBrowser = (radio) => {
  selectedRadio.value = radio
  showMusicBrowser.value = true
}

const handleSyncObs = async () => {
  if (!confirm('¿Desea sincronizar las radios desde OBS Cloud? Esto puede crear nuevas radios basadas en las carpetas encontradas.')) {
    return
  }

  try {
    processing.value = true

    const result = await obsServices.SincronizarRadios()

    // Mostrar resultados
    let message = `Sincronización completada:\n`
    message += `- Carpetas en OBS: ${result.totalCarpetasObs}\n`
    message += `- Radios en DB: ${result.totalRadiosDb}\n`
    message += `- Radios agregadas: ${result.radiosAgregadas.length}\n`
    message += `- Radios existentes: ${result.radiosExistentes.length}`

    if (result.errores && result.errores.length > 0) {
      message += `\n- Errores: ${result.errores.length}`
      console.error('Errores durante sincronización:', result.errores)
    }

    toast(message, 'success', 5000)
    await loadRadios()
  } catch (error) {
    console.error('Error al sincronizar con OBS:', error)
    toast(error.response?.data?.message || 'Error al sincronizar las radios desde OBS Cloud', 'error')
  } finally {
    processing.value = false
  }
}

// ========== Lifecycle ==========

onMounted(() => {
  loadRadios()
})
</script>
