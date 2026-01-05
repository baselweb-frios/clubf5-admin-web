<template>
  <div class="page-container">
    <!-- Disclaimer Banner -->
    <div class="disclaimer-banner">
      <i class="fas fa-info-circle"></i>
      <div class="disclaimer-content">
        <strong>Nota importante:</strong> Los recibos mostrados son comprobantes internos de pago y
        <strong>NO tienen validez fiscal</strong>. Para recibos pagados, puede descargar la factura fiscal oficial adjunta si está disponible.
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="card-title-section">
          <i class="fas fa-receipt card-title-icon"></i>
          <h1 class="card-title">Mis Recibos</h1>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary" @click="loadFacturas" title="Recargar recibos">
            <i class="fas fa-sync-alt"></i>
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="stats-container" v-if="!loading">
        <div class="stat-card">
          <div class="stat-icon stat-icon-info">
            <i class="fas fa-receipt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Recibos</div>
            <div class="stat-value">{{ facturas.length }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-warning">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Pendientes</div>
            <div class="stat-value">{{ pendientesCount }}</div>
            <div class="stat-subvalue">{{ formatCurrency(pendientesTotal) }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-danger">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Vencidos</div>
            <div class="stat-value">{{ vencidasCount }}</div>
            <div class="stat-subvalue">{{ formatCurrency(vencidasTotal) }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Pagados</div>
            <div class="stat-value">{{ pagadasCount }}</div>
            <div class="stat-subvalue">{{ formatCurrency(pagadasTotal) }}</div>
          </div>
        </div>
      </div>

      <div class="card-body">
        <!-- Loading State -->
        <loading-spinner v-if="loading" :loading="true" text="Cargando recibos..." />

        <!-- Tabla de Recibos -->
        <div v-else class="table-wrapper">
          <table class="facturas-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Factura</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="facturas.length === 0">
                <td colspan="9" class="text-center empty-state">
                  <i class="fas fa-inbox empty-icon"></i>
                  <p>No tienes recibos registrados</p>
                </td>
              </tr>
              <tr v-for="factura in facturas" :key="factura.fac_codigo" :class="getRowClass(factura)">
                <td>
                  <span class="factura-numero">{{ factura.fac_numero }}</span>
                </td>
                <td>
                  <span class="date-text">{{ formatDate(factura.fac_fecha) }}</span>
                </td>
                <td>
                  <div class="vencimiento-cell">
                    <span class="date-text">{{ formatDate(factura.fac_vencimiento) }}</span>
                    <span v-if="isOverdue(factura) && factura.fac_estado === 'P'" class="overdue-indicator">
                      <i class="fas fa-exclamation-circle"></i>
                      Vencido
                    </span>
                    <span v-else-if="isDueSoon(factura) && factura.fac_estado === 'P'" class="due-soon-indicator">
                      <i class="fas fa-clock"></i>
                      Por vencer
                    </span>
                  </div>
                </td>
                <td>
                  <span class="amount-text">{{ formatCurrency(factura.fac_subtotal) }}</span>
                </td>
                <td>
                  <span class="amount-text">{{ formatCurrency(factura.fac_impuesto) }}</span>
                </td>
                <td>
                  <span class="amount-text amount-total">{{ formatCurrency(factura.fac_total) }}</span>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(factura.fac_estado)]">
                    <i class="fas" :class="getStatusIcon(factura.fac_estado)"></i>
                    {{ getStatusLabel(factura.fac_estado) }}
                  </span>
                </td>
                <td>
                  <!-- Columna de PDF de factura fiscal -->
                  <div class="factura-pdf-cell">
                    <span v-if="factura.fac_pdf_factura" class="pdf-attached" title="Factura fiscal adjunta">
                      <i class="fas fa-file-pdf"></i>
                    </span>
                    <span v-else-if="factura.fac_estado === 'G'" class="pdf-missing" title="Sin factura fiscal">
                      <i class="fas fa-minus"></i>
                    </span>
                    <span v-else class="pdf-na">-</span>
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="verDetalleFactura(factura)"
                      class="btn-icon"
                      title="Ver detalle"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button
                      v-if="factura.fac_pdf_factura"
                      @click="verPdfFactura(factura)"
                      class="btn-icon btn-icon-pdf"
                      title="Ver factura fiscal"
                    >
                      <i class="fas fa-file-pdf"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Ver Detalle -->
    <transition name="modal-fade" appear>
      <div v-if="showDetalleModal" class="modal-overlay" @click.self="showDetalleModal = false">
        <transition name="modal-scale" appear>
          <div class="modal-content modal-medium">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon modal-icon-info">
                  <i class="fas fa-receipt"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">Detalle de Recibo</h2>
                  <p class="modal-subtitle">{{ facturaDetalle?.fac_numero }}</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="showDetalleModal = false" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body" v-if="facturaDetalle">
              <!-- Información del Recibo -->
              <div class="detalle-section">
                <h4 class="detalle-section-title">
                  <i class="fas fa-info-circle"></i>
                  Información del Recibo
                </h4>
                <div class="detalle-grid">
                  <div class="detalle-item">
                    <span class="detalle-label">Número:</span>
                    <span class="detalle-value">{{ facturaDetalle.fac_numero }}</span>
                  </div>
                  <div class="detalle-item">
                    <span class="detalle-label">Fecha:</span>
                    <span class="detalle-value">{{ formatDate(facturaDetalle.fac_fecha) }}</span>
                  </div>
                  <div class="detalle-item">
                    <span class="detalle-label">Vencimiento:</span>
                    <span class="detalle-value">{{ formatDate(facturaDetalle.fac_vencimiento) }}</span>
                  </div>
                  <div class="detalle-item">
                    <span class="detalle-label">Estado:</span>
                    <span :class="['status-badge', getStatusClass(facturaDetalle.fac_estado)]">
                      <i class="fas" :class="getStatusIcon(facturaDetalle.fac_estado)"></i>
                      {{ getStatusLabel(facturaDetalle.fac_estado) }}
                    </span>
                  </div>
                  <div class="detalle-item" v-if="facturaDetalle.fac_fecha_pago">
                    <span class="detalle-label">Fecha de Pago:</span>
                    <span class="detalle-value">{{ formatDate(facturaDetalle.fac_fecha_pago) }}</span>
                  </div>
                  <div class="detalle-item" v-if="facturaDetalle.fac_metodo_pago">
                    <span class="detalle-label">Método de Pago:</span>
                    <span class="detalle-value">{{ facturaDetalle.fac_metodo_pago }}</span>
                  </div>
                  <div class="detalle-item detalle-item-full" v-if="facturaDetalle.fac_observaciones">
                    <span class="detalle-label">Observaciones:</span>
                    <span class="detalle-value">{{ facturaDetalle.fac_observaciones }}</span>
                  </div>
                </div>
              </div>

              <!-- Detalles de Líneas -->
              <div class="detalle-section" v-if="facturaDetalle.detalles && facturaDetalle.detalles.length > 0">
                <h4 class="detalle-section-title">
                  <i class="fas fa-list"></i>
                  Conceptos
                </h4>
                <table class="detalle-table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th class="text-right">Cantidad</th>
                      <th class="text-right">Precio Unit.</th>
                      <th class="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="detalle in facturaDetalle.detalles" :key="detalle.det_codigo">
                      <td>{{ detalle.det_concepto }}</td>
                      <td class="text-right">{{ detalle.det_cantidad }}</td>
                      <td class="text-right">{{ formatCurrency(detalle.det_precio_unitario) }}</td>
                      <td class="text-right">{{ formatCurrency(detalle.det_subtotal) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                      <td class="text-right"><strong>{{ formatCurrency(facturaDetalle.fac_subtotal) }}</strong></td>
                    </tr>
                    <tr>
                      <td colspan="3" class="text-right"><strong>IVA:</strong></td>
                      <td class="text-right"><strong>{{ formatCurrency(facturaDetalle.fac_impuesto) }}</strong></td>
                    </tr>
                    <tr class="total-final-row">
                      <td colspan="3" class="text-right"><strong>Total:</strong></td>
                      <td class="text-right"><strong>{{ formatCurrency(facturaDetalle.fac_total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Totales simples si no hay detalles -->
              <div class="detalle-section" v-else>
                <h4 class="detalle-section-title">
                  <i class="fas fa-calculator"></i>
                  Resumen
                </h4>
                <div class="totales-simple">
                  <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-value">{{ formatCurrency(facturaDetalle.fac_subtotal) }}</span>
                  </div>
                  <div class="total-row">
                    <span class="total-label">IVA:</span>
                    <span class="total-value">{{ formatCurrency(facturaDetalle.fac_impuesto) }}</span>
                  </div>
                  <div class="total-row total-row-final">
                    <span class="total-label">Total:</span>
                    <span class="total-value">{{ formatCurrency(facturaDetalle.fac_total) }}</span>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button @click="showDetalleModal = false" class="btn btn-secondary">
                  <i class="fas fa-times"></i>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFacturasStore } from '@/stores/facturas'
import facturaService from '@/services/FacturaServices'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const facturasStore = useFacturasStore()

const loading = computed(() => facturasStore.loading)
const facturas = computed(() => facturasStore.facturas)
const showDetalleModal = ref(false)
const facturaDetalle = ref(null)

// Computed estadísticas
const pendientesCount = computed(() => {
  return facturas.value.filter(f => f.fac_estado === 'P' && !isOverdue(f)).length
})

const pendientesTotal = computed(() => {
  return facturas.value
    .filter(f => f.fac_estado === 'P' && !isOverdue(f))
    .reduce((sum, f) => sum + (f.fac_total || 0), 0)
})

const vencidasCount = computed(() => {
  return facturas.value.filter(f => f.fac_estado === 'P' && isOverdue(f)).length
})

const vencidasTotal = computed(() => {
  return facturas.value
    .filter(f => f.fac_estado === 'P' && isOverdue(f))
    .reduce((sum, f) => sum + (f.fac_total || 0), 0)
})

const pagadasCount = computed(() => {
  return facturas.value.filter(f => f.fac_estado === 'G').length
})

const pagadasTotal = computed(() => {
  return facturas.value
    .filter(f => f.fac_estado === 'G')
    .reduce((sum, f) => sum + (f.fac_total || 0), 0)
})

// Methods
const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount || 0)
}

const isOverdue = (factura) => {
  if (!factura.fac_vencimiento || factura.fac_estado !== 'P') return false
  const dueDate = new Date(factura.fac_vencimiento)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
}

const isDueSoon = (factura) => {
  if (!factura.fac_vencimiento || factura.fac_estado !== 'P') return false
  const dueDate = new Date(factura.fac_vencimiento)
  const today = new Date()
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
  return daysUntilDue >= 0 && daysUntilDue <= 7
}

const getStatusLabel = (estado) => {
  const labels = {
    'P': 'Pendiente',
    'G': 'Pagado',
    'V': 'Vencido',
    'A': 'Anulado'
  }
  return labels[estado] || estado
}

const getStatusClass = (estado) => {
  const classes = {
    'P': 'status-warning',
    'G': 'status-success',
    'V': 'status-danger',
    'A': 'status-secondary'
  }
  return classes[estado] || 'status-secondary'
}

const getStatusIcon = (estado) => {
  const icons = {
    'P': 'fa-clock',
    'G': 'fa-check-circle',
    'V': 'fa-exclamation-triangle',
    'A': 'fa-ban'
  }
  return icons[estado] || 'fa-question'
}

const getRowClass = (factura) => {
  if (factura.fac_estado === 'A') return 'row-inactive'
  if (factura.fac_estado === 'P' && isOverdue(factura)) return 'row-overdue'
  return ''
}

const loadFacturas = async () => {
  try {
    await facturasStore.loadFacturas()
    console.log('[FacturasCliente] ✅ Facturas cargadas:', facturas.value.length)
  } catch (error) {
    console.error('[FacturasCliente] ❌ Error cargando facturas:', error)
  }
}

const verDetalleFactura = async (factura) => {
  try {
    // Intentar cargar detalles completos usando el store
    const facturaCompleta = await facturasStore.loadFacturaById(factura.fac_codigo)
    facturaDetalle.value = facturaCompleta || factura
  } catch (error) {
    // Si falla, usar los datos básicos
    console.warn('[FacturasCliente] No se pudieron cargar los detalles:', error)
    facturaDetalle.value = factura
  }
  showDetalleModal.value = true
}

const verPdfFactura = async (factura) => {
  try {
    await facturaService.verPdfFactura(factura.fac_codigo)
  } catch (error) {
    console.error('[FacturasCliente] Error al ver PDF de factura:', error)
    alert('Error al abrir el PDF de la factura fiscal')
  }
}

onMounted(async () => {
  if (authStore.userRole !== 'Cliente') {
    router.push('/dashboard')
    return
  }
  await loadFacturas()
})
</script>

<style scoped>
/* ===== PAGE LAYOUT ===== */
.page-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== DISCLAIMER BANNER ===== */
.disclaimer-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(234, 88, 12, 0.1));
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.disclaimer-banner > i {
  color: #f59e0b;
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.disclaimer-content {
  color: #fbbf24;
  font-size: 0.875rem;
  line-height: 1.5;
}

.disclaimer-content strong {
  color: #fcd34d;
}

/* ===== MAIN CONTENT CARD ===== */
.content-card {
  background: rgba(28, 31, 38, 0.95);
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(135deg, rgba(22, 24, 29, 1), rgba(15, 20, 25, 1));
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.card-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
  letter-spacing: -0.025em;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.card-body {
  padding: 2rem;
}

/* ===== STATISTICS ===== */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(22, 24, 29, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.stat-icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-icon-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-icon-success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
  line-height: 1;
}

.stat-subvalue {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(34, 37, 45, 1);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.btn-secondary:hover {
  background: rgba(40, 43, 52, 1);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.375rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: rgba(34, 37, 45, 1);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.1);
}

/* ===== TABLE ===== */
.table-wrapper {
  background: rgba(22, 24, 29, 0.8);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow-x: auto;
}

.facturas-table {
  width: 100%;
  border-collapse: collapse;
}

.facturas-table thead {
  background: rgba(34, 37, 45, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.facturas-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.facturas-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
}

.facturas-table tbody tr:last-child td {
  border-bottom: none;
}

.facturas-table tbody tr:hover {
  background: rgba(34, 37, 45, 1);
}

.facturas-table tbody tr.row-inactive {
  opacity: 0.6;
}

.facturas-table tbody tr.row-overdue {
  background: rgba(239, 68, 68, 0.05);
}

.facturas-table tbody tr.row-overdue:hover {
  background: rgba(239, 68, 68, 0.1);
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

/* ===== CELL CONTENT ===== */
.factura-numero {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(34, 37, 45, 1);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  font-family: monospace;
}

.date-text {
  color: #9ca3af;
  font-size: 0.875rem;
}

.amount-text {
  color: #9ca3af;
  font-size: 0.875rem;
}

.amount-total {
  font-weight: 600;
  color: #e5e7eb;
}

.vencimiento-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.overdue-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #ef4444;
}

.due-soon-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #f59e0b;
}

/* ===== STATUS BADGES ===== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
}

.status-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.status-success {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.status-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.status-secondary {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

/* ===== ACTION BUTTONS ===== */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-icon-pdf {
  color: #ef4444;
}

.btn-icon-pdf:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

/* ===== PDF COLUMN ===== */
.factura-pdf-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-attached {
  color: #22c55e;
  font-size: 1.125rem;
}

.pdf-missing {
  color: #6b7280;
  font-size: 0.875rem;
}

.pdf-na {
  color: #4b5563;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  padding: 2rem !important;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #6b7280;
  opacity: 0.3;
  margin-bottom: 0.75rem;
}

.empty-state p {
  color: #9ca3af;
  margin: 0;
}

/* ===== MODALS ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 20, 25, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: rgba(28, 31, 38, 0.98);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  max-width: 90vw;
  max-height: 90vh;
  width: 700px;
  overflow: hidden;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(22, 24, 29, 1), rgba(15, 20, 25, 1));
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.modal-title-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #e5e7eb;
}

.modal-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #9ca3af;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.modal-body {
  padding: 2rem;
  max-height: calc(90vh - 200px);
  overflow-y: auto;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(22, 24, 29, 1);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ===== DETAIL SECTIONS ===== */
.detalle-section {
  margin-bottom: 1.5rem;
}

.detalle-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.detalle-section-title i {
  color: #3b82f6;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detalle-item-full {
  grid-column: 1 / -1;
}

.detalle-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detalle-value {
  font-size: 0.875rem;
  color: #e5e7eb;
}

.detalle-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.detalle-table thead {
  background: rgba(34, 37, 45, 1);
}

.detalle-table th {
  padding: 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
}

.detalle-table td {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
}

.detalle-table tbody tr:last-child td {
  border-bottom: none;
}

.detalle-table tfoot td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.detalle-table tfoot tr.total-final-row td {
  border-top: 2px solid rgba(255, 255, 255, 0.06);
  padding-top: 0.75rem;
  font-size: 1rem;
}

/* ===== TOTALES SIMPLE ===== */
.totales-simple {
  background: rgba(22, 24, 29, 0.8);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.total-row:last-child {
  border-bottom: none;
}

.total-row-final {
  padding-top: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-top: 2px solid rgba(255, 255, 255, 0.06);
}

.total-label {
  font-weight: 600;
  color: #9ca3af;
}

.total-value {
  font-weight: 700;
  color: #e5e7eb;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .facturas-table {
    min-width: 700px;
  }

  .detalle-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>
