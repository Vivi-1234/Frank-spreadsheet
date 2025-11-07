<template>
  <div>
    <h2 class="text-2xl font-bold text-white mb-6">Site Settings</h2>
    <div class="panel p-6 space-y-6 max-w-2xl">
      <div>
        <label for="siteTitle" class="label">Main Title</label>
        <input
          v-model="settings.site_title"
          id="siteTitle"
          type="text"
          class="input mt-1"
        />
      </div>
      
      <div>
        <label for="siteSubtitle" class="label">Subtitle</label>
        <textarea
          v-model="settings.site_subtitle"
          id="siteSubtitle"
          class="input mt-1"
          rows="2"
        ></textarea>
      </div>
      
      <div>
        <label class="label">Hero Background Image</label>
        <div
          @click="triggerHeroBgUpload"
          class="mt-1 relative p-4 rounded-lg bg-black text-center cursor-pointer text-gray-400 border-2 border-dashed border-gray-600 hover:border-white"
        >
          <p v-if="!settings.hero_background_url && !previewHeroBg" class="hero-bg-placeholder">
            Click to upload or drag an image here
          </p>
          <img
            v-if="previewHeroBg || settings.hero_background_url"
            :src="previewHeroBg || settings.hero_background_url"
            class="max-h-32 mx-auto rounded"
          />
          <button
            v-if="previewHeroBg || settings.hero_background_url"
            @click.stop="deleteHeroBg"
            class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
        <input
          ref="heroBgInput"
          type="file"
          class="hidden"
          accept="image/*"
          @change="handleHeroBgUpload"
        />
      </div>
      
      <div class="text-right pt-4 border-t border-gray-800">
        <button
          @click="saveSettings"
          :disabled="saving"
          class="btn btn-primary"
        >
          <span v-if="!saving">Save Settings</span>
          <div v-else class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { Trash2 } from 'lucide-vue-next'

const settings = ref({
  id: 1,
  site_title: '',
  site_subtitle: '',
  hero_background_url: ''
})

const heroBgInput = ref(null)
const heroBgFile = ref(null)
const previewHeroBg = ref('')
const saving = ref(false)

function triggerHeroBgUpload() {
  heroBgInput.value?.click()
}

function handleHeroBgUpload(event) {
  const file = event.target.files?.[0]
  if (file) {
    heroBgFile.value = file
    previewHeroBg.value = URL.createObjectURL(file)
  }
}

function deleteHeroBg() {
  heroBgFile.value = null
  previewHeroBg.value = ''
  settings.value.hero_background_url = ''
  if (heroBgInput.value) {
    heroBgInput.value.value = ''
  }
}

async function uploadImage(file, bucket = 'site-assets') {
  if (!file) return null
  
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
  const { error } = await supabase.storage.from(bucket).upload(fileName, file)
  
  if (error) {
    console.error('Image upload error:', error)
    showAlert('Image upload failed: ' + error.message, true)
    return null
  }
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return publicUrl
}

async function saveSettings() {
  saving.value = true
  
  try {
    let uploadedHeroBgUrl = settings.value.hero_background_url
    
    if (heroBgFile.value) {
      uploadedHeroBgUrl = await uploadImage(heroBgFile.value, 'site-assets')
    }
    
    const updates = {
      id: 1,
      site_title: settings.value.site_title,
      site_subtitle: settings.value.site_subtitle,
      hero_background_url: uploadedHeroBgUrl
    }
    
    const { error } = await supabase
      .from('settings')
      .upsert(updates)
    
    if (error) {
      showAlert('Save failed: ' + error.message, true)
    } else {
      showAlert('Site settings saved!')
      heroBgFile.value = null
      previewHeroBg.value = ''
      await loadSettings()
    }
  } catch (error) {
    console.error('Error saving settings:', error)
    showAlert('Save failed: ' + error.message, true)
  } finally {
    saving.value = false
  }
}

async function loadSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error loading settings:', error)
    return
  }
  
  if (data) {
    settings.value = {
      id: data.id || 1,
      site_title: data.site_title || '',
      site_subtitle: data.site_subtitle || '',
      hero_background_url: data.hero_background_url || ''
    }
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
  loadSettings()
})
</script>

<style scoped>
.panel {
  background-color: #111111;
  border: 1px solid #222222;
  border-radius: 0.75rem;
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
</style>

