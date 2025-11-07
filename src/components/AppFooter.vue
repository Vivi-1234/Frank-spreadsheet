<template>
  <footer class="mt-20 md:mt-28 border-t border-gray-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <p class="font-bold text-lg">Franks AUTHENTIC Spreadsheet</p>
        <p class="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Stayfocusedfrank.net does not sell any physical products and neither does Mulebuy.
        </p>
        
        <!-- Mobile Social Links -->
        <div v-if="socialLinks.length" class="flex md:hidden justify-center items-center space-x-4 mt-6">
          <a
            v-for="social in socialLinks"
            :key="social.id"
            :href="social.link_url"
            target="_blank"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <div class="w-8 h-8">
              <img
                :src="social.icon_url"
                :alt="social.platform_name"
                class="w-full h-full object-cover rounded-full"
              />
            </div>
          </a>
        </div>
      </div>
      <div class="mt-10 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        <p>&copy; 2025 Franks AUTHENTIC Spreadsheet. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { getCachedData, setCachedData } from '@/utils/cache'

const socialLinks = ref([])

onMounted(async () => {
  const cachedSocial = getCachedData('frank_social')
  if (cachedSocial) {
    socialLinks.value = cachedSocial
  } else {
    const { data } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order')
    if (data) {
      socialLinks.value = data
      setCachedData('frank_social', data)
    }
  }
})
</script>

