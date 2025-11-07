<template>
  <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center p-4 bg-black">
    <!-- Login Screen -->
    <div class="w-full max-w-sm panel p-8">
      <h1 class="text-3xl font-bold text-center text-white mb-6">Admin Panel</h1>
      <div class="space-y-4">
        <div>
          <label for="password" class="label block mb-1">Password:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            @keyup.enter="handleLogin"
            class="input w-full"
            placeholder="••••••••"
          />
        </div>
        <button
          @click="handleLogin"
          :disabled="isLoggingIn"
          class="w-full btn btn-primary"
        >
          <span v-if="!isLoggingIn">Login</span>
          <div v-else class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
        </button>
      </div>
      <p v-if="errorMessage" class="text-red-400 text-sm text-center mt-4">{{ errorMessage }}</p>
    </div>
  </div>

  <!-- Admin Panel -->
  <div v-else id="admin-panel">
    <!-- Mobile Header -->
    <header class="md:hidden flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-800">
      <h1 class="text-xl font-bold text-white">Admin</h1>
      <button @click="toggleMobileMenu" class="p-2">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>

    <div class="relative flex min-h-screen">
      <!-- Mobile Menu Overlay -->
      <div
        v-show="showMobileMenu"
        @click="toggleMobileMenu"
        class="md:hidden fixed inset-0 bg-black/50 z-30"
      ></div>

      <!-- Sidebar -->
      <aside
        :class="[
          'w-64 p-4 flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 bg-black border-r border-gray-800',
          showMobileMenu ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:translate-x-0 md:flex'
        ]"
      >
        <h1 class="text-2xl font-bold text-white px-2 pb-4 border-b border-gray-800">Spreadsheet</h1>
        
        <nav class="mt-6 space-y-2 flex-grow">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="closeMobileMenu"
            class="tab-button"
            active-class="active"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5" />
            {{ item.label }}
          </router-link>
          
          <div class="px-3 py-2 text-xs uppercase text-gray-500 font-semibold tracking-wider">Pages</div>
          
          <router-link
            to="/admin/how-to-buy"
            @click="closeMobileMenu"
            class="tab-button"
            active-class="active"
          >
            <BookOpen class="mr-3 h-5 w-5" />
            How-to-buy
          </router-link>
          
          <router-link
            to="/admin/navigation"
            @click="closeMobileMenu"
            class="tab-button"
            active-class="active"
          >
            <List class="mr-3 h-5 w-5" />
            Categories
          </router-link>
          
          <div class="px-3 py-2 text-xs uppercase text-gray-500 font-semibold tracking-wider">Settings</div>
          
          <router-link
            to="/admin/settings"
            @click="closeMobileMenu"
            class="tab-button"
            active-class="active"
          >
            <SlidersHorizontal class="mr-3 h-5 w-5" />
            Site Settings
          </router-link>
          
          <router-link
            to="/admin/social"
            @click="closeMobileMenu"
            class="tab-button"
            active-class="active"
          >
            <Share2 class="mr-3 h-5 w-5" />
            Social Media
          </router-link>
        </nav>

        <div class="pt-4 border-t border-gray-800">
          <button
            @click="handleLogout"
            class="w-full text-sm font-medium text-red-400 hover:text-red-500 text-left px-2 py-2 flex items-center"
          >
            <LogOut class="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-4 md:p-8 overflow-y-auto bg-black">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import {
  LayoutDashboard,
  Package,
  Copyright,
  Tag,
  BookOpen,
  List,
  SlidersHorizontal,
  Share2,
  LogOut
} from 'lucide-vue-next'

const router = useRouter()
const { isAuthenticated, login, logout, checkAuth } = useAuth()

const password = ref('')
const isLoggingIn = ref(false)
const errorMessage = ref('')
const showMobileMenu = ref(false)

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/brands', label: 'Brands', icon: Copyright },
  { path: '/admin/tags', label: 'Tags', icon: Tag }
]

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function closeMobileMenu() {
  showMobileMenu.value = false
}

async function handleLogin() {
  if (!password.value) {
    errorMessage.value = 'Please enter a password.'
    return
  }

  isLoggingIn.value = true
  errorMessage.value = ''

  const result = await login(password.value)

  isLoggingIn.value = false

  if (result.success) {
    router.push('/admin/dashboard')
  } else {
    errorMessage.value = result.error || 'Invalid password or server error.'
  }
}

function handleLogout() {
  logout()
}

onMounted(() => {
  checkAuth()
})
</script>

<style scoped>
.panel {
  background-color: #111111;
  border: 1px solid #222222;
  border-radius: 0.75rem;
}

.tab-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  color: #AAAAAA;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #111111;
  color: #FFFFFF;
}

.tab-button.active {
  background-color: #FFFFFF;
  color: #000000;
  font-weight: 600;
}

.label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #AAAAAA;
}

.input {
  width: 100%;
  border: 1px solid #222222;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
  background-color: #222222;
  color: #FFFFFF;
}

.input::placeholder {
  color: #666666;
}

.input:focus {
  outline: none;
  border-color: #FFFFFF;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
}

.btn:disabled {
  background-color: #222222 !important;
  color: #666666;
  border-color: #333333 !important;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #FFFFFF;
  color: #000000;
}

.btn-primary:hover:not(:disabled) {
  background-color: #DDDDDD;
}
</style>

