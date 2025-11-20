import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/config/supabase'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/ProductsPage.vue')
  },
  {
    path: '/how-to-buy',
    name: 'HowToBuy',
    component: () => import('../views/HowToBuyPage.vue')
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue')
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/AdminProducts.vue')
      },
      {
        path: 'brands',
        name: 'AdminBrands',
        component: () => import('../views/admin/AdminBrands.vue')
      },
      {
        path: 'tags',
        name: 'AdminTags',
        component: () => import('../views/admin/AdminTags.vue')
      },
      {
        path: 'navigation',
        name: 'AdminNavigation',
        component: () => import('../views/admin/AdminNavigation.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/AdminSettings.vue')
      },
      {
        path: 'social',
        name: 'AdminSocial',
        component: () => import('../views/admin/AdminSocial.vue')
      },
      {
        path: 'how-to-buy',
        name: 'AdminHowToBuy',
        component: () => import('../views/admin/AdminHowToBuy.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0 }
    }
  }
})

// Global Analytics Tracking
router.afterEach((to) => {
  // Log site visit
  // We only log 'site_visit' here. 'product_click' is logged by specific actions.
  // You can add filters here to ignore certain paths (e.g. /admin) if needed.
  
  // Don't log admin pages
  if (to.path.startsWith('/admin')) return

  const pageName = to.name || to.path
  
  // Use setTimeout to not block navigation
  setTimeout(async () => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'site_visit',
        event_value: pageName
      })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }, 0)
})

export default router

