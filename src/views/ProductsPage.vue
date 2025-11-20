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
          loading="lazy"
          class="w-full h-full object-cover rounded-full"
          style="box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);"
        />
      </a>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <section class="text-center py-16 md:py-24 relative overflow-hidden rounded-lg fade-in-up" style="pointer-events: none;">
        <!-- Optimized background image using <img> instead of CSS background for better preloading -->
        <img
          v-if="siteSettings.hero_bg_url"
          :src="siteSettings.hero_bg_url"
          alt="Hero Background"
          fetchpriority="high"
          class="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 opacity-20"
        />
        <div class="relative">
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight text-white">
            {{ siteSettings.main_title || "Frank's Best Overseas Finds" }}
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-400">
            {{ siteSettings.subtitle || "The Only 100% Authentic Spreadsheet! Ungatekeeping The Best Overseas Brands" }}
          </p>
        </div>
      </section>

      <!-- Product Section -->
      <section class="-mt-6 fade-in-up">
        <!-- Filters & Sort -->
        <div class="mb-4 md:mb-6 px-2">
          <div class="flex flex-row flex-nowrap justify-center items-center gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto scrollbar-hide relative">
            <!-- Sort -->
            <div class="inline-flex items-center gap-1 sm:gap-1.5 md:gap-3 bg-white/5 border border-white/10 rounded-full px-1 sm:px-1.5 h-9 md:h-11 flex-shrink-0">
              <span class="text-xs md:text-sm text-gray-400 ml-2 hidden md:inline">Sort:</span>
              <button
                @click="sortOrder = 'default'"
                :class="[
                  'px-2 sm:px-2.5 md:px-3 py-1 md:py-1.5 text-xs rounded-full transition-all duration-200 whitespace-nowrap',
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
                  'px-2 sm:px-2.5 md:px-3 py-1 md:py-1.5 text-xs rounded-full transition-all duration-200 whitespace-nowrap',
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
                  'px-2 sm:px-2.5 md:px-3 py-1 md:py-1.5 text-xs rounded-full transition-all duration-200 whitespace-nowrap',
                  sortOrder === 'price_desc'
                    ? 'bg-white text-black font-medium'
                    : 'text-gray-400 hover:text-white'
                ]"
              >
                High-Low
              </button>
            </div>
            
            <!-- Brand Dropdown Button -->
            <div class="flex-shrink-0" ref="brandsDropdown">
               <button
                 @click.stop="toggleBrandsMenu"
                 class="inline-flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 rounded-full px-2.5 sm:px-3 md:px-4 h-9 md:h-11 text-xs md:text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
               >
                 <span class="text-gray-400 hidden md:inline">Brand:</span>
                 <span class="font-medium text-white truncate max-w-[60px] sm:max-w-[80px] md:max-w-[120px]">{{ selectedBrandName }}</span>
                 <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                 </svg>
               </button>
            </div>
          </div>
          
          <!-- Brand Dropdown Menu (Outside overflow container) -->
          <Teleport to="body">
            <div
              v-show="showBrandsMenu"
              :style="dropdownStyle"
              class="fixed w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 max-h-80 overflow-y-auto z-[9999]"
            >
              <a
                href="#"
                @click.prevent="selectBrand('all')"
                :class="['block px-4 py-2.5 text-sm transition-colors', currentBrand === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white']"
              >
                All Brands
              </a>
              <a
                v-for="brand in brands"
                :key="brand.id"
                href="#"
                @click.prevent="selectBrand(brand.id)"
                :class="['block px-4 py-2.5 text-sm transition-colors', currentBrand == brand.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white']"
              >
                {{ brand.name }}
              </a>
            </div>
          </Teleport>
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
            
            <!-- Frank's Picks Button (if exists) -->
            <button
              v-for="cat in categories.filter(c => c.label.toLowerCase().includes('frank') && c.label.toLowerCase().includes('pick'))"
              :key="cat.value"
              @click="selectCategory(cat.value)"
              :class="[
                'filter-btn px-4 sm:px-5 py-2 border rounded-full transition-all duration-300 text-sm sm:text-base whitespace-nowrap flex-shrink-0',
                currentCategory === cat.value
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-400 font-bold'
                  : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/50 hover:from-amber-500/30 hover:to-yellow-500/30 hover:border-amber-400 font-semibold'
              ]"
            >
              {{ cat.label }}
            </button>
            
            <!-- Under $100 Special Button -->
            <button
              @click="selectCategory('under_100')"
              :class="[
                'filter-btn px-4 sm:px-5 py-2 border rounded-full transition-all duration-300 text-sm sm:text-base whitespace-nowrap flex-shrink-0',
                currentCategory === 'under_100'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-500 font-bold'
                  : 'bg-gradient-to-r from-red-500/20 to-rose-600/20 text-red-400 border-red-500/50 hover:from-red-500/30 hover:to-rose-600/30 hover:border-red-400 font-semibold'
              ]"
            >
              Under $100
            </button>
            
            <!-- Other Category Buttons -->
            <button
              v-for="cat in categories.filter(c => !(c.label.toLowerCase().includes('frank') && c.label.toLowerCase().includes('pick')))"
              :key="cat.value"
              @click="selectCategory(cat.value)"
              :class="[
                'filter-btn px-4 sm:px-5 py-2 border rounded-full transition-all duration-300 text-sm sm:text-base whitespace-nowrap flex-shrink-0',
                currentCategory === cat.value
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-gray-400 border-white/20 hover:bg-white/10 hover:text-white hover:border-white/30'
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
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import { getCachedData, setCachedData } from '@/utils/cache'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const router = useRouter()

// State
const products = ref([])
const categories = ref([])
const brands = ref([])
const showBrandsMenu = ref(false)
const brandsDropdown = ref(null)
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
const sortOrder = ref('default') // 'default', 'price_asc', 'price_desc'

const selectedBrandName = computed(() => {
  if (currentBrand.value && currentBrand.value !== 'all') {
    const brand = brands.value.find(b => b.id.toString() === currentBrand.value.toString())
    return brand ? brand.name : 'All Brands'
  }
  return 'All Brands'
})

// Dropdown positioning
const dropdownStyle = ref({})

function updateDropdownPosition() {
  if (brandsDropdown.value) {
    const rect = brandsDropdown.value.getBoundingClientRect()
    const isMobile = window.innerWidth < 768
    
    if (isMobile) {
      // Center on mobile
      dropdownStyle.value = {
        top: `${rect.bottom + 8}px`,
        left: '50%',
        transform: 'translateX(-50%)'
      }
    } else {
      // Align to right on desktop
      dropdownStyle.value = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.right - 256}px` // 256px = w-64
      }
    }
  }
}

function toggleBrandsMenu() {
  showBrandsMenu.value = !showBrandsMenu.value
  if (showBrandsMenu.value) {
    updateDropdownPosition()
  }
}

function selectBrand(brandId) {
  showBrandsMenu.value = false
  currentBrand.value = brandId
  
  // Update URL
  const query = { ...route.query }
  if (brandId === 'all') {
    delete query.brand
  } else {
    query.brand = brandId
  }
  router.push({ query })
  
  loadProducts(true)
}

function handleClickOutside(event) {
  // Check if click is outside both the button and the dropdown menu
  const clickedOutsideButton = brandsDropdown.value && !brandsDropdown.value.contains(event.target)
  const clickedOutsideMenu = !event.target.closest('.fixed.w-64') // The dropdown menu class
  
  if (clickedOutsideButton && clickedOutsideMenu) {
    showBrandsMenu.value = false
  }
}

let observer = null

// Load brands
async function loadBrands() {
  const cachedBrands = getCachedData('frank_brands')
  if (cachedBrands) {
    brands.value = cachedBrands
  } else {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .order('name')
    if (data) {
      brands.value = data
      setCachedData('frank_brands', data)
    }
  }
}

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
    if (currentCategory.value === 'under_100') {
      // Filter products under $100 (convert to CNY: $100 / 0.14 = ~714.29 CNY)
      const maxPriceCNY = 100 / exchangeRate
      query = query.lte('price', maxPriceCNY)
    } else if (currentCategory.value !== 'all') {
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
    
    // Log site visit - REMOVED (Handled by Global Router)
    // if (currentPage.value === 1) {
    //   logSiteVisit()
    // }
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
    loadBrands(),
    loadSocialLinks()
  ])
  await loadProducts(true)
  setupInfiniteScroll()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updateDropdownPosition)
  window.addEventListener('resize', updateDropdownPosition)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition)
  window.removeEventListener('resize', updateDropdownPosition)
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
