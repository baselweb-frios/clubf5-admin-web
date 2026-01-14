<template>
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
Mi Perfil
</h1>
        <p class="mt-2 text-sm text-gray-600">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <!-- Loading State -->
      <LoadingOverlay
v-if="isLoadingProfile"
message="Cargando perfil..."
/>

      <!-- Error State -->
      <div
        v-if="error"
        class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start"
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

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b border-gray-200">
          <nav
class="-mb-px flex space-x-8 px-6"
aria-label="Tabs"
>
            <button
              :class="[
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
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
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
              @click="activeTab = 'password'"
            >
              <i class="fas fa-lock mr-2" />
              Cambiar Contraseña
            </button>
          </nav>
        </div>

        <!-- Tab Content: Profile Information -->
        <div
v-show="activeTab === 'profile'"
class="p-6"
>
          <form
class="space-y-6"
@submit.prevent="handleUpdateProfile"
>
            <!-- Username (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                :value="profile.username"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              >
              <p class="mt-1 text-xs text-gray-500">
                El nombre de usuario no puede ser modificado
              </p>
            </div>

            <!-- Nombre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.nombre"
                type="text"
                required
                maxlength="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Juan Pérez"
              >
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                v-model="formData.email"
                type="email"
                maxlength="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="correo@ejemplo.com"
              >
            </div>

            <!-- Teléfono -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                v-model="formData.telefono"
                type="tel"
                maxlength="20"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="+54 11 1234-5678"
              >
            </div>

            <!-- Fecha de Nacimiento -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                v-model="formData.fechaNacimiento"
                type="date"
                style="color:black"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
            </div>

            <!-- Domicilio -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Domicilio
              </label>
              <input
                v-model="formData.domicilio"
                type="text"
                maxlength="200"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Av. Corrientes 1234"
              >
            </div>

            <!-- Localidad -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Localidad
              </label>
              <input
                v-model="formData.localidad"
                type="text"
                maxlength="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Buenos Aires"
              >
            </div>

            <!-- Campos específicos de Cliente -->
            <template v-if="profile.tipo === 'C'">
              <div class="border-t border-gray-200 pt-6 mt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                  <i class="fas fa-building mr-2" />
                  Configuración de Cliente
                </h3>

                <!-- Logo Upload -->
                <div class="mb-6">
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

                  <div class="flex items-start gap-6">
                    <!-- Preview del logo -->
                    <div class="flex-shrink-0">
                      <div
                        v-if="logoPreview || formData.logo"
                        class="relative w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50"
                      >
                        <img
                          :src="logoPreview || formData.logo"
                          alt="Logo preview"
                          class="w-full h-full object-contain"
                        >
                        <button
                          type="button"
                          class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                          title="Eliminar logo"
                          @click="removeLogo"
                        >
                          <i class="fas fa-times" />
                        </button>
                      </div>
                      <div
                        v-else
                        class="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
                      >
                        <i class="fas fa-image text-3xl text-gray-400" />
                      </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex-1">
                      <button
                        type="button"
                        :disabled="isUploadingLogo"
                        class="px-6 py-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        @click="triggerLogoUpload"
                      >
                        <i class="fas fa-upload mr-2" />
                        {{ logoPreview ? 'Cambiar imagen' : 'Seleccionar imagen' }}
                      </button>
                      <p class="mt-3 text-sm text-gray-500">
                        Formatos permitidos: JPG, PNG, GIF, WEBP
                      </p>
                      <p class="text-sm text-gray-500">
                        Tamaño máximo: 5MB
                      </p>
                      <p
v-if="logoFile"
class="mt-2 text-sm text-blue-600 font-medium"
>
                        <i class="fas fa-check-circle mr-1" />
                        {{ logoFile.name }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Frecuencia de Spots -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Frecuencia de Spots (minutos)
                    </label>
                    <input
                      v-model.number="formData.frecuenciaSpots"
                      type="number"
                      min="1"
                      max="60"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="15"
                    >
                    <p class="mt-1 text-xs text-gray-500">
                      Intervalo entre reproducciones de spots (1-60 minutos)
                    </p>
                  </div>

                  <!-- Día de Vencimiento del Paquete -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Día de Vencimiento del Paquete
                    </label>
                    <input
                      v-model.number="formData.diaVencimientoPaquete"
                      type="number"
                      min="1"
                      max="31"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="15"
                    >
                    <p class="mt-1 text-xs text-gray-500">
                      Día del mes en que vence tu paquete (1-31)
                    </p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Tipo y Estado (Read-only) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuario
                </label>
                <input
                  type="text"
                  :value="getTipoUsuarioLabel(profile.tipo)"
                  disabled
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  :value="profile.estado === 'A' ? 'Activo' : 'Inactivo'"
                  disabled
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                >
              </div>
            </div>

            <!-- Fecha de Alta (Read-only) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Miembro desde
              </label>
              <input
                type="text"
                :value="formatDate(profile.fechaAlta)"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              >
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                @click="resetForm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isUpdating"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
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
        <div
v-show="activeTab === 'password'"
class="p-6"
>
          <form
class="space-y-6"
@submit.prevent="handleChangePassword"
>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div class="flex">
                <i class="fas fa-info-circle text-blue-500 mt-0.5 mr-3" />
                <div class="text-sm text-blue-700">
                  <p class="font-medium">
Requisitos de contraseña:
</p>
                  <ul class="mt-2 space-y-1 list-disc list-inside">
                    <li>Mínimo 6 caracteres</li>
                    <li>Máximo 100 caracteres</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Contraseña Actual -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="passwordData.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="passwordData.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  maxlength="100"
                  class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="passwordData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  maxlength="100"
                  class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                class="mt-1 text-sm text-red-600"
              >
                Las contraseñas no coinciden
              </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                @click="resetPasswordForm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isChangingPassword || !isPasswordValid"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
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
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import profileService from '@/services/ProfileService'
import obsServices from '@/services/obsServices'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import moment from 'moment'

const router = useRouter()

// State
const activeTab = ref('profile')
const profile = ref({
  Username: '',
  Nombre: '',
  Email: '',
  Telefono: '',
  FechaNacimiento: null,
  Domicilio: '',
  Localidad: '',
  Tipo: '',
  Estado: '',
  FechaAlta: null,
  // Campos específicos de Cliente
  CodigoCliente: null,
  Logo: '',
  FrecuenciaSpots: null,
  DiaVencimientoPaquete: null
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
const loadProfile = async () => {

  isLoadingProfile.value = true
  error.value = null
  try {
    const data = await profileService.getMyProfile()
    console.log(data)
    profile.value = data

    // Populate form - Backend devuelve PascalCase
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
      formData.logo = data.logo || ''
      formData.frecuenciaSpots = data.frecuenciaSpots || null
      formData.diaVencimientoPaquete = data.diaVencimientoPaquete || null
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar el perfil'
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
    if (result.Profile) {
      profile.value = result.Profile
    }

    // Show success message
    window.$toast?.(result.Message || 'Perfil actualizado correctamente', 'success')

    // Reset logo upload state
    resetLogoUpload()

    // Reload profile
    await loadProfile()
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || 'Error al actualizar el perfil'
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

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>

