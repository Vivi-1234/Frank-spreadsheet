<template>
  <div class="landing-page">
    <!-- Simple Clean Landing -->
    <div class="landing-container">
      <!-- Logo/Brand -->
      <div class="brand-badge">
        <span class="pulse-dot"></span>
        100% Authentic
      </div>

      <!-- Main Heading -->
      <h1 class="landing-title">
        FRANK'S BEST<br>
        <span class="gradient-text">OVERSEAS FINDS</span>
      </h1>

      <!-- Subtitle -->
      <p class="landing-subtitle">
        Ungatekeeping the best overseas brands.<br>
        Curated. Authentic. Direct.
      </p>

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value">{{ stats.products }}+</div>
          <div class="stat-label">Products</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.brands }}+</div>
          <div class="stat-label">Brands</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">100%</div>
          <div class="stat-label">Authentic</div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="cta-group">
        <a 
          href="https://mulebuy.com/register?ref=200520423" 
          target="_blank"
          rel="noopener noreferrer"
          class="btn-signup"
          @click="trackSignup"
        >
          🎉 Sign Up for $400 Coupons
        </a>
        <router-link to="/products" class="btn-primary">
          Browse Products
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </router-link>
      </div>

    </div>

    <!-- Footer -->
    <footer class="landing-footer">
      <p class="footer-brand">Franks AUTHENTIC Spreadsheet</p>
      <p class="footer-disclaimer">
        Stayfocusedfrank.net does not sell any physical products and neither does Mulebuy.
      </p>
      <p class="footer-copyright">&copy; 2025 All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'

const stats = ref({
  products: 0,
  brands: 0
})

// Track sign up button click
function trackSignup() {
  console.log('Sign up button clicked - Ref: 200520423')
  // Analytics tracking can be added here
}

onMounted(async () => {
  // Load stats
  try {
    const [productsRes, brandsRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('brands').select('id', { count: 'exact', head: true })
    ])
    
    if (productsRes.error) {
      console.error('Error loading products count:', productsRes.error)
    }
    if (brandsRes.error) {
      console.error('Error loading brands count:', brandsRes.error)
    }
    
    stats.value = {
      products: productsRes.count || 0,
      brands: brandsRes.count || 0
    }
    
    console.log('Stats loaded:', stats.value)
  } catch (error) {
    console.error('Error loading stats:', error)
  }
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0D0D0D;
}

.landing-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

/* Brand Badge */
.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2.5rem;
  animation: fadeIn 0.8s ease-out;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}

/* Landing Title */
.landing-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  color: #fff;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.gradient-text {
  background: linear-gradient(135deg, #FFFFFF 0%, #A0A0A0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Subtitle */
.landing-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 3rem;
  max-width: 600px;
  animation: fadeInUp 1s ease-out 0.4s both;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 1.5rem 2.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  animation: fadeInUp 1s ease-out 0.6s both;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 0; /* Allow flex items to shrink */
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap; /* Keep label on one line */
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

/* CTA Buttons */
.cta-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 3rem;
  animation: fadeInUp 1s ease-out 0.8s both;
}

.btn-signup,
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  border-radius: 9999px;
  transition: all 0.3s ease;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.btn-signup {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.btn-signup::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-signup:hover::before {
  left: 100%;
}

.btn-signup:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.5);
}

.btn-primary {
  background: #fff;
  color: #000;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 4px 30px rgba(239, 68, 68, 0.6);
  }
}

/* Footer */
.landing-footer {
  padding: 2rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-brand {
  font-size: 1.125rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
}

.footer-disclaimer {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  max-width: 500px;
  margin: 0 auto 1rem;
  line-height: 1.5;
}

.footer-copyright {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* Responsive */
@media (max-width: 768px) {
  .landing-container {
    padding: 1.5rem;
  }

  .stats-bar {
    flex-direction: row; /* Keep horizontal on mobile */
    gap: 1rem; /* Reduce gap */
    padding: 1rem 1.5rem; /* Reduce padding */
    flex-wrap: nowrap; /* Don't wrap */
  }

  .stat-item {
    flex: 1; /* Equal width for all items */
  }

  .stat-value {
    font-size: 1.5rem; /* Smaller font on mobile */
  }

  .stat-label {
    font-size: 0.625rem; /* Smaller label */
  }

  .stat-divider {
    width: 1px;
    height: 30px; /* Shorter divider */
  }

  .cta-group {
    flex-direction: column;
    width: 100%;
  }

  .btn-signup,
  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .brand-badge {
    font-size: 0.8125rem;
    padding: 0.375rem 1rem;
  }

  .landing-title {
    margin-bottom: 1rem;
  }

  .landing-subtitle {
    font-size: 0.9375rem;
    margin-bottom: 2rem;
  }

  .stats-bar {
    gap: 0.5rem; /* Even tighter on very small screens */
    padding: 0.875rem 1rem;
  }

  .stat-value {
    font-size: 1.25rem; /* Even smaller */
  }

  .stat-label {
    font-size: 0.5625rem; /* Smaller label */
    letter-spacing: 0.02em; /* Tighter letter spacing */
  }

  .stat-divider {
    height: 25px; /* Even shorter divider */
  }
}
</style>

