<template>
  <div class="page-container">
    <!-- Alert Notifications -->
    <div v-if="alertMsg" class="notification-container">
      <div :class="['notification', `notification-${alertType}`]">
        <div class="notification-content">
          <i :class="getAlertIcon(alertType)" class="notification-icon"></i>
          <span class="notification-text">{{ alertMsg }}</span>
        </div>
        <button class="notification-close" @click="alertMsg = ''" aria-label="Cerrar notificación">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-header">
        <div class="card-title-section">
          <i class="fas fa-receipt card-title-icon"></i>
          <div>
            <h1 class="card-title">Gestión de Recibos</h1>
            <p class="card-subtitle">Comprobantes internos de pago</p>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary" @click="loadFacturas" title="Recargar recibos">
            <i class="fas fa-sync-alt"></i>
            <span>Refrescar</span>
          </button>
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="fas fa-plus"></i>
            <span>Nuevo Recibo</span>
          </button>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer-banner">
        <i class="fas fa-info-circle"></i>
        <div class="disclaimer-content">
          <strong>Nota importante:</strong> Los recibos generados por este sistema son comprobantes internos de pago y
          <strong>NO tienen validez fiscal</strong>. Al registrar un pago, puede adjuntar la factura fiscal oficial emitida por su sistema de facturación.
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="stats-container" v-if="estadisticas">
        <div class="stat-card">
          <div class="stat-icon stat-icon-info">
            <i class="fas fa-receipt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Recibos</div>
            <div class="stat-value">{{ estadisticas.total_facturas || 0 }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-warning">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Pendientes</div>
            <div class="stat-value">{{ estadisticas.facturas_pendientes || 0 }}</div>
            <div class="stat-subvalue">{{ formatCurrency(estadisticas.monto_pendiente || 0) }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Pagados</div>
            <div class="stat-value">{{ estadisticas.facturas_pagadas || 0 }}</div>
            <div class="stat-subvalue">{{ formatCurrency(estadisticas.monto_pagado || 0) }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-primary">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Monto Total</div>
            <div class="stat-value">{{ formatCurrency(estadisticas.monto_total || 0) }}</div>
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
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Factura</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="facturas.length === 0">
                <td colspan="8" class="text-center empty-state">
                  <i class="fas fa-inbox empty-icon"></i>
                  <p>No hay recibos registrados</p>
                </td>
              </tr>
              <tr v-for="factura in facturas" :key="factura.fac_codigo" :class="getRowClass(factura.fac_estado)">
                <td>
                  <span class="factura-numero">{{ factura.fac_numero }}</span>
                </td>
                <td>
                  <div class="client-info">
                    <div class="client-avatar">
                      {{ getInitials(factura.cliente_nombre) }}
                    </div>
                    <div class="client-details">
                      <span class="client-name">{{ factura.cliente_nombre }}</span>
                      <span class="client-email">{{ factura.cliente_email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="date-text">{{ formatDate(factura.fac_fecha) }}</span>
                </td>
                <td>
                  <span class="date-text">{{ formatDate(factura.fac_vencimiento) }}</span>
                </td>
                <td>
                  <span class="amount-text">{{ formatCurrency(factura.fac_total) }}</span>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(factura.fac_estado)]">
                    <i class="fas" :class="getStatusIcon(factura.fac_estado)"></i>
                    {{ getStatusLabel(factura.fac_estado) }}
                  </span>
                </td>
                <td>
                  <div class="factura-pdf-status">
                    <span v-if="factura.fac_pdf_factura" class="pdf-attached" @click="verPdfFactura(factura)" title="Ver factura adjunta">
                      <i class="fas fa-file-pdf"></i>
                      Adjunta
                    </span>
                    <span v-else-if="factura.fac_estado === 'G'" class="pdf-missing" title="Sin factura adjunta">
                      <i class="fas fa-file-excel"></i>
                      Pendiente
                    </span>
                    <span v-else class="pdf-na">
                      -
                    </span>
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
                      v-if="factura.fac_estado === 'P'"
                      @click="editarFactura(factura)"
                      class="btn-icon"
                      title="Editar recibo"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      v-if="factura.fac_estado === 'P'"
                      @click="openPagarModal(factura)"
                      class="btn-icon btn-success"
                      title="Registrar pago"
                    >
                      <i class="fas fa-check"></i>
                    </button>

                    <button
                      v-if="factura.fac_estado === 'G' && !factura.fac_pdf_factura"
                      @click="openSubirPdfModal(factura)"
                      class="btn-icon btn-info"
                      title="Adjuntar factura PDF"
                    >
                      <i class="fas fa-upload"></i>
                    </button>

                    <button
                      v-if="factura.fac_estado !== 'A'"
                      @click="confirmarAnular(factura)"
                      class="btn-icon btn-warning"
                      title="Anular recibo"
                    >
                      <i class="fas fa-ban"></i>
                    </button>

                    <button
                      @click="confirmarEliminar(factura)"
                      class="btn-icon btn-danger"
                      title="Eliminar recibo"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Recibo -->
    <transition name="modal-fade" appear>
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <transition name="modal-scale" appear>
          <div class="modal-content modal-large">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon">
                  <i class="fas" :class="editMode ? 'fa-edit' : 'fa-receipt'"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">{{ editMode ? 'Editar Recibo' : 'Nuevo Recibo' }}</h2>
                  <p class="modal-subtitle">Complete los datos del recibo</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="closeModal" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="guardarFactura">
                <!-- Datos Principales -->
                <div class="form-section">
                  <h3 class="section-title">
                    <i class="fas fa-info-circle"></i>
                    Información General
                  </h3>
                  <div class="form-grid">
                    <div class="form-group">
                      <label class="form-label">
                        <i class="fas fa-hashtag"></i>
                        Número de Recibo
                      </label>
                      <input
                        v-model="formData.fac_numero"
                        type="text"
                        class="form-input"
                        :disabled="editMode"
                        readonly
                      />
                    </div>

                    <div class="form-group">
                      <label class="form-label">
                        <i class="fas fa-user"></i>
                        Cliente
                      </label>
                      <select v-model="formData.cli_codigo" class="form-select" :disabled="editMode" required>
                        <option value="">Seleccione un cliente</option>
                        <option v-for="cliente in clientes" :key="cliente.cli_codigo" :value="cliente.cli_codigo">
                          {{ cliente.nombre }} ({{ cliente.username }})
                        </option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label class="form-label">
                        <i class="fas fa-calendar"></i>
                        Fecha de Emisión
                      </label>
                      <input
                        v-model="formData.fac_fecha"
                        type="date"
                        class="form-input"
                        required
                      />
                    </div>

                    <div class="form-group">
                      <label class="form-label">
                        <i class="fas fa-calendar-check"></i>
                        Fecha de Vencimiento
                      </label>
                      <input
                        v-model="formData.fac_vencimiento"
                        type="date"
                        class="form-input"
                      />
                    </div>

                    <div class="form-group form-group-full">
                      <label class="form-label">
                        <i class="fas fa-comment"></i>
                        Observaciones
                      </label>
                      <textarea
                        v-model="formData.fac_observaciones"
                        class="form-textarea"
                        rows="2"
                        placeholder="Observaciones adicionales"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Detalles del Recibo -->
                <div class="form-section">
                  <div class="section-title-row">
                    <h3 class="section-title">
                      <i class="fas fa-list"></i>
                      Detalles del Recibo
                    </h3>
                    <button type="button" @click="agregarDetalle" class="btn btn-secondary btn-sm">
                      <i class="fas fa-plus"></i>
                      Agregar Línea
                    </button>
                  </div>

                  <div class="detalles-container">
                    <div
                      v-for="(detalle, index) in formData.detalles"
                      :key="index"
                      class="detalle-row"
                    >
                      <div class="detalle-order">{{ index + 1 }}</div>
                      <div class="detalle-fields">
                        <input
                          v-model="detalle.det_concepto"
                          type="text"
                          class="form-input"
                          placeholder="Concepto o descripción"
                          required
                        />
                        <input
                          v-model.number="detalle.det_cantidad"
                          type="number"
                          step="0.01"
                          class="form-input form-input-small"
                          placeholder="Cant."
                          @input="calcularSubtotalDetalle(detalle)"
                          required
                        />
                        <input
                          v-model.number="detalle.det_precio_unitario"
                          type="number"
                          step="0.01"
                          class="form-input form-input-medium"
                          placeholder="Precio Unit."
                          @input="calcularSubtotalDetalle(detalle)"
                          required
                        />
                        <input
                          :value="formatCurrency(detalle.det_subtotal)"
                          type="text"
                          class="form-input form-input-medium"
                          placeholder="Subtotal"
                          readonly
                        />
                      </div>
                      <button
                        type="button"
                        @click="eliminarDetalle(index)"
                        class="btn-icon btn-danger"
                        title="Eliminar línea"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>

                    <div v-if="formData.detalles.length === 0" class="empty-detalles">
                      <i class="fas fa-inbox"></i>
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
                        />%):
                      </span>
                      <span class="total-value">{{ formatCurrency(formData.fac_impuesto) }}</span>
                    </div>
                    <div class="total-row total-row-final">
                      <span class="total-label">Total:</span>
                      <span class="total-value">{{ formatCurrency(formData.fac_total) }}</span>
                    </div>
                  </div>
                </div>

                <div class="modal-footer">
                  <button type="button" @click="closeModal" class="btn btn-secondary">
                    <i class="fas fa-times"></i>
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving || formData.detalles.length === 0">
                    <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                    {{ saving ? 'Guardando...' : 'Guardar Recibo' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </transition>
      </div>
    </transition>

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
              <!-- Disclaimer en detalle -->
              <div class="disclaimer-inline">
                <i class="fas fa-exclamation-triangle"></i>
                Este recibo es un comprobante interno y no tiene validez fiscal.
              </div>

              <!-- Información del Cliente -->
              <div class="detalle-section">
                <h4 class="detalle-section-title">
                  <i class="fas fa-user"></i>
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
                  <div class="detalle-item" v-if="facturaDetalle.cliente_domicilio">
                    <span class="detalle-label">Domicilio:</span>
                    <span class="detalle-value">{{ facturaDetalle.cliente_domicilio }}, {{ facturaDetalle.cliente_localidad }}</span>
                  </div>
                </div>
              </div>

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
                  <div class="detalle-item" v-if="facturaDetalle.fac_pdf_factura">
                    <span class="detalle-label">Factura Fiscal:</span>
                    <button @click="verPdfFactura(facturaDetalle)" class="btn btn-sm btn-info">
                      <i class="fas fa-file-pdf"></i>
                      Ver Factura
                    </button>
                  </div>
                  <div class="detalle-item detalle-item-full" v-if="facturaDetalle.fac_observaciones">
                    <span class="detalle-label">Observaciones:</span>
                    <span class="detalle-value">{{ facturaDetalle.fac_observaciones }}</span>
                  </div>
                </div>
              </div>

              <!-- Detalles de Líneas -->
              <div class="detalle-section">
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

    <!-- Modal Registrar Pago -->
    <transition name="modal-fade" appear>
      <div v-if="showPagarModal" class="modal-overlay" @click.self="showPagarModal = false">
        <transition name="modal-scale" appear>
          <div class="modal-content modal-small">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon modal-icon-success">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">Registrar Pago</h2>
                  <p class="modal-subtitle">{{ facturaPagar?.fac_numero }} - {{ formatCurrency(facturaPagar?.fac_total) }}</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="showPagarModal = false" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="marcarPagada">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar"></i>
                    Fecha de Pago
                  </label>
                  <input
                    v-model="pagoData.fac_fecha_pago"
                    type="date"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-credit-card"></i>
                    Método de Pago
                  </label>
                  <select v-model="pagoData.fac_metodo_pago" class="form-select" required>
                    <option value="">Seleccione un método</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                    <option value="MercadoPago">MercadoPago</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-file-pdf"></i>
                    Adjuntar Factura Fiscal (PDF)
                    <span class="form-label-optional">(Opcional)</span>
                  </label>
                  <div class="file-upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
                    <input
                      ref="fileInput"
                      type="file"
                      accept="application/pdf"
                      @change="handleFileSelect"
                      hidden
                    />
                    <div v-if="!pagoData.archivoFactura" class="file-upload-placeholder">
                      <i class="fas fa-cloud-upload-alt"></i>
                      <p>Haga clic o arrastre un archivo PDF aquí</p>
                      <span class="file-upload-hint">Factura fiscal oficial (máx. 5MB)</span>
                    </div>
                    <div v-else class="file-upload-selected">
                      <i class="fas fa-file-pdf"></i>
                      <div class="file-info">
                        <span class="file-name">{{ pagoData.archivoFactura.name }}</span>
                        <span class="file-size">{{ formatFileSize(pagoData.archivoFactura.size) }}</span>
                      </div>
                      <button type="button" @click.stop="removeFile" class="file-remove-btn">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <p class="form-help-text">
                    <i class="fas fa-info-circle"></i>
                    La factura fiscal puede adjuntarse ahora o posteriormente.
                  </p>
                </div>

                <div class="modal-footer">
                  <button type="button" @click="showPagarModal = false" class="btn btn-secondary">
                    <i class="fas fa-times"></i>
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-success" :disabled="saving">
                    <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                    {{ saving ? 'Procesando...' : 'Confirmar Pago' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Modal Subir PDF de Factura -->
    <transition name="modal-fade" appear>
      <div v-if="showSubirPdfModal" class="modal-overlay" @click.self="showSubirPdfModal = false">
        <transition name="modal-scale" appear>
          <div class="modal-content modal-small">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon modal-icon-info">
                  <i class="fas fa-file-upload"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">Adjuntar Factura Fiscal</h2>
                  <p class="modal-subtitle">{{ facturaSubirPdf?.fac_numero }}</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="showSubirPdfModal = false" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="subirPdfFactura">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-file-pdf"></i>
                    Archivo de Factura Fiscal (PDF)
                  </label>
                  <div class="file-upload-area" @click="triggerSubirFileInput" @dragover.prevent @drop.prevent="handleSubirFileDrop">
                    <input
                      ref="subirFileInput"
                      type="file"
                      accept="application/pdf"
                      @change="handleSubirFileSelect"
                      hidden
                    />
                    <div v-if="!archivoSubir" class="file-upload-placeholder">
                      <i class="fas fa-cloud-upload-alt"></i>
                      <p>Haga clic o arrastre un archivo PDF aquí</p>
                      <span class="file-upload-hint">Factura fiscal oficial (máx. 5MB)</span>
                    </div>
                    <div v-else class="file-upload-selected">
                      <i class="fas fa-file-pdf"></i>
                      <div class="file-info">
                        <span class="file-name">{{ archivoSubir.name }}</span>
                        <span class="file-size">{{ formatFileSize(archivoSubir.size) }}</span>
                      </div>
                      <button type="button" @click.stop="archivoSubir = null" class="file-remove-btn">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="modal-footer">
                  <button type="button" @click="showSubirPdfModal = false" class="btn btn-secondary">
                    <i class="fas fa-times"></i>
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving || !archivoSubir">
                    <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-upload'"></i>
                    {{ saving ? 'Subiendo...' : 'Subir Factura' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Modal Confirmación Anular -->
    <transition name="modal-fade" appear>
      <div v-if="showAnularModal" class="modal-overlay" @click.self="showAnularModal = false">
        <transition name="modal-scale" appear>
          <div class="modal-content modal-small">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon modal-icon-warning">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">Anular Recibo</h2>
                  <p class="modal-subtitle">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="showAnularModal = false" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <p class="confirm-message">
                ¿Está seguro de que desea anular el recibo <strong>{{ facturaAnular?.fac_numero }}</strong>?
              </p>
              <p class="confirm-warning">
                <i class="fas fa-exclamation-circle"></i>
                El recibo quedará marcado como anulado y no podrá ser modificado.
              </p>

              <div class="modal-footer">
                <button @click="showAnularModal = false" class="btn btn-secondary">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                <button @click="anularFactura" class="btn btn-warning" :disabled="saving">
                  <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-ban'"></i>
                  {{ saving ? 'Anulando...' : 'Anular Recibo' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Modal Confirmación Eliminar -->
    <transition name="modal-fade" appear>
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <transition name="modal-scale" appear>
          <div class="modal-content modal-small">
            <div class="modal-header">
              <div class="modal-title-section">
                <div class="modal-icon modal-icon-danger">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="modal-title-text">
                  <h2 class="modal-title">Eliminar Recibo</h2>
                  <p class="modal-subtitle">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button class="modal-close-btn" @click="showDeleteModal = false" aria-label="Cerrar modal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <p class="confirm-message">
                ¿Está seguro de que desea eliminar el recibo <strong>{{ facturaEliminar?.fac_numero }}</strong>?
              </p>
              <p class="confirm-warning">
                <i class="fas fa-exclamation-circle"></i>
                Esta acción eliminará permanentemente el recibo y todos sus detalles.
              </p>

              <div class="modal-footer">
                <button @click="showDeleteModal = false" class="btn btn-secondary">
                  <i class="fas fa-times"></i>
                  Cancelar
                </button>
                <button @click="eliminarFactura" class="btn btn-danger" :disabled="saving">
                  <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                  {{ saving ? 'Eliminando...' : 'Eliminar Recibo' }}
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFacturasStore } from '@/stores/facturas'
import clienteService from '@/services/ClienteServices'
import facturaService from '@/services/FacturaServices'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

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

<style scoped>
/* ===== VARIABLES ===== */
:root {
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  --color-bg-primary: #0f1419;
  --color-bg-secondary: #16181d;
  --color-surface-primary: #1c1f26;
  --color-surface-secondary: #22252d;
  --color-border-primary: rgba(255, 255, 255, 0.06);
  --color-border-secondary: rgba(255, 255, 255, 0.1);

  --color-text-primary: #e5e7eb;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-text-inverse: #ffffff;

  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;

  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-warning-500: #f59e0b;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-info-500: #06b6d4;

  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
  --border-radius-2xl: 1rem;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}

/* ===== PAGE LAYOUT ===== */
.page-container {
  padding: var(--spacing-6);
  max-width: 1600px;
  margin: 0 auto;
}

/* ===== DISCLAIMER BANNER ===== */
.disclaimer-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-6);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
  border-bottom: 1px solid rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.disclaimer-banner i {
  font-size: 1.25rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.disclaimer-content {
  font-size: 0.875rem;
  line-height: 1.5;
}

.disclaimer-content strong {
  color: #fcd34d;
}

.disclaimer-inline {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--border-radius-lg);
  color: #fbbf24;
  font-size: 0.8125rem;
  margin-bottom: var(--spacing-4);
}

/* ===== CARD HEADER ===== */
.card-header {
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid var(--color-border-primary);
  background: linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary));
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.card-title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.card-title-icon {
  font-size: 1.5rem;
  color: var(--color-primary-500);
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
}

.card-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* ===== FACTURA PDF STATUS ===== */
.factura-pdf-status {
  display: flex;
  align-items: center;
}

.pdf-attached {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pdf-attached:hover {
  background: rgba(34, 197, 94, 0.25);
}

.pdf-missing {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  font-weight: 600;
}

.pdf-na {
  color: var(--color-text-muted);
}

/* ===== FILE UPLOAD ===== */
.file-upload-area {
  border: 2px dashed var(--color-border-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--color-bg-primary);
}

.file-upload-area:hover {
  border-color: var(--color-primary-500);
  background: rgba(59, 130, 246, 0.05);
}

.file-upload-placeholder {
  color: var(--color-text-secondary);
}

.file-upload-placeholder i {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-3);
  color: var(--color-primary-500);
}

.file-upload-placeholder p {
  margin: 0 0 var(--spacing-2);
  font-weight: 500;
}

.file-upload-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.file-upload-selected {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  text-align: left;
}

.file-upload-selected > i {
  font-size: 2rem;
  color: #ef4444;
}

.file-info {
  flex: 1;
}

.file-name {
  display: block;
  font-weight: 600;
  color: var(--color-text-primary);
  word-break: break-all;
}

.file-size {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.file-remove-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--border-radius-md);
  color: #ef4444;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.form-help-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.form-label-optional {
  font-weight: 400;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

/* ===== BUTTONS ===== */
.btn-info {
  background: var(--color-info-500);
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #0891b2;
}

.btn-icon.btn-info:hover {
  background: var(--color-info-500);
  color: white;
  border-color: var(--color-info-500);
}

/* ===== NOTIFICATIONS ===== */
.notification-container {
  position: fixed;
  top: var(--spacing-6);
  right: var(--spacing-6);
  z-index: 9999;
  max-width: 400px;
  width: 100%;
}

.notification {
  background: var(--color-surface-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-primary);
  overflow: hidden;
  animation: slide-in-right var(--transition-base) ease-out;
  margin-bottom: var(--spacing-3);
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification-is-success {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), var(--color-surface-primary));
}

.notification-is-info {
  border-color: rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), var(--color-surface-primary));
}

.notification-is-warning {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--color-surface-primary));
}

.notification-is-danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--color-surface-primary));
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
}

.notification-icon {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.notification-is-success .notification-icon {
  color: var(--color-success-600);
}

.notification-is-info .notification-icon {
  color: var(--color-primary-500);
}

.notification-is-warning .notification-icon {
  color: var(--color-warning-500);
}

.notification-is-danger .notification-icon {
  color: var(--color-error-500);
}

.notification-text {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.375;
  color: var(--color-text-primary);
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.notification-close:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
}

/* ===== MAIN CONTENT CARD ===== */
.content-card {
  background: var(--color-surface-primary);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-primary);
  overflow: hidden;
  transition: all var(--transition-base);
}

.content-card:hover {
  box-shadow: var(--shadow-2xl);
}

.card-actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  flex-wrap: wrap;
}

.card-body {
  padding: var(--spacing-8);
}

/* ===== STATISTICS ===== */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-4);
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid var(--color-border-primary);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-border-primary);
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-secondary);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.stat-icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary-500);
}

.stat-icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning-500);
}

.stat-icon-success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success-500);
}

.stat-icon-primary {
  background: rgba(147, 51, 234, 0.1);
  color: #a78bfa;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-subvalue {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: #22252d;
}

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #16a34a;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: 1px solid var(--color-border-primary);
  border-radius: 0.375rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
  border-color: rgba(255, 255, 255, 0.1);
}

.btn-icon.btn-success:hover {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.btn-icon.btn-warning:hover {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.btn-icon.btn-danger:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* ===== TABLE ===== */
.table-wrapper {
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border-primary);
  overflow-x: auto;
}

.facturas-table {
  width: 100%;
  border-collapse: collapse;
}

.facturas-table thead {
  background: var(--color-surface-secondary);
  border-bottom: 1px solid var(--color-border-primary);
}

.facturas-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.facturas-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
}

.facturas-table tbody tr:last-child td {
  border-bottom: none;
}

.facturas-table tbody tr:hover {
  background: var(--color-surface-secondary);
}

.facturas-table tbody tr.row-inactive {
  opacity: 0.6;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

/* ===== CLIENT INFO ===== */
.client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.client-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: #3b82f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.client-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.client-name {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.client-email {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

/* ===== BADGES & STATUS ===== */
.factura-numero {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--color-surface-secondary);
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-family: monospace;
}

.date-text, .amount-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.amount-text {
  font-weight: 600;
  color: var(--color-text-primary);
}

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
  gap: var(--spacing-2);
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  padding: var(--spacing-8) !important;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-text-muted);
  opacity: 0.3;
  margin-bottom: var(--spacing-3);
}

.empty-state p {
  color: var(--color-text-secondary);
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
  padding: var(--spacing-4);
  backdrop-filter: blur(8px);
  animation: modal-backdrop-appear var(--transition-base) ease-out;
}

@keyframes modal-backdrop-appear {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--color-surface-primary);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--color-border-primary);
  max-width: 90vw;
  max-height: 90vh;
  width: 900px;
  overflow: hidden;
  position: relative;
}

.modal-content.modal-small {
  width: 500px;
}

.modal-content.modal-medium {
  width: 700px;
}

.modal-content.modal-large {
  width: 1100px;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all var(--transition-slow) cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-scale-enter-to,
.modal-scale-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.modal-header {
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-primary));
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent);
  opacity: 0.5;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  position: relative;
  z-index: 1;
}

.modal-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  font-size: 1.125rem;
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.modal-icon-info {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
}

.modal-icon-success {
  background: linear-gradient(135deg, var(--color-success-500), var(--color-success-600));
}

.modal-icon-warning {
  background: linear-gradient(135deg, var(--color-warning-500), #d97706);
}

.modal-icon-danger {
  background: linear-gradient(135deg, var(--color-error-500), var(--color-error-600));
}

.modal-title-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
}

.modal-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  position: relative;
  z-index: 1;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-error-500);
  color: var(--color-error-500);
  transform: scale(1.05);
}

.modal-body {
  padding: var(--spacing-8);
  max-height: calc(90vh - 200px);
  overflow-y: auto;
  position: relative;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: 9999px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--color-border-secondary);
  border-radius: 9999px;
  transition: background var(--transition-fast);
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-primary);
}

.modal-footer {
  padding: var(--spacing-6) var(--spacing-8);
  border-top: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-base) ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}

/* ===== FORMS ===== */
.form-section {
  margin-bottom: var(--spacing-6);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-border-primary);
}

.section-title i {
  color: var(--color-primary-500);
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-border-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.form-label i {
  color: var(--color-primary-500);
  font-size: 0.75rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-lg);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
  outline: none;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-input:read-only {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

/* ===== DETALLES DE RECIBO ===== */
.detalles-container {
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  border: 1px solid var(--color-border-primary);
}

.detalle-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-surface-primary);
  border-radius: var(--border-radius-md);
}

.detalle-order {
  width: 32px;
  height: 32px;
  background: var(--color-primary-500);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.detalle-fields {
  display: flex;
  gap: var(--spacing-2);
  flex: 1;
}

.form-input-small {
  width: 80px;
}

.form-input-medium {
  width: 120px;
}

.empty-detalles {
  padding: var(--spacing-6);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-detalles i {
  font-size: 2rem;
  opacity: 0.3;
  margin-bottom: var(--spacing-2);
}

.empty-detalles p {
  margin: 0;
  font-size: 0.875rem;
}

/* ===== TOTALES ===== */
.totales-container {
  background: var(--color-surface-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border-primary);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--color-border-primary);
}

.total-row:last-child {
  border-bottom: none;
}

.total-row-final {
  padding-top: var(--spacing-3);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  border-top: 2px solid var(--color-border-primary);
}

.total-label {
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.total-value {
  font-weight: 700;
  color: var(--color-text-primary);
}

.input-inline {
  width: 60px;
  padding: 0.25rem 0.5rem;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-primary);
  font-size: 0.875rem;
  text-align: center;
}

/* ===== DETALLE MODAL ===== */
.detalle-section {
  margin-bottom: var(--spacing-6);
}

.detalle-section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-border-primary);
}

.detalle-section-title i {
  color: var(--color-primary-500);
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-3);
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
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detalle-value {
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.detalle-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.detalle-table thead {
  background: var(--color-surface-secondary);
}

.detalle-table th {
  padding: var(--spacing-3);
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.detalle-table td {
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
}

.detalle-table tbody tr:last-child td {
  border-bottom: none;
}

.detalle-table tfoot td {
  padding: var(--spacing-2) var(--spacing-3);
  border-top: 1px solid var(--color-border-primary);
}

.detalle-table tfoot tr.total-final-row td {
  border-top: 2px solid var(--color-border-primary);
  padding-top: var(--spacing-3);
  font-size: 1rem;
}

/* ===== CONFIRMACIÓN ===== */
.confirm-message {
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4);
  line-height: 1.6;
}

.confirm-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--border-radius-lg);
  color: #f87171;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-6);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .page-container {
    padding: var(--spacing-4);
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-content.modal-large {
    width: 95vw;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .facturas-table {
    min-width: 1000px;
  }

  .detalle-fields {
    flex-direction: column;
  }

  .form-input-small,
  .form-input-medium {
    width: 100%;
  }

  .detalle-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
