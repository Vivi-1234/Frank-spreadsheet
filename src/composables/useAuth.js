import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'

const isAuthenticated = ref(false)
const user = ref(null)

export function useAuth() {
  const router = useRouter()

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        user.value = data.user
        isAuthenticated.value = true
        return { success: true }
      }

      return { success: false, error: 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An error occurred during login' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      user.value = null
      isAuthenticated.value = false
      router.push('/admin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser) {
        user.value = currentUser
        isAuthenticated.value = true
        return true
      }
      
      return false
    } catch (error) {
      console.error('Check auth error:', error)
      return false
    }
  }

  const getAuthenticatedClient = () => {
    // Supabase client automatically uses the current session
    return supabase
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth,
    getAuthenticatedClient
  }
}

