<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-white">"How-to-buy" Page Management</h2>
      <button
        @click="saveAllChanges"
        :disabled="saving"
        class="btn btn-primary"
      >
        <Save v-if="!saving" class="mr-2 h-4 w-4" />
        <div v-else class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
        Save All Changes
      </button>
    </div>

    <!-- General Settings -->
    <div class="panel p-6 space-y-6">
      <h3 class="text-lg font-semibold text-white">General Settings</h3>
      <div>
        <label class="label">Tutorial Video URL</label>
        <input
          v-model="settings.video_url"
          type="text"
          class="input mt-1"
          placeholder="Enter YouTube 'embed' link"
        />
      </div>
      <div>
        <label class="label">Sign Up Button Link</label>
        <input
          v-model="settings.signup_url"
          type="text"
          class="input mt-1"
          placeholder="Enter the link for the sign up button"
        />
      </div>
    </div>

    <!-- Tutorial Steps -->
    <div class="panel p-6">
      <h3 class="text-lg font-semibold mb-4 text-white">Tutorial Steps</h3>
      <p class="text-sm text-gray-400 mb-4">
        Add, remove, or reorder the main steps. Sub-steps can be managed within each main step.
      </p>
      
      <div ref="stepsContainer" class="space-y-4">
        <div
          v-for="mainStep in mainSteps"
          :key="mainStep.tempId"
          class="main-step-card p-4 border border-gray-800 rounded-lg bg-black/30 space-y-4"
          :data-id="mainStep.tempId"
        >
          <!-- Main Step Header -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2 flex-grow">
              <GripVertical class="main-step-drag-handle cursor-move text-gray-500 h-5 w-5" />
              <input
                v-model="mainStep.title"
                type="text"
                class="input flex-grow"
                placeholder="Main Step Title (e.g., Requirements)"
              />
            </div>
            <button
              @click="deleteMainStep(mainStep.tempId)"
              class="btn btn-danger btn-xs ml-4"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>

          <!-- Sub Steps -->
          <div class="pl-8">
            <h4 class="text-sm font-semibold text-gray-400 mb-2">Sub-steps:</h4>
            <div :ref="el => setSubStepsContainer(mainStep.tempId, el)" class="space-y-3">
              <div
                v-for="subStep in mainStep.subSteps"
                :key="subStep.tempId"
                class="sub-step-row p-4 border border-gray-800 rounded-lg bg-bg-panel space-y-4"
                :data-id="subStep.tempId"
              >
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <GripVertical class="sub-step-drag-handle cursor-move text-gray-600 h-5 w-5" />
                    <h5 class="font-semibold text-gray-400">Sub-step</h5>
                  </div>
                  <button
                    @click="deleteSubStep(mainStep.tempId, subStep.tempId)"
                    class="btn btn-danger btn-xs"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-4">
                    <div>
                      <label class="label">Sub-step Title</label>
                      <input
                        v-model="subStep.title"
                        type="text"
                        class="input mt-1"
                      />
                    </div>
                    <div>
                      <label class="label">Description</label>
                      <textarea
                        v-model="subStep.description"
                        class="input mt-1"
                        rows="4"
                      ></textarea>
                    </div>
                  </div>

                  <div class="space-y-1">
                    <label class="label">Image</label>
                    <div
                      @click="triggerImageUpload(subStep.tempId)"
                      class="step-image-upload-box relative p-4 rounded-lg text-center cursor-pointer text-gray-500 border-2 border-dashed border-gray-600 hover:border-white h-full flex items-center justify-center"
                    >
                      <p v-if="!subStep.previewUrl && !subStep.image_url">Click to upload</p>
                      <img
                        v-if="subStep.previewUrl || subStep.image_url"
                        :src="subStep.previewUrl || subStep.image_url"
                        class="max-h-32 mx-auto rounded"
                      />
                      <button
                        v-if="subStep.previewUrl || subStep.image_url"
                        @click.stop="deleteStepImage(subStep)"
                        class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      :ref="el => setImageInput(subStep.tempId, el)"
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="(e) => handleImageUpload(e, subStep)"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              @click="addSubStep(mainStep.tempId)"
              class="btn btn-secondary btn-xs mt-3"
            >
              <Plus class="mr-2 h-3 w-3" />
              Add Sub-step
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button @click="addMainStep" class="btn btn-secondary">
          <Plus class="mr-2 h-4 w-4" />
          Add New Main Step
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { supabase } from '@/config/supabase'
import { Save, Plus, GripVertical, Trash2, X } from 'lucide-vue-next'
import Sortable from 'sortablejs'

const settings = ref({
  video_url: '',
  signup_url: ''
})

const mainSteps = ref([])
const saving = ref(false)
const stepsContainer = ref(null)
const subStepsContainerRefs = ref({})
const imageInputRefs = ref({})

let mainStepsSortable = null
const subStepsSortables = {}

function setSubStepsContainer(id, el) {
  if (el) {
    subStepsContainerRefs.value[id] = el
  }
}

function setImageInput(id, el) {
  if (el) {
    imageInputRefs.value[id] = el
  }
}

function addMainStep() {
  const tempId = `new_main_${Date.now()}`
  mainSteps.value.push({
    tempId,
    id: null,
    title: '',
    subSteps: []
  })
  
  nextTick(() => {
    initializeSubStepsSortable(tempId)
  })
}

function deleteMainStep(tempId) {
  if (confirm('Are you sure you want to delete this entire main step and all its sub-steps?')) {
    mainSteps.value = mainSteps.value.filter(s => s.tempId !== tempId)
  }
}

function addSubStep(mainStepTempId) {
  const mainStep = mainSteps.value.find(s => s.tempId === mainStepTempId)
  if (mainStep) {
    mainStep.subSteps.push({
      tempId: `new_sub_${Date.now()}`,
      id: null,
      title: '',
      description: '',
      image_url: '',
      previewUrl: '',
      imageFile: null
    })
  }
}

function deleteSubStep(mainStepTempId, subStepTempId) {
  const mainStep = mainSteps.value.find(s => s.tempId === mainStepTempId)
  if (mainStep) {
    mainStep.subSteps = mainStep.subSteps.filter(s => s.tempId !== subStepTempId)
  }
}

function triggerImageUpload(tempId) {
  const input = imageInputRefs.value[tempId]
  if (input) {
    input.click()
  }
}

function handleImageUpload(event, subStep) {
  const file = event.target.files?.[0]
  if (file) {
    subStep.imageFile = file
    subStep.previewUrl = URL.createObjectURL(file)
  }
}

function deleteStepImage(subStep) {
  subStep.imageFile = null
  subStep.previewUrl = ''
  subStep.image_url = ''
}

async function uploadImage(file, bucket = 'how-to-buy-steps') {
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

async function saveAllChanges() {
  saving.value = true
  
  try {
    // Save settings
    const { data: existingSettings } = await supabase
      .from('how_to_buy_settings')
      .select('id')
      .limit(1)
      .single()
    
    const settingsPayload = {
      video_url: settings.value.video_url || null,
      signup_url: settings.value.signup_url || null,
      updated_at: new Date().toISOString()
    }
    
    if (existingSettings?.id) {
      await supabase
        .from('how_to_buy_settings')
        .update(settingsPayload)
        .eq('id', existingSettings.id)
    } else {
      await supabase
        .from('how_to_buy_settings')
        .insert({
          ...settingsPayload,
          id: 1
        })
    }
    
    // Save steps
    let displayOrder = 0
    const allPayloads = []
    
    for (const mainStep of mainSteps.value) {
      const mainTitle = mainStep.title.trim()
      if (!mainTitle) continue
      
      // Main step payload
      allPayloads.push({
        id: mainStep.id,
        title: mainTitle,
        section_title: null,
        description: null,
        image_url: null,
        display_order: displayOrder++
      })
      
      // Sub steps
      for (const subStep of mainStep.subSteps) {
        let imageUrl = subStep.image_url
        
        if (subStep.imageFile) {
          imageUrl = await uploadImage(subStep.imageFile, 'how-to-buy-steps')
        }
        
        allPayloads.push({
          id: subStep.id,
          title: subStep.title.trim(),
          description: subStep.description.trim(),
          image_url: imageUrl,
          section_title: mainTitle,
          display_order: displayOrder++
        })
      }
    }
    
    // Delete removed steps
    const { data: existingSteps } = await supabase
      .from('how_to_buy_steps')
      .select('id')
    
    const existingIds = (existingSteps || []).map(s => s.id)
    const currentIds = allPayloads.filter(p => p.id).map(p => p.id)
    const idsToDelete = existingIds.filter(id => !currentIds.includes(id))
    
    if (idsToDelete.length > 0) {
      await supabase.from('how_to_buy_steps').delete().in('id', idsToDelete)
    }
    
    // Upsert steps
    const recordsToUpdate = allPayloads.filter(p => p.id)
    const recordsToInsert = allPayloads.filter(p => !p.id).map(({ id, ...rest }) => rest)
    
    if (recordsToUpdate.length > 0) {
      for (const record of recordsToUpdate) {
        const { id, ...updateData } = record
        await supabase.from('how_to_buy_steps').update(updateData).eq('id', id)
      }
    }
    
    if (recordsToInsert.length > 0) {
      await supabase.from('how_to_buy_steps').insert(recordsToInsert)
    }
    
    showAlert('Successfully saved "How-to-buy" page!')
    await loadData()
  } catch (error) {
    console.error('Error saving:', error)
    showAlert('Save failed: ' + error.message, true)
  } finally {
    saving.value = false
  }
}

async function loadData() {
  try {
    // Load settings
    const { data: settingsData } = await supabase
      .from('how_to_buy_settings')
      .select('*')
      .limit(1)
      .single()
    
    if (settingsData) {
      settings.value = {
        video_url: settingsData.video_url || '',
        signup_url: settingsData.signup_url || ''
      }
    }
    
    // Load steps
    const { data: stepsData } = await supabase
      .from('how_to_buy_steps')
      .select('*')
      .order('display_order')
    
    if (stepsData) {
      const allSteps = stepsData
      const mainStepsData = allSteps.filter(s => !s.section_title)
      
      mainSteps.value = mainStepsData.map(mainStep => ({
        tempId: `main_${mainStep.id}`,
        id: mainStep.id,
        title: mainStep.title,
        subSteps: allSteps
          .filter(s => s.section_title === mainStep.title)
          .map(subStep => ({
            tempId: `sub_${subStep.id}`,
            id: subStep.id,
            title: subStep.title || '',
            description: subStep.description || '',
            image_url: subStep.image_url || '',
            previewUrl: '',
            imageFile: null
          }))
      }))
    }
    
    if (mainSteps.value.length === 0) {
      addMainStep()
    }
    
    await nextTick()
    initializeSortables()
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

function initializeSortables() {
  // Main steps sortable
  if (stepsContainer.value && mainStepsSortable) {
    mainStepsSortable.destroy()
  }
  
  if (stepsContainer.value) {
    mainStepsSortable = new Sortable(stepsContainer.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.main-step-drag-handle',
      onEnd: () => {
        const items = stepsContainer.value.querySelectorAll('.main-step-card')
        const newOrder = []
        items.forEach(item => {
          const id = item.dataset.id
          const step = mainSteps.value.find(s => s.tempId === id)
          if (step) newOrder.push(step)
        })
        mainSteps.value = newOrder
      }
    })
  }
  
  // Sub steps sortables
  mainSteps.value.forEach(mainStep => {
    initializeSubStepsSortable(mainStep.tempId)
  })
}

function initializeSubStepsSortable(mainStepTempId) {
  const container = subStepsContainerRefs.value[mainStepTempId]
  
  if (subStepsSortables[mainStepTempId]) {
    subStepsSortables[mainStepTempId].destroy()
  }
  
  if (container) {
    subStepsSortables[mainStepTempId] = new Sortable(container, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.sub-step-drag-handle',
      onEnd: () => {
        const mainStep = mainSteps.value.find(s => s.tempId === mainStepTempId)
        if (mainStep) {
          const items = container.querySelectorAll('.sub-step-row')
          const newOrder = []
          items.forEach(item => {
            const id = item.dataset.id
            const subStep = mainStep.subSteps.find(s => s.tempId === id)
            if (subStep) newOrder.push(subStep)
          })
          mainStep.subSteps = newOrder
        }
      }
    })
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
  loadData()
})

onBeforeUnmount(() => {
  if (mainStepsSortable) {
    mainStepsSortable.destroy()
  }
  Object.values(subStepsSortables).forEach(sortable => {
    if (sortable) sortable.destroy()
  })
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

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
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

.btn-danger {
  background-color: #EF4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #DC2626;
}

.sortable-ghost {
  background: #222222;
  opacity: 0.5;
}
</style>

