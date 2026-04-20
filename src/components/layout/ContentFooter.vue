<template>
  <footer class="content-footer">
    <div class="footer-content">
      <div class="footer-copyright">
        <p>&copy; {{ currentYear }} ClubF5. Todos los derechos reservados.</p>
      </div>
      <div class="footer-links">
        <a href="#">Términos</a>
        <a href="#">Privacidad</a>
        <a href="#">Soporte</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
/* Footer */
.content-footer {
  @apply mt-auto py-4 px-4 sm:px-6;
  @apply border-t border-dark-border;
}

.light .content-footer {
  @apply border-light-border;
}

/* Footer Content */
.footer-content {
  @apply flex flex-col sm:flex-row items-center justify-between gap-3;
  @apply max-w-7xl mx-auto;
}

/* Copyright */
.footer-copyright {
  @apply text-xs text-text-tertiary;
}

.light .footer-copyright {
  @apply text-text-light-tertiary;
}

.footer-copyright p {
  @apply m-0;
}

/* Links */
.footer-links {
  @apply flex items-center gap-4;
}

.footer-links a {
  @apply text-xs text-text-secondary;
  @apply hover:text-primary-400;
  @apply transition-colors duration-200;
}

.light .footer-links a {
  @apply text-text-light-secondary;
  @apply hover:text-primary-600;
}
</style>
