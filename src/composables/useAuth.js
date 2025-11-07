import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isAuthenticated = ref(false)
const adminToken = ref(null)

export function useAuth() {
  const router = useRouter()

  const login = async (password) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        return { success: false, error: `Authentication failed, status: ${response.status}` }
      }

      const result = await response.json()
      
      if (result.success && result.accessToken) {
        adminToken.value = result.accessToken
        isAuthenticated.value = true
        sessionStorage.setItem('supabase_admin_token', result.accessToken)
        return { success: true }
      }

      return { success: false, error: 'Invalid password or server error.' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login request failed. Check connection.' }
    }
  }

  const logout = () => {
    adminToken.value = null
    isAuthenticated.value = false
    sessionStorage.removeItem('supabase_admin_token')
    router.push('/admin')
  }

  const checkAuth = () => {
    const token = sessionStorage.getItem('supabase_admin_token')
    if (token) {
      adminToken.value = token
      isAuthenticated.value = true
      return true
    }
    return false
  }

  const getAuthenticatedClient = () => {
    // Return authenticated Supabase client
    return null // Will be implemented when needed
  }

  return {
    isAuthenticated,
    adminToken,
    login,
    logout,
    checkAuth,
    getAuthenticatedClient
  }
}

