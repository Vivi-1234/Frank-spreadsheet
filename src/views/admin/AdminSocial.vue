<template>
  <div>
    <h2 class="text-2xl font-bold text-white mb-6">Social Media Links</h2>

    <div class="panel p-6 max-w-2xl">
      <div class="space-y-3 mb-4">
        <div
          v-for="social in socialLinks"
          :key="social.tempId"
          class="flex items-center gap-2 social-row"
        >
          <!-- Logo Upload Box -->
          <div
            @click="triggerLogoUpload(social.tempId)"
            class="social-logo-box flex-shrink-0 relative p-2 rounded-lg text-center cursor-pointer border-2 border-dashed flex items-center justify-center bg-gray-800 border-gray-600 w-[60px] h-[60px]"
          >
            <p v-if="!social.previewUrl && !social.icon_url" class="text-xs text-gray-400">
              Upload Logo
            </p>
            <img
              v-if="social.previewUrl || social.icon_url"
              :src="social.previewUrl || social.icon_url"
              class="w-full h-full object-contain"
            />
          </div>
          <input
            :ref="el => setLogoInput(social.tempId, el)"
            type="file"
            class="hidden"
            accept="image/*"
            @change="(e) => handleLogoUpload(e, social)"
          />

          <!-- Platform Name -->
          <input
            v-model="social.platform_name"
            type="text"
            class="input flex-1"
            placeholder="Platform Name"
          />

          <!-- Profile URL -->
          <input
            v-model="social.link_url"
            type="text"
            class="input flex-1"
            placeholder="Profile URL"
          />

          <!-- Delete Button -->
          <button
            @click="deleteSocialRow(social.tempId)"
            class="p-2 hover:bg-gray-700 rounded-full"
          >
            <Trash2 class="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>

      <div class="mt-4">
        <button @click="addSocialRow" class="btn btn-secondary text-sm">
          <Plus class="mr-2 h-4 w-4" />
          Add Social Link
        </button>
      </div>

      <div class="text-right mt-4">
        <button
          @click="saveSocialLinks"
          :disabled="saving"
          class="btn btn-primary"
        >
          <span v-if="!saving">Save Social Links</span>
          <div v-else class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { Plus, Trash2 } from 'lucide-vue-next'

const socialLinks = ref([])
const saving = ref(false)
const logoInputRefs = ref({})

function setLogoInput(id, el) {
  if (el) {
    logoInputRefs.value[id] = el
  }
}

function addSocialRow(item = {}) {
  socialLinks.value.push({
    tempId: item.id ? `existing_${item.id}` : `new_${Date.now()}`,
    id: item.id || null,
    platform_name: item.platform_name || '',
    link_url: item.link_url || '',
    icon_url: item.icon_url || '',
    previewUrl: '',
    logoFile: null
  })
}

function deleteSocialRow(tempId) {
  socialLinks.value = socialLinks.value.filter(s => s.tempId !== tempId)
}

function triggerLogoUpload(tempId) {
  const input = logoInputRefs.value[tempId]
  if (input) {
    input.click()
  }
}

function handleLogoUpload(event, social) {
  const file = event.target.files?.[0]
  if (file) {
    social.logoFile = file
    social.previewUrl = URL.createObjectURL(file)
  }
}

async function uploadImage(file, bucket = 'social-media-images') {
  if (!file) return null
  
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
  const { error } = await supabase.storage.from(bucket).upload(fileName, file)
  
  if (error) {
    console.error('Image upload error:', error)
    return null
  }
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return publicUrl
}

async function saveSocialLinks() {
  saving.value = true
  
  try {
    const updates = []
    
    for (const [index, social] of socialLinks.value.entries()) {
      const platform = social.platform_name.trim()
      const url = social.link_url.trim()
      
      if (!platform || !url) continue
      
      let iconUrl = social.icon_url
      
      if (social.logoFile) {
        iconUrl = await uploadImage(social.logoFile, 'social-media-images')
      }
      
      const record = {
        platform_name: platform,
        link_url: url,
        icon_url: iconUrl,
        display_order: index
      }
      
      if (social.id) {
        record.id = social.id
      }
      
      updates.push(record)
    }
    
    // Get existing records
    const { data: existingRecords } = await supabase
      .from('social_links')
      .select('id')
    
    const existingIds = (existingRecords || []).map(r => r.id)
    const currentIds = updates.filter(r => r.id).map(r => r.id)
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id))
    
    const recordsToUpdate = updates.filter(r => r.id)
    const recordsToInsert = updates.filter(r => !r.id).map(({ id, ...rest }) => rest)
    
    // Delete removed records
    if (idsToDelete.length > 0) {
      await supabase.from('social_links').delete().in('id', idsToDelete)
    }
    
    // Update existing records
    if (recordsToUpdate.length > 0) {
      for (const record of recordsToUpdate) {
        const { id, ...updateData } = record
        await supabase.from('social_links').update(updateData).eq('id', id)
      }
    }
    
    // Insert new records
    if (recordsToInsert.length > 0) {
      await supabase.from('social_links').insert(recordsToInsert)
    }
    
    showAlert('Social links updated!')
    await loadSocialLinks()
  } catch (error) {
    console.error('Error saving social links:', error)
    showAlert('Save failed: ' + error.message, true)
  } finally {
    saving.value = false
  }
}

async function loadSocialLinks() {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order')
    
    if (error) {
      console.error('Error loading social links:', error)
      return
    }
    
    socialLinks.value = []
    
    if (data && data.length > 0) {
      data.forEach(item => addSocialRow(item))
    } else {
      addSocialRow()
    }
  } catch (error) {
    console.error('Error in loadSocialLinks:', error)
  }
}

function showAlert(message, isError = false) {
  const alertBox = document.createElement('div')
  alertBox.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-green-600'} z-[101]`
  alertBox.textContent = message
  document.body.appendChild(alertBox)
  setTimeout(() => alertBox.remove(), 3000)
}

onMounted(() => {
  loadSocialLinks()
})
</script>

<style scoped>
.panel {
  background-color: #111111;
  border: 1px solid #222222;
  border-radius: 0.75rem;
}

.input {
  width: 100%;
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
</style>
