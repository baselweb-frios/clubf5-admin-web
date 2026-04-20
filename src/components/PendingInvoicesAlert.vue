<template>
  <div
 v-if="show && pendingInvoices.length > 0"
 class="alert"
 :class="hasOverdueInvoices ? 'alert-danger' : 'alert-warning'"
 >
    <div class="flex-between">
      <div class="flex items-start gap-3">
        <div class="text-warning-500">
          <i class="fas fa-exclamation-triangle" />
        </div>
        <div>
          <h3 class="text-lg font-semibold">
            {{ hasOverdueInvoices ? 'Recibos Vencidas' : 'Recibos Pendientes de Pago' }}
          </h3>
          <p class="text-text-secondary">
            Tienes {{ pendingInvoices.length }} recibo{{ pendingInvoices.length > 1 ? 's' : '' }}
            {{ hasOverdueInvoices ? 'que requieren atención inmediata' : 'pendientes de pago' }}
          </p>
        </div>
      </div>
      <button
 class="btn-icon"
 title="Cerrar"
 @click="dismiss"
 >
        <svg
 class="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
          <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M6 18L18 6M6 6l12 12"
 />
        </svg>
      </button>
    </div>

      <div class="grid grid-cols-3 gap-4 mt-4">
        <div class="text-center">
          <span class="text-xs text-text-secondary block">Total a Pagar</span>
          <span class="text-lg font-semibold">{{ formatCurrency(totalAmount) }}</span>
        </div>
        <div
 v-if="overdueCount > 0"
 class="text-center"
 >
          <span class="text-xs text-text-secondary block">Vencidas</span>
          <span class="text-lg font-semibold text-danger-400">{{ overdueCount }}</span>
        </div>
        <div
 v-if="upcomingCount > 0"
 class="text-center"
 >
          <span class="text-xs text-text-secondary block">Por Vencer</span>
          <span class="text-lg font-semibold">{{ upcomingCount }}</span>
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
            <hr>
            <span class="invoice-date">
              <i class="fas fa-calendar-alt" />
              {{ formatDate(invoice.fac_vencimiento) }}
            </span>
          </div>
          <div class="invoice-amount">
            <span class="amount-value">{{ formatCurrency(invoice.fac_total) }}</span>
            <span
v-if="isOverdue(invoice)"
class="overdue-badge"
>Vencida</span>
            <span
v-else-if="isDueSoon(invoice)"
class="due-soon-badge"
>Por vencer</span>
          </div>
        </div>
        <div
v-if="pendingInvoices.length > maxDisplay"
class="invoices-more"
>
          +{{ pendingInvoices.length - maxDisplay }} recibo{{ pendingInvoices.length - maxDisplay > 1 ? 's' : '' }} más
        </div>
      </div>

      <div class="invoices-alert-actions">
        <button
class="invoices-btn-primary"
@click="goToInvoices"
>
          <i class="fas fa-file-invoice-dollar" />
          Ver Recibos 
        </button> 
        <hr>
        <button
class="invoices-btn-secondary"
@click="remindLater"
>
          <i class="fas fa-clock" />
          Recordar más tarde
        </button>
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
  router.push('/Recibos')
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
/* ===== INVOICES LIST ===== */
.invoices-list {
  @apply mt-4 space-y-2;
}

/* Invoice Item */
.invoice-item {
  @apply flex items-center justify-between;
  @apply p-3 rounded-lg;
  @apply bg-dark-secondary/50;
  @apply border border-dark-border;
  @apply transition-all duration-200;
}

.light .invoice-item {
  @apply bg-light-secondary/50 border-light-border;
}

.invoice-item:hover {
  @apply bg-dark-hover;
}

.light .invoice-item:hover {
  @apply bg-light-hover;
}

/* Overdue Invoice */
.invoice-item.invoice-overdue {
  @apply bg-danger-500/10 border-danger-500/30;
}

.invoice-item.invoice-overdue:hover {
  @apply bg-danger-500/20;
}

/* Invoice Info */
.invoice-info {
  @apply flex items-center gap-3;
}

.invoice-info hr {
  @apply hidden;
}

.invoice-number {
  @apply text-sm font-semibold text-text-primary;
}

.light .invoice-number {
  @apply text-text-light-primary;
}

.invoice-date {
  @apply flex items-center gap-1.5;
  @apply text-xs text-text-tertiary;
}

.light .invoice-date {
  @apply text-text-light-tertiary;
}

.invoice-date i {
  @apply text-xs;
}

/* Invoice Amount */
.invoice-amount {
  @apply flex items-center gap-2;
}

.amount-value {
  @apply text-sm font-bold text-text-primary;
}

.light .amount-value {
  @apply text-text-light-primary;
}

/* Badges */
.overdue-badge {
  @apply px-2 py-0.5 rounded-full;
  @apply text-xs font-medium;
  @apply bg-danger-500/20 text-danger-400;
}

.due-soon-badge {
  @apply px-2 py-0.5 rounded-full;
  @apply text-xs font-medium;
  @apply bg-warning-500/20 text-warning-400;
}

/* More Invoices */
.invoices-more {
  @apply text-center py-2;
  @apply text-xs text-text-tertiary;
}

.light .invoices-more {
  @apply text-text-light-tertiary;
}

/* ===== ACTIONS ===== */
.invoices-alert-actions {
  @apply flex items-center gap-3 mt-4 pt-4;
  @apply border-t border-dark-border/50;
}

.light .invoices-alert-actions {
  @apply border-light-border/50;
}

.invoices-alert-actions hr {
  @apply hidden;
}

/* Primary Button */
.invoices-btn-primary {
  @apply inline-flex items-center gap-2;
  @apply px-4 py-2 rounded-lg;
  @apply text-sm font-medium;
  @apply bg-primary-600 text-white;
  @apply hover:bg-primary-500;
  @apply transition-all duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
  @apply active:scale-[0.98];
}

/* Secondary Button */
.invoices-btn-secondary {
  @apply inline-flex items-center gap-2;
  @apply px-4 py-2 rounded-lg;
  @apply text-sm font-medium;
  @apply bg-dark-elevated text-text-secondary;
  @apply hover:bg-dark-hover hover:text-text-primary;
  @apply transition-all duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-border;
  @apply active:scale-[0.98];
}

.light .invoices-btn-secondary {
  @apply bg-light-secondary text-text-light-secondary;
  @apply hover:bg-light-hover hover:text-text-light-primary;
}

/* ===== DISMISS BUTTON ===== */
.btn-icon {
  @apply p-2 rounded-lg;
  @apply text-text-tertiary;
  @apply hover:bg-dark-hover hover:text-text-primary;
  @apply transition-all duration-200;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
}

.light .btn-icon {
  @apply text-text-light-tertiary;
  @apply hover:bg-light-hover hover:text-text-light-primary;
}
</style>

