<script setup lang="ts">
const links = [
  { label: 'Email', to: '#' },
  { label: 'Instagram', to: '#' }
]
const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' }
  // { label: 'Terms of Service', to: '#' }
]
</script>

<template>
  <UFooter
    :ui="{
      root: 'border-t border-default lg:py-2',
      right: 'gap-x-0 flex-wrap'
    }"
  >
    <template #left>
      <UButton v-for="link in legalLinks" :key="link.label" :label="link.label" :to="link.to" color="neutral" variant="link" class="font-light" size="md" />
    </template>

    <template #right>
      <div class="flex flex-col gap-2">
        <div>
          <UButton v-for="link in links" :key="link.label" :label="link.label" :to="link.to" color="neutral" variant="link" class="font-light" size="md" />
        </div>
      </div>
    </template>

    <template #bottom>
      <p class="text-xs text-dimmed text-center px-4">© {{ new Date().getFullYear() }} Inspector's Toolkit</p>
    </template>
  </UFooter>
</template>
