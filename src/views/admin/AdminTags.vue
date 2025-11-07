<template>
  <div>
    <h2 class="text-2xl font-bold text-white mb-6">Tag Management</h2>
    <div class="panel p-6 max-w-2xl">
      <p class="text-sm text-gray-400 mb-4">Manage special tags like "Sales", "Top Selling", etc. Drag to reorder.</p>
      
      <div class="flex items-center gap-2 mb-4">
        <input
          v-model="newTagName"
          @keyup.enter="addNewTag"
          type="text"
          class="input flex-grow"
          placeholder="Enter new tag name (e.g., Sales)"
        />
        <button @click="addNewTag" class="btn btn-secondary">
          <Plus class="h-4 w-4" />
        </button>
      </div>
      
      <div ref="tagList" class="space-y-3 mb-4 border-t border-gray-800 pt-4">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="tag-item-row flex items-center gap-2 p-2 bg-bg-panel rounded"
          :data-id="tag.id"
        >
          <GripVertical class="cursor-move text-gray-500 flex-shrink-0 h-5 w-5" />
          <input
            v-model="tag.name"
            type="text"
            class="input flex-grow"
            placeholder="Tag name"
          />
          <button
            @click="removeTag(tag.id)"
            class="p-2 hover:bg-gray-700 rounded-full"
          >
            <Trash2 class="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>
      
      <div class="text-right mt-4">
        <button
          @click="saveAllTags"
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

const tags = ref([])
const newTagName = ref('')
const tagList = ref(null)
const saving = ref(false)

let sortableInstance = null

function addNewTag() {
  if (!newTagName.value.trim()) return
  
  tags.value.push({
    id: `new_${Date.now()}`,
    name: newTagName.value.trim()
  })
  
  newTagName.value = ''
}

function removeTag(id) {
  tags.value = tags.value.filter(t => t.id !== id)
}

async function saveAllTags() {
  saving.value = true
  
  try {
    const updates = tags.value.map((tag, index) => ({
      ...(typeof tag.id === 'string' && tag.id.startsWith('new_') ? {} : { id: tag.id }),
      name: tag.name.trim(),
      display_order: index
    })).filter(t => t.name)
    
    const { data: existingTags } = await supabase
      .from('product_tags')
      .select('id')
    
    const existingIds = (existingTags || []).map(t => t.id)
    const currentIds = updates.filter(t => t.id).map(t => t.id)
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id))
    
    if (idsToDelete.length > 0) {
      await supabase.from('product_tags').delete().in('id', idsToDelete)
    }
    
    const recordsToUpdate = updates.filter(t => t.id)
    const recordsToInsert = updates.filter(t => !t.id).map(({ id, ...rest }) => rest)
    
    if (recordsToUpdate.length > 0) {
      await supabase.from('product_tags').upsert(recordsToUpdate)
    }
    
    if (recordsToInsert.length > 0) {
      await supabase.from('product_tags').insert(recordsToInsert)
    }
    
    showAlert('Tags updated successfully!')
    await loadTags()
  } catch (error) {
    console.error('Error saving tags:', error)
    showAlert('Failed to save tags: ' + error.message, true)
  } finally {
    saving.value = false
  }
}

async function loadTags() {
  const { data, error } = await supabase
    .from('product_tags')
    .select('*')
    .order('display_order')
  
  if (error) {
    console.error('Error loading tags:', error)
    showAlert('Failed to load tags', true)
    return
  }
  
  tags.value = data || []
}

function showAlert(message, isError = false) {
  const alertBox = document.createElement('div')
  alertBox.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-green-600'} z-[101]`
  alertBox.textContent = message
  document.body.appendChild(alertBox)
  setTimeout(() => alertBox.remove(), 3000)
}

onMounted(async () => {
  await loadTags()
  
  if (tagList.value) {
    sortableInstance = new Sortable(tagList.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.cursor-move',
      onEnd: () => {
        const items = tagList.value.querySelectorAll('.tag-item-row')
        const newOrder = []
        items.forEach(item => {
          const id = item.dataset.id
          const tag = tags.value.find(t => String(t.id) === id)
          if (tag) newOrder.push(tag)
        })
        tags.value = newOrder
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

