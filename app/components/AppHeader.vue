<script setup lang="ts">
import { motion } from 'motion-v'
import type { VariantType } from 'motion-v'

// load header content so we can show hero links in a store picker modal
const { data: headerPage } = await useAsyncData('header-page', () => queryCollection('content').first())
const storeOpen = ref(false)
const storeLinks = computed(() => headerPage.value?.hero?.links || [])

const nuxtApp = useNuxtApp()
const activeSection = ref<string>()

const items = computed(() => [
  {
    label: 'Contact',
    to: '/contact'
  }
])

nuxtApp.hooks.hookOnce('page:loading:end', () => {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((e) => e.isIntersecting)
      if (visible) {
        activeSection.value = visible.target.id
      } else if (entries.every((e) => !e.isIntersecting)) {
        activeSection.value = undefined
      }
    },
    { rootMargin: '-50% 0px -50% 0px' }
  )

  document.querySelectorAll('#features, #insights').forEach((el) => observer.observe(el))
})

const variants: Record<string, VariantType | ((custom: unknown) => VariantType)> = {
  normal: {
    rotate: 0,
    y: 0,
    opacity: 1
  },
  close: (custom: unknown) => {
    const c = custom as number
    return {
      rotate: c === 1 ? 45 : c === 3 ? -45 : 0,
      y: c === 1 ? 6 : c === 3 ? -6 : 0,
      opacity: c === 2 ? 0 : 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    }
  }
}
</script>

<template>
  <UHeader mode="drawer" :menu="{ direction: 'top' }">
    <template #title>
      <!-- explicit home link: navigates to / and lets the index page load the canonical index content -->
      <NuxtLink to="/" class="text-lg font-semibold no-underline"> Inspector's Toolkit </NuxtLink>
    </template>
    <!-- <UNavigationMenu :items="items" variant="link" /> -->

    <template #right>
      <UButton to="/contact" label="Contact" variant="outline" class="hidden lg:flex" />
      <UButton @click="storeOpen = true" label="Download App" color="primary" class="hidden lg:flex" />
    </template>

    <template #toggle="{ open, toggle, ui }">
      <UButton
        size="sm"
        variant="ghost"
        color="neutral"
        square
        :aria-label="open ? 'Close navigation' : 'Open navigation'"
        :aria-expanded="open"
        :class="ui.toggle({ toggleSide: 'right' })"
        @click="toggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <motion.line x1="4" y1="6" x2="20" y2="6" :variants="variants" :animate="open ? 'close' : 'normal'" :custom="1" class="outline-none" />
          <motion.line x1="4" y1="12" x2="20" y2="12" :variants="variants" :animate="open ? 'close' : 'normal'" :custom="2" class="outline-none" />
          <motion.line x1="4" y1="18" x2="20" y2="18" :variants="variants" :animate="open ? 'close' : 'normal'" :custom="3" class="outline-none" />
        </svg>
      </UButton>
    </template>

    <template #body>
      <!-- <UNavigationMenu
        :items="items"
        orientation="vertical"
        :highlight="true"
        :ui="{
          linkLabel: 'text-lg',
          link: 'px-0'
        }"
      /> -->

      <div class="mt-4 flex flex-col gap-2">
        <UButton to="/contact" class="mb-8" variant="link" color="neutral" label="Contact Us" block />
        <UButton variant="outline" label="Download from Google Play Store" icon="mage:playstore" block />
        <UButton variant="solid" label="Download from App Store" icon="ic:baseline-apple" block />
      </div>
    </template>

    <UModal v-model:open="storeOpen" :title="'Get the app'">
      <template #content>
        <div class="grid gap-3 p-8">
          <UButton v-for="link in storeLinks" :key="link.label" v-bind="link" />
        </div>
      </template>
    </UModal>
  </UHeader>
</template>
