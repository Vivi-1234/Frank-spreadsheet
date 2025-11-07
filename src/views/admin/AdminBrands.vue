<template>
  <div>
    <h2 class="text-2xl font-bold text-white mb-6">Brand Management</h2>
    <div class="panel p-6 max-w-2xl">
      <p class="text-sm text-gray-400 mb-4">Manage product brands. Drag to reorder.</p>
      
      <div class="flex items-center gap-2 mb-4">
        <input
          v-model="newBrandName"
          @keyup.enter="addNewBrand"
          type="text"
          class="input flex-grow"
          placeholder="Enter new brand name"
        />
        <button @click="addNewBrand" class="btn btn-secondary">
          <Plus class="h-4 w-4" />
        </button>
      </div>
      
      <div ref="brandList" class="space-y-3 mb-4 border-t border-gray-800 pt-4">
        <div
          v-for="brand in brands"
          :key="brand.id"
          class="brand-item-row flex items-center gap-2 p-2 bg-bg-panel rounded"
          :data-id="brand.id"
        >
          <GripVertical class="cursor-move text-gray-500 flex-shrink-0 h-5 w-5" />
          <input
            v-model="brand.name"
            type="text"
            class="input flex-grow"
            placeholder="Brand name"
          />
          <button
            @click="removeBrand(brand.id)"
            class="p-2 hover:bg-gray-700 rounded-full"
          >
            <Trash2 class="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>
      
      <div class="text-right mt-4">
        <button
          @click="saveAllBrands"
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

const brands = ref([])
const newBrandName = ref('')
const brandList = ref(null)
const saving = ref(false)

let sortableInstance = null

function addNewBrand() {
  if (!newBrandName.value.trim()) return
  
  brands.value.push({
    id: `new_${Date.now()}`,
    name: newBrandName.value.trim()
  })
  
  newBrandName.value = ''
}

function removeBrand(id) {
  brands.value = brands.value.filter(b => b.id !== id)
}

async function saveAllBrands() {
  saving.value = true
  
  try {
    const updates = brands.value.map((brand, index) => ({
      ...(typeof brand.id === 'string' && brand.id.startsWith('new_') ? {} : { id: brand.id }),
      name: brand.name.trim(),
      display_order: index
    })).filter(b => b.name)
    
    // Get existing brand IDs
    const { data: existingBrands } = await supabase
      .from('brands')
      .select('id')
    
    const existingIds = (existingBrands || []).map(b => b.id)
    const currentIds = updates.filter(b => b.id).map(b => b.id)
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id))
    
    // Delete removed brands
    if (idsToDelete.length > 0) {
      await supabase.from('brands').delete().in('id', idsToDelete)
    }
    
    // Upsert brands
    const recordsToUpdate = updates.filter(b => b.id)
    const recordsToInsert = updates.filter(b => !b.id).map(({ id, ...rest }) => rest)
    
    if (recordsToUpdate.length > 0) {
      await supabase.from('brands').upsert(recordsToUpdate)
    }
    
    if (recordsToInsert.length > 0) {
      await supabase.from('brands').insert(recordsToInsert)
    }
    
    showAlert('Brands updated successfully!')
    
    // Reload brands
    await loadBrands()
  } catch (error) {
    console.error('Error saving brands:', error)
    showAlert('Failed to save brands: ' + error.message, true)
  } finally {
    saving.value = false
  }
}

async function loadBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('display_order')
  
  if (error) {
    console.error('Error loading brands:', error)
    showAlert('Failed to load brands', true)
    return
  }
  
  brands.value = data || []
}

function showAlert(message, isError = false) {
  const alertBox = document.createElement('div')
  alertBox.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-green-600'} z-[101]`
  alertBox.textContent = message
  document.body.appendChild(alertBox)
  setTimeout(() => alertBox.remove(), 3000)
}

onMounted(async () => {
  await loadBrands()
  
  // Initialize sortable
  if (brandList.value) {
    sortableInstance = new Sortable(brandList.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.cursor-move',
      onEnd: () => {
        // Update brands order based on DOM order
        const items = brandList.value.querySelectorAll('.brand-item-row')
        const newOrder = []
        items.forEach(item => {
          const id = item.dataset.id
          const brand = brands.value.find(b => String(b.id) === id)
          if (brand) newOrder.push(brand)
        })
        brands.value = newOrder
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

