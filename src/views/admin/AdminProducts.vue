<template>
  <div class="space-y-8">
    <h2 class="text-2xl font-bold text-white">Product Management</h2>

    <!-- Add New Products Section -->
    <div class="panel p-6">
      <h3 class="font-semibold mb-4 text-lg text-white">Add New Product(s)</h3>
      
      <div class="space-y-4">
        <div
          v-for="(product, index) in newProducts"
          :key="product.tempId"
          class="add-form-row relative p-4 border border-gray-800 rounded-lg"
        >
          <button
            @click="removeProductFormRow(index)"
            class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X class="h-3 w-3" />
          </button>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              v-model="product.name"
              class="input"
              placeholder="Product Name"
            />
            <input
              type="number"
              step="0.01"
              v-model="product.price"
              class="input"
              placeholder="Price (CNY)"
            />
          </div>
          
          <div class="mt-4">
            <input
              v-model="product.target_url"
              class="input"
              placeholder="Target URL"
            />
          </div>
          
          <div class="mt-4">
            <label class="label mb-1 block">Product Image</label>
            <div
              @click="triggerNewProductImageUpload(product.tempId)"
              class="mt-1 relative p-4 rounded-lg bg-black text-center cursor-pointer text-gray-400 border-2 border-dashed border-gray-600 hover:border-white"
            >
              <p v-if="!product.imagePreview">Click to upload</p>
              <img
                v-if="product.imagePreview"
                :src="product.imagePreview"
                class="max-h-24 mx-auto rounded"
              />
              <p v-if="product.imageFile" class="text-xs text-green-400 mt-2">
                {{ product.imageFile.name }}
              </p>
            </div>
            <input
              :ref="el => setNewProductImageInput(product.tempId, el)"
              type="file"
              class="hidden"
              accept="image/*"
              @change="(e) => handleNewProductImageUpload(e, index)"
            />
          </div>
        </div>
      </div>
      
      <div class="mt-4 flex justify-between">
        <button @click="addProductFormRow" class="btn btn-secondary">
          <Plus class="mr-2 h-4 w-4" />
          Add Another
        </button>
        <button
          @click="submitAllNewProducts"
          :disabled="submitting"
          class="btn btn-primary"
        >
          <UploadCloud v-if="!submitting" class="mr-2 h-4 w-4" />
          <div v-else class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
          Submit All
        </button>
      </div>
    </div>

    <!-- Existing Products Section -->
    <div class="panel">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-lg text-white">Existing Products</h3>
          <div class="flex items-center gap-4">
            <button @click="triggerImport" class="btn btn-secondary btn-xs">
              <Upload class="mr-2 h-4 w-4" />
              Import
            </button>
            <button @click="exportProducts" class="btn btn-secondary btn-xs">
              <Download class="mr-2 h-4 w-4" />
              Export
            </button>
            <input
              ref="importFileInput"
              type="file"
              class="hidden"
              accept=".xlsx,.csv"
              @change="handleImportFile"
            />
            <button @click="downloadTemplate" class="btn btn-secondary btn-xs">
              <FileSpreadsheet class="mr-2 h-4 w-4" />
              Template
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <div class="w-64">
            <input
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              class="input"
              placeholder="Search by name..."
            />
          </div>
          <div class="w-48">
            <select v-model="filterBrand" @change="loadProducts(1)" class="input">
              <option value="">All Brands</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>
          <div class="w-48">
            <select v-model="filterCategory" @change="loadProducts(1)" class="input">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.link_text">
                {{ cat.link_text }}
              </option>
            </select>
          </div>
          <div class="w-48">
            <select v-model="filterTags" @change="loadProducts(1)" class="input">
              <option value="">All Tags</option>
              <option v-for="tag in tags" :key="tag.id" :value="tag.name">
                {{ tag.name }}
              </option>
            </select>
          </div>
          <button @click="clearFilters" class="btn btn-secondary btn-xs">
            <X class="mr-2 h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <div
        v-show="selectedProducts.length > 0"
        class="bg-gray-900 border-y border-gray-800 p-3 flex items-center justify-between"
      >
        <div>{{ selectedProducts.length }} products selected</div>
        <div class="flex items-center gap-2">
          <button @click="bulkToggleDiscount" class="btn btn-secondary btn-xs">
            Toggle Discount
          </button>
          <button @click="bulkDelete" class="btn btn-danger btn-xs">
            Delete Selected
          </button>
        </div>
      </div>

      <!-- Products Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-400 uppercase bg-black">
            <tr>
              <th class="p-4 w-8">
                <input
                  type="checkbox"
                  v-model="selectAll"
                  @change="handleSelectAll"
                  class="rounded border-gray-600 bg-gray-800"
                />
              </th>
              <th class="p-4 w-10">Sort</th>
              <th class="p-4" style="min-width: 300px;">Product</th>
              <th class="p-4" style="min-width: 150px;">Brand</th>
              <th class="p-4" style="min-width: 150px;">Category</th>
              <th class="p-4" style="min-width: 150px;">Tags</th>
              <th class="p-4 w-24">Price</th>
              <th class="p-4 w-28">URL</th>
              <th class="p-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody ref="productList">
            <tr
              v-for="product in products"
              :key="product.id"
              class="product-row border-b border-gray-800 hover:bg-gray-900"
              :data-id="product.id"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  :value="product.id"
                  v-model="selectedProducts"
                  class="rounded border-gray-600 bg-gray-800"
                />
              </td>
              <td class="p-4">
                <GripVertical class="cursor-move text-gray-500 h-5 w-5" />
              </td>
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="product.image_url || 'https://placehold.co/40x40/111111/AAAAAA?text=??'"
                    class="w-10 h-10 object-cover rounded"
                  />
                  <span class="font-semibold text-white">{{ product.name }}</span>
                </div>
              </td>
              <td class="p-4">
                <select
                  :value="product.brand_id"
                  @change="(e) => updateProductField(product.id, 'brand_id', e.target.value || null)"
                  class="input"
                >
                  <option value="">None</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
              </td>
              <td class="p-4">
                <div class="custom-dropdown">
                  <div
                    @click="toggleDropdown('category', product.id)"
                    class="dropdown-trigger"
                  >
                    {{ getSelectedCategories(product.category).join(', ') || 'Select Category' }}
                  </div>
                  <div
                    v-show="activeDropdown === `category-${product.id}`"
                    class="dropdown-menu"
                  >
                    <label
                      v-for="cat in categories"
                      :key="cat.id"
                      class="dropdown-item"
                    >
                      <input
                        type="checkbox"
                        :value="cat.link_text"
                        :checked="getSelectedCategories(product.category).includes(cat.link_text)"
                        @change="(e) => updateCategoryTags(product.id, 'category', cat.link_text, e.target.checked)"
                      />
                      <span>{{ cat.link_text }}</span>
                    </label>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="custom-dropdown">
                  <div
                    @click="toggleDropdown('tags', product.id)"
                    class="dropdown-trigger"
                  >
                    {{ getSelectedTags(product.tags).join(', ') || 'Select Tags' }}
                  </div>
                  <div
                    v-show="activeDropdown === `tags-${product.id}`"
                    class="dropdown-menu"
                  >
                    <label
                      v-for="tag in tags"
                      :key="tag.id"
                      class="dropdown-item"
                    >
                      <input
                        type="checkbox"
                        :value="tag.name"
                        :checked="getSelectedTags(product.tags).includes(tag.name)"
                        @change="(e) => updateCategoryTags(product.id, 'tags', tag.name, e.target.checked)"
                      />
                      <span>{{ tag.name }}</span>
                    </label>
                  </div>
                </div>
              </td>
              <td
                class="p-4 editable-cell cursor-pointer hover:bg-gray-800"
                @dblclick="startInlineEdit(product.id, 'price', product.price)"
              >
                ¥{{ product.price }}
              </td>
              <td
                class="p-4 editable-cell cursor-pointer hover:bg-gray-800"
                @dblclick="startInlineEdit(product.id, 'target_url', product.target_url)"
              >
                <div class="truncate max-w-[15ch]">{{ product.target_url || '—' }}</div>
              </td>
              <td class="p-4 text-right">
                <button
                  @click="openEditModal(product)"
                  class="p-2 hover:bg-gray-800 rounded-full inline-flex"
                >
                  <Edit2 class="h-4 w-4 text-gray-400" />
                </button>
                <button
                  @click="deleteProduct(product.id)"
                  class="p-2 hover:bg-red-900/50 rounded-full inline-flex"
                >
                  <Trash2 class="h-4 w-4 text-red-500" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="p-4 flex justify-between items-center border-t border-gray-800"
      >
        <span class="text-sm text-gray-400">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <div class="flex items-center gap-2">
          <button
            @click="loadProducts(currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn-secondary btn-xs"
          >
            Previous
          </button>
          
          <button
            v-if="paginationStart > 1"
            @click="loadProducts(1)"
            class="btn btn-secondary pagination-btn"
          >
            1
          </button>
          <span v-if="paginationStart > 2" class="px-2 text-gray-500">...</span>
          
          <button
            v-for="page in paginationRange"
            :key="page"
            @click="loadProducts(page)"
            :class="[
              'btn btn-secondary pagination-btn',
              { 'active': page === currentPage }
            ]"
          >
            {{ page }}
          </button>
          
          <span v-if="paginationEnd < totalPages - 1" class="px-2 text-gray-500">...</span>
          <button
            v-if="paginationEnd < totalPages"
            @click="loadProducts(totalPages)"
            class="btn btn-secondary pagination-btn"
          >
            {{ totalPages }}
          </button>
          
          <button
            @click="loadProducts(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="btn btn-secondary btn-xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div
      v-show="showEditModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeEditModal"
    >
      <div class="panel w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-bg-panel z-10">
          <h3 class="text-lg font-semibold text-white">Edit Product</h3>
          <button @click="closeEditModal" class="p-1 rounded-full hover:bg-gray-700">
            <X class="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Image Upload -->
          <div
            @click="triggerEditImageUpload"
            class="relative p-4 rounded-lg bg-black text-center cursor-pointer text-gray-500 border-2 border-dashed border-gray-600 hover:border-white"
          >
            <p v-if="!editProduct.imagePreview && !editProduct.image_url">
              Click, drag, or paste an image
            </p>
            <img
              v-if="editProduct.imagePreview || editProduct.image_url"
              :src="editProduct.imagePreview || editProduct.image_url"
              class="max-h-32 mx-auto rounded"
            />
            <button
              v-if="editProduct.imagePreview || editProduct.image_url"
              @click.stop="deleteEditImage"
              class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
          <input
            ref="editImageInput"
            type="file"
            class="hidden"
            accept="image/*"
            @change="handleEditImageUpload"
          />

          <!-- Product Name -->
          <div>
            <label class="label">Product Name</label>
            <input
              v-model="editProduct.name"
              type="text"
              class="input mt-1"
            />
          </div>

          <!-- Price and URL -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label">Original Price (CNY)</label>
              <input
                v-model="editProduct.price"
                type="number"
                step="0.01"
                class="input mt-1"
              />
            </div>
            <div>
              <label class="label">Target URL</label>
              <input
                v-model="editProduct.target_url"
                type="text"
                class="input mt-1"
                placeholder="https://store.com/product/..."
              />
            </div>
          </div>

          <!-- Brand -->
          <div>
            <label class="label">Brand</label>
            <select v-model="editProduct.brand_id" class="input mt-1">
              <option :value="null">-- No Brand --</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>

          <!-- Tags -->
          <div>
            <label class="label">Tags (e.g., Sales, Top Selling)</label>
            <div class="flex flex-wrap gap-2 mt-2">
              <label
                v-for="tag in tags"
                :key="tag.id"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="tag.name"
                  v-model="editProduct.selectedTags"
                  class="h-4 w-4 rounded border-gray-600 bg-gray-800"
                />
                <span class="text-sm text-white">{{ tag.name }}</span>
              </label>
            </div>
          </div>

          <!-- Discount Settings -->
          <div class="p-4 rounded-lg bg-black border border-gray-800">
            <p class="font-semibold mb-2 text-gray-300">Discount Settings</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div class="sm:col-span-1">
                <label class="label">Discount Factor (e.g., 0.7)</label>
                <input
                  v-model="editProduct.discount_factor"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  class="input mt-1"
                  @input="calculateDiscountPrice"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="label">Discount Expiry Date</label>
                <input
                  ref="discountExpiryInput"
                  type="text"
                  class="input mt-1"
                  placeholder="Select date and time"
                />
              </div>
            </div>
            <div class="flex justify-between items-center mt-2">
              <div class="flex items-center">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="editProduct.discount_is_active"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <label class="ml-2 text-sm text-white">Enable Discount</label>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-400">
                  Discount Price: <span class="font-bold text-white">{{ calculatedDiscountPrice }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-black/50 rounded-b-lg text-right border-t border-gray-800">
          <button
            @click="saveProductChanges"
            :disabled="savingEdit"
            class="btn btn-primary"
          >
            <span v-if="!savingEdit">Save Changes</span>
            <div v-else class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-show="loading"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]"
    >
      <div class="flex items-center">
        <div class="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        <p class="ml-4 text-lg font-semibold text-white">Processing...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { supabase } from '@/config/supabase'
import {
  Plus,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  UploadCloud,
  GripVertical,
  Edit2,
  Trash2
} from 'lucide-vue-next'
import Sortable from 'sortablejs'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.min.css'
import * as XLSX from 'xlsx'

// Refs
const newProducts = ref([])
const products = ref([])
const brands = ref([])
const categories = ref([])
const tags = ref([])
const selectedProducts = ref([])
const selectAll = ref(false)

const searchQuery = ref('')
const filterBrand = ref('')
const filterCategory = ref('')
const filterTags = ref('')

const currentPage = ref(1)
const pageSize = 50
const totalCount = ref(0)
const loading = ref(false)
const submitting = ref(false)

const showEditModal = ref(false)
const editProduct = ref({})
const savingEdit = ref(false)

const activeDropdown = ref(null)
const productList = ref(null)
const importFileInput = ref(null)
const editImageInput = ref(null)
const discountExpiryInput = ref(null)

const newProductImageInputRefs = ref({})

let sortableInstance = null
let flatpickrInstance = null
let searchTimeout = null

// Computed
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const paginationStart = computed(() => {
  const maxPagesToShow = 5
  const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2)
  
  if (totalPages.value <= maxPagesToShow) {
    return 1
  }
  
  if (currentPage.value <= maxPagesBeforeCurrent) {
    return 1
  }
  
  if (currentPage.value + Math.ceil(maxPagesToShow / 2) - 1 >= totalPages.value) {
    return totalPages.value - maxPagesToShow + 1
  }
  
  return currentPage.value - maxPagesBeforeCurrent
})

const paginationEnd = computed(() => {
  const maxPagesToShow = 5
  return Math.min(paginationStart.value + maxPagesToShow - 1, totalPages.value)
})

const paginationRange = computed(() => {
  const range = []
  for (let i = paginationStart.value; i <= paginationEnd.value; i++) {
    range.push(i)
  }
  return range
})

const calculatedDiscountPrice = computed(() => {
  if (editProduct.value.price && editProduct.value.discount_factor) {
    const price = parseFloat(editProduct.value.price)
    const factor = parseFloat(editProduct.value.discount_factor)
    if (!isNaN(price) && !isNaN(factor)) {
      return `¥${(price * factor).toFixed(2)}`
    }
  }
  return 'N/A'
})

// Methods
function setNewProductImageInput(id, el) {
  if (el) {
    newProductImageInputRefs.value[id] = el
  }
}

function addProductFormRow() {
  newProducts.value.push({
    tempId: `new_${Date.now()}`,
    name: '',
    price: null,
    target_url: '',
    imageFile: null,
    imagePreview: ''
  })
}

function removeProductFormRow(index) {
  newProducts.value.splice(index, 1)
}

function triggerNewProductImageUpload(tempId) {
  const input = newProductImageInputRefs.value[tempId]
  if (input) {
    input.click()
  }
}

function handleNewProductImageUpload(event, index) {
  const file = event.target.files?.[0]
  if (file) {
    newProducts.value[index].imageFile = file
    newProducts.value[index].imagePreview = URL.createObjectURL(file)
  }
}

async function uploadImage(file, bucket = 'product-images') {
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

async function submitAllNewProducts() {
  if (newProducts.value.length === 0) {
    showAlert('No products to add.')
    return
  }
  
  submitting.value = true
  loading.value = true
  
  try {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    let currentOrder = count || 0
    const productsToUpload = []
    
    for (const product of newProducts.value) {
      if (!product.name || !product.price || !product.target_url) {
        showAlert('Please fill in required fields (Name, Price, URL) for all products.', true)
        submitting.value = false
        loading.value = false
        return
      }
      
      const imageUrl = product.imageFile ? await uploadImage(product.imageFile) : null
      
      productsToUpload.push({
        name: product.name,
        price: parseFloat(product.price),
        target_url: product.target_url,
        image_url: imageUrl,
        display_order: currentOrder++
      })
    }
    
    const { error } = await supabase.from('products').insert(productsToUpload)
    
    if (error) {
      showAlert('Bulk add failed: ' + error.message, true)
    } else {
      showAlert(`Successfully added ${productsToUpload.length} new products!`)
      newProducts.value = []
      addProductFormRow()
      await loadProducts(1)
    }
  } catch (error) {
    console.error('Error submitting products:', error)
    showAlert('Failed to submit products', true)
  } finally {
    submitting.value = false
    loading.value = false
  }
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadProducts(1)
  }, 500)
}

function clearFilters() {
  searchQuery.value = ''
  filterBrand.value = ''
  filterCategory.value = ''
  filterTags.value = ''
  loadProducts(1)
}

async function loadProducts(page = 1) {
  currentPage.value = page
  loading.value = true
  
  try {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    let query = supabase
      .from('products')
      .select('*, brands(name)', { count: 'exact' })
      .eq('is_active', true)
    
    if (searchQuery.value) {
      query = query.ilike('name', `%${searchQuery.value}%`)
    }
    
    if (filterBrand.value) {
      query = query.eq('brand_id', filterBrand.value)
    }
    
    if (filterCategory.value) {
      query = query.ilike('category', `%${filterCategory.value}%`)
    }
    
    if (filterTags.value) {
      query = query.ilike('tags', `%${filterTags.value}%`)
    }
    
    const { data, error, count } = await query
      .order('display_order')
      .range(from, to)
    
    if (error) {
      console.error('Error loading products:', error)
      showAlert('Failed to load products', true)
      return
    }
    
    products.value = data || []
    totalCount.value = count || 0
    selectedProducts.value = []
    selectAll.value = false
    
    await nextTick()
    initializeSortable()
  } catch (error) {
    console.error('Error in loadProducts:', error)
  } finally {
    loading.value = false
  }
}

function initializeSortable() {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
  
  if (productList.value) {
    sortableInstance = new Sortable(productList.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.cursor-move',
      onEnd: saveProductOrder
    })
  }
}

async function saveProductOrder(evt) {
  loading.value = true
  
  try {
    const reorderedIds = Array.from(evt.to.children).map(item => parseInt(item.dataset.id))
    const baseOrder = (currentPage.value - 1) * pageSize
    
    const updates = reorderedIds.map((id, index) => 
      supabase.from('products').update({ display_order: baseOrder + index }).eq('id', id)
    )
    
    await Promise.all(updates)
    showAlert('Order saved!')
  } catch (error) {
    console.error('Error saving order:', error)
    showAlert('Reorder failed: ' + error.message, true)
    await loadProducts(currentPage.value)
  } finally {
    loading.value = false
  }
}

function handleSelectAll() {
  if (selectAll.value) {
    selectedProducts.value = products.value.map(p => p.id)
  } else {
    selectedProducts.value = []
  }
}

function toggleDropdown(type, productId) {
  const key = `${type}-${productId}`
  activeDropdown.value = activeDropdown.value === key ? null : key
}

function getSelectedCategories(categoryString) {
  if (!categoryString) return []
  return categoryString.split(',').map(c => c.trim()).filter(Boolean)
}

function getSelectedTags(tagsString) {
  if (!tagsString) return []
  return tagsString.split(',').map(t => t.trim()).filter(Boolean)
}

async function updateCategoryTags(productId, field, value, checked) {
  const product = products.value.find(p => p.id === productId)
  if (!product) return
  
  let currentValues = field === 'category' 
    ? getSelectedCategories(product.category)
    : getSelectedTags(product.tags)
  
  if (checked) {
    if (!currentValues.includes(value)) {
      currentValues.push(value)
    }
  } else {
    currentValues = currentValues.filter(v => v !== value)
  }
  
  const newValue = currentValues.join(',')
  await updateProductField(productId, field, newValue)
  
  // Update local state
  product[field] = newValue
}

async function updateProductField(productId, field, value) {
  try {
    const { error } = await supabase
      .from('products')
      .update({ [field]: value })
      .eq('id', productId)
    
    if (error) {
      showAlert('Update failed: ' + error.message, true)
    }
  } catch (error) {
    console.error('Error updating field:', error)
  }
}

function startInlineEdit(productId, field, currentValue) {
  const cell = event.target
  const originalValue = currentValue || ''
  
  cell.innerHTML = `<input type="text" class="input w-full" value="${originalValue}" />`
  const input = cell.querySelector('input')
  input.focus()
  input.select()
  
  const saveChanges = async () => {
    const newValue = input.value
    
    // Restore cell
    if (field === 'price') {
      cell.textContent = `¥${originalValue}`
    } else {
      cell.innerHTML = `<div class="truncate max-w-[15ch]">${originalValue || '—'}</div>`
    }
    
    if (newValue !== originalValue.toString()) {
      await updateProductField(productId, field, newValue)
      
      // Update local state
      const product = products.value.find(p => p.id === productId)
      if (product) {
        product[field] = newValue
      }
      
      // Update cell display
      if (field === 'price') {
        cell.textContent = `¥${newValue}`
      } else {
        cell.innerHTML = `<div class="truncate max-w-[15ch]">${newValue || '—'}</div>`
      }
    }
  }
  
  input.addEventListener('blur', saveChanges)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur()
    } else if (e.key === 'Escape') {
      if (field === 'price') {
        cell.textContent = `¥${originalValue}`
      } else {
        cell.innerHTML = `<div class="truncate max-w-[15ch]">${originalValue || '—'}</div>`
      }
    }
  })
}

function openEditModal(product) {
  editProduct.value = {
    id: product.id,
    name: product.name,
    price: product.price,
    target_url: product.target_url,
    brand_id: product.brand_id,
    image_url: product.image_url,
    discount_factor: product.discount_factor,
    discount_is_active: product.discount_is_active,
    discount_expires_at: product.discount_expires_at,
    selectedTags: product.tags ? product.tags.split(',').map(t => t.trim()) : [],
    imageFile: null,
    imagePreview: ''
  }
  
  showEditModal.value = true
  
  nextTick(() => {
    if (discountExpiryInput.value) {
      if (flatpickrInstance) {
        flatpickrInstance.destroy()
      }
      
      flatpickrInstance = flatpickr(discountExpiryInput.value, {
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        defaultDate: editProduct.value.discount_expires_at 
          ? new Date(editProduct.value.discount_expires_at)
          : null
      })
    }
  })
}

function closeEditModal() {
  showEditModal.value = false
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
}

function triggerEditImageUpload() {
  editImageInput.value?.click()
}

function handleEditImageUpload(event) {
  const file = event.target.files?.[0]
  if (file) {
    editProduct.value.imageFile = file
    editProduct.value.imagePreview = URL.createObjectURL(file)
  }
}

function deleteEditImage() {
  editProduct.value.imageFile = null
  editProduct.value.imagePreview = ''
  editProduct.value.image_url = ''
}

function calculateDiscountPrice() {
  // This is reactive through computed property
}

async function saveProductChanges() {
  savingEdit.value = true
  loading.value = true
  
  try {
    let uploadedImageUrl = editProduct.value.image_url
    
    if (editProduct.value.imageFile) {
      uploadedImageUrl = await uploadImage(editProduct.value.imageFile)
    }
    
    const updates = {
      id: editProduct.value.id,
      name: editProduct.value.name,
      price: parseFloat(editProduct.value.price),
      target_url: editProduct.value.target_url,
      brand_id: editProduct.value.brand_id || null,
      tags: editProduct.value.selectedTags.join(','),
      discount_factor: editProduct.value.discount_factor || null,
      discount_is_active: editProduct.value.discount_is_active,
      discount_expires_at: flatpickrInstance?.selectedDates[0]?.toISOString() || null,
      image_url: uploadedImageUrl
    }
    
    if (updates.discount_factor) {
      updates.discount_price = (updates.price * updates.discount_factor).toFixed(2)
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', updates.id)
      .select('*, brands(name)')
      .single()
    
    if (error) {
      showAlert('Save failed: ' + error.message, true)
    } else {
      showAlert('Product updated!')
      
      // Update local state
      const index = products.value.findIndex(p => p.id === updates.id)
      if (index !== -1) {
        products.value[index] = data
      }
      
      closeEditModal()
    }
  } catch (error) {
    console.error('Error saving product:', error)
    showAlert('Save failed', true)
  } finally {
    savingEdit.value = false
    loading.value = false
  }
}

async function deleteProduct(productId) {
  const product = products.value.find(p => p.id === productId)
  const productName = product ? product.name : 'this product'
  
  if (!confirm(`Are you sure you want to remove "${productName}"?`)) {
    return
  }
  
  loading.value = true
  
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)
    
    if (error) {
      showAlert('Delete failed: ' + error.message, true)
    } else {
      showAlert('Product removed.')
      await loadProducts(currentPage.value)
    }
  } catch (error) {
    console.error('Error deleting product:', error)
  } finally {
    loading.value = false
  }
}

async function bulkToggleDiscount() {
  if (selectedProducts.value.length === 0) {
    showAlert('Please select products to operate.', true)
    return
  }
  
  const productsToUpdate = products.value.filter(p => selectedProducts.value.includes(p.id))
  const turnOn = productsToUpdate.some(p => !p.discount_is_active)
  
  if (!confirm(`Are you sure you want to set the discount status to "${turnOn ? 'ON' : 'OFF'}" for ${selectedProducts.value.length} products?`)) {
    return
  }
  
  loading.value = true
  
  try {
    const updates = selectedProducts.value.map(id =>
      supabase.from('products').update({ discount_is_active: turnOn }).eq('id', id)
    )
    
    await Promise.all(updates)
    showAlert('Discount status updated!')
    await loadProducts(currentPage.value)
  } catch (error) {
    console.error('Error updating discount:', error)
    showAlert('Bulk update failed', true)
  } finally {
    loading.value = false
  }
}

async function bulkDelete() {
  if (selectedProducts.value.length === 0) {
    showAlert('Please select products to delete.', true)
    return
  }
  
  if (!confirm(`Are you sure you want to remove ${selectedProducts.value.length} selected products?`)) {
    return
  }
  
  loading.value = true
  
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .in('id', selectedProducts.value)
    
    if (error) {
      showAlert('Delete failed: ' + error.message, true)
    } else {
      showAlert(`Successfully removed ${selectedProducts.value.length} products.`)
      await loadProducts(currentPage.value)
    }
  } catch (error) {
    console.error('Error bulk deleting:', error)
  } finally {
    loading.value = false
  }
}

function triggerImport() {
  importFileInput.value?.click()
}

async function handleImportFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  
  loading.value = true
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const productsToImport = XLSX.utils.sheet_to_json(firstSheet)
      
      const productsToUpsert = []
      
      for (const product of productsToImport) {
        let brand_id = null
        
        if (product.brand_name) {
          const brand = brands.value.find(b => 
            b.name.toLowerCase() === product.brand_name.toLowerCase()
          )
          
          if (brand) {
            brand_id = brand.id
          } else {
            showAlert(`Brand "${product.brand_name}" not found. Please add it first.`, true)
          }
        }
        
        productsToUpsert.push({
          id: product.id,
          name: product.name,
          price: product.price,
          target_url: product.target_url,
          image_url: product.image_url,
          brand_id: brand_id,
          category: product.category,
          tags: product.tags,
          discount_factor: product.discount_factor,
          discount_is_active: product.discount_is_active,
          discount_expires_at: product.discount_expires_at 
            ? new Date(product.discount_expires_at).toISOString()
            : null
        })
      }
      
      if (productsToUpsert.length > 0) {
        const { error } = await supabase
          .from('products')
          .upsert(productsToUpsert, { onConflict: 'id' })
        
        if (error) throw error
        
        showAlert(`${productsToUpsert.length} products imported/updated successfully!`)
        await loadProducts(1)
      }
    } catch (error) {
      console.error('Import error:', error)
      showAlert('Import failed: ' + error.message, true)
    } finally {
      loading.value = false
      event.target.value = ''
    }
  }
  
  reader.readAsArrayBuffer(file)
}

function exportProducts() {
  try {
    const dataToExport = products.value.map(p => ({
      id: p.id,
      name: p.name,
      brand_name: p.brands?.name || '',
      category: p.category,
      tags: p.tags,
      price: p.price,
      target_url: p.target_url,
      discount_factor: p.discount_factor,
      discount_is_active: p.discount_is_active,
      discount_expires_at: p.discount_expires_at
    }))
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
    XLSX.writeFile(workbook, `products_export_${new Date().toISOString().slice(0, 10)}.xlsx`)
    
    showAlert('Products exported!')
  } catch (error) {
    console.error('Export error:', error)
    showAlert('Export failed', true)
  }
}

function downloadTemplate() {
  const templateData = [{
    name: 'Example Product',
    price: 199.99,
    target_url: 'https://example.com/product/123',
    image_url: 'https://example.com/image.jpg',
    brand_name: 'Example Brand',
    category: 'T-Shirts,Summer',
    tags: 'Best Selling',
    discount_factor: 0.8,
    discount_is_active: true,
    discount_expires_at: '2025-12-31T23:59:59'
  }]
  
  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Template')
  XLSX.writeFile(workbook, 'product_import_template.xlsx')
}

async function loadInitialData() {
  loading.value = true
  
  try {
    const [brandsRes, categoriesRes, tagsRes] = await Promise.all([
      supabase.from('brands').select('*').order('name'),
      supabase.from('navigation').select('*').order('display_order'),
      supabase.from('product_tags').select('*').order('display_order')
    ])
    
    brands.value = brandsRes.data || []
    categories.value = (categoriesRes.data || []).filter(c => c.link_text.toLowerCase() !== 'home')
    tags.value = tagsRes.data || []
    
    addProductFormRow()
    await loadProducts(1)
  } catch (error) {
    console.error('Error loading initial data:', error)
  } finally {
    loading.value = false
  }
}

function showAlert(message, isError = false) {
  const alertBox = document.createElement('div')
  alertBox.className = `fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-green-600'} z-[101]`
  alertBox.textContent = message
  document.body.appendChild(alertBox)
  setTimeout(() => alertBox.remove(), 3000)
}

// Click outside to close dropdowns
function handleClickOutside(event) {
  if (!event.target.closest('.custom-dropdown')) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  loadInitialData()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  document.removeEventListener('click', handleClickOutside)
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

.btn-secondary:hover:not(:disabled) {
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

.pagination-btn {
  padding: 0.25rem 0.75rem;
}

.pagination-btn.active {
  background-color: #FFFFFF;
  color: #000000;
  border-color: #FFFFFF;
}

.custom-dropdown {
  position: relative;
}

.dropdown-trigger {
  width: 100%;
  border: 1px solid #222222;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #222222;
  color: #FFFFFF;
  cursor: pointer;
}

.dropdown-trigger:hover {
  border-color: #444444;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 16rem;
  background-color: #111111;
  border: 1px solid #222222;
  border-radius: 0.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  z-index: 50;
  margin-top: 4px;
  max-height: 12rem;
  overflow-y: auto;
}

.dropdown-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #AAAAAA;
}

.dropdown-item:hover {
  background-color: #222222;
  color: #FFFFFF;
}

.dropdown-item input[type="checkbox"] {
  margin-right: 0.5rem;
  border-radius: 0.25rem;
  border-color: #444444;
  background-color: #222222;
}

.sortable-ghost {
  background: #222222;
  opacity: 0.5;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #333333;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #FFFFFF;
}

input:checked + .toggle-slider:before {
  background-color: #000000;
  transform: translateX(16px);
}
</style>

