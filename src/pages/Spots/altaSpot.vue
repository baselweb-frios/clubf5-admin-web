<template>
  <div class="space-y-6">
    <loading-overlay
      :show="isLoading"
      opacity="0.85"
      color="#1d8cf8"
      height="95px"
      text="Procesando..."
    />

    <!-- Header Section -->
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <i class="fas fa-microphone-alt text-primary-400 text-xl" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-text-primary">
            {{ isEdit ? 'Editar Spot' : 'Nuevo Spot' }}
          </h1>
          <p class="text-sm text-text-secondary mt-1">
            {{ isEdit ? 'Modifica la información de tu spot publicitario' : 'Crea un nuevo spot publicitario para tu campaña' }}
          </p>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Información Básica -->
      <div class="card">
        <div class="flex items-center gap-2 mb-6">
          <i class="fas fa-info-circle text-primary-400" />
          <h3 class="text-lg font-semibold text-text-primary">Información del Spot</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="label flex items-center gap-2">
              <i class="fas fa-tag" />
              Nombre del Spot
            </label>
            <input
              v-model="spot.spo_nombre"
              type="text"
              class="input"
              placeholder="Ingrese el nombre del spot"
              required
            >
          </div>

          <div class="form-group">
            <label class="label flex items-center gap-2">
              <i class="fas fa-layer-group" />
              Tipo de Spot
            </label>
            <select v-model="spot.spo_tipo" class="select">
              <option
                v-for="tipo in tipoSpot"
                :key="tipo.value"
                :value="tipo.value"
              >
                {{ tipo.texto }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="label flex items-center gap-2">
              <i class="fas fa-calendar-plus" />
              Fecha de Inicio
            </label>
            <input
              v-model="spot.spo_fecini"
              type="date"
              class="input"
              required
            >
          </div>

          <div class="form-group">
            <label class="label flex items-center gap-2">
              <i class="fas fa-calendar-times" />
              Fecha de Finalización
            </label>
            <input
              v-model="spot.spo_fecfin"
              type="date"
              :disabled="spot.spo_tipo==='inst'"
              class="input"
              :class="{ 'opacity-50 cursor-not-allowed': spot.spo_tipo==='inst' }"
              :min="formatDateForInput(spot.spo_fecini)"
              required
            >
          </div>
        </div>
      </div>

      <!-- Audio Section -->
      <div class="card p-0 overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-dark-border">
          <div class="flex items-center gap-2">
            <i class="fas fa-music text-primary-400" />
            <h3 class="text-lg font-semibold text-text-primary">
              Archivo media Spot ({{ tipoMediaSpot.find(sp=>sp.value===spot.spo_mediaTipo)?.texto || 'Media' }})
            </h3>
          </div>
        </div>
        <div>
          <div class="flex flex-wrap border-b border-dark-border">
            <button
              class="flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-all border-b-2"
              :class="spot.spo_mediaTipo === 'audio' && activeTab !== 'ai' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-dark-hover'"
              @click="setMediaType('upload','audio')"
            >
              <i class="fas fa-upload mr-2" />
              Subir Audio
            </button>
            <button
              class="flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-all border-b-2"
              :class="spot.spo_mediaTipo === 'video' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-dark-hover'"
              @click="setMediaType('upload','video')"
            >
              <i class="fas fa-upload mr-2" />
              Subir Video
            </button>
            <button
              class="flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-all border-b-2"
              :class="activeTab === 'ai' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-dark-hover'"
              @click="setMediaType('ai','audio')"
            >
              <i class="fas fa-robot mr-2" />
              Generar con IA
            </button>
            <button
              class="flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-all border-b-2"
              :class="activeTab === 'stream' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-dark-hover'"
              @click="setMediaType('stream','streaming')"
            >
              <i class="fas fa-globe mr-2" />
              URL del stream
            </button>
          </div>



          <!-- stream Tab -->
          <div v-if="activeTab === 'stream'" class="p-4 sm:p-6">
            <div class="space-y-4">
              <div class="form-group">
                <label class="label flex items-center gap-2">
                  <i class="fas fa-link" />
                  URL del Stream
                  <i
                    class="fas fa-question-circle text-text-tertiary text-xs cursor-help"
                    title="Ingresa la URL completa del stream. Formatos soportados: HLS (.m3u8), DASH (.mpd), HTTP streams."
                  />
                </label>
                <div class="relative">
                  <i class="fas fa-globe absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    v-model="spot.spo_url"
                    type="url"
                    class="input pl-10 pr-10"
                    placeholder="https://ejemplo.com/stream.m3u8"
                    @blur="validateStreamUrl"
                    @input="streamUrlError = ''"
                  >
                  <button
                    v-if="spot.spo_url && spot.spo_url !== 'Formatos permitidos m3u8'"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    title="Limpiar URL"
                    @click="spot.spo_url = 'Formatos permitidos m3u8'; streamUrlError = ''"
                  >
                    <i class="fas fa-times-circle" />
                  </button>
                </div>
                <p v-if="streamUrlError" class="text-sm text-danger-400 mt-1 flex items-center gap-1">
                  <i class="fas fa-exclamation-triangle" />
                  {{ streamUrlError }}
                </p>
                <p v-else class="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                  <i class="fas fa-lightbulb text-warning-400" />
                  Formatos aceptados: .m3u8 (HLS), .mpd (DASH), URLs HTTP/HTTPS
                </p>
              </div>

              <!-- Stream Preview -->
              <div v-if="isValidStreamUrl" class="p-4 bg-dark-secondary rounded-lg border border-dark-border">
                <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                  <i class="fas fa-broadcast-tower text-success-400" />
                  Vista Previa del Stream
                </h4>
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-link text-text-tertiary" />
                    <span class="text-text-secondary">URL:</span>
                    <span class="text-text-primary truncate">{{ spot.spo_url }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-file-code text-text-tertiary" />
                    <span class="text-text-secondary">Tipo:</span>
                    <span class="text-text-primary">{{ getStreamType(spot.spo_url) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Upload Tab -->
          <div v-if="activeTab === 'upload'" class="p-4 sm:p-6">
            <div class="space-y-4">
              <input
                id="file-upload"
                ref="fileInput"
                type="file"
                :accept="spot.spo_mediaTipo === 'audio' ? 'audio/*,.mp3,.wav,.ogg,.aac,.flac' : 'video/*,.mp4,.webm,.ogg,.mov'"
                class="hidden"
                @change="handleFileUpload"
              >
              <label
                for="file-upload"
                class="block p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center"
                :class="fileValidationError ? 'border-danger-500 bg-danger-500/5' : 'border-dark-border hover:border-primary-500 hover:bg-primary-500/5'"
              >
                <div class="flex flex-col items-center gap-3">
                  <i
                    class="fas fa-cloud-upload-alt text-4xl"
                    :class="fileValidationError ? 'text-danger-400' : 'text-primary-400'"
                  />
                  <p v-if="spot.spo_mediaTipo=='audio'" class="text-text-primary font-medium">
                    Arrastra tu archivo de audio aquí o haz clic para seleccionar
                  </p>
                  <p v-if="spot.spo_mediaTipo=='video'" class="text-text-primary font-medium">
                    Arrastra tu archivo de video aquí o haz clic para seleccionar
                  </p>
                  <p v-if="spot.spo_mediaTipo=='audio'" class="text-sm text-text-tertiary">
                    Formatos soportados: MP3, WAV, OGG, AAC, FLAC (máx. 50MB)
                  </p>
                  <p v-if="spot.spo_mediaTipo=='video'" class="text-sm text-text-tertiary">
                    Formatos soportados: MP4, WebM, OGG, MOV (máx. 50MB)
                  </p>
                </div>
              </label>

              <!-- Validation Error -->
              <div v-if="fileValidationError" class="alert alert-danger">
                <i class="fas fa-exclamation-triangle" />
                {{ fileValidationError }}
              </div>

              <!-- File Info Preview -->
              <div v-if="file" class="flex items-center justify-between p-3 bg-dark-secondary rounded-lg border border-dark-border">
                <div class="flex items-center gap-3">
                  <i :class="spot.spo_mediaTipo === 'audio' ? 'fas fa-file-audio text-primary-400' : 'fas fa-file-video text-primary-400'" />
                  <span class="font-medium text-text-primary">{{ file.name }}</span>
                  <span class="text-sm text-text-tertiary">({{ formatFileSize(file.size) }})</span>
                </div>
                <button class="btn btn-ghost btn-sm btn-icon" @click="removeFile">
                  <i class="fas fa-times" />
                </button>
              </div>

              <!-- Media Preview Section -->
              <div v-if="filePreviewUrl" class="p-4 bg-dark-secondary rounded-lg border border-dark-border">
                <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                  <i :class="filePreviewType === 'audio' ? 'fas fa-headphones text-primary-400' : 'fas fa-video text-primary-400'" />
                  Vista Previa del {{ filePreviewType === 'audio' ? 'Audio' : 'Video' }}
                </h4>

                <!-- Audio Preview -->
                <div v-if="filePreviewType === 'audio'">
                  <audio ref="audiofile" :src="filePreviewUrl" controls class="w-full" />
                </div>

                <!-- Video Preview -->
                <div v-if="filePreviewType === 'video'">
                  <video :src="filePreviewUrl" controls class="w-full max-h-[300px] rounded-lg">
                    Tu navegador no soporta la reproducción de video.
                  </video>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Generation Tab -->
          <div v-if="activeTab === 'ai'" class="p-4 sm:p-6">
            <div class="space-y-6">
              <!-- Voice Filters Section -->
              <div class="p-4 bg-dark-secondary rounded-lg border border-dark-border">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <i class="fas fa-filter text-primary-400" />
                    Filtrar Voces
                    <span v-if="getActiveFiltersCount() > 0" class="badge badge-primary text-xs">
                      {{ getActiveFiltersCount() }}
                    </span>
                  </h4>
                  <button
                    v-if="getActiveFiltersCount() > 0"
                    class="btn btn-sm btn-ghost"
                    title="Limpiar todos los filtros"
                    @click="clearFilters"
                  >
                    <i class="fas fa-times" />
                    Limpiar
                  </button>
                </div>

                <!-- Search Filter -->
                <div class="form-group mb-4">
                  <div class="relative">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                      v-model="voiceFilters.search"
                      type="text"
                      class="input pl-10 pr-10"
                      placeholder="Buscar por nombre o descripción..."
                    >
                    <button
                      v-if="voiceFilters.search"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                      title="Limpiar búsqueda"
                      @click="voiceFilters.search = ''"
                    >
                      <i class="fas fa-times-circle" />
                    </button>
                  </div>
                </div>

                <!-- Filter Chips -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <!-- Gender Filter -->
                  <div v-if="availableFilters.genders.length > 0" class="form-group">
                    <label class="label text-xs flex items-center gap-1">
                      <i class="fas fa-venus-mars" />
                      Género
                    </label>
                    <select v-model="voiceFilters.gender" class="select text-sm">
                      <option value="all">Todos</option>
                      <option
                        v-for="gender in availableFilters.genders"
                        :key="gender"
                        :value="gender"
                      >
                        {{ gender === 'female' ? '♀ Femenino' : gender==='male'?'♂ Masculino':'♀♂ Neutral' }}
                      </option>
                    </select>
                  </div>

                  <!-- Accent Filter -->
                  <div v-if="availableFilters.accents.length > 0" class="form-group">
                    <label class="label text-xs flex items-center gap-1">
                      <i class="fas fa-globe-americas" />
                      Acento
                    </label>
                    <select v-model="voiceFilters.accent" class="select text-sm">
                      <option value="all">Todos</option>
                      <option
                        v-for="accent in availableFilters.accents"
                        :key="accent"
                        :value="accent"
                      >
                        {{ capitalizeFirst(accent) }}
                      </option>
                    </select>
                  </div>

                  <!-- Age Filter -->
                  <div v-if="availableFilters.ages.length > 0" class="form-group">
                    <label class="label text-xs flex items-center gap-1">
                      <i class="fas fa-birthday-cake" />
                      Edad
                    </label>
                    <select v-model="voiceFilters.age" class="select text-sm">
                      <option value="all">Todas</option>
                      <option
                        v-for="age in availableFilters.ages"
                        :key="age"
                        :value="age"
                      >
                        {{ capitalizeFirst(age) }}
                      </option>
                    </select>
                  </div>

                  <!-- Use Case Filter -->
                  <div v-if="availableFilters.useCases.length > 0" class="form-group">
                    <label class="label text-xs flex items-center gap-1">
                      <i class="fas fa-bullseye" />
                      Uso
                    </label>
                    <select v-model="voiceFilters.useCase" class="select text-sm">
                      <option value="all">Todos</option>
                      <option
                        v-for="useCase in availableFilters.useCases"
                        :key="useCase"
                        :value="useCase"
                      >
                        {{ capitalizeFirst(useCase) }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Results Count -->
                <div class="flex items-center gap-2 text-sm text-text-secondary">
                  <i class="fas fa-info-circle text-info-400" />
                  <span>
                    Mostrando <strong class="text-text-primary">{{ filteredVoices.length }}</strong> de <strong class="text-text-primary">{{ locutores.length }}</strong> voces
                  </span>
                </div>
              </div>

              <!-- Voice Selection -->
              <div class="form-group">
                <label class="label flex items-center gap-2">
                  <i class="fas fa-user-tie" />
                  Locutor Virtual
                  <i
                    class="fas fa-question-circle text-text-tertiary text-xs cursor-help"
                    title="Selecciona la voz que se utilizará para generar el audio."
                  />
                </label>
                <select v-model="selectedLoc" class="select" @change="onVoiceChange">
                  <option :value="null" disabled>
                    {{ filteredVoices.length === 0 ? 'No hay voces disponibles con estos filtros' : 'Seleccionar locutor...' }}
                  </option>
                  <option
                    v-for="locutor in filteredVoices"
                    :key="locutor.voice_id"
                    :value="locutor"
                  >
                    {{ locutor.name }}{{ getVoiceDisplayInfo(locutor) }}
                  </option>
                </select>
                <p v-if="filteredVoices.length === 0 && locutores.length > 0" class="text-sm text-warning-400 mt-1 flex items-center gap-1">
                  <i class="fas fa-exclamation-triangle" />
                  No se encontraron voces con los filtros seleccionados. Intenta ajustar los filtros.
                </p>
              </div>

              <!-- Voice Info Card -->
              <div v-if="selectedLoc" class="p-4 bg-dark-tertiary rounded-lg border border-dark-border">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-microphone text-primary-400" />
                    <span class="font-semibold text-text-primary">{{ selectedLoc.name }}</span>
                    <span v-if="selectedLoc.category" class="badge badge-info text-xs">
                      {{ selectedLoc.category }}
                    </span>
                  </div>
                  <button
                    class="btn btn-sm btn-secondary"
                    :disabled="isLoadingPreview"
                    title="Escuchar una muestra de cómo suena esta voz."
                    @click="playVoicePreview"
                  >
                    <i :class="isLoadingPreview ? 'fas fa-spinner fa-spin' : 'fas fa-play'" />
                    {{ isLoadingPreview ? 'Cargando...' : 'Preview' }}
                  </button>
                </div>

                <div v-if="selectedLoc.description" class="text-sm text-text-secondary mb-3">
                  {{ selectedLoc.description }}
                </div>

                <div class="space-y-2">
                  <div v-if="selectedLoc.labels" class="flex items-start gap-2">
                    <i class="fas fa-tags text-text-tertiary mt-0.5" />
                    <div class="flex-1">
                      <span class="text-xs text-text-tertiary">Características:</span>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span
                          v-for="(value, key) in selectedLoc.labels"
                          :key="key"
                          class="badge badge-secondary text-xs"
                        >
                          {{ key }}: {{ value }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="selectedLoc.high_quality_base_model_ids" class="flex items-center gap-2 text-sm">
                    <i class="fas fa-star text-warning-400" />
                    <span class="text-text-tertiary">Modelos compatibles:</span>
                    <span class="text-text-secondary">{{ selectedLoc.high_quality_base_model_ids.join(', ') }}</span>
                  </div>
                </div>

                <!-- Preview Audio Player -->
                <div v-if="previewAudioUrl" class="mt-3 pt-3 border-t border-dark-border">
                  <audio ref="previewAudio" :src="previewAudioUrl" controls class="w-full h-8" />
                </div>
              </div>

              <!-- Voice Settings -->
              <div v-if="selectedLoc" class="p-4 bg-dark-secondary rounded-lg border border-dark-border">
                <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-4">
                  <i class="fas fa-sliders-h text-primary-400" />
                  Configuración de Voz
                </h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Stability -->
                  <div class="form-group">
                    <label class="label text-sm flex items-center justify-between">
                      <span class="flex items-center gap-1">
                        Estabilidad
                        <i class="fas fa-question-circle text-text-tertiary text-xs cursor-help" title="Controla la consistencia de la voz." />
                      </span>
                      <span class="text-primary-400 font-mono">{{ voiceSettings.stability.toFixed(2) }}</span>
                    </label>
                    <input
                      v-model.number="voiceSettings.stability"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      class="w-full accent-primary-500"
                    >
                    <p class="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                      <i class="fas fa-lightbulb text-warning-400" />
                      Mayor estabilidad = voz más consistente
                    </p>
                  </div>

                  <!-- Similarity Boost -->
                  <div class="form-group">
                    <label class="label text-sm flex items-center justify-between">
                      <span class="flex items-center gap-1">
                        Similitud
                        <i class="fas fa-question-circle text-text-tertiary text-xs cursor-help" title="Qué tan fiel será la voz al modelo original." />
                      </span>
                      <span class="text-primary-400 font-mono">{{ voiceSettings.similarity_boost.toFixed(2) }}</span>
                    </label>
                    <input
                      v-model.number="voiceSettings.similarity_boost"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      class="w-full accent-primary-500"
                    >
                    <p class="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                      <i class="fas fa-lightbulb text-warning-400" />
                      Qué tan similar será al locutor original
                    </p>
                  </div>

                  <!-- Style -->
                  <div class="form-group">
                    <label class="label text-sm flex items-center justify-between">
                      <span class="flex items-center gap-1">
                        Estilo
                        <i class="fas fa-question-circle text-text-tertiary text-xs cursor-help" title="Controla la exageración emocional." />
                      </span>
                      <span class="text-primary-400 font-mono">{{ voiceSettings.style.toFixed(2) }}</span>
                    </label>
                    <input
                      v-model.number="voiceSettings.style"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      class="w-full accent-primary-500"
                    >
                    <p class="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                      <i class="fas fa-lightbulb text-warning-400" />
                      0 = neutral, 1 = muy expresivo
                    </p>
                  </div>

                  <!-- Speaker Boost -->
                  <div class="form-group">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input
                        v-model="voiceSettings.use_speaker_boost"
                        type="checkbox"
                        class="checkbox"
                      >
                      <span class="flex items-center gap-1 text-sm text-text-primary">
                        Mejora de Locutor
                        <i class="fas fa-question-circle text-text-tertiary text-xs cursor-help" title="Mejora calidad pero usa más caracteres." />
                      </span>
                    </label>
                    <p class="text-xs text-text-tertiary mt-1 flex items-center gap-1 ml-7">
                      <i class="fas fa-lightbulb text-warning-400" />
                      Mejora la similitud y calidad
                    </p>
                  </div>
                </div>

                <!-- Model Selection -->
                <div class="form-group mt-4">
                  <label class="label flex items-center gap-2">
                    <i class="fas fa-brain" />
                    Modelo de IA
                  </label>
                  <select v-model="voiceSettings.modelId" class="select">
                    <option value="eleven_multilingual_v2">🌍 Multilingual v2 (Recomendado para Español)</option>
                    <option value="eleven_turbo_v2_5">⚡ Turbo v2.5 (Rápido, buena calidad)</option>
                    <option value="eleven_flash_v2_5">🚀 Flash v2.5 (Ultra Rápido, menor latencia)</option>
                    <option value="eleven_monolingual_v1">🇺🇸 Monolingual v1 (Solo Inglés, alta calidad)</option>
                  </select>
                  <p class="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                    <i class="fas fa-lightbulb text-warning-400" />
                    <span v-if="voiceSettings.modelId === 'eleven_multilingual_v2'">Ideal para español</span>
                    <span v-else-if="voiceSettings.modelId === 'eleven_turbo_v2_5'">2x más rápido</span>
                    <span v-else-if="voiceSettings.modelId === 'eleven_flash_v2_5'">4x más rápido</span>
                    <span v-else>Solo inglés</span>
                  </p>
                </div>

                <!-- Preset Buttons -->
                <div class="mt-4 pt-4 border-t border-dark-border">
                  <h5 class="flex items-center gap-2 text-sm font-medium text-text-primary mb-3">
                    <i class="fas fa-magic text-primary-400" />
                    Presets Rápidos
                  </h5>
                  <div class="flex flex-wrap gap-2">
                    <button class="btn btn-sm btn-secondary" @click="applyPreset('balanced')">
                      <i class="fas fa-balance-scale" />
                      Balanceado
                    </button>
                    <button class="btn btn-sm btn-secondary" @click="applyPreset('expressive')">
                      <i class="fas fa-theater-masks" />
                      Expresivo
                    </button>
                    <button class="btn btn-sm btn-secondary" @click="applyPreset('stable')">
                      <i class="fas fa-anchor" />
                      Estable
                    </button>
                    <button class="btn btn-sm btn-ghost" @click="resetSettings">
                      <i class="fas fa-undo" />
                      Restaurar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Text Input -->
              <div class="form-group">
                <label class="label flex items-center gap-2">
                  <i class="fas fa-font" />
                  Texto a Convertir
                  <span class="text-xs text-text-tertiary">({{ MensajeSpot.length }}/{{ CarDispVoz }})</span>
                </label>
                <textarea
                  v-model="MensajeSpot"
                  class="input min-h-[150px]"
                  :maxlength="CarDispVoz"
                  placeholder="Escribe el texto que deseas convertir en audio..."
                  rows="6"
                />
                <p class="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                  <i class="fas fa-lightbulb text-warning-400" />
                  Caracteres restantes: <strong class="text-text-primary">{{ CarDispVoz - MensajeSpot.length }}</strong>
                </p>
              </div>

              <!-- Generate Actions -->
              <div class="flex flex-wrap items-center gap-4">
                <button
                  class="btn btn-primary"
                  :disabled="!selectedLoc || !MensajeSpot.trim() || isLoading"
                  @click="generarVoz()"
                >
                  <i class="fas fa-magic" />
                  Generar Audio con IA
                </button>
                <div v-if="CarDispVoz > 0" class="flex items-center gap-2 text-sm text-text-secondary">
                  <i class="fas fa-info-circle text-info-400" />
                  Caracteres disponibles: {{ CarDispVoz }}
                </div>
              </div>

              <!-- Audio Preview for AI Generated Audio -->
              <div v-if="filePreviewUrl && filePreviewType === 'audio'" class="p-4 bg-dark-secondary rounded-lg border border-dark-border">
                <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                  <i class="fas fa-headphones text-success-400" />
                  Vista Previa del Audio Generado
                </h4>
                <audio :src="filePreviewUrl" controls class="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="card">
        <div class="flex flex-wrap gap-3">
          <button class="btn btn-primary" @click="guardar">
            <i class="fas fa-save" />
            {{ isEdit ? 'Actualizar Spot' : 'Guardar Spot' }}
          </button>
          <button class="btn btn-ghost" @click="btnCancelar">
            <i class="fas fa-times" />
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSpotsStore } from '@/stores/spots'
import { useToast } from '@/composables/useToast'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ElevenLabsService from '@/services/ElevenLabsService'
import { useAuthStore } from '@/stores/auth'
import { useSignalRAuth } from '@/composables/useSignalRAuth'
import moment from 'moment'

// Composables
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const spotsStore = useSpotsStore()
const signalR = useSignalRAuth()

// Refs
const fileInput = ref(null)
const audiofile = ref(null)
const previewAudio = ref(null)
const isLoading = ref(false)
const activeTab = ref('upload')
const file = ref(null)
const srcAudio = ref('')
const srcAudioLabel = ref('')
const audioDuration = ref('')
const idSpot = ref(route.params.idSpot)
const selectedLoc = ref(null)
const locutores = ref([])
const fechaInicio = ref('')
const fechaFin = ref('')
const MensajeSpot = ref('')
const CarDispVoz = ref(0)
const isEdit = ref(false)
const previewAudioUrl = ref(null)
const isLoadingPreview = ref(false)
const streamUrlError = ref('')
const isValidStreamUrl = ref(false)
const fileValidationError = ref('')
const filePreviewUrl = ref(null)
const filePreviewType = ref(null)

// Reactive objects
const spot = reactive({
  spo_codigo: -1,
  spo_nombre: null,
  spo_dursec: 0,
  spo_source: null,
  spo_fecini: null,
  spo_fecfin: null,
  spo_url: null,
  spo_tipo: null,
  spo_mediaTipo: 'audio',
  spo_usuario: JSON.parse(localStorage.user).unique_name || JSON.parse(localStorage.user).Nombre
})

const voiceSettings = reactive({
  stability: 0.75,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
  modelId: 'eleven_multilingual_v2'
})

const voiceFilters = reactive({
  search: '',
  gender: 'all',
  accent: 'all',
  age: 'all',
  useCase: 'all'
})

const availableFilters = reactive({
  genders: [],
  accents: [],
  ages: [],
  useCases: []
})

const notificacion = reactive({
  mensaje: '',
  tipo: 'error'
})

const notifications = reactive({
  topCenter: false
})

// Static data
const i18labels = t('modulo_spots.biblioteca_spots.alta_spot')
const textos = {
  title: i18labels.titulo,
  alertOk: i18labels.mensajeAlertaOk,
  mensajeAlertaEditOk: i18labels.mensajeAlertaEditOk
}

const type = ['', 'danger', 'success']
const notifIconExc = 'tim-icons icon-alert-circle-exc'
const notifIconOk = 'tim-icons icon-check-2'
const idHistory = ''

const tipoSpot = [
  { texto: 'Institucional', value: 'inst' },
  { texto: 'Noticias', value: 'noti' },
  { texto: 'Promocional', value: 'prom' }
]

const tipoMediaSpot = [
  { texto: 'Audio', value: 'audio' },
  { texto: 'Video', value: 'video' },
  { texto: 'Audio/Video online (Stream)', value: 'streaming' }
]

// Computed
const filteredVoices = computed(() => {
  if (!locutores.value || locutores.value.length === 0) return []

  return locutores.value.filter(voice => {
    // Search filter
    if (voiceFilters.search) {
      const searchTerm = voiceFilters.search.toLowerCase()
      const matchesName = voice.name.toLowerCase().includes(searchTerm)
      const matchesDescription = voice.description?.toLowerCase().includes(searchTerm)
      if (!matchesName && !matchesDescription) return false
    }

    // Gender filter
    if (voiceFilters.gender !== 'all') {
      const voiceGender = voice.labels?.gender?.toLowerCase()
      if (voiceGender !== voiceFilters.gender) return false
    }

    // Accent filter
    if (voiceFilters.accent !== 'all') {
      const voiceAccent = voice.labels?.accent?.toLowerCase()
      if (voiceAccent !== voiceFilters.accent) return false
    }

    // Age filter
    if (voiceFilters.age !== 'all') {
      const voiceAge = voice.labels?.age?.toLowerCase()
      if (voiceAge !== voiceFilters.age) return false
    }

    // Use case filter
    if (voiceFilters.useCase !== 'all') {
      const voiceUseCase = voice.labels?.['use case']?.toLowerCase() || voice.labels?.use_case?.toLowerCase()
      if (voiceUseCase !== voiceFilters.useCase) return false
    }

    return true
  })
})

// Methods
const setMediaType = (section, type) => {
  activeTab.value = section
  spot.spo_mediaTipo = type
}

const guardar = () => {
  const validation = validateFields()
  if (!validation.valid) {
    toast(validation.error, 'error')
    return
  }

  isLoading.value = true
  submitAudioFile()
}

const validateFields = () => {
  if (!spot.spo_nombre || spot.spo_nombre.trim() === '') {
    return {
      valid: false,
      error: 'El nombre del spot es obligatorio'
    }
  }

  if (!spot.spo_tipo) {
    return {
      valid: false,
      error: 'Debe seleccionar un tipo de spot'
    }
  }

  if (!spot.spo_fecini) {
    return {
      valid: false,
      error: 'La fecha de inicio es obligatoria'
    }
  }

  if (!spot.spo_usuario) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      spot.spo_usuario = user.unique_name || user.Nombre || null

      if (!spot.spo_usuario) {
        return {
          valid: false,
          error: 'No se pudo identificar el usuario. Por favor, inicie sesión nuevamente.'
        }
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Error al obtener datos del usuario. Por favor, inicie sesión nuevamente.'
      }
    }
  }

  if (spot.spo_mediaTipo === 'audio' || spot.spo_mediaTipo === 'video') {
    if (!file.value && !srcAudio.value) {
      return {
        valid: false,
        error: `Debe cargar o generar un archivo de ${spot.spo_mediaTipo}`
      }
    }
  } else if (spot.spo_mediaTipo === 'streaming') {
    if (!spot.spo_url || spot.spo_url === 'Formatos permitidos m3u8') {
      return {
        valid: false,
        error: 'Debe ingresar una URL de streaming válida'
      }
    }

    if (streamUrlError.value) {
      return {
        valid: false,
        error: streamUrlError.value
      }
    }

    if (!isValidStreamUrl.value) {
      return {
        valid: false,
        error: 'La URL de streaming no es válida'
      }
    }
  }

  return { valid: true }
}

const handleFileUpload = (event) => {
  const selectedFile = event.target.files[0]
  if (!selectedFile) return

  fileValidationError.value = ''
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
    filePreviewUrl.value = null
  }

  const sizeValidation = validateFileSize(selectedFile)
  if (!sizeValidation.valid) {
    fileValidationError.value = sizeValidation.error
    toast(sizeValidation.error, 'error')
    fileInput.value.value = ''
    return
  }

  const typeValidation = validateFileType(selectedFile, spot.spo_mediaTipo)
  if (!typeValidation.valid) {
    fileValidationError.value = typeValidation.error
    toast(typeValidation.error, 'error')
    fileInput.value.value = ''
    return
  }

  file.value = selectedFile
  filePreviewType.value = spot.spo_mediaTipo
  loadAudio()
  createFilePreview(selectedFile)
}

const createFilePreview = (fileObj) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    filePreviewUrl.value = e.target.result
  }
  reader.readAsDataURL(fileObj)
}

const removeFile = () => {
  file.value = null
  srcAudio.value = ''
  srcAudioLabel.value = ''
  audioDuration.value = ''
  fileValidationError.value = ''

  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
    filePreviewUrl.value = null
  }
  filePreviewType.value = null

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDateForInput = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

const loadAudio = () => {
  if (!file.value) return

  const reader = new FileReader()
  reader.onload = function (e) {
    srcAudio.value = e.target.result
    srcAudioLabel.value = 'Audio personal cargado'

    const audio = new Audio(e.target.result)
    audio.addEventListener('loadedmetadata', function() {
      audioDuration.value = formatDuration(audio.duration)
    })
  }
  reader.readAsDataURL(file.value)
}

const formatDuration = (seconds) => {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const generarVoz = async () => {
  isLoading.value = true
  try {
    const result = await ElevenLabsService.textToSpeechFile(
      selectedLoc.value.voice_id,
      MensajeSpot.value,
      {
        stability: voiceSettings.stability,
        similarityBoost: voiceSettings.similarity_boost,
        style: voiceSettings.style,
        useSpeakerBoost: voiceSettings.use_speaker_boost,
        modelId: voiceSettings.modelId
      }
    )

    if (filePreviewUrl.value && filePreviewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl.value)
    }

    file.value = result.audioFile
    srcAudio.value = result.audioUrl
    srcAudioLabel.value = `Audio generado con locutor inteligente (${selectedLoc.value.name})`

    filePreviewUrl.value = result.audioUrl
    filePreviewType.value = 'audio'

    await nextTick()

    const userData = await ElevenLabsService.getUserInfo()
    CarDispVoz.value = userData.character_limit - userData.character_count
    isLoading.value = false

    toast('Audio generado exitosamente', 'success')
  } catch (error) {
    console.error('Error generando voz:', error)
    toast(error.message || 'Error al generar el audio', 'error')
    isLoading.value = false
  }
}

const playVoicePreview = async () => {
  if (!selectedLoc.value) return

  isLoadingPreview.value = true
  try {
    if (previewAudioUrl.value) {
      URL.revokeObjectURL(previewAudioUrl.value)
      previewAudioUrl.value = null
    }

    const result = await ElevenLabsService.getVoicePreview(selectedLoc.value.voice_id)
    previewAudioUrl.value = result.audioUrl

    nextTick(() => {
      if (previewAudio.value) {
        previewAudio.value.play()
      }
    })

    isLoadingPreview.value = false
  } catch (error) {
    console.error('Error cargando preview:', error)
    toast('Error al cargar el preview de voz', 'error')
    isLoadingPreview.value = false
  }
}

const onVoiceChange = () => {
  if (previewAudioUrl.value) {
    URL.revokeObjectURL(previewAudioUrl.value)
    previewAudioUrl.value = null
  }
}

const applyPreset = (presetName) => {
  const presets = {
    balanced: {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    },
    expressive: {
      stability: 0.50,
      similarity_boost: 0.85,
      style: 0.60,
      use_speaker_boost: true
    },
    stable: {
      stability: 0.90,
      similarity_boost: 0.60,
      style: 0.0,
      use_speaker_boost: false
    }
  }

  if (presets[presetName]) {
    Object.assign(voiceSettings, presets[presetName])
    toast(`Preset "${presetName}" aplicado`, 'success')
  }
}

const resetSettings = () => {
  Object.assign(voiceSettings, {
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
    modelId: 'eleven_multilingual_v2'
  })
  toast('Configuración restaurada', 'success')
}

const extractFiltersFromVoices = () => {
  if (!locutores.value || locutores.value.length === 0) return

  const genders = new Set()
  const accents = new Set()
  const ages = new Set()
  const useCases = new Set()

  locutores.value.forEach(voice => {
    if (voice.labels) {
      if (voice.labels.gender) genders.add(voice.labels.gender.toLowerCase())
      if (voice.labels.accent) accents.add(voice.labels.accent.toLowerCase())
      if (voice.labels.age) ages.add(voice.labels.age.toLowerCase())

      const useCase = voice.labels['use case'] || voice.labels.use_case
      if (useCase) useCases.add(useCase.toLowerCase())
    }
  })

  availableFilters.genders = Array.from(genders).sort()
  availableFilters.accents = Array.from(accents).sort()
  availableFilters.ages = Array.from(ages).sort()
  availableFilters.useCases = Array.from(useCases).sort()
}

const clearFilters = () => {
  Object.assign(voiceFilters, {
    search: '',
    gender: 'all',
    accent: 'all',
    age: 'all',
    useCase: 'all'
  })
  toast('Filtros limpiados', 'success')
}

const getVoiceDisplayInfo = (voice) => {
  const parts = []

  if (voice.labels?.gender) {
    const genderIcon = voice.labels.gender.toLowerCase() === 'female' ? '♀' : '♂'
    parts.push(genderIcon)
  }

  if (voice.labels?.accent) {
    parts.push(capitalizeFirst(voice.labels.accent))
  }

  if (voice.labels?.age) {
    parts.push(capitalizeFirst(voice.labels.age))
  }

  return parts.length > 0 ? ` (${parts.join(' • ')})` : ''
}

const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const getActiveFiltersCount = () => {
  let count = 0
  if (voiceFilters.search) count++
  if (voiceFilters.gender !== 'all') count++
  if (voiceFilters.accent !== 'all') count++
  if (voiceFilters.age !== 'all') count++
  if (voiceFilters.useCase !== 'all') count++
  return count
}

const validateStreamUrl = () => {
  const url = spot.spo_url

  if (!url || url === 'Formatos permitidos m3u8') {
    streamUrlError.value = ''
    isValidStreamUrl.value = false
    return
  }

  try {
    const urlObj = new URL(url)

    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      streamUrlError.value = 'La URL debe usar protocolo HTTP o HTTPS'
      isValidStreamUrl.value = false
      return
    }

    const validExtensions = ['.m3u8', '.mpd', '.mp4', '.webm']
    const hasValidExtension = validExtensions.some(ext => url.toLowerCase().includes(ext))

    if (!hasValidExtension) {
      streamUrlError.value = 'Formato no válido. Usa: .m3u8 (HLS), .mpd (DASH), o HTTP streams'
      isValidStreamUrl.value = false
      return
    }

    streamUrlError.value = ''
    isValidStreamUrl.value = true
  } catch (error) {
    streamUrlError.value = 'URL inválida. Ingresa una URL completa (ej: https://ejemplo.com/stream.m3u8)'
    isValidStreamUrl.value = false
  }
}

const getStreamType = (url) => {
  if (!url) return 'Desconocido'

  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('.m3u8')) return 'HLS (HTTP Live Streaming)'
  if (lowerUrl.includes('.mpd')) return 'DASH (Dynamic Adaptive Streaming)'
  if (lowerUrl.includes('.mp4') || lowerUrl.includes('.webm')) return 'HTTP Progressive Streaming'

  return 'HTTP Stream'
}

const validateFileSize = (fileObj) => {
  const maxSizeBytes = 50 * 1024 * 1024
  if (fileObj.size > maxSizeBytes) {
    return {
      valid: false,
      error: `El archivo es demasiado grande (${formatFileSize(fileObj.size)}). Máximo permitido: 50MB`
    }
  }
  return { valid: true }
}

const validateFileType = (fileObj, expectedType) => {
  const audioFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac']
  const videoFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

  if (expectedType === 'audio') {
    if (!audioFormats.includes(fileObj.type) && !fileObj.name.match(/\.(mp3|wav|ogg|aac|flac)$/i)) {
      return {
        valid: false,
        error: 'Formato de audio no válido. Usa: MP3, WAV, OGG, AAC o FLAC'
      }
    }
  } else if (expectedType === 'video') {
    if (!videoFormats.includes(fileObj.type) && !fileObj.name.match(/\.(mp4|webm|ogg|mov)$/i)) {
      return {
        valid: false,
        error: 'Formato de video no válido. Usa: MP4, WebM, OGG o MOV'
      }
    }
  }

  return { valid: true }
}

const submitAudioFile = () => {
  if (!spot.spo_usuario) {
    console.error('Error: spo_usuario no está definido')
    toast('Error: No se pudo identificar el usuario', 'error')
    isLoading.value = false
    return
  }

  console.log('Enviando spot con usuario:', spot.spo_usuario)
  console.log('Datos del spot:', spot)

  const formdata = new FormData()
  if (file.value != null) {
    formdata.append('file', file.value, 'audio.mp3')
    // Get duration from the audio element if available
    if (audiofile.value && audiofile.value.duration) {
      formdata.append('spo_dursec', parseInt(audiofile.value.duration))
    } else {
      formdata.append('spo_dursec', 0)
    }
  }
  for (const key in spot) {
    if (Object.hasOwnProperty.call(spot, key)) {
      let value = spot[key]
      if (key == 'spo_fecini' || key == 'spo_fecfin') {
        value = value ? moment(value).format('YYYY-MM-DD') : null
      }
      if (value === null || value === undefined) {
        formdata.append(key, '')
      } else {
        formdata.append(key, value)
      }
    }
  }
  const action = (spot.spo_codigo != -1)
    ? spotsStore.updateSpot(spot.spo_codigo, formdata)
    : spotsStore.uploadSpot(formdata)

  action.then(response => {
    isLoading.value = false
    toast('Registro exitoso', 'success')

    if (signalR?.invoke) {
      try {
        signalR.invoke('SendMessageToAll', {
          spotName: spot.spo_nombre,
          spotType: spot.spo_tipo,
          mediaTipo: spot.spo_mediaTipo,
          timestamp: new Date().toISOString(),
          action: spot.spo_codigo != -1 ? 'updated' : 'created'
        })
        console.log('✅ Señal de nuevo spot enviada por SignalR')
      } catch (error) {
        console.error('Error al enviar señal SignalR:', error)
      }
    }

    btnCancelar()
  }).catch(err => {
    isLoading.value = false
    toast(err.message || 'Error al guardar el spot', 'error')
  })
}

const btnCancelar = () => {
  router.push({
    name: 'BibliotecaSpot'
  })
}

const editarSpot = () => {
  isLoading.value = true

  const fechaDesde = fechaInicio.value
  const fechaHasta = (spot.spo_tipo === 'inst') ? null : fechaFin.value

  spotsStore.updateSpot(spot.spo_codigo, spot).then(res => {
    notificacion.mensaje = textos.mensajeAlertaEditOk
    toast(notificacion.mensaje, 'success')
    redirectTo('bibliotecaSpot')
    isLoading.value = false
  })
    .catch(err => {
      notificacion.mensaje = err.message || err
      console.log(notificacion.mensaje)
      toast(notificacion.mensaje, 'error')
      isLoading.value = false
    })
}

const redirectTo = (pathComponent) => {
  router.push({ path: pathComponent })
}

const notifyVue = (verticalAlign, horizontalAlign, message, icono, tipo) => {
  const color = tipo
}

const verificarParametros = () => {
  isLoading.value = true
  const routeState = window.history.state?.spot || router.currentRoute.value.state?.spot

  if (routeState && routeState.spo_codigo != undefined) {
    isEdit.value = true
    spot.spo_codigo = routeState.spo_codigo
    spot.spo_nombre = routeState.spo_nombre
    spot.spo_source = routeState.spo_source
    spot.spo_mediaTipo = routeState.spo_mediaTipo
    spot.spo_url = routeState.spo_url || null

    const fini = moment(routeState.spo_fecini).format('YYYY-MM-DD')
    const ffin = moment(routeState.spo_fecfin).format('YYYY-MM-DD')
    spot.spo_fecini = fini
    spot.spo_fecfin = ffin

    spot.spo_tipo = routeState.spo_tipo

    // Configurar preview según el tipo de media
    if (routeState.spo_mediaTipo === 'audio' || routeState.spo_mediaTipo === 'video') {
      // Para audio y video, cargar el preview del archivo existente
      srcAudio.value = routeState.url
      srcAudioLabel.value = 'Cargue un nuevo archivo para reemplazar'

      // Establecer el preview URL y tipo
      filePreviewUrl.value = routeState.url
      filePreviewType.value = routeState.spo_mediaTipo

      // Cambiar a la pestaña de upload
      activeTab.value = 'upload'
    } else if (routeState.spo_mediaTipo === 'streaming') {
      // Para streaming, establecer la URL y validarla
      spot.spo_url = routeState.spo_url || routeState.url || 'Formatos permitidos m3u8'

      // Cambiar a la pestaña de stream
      activeTab.value = 'stream'

      // Validar la URL de streaming
      if (spot.spo_url && spot.spo_url !== 'Formatos permitidos m3u8') {
        validateStreamUrl()
      }
    }
  }
  isLoading.value = false
}

// Lifecycle hooks
onMounted(async () => {
  isLoading.value = true
  try {
    const locutoresData = await ElevenLabsService.getVoices()
    locutores.value = locutoresData

    extractFiltersFromVoices()
    verificarParametros()

    const userData = await ElevenLabsService.getUserInfo()
    CarDispVoz.value = userData.character_limit - userData.character_count

    isLoading.value = false
  } catch (error) {
    console.error('Error inicializando componente:', error)
    toast('Error al cargar las voces disponibles', 'error')
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  if (previewAudioUrl.value) {
    URL.revokeObjectURL(previewAudioUrl.value)
  }
  if (srcAudio.value && srcAudio.value.startsWith('blob:')) {
    URL.revokeObjectURL(srcAudio.value)
  }
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
  }
})

// Watchers
watch(file, (newval) => {
  loadAudio()
})

watch(() => spot.spo_tipo, (newVal) => {
  if (spot.spo_codigo !== -1) return
  switch (newVal) {
    case 'inst':
      spot.spo_fecini = moment(new Date()).format('YYYY-MM-DD')
      spot.spo_fecfin = moment(new Date(9999, 1, 1)).format('YYYY-MM-DD')
      break
    case 'noti':
      spot.spo_fecini = moment(new Date()).format('YYYY-MM-DD')
      spot.spo_fecfin = moment(new Date()).format('YYYY-MM-DD')
      break
    case 'prom':
      spot.spo_fecini = null
      spot.spo_fecfin = null
      break
  }
})
</script>
