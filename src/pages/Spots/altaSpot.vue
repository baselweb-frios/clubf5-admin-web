<template>
  <div class="space-y-6">
    <loading-overlay
      :show="isLoading"
      opacity="0.85"
      color="#1d8cf8"
      height="95px"
      fullscreen="true"
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
      <div
class="card"
data-tour="spot-info"
>
        <div class="flex items-center gap-2 mb-6">
          <i class="fas fa-info-circle text-primary-400" />
          <h3 class="text-lg font-semibold text-text-primary">
Información del Spot
</h3>
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
            <select
v-model="spot.spo_tipo"
class="select"
>
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
          <div
data-tour="spot-media-tabs"
class="flex flex-wrap border-b border-dark-border"
>
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
            <button
              class="flex-1 min-w-[120px] px-4 py-3 text-sm font-medium transition-all border-b-2"
              :class="activeTab === 'obs' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-dark-hover'"
              @click="abrirObsSelector"
            >
              <i class="fas fa-cloud-upload-alt mr-2" />
              Desde OBS
            </button>
          </div>



          <!-- Stream / Fuente libre Tab -->
          <div
v-if="activeTab === 'stream'"
class="p-4 sm:p-6"
>
            <div class="space-y-4">
              <!-- Descripción -->
              <div class="flex items-start gap-3 p-3 bg-info-500/10 border border-info-500/20 rounded-lg">
                <i class="fas fa-info-circle text-info-400 mt-0.5" />
                <p class="text-xs text-info-300">
                  Cargá cualquier URL de <strong>audio</strong> o <strong>video</strong> de libre acceso: streams en vivo (HLS, DASH), archivos MP3, MP4, OGG, WAV, radios online, podcasts, etc.
                </p>
              </div>

              <!-- Input URL -->
              <div class="form-group">
                <label class="label flex items-center gap-2">
                  <i class="fas fa-link" />
                  URL de la fuente
                  <i
                    class="fas fa-question-circle text-text-tertiary text-xs cursor-help"
                    title="Cualquier URL HTTP/HTTPS que apunte a un archivo o stream de audio/video."
                  />
                </label>
                <div class="relative">
                  <i class="fas fa-globe absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    v-model="spot.spo_url"
                    type="url"
                    class="input pl-10 pr-10"
                    placeholder="https://ejemplo.com/radio.mp3  |  https://cdn.com/stream.m3u8"
                    @blur="validateStreamUrl"
                    @input="streamUrlError = ''; isValidStreamUrl = false"
                  >
                  <button
                    v-if="spot.spo_url"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    title="Limpiar URL"
                    @click="spot.spo_url = ''; streamUrlError = ''; isValidStreamUrl = false"
                  >
                    <i class="fas fa-times-circle" />
                  </button>
                </div>
                <p
                  v-if="streamUrlError"
                  class="text-sm text-danger-400 mt-1 flex items-center gap-1"
                >
                  <i class="fas fa-exclamation-triangle" />
                  {{ streamUrlError }}
                </p>
                <p
                  v-else
                  class="text-xs text-text-tertiary mt-1 flex items-center gap-1"
                >
                  <i class="fas fa-lightbulb text-warning-400" />
                  Formatos: MP3, WAV, OGG, AAC, FLAC, MP4, WebM, .m3u8 (HLS), .mpd (DASH), radios online...
                </p>
              </div>

              <!-- Preview panel -->
              <div
                v-if="isValidStreamUrl"
                class="p-4 bg-dark-secondary rounded-lg border border-dark-border space-y-3"
              >
                <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <i
                    :class="getStreamMediaCategory(spot.spo_url) === 'audio' ? 'fas fa-headphones text-primary-400' : 'fas fa-film text-primary-400'"
                  />
                  Vista previa
                </h4>

                <!-- Info row -->
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-link text-text-tertiary" />
                    <span class="text-text-secondary flex-shrink-0">URL:</span>
                    <span class="text-text-primary truncate text-xs">{{ spot.spo_url }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-file-code text-text-tertiary" />
                    <span class="text-text-secondary flex-shrink-0">Tipo:</span>
                    <span class="badge badge-info text-xs">{{ getStreamType(spot.spo_url) }}</span>
                  </div>
                </div>

                <!-- Audio player -->
                <div v-if="getStreamMediaCategory(spot.spo_url) === 'audio'">
                  <audio
                    :src="spot.spo_url"
                    controls
                    class="w-full"
                    @error="streamUrlError = 'No se pudo cargar la fuente. Verificá que la URL sea pública y accesible.'; isValidStreamUrl = false"
                  />
                </div>

                <!-- Video player -->
                <div v-else-if="getStreamMediaCategory(spot.spo_url) === 'video'">
                  <video
                    :src="spot.spo_url"
                    controls
                    class="w-full max-h-[280px] rounded-lg"
                    @error="streamUrlError = 'No se pudo cargar la fuente. Verificá que la URL sea pública y accesible.'; isValidStreamUrl = false"
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                </div>

                <!-- Stream indeterminado (HLS/DASH sin player nativo) -->
                <div
                  v-else
                  class="flex items-center gap-2 text-sm text-text-secondary"
                >
                  <i class="fas fa-broadcast-tower text-success-400" />
                  Stream configurado. La reproducción se realizará en el reproductor.
                </div>
              </div>
            </div>
          </div>
          <!-- Upload Tab -->
          <div
v-if="activeTab === 'upload'"
data-tour="spot-upload"
class="p-4 sm:p-6"
>
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
                  <p
v-if="spot.spo_mediaTipo=='audio'"
class="text-text-primary font-medium"
>
                    Arrastra tu archivo de audio aquí o haz clic para seleccionar
                  </p>
                  <p
v-if="spot.spo_mediaTipo=='video'"
class="text-text-primary font-medium"
>
                    Arrastra tu archivo de video aquí o haz clic para seleccionar
                  </p>
                  <p
v-if="spot.spo_mediaTipo=='audio'"
class="text-sm text-text-tertiary"
>
                    Formatos soportados: MP3, WAV, OGG, AAC, FLAC (máx. 50MB)
                  </p>
                  <p
v-if="spot.spo_mediaTipo=='video'"
class="text-sm text-text-tertiary"
>
                    Formatos soportados: MP4, WebM, OGG, MOV (máx. 50MB)
                  </p>
                </div>
              </label>

              <!-- Validation Error -->
              <div
v-if="fileValidationError"
class="alert alert-danger"
>
                <i class="fas fa-exclamation-triangle" />
                {{ fileValidationError }}
              </div>

              <!-- File Info Preview -->
              <div
v-if="file"
class="flex items-center justify-between p-3 bg-dark-secondary rounded-lg border border-dark-border"
>
                <div class="flex items-center gap-3">
                  <i :class="spot.spo_mediaTipo === 'audio' ? 'fas fa-file-audio text-primary-400' : 'fas fa-file-video text-primary-400'" />
                  <span class="font-medium text-text-primary">{{ file.name }}</span>
                  <span class="text-sm text-text-tertiary">({{ formatFileSize(file.size) }})</span>
                </div>
                <button
class="btn btn-ghost btn-sm btn-icon"
@click="removeFile"
>
                  <i class="fas fa-times" />
                </button>
              </div>

              <!-- Media Preview Section -->
              <div
v-if="filePreviewUrl"
class="p-4 bg-dark-secondary rounded-lg border border-dark-border"
>
                <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                  <i :class="filePreviewType === 'audio' ? 'fas fa-headphones text-primary-400' : 'fas fa-video text-primary-400'" />
                  Vista Previa del {{ filePreviewType === 'audio' ? 'Audio' : 'Video' }}
                </h4>

                <!-- Audio Preview -->
                <div v-if="filePreviewType === 'audio'">
                  <audio
ref="audiofile"
:src="filePreviewUrl"
controls
class="w-full"
/>
                </div>

                <!-- Video Preview -->
                <div v-if="filePreviewType === 'video'">
                  <video
:src="filePreviewUrl"
controls
class="w-full max-h-[300px] rounded-lg"
>
                    Tu navegador no soporta la reproducción de video.
                  </video>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Generation Tab -->
          <div
v-if="activeTab === 'ai'"
data-tour="spot-ai"
class="p-4 sm:p-6"
>
            <div class="space-y-6">
              <!-- Voice Filters Section -->
              <div class="p-4 bg-dark-secondary rounded-lg border border-dark-border">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <i class="fas fa-filter text-primary-400" />
                    Filtrar Voces
                    <span
v-if="getActiveFiltersCount() > 0"
class="badge badge-primary text-xs"
>
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
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <!-- Gender Filter -->
                  <div
v-if="availableFilters.genders.length > 0"
class="form-group"
>
                    <label class="label text-xs flex items-center gap-1">
                      <i class="fas fa-venus-mars" />
                      Genero
                    </label>
                    <select
v-model="voiceFilters.gender"
class="select text-sm"
>
                      <option value="all">
Todos
</option>
                      <option
                        v-for="gender in availableFilters.genders"
                        :key="gender"
                        :value="gender"
                      >
                        {{ gender === 'female' ? '♀ Femenino' : gender==='male'?'♂ Masculino':'♀♂ Neutral' }}
                      </option>
                    </select>
                  </div>

                  <!-- Language Filter (reutilizando accent) -->
                  <div
v-if="availableFilters.accents.length > 0"
class="form-group"
>
                    <label class="label text-xs flex items-center gap-1">
                      <i class="fas fa-language" />
                      Idioma
                    </label>
                    <select
v-model="voiceFilters.accent"
class="select text-sm"
>
                      <option value="all">
Todos
</option>
                      <option
                        v-for="language in availableFilters.accents"
                        :key="language"
                        :value="language"
                      >
                        {{ translateLanguage(language) }}
                      </option>
                    </select>
                  </div>

                  <!-- Age Filter -->
                  <div
v-if="availableFilters.ages.length > 0"
class="form-group"
>
                    <label class="label text-xs flex items-center gap-1">
                      <i class="fas fa-user-clock" />
                      Edad
                    </label>
                    <select
v-model="voiceFilters.age"
class="select text-sm"
>
                      <option value="all">
Todas
</option>
                      <option
                        v-for="age in availableFilters.ages"
                        :key="age"
                        :value="age"
                      >
                        {{ translateAge(age) }}
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
                <select
v-model="selectedLoc"
class="select"
@change="onVoiceChange"
>
                  <option
:value="null"
disabled
>
                    {{ filteredVoices.length === 0 ? 'No hay voces disponibles con estos filtros' : 'Seleccionar locutor...' }}
                  </option>
                  <option
                    v-for="locutor in filteredVoices"
                    :key="locutor.id"
                    :value="locutor"
                  >
                    {{ locutor.name }}
                  </option>
                </select>
                <p
v-if="filteredVoices.length === 0 && locutores.length > 0"
class="text-sm text-warning-400 mt-1 flex items-center gap-1"
>
                  <i class="fas fa-exclamation-triangle" />
                  No se encontraron voces con los filtros seleccionados. Intenta ajustar los filtros.
                </p>
              </div>

              <!-- Voice Info Card -->
              <div
v-if="selectedLoc"
class="p-4 bg-dark-tertiary rounded-lg border border-dark-border"
>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-microphone text-primary-400" />
                    <span class="font-semibold text-text-primary">{{ selectedLoc.name }}</span>
                    <span
v-if="selectedLoc.category"
class="badge badge-info text-xs"
>
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

                <!-- Variacion Info -->
                <!-- <div class="flex items-center gap-2 mb-3 p-2 bg-primary-500/10 rounded-lg border border-primary-500/30">
                  <i class="fas fa-sliders-h text-primary-400" />
                  <span class="text-sm text-primary-300">Variacion:</span>
                  <span class="text-sm font-medium text-text-primary">{{ selectedLoc.variacion_nombre }}</span>
                </div> -->

                <div
v-if="selectedLoc.description"
class="text-sm text-text-secondary mb-3"
>
                  {{ selectedLoc.description }}
                </div>

                <div class="space-y-2">
                  <!-- <div v-if="selectedLoc.labels" class="flex items-start gap-2">
                    <i class="fas fa-tags text-text-tertiary mt-0.5" />
                    <div class="flex-1">
                      <span class="text-xs text-text-tertiary">Caracteristicas:</span>
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
                  </div> -->

                  <!-- Mostrar configuraciones de la variacion -->
                  <div
v-if="selectedLoc.settings"
class="flex items-start gap-2"
>
                    <i class="fas fa-cog text-text-tertiary mt-0.5" />
                    <div class="flex-1">
                      <span class="text-xs text-text-tertiary">Configuracion de la variacion:</span>
                      <div class="grid grid-cols-2 gap-2 mt-1 text-xs">
                        <span class="text-text-secondary">Estabilidad: <strong class="text-text-primary">{{ ((selectedLoc.settings.stability || 0) * 100).toFixed(0) }}%</strong></span>
                        <span class="text-text-secondary">Similitud: <strong class="text-text-primary">{{ ((selectedLoc.settings.similarity_boost || 0) * 100).toFixed(0) }}%</strong></span>
                        <span class="text-text-secondary">Estilo: <strong class="text-text-primary">{{ ((selectedLoc.settings.style || 0) * 100).toFixed(0) }}%</strong></span>
                        <span class="text-text-secondary">Speaker Boost: <strong class="text-text-primary">{{ selectedLoc.settings.use_speaker_boost ? 'Si' : 'No' }}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Preview Audio Player -->
                <div
v-if="previewAudioUrl"
class="mt-3 pt-3 border-t border-dark-border"
>
                  <audio
ref="previewAudio"
:src="previewAudioUrl"
controls
class="w-full h-8"
/>
                </div>

                <!-- Preview texto info -->
                <!-- <div v-if="selectedLoc.variacion_preview_texto" class="mt-2 text-xs text-text-tertiary italic">
                  <i class="fas fa-quote-left mr-1"></i>
                  {{ selectedLoc.variacion_preview_texto }}
                </div> -->
              </div>

              <!-- Voice Settings - Oculto ya que las variaciones tienen configuraciones predefinidas -->
              <!-- Las configuraciones se muestran en modo solo lectura en el Voice Info Card arriba -->

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
                <div
v-if="CarDispVoz > 0"
class="flex items-center gap-2 text-sm text-text-secondary"
>
                  <i class="fas fa-info-circle text-info-400" />
                  Caracteres disponibles: {{ CarDispVoz }}
                </div>
              </div>

              <!-- Audio Preview for AI Generated Audio -->
              <div
v-if="filePreviewUrl && filePreviewType === 'audio'"
class="p-4 bg-dark-secondary rounded-lg border border-dark-border"
>
                <h4 class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                  <i class="fas fa-headphones text-success-400" />
                  Vista Previa del Audio Generado
                </h4>
                <audio
:src="filePreviewUrl"
controls
class="w-full"
/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- OBS File Selector Modal -->
      <ObsFileSelectorModal
        v-model="showObsModal"
        :prefix="obsPrefix"
        @select="handleObsFileSelect"
      />

      <!-- Actions -->
      <div
class="card"
data-tour="spot-save"
>
        <div class="flex flex-wrap gap-3">
          <button
class="btn btn-primary"
@click="guardar"
>
            <i class="fas fa-save" />
            {{ isEdit ? 'Actualizar Spot' : 'Guardar Spot' }}
          </button>
          <button
class="btn btn-ghost"
@click="btnCancelar"
>
            <i class="fas fa-times" />
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Tour Button -->
    <TourButton
v-if="hasTour() && !isTourViewed()"
variant="floating"
size="md"
:pulse="true"
/>
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
import VozElevenLabsServices from '@/services/VozElevenLabsServices'
import { useAuthStore } from '@/stores/auth'
import { useSignalRAuth } from '@/composables/useSignalRAuth'
import { useDriverTour } from '@/composables/useDriverTour'
import ObsFileSelectorModal from '@/components/spots/ObsFileSelectorModal.vue'
import moment from 'moment'

// Composables
const route = useRoute()

// Driver.js tour
const { startTour, hasTour, isTourViewed } = useDriverTour({ autoStart: true })
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
const showObsModal = ref(false)
const obsPrefix = computed(() => {
  const clienteId = getClienteId()
  const tipo = spot.spo_tipo || 'noti'
  return `Music/online/Spots/${clienteId}/${tipo}/`
})

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
      const matchesVozName = voice.voz_nombre?.toLowerCase().includes(searchTerm)
      const matchesVariacionName = voice.variacion_nombre?.toLowerCase().includes(searchTerm)
      const matchesDescription = voice.description?.toLowerCase().includes(searchTerm)
      if (!matchesName && !matchesVozName && !matchesVariacionName && !matchesDescription) return false
    }

    // Gender filter
    if (voiceFilters.gender !== 'all') {
      const voiceGender = voice.labels?.gender?.toLowerCase()
      if (voiceGender !== voiceFilters.gender) return false
    }

    // Language filter (usando accent filter)
    if (voiceFilters.accent !== 'all') {
      const voiceLanguage = voice.labels?.language?.toLowerCase()
      if (voiceLanguage !== voiceFilters.accent) return false
    }

    // Age filter
    if (voiceFilters.age !== 'all') {
      const voiceAge = voice.labels?.age?.toLowerCase()
      if (voiceAge !== voiceFilters.age) return false
    }

    return true
  })
})

// Methods
const getClienteId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.Cliente) {
      const cliente = typeof user.Cliente === 'string' ? JSON.parse(user.Cliente) : user.Cliente
      return cliente.cli_codigo || 1
    }
    return 1
  } catch {
    return 1
  }
}

const abrirObsSelector = () => {
  if (!spot.spo_tipo) {
    toast('Selecciona primero el tipo de spot', 'warning')
    return
  }
  showObsModal.value = true
}

const handleObsFileSelect = (fileData) => {
  if (filePreviewUrl.value && filePreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(filePreviewUrl.value)
  }
  filePreviewUrl.value = fileData.url
  filePreviewType.value = fileData.mediaType
  spot.spo_mediaTipo = fileData.mediaType
  spot.spo_source = fileData.source
  srcAudio.value = fileData.url
  srcAudioLabel.value = `Archivo desde OBS: ${fileData.name}`
  file.value = null
  fileValidationError.value = ''
  activeTab.value = 'upload'
  toast('Archivo seleccionado desde OBS Cloud', 'success')
}

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
    if (!file.value && !srcAudio.value && !spot.spo_source) {
      return {
        valid: false,
        error: `Debe cargar o generar un archivo de ${spot.spo_mediaTipo}`
      }
    }
  } else if (spot.spo_mediaTipo === 'streaming') {
    if (!spot.spo_url) {
      return {
        valid: false,
        error: 'Debe ingresar una URL de la fuente de audio/video'
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
    // Usar configuraciones de la variacion seleccionada
    const variacionSettings = selectedLoc.value.settings || {}

    const result = await ElevenLabsService.textToSpeechFile(
      selectedLoc.value.voice_id, // voice_id de la voz original para la API de ElevenLabs
      MensajeSpot.value,
      {
        stability: variacionSettings.stability ?? voiceSettings.stability,
        similarityBoost: variacionSettings.similarity_boost ?? voiceSettings.similarity_boost,
        style: variacionSettings.style ?? voiceSettings.style,
        useSpeakerBoost: variacionSettings.use_speaker_boost ?? voiceSettings.use_speaker_boost,
        modelId: variacionSettings.modelId ?? voiceSettings.modelId
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

    // Intentar usar el preview de la variacion primero, si no existe usar el preview original
    if (selectedLoc.value.variacion_preview_path) {
      previewAudioUrl.value = VozElevenLabsServices.getPreviewUrl(selectedLoc.value.variacion_preview_path)
    } else if (selectedLoc.value.preview_url) {
      // Usar preview original de ElevenLabs (URL directa)
      previewAudioUrl.value = selectedLoc.value.preview_url
    } else {
      // Fallback: obtener preview desde ElevenLabs API
      const result = await ElevenLabsService.getVoicePreview(selectedLoc.value.voice_id)
      previewAudioUrl.value = result.audioUrl
    }

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

  // Aplicar configuraciones de la variacion seleccionada
  if (selectedLoc.value?.settings) {
    const settings = selectedLoc.value.settings
    voiceSettings.stability = settings.stability ?? 0.75
    voiceSettings.similarity_boost = settings.similarity_boost ?? 0.75
    voiceSettings.style = settings.style ?? 0.0
    voiceSettings.use_speaker_boost = settings.use_speaker_boost ?? true
    voiceSettings.modelId = settings.modelId ?? 'eleven_multilingual_v2'
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
  const languages = new Set()
  const ages = new Set()

  locutores.value.forEach(voice => {
    // Labels de la variacion
    if (voice.labels) {
      if (voice.labels.gender) genders.add(voice.labels.gender.toLowerCase())
      if (voice.labels.language) languages.add(voice.labels.language.toLowerCase())
      if (voice.labels.age) ages.add(voice.labels.age.toLowerCase())
    }
  })

  availableFilters.genders = Array.from(genders).sort()
  // Reutilizamos accents para idiomas
  availableFilters.accents = Array.from(languages).sort()
  availableFilters.ages = Array.from(ages).sort()
}

const clearFilters = () => {
  Object.assign(voiceFilters, {
    search: '',
    gender: 'all',
    accent: 'all', // Usado para idioma
    age: 'all', // No usado pero se mantiene por compatibilidad
    useCase: 'all' // Usado para categoria
  })
  toast('Filtros limpiados', 'success')
}

const getVoiceDisplayInfo = (voice) => {
  const parts = []

  if (voice.labels?.gender) {
    const genderIcon = voice.labels.gender.toLowerCase() === 'female' ? '♀' : '♂'
    parts.push(genderIcon)
  }

  if (voice.labels?.language) {
    parts.push(capitalizeFirst(voice.labels.language))
  }

  if (voice.category) {
    parts.push(capitalizeFirst(voice.category))
  }

  return parts.length > 0 ? ` (${parts.join(' • ')})` : ''
}

const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const translateAge = (age) => {
  const map = {
    young: 'Joven',
    middle_aged: 'Adulto',
    old: 'Mayor',
    elderly: 'Anciano'
  }
  return map[age?.toLowerCase()] ?? capitalizeFirst(age)
}

const translateLanguage = (language) => {
  const map = {
    enamerican: 'En (Americano)',
    enaustralian: 'En (Australiano)',
    enbritish: 'En (Británico)',
    encanadian: 'En (Canadiense)',
    esargentine: 'Es (Argentino)',
    esspanish: 'Es (Español)',
    eslatinamerican: 'Es (Latinoamericano)',
    espeninsular: 'Es (Mexicano)',
  }
  return map[language?.trim().toLowerCase().replace(/[\s()]/g, '')] ?? capitalizeFirst(language)
}

const getActiveFiltersCount = () => {
  let count = 0
  if (voiceFilters.search) count++
  if (voiceFilters.gender !== 'all') count++
  if (voiceFilters.accent !== 'all') count++ // Usado para idioma
  if (voiceFilters.useCase !== 'all') count++ // Usado para categoria
  return count
}

const validateStreamUrl = () => {
  const url = spot.spo_url

  if (!url) {
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

    streamUrlError.value = ''
    isValidStreamUrl.value = true
  } catch {
    streamUrlError.value = 'URL inválida. Ingresá una URL completa (ej: https://ejemplo.com/radio.mp3)'
    isValidStreamUrl.value = false
  }
}

const getStreamType = (url) => {
  if (!url) return 'Desconocido'
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('.m3u8')) return 'HLS (HTTP Live Streaming)'
  if (lowerUrl.includes('.mpd')) return 'DASH (Dynamic Adaptive Streaming)'
  if (lowerUrl.includes('.mp3')) return 'MP3 Audio'
  if (lowerUrl.includes('.wav')) return 'WAV Audio'
  if (lowerUrl.includes('.ogg')) return 'OGG Audio'
  if (lowerUrl.includes('.aac')) return 'AAC Audio'
  if (lowerUrl.includes('.flac')) return 'FLAC Audio'
  if (lowerUrl.includes('.mp4')) return 'MP4 Video'
  if (lowerUrl.includes('.webm')) return 'WebM Video'
  if (lowerUrl.includes('.mov')) return 'MOV Video'
  return 'Stream HTTP'
}

const getStreamMediaCategory = (url) => {
  if (!url) return 'stream'
  const lowerUrl = url.toLowerCase()
  const audioExts = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.opus', '.wma']
  const videoExts = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogv']
  if (audioExts.some(e => lowerUrl.includes(e))) return 'audio'
  if (videoExts.some(e => lowerUrl.includes(e))) return 'video'
  return 'stream'
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
  if (spot.spo_source && !file.value) {
    // Archivo seleccionado desde OBS - no hay file binario, se envia source
    formdata.append('spo_dursec', 0)
    console.log('[altaSpot] Usando source OBS:', spot.spo_source)
  } else if (file.value != null) {
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
    // Cargar voces con variaciones desde la base de datos
    const locutoresData = await VozElevenLabsServices.getVocesConVariaciones()
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
