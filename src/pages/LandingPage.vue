<template>
  <div class="landing-page">
    <!-- Video Background -->
    <video
class="video-background"
autoplay
muted
loop
playsinline
>
      <source
:src="landingContent?.hero?.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-city-lights-at-night-4158-large.mp4'"
type="video/mp4"
>
    </video>

    <!-- Header -->
    <header
class="header"
:class="{ scrolled: isScrolled }"
>
      <div class="container">
        <nav class="nav">
          <a
href="#"
class="logo"
>
            Club
            <img
loading="lazy"
decoding="async"
width="50"
height="30"
src="https://laf5.com/wp-content/uploads/2025/09/Recurso-1.png"
alt="F5"
>
          </a>
          <ul
class="nav-links"
:class="{ active: mobileMenuOpen }"
>
            <li>
<a
href="#inicio"
@click="closeMobileMenu"
><i class="fas fa-home" /> Inicio</a>
</li>
            <li>
<a
href="#plataformas"
@click="closeMobileMenu"
><i class="fas fa-cog" /> Plataformas</a>
</li>
            <li>
<a
href="#caracteristicas"
@click="closeMobileMenu"
><i class="fas fa-star" /> Caracteristicas</a>
</li>
            <li>
<a
href="#registro"
@click="closeMobileMenu"
><i class="fas fa-user-plus" />Registro</a>
</li>
            <li>
              <a
href="https://web.clubf5.com"
target="_blank"
>
                <i class="fas fa-music" /> Reproductor
              </a>
            </li>
            <li>
              <a
href="#"
@click.prevent="openLoginModal"
>
                <i class="fas fa-sign-in-alt" /> Login
              </a>
            </li>
          </ul>
          <div
class="burger"
@click="toggleMobileMenu"
>
            <span />
            <span />
            <span />
          </div>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section
id="inicio"
class="hero"
>
      <div class="container">
        <div class="hero-content fade-in-up">
          <h1>{{ landingContent?.hero?.title || 'ClubF5' }}</h1>
          <p class="tagline">
{{ landingContent?.hero?.tagline || 'El placer de escuchar' }}
</p>
          <p class="subtitle">
            {{ landingContent?.hero?.subtitle || 'Plataforma integral de gestion de radio y streaming en tiempo real. Administra contenido, programacion y spots publicitarios desde una solucion completa y profesional.' }}
          </p>
          <div class="cta-buttons">
            <a
              v-for="button in (landingContent?.hero?.ctaButtons || [])"
              :key="button.id"
              :href="button.link"
              class="btn"
              :class="button.variant === 'primary' ? 'btn-primary' : 'btn-outline'"
            >
              <i
v-if="button.icon"
:class="button.icon"
/>
              {{ button.text }}
            </a>
            <!-- Fallback buttons if no content loaded -->
            <template v-if="!landingContent?.hero?.ctaButtons?.length">
              <a
href="#plataformas"
class="btn btn-primary"
>
                <i class="fas fa-play" />
                Explorar Plataformas
              </a>
              <a
href="#caracteristicas"
class="btn btn-outline"
>
                <i class="fas fa-info-circle" />
                Ver Caracteristicas
              </a>
            </template>
            <button
v-if="canInstallPwa"
class="btn btn-install"
@click="installPwa"
>
              <i class="fas fa-download" />
              Instalar App
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Platforms Section -->
    <section
id="plataformas"
class="section platforms"
>
      <div class="container">
        <div class="section-title">
          <h2>{{ landingContent?.platforms?.title || 'Nuestras Plataformas' }}</h2>
          <p>{{ landingContent?.platforms?.description || 'Soluciones disenadas para cada necesidad de tu negocio de radio' }}</p>
        </div>
        <div class="platforms-grid">
          <div
            v-for="platform in (landingContent?.platforms?.items || defaultPlatforms)"
            :key="platform.id"
            class="platform-card"
          >
            <i :class="platform.icon" />
            <h3>{{ platform.title }}</h3>
            <p>{{ platform.description }}</p>
            <ul class="platform-features">
              <li
v-for="(feature, index) in platform.features"
:key="index"
>
{{ feature }}
</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section
id="caracteristicas"
class="section"
>
      <div class="container">
        <div class="section-title">
          <h2>{{ landingContent?.features?.title || 'Caracteristicas Destacadas' }}</h2>
          <p>{{ landingContent?.features?.description || 'Tecnologia de vanguardia para una experiencia completa' }}</p>
        </div>
        <div class="features-grid">
          <div
            v-for="feature in (landingContent?.features?.items || defaultFeatures)"
            :key="feature.id"
            class="feature-card"
          >
            <i :class="[feature.icon, 'feature-icon']" />
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Registration Section -->
    <section
id="registro"
class="section registro"
>
      <div class="container">
        <div class="section-title">
          <h2>Registra tu Negocio</h2>
          <p>Comienza a disfrutar con ClubF5 en minutos. Selecciona tu plan ideal.</p>
        </div>

        <!-- Package Cards Grid -->
        <div class="paquetes-grid-cards">
          <div
v-if="loadingPaquetes"
class="paquetes-loading"
>
            <div class="spinner" />
            <p>Cargando paquetes disponibles...</p>
          </div>
          <div
v-else-if="paquetesError"
class="paquetes-loading"
>
            <i
class="fas fa-exclamation-triangle"
style="font-size: 2rem; color: #f87171; margin-bottom: 1rem;"
/>
            <p>No se pudieron cargar los paquetes. Intenta recargar la pagina.</p>
          </div>
          <div
v-else-if="paquetesData.length === 0"
class="paquetes-loading"
>
            <p>No hay paquetes disponibles en este momento.</p>
          </div>
          <template v-else>
            <div
v-for="paquete in paquetesData"
:key="paquete.codigo"
class="paquete-card-new"
>
              <div class="paquete-icon">
                <i class="fas fa-broadcast-tower" />
              </div>
              <div class="paquete-nombre">
{{ paquete.nombre }}
</div>
              <div class="paquete-precio">
                {{ formatPrecio(paquete.precio) }}
                <span>/ mes</span>
              </div>
              <ul class="paquete-detalles">
                <li v-if="paquete.cantidadEquipos">
{{ paquete.cantidadEquipos }} equipos incluidos
</li>
                <li v-if="paquete.maxSpots">
Hasta {{ paquete.maxSpots }} spots
</li>
                <li v-if="paquete.caracteristicas">
{{ paquete.caracteristicas }}
</li>
                <li>Soporte tecnico incluido</li>
                <li>Panel de administracion</li>
              </ul>
              <button
class="paquete-btn"
@click="openRegistroModal(paquete)"
>
                <i class="fas fa-check-circle" />
                Seleccionar Plan
              </button>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="section">
      <div class="container">
        <div class="stats">
          <div
            v-for="stat in (landingContent?.stats?.items || defaultStats)"
            :key="stat.id"
            class="stat-item"
          >
            <div class="stat-number">
{{ stat.number }}
</div>
            <div class="stat-label">
{{ stat.label }}
</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} {{ landingContent?.footer?.copyrightText || 'ClubF5. Todos los derechos reservados.' }}</p>
        </div>
      </div>
    </footer>

    <!-- Login Modal -->
    <LoginModal
      :show="showLoginModal"
      @close="closeLoginModal"
      @login-success="handleLoginSuccess"
    />

    <!-- Registration Modal -->
    <div
class="modal-overlay"
:class="{ active: showRegistroModal }"
@click.self="closeRegistroModal"
>
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-user-plus" /> Registro de Usuario</h3>
          <button
class="modal-close"
type="button"
@click="closeRegistroModal"
>
            <i class="fas fa-times" />
          </button>
        </div>
        <div class="modal-body">
          <!-- Selected Package Badge -->
          <div
v-if="selectedPaquete"
class="selected-package-badge"
>
            <div class="selected-package-info">
              <i class="fas fa-box-open" />
              <div class="selected-package-details">
                <h4>{{ selectedPaquete.nombre }}</h4>
                <span>{{ getPackageDetails(selectedPaquete) }}</span>
              </div>
            </div>
            <div class="selected-package-price">
{{ formatPrecio(selectedPaquete.precio) }}
</div>
          </div>

          <div
v-if="registroAlert.show"
class="form-alert show"
:class="registroAlert.type"
>
            {{ registroAlert.message }}
          </div>

          <form @submit.prevent="handleRegistroSubmit">
            <div class="form-group">
              <label>Nombre completo <span class="required">*</span></label>
              <input
v-model="registroForm.nombre"
type="text"
class="form-input"
placeholder="Nombre y apellido"
required
>
            </div>

            <div class="form-group">
              <label>Email (usuario de inicio de sesion) <span class="required">*</span></label>
              <input
v-model="registroForm.email"
type="email"
class="form-input"
placeholder="correo@ejemplo.com"
required
>
            </div>

            <div class="form-group">
              <label>Telefono <span class="required">*</span></label>
              <input
v-model="registroForm.telefono"
type="tel"
class="form-input"
placeholder="Numero de telefono"
required
>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Domicilio</label>
                <input
v-model="registroForm.domicilio"
type="text"
class="form-input"
placeholder="Calle y numero"
>
              </div>
              <div class="form-group">
                <label>Localidad</label>
                <input
v-model="registroForm.localidad"
type="text"
class="form-input"
placeholder="Ciudad / Localidad"
>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Contrasena <span class="required">*</span></label>
                <input
v-model="registroForm.password"
type="password"
class="form-input"
placeholder="Minimo 6 caracteres"
required
minlength="6"
>
              </div>
              <div class="form-group">
                <label>Confirmar Contrasena <span class="required">*</span></label>
                <input
v-model="registroForm.confirmPassword"
type="password"
class="form-input"
placeholder="Repetir contrasena"
required
>
              </div>
            </div>

            <div class="form-submit">
              <button
type="submit"
class="btn btn-primary"
:disabled="registroLoading"
>
                <span
v-if="registroLoading"
class="spinner"
style="width: 20px; height: 20px; border-width: 2px; display: inline-block; margin-right: 8px;"
/>
                <i
v-else
class="fas fa-paper-plane"
/>
                {{ registroLoading ? 'Enviando...' : 'Enviar Solicitud de Registro' }}
              </button>
            </div>
          </form>

          <div class="form-info">
            <i class="fas fa-info-circle" />
            Tu solicitud sera revisada por nuestro equipo. Te contactaremos por email una vez aprobada.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LoginModal from '@/components/LoginModal.vue'
import EmailApiService from '@/services/EmailApiService'
import LandingPageService from '@/services/LandingPageService'
const router = useRouter()
const route = useRoute()

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Landing Page Content (loaded from service)
const landingContent = ref(null)
const contentLoading = ref(true)

// State
const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const showLoginModal = ref(false)
const showRegistroModal = ref(false)
const selectedPaquete = ref(null)

// PWA Installation
const canInstallPwa = ref(false)
const deferredPrompt = ref(null)

// Packages
const paquetesData = ref([])
const loadingPaquetes = ref(true)
const paquetesError = ref(false)

// Default fallback data
const defaultPlatforms = [
  {
    id: 1,
    icon: 'fas fa-users-cog',
    title: 'Panel de control (Gestion)',
    description: 'Sistema completo de gestion de radio y publicidad con control total sobre programacion musica y publicidad.',
    features: [
      'Gestion de programacion de radio',
      'Control de spots publicitarios',
      'Gestion de locutores y clientes',
      'Generacion de voz con IA',
      'Panel de control en tiempo real'
    ]
  },
  {
    id: 2,
    icon: 'fas fa-mobile-alt',
    title: 'Reproductor',
    description: 'Experiencia de usuario premium con reproduccion en vivo, PWA y soporte offline.',
    features: [
      'Streaming de radio en vivo (HLS)',
      'Progressive Web App (PWA)',
      'Reproduccion offline',
      'Optimizado para moviles',
      'Actualizaciones en tiempo real'
    ]
  }
]

const defaultFeatures = [
  { id: 1, icon: 'fas fa-broadcast-tower', title: 'Streaming en Tiempo Real', description: 'Transmision de alta calidad con protocolo HLS y conexiones con sincronizacion instantanea.' },
  { id: 2, icon: 'fas fa-calendar-alt', title: 'Programacion Inteligente', description: 'Sistema avanzado de calendarizacion de contenido con gestion de horarios, repetidoras y dias habiles.' },
  { id: 3, icon: 'fas fa-ad', title: 'Gestion de Publicidad', description: 'Control completo de spots publicitarios, con seguimiento de reproducciones y generacion automatizada.' },
  { id: 4, icon: 'fas fa-microphone', title: 'Voz Sintetica con IA', description: 'Integracion con Agentes de IA para generar locuciones profesionales con inteligencia artificial.' }
]

const defaultStats = [
  { id: 1, number: '2', label: 'Plataformas Integradas' },
  { id: 2, number: '24/7', label: 'Transmision Continua' },
  { id: 3, number: '100%', label: 'Web Responsive' },
  { id: 4, number: 'PWA', label: 'Instalable' }
]

// Registration form
const registroForm = reactive({
  nombre: '',
  email: '',
  telefono: '',
  domicilio: '',
  localidad: '',
  password: '',
  confirmPassword: ''
})

const registroLoading = ref(false)
const registroAlert = reactive({
  show: false,
  type: 'info',
  message: ''
})

// Computed
const currentYear = computed(() => new Date().getFullYear())

// Methods
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const openLoginModal = () => {
  closeMobileMenu()
  showLoginModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeLoginModal = () => {
  showLoginModal.value = false
  document.body.style.overflow = ''
}

const handleLoginSuccess = () => {
  closeLoginModal()
  // Redirect to the original destination or dashboard
  const redirectPath = route.query.redirect || '/dashboard'
  router.push(redirectPath)
}

const handleScroll = () => {
  isScrolled.value = window.pageYOffset > 100
}

const formatPrecio = (precio) => {
  if (precio === null || precio === undefined) return 'Consultar'
  return `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
}

const getPackageDetails = (paquete) => {
  const detalles = []
  if (paquete.cantidadEquipos) detalles.push(`${paquete.cantidadEquipos} equipos`)
  if (paquete.maxSpots) detalles.push(`${paquete.maxSpots} spots`)
  return detalles.join(' - ') || 'Plan seleccionado'
}

const loadPaquetes = async () => {
  loadingPaquetes.value = true
  paquetesError.value = false

  try {
    const response = await fetch(`${API_BASE_URL}Paquete/publico`)
    if (!response.ok) throw new Error('Error al cargar paquetes')
    paquetesData.value = await response.json()
  } catch (error) {
    console.error('Error loading packages:', error)
    paquetesError.value = true
  } finally {
    loadingPaquetes.value = false
  }
}

const openRegistroModal = (paquete) => {
  selectedPaquete.value = paquete
  resetRegistroForm()
  showRegistroModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeRegistroModal = () => {
  showRegistroModal.value = false
  document.body.style.overflow = ''
  selectedPaquete.value = null
}

const resetRegistroForm = () => {
  registroForm.nombre = ''
  registroForm.email = ''
  registroForm.telefono = ''
  registroForm.domicilio = ''
  registroForm.localidad = ''
  registroForm.password = ''
  registroForm.confirmPassword = ''
  registroAlert.show = false
}

const showAlert = (message, type = 'info') => {
  registroAlert.message = message
  registroAlert.type = type
  registroAlert.show = true

  if (type !== 'success') {
    setTimeout(() => {
      registroAlert.show = false
    }, 5000)
  }
}

const handleRegistroSubmit = async () => {
  if (!selectedPaquete.value) {
    showAlert('Por favor selecciona un paquete antes de continuar.', 'error')
    return
  }

  if (registroForm.password !== registroForm.confirmPassword) {
    showAlert('Las contrasenas no coinciden.', 'error')
    return
  }

  if (registroForm.password.length < 6) {
    showAlert('La contrasena debe tener al menos 6 caracteres.', 'error')
    return
  }

  registroLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}ClienteProvisorio/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        CodigoPaquete: selectedPaquete.value.codigo,
        Nombre: registroForm.nombre,
        Email: registroForm.email,
        Telefono: registroForm.telefono,
        Domicilio: registroForm.domicilio || '',
        Localidad: registroForm.localidad || '',
        Password: registroForm.password
      })
    })

    const result = await response.json()

    if (response.ok) {
      showAlert('Solicitud enviada exitosamente! Te contactaremos pronto.', 'success')
      await EmailApiService.sendCustomEmail(registroForm.email, "Registro de nuevo cliente",result.message)
      resetRegistroForm()
      setTimeout(() => closeRegistroModal(), 3000)
    } else {
      showAlert(result.message || 'Error al enviar la solicitud. Intenta nuevamente.', 'error')
    }
  } catch (error) {
    console.error('Registration error:', error)
    showAlert('Error de conexion. Verifica tu conexion a internet e intenta nuevamente.', 'error')
  } finally {
    registroLoading.value = false
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (showLoginModal.value) closeLoginModal()
    if (showRegistroModal.value) closeRegistroModal()
  }
}

// PWA Installation handlers
const handleBeforeInstallPrompt = (e) => {
  e.preventDefault()
  deferredPrompt.value = e
  canInstallPwa.value = true
}

const handleAppInstalled = () => {
  canInstallPwa.value = false
  deferredPrompt.value = null
}

const installPwa = async () => {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  deferredPrompt.value = null
  canInstallPwa.value = false
}

// Load Landing Page Content
const loadLandingContent = async () => {
  try {
    contentLoading.value = true
    landingContent.value = await LandingPageService.getPublic()
  } catch (error) {
    console.error('Error loading landing content:', error)
    // Use default content as fallback
    landingContent.value = LandingPageService.getDefaultConfig()
  } finally {
    contentLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
  loadPaquetes()
  loadLandingContent()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>

<style scoped>
/* === VARIABLES === */
:root {
  --bg-dark: rgba(0, 0, 0, 0.7);
  --bg-panel: rgba(0, 0, 0, 0.75);
  --bg-card: rgba(0, 0, 0, 0.60);
  --accent-blue: #0189DD;
  --text-white: #ffffff;
  --text-light: rgba(255, 255, 255, 0.85);
  --border-radius: 12px;
  --font-main: 'Poppins', sans-serif;
  --transition-smooth: 0.25s ease;
}

/* === RESET & BASE === */
.landing-page {
  font-family: 'Poppins', sans-serif;
  color: #ffffff;
  background: #000;
  overflow-x: hidden;
  line-height: 1.6;
}

/* === VIDEO BACKGROUND === */
.video-background {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 110vw;
  height: 110vh;
  transform: translate(-50%, -50%);
  object-fit: cover;
  z-index: -1;
  opacity: 0.4;
}

/* === CONTAINER === */
.container {
  max-width: 1280px;
  width: 90%;
  margin: 0 auto;
  padding: 0 24px;
}

/* === HEADER === */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 1.5rem 0;
  transition: all 0.25s ease;
}

.header.scrolled {
  padding: 1rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.25s ease;
  font-size: 0.95rem;
}

.nav-links a:hover {
  color: #0189DD;
}

.nav-login-link {
  background: rgba(1, 137, 221, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(1, 137, 221, 0.3);
}

.nav-login-link:hover {
  background: rgba(1, 137, 221, 0.3);
}

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
}

.burger span {
  width: 28px;
  height: 3px;
  background: #ffffff;
  border-radius: 2px;
  transition: all 0.25s ease;
}

/* === HERO SECTION === */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8rem 0 4rem;
  background: linear-gradient(135deg, rgba(1, 137, 221, 0.1), rgba(0, 0, 0, 0.3));
}

.hero-content h1 {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.hero-content .tagline {
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2rem;
  font-weight: 400;
}

.hero-content .subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: rgba(255, 255, 255, 0.85);
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.8;
}

.cta-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.25s ease;
  border: 2px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #0189DD;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(1, 137, 221, 0.3);
}

.btn-primary:hover {
  background: #0175c0;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(1, 137, 221, 0.5);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border-color: #ffffff;
  color: #ffffff;
}

.btn-outline:hover {
  background: #ffffff;
  color: #000;
}

.btn-install {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
  animation: pulse-install 2s ease-in-out infinite;
}

.btn-install:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(34, 197, 94, 0.5);
}

@keyframes pulse-install {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 8px 32px rgba(34, 197, 94, 0.5);
  }
}

/* === SECTION STYLES === */
.section {
  padding: 6rem 0;
}

.section-title {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-title p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* === FEATURES GRID === */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: rgba(0, 0, 0, 0.60);
  padding: 2.5rem;
  border-radius: 12px;
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(1, 137, 221, 0.2);
  border-color: #0189DD;
}

.feature-icon {
  font-size: 3rem;
  color: #0189DD;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
}

/* === PLATFORMS SECTION === */
.platforms {
  background: rgba(0, 0, 0, 0.75);
  padding: 6rem 0;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
}

.platform-card {
  background: linear-gradient(135deg, rgba(1, 137, 221, 0.1), rgba(0, 0, 0, 0.4));
  padding: 3rem 2rem;
  border-radius: 12px;
  text-align: center;
  border: 2px solid rgba(1, 137, 221, 0.2);
  transition: all 0.25s ease;
}

.platform-card:hover {
  border-color: #0189DD;
  transform: scale(1.05);
  box-shadow: 0 16px 48px rgba(1, 137, 221, 0.3);
}

.platform-card i {
  font-size: 4rem;
  color: #0189DD;
  margin-bottom: 1.5rem;
}

.platform-card h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.platform-link {
  text-decoration: none;
  color: whitesmoke;
}

.platform-type {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: #0189DD;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.platform-features {
  list-style: none;
  margin-top: 1.5rem;
  text-align: left;
  padding: 0;
}

.platform-features li {
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
}

.platform-features li::before {
  content: "\2713";
  position: absolute;
  left: 0;
  color: #0189DD;
  font-weight: 700;
}

/* === STATS SECTION === */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  margin: 4rem 0;
  text-align: center;
}

.stat-item {
  padding: 2rem;
}

.stat-number {
  font-size: 3.5rem;
  font-weight: 700;
  color: #0189DD;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  font-weight: 600;
}

/* === REGISTRATION SECTION === */
.registro {
  background: linear-gradient(135deg, rgba(1, 137, 221, 0.05), rgba(0, 0, 0, 0.4));
  padding: 6rem 0;
}

.paquetes-grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.paquetes-loading {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.85);
}

.paquetes-loading .spinner {
  margin: 0 auto 1rem;
}

.paquete-card-new {
  background: rgba(0, 0, 0, 0.60);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
}

.paquete-card-new:hover {
  border-color: rgba(1, 137, 221, 0.5);
  background: rgba(1, 137, 221, 0.05);
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(1, 137, 221, 0.15);
}

.paquete-icon {
  width: 60px;
  height: 60px;
  background: rgba(1, 137, 221, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.paquete-icon i {
  font-size: 1.75rem;
  color: #0189DD;
}

.paquete-nombre {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.paquete-precio {
  font-size: 1.6rem;
  font-weight: 700;
  color: #0189DD;
  margin-bottom: 1rem;
}

.paquete-precio span {
  font-size: 0.9rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
}

.paquete-detalles {
  flex: 1;
  margin-bottom: 0.5rem;
  padding: 0;
  list-style: none;
}

.paquete-detalles li {
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 0.6rem;
  padding-left: 1.5rem;
  position: relative;
  font-size: 0.9rem;
}

.paquete-detalles li::before {
  content: "\f00c";
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  position: absolute;
  left: 0;
  color: #0189DD;
  font-size: 0.8rem;
}

.paquete-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #0189DD, #0175c0);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px rgba(1, 137, 221, 0.3);
}

.paquete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(1, 137, 221, 0.4);
  background: linear-gradient(135deg, #0195f0, #0189DD);
}

/* === FOOTER === */
.footer {
  background: rgba(0, 0, 0, 0.75);
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer-bottom {
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
}

/* === MODAL STYLES === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: linear-gradient(135deg, rgba(20, 20, 30, 0.98), rgba(10, 10, 20, 0.98));
  border: 1px solid rgba(1, 137, 221, 0.3);
  border-radius: 1rem;
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(30px) scale(0.95);
  transition: all 0.3s ease;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(1, 137, 221, 0.1);
}

.modal-overlay.active .modal-content {
  transform: translateY(0) scale(1);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(1, 137, 221, 0.1), transparent);
}

.modal-header h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.modal-header h3 i {
  color: #0189DD;
}

.modal-close {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.modal-body {
  padding: 2rem;
}

/* Selected Package Badge */
.selected-package-badge {
  background: linear-gradient(135deg, rgba(1, 137, 221, 0.15), rgba(1, 137, 221, 0.05));
  border: 1px solid rgba(1, 137, 221, 0.3);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.selected-package-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.selected-package-info i {
  font-size: 1.5rem;
  color: #0189DD;
}

.selected-package-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
}

.selected-package-details span {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
}

.selected-package-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0189DD;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.form-group label .required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  transition: all 0.25s ease;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.form-input:focus {
  outline: none;
  border-color: #0189DD;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(1, 137, 221, 0.15);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-submit {
  margin-top: 1.5rem;
}

.form-submit .btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  justify-content: center;
}

.form-alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: none;
}

.form-alert.show {
  display: block;
}

.form-alert.success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.form-alert.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.form-alert.info {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.form-info {
  background: rgba(1, 137, 221, 0.1);
  border: 1px solid rgba(1, 137, 221, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}

.form-info i {
  color: #0189DD;
  margin-right: 0.5rem;
}

/* Spinner */
.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #0189DD;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Fade In Animation */
.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .burger {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: 70%;
    max-width: 300px;
    background: rgba(0, 0, 0, 0.75);
    flex-direction: column;
    padding: 6rem 2rem 2rem;
    transition: right 0.25s ease;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  }

  .nav-links.active {
    right: 0;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .features-grid,
  .platforms-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .modal-content {
    max-height: 95vh;
    margin: 0.5rem;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .selected-package-badge {
    flex-direction: column;
    text-align: center;
  }

  .paquetes-grid-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    width: 95%;
  }

  .section {
    padding: 4rem 0;
  }

  .hero {
    padding: 6rem 0 3rem;
  }
}
</style>
