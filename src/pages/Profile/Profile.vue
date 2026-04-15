<template>
  <div class="page-wrapper">
    <!-- Header Section - Mobile First -->
    <div class="page-header">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
          <h1 class="text-lg sm:text-xl lg:text-2xl font-bold truncate">
            Mi Perfil
          </h1>
          <p class="text-xs sm:text-sm text-text-secondary hidden sm:block">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="page-content">
      <!-- Loading State -->
      <LoadingOverlay
        v-if="isLoadingProfile"
        message="Cargando perfil..."
      />

      <!-- Error State -->
      <div
        v-if="error"
        class="mb-6 bg-danger-500/10 border border-danger-500/30 rounded-lg p-4 flex items-start"
      >
        <svg
          class="w-5 h-5 text-danger-500 mt-0.5 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-danger-400">
            Error
          </h3>
          <p class="text-sm text-danger-300 mt-1">
            {{ error }}
          </p>
        </div>
      </div>

      <div
        v-if="!isLoadingProfile"
        class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <!-- Profile Card - Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-dark-secondary rounded-xl border border-dark-border overflow-hidden">
            <!-- Cover & Avatar -->
            <div class="relative">
              <!-- Cover gradient -->
              <div class="h-24 sm:h-32 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700" />
              
              <!-- Avatar -->
              <div class="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div class="relative group">
                  <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-dark-secondary overflow-hidden bg-dark-primary shadow-xl">
                    <img
                      v-if="logoPreview || formData.logo"
                      :src="logoPreview || formData.logo"
                      alt="Avatar"
                      class="w-full h-full object-cover"
                    >
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/30 to-primary-700/30"
                    >
                      <svg
                        class="w-12 h-12 sm:w-14 sm:h-14 text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Edit overlay -->
                  <button
                    type="button"
                    class="absolute inset-0 w-full h-full rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    :disabled="isUploadingLogo"
                    @click="triggerLogoUpload"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  
                  <!-- Remove button -->
                  <button
                    v-if="logoPreview || formData.logo"
                    type="button"
                    class="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-danger-500 text-white flex items-center justify-center shadow-lg hover:bg-danger-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar foto"
                    @click.stop="removeLogo"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Hidden file input -->
              <input
                ref="logoInputRef"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                class="hidden"
                @change="handleLogoSelect"
              >
            </div>
            
            <!-- User info -->
            <div class="pt-14 pb-6 px-4 text-center">
              <h2 class="text-lg sm:text-xl font-bold text-text-primary truncate">
                {{ formData.nombre || 'Sin nombre' }}
              </h2>
              <p class="text-sm text-text-secondary mt-1">
                @{{ profile.username }}
              </p>
              
              <!-- Badges -->
              <div class="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span
                  :class="[
                    'badge text-xs',
                    profile.estado === 'A' ? 'badge-success' : 'badge-danger'
                  ]"
                >
                  {{ profile.estado === 'A' ? 'Activo' : 'Inactivo' }}
                </span>
                <span class="badge badge-primary text-xs">
                  {{ getTipoUsuarioLabel(profile.tipo) }}
                </span>
              </div>
              
              <!-- Quick stats -->
              <div class="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-dark-border">
                <div class="text-center">
                  <p class="text-xs text-text-secondary">
                    Miembro desde
                  </p>
                  <p class="text-sm font-semibold text-text-primary mt-1">
                    {{ formatDate(profile.fechaAlta) }}
                  </p>
                </div>
                <div
                  v-if="profile.tipo === 'C'"
                  class="text-center"
                >
                  <p class="text-xs text-text-secondary">
                    Frecuencia spots
                  </p>
                  <p class="text-sm font-semibold text-text-primary mt-1">
                    {{ formData.frecuenciaSpots || '-' }} min
                  </p>
                </div>
                <div
                  v-else
                  class="text-center"
                >
                  <p class="text-xs text-text-secondary">
                    Email
                  </p>
                  <p class="text-sm font-semibold text-text-primary mt-1 truncate">
                    {{ formData.email || '-' }}
                  </p>
                </div>
              </div>
              
              <!-- File selected indicator -->
              <div
                v-if="logoFile"
                class="mt-4 p-2 bg-primary-500/10 rounded-lg"
              >
                <p class="text-xs text-primary-400 flex items-center justify-center gap-1">
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ logoFile.name }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content - Tabs -->
        <div class="lg:col-span-2">
          <div class="bg-dark-secondary rounded-xl border border-dark-border overflow-hidden">
            <!-- Tabs Navigation -->
            <div class="border-b border-dark-border">
              <nav class="flex">
                <button
                  :class="[
                    'flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2',
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-400 bg-primary-500/5'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-dark-hover'
                  ]"
                  @click="activeTab = 'profile'"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span class="hidden sm:inline">Información</span>
                  <span class="sm:hidden">Info</span>
                </button>
                <button
                  :class="[
                    'flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2',
                    activeTab === 'password'
                      ? 'border-primary-500 text-primary-400 bg-primary-500/5'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-dark-hover'
                  ]"
                  @click="activeTab = 'password'"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span class="hidden sm:inline">Contraseña</span>
                  <span class="sm:hidden">Clave</span>
                </button>
              </nav>
            </div>

            <!-- Tab Content: Profile Information -->
            <div
              v-show="activeTab === 'profile'"
              class="p-4 sm:p-6"
            >
              <form
                class="space-y-5"
                @submit.prevent="handleUpdateProfile"
              >
                <!-- Username (Read-only) -->
                <div class="form-group">
                  <label class="label">
                    Usuario
                  </label>
                  <input
                    type="text"
                    :value="profile.username"
                    disabled
                    class="input bg-dark-primary/50 cursor-not-allowed"
                  >
                  <p class="text-xs text-text-secondary mt-1">
                    El nombre de usuario no puede ser modificado
                  </p>
                </div>

                <!-- Grid for form fields -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Nombre -->
                  <div class="form-group sm:col-span-2">
                    <label class="label">
                      Nombre Completo <span class="text-danger-500">*</span>
                    </label>
                    <input
                      v-model="formData.nombre"
                      type="text"
                      required
                      maxlength="100"
                      class="input"
                      placeholder="Juan Pérez"
                    >
                  </div>

                  <!-- Email -->
                  <div class="form-group">
                    <label class="label">
                      Correo Electrónico
                    </label>
                    <input
                      v-model="formData.email"
                      type="email"
                      maxlength="100"
                      class="input"
                      placeholder="correo@ejemplo.com"
                    >
                  </div>

                  <!-- Teléfono -->
                  <div class="form-group">
                    <label class="label">
                      Teléfono
                    </label>
                    <input
                      v-model="formData.telefono"
                      type="tel"
                      maxlength="20"
                      class="input"
                      placeholder="+54 11 1234-5678"
                    >
                  </div>

                  <!-- Fecha de Nacimiento -->
                  <div class="form-group">
                    <label class="label">
                      Fecha de Nacimiento
                    </label>
                    <input
                      v-model="formData.fechaNacimiento"
                      type="date"
                      class="input"
                    >
                  </div>

                  <!-- Localidad -->
                  <div class="form-group">
                    <label class="label">
                      Localidad
                    </label>
                    <input
                      v-model="formData.localidad"
                      type="text"
                      maxlength="100"
                      class="input"
                      placeholder="Buenos Aires"
                    >
                  </div>

                  <!-- Domicilio -->
                  <div class="form-group sm:col-span-2">
                    <label class="label">
                      Domicilio
                    </label>
                    <input
                      v-model="formData.domicilio"
                      type="text"
                      maxlength="200"
                      class="input"
                      placeholder="Av. Corrientes 1234"
                    >
                  </div>
                </div>

                <!-- Campos específicos de Cliente -->
                <template v-if="profile.tipo === 'C'">
                  <div class="border-t border-dark-border pt-5 mt-5">
                    <h3 class="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <svg
                        class="w-5 h-5 text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Configuración de Cliente
                    </h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <!-- Frecuencia de Spots -->
                      <div class="form-group">
                        <label class="label">
                          Frecuencia de Spots (minutos)
                        </label>
                        <input
                          v-model.number="formData.frecuenciaSpots"
                          type="number"
                          min="1"
                          max="60"
                          class="input"
                          placeholder="15"
                        >
                        <p class="text-xs text-text-secondary mt-1">
                          Intervalo entre spots (1-60 min)
                        </p>
                      </div>

                      <!-- Día de Vencimiento -->
                      <div class="form-group">
                        <label class="label">
                          Día Vencimiento Paquete
                        </label>
                        <input
                          v-model.number="formData.diaVencimientoPaquete"
                          type="number"
                          min="1"
                          max="31"
                          class="input"
                          placeholder="15"
                        >
                        <p class="text-xs text-text-secondary mt-1">
                          Día del mes (1-31)
                        </p>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Actions -->
                <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-dark-border">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="resetForm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="isUpdating"
                    class="btn btn-primary"
                  >
                    <LoadingSpinner
                      v-if="isUpdating"
                      class="mr-2"
                      size="sm"
                    />
                    <svg
                      v-else
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {{ isUpdating ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Tab Content: Change Password -->
            <div
              v-show="activeTab === 'password'"
              class="p-4 sm:p-6"
            >
              <form
                class="space-y-5"
                @submit.prevent="handleChangePassword"
              >
                <!-- Info box -->
                <div class="p-4 bg-info-500/10 border border-info-500/30 rounded-lg">
                  <div class="flex gap-3">
                    <svg
                      class="w-5 h-5 text-info-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div class="text-sm text-info-300">
                      <p class="font-medium text-info-400">
                        Requisitos de contraseña:
                      </p>
                      <ul class="mt-2 space-y-1 list-disc list-inside text-xs">
                        <li>Mínimo 6 caracteres</li>
                        <li>Máximo 100 caracteres</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Contraseña Actual -->
                <div class="form-group">
                  <label class="label">
                    Contraseña Actual <span class="text-danger-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordData.currentPassword"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      required
                      class="input pr-10"
                      placeholder="••••••••"
                    >
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                      @click="showCurrentPassword = !showCurrentPassword"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          v-if="showCurrentPassword"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          v-if="!showCurrentPassword"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Nueva Contraseña -->
                <div class="form-group">
                  <label class="label">
                    Nueva Contraseña <span class="text-danger-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordData.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      required
                      minlength="6"
                      maxlength="100"
                      class="input pr-10"
                      placeholder="••••••••"
                    >
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          v-if="showNewPassword"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          v-if="!showNewPassword"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Confirmar Nueva Contraseña -->
                <div class="form-group">
                  <label class="label">
                    Confirmar Nueva Contraseña <span class="text-danger-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordData.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      required
                      minlength="6"
                      maxlength="100"
                      class="input pr-10"
                      :class="{
                        'border-danger-500 focus:ring-danger-500': passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                      }"
                      placeholder="••••••••"
                    >
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          v-if="showConfirmPassword"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                        <path
                          v-else
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          v-if="!showConfirmPassword"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                  <p
                    v-if="passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword"
                    class="mt-1 text-xs text-danger-400 flex items-center gap-1"
                  >
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Las contraseñas no coinciden
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t border-dark-border">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="resetPasswordForm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="isChangingPassword || !isPasswordValid"
                    class="btn btn-primary"
                  >
                    <LoadingSpinner
                      v-if="isChangingPassword"
                      class="mr-2"
                      size="sm"
                    />
                    <svg
                      v-else
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                    {{ isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
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

