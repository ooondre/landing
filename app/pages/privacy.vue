<script setup lang="ts">
import { Comark } from '@comark/vue'

const route = useRoute()

console.log(route.path)

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})
if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Privacy page not found' })

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({ title, description })

function enterMotion(delay: number = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay }
  }
}

function scrollMotion(delay: number = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    inViewOptions: { once: true, amount: 1 },
    transition: { duration: 0.6, delay }
  }
}
</script>

<template>
  <div v-if="page">
    <UPageHero
      :ui="{
        container: 'relative z-10 py-4 pt-16 sm:py-4 sm:pt-16 md:py-4 md:pt-16 lg:py-4 lg:pt-16',
        wrapper: 'flex flex-col items-start text-start',
        title: 'sm:text-5xl lg:text-5xl tracking-tight',
        description: 'mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-default'
      }"
    >
      <template #title>
        <Motion v-bind="enterMotion()" as="h1" class="font-bold">{{ page.title }}</Motion>
      </template>
    </UPageHero>

    <Motion v-bind="enterMotion()" as="div">
      <UPageSection :ui="{ container: 'py-0 sm:py-0 lg:py-0' }">
        <Comark class="prose prose-invert max-w-5xl mt-6">{{ page.body }}</Comark>
      </UPageSection>
    </Motion>
  </div>
</template>
