<template>
  <div>
    <header class="header sticky top-0 z-[90]">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="text-base sm:text-xl font-bold tracking-tighter truncate">
            Franks AUTHENTIC Spreadsheet
          </router-link>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-8">
            <nav class="flex items-center space-x-8">
              <router-link to="/" class="nav-link text-sm font-medium">Home</router-link>
              <router-link to="/products" class="nav-link text-sm font-medium">Products</router-link>
              
              <!-- Brands Dropdown Removed -->


              <router-link to="/how-to-buy" class="nav-link text-sm font-medium">How-to-buy</router-link>
            </nav>

            <!-- Search Button -->
            <div class="relative">
              <button v-if="!showSearch" @click="openSearch" class="p-2 text-gray-300 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <div v-else class="relative">
                <input
                  ref="searchInput"
                  v-model="searchValue"
                  @keyup.enter="performSearch"
                  @blur="closeSearchDelayed"
                  type="text"
                  placeholder="Search products..."
                  class="w-64 h-10 pl-10 pr-10 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:bg-white/15 focus:border-white/30"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button @click="closeSearch" class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button @click="toggleMobileMenu" class="md:hidden p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <div
      v-show="showMobileMenu"
      class="fixed inset-0 bg-black/70 z-[9998] md:hidden"
      @click="toggleMobileMenu"
    ></div>
    
    <!-- Mobile Menu -->
    <div
      :class="[
        'fixed top-0 right-0 h-full w-72 bg-black border-l border-white/20 shadow-2xl z-[9999] transform transition-transform duration-300 md:hidden overflow-y-auto',
        showMobileMenu ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <!-- Close Button -->
      <div class="flex justify-between items-center p-6 border-b border-white/10">
        <span class="text-lg font-bold text-white">Menu</span>
        <button @click="toggleMobileMenu" class="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="p-6 flex flex-col space-y-2">
        <router-link 
          to="/" 
          @click="toggleMobileMenu" 
          class="mobile-nav-link text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200"
        >
          Home
        </router-link>
        <router-link 
          to="/products" 
          @click="toggleMobileMenu" 
          class="mobile-nav-link text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200"
        >
          Products
        </router-link>
        
        <!-- Mobile Brands Removed -->


        <router-link 
          to="/how-to-buy" 
          @click="toggleMobileMenu" 
          class="mobile-nav-link text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all duration-200"
        >
          How-to-buy
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/config/supabase'
import { getCachedData, setCachedData } from '@/utils/cache'

const router = useRouter()
const route = useRoute()

const showMobileMenu = ref(false)
const showSearch = ref(false)
const searchValue = ref('')
const searchInput = ref(null)

let closeSearchTimeout = null

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}


function openSearch() {
  showSearch.value = true
  setTimeout(() => {
    searchInput.value?.focus()
  }, 100)
}

function closeSearch() {
  showSearch.value = false
  searchValue.value = ''
}

function closeSearchDelayed() {
  closeSearchTimeout = setTimeout(() => {
    if (searchValue.value === '') {
      closeSearch()
    }
  }, 200)
}

function performSearch() {
  if (searchValue.value.trim()) {
    router.push(`/products?q=${encodeURIComponent(searchValue.value)}`)
    closeSearch()
  }
}

onMounted(async () => {
  // Brands loading removed from header
})

onBeforeUnmount(() => {
  if (closeSearchTimeout) {
    clearTimeout(closeSearchTimeout)
  }
})

</script>

<style scoped>
.header {
  background-color: rgba(13, 13, 13, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-link {
  position: relative;
  transition: color 0.3s ease;
  padding-bottom: 6px;
}

.nav-link:after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  display: block;
  margin-top: 4px;
  right: 0;
  background: #FFFFFF;
  transition: width 0.3s ease;
  bottom: 0;
}

.nav-link:hover:after,
.nav-link.router-link-active:after {
  width: 100%;
  left: 0;
}
</style>

