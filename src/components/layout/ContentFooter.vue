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
.content-footer {
  text-align: center;
  font-size: 0.8125rem;
  color: #9ca3af;
  position: relative;
  overflow: hidden;
}

.content-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.footer-copyright {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-copyright p {
  margin: 0;
  font-weight: 500;
  color: #6b7280;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-links a {
  color: #9ca3af;
  text-decoration: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  position: relative;
}

.footer-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.footer-links a:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.footer-links a:hover::after {
  width: 80%;
}

@media (max-width: 640px) {
  .footer-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
  }

  .footer-links {
    gap: 0.75rem;
  }

  .footer-links a {
    font-size: 0.75rem;
  }
}
</style>
