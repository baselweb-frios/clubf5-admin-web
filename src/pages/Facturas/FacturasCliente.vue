<template>
  <div class="page-wrapper">
    <!-- Disclaimer Banner -->
    <div class="alert alert-info mb-6 max-w-4xl mx-auto">
      <i class="fas fa-info-circle flex-shrink-0" />
      <div>
        <strong>Nota importante:</strong> Los recibos mostrados son comprobantes internos de pago y
        <strong>NO tienen validez fiscal</strong>. Para recibos pagados, puede descargar la recibo fiscal oficial adjunta si está disponible.
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="page-content">
      <div class="card">
        <div class="flex-between mb-6 pb-6 border-b border-dark-border">
          <div class="flex-start gap-4">
            <i class="fas fa-receipt text-2xl text-primary-400" />
            <h1 class="text-2xl font-bold text-text-primary">
Mis Recibos
</h1>
          </div>
          <button
class="btn btn-secondary"
title="Recargar recibos"
@click="loadFacturas"
>
            <i class="fas fa-sync-alt" />
            <span>Refrescar</span>
          </button>
        </div>

        <!-- Estadísticas -->
        <div
v-if="!loading"
class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
>
          <div class="card p-4">
            <div class="flex-start gap-3 mb-2">
              <i class="fas fa-receipt text-lg text-info-400" />
              <div class="text-sm text-text-secondary">
Total Recibos
</div>
            </div>
            <div class="text-2xl font-bold text-text-primary">
{{ facturas.length }}
</div>
          </div>

          <div class="card p-4">
            <div class="flex-start gap-3 mb-2">
              <i class="fas fa-clock text-lg text-warning-400" />
              <div class="text-sm text-text-secondary">
Pendientes
</div>
            </div>
            <div class="text-2xl font-bold text-text-primary">
{{ pendientesCount }}
</div>
            <div class="text-xs text-text-tertiary mt-1">
{{ formatCurrency(pendientesTotal) }}
</div>
          </div>

          <div class="card p-4">
            <div class="flex-start gap-3 mb-2">
              <i class="fas fa-exclamation-triangle text-lg text-danger-400" />
              <div class="text-sm text-text-secondary">
Vencidos
</div>
            </div>
            <div class="text-2xl font-bold text-text-primary">
{{ vencidasCount }}
</div>
            <div class="text-xs text-text-tertiary mt-1">
{{ formatCurrency(vencidasTotal) }}
</div>
          </div>

          <div class="card p-4">
            <div class="flex-start gap-3 mb-2">
              <i class="fas fa-check-circle text-lg text-success-400" />
              <div class="text-sm text-text-secondary">
Pagados
</div>
            </div>
            <div class="text-2xl font-bold text-text-primary">
{{ pagadasCount }}
</div>
            <div class="text-xs text-text-tertiary mt-1">
{{ formatCurrency(pagadasTotal) }}
</div>
          </div>
        </div>

        <!-- Loading State -->
        <div
v-if="loading"
class="flex-center py-12"
>
          <div class="spinner" />
          <span class="ml-3 text-text-secondary">Cargando recibos...</span>
        </div>

        <!-- Tabla de Recibos -->
        <div
v-else
class="table-container"
>
          <table class="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Recibo</th>
                <th class="text-right">
Acciones
</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="facturas.length === 0">
                <td
colspan="9"
class="text-center empty-state"
>
                  <i class="fas fa-inbox empty-icon" />
                  <p>No tienes recibos registrados</p>
                </td>
              </tr>
              <tr
v-for="factura in facturas"
:key="factura.fac_codigo"
:class="getRowClass(factura)"
>
                <td>
                  <span class="factura-numero">{{ factura.fac_numero }}</span>
                </td>
                <td>
                  <span class="date-text">{{ formatDate(factura.fac_fecha) }}</span>
                </td>
                <td>
                  <div class="flex-col gap-1">
                    <span>{{ formatDate(factura.fac_vencimiento) }}</span>
                    <span
v-if="isOverdue(factura) && factura.fac_estado === 'P'"
class="text-xs text-danger-400"
>
                      <i class="fas fa-exclamation-circle" /> Vencido
                    </span>
                    <span
v-else-if="isDueSoon(factura) && factura.fac_estado === 'P'"
class="text-xs text-warning-400"
>
                      <i class="fas fa-clock" /> Por vencer
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
                  <span :class="['badge', 'badge-' + getBadgeVariant(factura.fac_estado)]">
                    <i
class="fas"
:class="getStatusIcon(factura.fac_estado)"
/>
                    {{ getStatusLabel(factura.fac_estado) }}
                  </span>
                </td>
                <td>
                  <div class="text-center">
                    <button
v-if="factura.fac_pdf_factura"
class="btn btn-ghost btn-icon btn-sm text-success-400"
title="Ver factura adjunta"
@click="verPdfFactura(factura)"
>
                      <i class="fas fa-file-pdf" />
                    </button>
                    <span
v-else-if="factura.fac_estado === 'G'"
class="text-xs text-warning-400"
title="Sin factura fiscal"
>
                      <i class="fas fa-exclamation-circle" />
                    </span>
                    <span
v-else
class="text-text-tertiary"
>-</span>
                  </div>
                </td>
                <td>
                  <div class="flex-end gap-1.5">
                    <button
class="btn btn-ghost btn-icon btn-sm text-primary-400"
title="Ver detalle"
@click="verDetalleFactura(factura)"
>
                      <i class="fas fa-eye" />
                    </button>
                    <button
v-if="factura.fac_pdf_factura"
class="btn btn-ghost btn-icon btn-sm text-success-400"
title="Descargar PDF"
@click="verPdfFactura(factura)"
>
                      <i class="fas fa-download" />
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
    <div
v-if="showDetalleModal"
class="modal-backdrop"
@click.self="showDetalleModal = false"
>
      <div class="modal max-w-2xl">
        <div class="modal-header">
          <div class="flex-start gap-3">
            <i class="fas fa-receipt text-lg text-info-400" />
            <div>
              <h2 class="text-lg font-bold text-text-primary">
Detalle de Recibo
</h2>
              <p class="text-xs text-text-secondary">
{{ facturaDetalle?.fac_numero }}
</p>
            </div>
          </div>
          <button
class="btn btn-ghost btn-icon"
aria-label="Cerrar modal"
@click="showDetalleModal = false"
>
            <i class="fas fa-times" />
          </button>
        </div>

        <div
v-if="facturaDetalle"
class="modal-body overflow-y-auto"
>
          <!-- Información del Recibo -->
          <div class="mb-6">
            <h4 class="flex-start gap-2 text-sm font-semibold text-text-primary mb-4">
              <i class="fas fa-info-circle text-primary-400" />
              Información del Recibo
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-text-secondary block mb-1">Número:</span>
                <span class="text-sm font-medium text-text-primary">{{ facturaDetalle.fac_numero }}</span>
              </div>
              <div>
                <span class="text-xs text-text-secondary block mb-1">Fecha:</span>
                <span class="text-sm font-medium text-text-primary">{{ formatDate(facturaDetalle.fac_fecha) }}</span>
                  </div>
                  <div class="detalle-item">
                    <span class="detalle-label">Vencimiento:</span>
                    <span class="detalle-value">{{ formatDate(facturaDetalle.fac_vencimiento) }}</span>
                  </div>
                  <div class="detalle-item">
                    <span class="detalle-label">Estado:</span>
                    <span :class="['status-badge', getStatusClass(facturaDetalle.fac_estado)]">
                      <i
class="fas"
:class="getStatusIcon(facturaDetalle.fac_estado)"
/>
                      {{ getStatusLabel(facturaDetalle.fac_estado) }}
                    </span>
                  </div>
                  <div
v-if="facturaDetalle.fac_fecha_pago"
class="detalle-item"
>
                    <span class="detalle-label">Fecha de Pago:</span>
                    <span class="detalle-value">{{ formatDate(facturaDetalle.fac_fecha_pago) }}</span>
              </div>
              <div>
                <span class="text-xs text-text-secondary block mb-1">Vencimiento:</span>
                <span class="text-sm font-medium text-text-primary">{{ formatDate(facturaDetalle.fac_vencimiento) }}</span>
              </div>
              <div>
                <span class="text-xs text-text-secondary block mb-1">Estatus:</span>
                <span :class="['badge', 'badge-' + getBadgeVariant(facturaDetalle.fac_estado)]">
                  {{ getStatusLabel(facturaDetalle.fac_estado) }}
                </span>
              </div>
              <div v-if="facturaDetalle.fac_fecha_pago">
                <span class="text-xs text-text-secondary block mb-1">Fecha de Pago:</span>
                <span class="text-sm font-medium text-text-primary">{{ formatDate(facturaDetalle.fac_fecha_pago) }}</span>
              </div>
              <div v-if="facturaDetalle.fac_metodo_pago">
                <span class="text-xs text-text-secondary block mb-1">Método de Pago:</span>
                <span class="text-sm font-medium text-text-primary">{{ facturaDetalle.fac_metodo_pago }}</span>
              </div>
              <div
v-if="facturaDetalle.fac_observaciones"
class="col-span-2"
>
                <span class="text-xs text-text-secondary block mb-1">Observaciones:</span>
                <span class="text-sm text-text-primary">{{ facturaDetalle.fac_observaciones }}</span>
              </div>
            </div>
          </div>

          <!-- Detalles de Líneas -->
          <div
v-if="facturaDetalle.detalles && facturaDetalle.detalles.length > 0"
class="mb-6"
>
            <h4 class="flex-start gap-2 text-sm font-semibold text-text-primary mb-4">
              <i class="fas fa-list text-primary-400" />
              Conceptos
            </h4>
            <div class="table-container">
              <table class="table text-sm">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th class="text-right">
Cantidad
</th>
                    <th class="text-right">
P. Unit.
</th>
                    <th class="text-right">
Subtotal
</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
v-for="detalle in facturaDetalle.detalles"
:key="detalle.det_codigo"
>
                    <td>{{ detalle.det_concepto }}</td>
                    <td class="text-right">
{{ detalle.det_cantidad }}
</td>
                    <td class="text-right">
{{ formatCurrency(detalle.det_precio_unitario) }}
</td>
                    <td class="text-right font-semibold">
{{ formatCurrency(detalle.det_subtotal) }}
</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-dark-border">
                    <td
colspan="3"
class="text-right text-sm font-semibold"
>
Subtotal:
</td>
                    <td class="text-right font-semibold">
{{ formatCurrency(facturaDetalle.fac_subtotal) }}
</td>
                  </tr>
                  <tr>
                    <td
colspan="3"
class="text-right text-sm font-semibold"
>
IVA:
</td>
                    <td class="text-right font-semibold">
{{ formatCurrency(facturaDetalle.fac_impuesto) }}
</td>
                  </tr>
                  <tr class="bg-dark-secondary">
                    <td
colspan="3"
class="text-right text-sm font-semibold text-primary-400"
>
Total:
</td>
                    <td class="text-right font-bold text-primary-400">
{{ formatCurrency(facturaDetalle.fac_total) }}
</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Totales simples si no hay detalles -->
          <div
v-else
class="mb-6"
>
            <h4 class="flex-start gap-2 text-sm font-semibold text-text-primary mb-4">
              <i class="fas fa-calculator text-primary-400" />
              Resumen
            </h4>
            <div class="space-y-2">
              <div class="flex-between py-2 border-b border-dark-border">
                <span class="text-sm font-medium text-text-secondary">Subtotal:</span>
                <span class="text-sm font-medium text-text-primary">{{ formatCurrency(facturaDetalle.fac_subtotal) }}</span>
              </div>
              <div class="flex-between py-2 border-b border-dark-border">
                <span class="text-sm font-medium text-text-secondary">IVA:</span>
                <span class="text-sm font-medium text-text-primary">{{ formatCurrency(facturaDetalle.fac_impuesto) }}</span>
              </div>
              <div class="flex-between py-2 bg-dark-secondary px-3 rounded-lg">
                <span class="text-sm font-bold text-primary-400">Total:</span>
                <span class="text-lg font-bold text-primary-400">{{ formatCurrency(facturaDetalle.fac_total) }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
class="btn btn-secondary"
@click="showDetalleModal = false"
>
              <i class="fas fa-times" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFacturasStore } from '@/stores/facturas'
import facturaService from '@/services/FacturaServices'

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

const getBadgeVariant = (estado) => {
  const variants = {
    'P': 'warning',
    'G': 'success',
    'V': 'danger',
    'A': 'secondary'
  }
  return variants[estado] || 'secondary'
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

