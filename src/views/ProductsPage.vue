<template>
  <div class="min-h-screen">
    <!-- Header -->
    <AppHeader />

    <!-- Social Sidebar -->
    <div class="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col items-center space-y-4 hidden md:flex">
      <a
        v-for="social in socialLinks"
        :key="social.id"
        :href="social.link_url"
        target="_blank"
        rel="noopener noreferrer"
        :title="social.platform_name"
        class="social-sidebar-icon block w-12 h-12 transition-transform duration-300 hover:scale-110"
      >
        <img
          v-if="social.icon_url"
          :src="social.icon_url"
          :alt="social.platform_name"
          class="w-full h-full object-cover rounded-full"
          style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);"
        />
      </a>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <section class="text-center py-16 md:py-24 relative overflow-hidden rounded-lg fade-in-up" style="pointer-events: none;">
        <div
          v-if="siteSettings.hero_bg_url"
          :style="{ backgroundImage: `url(${siteSettings.hero_bg_url})` }"
          class="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-500 opacity-20"
        ></div>
        <div class="relative">
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight text-white">
            {{ siteSettings.main_title || "Frank's Best Overseas Finds" }}
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-400">
            {{ siteSettings.subtitle || "The Only 100% Authentic Spreadsheet! Ungatekeeping The Best Overseas Brands" }}
          </p>
          
          <!-- Discount Code Box -->
          <div class="mt-8">
            <div
              ref="discountBox"
              class="inline-flex items-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full px-5 py-2.5 cursor-pointer transition-all duration-200"
              style="pointer-events: auto;"
              @click="copyDiscountCode"
            >
              <Gift v-if="!codeCopied" class="h-4 w-4 mr-2 text-gray-400" />
              <CheckCircle v-if="codeCopied" class="h-4 w-4 mr-2 text-green-400" />
              <span class="text-sm text-gray-300">
                <template v-if="!codeCopied">
                  15% OFF Shipping Code: <span class="font-bold text-white">Frank</span>
                </template>
                <template v-else>
                  Copied!
                </template>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Product Section -->
      <section class="-mt-6 fade-in-up">
        <!-- Price Sort -->
        <div class="flex justify-center mb-4 md:mb-6 relative">
          <div class="inline-flex items-center gap-1.5 md:gap-3 bg-white/5 border border-white/10 rounded-full px-2 md:px-4 py-1.5 md:py-2 relative z-10">
            <span class="text-xs md:text-sm text-gray-400">Sort:</span>
            <button
              @click="sortOrder = 'default'"
              :class="[
                'px-2.5 md:px-3 py-1.5 md:py-2 text-xs rounded-full transition-all duration-200 whitespace-nowrap',
                sortOrder === 'default'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              ]"
            >
              Default
            </button>
            <button
              @click="sortOrder = 'price_asc'"
              :class="[
                'px-2.5 md:px-3 py-1.5 md:py-2 text-xs rounded-full transition-all duration-200 whitespace-nowrap',
                sortOrder === 'price_asc'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              ]"
            >
              Low-High
            </button>
            <button
              @click="sortOrder = 'price_desc'"
              :class="[
                'px-2.5 md:px-3 py-1.5 md:py-2 text-xs rounded-full transition-all duration-200 whitespace-nowrap',
                sortOrder === 'price_desc'
                  ? 'bg-white text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              ]"
            >
              High-Low
            </button>
          </div>
        </div>

        <!-- Category Filters -->
        <div class="mb-8 md:mb-12">
          <div class="flex md:flex-wrap md:justify-center gap-2 md:gap-3 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide">
            <!-- All Button -->
            <button
              @click="selectCategory('all')"
              :class="[
                'filter-btn px-4 sm:px-5 py-2 border rounded-full transition-all duration-300 text-sm sm:text-base whitespace-nowrap flex-shrink-0',
                currentCategory === 'all'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-gray-400 border-white/20 hover:bg-white/10 hover:text-white hover:border-white/30'
              ]"
            >
              All
            </button>
            
            <!-- Category Buttons -->
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="selectCategory(cat.value)"
              :class="[
                'filter-btn px-4 sm:px-5 py-2 border rounded-full transition-all duration-300 text-sm sm:text-base whitespace-nowrap flex-shrink-0',
                cat.label.toLowerCase().includes('frank') && cat.label.toLowerCase().includes('pick')
                  ? (currentCategory === cat.value
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/50'
                      : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/50 hover:from-amber-500/30 hover:to-yellow-500/30 hover:border-amber-400 font-semibold')
                  : (currentCategory === cat.value
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-gray-400 border-white/20 hover:bg-white/10 hover:text-white hover:border-white/30')
              ]"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 min-h-[500px]">
          <!-- Loading Skeletons -->
          <template v-if="loading && products.length === 0">
            <div v-for="n in 16" :key="`skeleton-${n}`" class="skeleton-card bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
              <div class="skeleton-placeholder aspect-square"></div>
              <div class="p-4 space-y-3">
                <div class="skeleton-placeholder h-4 rounded w-3/4"></div>
                <div class="skeleton-placeholder h-4 rounded w-1/2"></div>
                <div class="skeleton-placeholder h-6 rounded w-1/3 mt-2"></div>
              </div>
            </div>
          </template>
          
          <!-- Products -->
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            :exchange-rate="exchangeRate"
            @click="logProductClick(product.name)"
          />
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>

        <!-- No Products -->
        <div v-if="!loading && products.length === 0" class="text-center text-gray-500 py-12">
          <p class="text-lg">No products found for your filter.</p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <AppFooter class="mt-20 md:mt-28" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/config/supabase'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ProductCard from '@/components/ProductCard.vue'
import { Gift, CheckCircle } from 'lucide-vue-next'

const route = useRoute()

// State
const products = ref([])
const categories = ref([])
const socialLinks = ref([])
const siteSettings = ref({
  main_title: "Frank's Best Overseas Finds",
  subtitle: "The Only 100% Authentic Spreadsheet! Ungatekeeping The Best Overseas Brands",
  hero_bg_url: ''
})

const currentCategory = ref('all')
const currentBrand = ref('all')
const loading = ref(false)
const allProductsLoaded = ref(false)
const currentPage = ref(1)
const pageSize = 48
const exchangeRate = 0.14 // CNY to USD
const codeCopied = ref(false)
const sortOrder = ref('default') // 'default', 'price_asc', 'price_desc'

let observer = null

// Load site settings
async function loadSiteSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()
    
    if (data && !error) {
      siteSettings.value = {
        main_title: data.site_title || siteSettings.value.main_title,
        subtitle: data.site_subtitle || siteSettings.value.subtitle,
        hero_bg_url: data.hero_background_url || ''
      }
    }
  } catch (error) {
    console.error('Error loading site settings:', error)
    // If settings table doesn't exist or is empty, use default values
  }
}

// Load categories/navigation
async function loadCategories() {
  try {
    const { data, error } = await supabase
      .from('navigation')
      .select('*')
      .order('display_order')
    
    if (error) throw error
    
    // Filter out "Home" and map to categories
    categories.value = (data || [])
      .filter(nav => nav.link_text && nav.link_text.toLowerCase() !== 'home')
      .map(nav => ({
        label: nav.link_text,
        value: nav.link_text
      }))
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

// Load social links
async function loadSocialLinks() {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order')
    
    if (!error && data) {
      socialLinks.value = data
    }
  } catch (error) {
    console.error('Error loading social links:', error)
  }
}

// Load products
async function loadProducts(reset = false) {
  if (loading.value || (allProductsLoaded.value && !reset)) return
  
  loading.value = true
  
  if (reset) {
    currentPage.value = 1
    allProductsLoaded.value = false
    products.value = []
  }
  
  try {
    const from = (currentPage.value - 1) * pageSize
    const to = from + pageSize - 1
    
    let query = supabase
      .from('products')
      .select('*, brands(name)', { count: 'exact' })
      .eq('is_active', true)
    
    // Apply brand filter
    if (currentBrand.value !== 'all') {
      query = query.eq('brand_id', currentBrand.value)
    }
    
    // Apply category filter
    if (currentCategory.value !== 'all') {
      query = query.like('category', `%${currentCategory.value}%`)
    }
    
    // Apply sorting
    if (sortOrder.value === 'price_asc') {
      query = query.order('price', { ascending: true })
    } else if (sortOrder.value === 'price_desc') {
      query = query.order('price', { ascending: false })
    } else {
      // Default sorting
      query = query
        .order('tags', { ascending: false, nullsFirst: false })
        .order('display_order', { ascending: true })
    }
    
    const { data, error, count } = await query.range(from, to)
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      allProductsLoaded.value = true
    } else {
      if (reset) {
        products.value = data
      } else {
        products.value = [...products.value, ...data]
      }
      currentPage.value++
      
      // Check if all products are loaded
      if (data.length < pageSize || (currentPage.value * pageSize) >= count) {
        allProductsLoaded.value = true
      }
    }
    
    // Log site visit
    if (currentPage.value === 1) {
      logSiteVisit()
    }
  } catch (error) {
    console.error('Error loading products:', error)
  } finally {
    loading.value = false
  }
}

// Select category
function selectCategory(category) {
  currentCategory.value = category
  currentBrand.value = 'all' // Reset brand when changing category
  loadProducts(true)
}

// Initialize filters from URL
function initFiltersFromURL() {
  currentBrand.value = route.query.brand || 'all'
  currentCategory.value = route.query.category || 'all'
}

// Copy discount code
function copyDiscountCode() {
  navigator.clipboard?.writeText('Frank').then(() => {
    codeCopied.value = true
    setTimeout(() => {
      codeCopied.value = false
    }, 2000)
  }).catch((err) => {
    console.error('Failed to copy: ', err)
    showToast('Discount code: Frank')
  })
}

// Log site visit
async function logSiteVisit() {
  try {
    await supabase.from('analytics_events').insert({
      event_type: 'site_visit',
      event_value: 'Products Page'
    })
  } catch (error) {
    console.error('Error logging site visit:', error)
  }
}

// Log product click
async function logProductClick(productName) {
  try {
    await supabase.from('analytics_events').insert({
      event_type: 'product_click',
      event_value: productName
    })
  } catch (error) {
    console.error('Error logging product click:', error)
  }
}

// Show toast notification
function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in'
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2000)
}

// Setup infinite scroll
function setupInfiniteScroll() {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value && !allProductsLoaded.value) {
        loadProducts()
      }
    },
    { rootMargin: '200px' }
  )
  
  // Observe the footer
  const footer = document.querySelector('footer')
  if (footer) {
    observer.observe(footer)
  }
}

onMounted(async () => {
  // Initialize filters from URL
  initFiltersFromURL()
  
  await Promise.all([
    loadSiteSettings(),
    loadCategories(),
    loadSocialLinks()
  ])
  await loadProducts(true)
  setupInfiniteScroll()
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Watch for URL query changes (brand/category selection)
watch(() => route.query, () => {
  initFiltersFromURL()
  loadProducts(true)
}, { deep: true })

// Watch for sort order changes
watch(sortOrder, () => {
  loadProducts(true)
})
</script>

<style scoped>
.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-btn {
  cursor: pointer;
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* Skeleton Loader Styles */
.skeleton-card {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-placeholder {
  background-color: rgba(255, 255, 255, 0.05);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Hide scrollbar for category filters on mobile */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>
