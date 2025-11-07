<template>
  <div class="min-h-screen">
    <AppHeader />

    <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 pt-24">
      <!-- Hero Section -->
      <section class="text-center pt-0 pb-12 md:pb-16">
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight">How to buy</h1>
        <p class="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-400">
          Follow these simple steps to get the best products sourced and shipped directly to you.
        </p>

        <!-- Discount Code -->
        <div class="mt-8">
          <div
            @click="copyDiscountCode"
            class="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span class="text-sm text-gray-300">
              15% OFF Shipping Code: <span class="font-bold text-white">Frank</span>
            </span>
          </div>
        </div>

        <!-- Buttons -->
        <div v-if="settings.signup_url" class="mt-8 flex items-center justify-center gap-4">
          <a
            :href="settings.signup_url"
            target="_blank"
            class="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Sign Up Here
          </a>
          <a
            href="#steps"
            class="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/5 transition-all"
          >
            View Steps
          </a>
        </div>
      </section>

      <!-- Video Section -->
      <section v-if="settings.video_url" class="my-12 md:my-16">
        <div class="max-w-4xl mx-auto">
          <div class="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
            <iframe
              :src="settings.video_url"
              class="w-full h-full"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </section>

      <!-- Steps Section -->
      <div id="steps" class="space-y-16 md:space-y-24">
        <div
          v-for="(mainStep, index) in mainSteps"
          :key="mainStep.id"
          class="max-w-4xl mx-auto"
        >
          <!-- Main Step Title -->
          <div class="flex items-center gap-4 md:gap-6 mb-8">
            <div class="flex items-center justify-center w-12 h-12 rounded-full border-2 border-white/20 bg-white/5 font-bold flex-shrink-0">
              {{ index + 1 }}
            </div>
            <h2 class="text-3xl md:text-4xl font-bold tracking-tight">{{ mainStep.title }}</h2>
          </div>

          <!-- Sub Steps -->
          <div
            v-if="getSubSteps(mainStep.title).length"
            class="space-y-8 pl-4 md:pl-8 border-l-2 border-gray-800 ml-6"
          >
            <div
              v-for="subStep in getSubSteps(mainStep.title)"
              :key="subStep.id"
              :class="[
                'grid gap-8 lg:gap-12 items-center',
                subStep.image_url ? 'lg:grid-cols-2' : 'grid-cols-1'
              ]"
            >
              <div>
                <h4 class="text-xl font-bold text-white mb-2">{{ subStep.title }}</h4>
                <p class="text-gray-400">{{ subStep.description }}</p>
              </div>
              <div v-if="subStep.image_url" class="flex items-center justify-center">
                <img
                  :src="subStep.image_url"
                  :alt="subStep.title"
                  class="rounded-lg shadow-lg w-full h-auto object-cover border border-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />

    <!-- Social Sidebar -->
    <div class="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center space-y-4">
      <a
        v-for="social in socialLinks"
        :key="social.id"
        :href="social.link_url"
        target="_blank"
        class="block w-12 h-12 transition-transform hover:scale-110"
      >
        <img
          :src="social.icon_url"
          :alt="social.platform_name"
          class="w-full h-full rounded-full object-cover shadow-lg"
        />
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/config/supabase'
import { getCachedData, setCachedData } from '@/utils/cache'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const settings = ref({})
const allSteps = ref([])
const socialLinks = ref([])

const mainSteps = computed(() => {
  return allSteps.value.filter(step => !step.section_title)
})

function getSubSteps(mainTitle) {
  return allSteps.value.filter(step => step.section_title === mainTitle)
}

function copyDiscountCode() {
  navigator.clipboard.writeText('Frank').then(() => {
    alert('Discount code copied!')
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}

onMounted(async () => {
  // Load settings and steps
  const cachedSettings = getCachedData('frank_htb_settings')
  const cachedSteps = getCachedData('frank_htb_steps')

  if (cachedSettings && cachedSteps) {
    settings.value = cachedSettings
    allSteps.value = cachedSteps
  } else {
    const [settingsRes, stepsRes] = await Promise.all([
      supabase.from('how_to_buy_settings').select('*').limit(1).single(),
      supabase.from('how_to_buy_steps').select('*').order('display_order')
    ])

    if (settingsRes.data) {
      settings.value = settingsRes.data
      setCachedData('frank_htb_settings', settingsRes.data)
    }

    if (stepsRes.data) {
      allSteps.value = stepsRes.data
      setCachedData('frank_htb_steps', stepsRes.data)
    }
  }

  // Load social links
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

