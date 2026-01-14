<template>
  <!-- Modal Overlay -->
  <transition name="modal-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="closeModal"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      <!-- Modal Container -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <transition name="modal-slide">
          <div
            v-if="isOpen"
            class="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl transform transition-all"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">
Mi Perfil
</h2>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                @click="closeModal"
              >
                <i class="fas fa-times text-xl" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <!-- Loading State -->
              <div
v-if="isLoadingProfile"
class="flex justify-center items-center py-12"
>
                <div class="text-center">
                  <LoadingSpinner size="lg" />
                  <p class="mt-4 text-gray-600">
Cargando perfil...
</p>
                </div>
              </div>

              <!-- Error State -->
              <div
                v-if="error"
                class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start"
              >
                <i class="fas fa-exclamation-circle text-red-500 mt-0.5 mr-3" />
                <div>
                  <h3 class="text-sm font-medium text-red-800">
Error
</h3>
                  <p class="text-sm text-red-700 mt-1">
{{ error }}
</p>
                </div>
              </div>

              <!-- Content -->
              <div v-if="!isLoadingProfile">
                <!-- Tabs -->
                <div class="border-b border-gray-200 mb-6">
                  <nav
class="-mb-px flex space-x-8"
aria-label="Tabs"
>
                    <button
                      :class="[
                        activeTab === 'profile'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors'
                      ]"
                      @click="activeTab = 'profile'"
                    >
                      <i class="fas fa-user mr-2" />
                      Información Personal
                    </button>
                    <button
                      :class="[
                        activeTab === 'password'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors'
                      ]"
                      @click="activeTab = 'password'"
                    >
                      <i class="fas fa-lock mr-2" />
                      Cambiar Contraseña
                    </button>
                  </nav>
                </div>

                <!-- Tab Content: Profile Information -->
                <div v-show="activeTab === 'profile'">
                  <form
class="space-y-4"
@submit.prevent="handleUpdateProfile"
>
                    <!-- Username (Read-only) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Usuario
                      </label>
                      <input
                        type="text"
                        :value="profile.username"
                        disabled
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      >
                      <p class="mt-1 text-xs text-gray-500">
                        El nombre de usuario no puede ser modificado
                      </p>
                    </div>

                    <!-- Nombre -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.nombre"
                        type="text"
                        required
                        maxlength="100"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Juan Pérez"
                      >
                    </div>

                    <!-- Email y Teléfono -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Correo Electrónico
                        </label>
                        <input
                          v-model="formData.email"
                          type="email"
                          maxlength="100"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="correo@ejemplo.com"
                        >
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono
                        </label>
                        <input
                          v-model="formData.telefono"
                          type="tel"
                          maxlength="20"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="+54 11 1234-5678"
                        >
                      </div>
                    </div>

                    <!-- Fecha de Nacimiento -->
                    <div v-if="false">
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        v-model="formData.fechaNacimiento"
                        type="date"
                        style="display:none;"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                    </div>

                    <!-- Domicilio y Localidad -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Domicilio
                        </label>
                        <input
                          v-model="formData.domicilio"
                          type="text"
                          maxlength="200"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Av. Corrientes 1234"
                        >
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Localidad
                        </label>
                        <input
                          v-model="formData.localidad"
                          type="text"
                          maxlength="100"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Buenos Aires"
                        >
                      </div>
                    </div>

                    <!-- Campos específicos de Cliente -->
                    <template v-if="profile.tipo === 'C'">
                      <div class="border-t border-gray-200 pt-4 mt-4">
                        <h4 class="text-sm font-medium text-gray-900 mb-3">
                          <i class="fas fa-building mr-2" />
                          Configuración de Cliente
                        </h4>

                        <!-- Logo Upload -->
                        <div class="mb-4">
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            Logo Empresarial
                          </label>

                          <!-- Input file oculto -->
                          <input
                            ref="logoInputRef"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            class="hidden"
                            @change="handleLogoSelect"
                          >

                          <div class="flex items-start gap-4">
                            <!-- Preview del logo -->
                            <div class="flex-shrink-0">
                              <div
                                v-if="logoPreview || formData.logo"
                                class="relative w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50"
                              >
                                <img
                                  :src="logoPreview || formData.logo"
                                  alt="Logo preview"
                                  class="w-full h-full object-contain"
                                >
                                <button
                                  type="button"
                                  class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                  title="Eliminar logo"
                                  @click="removeLogo"
                                >
                                  <i class="fas fa-times text-xs" />
                                </button>
                              </div>
                              <div
                                v-else
                                class="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
                              >
                                <i class="fas fa-image text-2xl text-gray-400" />
                              </div>
                            </div>

                            <!-- Botones de acción -->
                            <div class="flex-1">
                              <button
                                type="button"
                                :disabled="isUploadingLogo"
                                class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                @click="triggerLogoUpload"
                              >
                                <i class="fas fa-upload mr-2" />
                                {{ logoPreview ? 'Cambiar imagen' : 'Seleccionar imagen' }}
                              </button>
                              <p class="mt-2 text-xs text-gray-500">
                                Formatos: JPG, PNG, GIF, WEBP. Máx. 5MB
                              </p>
                              <p
v-if="logoFile"
class="mt-1 text-xs text-blue-600"
>
                                <i class="fas fa-check-circle mr-1" />
                                {{ logoFile.name }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <!-- Frecuencia de Spots -->
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                              Frecuencia de Spots (min)
                            </label>
                            <input
                              v-model.number="formData.frecuenciaSpots"
                              type="number"
                              min="1"
                              max="60"
                              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="15"
                            >
                            <p class="mt-1 text-xs text-gray-500">
                              Intervalo entre spots (1-60 min)
                            </p>
                          </div>

                          <!-- Día de Vencimiento del Paquete -->
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                              Día Venc. Paquete
                            </label>
                            <input
                              v-model.number="formData.diaVencimientoPaquete"
                              type="number"
                              min="1"
                              max="31"
                              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="15"
                            >
                            <p class="mt-1 text-xs text-gray-500">
                              Día del mes (1-31)
                            </p>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Información de solo lectura -->
                    <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span class="text-gray-600">Tipo de Usuario:</span>
                          <span class="ml-2 font-medium text-gray-600">{{ getTipoUsuarioLabel(profile.tipo) }}</span>
                        </div>
                        <div>
                          <span class="text-gray-600">Estado:</span>
                          <span class="ml-2 font-medium text-gray-600">{{ profile.estado === 'A' ? 'Activo' : 'Inactivo' }}</span>
                        </div>
                        <div class="col-span-2">
                          <span class="text-gray-600">Miembro desde:</span>
                          <span class="ml-2 font-medium text-gray-600">{{ formatDate(profile.fechaAlta) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        class="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        @click="resetForm"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        :disabled="isUpdating"
                        class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <LoadingSpinner
v-if="isUpdating"
class="mr-2"
size="sm"
/>
                        <i
v-else
class="fas fa-save mr-2"
/>
                        {{ isUpdating ? 'Guardando...' : 'Guardar Cambios' }}
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Tab Content: Change Password -->
                <div v-show="activeTab === 'password'">
                  <form
class="space-y-4"
@submit.prevent="handleChangePassword"
>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div class="flex">
                        <i class="fas fa-info-circle text-blue-500 mt-0.5 mr-3" />
                        <div class="text-sm text-blue-700">
                          <p class="font-medium">
Requisitos de contraseña:
</p>
                          <ul class="mt-1 space-y-1 list-disc list-inside text-xs">
                            <li>Mínimo 6 caracteres</li>
                            <li>Máximo 100 caracteres</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <!-- Contraseña Actual -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña Actual <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="passwordData.currentPassword"
                          :type="showCurrentPassword ? 'text' : 'password'"
                          required
                          class="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                        >
                        <button
                          type="button"
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          @click="showCurrentPassword = !showCurrentPassword"
                        >
                          <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" />
                        </button>
                      </div>
                    </div>

                    <!-- Nueva Contraseña -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="passwordData.newPassword"
                          :type="showNewPassword ? 'text' : 'password'"
                          required
                          minlength="6"
                          maxlength="100"
                          class="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                        >
                        <button
                          type="button"
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          @click="showNewPassword = !showNewPassword"
                        >
                          <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" />
                        </button>
                      </div>
                    </div>

                    <!-- Confirmar Nueva Contraseña -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nueva Contraseña <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="passwordData.confirmPassword"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          required
                          minlength="6"
                          maxlength="100"
                          class="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                        >
                        <button
                          type="button"
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          @click="showConfirmPassword = !showConfirmPassword"
                        >
                          <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" />
                        </button>
                      </div>
                      <p
                        v-if="passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword"
                        class="mt-1 text-xs text-red-600"
                      >
                        Las contraseñas no coinciden
                      </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        class="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        @click="resetPasswordForm"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        :disabled="isChangingPassword || !isPasswordValid"
                        class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <LoadingSpinner
v-if="isChangingPassword"
class="mr-2"
size="sm"
/>
                        <i
v-else
class="fas fa-key mr-2"
/>
                        {{ isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import profileService from '@/services/ProfileService'
import obsServices from '@/services/obsServices'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import moment from 'moment'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'updated'])

// State
const activeTab = ref('profile')
const profile = ref({
  username: '',
  nombre: '',
  email: '',
  telefono: '',
  fechaNacimiento: null,
  domicilio: '',
  localidad: '',
  tipo: '',
  estado: '',
  fechaAlta: null,
  // Campos específicos de Cliente
  codigoCliente: null,
  logo: '',
  frecuenciaSpots: null,
  diaVencimientoPaquete: null
})

const formData = reactive({
  nombre: '',
  email: '',
  telefono: '',
  fechaNacimiento: '',
  domicilio: '',
  localidad: '',
  // Campos específicos de Cliente
  logo: '',
  frecuenciaSpots: null,
  diaVencimientoPaquete: null
})

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isLoadingProfile = ref(false)
const isUpdating = ref(false)
const isChangingPassword = ref(false)
const error = ref(null)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Logo upload
const logoFile = ref(null)
const logoPreview = ref(null)
const isUploadingLogo = ref(false)
const logoInputRef = ref(null)

// Computed
const isPasswordValid = computed(() => {
  return (
    passwordData.currentPassword &&
    passwordData.newPassword &&
    passwordData.confirmPassword &&
    passwordData.newPassword === passwordData.confirmPassword &&
    passwordData.newPassword.length >= 6
  )
})

// Methods
const closeModal = () => {
  emit('close')
  // Reset form after close animation
  setTimeout(() => {
    activeTab.value = 'profile'
    resetPasswordForm()
  }, 300)
}

const loadProfile = async () => {
  isLoadingProfile.value = true
  error.value = null

  try {
    const data = await profileService.getMyProfile()
    profile.value = data

    // Populate form
    formData.nombre = data.nombre || ''
    formData.email = data.email || ''
    formData.telefono = data.telefono || ''
    formData.fechaNacimiento = data.fechaNacimiento
      ? moment(data.fechaNacimiento).format('YYYY-MM-DD')
      : ''
    formData.domicilio = data.domicilio || ''
    formData.localidad = data.localidad || ''

    // Campos específicos de Cliente
    if (data.tipo === 'C') {
      formData.logo = import.meta.env.VITE_ROOT_PATH_SPOTS + data.logo || ''
      formData.frecuenciaSpots = data.frecuenciaSpots || null
      formData.diaVencimientoPaquete = data.diaVencimientoPaquete || null
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.Message || 'Error al cargar el perfil'
    console.error('Error cargando perfil:', err)
  } finally {
    isLoadingProfile.value = false
  }
}

const handleUpdateProfile = async () => {
  isUpdating.value = true
  error.value = null

  try {
    // Si hay un archivo de logo seleccionado, subirlo primero
    if (logoFile.value && profile.value.tipo === 'C') {
      const uploadedLogoPath = await uploadLogo()
      if (uploadedLogoPath) {
        formData.logo = uploadedLogoPath
      }
    }

    const result = await profileService.updateMyProfile(formData)

    // Update profile with new data
    if (result.Profile || result.profile) {
      profile.value = result.Profile || result.profile
    }

    // Show success message
    window.$toast?.(result.Message || result.message || 'Perfil actualizado correctamente', 'success')

    // Reset logo upload state
    resetLogoUpload()

    // Emit updated event
    emit('updated')

    // Reload profile
    await loadProfile()
  } catch (err) {
    const errorMessage =
      err.response?.data?.Message || err.response?.data?.message || 'Error al actualizar el perfil'
    error.value = errorMessage
    window.$toast?.(errorMessage, 'error')
    console.error('Error actualizando perfil:', err)
  } finally {
    isUpdating.value = false
  }
}

const handleChangePassword = async () => {
  if (!isPasswordValid.value) {
    window.$toast?.('Por favor, verifica que las contraseñas coincidan', 'error')
    return
  }

  isChangingPassword.value = true
  error.value = null

  try {
    const result = await profileService.changePassword(passwordData)

    // Show success message
    window.$toast?.(result.Message || result.message || 'Contraseña actualizada correctamente', 'success')

    // Reset password form
    resetPasswordForm()

    // Switch to profile tab
    activeTab.value = 'profile'
  } catch (err) {
    const errorMessage =
      err.response?.data?.Message || err.response?.data?.message || 'Error al cambiar la contraseña'
    error.value = errorMessage
    window.$toast?.(errorMessage, 'error')
    console.error('Error cambiando contraseña:', err)
  } finally {
    isChangingPassword.value = false
  }
}

const resetForm = () => {
  formData.nombre = profile.value.nombre || ''
  formData.email = profile.value.email || ''
  formData.telefono = profile.value.telefono || ''
  formData.fechaNacimiento = profile.value.fechaNacimiento
    ? moment(profile.value.fechaNacimiento).format('YYYY-MM-DD')
    : ''
  formData.domicilio = profile.value.domicilio || ''
  formData.localidad = profile.value.localidad || ''

  // Campos específicos de Cliente
  if (profile.value.tipo === 'C') {
    formData.logo = profile.value.logo || ''
    formData.frecuenciaSpots = profile.value.frecuenciaSpots || null
    formData.diaVencimientoPaquete = profile.value.diaVencimientoPaquete || null
  }

  // Reset logo upload
  resetLogoUpload()
}

// Logo upload methods
const triggerLogoUpload = () => {
  logoInputRef.value?.click()
}

const handleLogoSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    window.$toast?.('Solo se permiten imágenes (JPG, PNG, GIF, WEBP)', 'error')
    return
  }

  // Validar tamaño (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    window.$toast?.('La imagen no debe superar los 5MB', 'error')
    return
  }

  logoFile.value = file

  // Crear preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const uploadLogo = async () => {
  if (!logoFile.value) return null

  isUploadingLogo.value = true
  try {
    const formDataUpload = new FormData()
    formDataUpload.append('file', logoFile.value)

    // Crear un nombre único para el archivo
    const extension = logoFile.value.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `logos/cliente_${profile.value.codigoCliente || 'temp'}_${timestamp}.${extension}`
    formDataUpload.append('filePath', fileName)

    const result = await obsServices.SubirFiles(formDataUpload)

    // El resultado debería ser la URL o path del archivo subido
    return result || fileName
  } catch (err) {
    console.error('Error subiendo logo:', err)
    window.$toast?.('Error al subir la imagen', 'error')
    throw err
  } finally {
    isUploadingLogo.value = false
  }
}

const removeLogo = () => {
  formData.logo = ''
  resetLogoUpload()
}

const resetLogoUpload = () => {
  logoFile.value = null
  logoPreview.value = null
  if (logoInputRef.value) {
    logoInputRef.value.value = ''
  }
}

const resetPasswordForm = () => {
  passwordData.currentPassword = ''
  passwordData.newPassword = ''
  passwordData.confirmPassword = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

const getTipoUsuarioLabel = (tipo) => {
  const tipos = {
    A: 'Administrador',
    C: 'Cliente',
    U: 'Usuario',
    R: 'Reproductor',
    O: 'Operador'
  }
  return tipos[tipo] || tipo
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return moment(date).format('DD/MM/YYYY')
}

// Watch for modal open
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadProfile()
  }
})
</script>

<style scoped>
/* ===== MODAL OVERLAY ===== */
.fixed.inset-0.z-50 {
  @apply z-modal;
}

/* Backdrop */
.fixed.inset-0.bg-black {
  @apply bg-black/60 backdrop-blur-sm;
}

/* ===== MODAL CONTAINER ===== */
.relative.w-full.max-w-3xl.bg-white {
  @apply bg-dark-tertiary rounded-2xl shadow-2xl;
  border-color: theme('colors.dark.border');
}

.light .relative.w-full.max-w-3xl.bg-white {
  @apply bg-light-elevated;
  border-color: theme('colors.light.border');
}

/* ===== MODAL HEADER ===== */
.border-gray-200 {
  border-color: theme('colors.dark.border');
}

.light .border-gray-200 {
  border-color: theme('colors.light.border');
}

.text-2xl.font-bold.text-gray-900 {
  @apply text-text-primary;
}

.light .text-2xl.font-bold.text-gray-900 {
  @apply text-text-light-primary;
}

/* Close Button */
.text-gray-400 {
  @apply text-text-tertiary;
}

.light .text-gray-400 {
  @apply text-text-light-tertiary;
}

/* ===== LOADING STATE ===== */
.text-gray-600 {
  @apply text-text-secondary;
}

.light .text-gray-600 {
  @apply text-text-light-secondary;
}

/* ===== ERROR STATE ===== */
.bg-red-50 {
  @apply bg-danger-500/10;
  border-color: theme('colors.danger.500 / 30%');
}

.text-red-500 {
  @apply text-danger-400;
}

.text-red-800 {
  @apply text-danger-300;
}

.text-red-700 {
  @apply text-danger-400;
}

/* ===== TABS ===== */
.text-gray-500 {
  @apply text-text-secondary;
}

.light .text-gray-500 {
  @apply text-text-light-secondary;
}

.border-blue-500.text-blue-600 {
  @apply text-primary-400;
  border-color: theme('colors.primary.500');
}

.light .border-blue-500.text-blue-600 {
  @apply text-primary-600;
}

/* ===== FORM ELEMENTS ===== */

/* Labels */
.text-gray-700 {
  @apply text-text-secondary;
}

.light .text-gray-700 {
  @apply text-text-light-secondary;
}

/* Input Fields */
input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
input[type="number"],
input[type="password"] {
  @apply bg-dark-secondary text-text-primary;
  @apply placeholder:text-text-tertiary;
  border-color: theme('colors.dark.border');
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus,
input[type="date"]:focus,
input[type="number"]:focus,
input[type="password"]:focus {
  border-color: theme('colors.primary.500');
  --tw-ring-color: theme('colors.primary.500');
}

.light input[type="text"],
.light input[type="email"],
.light input[type="tel"],
.light input[type="date"],
.light input[type="number"],
.light input[type="password"] {
  @apply bg-light-secondary text-text-light-primary;
  @apply placeholder:text-text-light-tertiary;
  border-color: theme('colors.light.border');
}

/* Disabled Input */
input:disabled {
  @apply bg-dark-tertiary text-text-tertiary cursor-not-allowed;
}

.light input:disabled {
  @apply bg-light-tertiary text-text-light-tertiary;
}

/* Helper Text */
.text-xs.text-gray-500 {
  @apply text-text-tertiary;
}

.light .text-xs.text-gray-500 {
  @apply text-text-light-tertiary;
}

/* ===== CLIENT CONFIG SECTION ===== */
.text-gray-900 {
  @apply text-text-primary;
}

.light .text-gray-900 {
  @apply text-text-light-primary;
}

/* Logo Preview */
.border-gray-200,
.border-gray-300 {
  border-color: theme('colors.dark.border');
}

.light .border-gray-200,
.light .border-gray-300 {
  border-color: theme('colors.light.border');
}

.bg-gray-50 {
  @apply bg-dark-secondary;
}

.light .bg-gray-50 {
  @apply bg-light-secondary;
}

/* Logo Remove Button */
.bg-red-500 {
  @apply bg-danger-500 hover:bg-danger-600;
}

/* Upload Button */
.bg-gray-100 {
  @apply bg-dark-elevated;
}

.bg-gray-100:hover {
  @apply bg-dark-hover;
}

.light .bg-gray-100 {
  @apply bg-light-secondary;
}

.light .bg-gray-100:hover {
  @apply bg-light-hover;
}

/* Logo Selected Text */
.text-blue-600 {
  @apply text-primary-400;
}

.light .text-blue-600 {
  @apply text-primary-600;
}

/* ===== INFO BOX (PASSWORD TAB) ===== */
.bg-blue-50 {
  @apply bg-info-500/10;
  border-color: theme('colors.info.500 / 30%');
}

.text-blue-500 {
  @apply text-info-400;
}

.text-blue-700 {
  @apply text-info-300;
}

.light .text-blue-700 {
  @apply text-info-700;
}

/* Password Mismatch Error */
.text-red-600 {
  @apply text-danger-400;
}

/* ===== BUTTONS ===== */

/* Primary Button */
.bg-blue-600 {
  @apply bg-primary-600;
}

.bg-blue-600:hover {
  @apply bg-primary-500;
}

.disabled\:bg-gray-400:disabled {
  @apply bg-dark-hover text-text-tertiary;
}

/* ===== TRANSITIONS ===== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  @apply transition-opacity duration-300 ease-apple;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  @apply opacity-0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  @apply transition-all duration-300 ease-apple;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  @apply opacity-0 scale-95;
}
</style>

