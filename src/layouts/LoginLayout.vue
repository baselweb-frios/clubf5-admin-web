<template>
  <div class="login-layout">
    <div class="login-background"></div>
    <div class="login-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// Simple layout for login and authentication pages
</script>

<style scoped>
/* ===== PREMIUM LOGIN LAYOUT - DARK MODE ===== */
.login-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

/* Animated Background Pattern */
.login-background {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 60%);
  pointer-events: none;
  animation: breathe 8s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.login-container {
  width: 100%;
  max-width: 28rem;
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .login-layout {
    padding: 1rem;
  }

  .login-container {
    max-width: 100%;
  }
}
</style>
