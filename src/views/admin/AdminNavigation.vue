<template>
  <div>
    <h2 class="text-2xl font-bold text-white mb-6">Navigation (Categories)</h2>
    <div class="panel p-6 max-w-2xl">
      <p class="text-sm text-gray-400 mb-4">Manage the category filter buttons on the homepage. Drag to reorder.</p>
      
      <div ref="navigationList" class="space-y-3 mb-4">
        <div
          v-for="item in navigationItems"
          :key="item.id"
          class="nav-item-row flex items-center gap-2 p-2 bg-bg-panel rounded"
          :data-id="item.id"
        >
          <GripVertical class="cursor-move text-gray-500 flex-shrink-0 h-5 w-5" />
          <input
            v-model="item.link_text"
            type="text"
            class="input flex-grow"
            placeholder="Link Text"
          />
          <button
            @click="removeNavItem(item.id)"
            class="p-2 hover:bg-gray-700 rounded-full"
          >
            <Trash2 class="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>
      
      <div class="mt-4">
        <button @click="addNavItem" class="btn btn-secondary text-sm">
          <Plus class="mr-2 h-4 w-4" />
          Add Nav Item
        </button>
      </div>
      
      <div class="text-right mt-4">
        <button
          @click="saveAllNavigation"
          :disabled="saving"
          class="btn btn-primary"
        >
          <span v-if="!saving">Save All Changes</span>
          <div v-else class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/config/supabase'
import { Plus, GripVertical, Trash2 } from 'lucide-vue-next'
import Sortable from 'sortablejs'

const navigationItems = ref([])
const navigationList = ref(null)
const saving = ref(false)

let sortableInstance = null

function addNavItem() {
  navigationItems.value.push({
    id: `new_${Date.now()}`,
    link_text: ''
  })
}

function removeNavItem(id) {
  navigationItems.value = navigationItems.value.filter(item => item.id !== id)
}

async function saveAllNavigation() {
  saving.value = true
  
  try {
    const updates = navigationItems.value.map((item, index) => ({
      ...(typeof item.id === 'string' && item.id.startsWith('new_') ? {} : { id: item.id }),
      link_text: item.link_text.trim(),
      display_order: index
    })).filter(item => item.link_text)
    
    const { data: existingNav } = await supabase
      .from('navigation')
      .select('id')
      .neq('link_text', 'Home')
    
    const existingIds = (existingNav || []).map(n => n.id)
    const currentIds = updates.filter(u => u.id).map(u => u.id)
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id))
    
    if (idsToDelete.length > 0) {
      await supabase.from('navigation').delete().in('id', idsToDelete)
    }
    
    const recordsToUpdate = updates.filter(u => u.id)
    const recordsToInsert = updates.filter(u => !u.id).map(({ id, ...rest }) => rest)
    
    if (recordsToUpdate.length > 0) {
      await supabase.from('navigation').upsert(recordsToUpdate)
    }
    
    if (recordsToInsert.length > 0) {
      await supabase.from('navigation').insert(recordsToInsert)
    }
    
    showAlert('Navigation updated successfully!')
    await loadNavigation()
  } catch (error) {
    console.error('Error saving navigation:', error)
    showAlert('Failed to save navigation: ' + error.message, true)
  } finally {
    saving.value = false
  }
}

async function loadNavigation() {
  const { data, error } = await supabase
    .from('navigation')
    .select('*')
    .neq('link_text', 'Home')
    .order('display_order')
  
  if (error) {
    console.error('Error loading navigation:', error)
    showAlert('Failed to load navigation', true)
    return
  }
  
  navigationItems.value = data || []
}

function showAlert(message, isError = false) {
  const alertBox = document.createElement('div')
  alertBox.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-green-600'} z-[101]`
  alertBox.textContent = message
  document.body.appendChild(alertBox)
  setTimeout(() => alertBox.remove(), 3000)
}

onMounted(async () => {
  await loadNavigation()
  
  if (navigationList.value) {
    sortableInstance = new Sortable(navigationList.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.cursor-move',
      onEnd: () => {
        const items = navigationList.value.querySelectorAll('.nav-item-row')
        const newOrder = []
        items.forEach(item => {
          const id = item.dataset.id
          const navItem = navigationItems.value.find(n => String(n.id) === id)
          if (navItem) newOrder.push(navItem)
        })
        navigationItems.value = newOrder
      }
    })
  }
})

onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
})
</script>

<style scoped>
.panel {
  background-color: #111111;
  border: 1px solid #222222;
  border-radius: 0.75rem;
}

.input {
  border: 1px solid #222222;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #222222;
  color: #FFFFFF;
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
  cursor: not-allowed;
}

.btn-primary {
  background-color: #FFFFFF;
  color: #000000;
}

.btn-primary:hover:not(:disabled) {
  background-color: #DDDDDD;
}

.btn-secondary {
  background-color: transparent;
  color: #FFFFFF;
  border-color: #222222;
}

.btn-secondary:hover {
  background-color: #111111;
  border-color: #444444;
}

.sortable-ghost {
  background: #222222;
  opacity: 0.5;
}
</style>

