<template>
  <a
    :href="productUrl"
    target="_blank"
    @click="handleClick"
    class="product-card group block relative bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
  >
    <!-- Product Image -->
    <div class="aspect-square overflow-hidden">
      <img
        :src="optimizedImageUrl"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
        @error="handleImageError"
      />
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <h3 class="font-semibold text-gray-100 group-hover:text-white transition-colors line-clamp-2 mb-2">
        {{ product.name }}
      </h3>
      
      <!-- Price Display -->
      <p v-if="showDiscount" class="font-bold text-lg text-red-400">
        ${{ usdDiscountPrice }}
        <span class="text-base text-gray-500 font-normal line-through ml-2">
          ${{ usdPrice }}
        </span>
      </p>
      <p v-else class="font-bold text-lg text-gray-100">
        ${{ usdPrice }}
      </p>
    </div>

    <!-- Discount Badge -->
    <div
      v-if="showDiscount && discountPercentage > 0"
      class="badge discount-badge absolute top-3 right-3 bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
    >
      {{ discountPercentage }}% OFF
    </div>

    <!-- Tag Badge -->
    <div
      v-if="tagBadgeText"
      :class="['badge tag-badge absolute top-3 left-3 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-white/20', tagBadgeColor]"
    >
      {{ tagBadgeText }}
    </div>
  </a>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  exchangeRate: {
    type: Number,
    default: 0.14
  }
})

const emit = defineEmits(['click'])

// Check if discount should be shown
const showDiscount = computed(() => {
  if (!props.product.discount_is_active || !props.product.discount_price) {
    return false
  }
  
  if (props.product.discount_expires_at) {
    const now = new Date()
    const expiry = new Date(props.product.discount_expires_at)
    return expiry > now
  }
  
  return true
})

// Calculate USD prices
const usdPrice = computed(() => {
  return (props.product.price * props.exchangeRate).toFixed(2)
})

const usdDiscountPrice = computed(() => {
  if (!props.product.discount_price) return null
  return (props.product.discount_price * props.exchangeRate).toFixed(2)
})

// Calculate discount percentage
const discountPercentage = computed(() => {
  if (!props.product.discount_factor) return 0
  return Math.round((1 - props.product.discount_factor) * 100)
})

// Get first tag for badge
const tagBadgeText = computed(() => {
  if (!props.product.tags) return ''
  const firstTag = props.product.tags.split(',')[0].trim()
  return firstTag
})

// Get tag badge color based on tag type
const tagBadgeColor = computed(() => {
  const tag = tagBadgeText.value.toLowerCase()
  if (tag === 'bestselling' || tag === 'best selling') {
    return 'bg-red-500/80'
  }
  return 'bg-amber-500/70'
})

// Get image URL with optimization
const optimizedImageUrl = computed(() => {
  const placeholder = 'https://placehold.co/400x400/1a1a1a/9CA3AF?text=NO+IMAGE'
  
  if (!props.product.image_url) return placeholder
  
  const url = props.product.image_url
  
  // For Supabase storage URLs, add resize parameters
  if (url.includes('supabase.co/storage')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}width=400&height=400&resize=cover&quality=75`
  }
  
  // For Aliyun CDN (alicdn.com), keep original URL
  // Aliyun images are usually already optimized on their CDN
  if (url.includes('alicdn.com')) {
    return url
  }
  
  // For imgbb.com images, use their CDN resize
  if (url.includes('imgbb.com') || url.includes('ibb.co')) {
    // imgbb supports width parameter
    return url.replace(/(\.[^.]+)$/, '_w400$1')
  }
  
  // For other external URLs, return as-is
  // (They might already be optimized or not support transformation)
  return url
})

// Get product URL without modification
const productUrl = computed(() => {
  if (!props.product.target_url) return '#'
  return props.product.target_url
})

// Handle image loading error
function handleImageError(event) {
  console.error('Image failed to load:', {
    original_src: props.product.image_url,
    product_name: props.product.name,
    error_event: event
  })
  event.target.src = 'https://placehold.co/400x400/1a1a1a/9CA3AF?text=NO+IMAGE'
}

// Handle click event
function handleClick() {
  emit('click')
}
</script>

<style scoped>
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

