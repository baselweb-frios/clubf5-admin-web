<template>
  <div class="h-screen flex flex-col bg-[#0a0e17] text-[#c5cdd8] overflow-hidden">
    <!-- Top Bar -->
    <div class="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-[#1e2d3d] flex-shrink-0">
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-pen-ruler text-[#58a6ff]"></i>
        <h1 class="text-sm font-semibold text-[#e6edf3]">Landing Page Editor</h1>
        <span v-if="hasUnsavedChanges" class="text-[10px] text-[#d29922] flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-[#d29922]"></span>
          Unsaved changes
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded text-[#c5cdd8] hover:bg-[#1c2333] transition-all flex items-center gap-1.5"
          @click="showPreview = !showPreview"
        >
          <i class="fa-solid" :class="showPreview ? 'fa-eye-slash' : 'fa-eye'"></i>
          {{ showPreview ? 'Hide' : 'Show' }} Preview
        </button>
        <button
          class="px-3 py-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded text-[#c5cdd8] hover:bg-[#1c2333] transition-all flex items-center gap-1.5"
          @click="exportConfig"
        >
          <i class="fa-solid fa-download"></i>
          Export
        </button>
        <button
          class="px-3 py-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded text-[#c5cdd8] hover:bg-[#1c2333] transition-all flex items-center gap-1.5"
          @click="triggerImport"
        >
          <i class="fa-solid fa-upload"></i>
          Import
        </button>
        <button
          class="px-3 py-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded text-[#c5cdd8] hover:bg-[#1c2333] transition-all flex items-center gap-1.5"
          @click="resetAllToDefault"
        >
          <i class="fa-solid fa-rotate-left"></i>
          Reset
        </button>
        <button
          class="px-3 py-1.5 text-xs bg-[#238636] text-white rounded hover:bg-[#2ea043] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          :disabled="saving"
          @click="saveConfig"
        >
          <i class="fa-solid fa-floppy-disk" :class="{ 'fa-spin': saving }"></i>
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left Panel: Editor -->
      <div
        class="flex flex-col border-r border-[#1e2d3d] overflow-hidden transition-all duration-300"
        :class="showPreview ? 'w-1/2' : 'w-full'"
      >
        <!-- Section Tabs -->
        <div class="flex items-center gap-1 px-3 py-2 bg-[#0d1117] border-b border-[#1e2d3d] overflow-x-auto flex-shrink-0">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5"
            :class="activeTab === tab.id
              ? 'bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/30'
              : 'text-[#5a6a7a] hover:text-[#c5cdd8] hover:bg-[#161b22] border border-transparent'"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon" class="text-[10px]"></i>
            {{ tab.name }}
          </button>
        </div>

        <!-- Editor Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <transition name="fade" mode="out-in">
            <hero-section
              v-if="activeTab === 'hero'"
              :key="'hero'"
              v-model="config.hero"
              :default-data="defaultConfig.hero"
            />
            <platforms-section
              v-else-if="activeTab === 'platforms'"
              :key="'platforms'"
              v-model="config.platforms"
              :default-data="defaultConfig.platforms"
            />
            <features-section
              v-else-if="activeTab === 'features'"
              :key="'features'"
              v-model="config.features"
              :default-data="defaultConfig.features"
            />
            <stats-section
              v-else-if="activeTab === 'stats'"
              :key="'stats'"
              v-model="config.stats"
              :default-data="defaultConfig.stats"
            />
            <footer-section
              v-else-if="activeTab === 'footer'"
              :key="'footer'"
              v-model="config.footer"
              :default-data="defaultConfig.footer"
            />
          </transition>
        </div>
      </div>

      <!-- Right Panel: Live Preview -->
      <div
        v-if="showPreview"
        class="flex flex-col overflow-hidden transition-all duration-300"
        :class="showPreview ? 'w-1/2' : 'w-0'"
      >
        <!-- Preview Toolbar -->
        <div class="flex items-center justify-between px-3 py-2 bg-[#0d1117] border-b border-[#1e2d3d] flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-[#5a6a7a] uppercase tracking-wider">Live Preview</span>
            <span class="w-2 h-2 rounded-full bg-[#28c840] animate-pulse"></span>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-for="d in devices"
              :key="d.id"
              class="p-1.5 rounded text-[#5a6a7a] hover:text-[#c5cdd8] transition-colors"
              :class="{ 'text-[#58a6ff] bg-[#58a6ff]/10': previewDevice === d.id }"
              @click="previewDevice = d.id"
              :title="d.label"
            >
              <i :class="d.icon" class="text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Preview Frame -->
        <div class="flex-1 bg-[#0a0e17] flex items-start justify-center p-4 overflow-auto">
          <div
            class="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 border border-[#30363d]"
            :style="deviceStyles"
          >
            <iframe
              ref="previewIframe"
              :srcdoc="previewHtml"
              class="w-full border-0"
              style="height: 700px;"
              title="Landing preview"
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Toast -->
    <transition name="slide-up">
      <div
        v-if="toast.show"
        class="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-lg"
        :class="toast.type === 'success' ? 'bg-[#238636] text-white' : 'bg-[#f85149] text-white'"
      >
        <i class="fa-solid" :class="toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        {{ toast.message }}
      </div>
    </transition>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleFileImport">
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import LandingPageService from '@/services/LandingPageService'
import HeroSection from './components/HeroSection.vue'
import PlatformsSection from './components/PlatformsSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import StatsSection from './components/StatsSection.vue'
import FooterSection from './components/FooterSection.vue'

const appToast = useToast()

// State
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('hero')
const showPreview = ref(true)
const previewDevice = ref('desktop')
const defaultConfig = ref(LandingPageService.getDefaultConfig())
const config = ref(JSON.parse(JSON.stringify(defaultConfig.value)))
const originalConfig = ref(JSON.parse(JSON.stringify(defaultConfig.value)))
const fileInput = ref(null)
const previewIframe = ref(null)

const toast = reactive({ show: false, type: 'success', message: '' })

const hasUnsavedChanges = computed(() => {
  return JSON.stringify(config.value) !== JSON.stringify(originalConfig.value)
})

const tabs = [
  { id: 'hero', name: 'Hero', icon: 'fa-solid fa-house' },
  { id: 'platforms', name: 'Platforms', icon: 'fa-solid fa-display' },
  { id: 'features', name: 'Features', icon: 'fa-solid fa-star' },
  { id: 'stats', name: 'Stats', icon: 'fa-solid fa-chart-simple' },
  { id: 'footer', name: 'Footer', icon: 'fa-solid fa-shoe-prints' }
]

const devices = [
  { id: 'desktop', label: 'Desktop', icon: 'fa-solid fa-display' },
  { id: 'tablet', label: 'Tablet', icon: 'fa-solid fa-tablet-screen-button' },
  { id: 'mobile', label: 'Mobile', icon: 'fa-solid fa-mobile-screen-button' }
]

const deviceStyles = computed(() => {
  const map = {
    desktop: { width: '100%', maxWidth: '100%' },
    tablet: { width: '768px' },
    mobile: { width: '375px' }
  }
  return map[previewDevice.value]
})

// Preview HTML generation
const previewHtml = computed(() => {
  const c = config.value
  const hero = c.hero || {}
  const platforms = c.platforms || {}
  const features = c.features || {}
  const stats = c.stats || {}
  const footer = c.footer || {}

  const ctaButtons = (hero.ctaButtons || []).map(b => `
    <a href="${b.link || '#'}" class="cta-btn ${b.variant === 'primary' ? 'cta-primary' : 'cta-outline'}">
      ${b.icon ? `<i class="${b.icon}"></i>` : ''} ${b.text || 'Button'}
    </a>
  `).join('')

  const platformCards = (platforms.items || []).map(p => `
    <div class="card">
      <div class="card-icon"><i class="${p.icon || 'fa-solid fa-display'}"></i></div>
      <h3>${p.title || 'Platform'}</h3>
      <p>${p.description || ''}</p>
      <ul>${(p.features || []).filter(Boolean).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}</ul>
    </div>
  `).join('')

  const featureCards = (features.items || []).map(f => `
    <div class="feature-card">
      <div class="feature-icon"><i class="${f.icon || 'fa-solid fa-star'}"></i></div>
      <h4>${f.title || 'Feature'}</h4>
      <p>${f.description || ''}</p>
    </div>
  `).join('')

  const statItems = (stats.items || []).map(s => `
    <div class="stat-item">
      <div class="stat-number">${s.value || '0'}</div>
      <div class="stat-label">${s.label || ''}</div>
    </div>
  `).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;color:#fff;background:#0a0e17}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 50%,rgba(99,102,241,0.15),transparent 60%)}
.hero-content{position:relative;z-index:1;max-width:800px}
.hero h1{font-size:3.5rem;font-weight:800;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.5rem}
.hero .tagline{font-size:1.5rem;color:#c5cdd8;margin-bottom:1rem}
.hero .subtitle{font-size:1.1rem;color:#8b949e;margin-bottom:2rem;line-height:1.6}
.cta-group{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.cta-btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.5rem;border-radius:9999px;font-weight:600;font-size:0.95rem;text-decoration:none;transition:all 0.2s}
.cta-primary{background:#6366f1;color:#fff}.cta-primary:hover{background:#4f46e5;transform:translateY(-1px)}
.cta-outline{border:2px solid rgba(255,255,255,0.3);color:#fff}.cta-outline:hover{border-color:#fff;background:rgba(255,255,255,0.05)}
.section{padding:4rem 2rem;max-width:1200px;margin:0 auto}
.section-header{text-align:center;margin-bottom:3rem}
.section-header h2{font-size:2rem;font-weight:700;margin-bottom:0.5rem}
.section-header p{color:#8b949e;font-size:1.05rem}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
.card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:1rem;padding:2rem;transition:all 0.2s}
.card:hover{border-color:rgba(99,102,241,0.3);transform:translateY(-2px)}
.card-icon{width:3rem;height:3rem;border-radius:0.75rem;background:rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:1rem}
.card-icon i{font-size:1.25rem;color:#818cf8}
.card h3{font-size:1.15rem;font-weight:600;margin-bottom:0.5rem}
.card p{color:#8b949e;font-size:0.9rem;line-height:1.5;margin-bottom:1rem}
.card ul{list-style:none;display:flex;flex-direction:column;gap:0.4rem}
.card ul li{font-size:0.85rem;color:#c5cdd8;display:flex;align-items:center;gap:0.4rem}
.card ul li i{color:#28c840;font-size:0.7rem}
.feature-card{text-align:center;padding:1.5rem}
.feature-icon{width:2.5rem;height:2.5rem;border-radius:0.5rem;background:rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem}
.feature-icon i{color:#818cf8}
.feature-card h4{font-size:1rem;font-weight:600;margin-bottom:0.4rem}
.feature-card p{color:#8b949e;font-size:0.85rem;line-height:1.4}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1.5rem;text-align:center}
.stat-number{font-size:2.5rem;font-weight:800;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat-label{color:#8b949e;font-size:0.9rem;margin-top:0.25rem}
.footer-section{background:rgba(0,0,0,0.3);padding:3rem 2rem;text-align:center}
.footer-section p{color:#5a6a7a;font-size:0.85rem}
</style></head><body>
<section class="hero">
  <div class="hero-content">
    <h1>${hero.title || 'ClubF5'}</h1>
    <p class="tagline">${hero.tagline || ''}</p>
    <p class="subtitle">${hero.subtitle || ''}</p>
    <div class="cta-group">${ctaButtons}</div>
  </div>
</section>
${platforms.items?.length ? `<section class="section"><div class="section-header"><h2>${platforms.title || ''}</h2><p>${platforms.description || ''}</p></div><div class="cards-grid">${platformCards}</div></section>` : ''}
${features.items?.length ? `<section class="section"><div class="section-header"><h2>${features.title || ''}</h2><p>${features.description || ''}</p></div><div class="cards-grid">${featureCards}</div></section>` : ''}
${stats.items?.length ? `<section class="section"><div class="stats-grid">${statItems}</div></section>` : ''}
${footer.text ? `<footer class="footer-section"><p>${footer.text}</p></footer>` : ''}
</body></html>`
})

// Methods
const loadConfig = async () => {
  try {
    loading.value = true
    config.value = await LandingPageService.get()
    defaultConfig.value = LandingPageService.getDefaultConfig()
    originalConfig.value = JSON.parse(JSON.stringify(config.value))
  } catch (error) {
    console.error('Error loading config:', error)
    config.value = LandingPageService.getDefaultConfig()
    defaultConfig.value = LandingPageService.getDefaultConfig()
    originalConfig.value = JSON.parse(JSON.stringify(config.value))
    showToast('Error loading config', 'error')
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  try {
    saving.value = true
    await LandingPageService.update(config.value)
    originalConfig.value = JSON.parse(JSON.stringify(config.value))
    showToast('Changes saved successfully', 'success')
  } catch (error) {
    console.error('Error saving config:', error)
    showToast('Error saving changes', 'error')
  } finally {
    saving.value = false
  }
}

const resetAllToDefault = async () => {
  if (!confirm('This will restore all settings to defaults. This action cannot be undone.')) return
  try {
    loading.value = true
    config.value = await LandingPageService.resetToDefault()
    defaultConfig.value = LandingPageService.getDefaultConfig()
    originalConfig.value = JSON.parse(JSON.stringify(config.value))
    showToast('Configuration restored to defaults', 'success')
  } catch (error) {
    console.error('Error resetting config:', error)
    showToast('Error restoring configuration', 'error')
  } finally {
    loading.value = false
  }
}

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

const exportConfig = () => {
  const dataStr = JSON.stringify(config.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', `landing-config-${new Date().toISOString().split('T')[0]}.json`)
  linkElement.click()
  showToast('Configuration exported', 'success')
}

const triggerImport = () => { fileInput.value?.click() }

const handleFileImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const importedConfig = JSON.parse(text)
    if (!importedConfig.hero || !importedConfig.platforms) throw new Error('Invalid file format')
    config.value = importedConfig
    showToast('Configuration imported. Save to apply.', 'success')
  } catch (error) {
    showToast('Import error: ' + error.message, 'error')
  }
  event.target.value = ''
}

onMounted(() => { loadConfig() })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(1rem); opacity: 0; }
.hidden { display: none; }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0d1117; }
::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #484f58; }
</style>