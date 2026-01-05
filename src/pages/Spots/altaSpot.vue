<template>
  <div class="container">
    <loading-overlay :show="isLoading" opacity="0.85" color="#1d8cf8" height="95px" text="Procesando..." />

    <!-- Header Section -->
    <div class="page-header">
      <div class="flex items-center gap-4">
        <div class="header-icon">
          <i class="fas fa-microphone-alt"></i>
        </div>
        <div>
          <h1 class="page-title">
            {{ isEdit ? 'Editar Spot' : 'Nuevo Spot' }}
          </h1>
          <p class="page-subtitle">
            {{ isEdit ? 'Modifica la información de tu spot publicitario' : 'Crea un nuevo spot publicitario para tu campaña' }}
          </p>
        </div>
      </div>
    </div>

    <div class="form-container">
      <!-- Información Básica -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-info-circle"></i>
            Información del Spot
          </h3>
        </div>
        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-tag"></i>
                Nombre del Spot
              </label>
              <input
                v-model="spot.spo_nombre"
                type="text"
                class="form-input"
                placeholder="Ingrese el nombre del spot"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-layer-group"></i>
                Tipo de Spot
              </label>
              <select v-model="spot.spo_tipo" class="form-select">
                <option v-for="tipo in tipoSpot" :value="tipo.value" :key="tipo.value">
                  {{ tipo.texto }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-calendar-plus"></i>
                Fecha de Inicio
              </label>
              <input
                type="date"
                v-model="spot.spo_fecini"
                class="form-input"
                required
              >
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-calendar-times"></i>
                Fecha de Finalización
              </label>
              <input
                type="date"
                :disabled="spot.spo_tipo==='inst'"
                v-model="spot.spo_fecfin"
                class="form-input"
                :min="formatDateForInput(spot.spo_fecini)"
                required
              >
            </div>

          </div>
        </div>
      </div>

      <!-- Audio Section -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-music"></i>
            Archivo media Spot ({{tipoMediaSpot.find(sp=>sp.value===spot.spo_mediaTipo)?.texto || 'Media'}})
          </h3>
        </div>
        <div class="card-body">
          <div class="tabs">
            <div class="tab-buttons">
              <button
                class="tab-button"
                :class="{ 'active': spot.spo_mediaTipo === 'audio' && activeTab !== 'ai' }"
                @click="setMediaType('upload','audio')"
              >
                <i class="fas fa-upload"></i>
                Subir Audio
              </button>
              <button
                class="tab-button"
                :class="{ 'active': spot.spo_mediaTipo === 'video' }"
                @click="setMediaType('upload','video')"
              >
                <i class="fas fa-upload"></i>
                Subir Video
              </button>
              <button
                class="tab-button"
                :class="{ 'active': activeTab === 'ai' }"
                @click="setMediaType('ai','audio')"
              >
                <i class="fas fa-robot"></i>
                Generar con IA
              </button>
              <button
                class="tab-button"
                :class="{ 'active': activeTab === 'stream' }"
                @click="setMediaType('stream','streaming')"
              >
                <i class="fas fa-globe"></i>
                URL del stream
              </button>
            </div>



            <!-- stream Tab -->
            <div v-if="activeTab === 'stream'" class="tab-content">
              <div class="stream-section">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-link"></i>
                    URL del Stream
                    <i
                      class="fas fa-question-circle help-icon"
                      title="Ingresa la URL completa del stream. Formatos soportados: HLS (.m3u8), DASH (.mpd), HTTP streams. Ejemplos: https://ejemplo.com/stream.m3u8"
                    ></i>
                  </label>
                  <div class="url-input-wrapper">
                    <i class="fas fa-globe stream-icon"></i>
                    <input
                      v-model="spot.spo_url"
                      type="url"
                      class="stream-input"
                      placeholder="https://ejemplo.com/stream.m3u8"
                      @blur="validateStreamUrl"
                      @input="streamUrlError = ''"
                    >
                    <button
                      v-if="spot.spo_url && spot.spo_url !== 'Formatos permitidos m3u8'"
                      @click="spot.spo_url = 'Formatos permitidos m3u8'; streamUrlError = ''"
                      class="clear-stream-btn"
                      title="Limpiar URL"
                    >
                      <i class="fas fa-times-circle"></i>
                    </button>
                  </div>
                  <p v-if="streamUrlError" class="error-hint">
                    <i class="fas fa-exclamation-triangle"></i>
                    {{ streamUrlError }}
                  </p>
                  <p v-else class="setting-hint">
                    <i class="fas fa-lightbulb"></i>
                    Formatos aceptados: .m3u8 (HLS), .mpd (DASH), URLs HTTP/HTTPS
                  </p>
                </div>

                <!-- Stream Preview -->
                <div v-if="isValidStreamUrl" class="stream-preview-section">
                  <h4 class="preview-title">
                    <i class="fas fa-broadcast-tower"></i>
                    Vista Previa del Stream
                  </h4>
                  <div class="stream-info">
                    <div class="stream-detail">
                      <i class="fas fa-link"></i>
                      <span class="stream-label">URL:</span>
                      <span class="stream-value">{{ spot.spo_url }}</span>
                    </div>
                    <div class="stream-detail">
                      <i class="fas fa-file-code"></i>
                      <span class="stream-label">Tipo:</span>
                      <span class="stream-value">{{ getStreamType(spot.spo_url) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Upload Tab -->
            <div v-if="activeTab === 'upload'" class="tab-content">
              <div class="upload-area">
                <input
                  type="file"
                  ref="fileInput"
                  @change="handleFileUpload"
                  :accept="spot.spo_mediaTipo === 'audio' ? 'audio/*,.mp3,.wav,.ogg,.aac,.flac' : 'video/*,.mp4,.webm,.ogg,.mov'"
                  class="file-input"
                  id="file-upload"
                >
                <label for="file-upload" class="upload-label" :class="{ 'has-error': fileValidationError }">
                  <div class="upload-content">
                    <i class="fas fa-cloud-upload-alt upload-icon" :class="{ 'text-danger': fileValidationError }"></i>
                    <p class="upload-text" v-if="spot.spo_mediaTipo=='audio'">
                      Arrastra tu archivo de audio aquí o haz clic para seleccionar
                    </p>
                    <p class="upload-text" v-if="spot.spo_mediaTipo=='video'">
                      Arrastra tu archivo de video aquí o haz clic para seleccionar
                    </p>
                    <p class="upload-hint" v-if="spot.spo_mediaTipo=='audio'">
                      Formatos soportados: MP3, WAV, OGG, AAC, FLAC (máx. 50MB)
                    </p>
                    <p class="upload-hint" v-if="spot.spo_mediaTipo=='video'">
                      Formatos soportados: MP4, WebM, OGG, MOV (máx. 50MB)
                    </p>
                  </div>
                </label>

                <!-- Validation Error -->
                <div v-if="fileValidationError" class="file-validation-error">
                  <i class="fas fa-exclamation-triangle"></i>
                  {{ fileValidationError }}
                </div>

                <!-- File Info Preview -->
                <div v-if="file" class="file-preview">
                  <div class="file-info">
                    <i :class="spot.spo_mediaTipo === 'audio' ? 'fas fa-file-audio' : 'fas fa-file-video'"></i>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">({{ formatFileSize(file.size) }})</span>
                  </div>
                  <button @click="removeFile" class="btn btn-ghost btn-sm">
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <!-- Media Preview Section -->
                <div v-if="filePreviewUrl" class="media-preview-section">
                  <h4 class="preview-title">
                    <i :class="filePreviewType === 'audio' ? 'fas fa-headphones' : 'fas fa-video'"></i>
                    Vista Previa del {{ filePreviewType === 'audio' ? 'Audio' : 'Video' }}
                  </h4>

                  <!-- Audio Preview -->
                  <div v-if="filePreviewType === 'audio'" class="audio-preview-player">
                    <audio ref="audiofile" :src="filePreviewUrl" controls class="audio-element"></audio>
                  </div>

                  <!-- Video Preview -->
                  <div v-if="filePreviewType === 'video'" class="video-preview-player">
                    <video :src="filePreviewUrl" controls class="video-element">
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI Generation Tab -->
            <div v-if="activeTab === 'ai'" class="tab-content">
              <div class="ai-section">
                <!-- Voice Filters Section -->
                <div class="voice-filters-section">
                  <div class="filters-header">
                    <h4 class="filters-title">
                      <i class="fas fa-filter"></i>
                      Filtrar Voces
                      <span v-if="getActiveFiltersCount() > 0" class="filter-count-badge">
                        {{ getActiveFiltersCount() }}
                      </span>
                    </h4>
                    <button
                      v-if="getActiveFiltersCount() > 0"
                      @click="clearFilters"
                      class="btn btn-sm btn-ghost"
                      title="Limpiar todos los filtros"
                    >
                      <i class="fas fa-times"></i>
                      Limpiar
                    </button>
                  </div>

                  <!-- Search Filter -->
                  <div class="filter-group">
                    <div class="search-input-wrapper">
                      <i class="fas fa-search search-icon"></i>
                      <input
                        v-model="voiceFilters.search"
                        type="text"
                        class="search-input"
                        placeholder="Buscar por nombre o descripción..."
                      >
                      <button
                        v-if="voiceFilters.search"
                        @click="voiceFilters.search = ''"
                        class="clear-search-btn"
                        title="Limpiar búsqueda"
                      >
                        <i class="fas fa-times-circle"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Filter Chips -->
                  <div class="filters-grid">
                    <!-- Gender Filter -->
                    <div class="filter-group" v-if="availableFilters.genders.length > 0">
                      <label class="filter-label">
                        <i class="fas fa-venus-mars"></i>
                        Género
                      </label>
                      <select v-model="voiceFilters.gender" class="filter-select">
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
                    <div class="filter-group" v-if="availableFilters.accents.length > 0">
                      <label class="filter-label">
                        <i class="fas fa-globe-americas"></i>
                        Acento
                      </label>
                      <select v-model="voiceFilters.accent" class="filter-select">
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
                    <div class="filter-group" v-if="availableFilters.ages.length > 0">
                      <label class="filter-label">
                        <i class="fas fa-birthday-cake"></i>
                        Edad
                      </label>
                      <select v-model="voiceFilters.age" class="filter-select">
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
                    <div class="filter-group" v-if="availableFilters.useCases.length > 0">
                      <label class="filter-label">
                        <i class="fas fa-bullseye"></i>
                        Uso
                      </label>
                      <select v-model="voiceFilters.useCase" class="filter-select">
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
                  <div class="filter-results">
                    <i class="fas fa-info-circle"></i>
                    <span>
                      Mostrando <strong>{{ filteredVoices.length }}</strong> de <strong>{{ locutores.length }}</strong> voces
                    </span>
                  </div>
                </div>

                <!-- Voice Selection -->
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-user-tie"></i>
                    Locutor Virtual
                    <i
                      class="fas fa-question-circle help-icon"
                      title="Selecciona la voz que se utilizará para generar el audio. Puedes escuchar una muestra de cada voz usando el botón 'Preview' después de seleccionarla."
                    ></i>
                  </label>
                  <select v-model="selectedLoc" class="form-select voice-select" @change="onVoiceChange">
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
                  <p v-if="filteredVoices.length === 0 && locutores.length > 0" class="setting-hint">
                    <i class="fas fa-exclamation-triangle"></i>
                    No se encontraron voces con los filtros seleccionados. Intenta ajustar los filtros.
                  </p>
                </div>

                <!-- Voice Info Card -->
                <div v-if="selectedLoc" class="voice-info-card">
                  <div class="voice-info-header">
                    <div class="voice-info-title">
                      <i class="fas fa-microphone"></i>
                      <span>{{ selectedLoc.name }}</span>
                      <span v-if="selectedLoc.category" class="voice-badge">
                        {{ selectedLoc.category }}
                      </span>
                    </div>
                    <button
                      @click="playVoicePreview"
                      class="btn btn-sm btn-ghost preview-btn"
                      :disabled="isLoadingPreview"
                      title="Escuchar una muestra de cómo suena esta voz. El preview es gratuito y no consume caracteres de tu cuota."
                    >
                      <i :class="isLoadingPreview ? 'fas fa-spinner fa-spin' : 'fas fa-play'"></i>
                      {{ isLoadingPreview ? 'Cargando...' : 'Preview' }}
                    </button>
                  </div>

                  <div v-if="selectedLoc.description" class="voice-description">
                    {{ selectedLoc.description }}
                  </div>

                  <div class="voice-properties">
                    <div class="voice-property" v-if="selectedLoc.labels">
                      <i class="fas fa-tags"></i>
                      <div class="property-content">
                        <span class="property-label">Características:</span>
                        <div class="property-tags">
                          <span
                            v-for="(value, key) in selectedLoc.labels"
                            :key="key"
                            class="property-tag"
                          >
                            {{ key }}: {{ value }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="voice-property" v-if="selectedLoc.high_quality_base_model_ids">
                      <i class="fas fa-star"></i>
                      <div class="property-content">
                        <span class="property-label">Modelos compatibles:</span>
                        <span class="property-value">{{ selectedLoc.high_quality_base_model_ids.join(', ') }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Preview Audio Player -->
                  <div v-if="previewAudioUrl" class="preview-audio-player">
                    <audio ref="previewAudio" :src="previewAudioUrl" controls class="audio-element-small"></audio>
                  </div>
                </div>

                <!-- Voice Settings -->
                <div v-if="selectedLoc" class="voice-settings-section">
                  <h4 class="settings-title">
                    <i class="fas fa-sliders-h"></i>
                    Configuración de Voz
                  </h4>

                  <div class="settings-grid">
                    <!-- Stability -->
                    <div class="setting-control">
                      <label class="setting-label">
                        <span class="label-with-help">
                          <span>Estabilidad</span>
                          <i
                            class="fas fa-question-circle help-icon"
                            title="Controla la consistencia de la voz. Valores altos (0.8-1.0) generan audio más predecible y uniforme, ideal para contenido profesional. Valores bajos (0.3-0.5) permiten más variación y expresividad, útil para narrativa dramática."
                          ></i>
                        </span>
                        <span class="setting-value">{{ voiceSettings.stability.toFixed(2) }}</span>
                      </label>
                      <input
                        type="range"
                        v-model.number="voiceSettings.stability"
                        min="0"
                        max="1"
                        step="0.01"
                        class="setting-slider"
                        title="Desliza para ajustar la estabilidad"
                      >
                      <p class="setting-hint">
                        <i class="fas fa-lightbulb"></i>
                        Mayor estabilidad = voz más consistente pero menos expresiva
                      </p>
                    </div>

                    <!-- Similarity Boost -->
                    <div class="setting-control">
                      <label class="setting-label">
                        <span class="label-with-help">
                          <span>Similitud</span>
                          <i
                            class="fas fa-question-circle help-icon"
                            title="Define qué tan fiel será la voz generada al modelo original. Valores altos (0.8-1.0) mantienen la voz muy similar al original, ideal para voces clonadas. Valores medios (0.5-0.7) permiten más creatividad manteniendo el carácter."
                          ></i>
                        </span>
                        <span class="setting-value">{{ voiceSettings.similarity_boost.toFixed(2) }}</span>
                      </label>
                      <input
                        type="range"
                        v-model.number="voiceSettings.similarity_boost"
                        min="0"
                        max="1"
                        step="0.01"
                        class="setting-slider"
                        title="Desliza para ajustar la similitud"
                      >
                      <p class="setting-hint">
                        <i class="fas fa-lightbulb"></i>
                        Qué tan similar será al locutor original
                      </p>
                    </div>

                    <!-- Style -->
                    <div class="setting-control">
                      <label class="setting-label">
                        <span class="label-with-help">
                          <span>Estilo</span>
                          <i
                            class="fas fa-question-circle help-icon"
                            title="Controla la exageración emocional y estilística. Valor 0 = neutral y profesional. Valores medios (0.3-0.6) añaden carácter. Valores altos (0.7-1.0) producen actuación dramática. Usar con moderación para evitar resultados artificiales."
                          ></i>
                        </span>
                        <span class="setting-value">{{ voiceSettings.style.toFixed(2) }}</span>
                      </label>
                      <input
                        type="range"
                        v-model.number="voiceSettings.style"
                        min="0"
                        max="1"
                        step="0.01"
                        class="setting-slider"
                        title="Desliza para ajustar el estilo"
                      >
                      <p class="setting-hint">
                        <i class="fas fa-lightbulb"></i>
                        Exageración del estilo y emoción (0 = neutral, 1 = muy expresivo)
                      </p>
                    </div>

                    <!-- Speaker Boost -->
                    <div class="setting-control">
                      <label class="setting-label">
                        <span class="label-with-help">
                          <span>Mejora de Locutor</span>
                          <i
                            class="fas fa-question-circle help-icon"
                            title="Activar esta opción mejora la similitud y calidad del audio aplicando procesamiento adicional. Mejora la claridad y reduce artefactos, pero consume aproximadamente 20-30% más caracteres de tu cuota."
                          ></i>
                        </span>
                        <input
                          type="checkbox"
                          v-model="voiceSettings.use_speaker_boost"
                          class="setting-checkbox"
                          title="Activa para mejorar calidad (usa más caracteres)"
                        >
                      </label>
                      <p class="setting-hint">
                        <i class="fas fa-lightbulb"></i>
                        Mejora la similitud y calidad (usa más caracteres)
                      </p>
                    </div>
                  </div>

                  <!-- Model Selection -->
                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-brain"></i>
                      Modelo de IA
                      <i
                        class="fas fa-question-circle help-icon"
                        title="Multilingual v2: Mejor calidad, soporta español y otros idiomas. Turbo v2.5: Balance entre velocidad y calidad. Flash v2.5: Generación ultra rápida con menor latencia. Monolingual v1: Solo inglés, máxima calidad para ese idioma."
                      ></i>
                    </label>
                    <select v-model="voiceSettings.modelId" class="form-select">
                      <option value="eleven_multilingual_v2">🌍 Multilingual v2 (Recomendado para Español)</option>
                      <option value="eleven_turbo_v2_5">⚡ Turbo v2.5 (Rápido, buena calidad)</option>
                      <option value="eleven_flash_v2_5">🚀 Flash v2.5 (Ultra Rápido, menor latencia)</option>
                      <option value="eleven_monolingual_v1">🇺🇸 Monolingual v1 (Solo Inglés, alta calidad)</option>
                    </select>
                    <p class="setting-hint">
                      <i class="fas fa-lightbulb"></i>
                      <span v-if="voiceSettings.modelId === 'eleven_multilingual_v2'">
                        Ideal para contenido en español - Mejor balance calidad/velocidad
                      </span>
                      <span v-else-if="voiceSettings.modelId === 'eleven_turbo_v2_5'">
                        Generación 2x más rápida - Buena para pruebas y producción
                      </span>
                      <span v-else-if="voiceSettings.modelId === 'eleven_flash_v2_5'">
                        Generación 4x más rápida - Perfecto para testing rápido
                      </span>
                      <span v-else>
                        Solo para contenido en inglés - Máxima calidad en ese idioma
                      </span>
                    </p>
                  </div>

                  <!-- Preset Buttons -->
                  <div class="preset-section">
                    <h5 class="preset-title">
                      <i class="fas fa-magic"></i>
                      Presets Rápidos
                      <i
                        class="fas fa-question-circle help-icon"
                        title="Los presets aplican configuraciones predefinidas optimizadas para diferentes tipos de contenido. Puedes aplicar un preset y luego ajustar manualmente si lo necesitas."
                      ></i>
                    </h5>
                    <div class="preset-buttons">
                      <button
                        @click="applyPreset('balanced')"
                        class="btn btn-sm btn-outline"
                        title="Stability: 0.75, Similarity: 0.75, Style: 0.0 - Ideal para spots publicitarios generales"
                      >
                        <i class="fas fa-balance-scale"></i>
                        Balanceado
                      </button>
                      <button
                        @click="applyPreset('expressive')"
                        class="btn btn-sm btn-outline"
                        title="Stability: 0.50, Similarity: 0.85, Style: 0.60 - Perfecto para contenido narrativo y dramático"
                      >
                        <i class="fas fa-theater-masks"></i>
                        Expresivo
                      </button>
                      <button
                        @click="applyPreset('stable')"
                        class="btn btn-sm btn-outline"
                        title="Stability: 0.90, Similarity: 0.60, Style: 0.0 - Ideal para contenido corporativo e institucional"
                      >
                        <i class="fas fa-anchor"></i>
                        Estable
                      </button>
                      <button
                        @click="resetSettings"
                        class="btn btn-sm btn-ghost"
                        title="Restaurar valores predeterminados"
                      >
                        <i class="fas fa-undo"></i>
                        Restaurar
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Text Input -->
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-font"></i>
                    Texto a Convertir
                    <span class="char-counter">({{ MensajeSpot.length }}/{{ CarDispVoz }})</span>
                    <i
                      class="fas fa-question-circle help-icon"
                      title="Escribe el texto que quieres convertir en audio. El contador muestra los caracteres usados vs disponibles en tu cuota. Usa puntuación para controlar pausas: comas (pausa corta), puntos (pausa media), puntos suspensivos (pausa larga)."
                    ></i>
                  </label>
                  <textarea
                    v-model="MensajeSpot"
                    class="form-textarea"
                    :maxlength="CarDispVoz"
                    placeholder="Escribe el texto que deseas convertir en audio...&#10;&#10;Tips:&#10;• Usa puntos y comas para controlar las pausas&#10;• Escribe números como texto (25 → veinticinco)&#10;• Evita MAYÚSCULAS excesivas"
                    rows="6"
                  ></textarea>
                  <p class="setting-hint">
                    <i class="fas fa-lightbulb"></i>
                    <span>Caracteres restantes: <strong>{{ CarDispVoz - MensajeSpot.length }}</strong></span>
                  </p>
                </div>

                <!-- Generate Actions -->
                <div class="ai-actions">
                  <button
                    @click="generarVoz()"
                    class="btn btn-primary"
                    :disabled="!selectedLoc || !MensajeSpot.trim() || isLoading"
                  >
                    <i class="fas fa-magic"></i>
                    Generar Audio con IA
                  </button>
                  <div class="character-info" v-if="CarDispVoz > 0">
                    <i class="fas fa-info-circle"></i>
                    Caracteres disponibles: {{ CarDispVoz }}
                  </div>
                </div>

                <!-- Audio Preview for AI Generated Audio -->
                <div v-if="filePreviewUrl && filePreviewType === 'audio'" class="media-preview-section">
                  <h4 class="preview-title">
                    <i class="fas fa-headphones"></i>
                    Vista Previa del Audio Generado
                  </h4>
                  <div class="audio-preview-player">
                    <audio :src="filePreviewUrl" controls class="audio-element"></audio>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button @click="guardar" class="btn btn-primary btn-lg">
          <i class="fas fa-save"></i>
          {{ isEdit ? 'Actualizar Spot' : 'Guardar Spot' }}
        </button>
        <button @click="btnCancelar" class="btn btn-outline">
          <i class="fas fa-times"></i>
          Cancelar
        </button>
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
<style lang="scss" scoped>
/* ============================================================================
   SPOT FORM - MODERN MINIMALIST DESIGN
   ============================================================================ */

.page-header {
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background: linear-gradient(135deg, var(--color-surface-secondary), var(--color-surface-tertiary));
  border-radius: var(--border-radius-2xl);
  border: var(--border-width-1) solid var(--color-border-primary);
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: var(--letter-spacing-tight);
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: var(--spacing-1) 0 0 0;
  line-height: var(--line-height-relaxed);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

/* ============================================================================
   CARDS
   ============================================================================ */

.card {
  background-color: var(--color-surface-primary);
  border: var(--border-width-1) solid var(--color-border-primary);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-secondary);
}

.card-header {
  padding: var(--spacing-6);
  background: linear-gradient(135deg, var(--color-surface-secondary), var(--color-surface-tertiary));
  border-bottom: var(--border-width-1) solid var(--color-border-primary);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  i {
    color: var(--color-primary-400);
    font-size: var(--font-size-lg);
  }
}

.card-body {
  padding: var(--spacing-6);
}

/* ============================================================================
   FORM ELEMENTS
   ============================================================================ */

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);
}

.form-group {
  margin-bottom: var(--spacing-6);
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
  letter-spacing: var(--letter-spacing-wide);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  i {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: rgba(0, 0, 0, 0.2);
  border: var(--border-width-2) solid var(--color-border-secondary);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--color-text-muted);
}

.form-input:hover,
.form-select:hover,
.form-textarea:hover {
  border-color: black;
  background-color: var(--color-surface-tertiary);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: black;
  background-color: var(--color-surface-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

/* Enhanced select styling for better visibility */
.form-select,
.filter-select,
.voice-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  cursor: pointer;
  position: relative;
}

.form-select:focus,
.filter-select:focus,
.voice-select:focus {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
  font-family: var(--font-family-sans);
}

/* ============================================================================
   TABS
   ============================================================================ */

.tabs {
  border: var(--border-width-1) solid var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.tab-buttons {
  display: flex;
  background-color: var(--color-surface-secondary);
  border-bottom: var(--border-width-1) solid var(--color-border-primary);
}

.tab-button {
  flex: 1;
  padding: var(--spacing-4) var(--spacing-6);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  border-bottom: var(--border-width-2) solid transparent;

  i {
    font-size: var(--font-size-sm);
  }

  &:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  &.active {
    background-color: var(--color-primary-500);
    color: var(--color-text-on-primary);
    border-bottom-color: var(--color-primary-400);
  }
}

.tab-content {
  padding: var(--spacing-6);
}

/* ============================================================================
   UPLOAD AREA
   ============================================================================ */

.upload-area {
  margin-bottom: var(--spacing-6);
}

.file-input {
  display: none;
}

.upload-label {
  display: block;
  padding: var(--spacing-8);
  border: var(--border-width-2) dashed var(--color-border-secondary);
  border-radius: var(--border-radius-xl);
  background-color: var(--color-surface-secondary);
  cursor: pointer;
  transition: var(--transition-base);
  text-align: center;

  &:hover {
    border-color: var(--color-primary-400);
    background-color: var(--color-surface-tertiary);
  }
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.upload-icon {
  font-size: var(--font-size-4xl);
  color: var(--color-text-muted);
}

.upload-text {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  margin: 0;
}

.upload-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  background-color: var(--color-surface-tertiary);
  border: var(--border-width-1) solid var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  margin-top: var(--spacing-4);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;

  i {
    color: var(--color-primary-400);
    font-size: var(--font-size-lg);
  }

  .file-name {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .file-size {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }
}

/* ============================================================================
   AI SECTION
   ============================================================================ */

.ai-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.ai-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: var(--border-width-1) solid var(--color-border-primary);
}

.character-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);

  i {
    color: var(--color-info-500);
  }
}

.char-counter {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-normal);
}

/* ============================================================================
   PREVIEW ELEMENTS (Used by Stream and Media previews)
   ============================================================================ */

.preview-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-4) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  i {
    color: var(--color-success-500);
  }
}

.audio-element {
  width: 100%;
  height: 48px;
  border-radius: var(--border-radius-lg);
  background-color: var(--color-surface-primary);
  border: var(--border-width-1) solid var(--color-border-primary);
}

/* ============================================================================
   FORM ACTIONS
   ============================================================================ */

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  background: linear-gradient(135deg, var(--color-surface-secondary), var(--color-surface-tertiary));
  border-radius: var(--border-radius-xl);
  border: var(--border-width-1) solid var(--color-border-primary);
}

/* ============================================================================
    ACCESSIBILITY & CONTRAST IMPROVEMENTS
    ============================================================================ */

/* Enhanced color schemes for better accessibility */
.error-hint,
.file-validation-error {
  background-color: #fef2f2;
  border-left-color: #dc2626;
  color: #991b1b;
}

.error-hint i,
.file-validation-error i {
  color: #dc2626;
}

.filter-results {
  background-color: #080808;
  border-left-color: #2563eb;
  color: #1e40af;
}

.filter-results i {
  color: #080808;
}

.filter-results strong {
  color: #050505;
}

.voice-badge {
  background-color: #050505;
  color: #eceef5;
}

.property-tag {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #0a0a0a;
}

.setting-hint strong {
  color: #070707;
}

/* ============================================================================
    RESPONSIVE DESIGN
    ============================================================================ */

/* Tablet styles (769px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  .form-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-5);
  }

  .filters-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--spacing-3);
  }

  .settings-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--spacing-5);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .card-header,
  .card-body {
    padding: var(--spacing-5);
  }

  .tab-buttons {
    flex-wrap: wrap;
  }

  .tab-button {
    flex: 1 1 auto;
    min-width: 120px;
  }

  .form-input,
  .form-select,
  .form-textarea {
    font-size: var(--font-size-sm);
  }

  .upload-label {
    padding: var(--spacing-7);
  }

  .upload-icon {
    font-size: var(--font-size-3xl);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: var(--spacing-4);
    text-align: center;
  }

  .header-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-lg);
  }

  .page-title {
    font-size: var(--font-size-2xl);
    line-height: 1.3;
  }

  .page-subtitle {
    font-size: var(--font-size-sm);
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }

  .card-header,
  .card-body {
    padding: var(--spacing-4);
  }

  .card-title {
    font-size: var(--font-size-lg);
  }

  .tab-buttons {
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .tab-button {
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-sm);
    min-height: 44px; /* Touch-friendly */
  }

  .ai-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }

  .character-info {
    justify-content: center;
    font-size: var(--font-size-xs);
  }

  .form-actions {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .form-actions .btn {
    width: 100%;
    min-height: 48px; /* Touch-friendly */
    font-size: var(--font-size-base);
  }

  .upload-label {
    padding: var(--spacing-6);
  }

  .upload-icon {
    font-size: var(--font-size-3xl);
  }

  .upload-text,
  .upload-hint {
    font-size: var(--font-size-sm);
  }

  .form-label {
    font-size: var(--font-size-sm);
  }

  .form-input,
  .form-select,
  .form-textarea {
    font-size: var(--font-size-base);
    min-height: 44px; /* Touch-friendly */
  }

  .voice-info-card,
  .voice-filters-section,
  .voice-settings-section {
    padding: var(--spacing-4);
  }

  .voice-info-title {
    font-size: var(--font-size-base);
  }

  .settings-title {
    font-size: var(--font-size-base);
  }

  .preset-buttons {
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .preset-buttons .btn {
    width: 100%;
    min-height: 44px;
  }

  .stream-input {
    font-size: var(--font-size-base);
    min-height: 44px;
  }

  .video-element {
    max-height: 250px;
  }

  .media-preview-section {
    padding: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .container {
    padding-left: var(--spacing-2);
    padding-right: var(--spacing-2);
  }

  .page-header {
    margin-bottom: var(--spacing-4);
    padding: var(--spacing-3);
  }

  .page-title {
    font-size: var(--font-size-xl);
    letter-spacing: var(--letter-spacing-tight);
  }

  .page-subtitle {
    font-size: var(--font-size-xs);
  }

  .card-header,
  .card-body {
    padding: var(--spacing-3);
  }

  .card-title {
    font-size: var(--font-size-base);
  }

  .form-actions {
    padding: var(--spacing-4);
  }

  .form-input,
  .form-select,
  .form-textarea {
    font-size: var(--font-size-sm);
    padding: var(--spacing-2) var(--spacing-3);
  }

  .form-select,
  .filter-select,
  .voice-select {
    background-size: 1.25em 1.25em;
    padding-right: 2rem;
  }

  .tab-button {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-xs);
    min-height: 40px;
  }

  .upload-label {
    padding: var(--spacing-4);
  }

  .upload-icon {
    font-size: var(--font-size-2xl);
  }

  .upload-text {
    font-size: var(--font-size-xs);
  }

  .upload-hint {
    font-size: var(--font-size-xs);
  }

  .voice-info-card,
  .voice-filters-section,
  .voice-settings-section {
    padding: var(--spacing-3);
  }

  .stream-input {
    font-size: var(--font-size-sm);
    padding-left: 2rem;
  }

  .video-element {
    max-height: 200px;
  }

  .media-preview-section {
    padding: var(--spacing-3);
  }

  .btn {
    font-size: var(--font-size-sm);
    padding: var(--spacing-2) var(--spacing-4);
    min-height: 44px;
  }

  .btn-sm {
    font-size: var(--font-size-xs);
    padding: var(--spacing-1) var(--spacing-3);
    min-height: 40px;
  }
}

/* ============================================================================
   ANIMATIONS
   ============================================================================ */

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.card {
  animation: slideInUp 0.3s ease-out;
}

.card:nth-child(2) {
  animation-delay: 0.1s;
}

.card:nth-child(3) {
  animation-delay: 0.2s;
}

/* ============================================================================
    ACCESSIBILITY & FOCUS MANAGEMENT
    ============================================================================ */

.tab-button:focus-visible,
.form-input:focus-visible,
.form-select:focus-visible,
.form-textarea:focus-visible,
.btn:focus-visible,
.upload-label:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .form-input,
  .form-select,
  .form-textarea {
    border-width: 2px;
  }

  .card {
    border-width: 2px;
  }

  .tab-button.active {
    border-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .card,
  .file-validation-error,
  .media-preview-section {
    animation: none;
  }

  .form-input,
  .form-select,
  .form-textarea,
  .btn {
    transition: none;
  }
}

/* ============================================================================
   DARK MODE SUPPORT
   ============================================================================ */

@media (prefers-color-scheme: light) {
  .page-header,
  .card,
  .audio-preview,
  .form-actions {
    background: linear-gradient(135deg, var(--color-neutral-50), var(--color-neutral-100));
    border-color: var(--color-neutral-200);
  }

  .card-header {
    background: linear-gradient(135deg, var(--color-neutral-100), var(--color-neutral-200));
  }

  .form-input,
  .form-select,
  .form-textarea {
    background-color: black;
    border-color: var(--color-neutral-300);
    color: var(--color-neutral-900);
  }

  .form-input:hover,
  .form-select:hover,
  .form-textarea:hover {
    background-color: black;
    border-color: var(--color-neutral-400);
  }
}

/* ============================================================================
   VOICE INFO CARD & SETTINGS
   ============================================================================ */

.voice-info-card {
  background: linear-gradient(135deg, var(--color-surface-secondary), var(--color-surface-tertiary));
  border: var(--border-width-1) solid var(--color-border-primary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-md);
}

.voice-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.voice-info-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);

  i {
    color: var(--color-primary-500);
  }
}

.voice-badge {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-3);
  background-color: var(--color-primary-100);
  color: var(--color-primary-800);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.voice-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-4);
  line-height: 1.6;
}

.voice-properties {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.voice-property {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);

  i {
    color: var(--color-text-muted);
    margin-top: 0.2rem;
  }
}

.property-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.property-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.property-value {
  color: var(--color-text-primary);
}

.property-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.property-tag {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-surface-primary);
  border: var(--border-width-1) solid var(--color-border-secondary);
  border-radius: var(--border-radius-base);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.preview-audio-player {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: var(--border-width-1) solid var(--color-border-primary);
}

.audio-element-small {
  width: 100%;
  height: 40px;
  border-radius: var(--border-radius-lg);
  background-color: var(--color-surface-primary);
}

/* Voice Settings Section */
.voice-settings-section {
  background-color: var(--color-surface-primary);
  border: var(--border-width-1) solid var(--color-border-primary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.settings-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-6) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  i {
    color: var(--color-primary-500);
  }
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.setting-control {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.setting-value {
  font-family: var(--font-family-mono);
  color: var(--color-primary-600);
  font-size: var(--font-size-sm);
}

.setting-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: var(--border-radius-full);
  background: linear-gradient(to right,
    var(--color-primary-200) 0%,
    var(--color-primary-500) var(--slider-percent, 50%),
    var(--color-surface-tertiary) var(--slider-percent, 50%)
  );
  outline: none;
  cursor: pointer;
  transition: var(--transition-base);
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary-600);
  border: 2px solid var(--color-surface-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: var(--transition-base);
}

.setting-slider::-webkit-slider-thumb:hover {
  background: var(--color-primary-700);
  transform: scale(1.1);
}

.setting-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary-600);
  border: 2px solid var(--color-surface-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: var(--transition-base);
}

.setting-slider::-moz-range-thumb:hover {
  background: var(--color-primary-700);
  transform: scale(1.1);
}

.setting-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary-600);
}

.setting-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
}

/* Help Icons */
.help-icon {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  cursor: help;
  margin-left: var(--spacing-1);
  transition: var(--transition-base);
  display: inline-block;
  vertical-align: middle;
}

.help-icon:hover {
  color: var(--color-primary-500);
  transform: scale(1.1);
}

.label-with-help {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

/* Preset Section */
.preset-section {
  padding-top: var(--spacing-4);
  border-top: var(--border-width-1) solid var(--color-border-primary);
}

.preset-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-3) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  i:not(.help-icon) {
    color: var(--color-primary-500);
  }
}

/* Preset Buttons */
.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
}

/* Enhanced hints with icons */
.setting-hint {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-1);

  i {
    color: var(--color-warning-500);
    font-size: var(--font-size-xs);
    margin-top: 0.15rem;
    flex-shrink: 0;
  }

  strong {
    color: var(--color-primary-600);
    font-weight: var(--font-weight-semibold);
  }
}

/* Preview button enhancement */
.preview-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  white-space: nowrap;
  transition: var(--transition-base);
}

.preview-btn:hover:not(:disabled) {
  background-color: var(--color-success-100);
  color: var(--color-success-700);
  border-color: var(--color-success-300);
}

.preview-btn i {
  transition: var(--transition-base);
}

.preview-btn:hover:not(:disabled) i {
  transform: scale(1.1);
}

/* Char counter enhancement */
.char-counter {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-surface-tertiary);
  border-radius: var(--border-radius-base);
  margin-left: auto;
}

/* ============================================================================
   VOICE FILTERS SECTION
   ============================================================================ */

.voice-filters-section {
  background: linear-gradient(135deg, var(--color-surface-secondary), var(--color-surface-tertiary));
  border: var(--border-width-1) solid var(--color-border-primary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.filters-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  i {
    color: var(--color-primary-500);
  }
}

.filter-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--spacing-2);
  background-color: var(--color-primary-500);
  color: var(--color-text-on-primary);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  margin-left: var(--spacing-2);
}

/* Search Input */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.search-icon {
  position: absolute;
  left: var(--spacing-4);
  color: var(--color-text-muted);
  pointer-events: none;
  font-size: var(--font-size-base);
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-3) calc(var(--spacing-4) * 2.5);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-surface-primary);
  border: var(--border-width-2) solid var(--color-border-secondary);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
  outline: none;
}

.search-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.clear-search-btn {
  position: absolute;
  right: var(--spacing-3);
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--spacing-2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-base);
  transition: var(--transition-base);
}

.clear-search-btn:hover {
  color: var(--color-danger-500);
  background-color: var(--color-surface-hover);
}

/* Filters Grid */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  i {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }
}

.filter-select {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-surface-primary);
  border: var(--border-width-1) solid var(--color-border-secondary);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
  cursor: pointer;
  outline: none;
}

.filter-select:hover {
  border-color: var(--color-border-tertiary);
  background-color: var(--color-surface-tertiary);
}

.filter-select:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Filter Results */
.filter-results {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-primary-50);
  border-left: 3px solid var(--color-primary-500);
  border-radius: var(--border-radius-base);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);

  i {
    color: var(--color-primary-500);
  }

  strong {
    color: var(--color-primary-700);
    font-weight: var(--font-weight-semibold);
  }
}

/* Voice Select Enhancement */
.voice-select {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  min-height: 44px;
}

.voice-select option {
  padding: var(--spacing-2);
}

/* Responsive for Voice Settings */
@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .voice-info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .preset-buttons {
    flex-direction: column;

    .btn-sm {
      width: 100%;
    }
  }
}

/* ============================================================================
   STREAM SECTION & FILE VALIDATION
   ============================================================================ */

.stream-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.url-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.stream-icon {
  position: absolute;
  left: var(--spacing-4);
  color: var(--color-text-muted);
  pointer-events: none;
  font-size: var(--font-size-base);
}

.stream-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-12) var(--spacing-3) calc(var(--spacing-4) * 2.5);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-surface-secondary);
  border: var(--border-width-2) solid var(--color-border-secondary);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-base);
  outline: none;
  font-family: var(--font-family-mono);
}

.stream-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: var(--color-surface-tertiary);
}

.stream-input::placeholder {
  color: var(--color-text-muted);
  font-family: var(--font-family-sans);
}

.clear-stream-btn {
  position: absolute;
  right: var(--spacing-3);
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--spacing-2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-base);
  transition: var(--transition-base);
  font-size: var(--font-size-lg);
}

.clear-stream-btn:hover {
  color: var(--color-danger-500);
  background-color: var(--color-surface-hover);
}

.error-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-danger-50);
  border-left: 3px solid var(--color-danger-500);
  border-radius: var(--border-radius-base);
  font-size: var(--font-size-sm);
  color: var(--color-danger-700);
  margin-top: var(--spacing-2);

  i {
    color: var(--color-danger-500);
    font-size: var(--font-size-sm);
  }
}

.stream-preview-section {
  background-color: var(--color-surface-tertiary);
  border: var(--border-width-1) solid var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.stream-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.stream-detail {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);

  i {
    color: var(--color-primary-500);
    width: 16px;
  }
}

.stream-label {
  font-weight: var(--font-weight-medium);
  min-width: 40px;
}

.stream-value {
  color: var(--color-text-primary);
  font-family: var(--font-family-mono);
  word-break: break-all;
}

/* File Validation Error */
.file-validation-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-danger-50);
  border-left: 3px solid var(--color-danger-500);
  border-radius: var(--border-radius-base);
  font-size: var(--font-size-sm);
  color: var(--color-danger-700);
  margin-top: var(--spacing-4);
  animation: slideInUp 0.3s ease-out;

  i {
    color: var(--color-danger-500);
    font-size: var(--font-size-base);
  }
}

.upload-label.has-error {
  border-color: var(--color-danger-400);
  background-color: var(--color-danger-50);

  &:hover {
    border-color: var(--color-danger-500);
    background-color: var(--color-danger-100);
  }
}

.text-danger {
  color: var(--color-danger-500) !important;
}

/* Media Preview Section */
.media-preview-section {
  margin-top: var(--spacing-6);
  padding: var(--spacing-6);
  background: linear-gradient(135deg, var(--color-surface-secondary), var(--color-surface-tertiary));
  border-radius: var(--border-radius-xl);
  border: var(--border-width-1) solid var(--color-border-primary);
  animation: slideInUp 0.4s ease-out;
}

.audio-preview-player,
.video-preview-player {
  margin-top: var(--spacing-3);
}

.video-element {
  width: 100%;
  max-height: 400px;
  border-radius: var(--border-radius-lg);
  background-color: var(--color-neutral-900);
  border: var(--border-width-1) solid var(--color-border-primary);
  box-shadow: var(--shadow-lg);
}

.video-element:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Responsive for Stream & File Validation */
@media (max-width: 768px) {
  .stream-input {
    padding-right: var(--spacing-10);
    font-size: var(--font-size-sm);
  }

  .stream-detail {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }

  .stream-label {
    font-weight: var(--font-weight-semibold);
  }

  .video-element {
    max-height: 250px;
  }

  .file-validation-error {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .stream-preview-section,
  .media-preview-section {
    padding: var(--spacing-4);
  }

  .video-element {
    max-height: 200px;
  }
}
</style>
