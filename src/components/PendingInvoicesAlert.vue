<template>
  <div v-if="show && pendingInvoices.length > 0" class="invoices-alert">
    <div class="invoices-alert-content">
      <div class="invoices-alert-header">
        <div class="invoices-alert-icon" :class="{ 'icon-urgent': hasOverdueInvoices }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div class="invoices-alert-text">
          <h3 class="invoices-alert-title">
            {{ hasOverdueInvoices ? 'Facturas Vencidas' : 'Facturas Pendientes de Pago' }}
          </h3>
          <p class="invoices-alert-description">
            Tienes {{ pendingInvoices.length }} factura{{ pendingInvoices.length > 1 ? 's' : '' }}
            {{ hasOverdueInvoices ? 'que requieren atención inmediata' : 'pendientes de pago' }}
          </p>
        </div>
        <button @click="dismiss" class="invoices-alert-close" title="Cerrar">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="invoices-summary">
        <div class="summary-item">
          <span class="summary-label">Total a Pagar</span>
          <span class="summary-value">{{ formatCurrency(totalAmount) }}</span>
        </div>
        <div v-if="overdueCount > 0" class="summary-item summary-overdue">
          <span class="summary-label">Vencidas</span>
          <span class="summary-value">{{ overdueCount }}</span>
        </div>
        <div v-if="upcomingCount > 0" class="summary-item">
          <span class="summary-label">Por Vencer</span>
          <span class="summary-value">{{ upcomingCount }}</span>
        </div>
      </div>

      <div class="invoices-list">
        <div
          v-for="invoice in displayedInvoices"
          :key="invoice.fac_codigo"
          class="invoice-item"
          :class="{ 'invoice-overdue': isOverdue(invoice) }"
        >
          <div class="invoice-info">
            <span class="invoice-number">{{ invoice.fac_numero }}</span>
            <span class="invoice-date">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {{ formatDate(invoice.fac_vencimiento) }}
            </span>
          </div>
          <div class="invoice-amount">
            <span class="amount-value">{{ formatCurrency(invoice.fac_total) }}</span>
            <span v-if="isOverdue(invoice)" class="overdue-badge">Vencida</span>
            <span v-else-if="isDueSoon(invoice)" class="due-soon-badge">Por vencer</span>
          </div>
        </div>
        <div v-if="pendingInvoices.length > maxDisplay" class="invoices-more">
          +{{ pendingInvoices.length - maxDisplay }} factura{{ pendingInvoices.length - maxDisplay > 1 ? 's' : '' }} más
        </div>
      </div>

      <div class="invoices-alert-actions">
        <button @click="goToInvoices" class="invoices-btn-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          Ver Facturas
        </button>
        <button @click="remindLater" class="invoices-btn-secondary">
          Recordar más tarde
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  invoices: {
    type: Array,
    default: () => []
  },
  maxDisplay: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['dismiss', 'view-invoices'])

const router = useRouter()
const show = ref(true)

const pendingInvoices = computed(() => {
  return props.invoices.filter(inv => inv.fac_estado === 'P' || inv.fac_estado === 'V')
})

const displayedInvoices = computed(() => {
  return pendingInvoices.value.slice(0, props.maxDisplay)
})

const totalAmount = computed(() => {
  return pendingInvoices.value.reduce((sum, inv) => sum + (inv.fac_total || 0), 0)
})

const overdueCount = computed(() => {
  return pendingInvoices.value.filter(inv => isOverdue(inv)).length
})

const upcomingCount = computed(() => {
  return pendingInvoices.value.filter(inv => !isOverdue(inv)).length
})

const hasOverdueInvoices = computed(() => {
  return overdueCount.value > 0
})

const isOverdue = (invoice) => {
  if (!invoice.fac_vencimiento) return false
  const dueDate = new Date(invoice.fac_vencimiento)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
}

const isDueSoon = (invoice) => {
  if (!invoice.fac_vencimiento) return false
  const dueDate = new Date(invoice.fac_vencimiento)
  const today = new Date()
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
  return daysUntilDue >= 0 && daysUntilDue <= 7
}

const formatDate = (date) => {
  if (!date) return 'Sin fecha'
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount || 0)
}

const dismiss = () => {
  show.value = false
  emit('dismiss')
}

const remindLater = () => {
  localStorage.setItem('invoicesAlertDismissed', Date.now().toString())
  show.value = false
  emit('dismiss')
}

const goToInvoices = () => {
  emit('view-invoices')
  router.push('/facturas')
}

onMounted(() => {
  const dismissedTime = localStorage.getItem('invoicesAlertDismissed')
  if (dismissedTime) {
    const hoursSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60)
    if (hoursSinceDismissal < 24) {
      show.value = false
    } else {
      localStorage.removeItem('invoicesAlertDismissed')
    }
  }
})
</script>

<style scoped>
.invoices-alert {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
  animation: slideDown 0.4s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.invoices-alert-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.invoices-alert-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.invoices-alert-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
}

.invoices-alert-icon.icon-urgent {
  background: rgba(239, 68, 68, 0.3);
  animation: pulse-urgent 2s infinite;
}

@keyframes pulse-urgent {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

.invoices-alert-text {
  flex: 1;
}

.invoices-alert-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #e5e7eb);
  margin: 0 0 0.375rem 0;
}

.invoices-alert-description {
  font-size: 0.875rem;
  color: var(--text-secondary, #9ca3af);
  margin: 0;
}

.invoices-alert-close {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary, #9ca3af);
  transition: all 0.2s ease;
}

.invoices-alert-close:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.invoices-summary {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #e5e7eb);
}

.summary-overdue .summary-value {
  color: #ef4444;
}

.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invoice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.625rem;
  transition: all 0.2s ease;
}

.invoice-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.invoice-item.invoice-overdue {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
}

.invoice-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.invoice-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #e5e7eb);
  font-family: monospace;
}

.invoice-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
}

.invoice-date svg {
  width: 0.875rem;
  height: 0.875rem;
}

.invoice-amount {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.amount-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary, #e5e7eb);
}

.overdue-badge {
  display: inline-flex;
  padding: 0.25rem 0.625rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #f87171;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.due-soon-badge {
  display: inline-flex;
  padding: 0.25rem 0.625rem;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.invoices-more {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-secondary, #9ca3af);
  padding: 0.5rem;
}

.invoices-alert-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.invoices-btn-primary,
.invoices-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
}

.invoices-btn-primary {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.invoices-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.invoices-btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary, #9ca3af);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.invoices-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-primary, #e5e7eb);
}

@media (max-width: 640px) {
  .invoices-alert {
    padding: 1rem;
  }

  .invoices-summary {
    flex-direction: column;
    gap: 0.75rem;
  }

  .invoices-alert-actions {
    flex-direction: column;
  }

  .invoices-btn-primary,
  .invoices-btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .invoice-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .invoice-amount {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
