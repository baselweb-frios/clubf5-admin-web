<template>
  <div class="page-wrapper page-content">
    <!-- Alert Notifications -->
    <div
v-if="alertMsg"
:class="['alert', alertTypeClass]"
>
      <i :class="getAlertIcon(alertType)" />
      <div class="ml-3 flex-1">
{{ alertMsg }}
</div>
      <button
class="btn btn-ghost btn-sm"
aria-label="Cerrar notificación"
@click="alertMsg = ''"
>
        <i class="fas fa-times" />
      </button>
    </div>

    <!-- Main Content Card -->
    <BaseCard
title="Gestión de Recibos"
subtitle="Comprobantes internos de pago"
:hover="false"
shadow="2xl"
>
      <template #actions>
        <button
class="btn btn-secondary"
title="Recargar recibos"
@click="loadFacturas"
>
          <i class="fas fa-sync-alt" />
          <span>Refrescar</span>
        </button>
        <button
class="btn btn-primary"
@click="openCreateModal"
>
          <i class="fas fa-plus" />
          <span>Nuevo Recibo</span>
        </button>
      </template>

      <!-- Disclaimer -->
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle" />
        <div>
          <strong>Nota importante:</strong> Los recibos generados por este sistema son comprobantes internos de pago y
          <strong>NO tienen validez fiscal</strong>. Al registrar un pago, puede adjuntar la factura fiscal oficial emitida por su sistema de facturación.
        </div>
      </div>

      <!-- Estadísticas -->
      <div
v-if="estadisticas"
class="grid-responsive-3"
>
        <div class="stat-card">
          <div class="stat-icon stat-icon-info">
            <i class="fas fa-receipt" />
          </div>
          <div class="stat-content">
            <div class="stat-label">
Total Recibos
</div>
            <div class="stat-value">
{{ estadisticas.total_facturas || 0 }}
</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-warning">
            <i class="fas fa-clock" />
          </div>
          <div class="stat-content">
            <div class="stat-label">
Pendientes
</div>
            <div class="stat-value">
{{ estadisticas.facturas_pendientes || 0 }}
</div>
            <div class="stat-subvalue">
{{ formatCurrency(estadisticas.monto_pendiente || 0) }}
</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <i class="fas fa-check-circle" />
          </div>
          <div class="stat-content">
            <div class="stat-label">
Pagados
</div>
            <div class="stat-value">
{{ estadisticas.facturas_pagadas || 0 }}
</div>
            <div class="stat-subvalue">
{{ formatCurrency(estadisticas.monto_pagado || 0) }}
</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-primary">
            <i class="fas fa-dollar-sign" />
          </div>
          <div class="stat-content">
            <div class="stat-label">
Monto Total
</div>
            <div class="stat-value">
{{ formatCurrency(estadisticas.monto_total || 0) }}
</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <loading-spinner
v-if="loading"
:loading="true"
text="Cargando recibos..."
/>

      <!-- Tabla de Recibos -->
      <div v-else>
        <DataTable
:columns="columns"
:rows="facturas"
:loading="loading"
:config="tableConfig"
>
          <template #cliente_nombre="{ row }">
            <div class="client-info">
              <div class="client-avatar">
{{ getInitials(row.cliente_nombre) }}
</div>
              <div class="client-details">
                <div class="client-name truncate-2">
{{ row.cliente_nombre }}
</div>
                <div class="client-email text-xs text-text-tertiary">
{{ row.cliente_email }}
</div>
              </div>
            </div>
          </template>

          <template #fac_fecha="{ row }">
{{ formatDate(row.fac_fecha) }}
</template>
          <template #fac_vencimiento="{ row }">
{{ formatDate(row.fac_vencimiento) }}
</template>
          <template #fac_total="{ row }">
{{ formatCurrency(row.fac_total) }}
</template>

          <template #fac_estado="{ row }">
            <span :class="['badge', getStatusClass(row.fac_estado)]">
              <i
class="fas"
:class="getStatusIcon(row.fac_estado)"
/>
              {{ getStatusLabel(row.fac_estado) }}
            </span>
          </template>

          <template #fac_pdf_factura="{ row }">
            <span
v-if="row.fac_pdf_factura"
class="pdf-attached"
title="Ver factura adjunta"
@click="verPdfFactura(row)"
>
              <i class="fas fa-file-pdf" />
              Adjunta
            </span>
            <span
v-else-if="row.fac_estado === 'G'"
class="pdf-missing"
>Pendiente</span>
            <span v-else>-</span>
          </template>

          <template #actions="{ row }">
            <div class="action-buttons">
              <button
class="btn-icon"
title="Ver detalle"
@click="verDetalleFactura(row)"
>
<i class="fas fa-eye" />
</button>
              <button
v-if="row.fac_estado === 'P'"
class="btn-icon"
title="Editar recibo"
@click="editarFactura(row)"
>
<i class="fas fa-edit" />
</button>
              <button
v-if="row.fac_estado === 'P'"
class="btn-icon btn-success"
title="Registrar pago"
@click="openPagarModal(row)"
>
<i class="fas fa-check" />
</button>
              <button
v-if="row.fac_estado === 'G' && !row.fac_pdf_factura"
class="btn-icon btn-info"
title="Adjuntar factura PDF"
@click="openSubirPdfModal(row)"
>
<i class="fas fa-upload" />
</button>
              <button
v-if="row.fac_estado !== 'A'"
class="btn-icon btn-warning"
title="Anular recibo"
@click="confirmarAnular(row)"
>
<i class="fas fa-ban" />
</button>
              <button
class="btn-icon btn-danger"
title="Eliminar recibo"
@click="confirmarEliminar(row)"
>
<i class="fas fa-trash" />
</button>
            </div>
          </template>
        </DataTable>
      </div>
    </BaseCard>

    <!-- Modal Crear/Editar Recibo -->
    <Modal
v-model="showModal"
size="xl"
:title="editMode ? 'Editar Recibo' : 'Nuevo Recibo'"
>
      <form @submit.prevent="guardarFactura">
        <!-- Datos Principales -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-info-circle" />
            Información General
          </h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="label">
                <i class="fas fa-hashtag" />
                Número de Recibo
              </label>
              <input
                v-model="formData.fac_numero"
                type="text"
                class="input"
                :disabled="editMode"
                readonly
              >
            </div>

            <div class="form-group">
              <label class="label">
                <i class="fas fa-user" />
                Cliente
              </label>
              <select
v-model="formData.cli_codigo"
class="select"
:disabled="editMode"
required
>
                <option value="">
Seleccione un cliente
</option>
                <option
v-for="cliente in clientes"
:key="cliente.cli_codigo"
:value="cliente.cli_codigo"
>
                  {{ cliente.nombre }} ({{ cliente.username }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="label">
                <i class="fas fa-calendar" />
                Fecha de Emisión
              </label>
              <input
                v-model="formData.fac_fecha"
                type="date"
                class="input"
                required
              >
            </div>

            <div class="form-group">
              <label class="label">
                <i class="fas fa-calendar-check" />
                Fecha de Vencimiento
              </label>
              <input
                v-model="formData.fac_vencimiento"
                type="date"
                class="input"
              >
            </div>

            <div class="form-group form-group-full">
              <label class="label">
                <i class="fas fa-comment" />
                Observaciones
              </label>
              <textarea
                v-model="formData.fac_observaciones"
                class="input"
                rows="2"
                placeholder="Observaciones adicionales"
              />
            </div>
          </div>
        </div>

        <!-- Detalles del Recibo -->
        <div class="form-section">
          <div class="section-title-row">
            <h3 class="section-title">
              <i class="fas fa-list" />
              Detalles del Recibo
            </h3>
            <button
type="button"
class="btn btn-secondary btn-sm"
@click="agregarDetalle"
>
              <i class="fas fa-plus" />
              Agregar Línea
            </button>
          </div>

          <div class="detalles-container">
            <div
              v-for="(detalle, index) in formData.detalles"
              :key="index"
              class="detalle-row"
            >
              <div class="detalle-order">
{{ index + 1 }}
</div>
              <div class="detalle-fields">
                <input
                  v-model="detalle.det_concepto"
                  type="text"
                  class="input"
                  placeholder="Concepto o descripción"
                  required
                >
                <input
                  v-model.number="detalle.det_cantidad"
                  type="number"
                  step="0.01"
                  class="input input-small"
                  placeholder="Cant."
                  required
                  @input="calcularSubtotalDetalle(detalle)"
                >
                <input
                  v-model.number="detalle.det_precio_unitario"
                  type="number"
                  step="0.01"
                  class="input input-medium"
                  placeholder="Precio Unit."
                  required
                  @input="calcularSubtotalDetalle(detalle)"
                >
                <input
                  :value="formatCurrency(detalle.det_subtotal)"
                  type="text"
                  class="input input-medium"
                  placeholder="Subtotal"
                  readonly
                >
              </div>
              <button
                type="button"
                class="btn-icon btn-danger"
                title="Eliminar línea"
                @click="eliminarDetalle(index)"
              >
                <i class="fas fa-trash" />
              </button>
            </div>

            <div
v-if="formData.detalles.length === 0"
class="empty-detalles"
>
              <i class="fas fa-inbox" />
              <p>No hay líneas agregadas. Haga clic en "Agregar Línea" para comenzar.</p>
            </div>
          </div>

          <!-- Totales -->
          <div class="totales-container">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">{{ formatCurrency(formData.fac_subtotal) }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">
                IVA (
                <input
                  v-model.number="tasaImpuesto"
                  type="number"
                  step="1"
                  class="input-inline"
                  @input="calcularTotales"
                >%):
              </span>
              <span class="total-value">{{ formatCurrency(formData.fac_impuesto) }}</span>
            </div>
            <div class="total-row total-row-final">
              <span class="total-label">Total:</span>
              <span class="total-value">{{ formatCurrency(formData.fac_total) }}</span>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button
type="button"
class="btn btn-secondary"
@click="closeModal"
>
          <i class="fas fa-times" />
          Cancelar
        </button>
        <button
class="btn btn-primary"
:disabled="saving || formData.detalles.length === 0"
@click="guardarFactura"
>
          <i
class="fas"
:class="saving ? 'fa-spinner fa-spin' : 'fa-save'"
/>
          {{ saving ? 'Guardando...' : 'Guardar Recibo' }}
        </button>
      </template>
    </Modal>

    <!-- Modal Ver Detalle -->
    <Modal
v-model="showDetalleModal"
size="lg"
title="Detalle de Recibo"
>
      <div v-if="facturaDetalle">
        <!-- Disclaimer en detalle -->
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle" />
          <span>Este recibo es un comprobante interno y no tiene validez fiscal.</span>
        </div>

        <!-- Información del Cliente -->
        <div class="detalle-section">
          <h4 class="detalle-section-title">
            <i class="fas fa-user" />
            Cliente
          </h4>
          <div class="detalle-grid">
            <div class="detalle-item">
              <span class="detalle-label">Nombre:</span>
              <span class="detalle-value">{{ facturaDetalle.cliente_nombre }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Email:</span>
              <span class="detalle-value">{{ facturaDetalle.cliente_email }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Teléfono:</span>
              <span class="detalle-value">{{ facturaDetalle.cliente_telefono }}</span>
            </div>
            <div
v-if="facturaDetalle.cliente_domicilio"
class="detalle-item"
>
              <span class="detalle-label">Domicilio:</span>
              <span class="detalle-value">{{ facturaDetalle.cliente_domicilio }}, {{ facturaDetalle.cliente_localidad }}</span>
            </div>
          </div>
        </div>

        <!-- Información del Recibo -->
        <div class="detalle-section">
          <h4 class="detalle-section-title">
            <i class="fas fa-info-circle" />
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
              <span :class="['badge', getStatusClass(facturaDetalle.fac_estado)]">
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
            <div
v-if="facturaDetalle.fac_metodo_pago"
class="detalle-item"
>
              <span class="detalle-label">Método de Pago:</span>
              <span class="detalle-value">{{ facturaDetalle.fac_metodo_pago }}</span>
            </div>
            <div
v-if="facturaDetalle.fac_pdf_factura"
class="detalle-item"
>
              <span class="detalle-label">Factura Fiscal:</span>
              <button
class="btn btn-sm btn-info"
@click="verPdfFactura(facturaDetalle)"
>
                <i class="fas fa-file-pdf" />
                Ver Factura
              </button>
            </div>
            <div
v-if="facturaDetalle.fac_observaciones"
class="detalle-item detalle-item-full"
>
              <span class="detalle-label">Observaciones:</span>
              <span class="detalle-value">{{ facturaDetalle.fac_observaciones }}</span>
            </div>
          </div>
        </div>

        <!-- Detalles de Líneas -->
        <div class="detalle-section">
          <h4 class="detalle-section-title">
            <i class="fas fa-list" />
            Conceptos
          </h4>
          <table class="table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th class="text-right">
Cantidad
</th>
                <th class="text-right">
Precio Unit.
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
                <td class="text-right">
{{ formatCurrency(detalle.det_subtotal) }}
</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
colspan="3"
class="text-right"
>
<strong>Subtotal:</strong>
</td>
                <td class="text-right">
<strong>{{ formatCurrency(facturaDetalle.fac_subtotal) }}</strong>
</td>
              </tr>
              <tr>
                <td
colspan="3"
class="text-right"
>
<strong>IVA:</strong>
</td>
                <td class="text-right">
<strong>{{ formatCurrency(facturaDetalle.fac_impuesto) }}</strong>
</td>
              </tr>
              <tr class="total-final-row">
                <td
colspan="3"
class="text-right"
>
<strong>Total:</strong>
</td>
                <td class="text-right">
<strong>{{ formatCurrency(facturaDetalle.fac_total) }}</strong>
</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <template #footer>
        <button
class="btn btn-secondary"
@click="showDetalleModal = false"
>
          <i class="fas fa-times" />
          Cerrar
        </button>
      </template>
    </Modal>

    <!-- Modal Registrar Pago -->
    <Modal
v-model="showPagarModal"
size="md"
title="Registrar Pago"
>
      <form @submit.prevent="marcarPagada">
        <div class="form-group">
          <label class="label">
            <i class="fas fa-calendar" />
            Fecha de Pago
          </label>
          <input
            v-model="pagoData.fac_fecha_pago"
            type="date"
            class="input"
            required
          >
        </div>

        <div class="form-group">
          <label class="label">
            <i class="fas fa-credit-card" />
            Método de Pago
          </label>
          <select
v-model="pagoData.fac_metodo_pago"
class="select"
required
>
            <option value="">
Seleccione un método
</option>
            <option value="Efectivo">
Efectivo
</option>
            <option value="Transferencia">
Transferencia Bancaria
</option>
            <option value="Tarjeta">
Tarjeta de Crédito/Débito
</option>
            <option value="MercadoPago">
MercadoPago
</option>
            <option value="Cheque">
Cheque
</option>
            <option value="Otro">
Otro
</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">
            <i class="fas fa-file-pdf" />
            Adjuntar Factura Fiscal (PDF)
            <span class="form-label-optional">(Opcional)</span>
          </label>
          <div
class="file-upload-area"
@click="triggerFileInput"
@dragover.prevent
@drop.prevent="handleFileDrop"
>
            <input
              ref="fileInput"
              type="file"
              accept="application/pdf"
              hidden
              @change="handleFileSelect"
            >
            <div
v-if="!pagoData.archivoFactura"
class="file-upload-placeholder"
>
              <i class="fas fa-cloud-upload-alt" />
              <p>Haga clic o arrastre un archivo PDF aquí</p>
              <span class="file-upload-hint">Factura fiscal oficial (máx. 5MB)</span>
            </div>
            <div
v-else
class="file-upload-selected"
>
              <i class="fas fa-file-pdf" />
              <div class="file-info">
                <span class="file-name">{{ pagoData.archivoFactura.name }}</span>
                <span class="file-size">{{ formatFileSize(pagoData.archivoFactura.size) }}</span>
              </div>
              <button
type="button"
class="file-remove-btn"
@click.stop="removeFile"
>
                <i class="fas fa-times" />
              </button>
            </div>
          </div>
          <p class="form-help-text">
            <i class="fas fa-info-circle" />
            La factura fiscal puede adjuntarse ahora o posteriormente.
          </p>
        </div>
      </form>

      <template #footer>
        <button
type="button"
class="btn btn-secondary"
@click="showPagarModal = false"
>
          <i class="fas fa-times" />
          Cancelar
        </button>
        <button
class="btn btn-success"
:disabled="saving"
@click="marcarPagada"
>
          <i
class="fas"
:class="saving ? 'fa-spinner fa-spin' : 'fa-check'"
/>
          {{ saving ? 'Procesando...' : 'Confirmar Pago' }}
        </button>
      </template>
    </Modal>

    <!-- Modal Subir PDF de Factura -->
    <Modal
v-model="showSubirPdfModal"
size="md"
title="Adjuntar Factura Fiscal"
>
      <form @submit.prevent="subirPdfFactura">
        <div class="form-group">
          <label class="label">
            <i class="fas fa-file-pdf" />
            Archivo de Factura Fiscal (PDF)
          </label>
          <div
class="file-upload-area"
@click="triggerSubirFileInput"
@dragover.prevent
@drop.prevent="handleSubirFileDrop"
>
            <input
              ref="subirFileInput"
              type="file"
              accept="application/pdf"
              hidden
              @change="handleSubirFileSelect"
            >
            <div
v-if="!archivoSubir"
class="file-upload-placeholder"
>
              <i class="fas fa-cloud-upload-alt" />
              <p>Haga clic o arrastre un archivo PDF aquí</p>
              <span class="file-upload-hint">Factura fiscal oficial (máx. 5MB)</span>
            </div>
            <div
v-else
class="file-upload-selected"
>
              <i class="fas fa-file-pdf" />
              <div class="file-info">
                <span class="file-name">{{ archivoSubir.name }}</span>
                <span class="file-size">{{ formatFileSize(archivoSubir.size) }}</span>
              </div>
              <button
type="button"
class="file-remove-btn"
@click.stop="archivoSubir = null"
>
                <i class="fas fa-times" />
              </button>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button
type="button"
class="btn btn-secondary"
@click="showSubirPdfModal = false"
>
          <i class="fas fa-times" />
          Cancelar
        </button>
        <button
class="btn btn-primary"
:disabled="saving || !archivoSubir"
@click="subirPdfFactura"
>
          <i
class="fas"
:class="saving ? 'fa-spinner fa-spin' : 'fa-upload'"
/>
          {{ saving ? 'Subiendo...' : 'Subir Factura' }}
        </button>
      </template>
    </Modal>

    <!-- Modal Confirmación Anular -->
    <Modal
v-model="showAnularModal"
size="sm"
title="Anular Recibo"
>
      <p class="confirm-message">
        ¿Está seguro de que desea anular el recibo <strong>{{ facturaAnular?.fac_numero }}</strong>?
      </p>
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-circle" />
        <span>El recibo quedará marcado como anulado y no podrá ser modificado.</span>
      </div>

      <template #footer>
        <button
class="btn btn-secondary"
@click="showAnularModal = false"
>
          <i class="fas fa-times" />
          Cancelar
        </button>
        <button
class="btn btn-warning"
:disabled="saving"
@click="anularFactura"
>
          <i
class="fas"
:class="saving ? 'fa-spinner fa-spin' : 'fa-ban'"
/>
          {{ saving ? 'Anulando...' : 'Anular Recibo' }}
        </button>
      </template>
    </Modal>

    <!-- Modal Confirmación Eliminar -->
    <Modal
v-model="showDeleteModal"
size="sm"
title="Eliminar Recibo"
>
      <p class="confirm-message">
        ¿Está seguro de que desea eliminar el recibo <strong>{{ facturaEliminar?.fac_numero }}</strong>?
      </p>
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle" />
        <span>Esta acción eliminará permanentemente el recibo y todos sus detalles.</span>
      </div>

      <template #footer>
        <button
class="btn btn-secondary"
@click="showDeleteModal = false"
>
          <i class="fas fa-times" />
          Cancelar
        </button>
        <button
class="btn btn-danger"
:disabled="saving"
@click="eliminarFactura"
>
          <i
class="fas"
:class="saving ? 'fa-spinner fa-spin' : 'fa-trash'"
/>
          {{ saving ? 'Eliminando...' : 'Eliminar Recibo' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFacturasStore } from '@/stores/facturas'
import clienteService from '@/services/ClienteServices'
import facturaService from '@/services/FacturaServices'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Modal from '@/components/ui/Modal.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import DataTable from '@/components/ui/DataTable.vue'

const router = useRouter()
const authStore = useAuthStore()
const facturasStore = useFacturasStore()

// State
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDetalleModal = ref(false)
const showPagarModal = ref(false)
const showSubirPdfModal = ref(false)
const showAnularModal = ref(false)
const showDeleteModal = ref(false)
const editMode = ref(false)
const alertMsg = ref('')
const alertType = ref('is-info')

const facturas = ref([])
const clientes = ref([])
const estadisticas = ref(null)
const facturaDetalle = ref(null)
const facturaPagar = ref(null)
const facturaSubirPdf = ref(null)
const facturaAnular = ref(null)
const facturaEliminar = ref(null)
const archivoSubir = ref(null)

const fileInput = ref(null)
const subirFileInput = ref(null)

const tasaImpuesto = ref(21) // IVA 21% por defecto

const formData = ref({
  fac_codigo: 0,
  fac_numero: '',
  fac_fecha: new Date().toISOString().split('T')[0],
  fac_vencimiento: null,
  cli_codigo: '',
  fac_subtotal: 0,
  fac_impuesto: 0,
  fac_total: 0,
  fac_estado: 'P',
  fac_observaciones: '',
  detalles: []
})

const pagoData = ref({
  fac_fecha_pago: new Date().toISOString().split('T')[0],
  fac_metodo_pago: '',
  archivoFactura: null
})

// Methods
const showAlert = (msg, type = 'is-info') => {
  alertMsg.value = msg
  alertType.value = type
  setTimeout(() => (alertMsg.value = ''), 5000)
}

const getAlertIcon = (type) => {
  const icons = {
    'is-success': 'fas fa-check-circle',
    'is-info': 'fas fa-info-circle',
    'is-warning': 'fas fa-exclamation-triangle',
    'is-danger': 'fas fa-exclamation-circle'
  }
  return icons[type] || 'fas fa-info-circle'
}

const alertTypeClass = computed(() => {
  const map = {
    'is-success': 'alert-success',
    'is-info': 'alert-info',
    'is-warning': 'alert-warning',
    'is-danger': 'alert-danger'
  }
  return map[alertType.value] || 'alert-info'
})

const getInitials = (nombre) => {
  if (!nombre) return 'U'
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

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

const columns = ref([
  { field: 'fac_numero', label: 'Número', sortable: true },
  { field: 'cliente_nombre', label: 'Cliente', sortable: true },
  { field: 'fac_fecha', label: 'Fecha', sortable: true },
  { field: 'fac_vencimiento', label: 'Vencimiento', sortable: true },
  { field: 'fac_total', label: 'Total', sortable: true },
  { field: 'fac_estado', label: 'Estado', sortable: true },
  { field: 'fac_pdf_factura', label: 'Factura' },
  { field: 'actions', label: 'Acciones' }
])

const tableConfig = ref({
  per_page: 10,
  global_search: { visibility: true, placeholder: 'Buscar recibos...' },
  highlight_row_hover: true
})

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
    'P': 'badge-warning',
    'G': 'badge-success',
    'V': 'badge-danger',
    'A': 'badge-info'
  }
  return classes[estado] || 'badge-info'
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

const getRowClass = (estado) => {
  return estado === 'A' ? 'row-inactive' : ''
}

// File handling
const triggerFileInput = () => {
  fileInput.value?.click()
}

const triggerSubirFileInput = () => {
  subirFileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
    pagoData.value.archivoFactura = file
  } else if (file) {
    showAlert('El archivo debe ser PDF y no superar 5MB', 'is-warning')
  }
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
    pagoData.value.archivoFactura = file
  } else if (file) {
    showAlert('El archivo debe ser PDF y no superar 5MB', 'is-warning')
  }
}

const handleSubirFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
    archivoSubir.value = file
  } else if (file) {
    showAlert('El archivo debe ser PDF y no superar 5MB', 'is-warning')
  }
}

const handleSubirFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
    archivoSubir.value = file
  } else if (file) {
    showAlert('El archivo debe ser PDF y no superar 5MB', 'is-warning')
  }
}

const removeFile = () => {
  pagoData.value.archivoFactura = null
  if (fileInput.value) fileInput.value.value = ''
}

const loadFacturas = async () => {
  loading.value = true
  try {
    const data = await facturasStore.loadAllFacturas()
    facturas.value = data || []
    console.log('Recibos cargados:', facturas.value.length)
  } catch (error) {
    console.error('Error cargando recibos:', error)
    showAlert('Error al cargar los recibos', 'is-danger')
  } finally {
    loading.value = false
  }
}

const loadClientes = async () => {
  try {
    const data = await clienteService.getAllCompleto()
    clientes.value = data || []
    console.log('Clientes cargados:', clientes.value.length)
  } catch (error) {
    console.error('Error cargando clientes:', error)
  }
}

const loadEstadisticas = async () => {
  try {
    const anioActual = new Date().getFullYear()
    const data = await facturasStore.loadEstadisticas(anioActual, null)
    estadisticas.value = data
    console.log('Estadísticas cargadas:', data)
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
  }
}

const openCreateModal = async () => {
  editMode.value = false
  resetForm()

  // Obtener siguiente número de recibo
  try {
    const anioActual = new Date().getFullYear()
    const siguienteNumero = await facturasStore.getSiguienteNumero(anioActual)
    formData.value.fac_numero = siguienteNumero
  } catch (error) {
    console.error('Error obteniendo siguiente número:', error)
    showAlert('Error al obtener siguiente número de recibo', 'is-warning')
  }

  showModal.value = true
}

const resetForm = () => {
  formData.value = {
    fac_codigo: 0,
    fac_numero: '',
    fac_fecha: new Date().toISOString().split('T')[0],
    fac_vencimiento: null,
    cli_codigo: '',
    fac_subtotal: 0,
    fac_impuesto: 0,
    fac_total: 0,
    fac_estado: 'P',
    fac_observaciones: '',
    detalles: []
  }
  tasaImpuesto.value = 21
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const agregarDetalle = () => {
  formData.value.detalles.push({
    det_concepto: '',
    det_cantidad: 1,
    det_precio_unitario: 0,
    det_subtotal: 0,
    det_orden: formData.value.detalles.length
  })
}

const eliminarDetalle = (index) => {
  formData.value.detalles.splice(index, 1)
  // Reordenar
  formData.value.detalles.forEach((d, i) => d.det_orden = i)
  calcularTotales()
}

const calcularSubtotalDetalle = (detalle) => {
  detalle.det_subtotal = (detalle.det_cantidad || 0) * (detalle.det_precio_unitario || 0)
  calcularTotales()
}

const calcularTotales = () => {
  const subtotal = formData.value.detalles.reduce((sum, d) => sum + (d.det_subtotal || 0), 0)
  const impuesto = subtotal * (tasaImpuesto.value / 100)
  const total = subtotal + impuesto

  formData.value.fac_subtotal = parseFloat(subtotal.toFixed(2))
  formData.value.fac_impuesto = parseFloat(impuesto.toFixed(2))
  formData.value.fac_total = parseFloat(total.toFixed(2))
}

const guardarFactura = async () => {
  if (formData.value.detalles.length === 0) {
    showAlert('Debe agregar al menos una línea de detalle', 'is-warning')
    return
  }

  saving.value = true
  try {
    const facturaData = {
      fac_numero: formData.value.fac_numero,
      fac_fecha: formData.value.fac_fecha,
      fac_vencimiento: formData.value.fac_vencimiento,
      cli_codigo: formData.value.cli_codigo,
      fac_subtotal: formData.value.fac_subtotal,
      fac_impuesto: formData.value.fac_impuesto,
      fac_total: formData.value.fac_total,
      fac_estado: formData.value.fac_estado,
      fac_observaciones: formData.value.fac_observaciones,
      detalles: formData.value.detalles
    }

    if (editMode.value) {
      await facturasStore.actualizarFactura(formData.value.fac_codigo, facturaData)
      showAlert('Recibo actualizado correctamente', 'is-success')
    } else {
      await facturasStore.crearFactura(facturaData)
      showAlert('Recibo creado correctamente', 'is-success')
    }

    await loadFacturas()
    await loadEstadisticas()
    closeModal()
  } catch (error) {
    console.error('Error al guardar recibo:', error)
    showAlert('Error al guardar el recibo', 'is-danger')
  } finally {
    saving.value = false
  }
}

const editarFactura = async (factura) => {
  editMode.value = true

  try {
    // Cargar detalle completo
    const facturaCompleta = await facturasStore.loadFacturaById(factura.fac_codigo)

    formData.value = {
      fac_codigo: facturaCompleta.fac_codigo,
      fac_numero: facturaCompleta.fac_numero,
      fac_fecha: facturaCompleta.fac_fecha.split('T')[0],
      fac_vencimiento: facturaCompleta.fac_vencimiento ? facturaCompleta.fac_vencimiento.split('T')[0] : null,
      cli_codigo: facturaCompleta.cli_codigo,
      fac_subtotal: facturaCompleta.fac_subtotal,
      fac_impuesto: facturaCompleta.fac_impuesto,
      fac_total: facturaCompleta.fac_total,
      fac_estado: facturaCompleta.fac_estado,
      fac_observaciones: facturaCompleta.fac_observaciones || '',
      detalles: facturaCompleta.detalles || []
    }

    // Calcular tasa de impuesto aproximada
    if (facturaCompleta.fac_subtotal > 0) {
      tasaImpuesto.value = Math.round((facturaCompleta.fac_impuesto / facturaCompleta.fac_subtotal) * 100)
    }

    showModal.value = true
  } catch (error) {
    console.error('Error cargando recibo:', error)
    showAlert('Error al cargar datos del recibo', 'is-danger')
  }
}

const verDetalleFactura = async (factura) => {
  try {
    const facturaCompleta = await facturasStore.loadFacturaById(factura.fac_codigo)
    facturaDetalle.value = facturaCompleta
    showDetalleModal.value = true
  } catch (error) {
    console.error('Error cargando detalle:', error)
    showAlert('Error al cargar detalle del recibo', 'is-danger')
  }
}

const verPdfFactura = async (factura) => {
  if (!factura.fac_pdf_factura) {
    showAlert('Este recibo no tiene factura fiscal adjunta', 'is-warning')
    return
  }

  try {
    // Usar el servicio para descargar y abrir el PDF
    await facturaService.verPdfFactura(factura.fac_codigo)
  } catch (error) {
    console.error('Error abriendo PDF:', error)
    showAlert('Error al abrir el PDF de la factura', 'is-danger')
  }
}

const openPagarModal = (factura) => {
  facturaPagar.value = factura
  pagoData.value = {
    fac_fecha_pago: new Date().toISOString().split('T')[0],
    fac_metodo_pago: '',
    archivoFactura: null
  }
  showPagarModal.value = true
}

const marcarPagada = async () => {
  saving.value = true
  try {
    // Primero marcar como pagada
    await facturasStore.marcarPagada(facturaPagar.value.fac_codigo, {
      fac_fecha_pago: pagoData.value.fac_fecha_pago,
      fac_metodo_pago: pagoData.value.fac_metodo_pago
    })

    // Si hay archivo PDF, subirlo
    if (pagoData.value.archivoFactura) {
      try {
        await facturaService.subirPdfFactura(facturaPagar.value.fac_codigo, pagoData.value.archivoFactura)
        showAlert('Pago registrado y factura fiscal adjuntada correctamente', 'is-success')
      } catch (pdfError) {
        console.error('Error subiendo PDF:', pdfError)
        showAlert('Pago registrado, pero hubo un error al adjuntar la factura', 'is-warning')
      }
    } else {
      showAlert('Pago registrado correctamente', 'is-success')
    }

    await loadFacturas()
    await loadEstadisticas()
    showPagarModal.value = false
  } catch (error) {
    console.error('Error marcando como pagado:', error)
    showAlert('Error al registrar el pago', 'is-danger')
  } finally {
    saving.value = false
  }
}

const openSubirPdfModal = (factura) => {
  facturaSubirPdf.value = factura
  archivoSubir.value = null
  showSubirPdfModal.value = true
}

const subirPdfFactura = async () => {
  if (!archivoSubir.value) {
    showAlert('Debe seleccionar un archivo PDF', 'is-warning')
    return
  }

  saving.value = true
  try {
    await facturaService.subirPdfFactura(facturaSubirPdf.value.fac_codigo, archivoSubir.value)
    showAlert('Factura fiscal adjuntada correctamente', 'is-success')
    await loadFacturas()
    showSubirPdfModal.value = false
  } catch (error) {
    console.error('Error subiendo PDF:', error)
    showAlert('Error al adjuntar la factura', 'is-danger')
  } finally {
    saving.value = false
  }
}

const confirmarAnular = (factura) => {
  facturaAnular.value = factura
  showAnularModal.value = true
}

const anularFactura = async () => {
  saving.value = true
  try {
    await facturasStore.anularFactura(facturaAnular.value.fac_codigo)
    showAlert('Recibo anulado correctamente', 'is-success')
    await loadFacturas()
    await loadEstadisticas()
    showAnularModal.value = false
  } catch (error) {
    console.error('Error anulando recibo:', error)
    showAlert('Error al anular el recibo', 'is-danger')
  } finally {
    saving.value = false
  }
}

const confirmarEliminar = (factura) => {
  facturaEliminar.value = factura
  showDeleteModal.value = true
}

const eliminarFactura = async () => {
  saving.value = true
  try {
    await facturasStore.eliminarFactura(facturaEliminar.value.fac_codigo)
    showAlert('Recibo eliminado correctamente', 'is-success')
    await loadFacturas()
    await loadEstadisticas()
    showDeleteModal.value = false
  } catch (error) {
    console.error('Error eliminando recibo:', error)
    showAlert('Error al eliminar el recibo', 'is-danger')
  } finally {
    saving.value = false
  }
}

// Watch para recalcular totales cuando cambian los detalles
watch(() => formData.value.detalles, () => {
  calcularTotales()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  // Verificar permisos
  if (authStore.userRole !== 'Administrador') {
    showAlert('No tienes permisos para acceder a esta sección', 'is-danger')
    router.push('/dashboard')
    return
  }

  // Cargar datos iniciales
  await Promise.all([
    loadFacturas(),
    loadClientes(),
    loadEstadisticas()
  ])
})
</script>

<style src="@/assets/css/main.css"></style>

