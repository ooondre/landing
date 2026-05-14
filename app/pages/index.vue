<script setup lang="ts">
const route = useRoute()
const { width, height } = useWindowSize()

// Load the page content, trying several fallbacks to ensure the canonical index is shown.
const { data: page } = await useAsyncData(
  () => `index:${route.path}`,
  async () => {
    // 1) try exact path
    let p = await queryCollection('content').where('path', '=', route.path).first()
    if (p) return p

    // 2) try root path
    p = await queryCollection('content').where('path', '=', '/').first()
    if (p) return p

    // 3) try document with id 'index'
    try {
      // use explicit where signature to satisfy TypeScript overloads
      p = await queryCollection('content').where('_id', '=', 'index').first()
      if (p) return p
    } catch (e) {}

    // 4) fallback to first document
    return await queryCollection('content').first()
  }
)
console.log('route.path', route.path, 'page', page.value)
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const heroTitle = computed(() => {
  const [primary = '', ...secondaryParts] = (page.value?.title ?? '').split('\n')

  return {
    primary,
    secondary: secondaryParts.join(' ').trim()
  }
})

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

function staggerMotion(index: number = 0) {
  return {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    inViewOptions: { once: true, amount: 1 },
    transition: { duration: 0.6, delay: index * 0.08 }
  }
}
</script>

<template>
  <div v-if="page">
    <!-- Hero -->
    <UPageHero
      :ui="{
        root: 'pb-8',
        container: 'relative z-10 lg:py-32',
        wrapper: 'flex flex-col items-start text-start',
        title: 'sm:text-6xl lg:text-7xl xl:text-[80px] tracking-tighter leading-[1.05]',
        description: 'mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-default',
        links: 'gap-3'
      }"
    >
      <template #top>
        <Motion v-bind="staggerMotion(0)">
          <HeroShaders class="absolute top-0 inset-x-0 opacity-20 dark:opacity-5 h-full -z-10" />
        </Motion>

        <GradientGlow class="top-0 w-2/3 h-1/2" />
      </template>

      <template #title>
        <Motion as="span" v-bind="enterMotion(0.35)" class="inline-block">
          {{ heroTitle.primary }}
          <br v-if="heroTitle.secondary" />
          <span
            v-if="heroTitle.secondary"
            class="animate-shimmer bg-size-[200%_auto] bg-clip-text text-transparent pr-2"
            :style="{
              backgroundImage:
                'linear-gradient(135deg, var(--color-sky-800), var(--color-sky-700), var(--color-sky-600), var(--color-sky-500), var(--color-sky-600), var(--color-sky-700), var(--color-sky-800))',
              animationDuration: '10s'
            }"
          >
            {{ heroTitle.secondary }}
          </span>
        </Motion>
      </template>

      <template #description>
        <Motion as="span" v-bind="enterMotion(0.5)" class="inline-block">
          {{ page.description }}
        </Motion>
      </template>

      <template #links>
        <Motion class="flex flex-wrap justify-start gap-6" v-bind="enterMotion(0.65)">
          <UButton v-for="link in page.hero.links" :key="link.label" v-bind="link" />
        </Motion>
      </template>
    </UPageHero>

    <Motion v-bind="enterMotion(0.65)">
      <template v-if="width > 1440">
        <NuxtImg src="/img/mockup-xl.png" class="w-full object-cover" />
      </template>
      <template v-else-if="width > 1024">
        <NuxtImg src="/img/mockup-lg.png" class="w-full object-cover" />
      </template>
      <template v-else-if="width > 500">
        <NuxtImg src="/img/mockup-md.png" class="w-full object-cover" />
      </template>
      <template v-else>
        <NuxtImg src="/img/mockup-sm.png" class="w-full object-cover" />
      </template>
    </Motion>

    <!-- Features -->
    <UPageSection
      id="features"
      :ui="{
        root: 'py-24 sm:py-32 scroll-mt-(--ui-header-height)',
        container: 'max-w-5xl',
        headline: 'font-mono font-medium text-xs text-primary uppercase tracking-[0.12em] text-center',
        title: 'max-w-lg mx-auto',
        description: 'max-w-md mx-auto text-dimmed'
      }"
    >
      <template #headline>
        <Motion as="span" v-bind="scrollMotion()" class="inline-block text-sky-800">
          {{ page.features.headline }}
        </Motion>
      </template>

      <template #title>
        <Motion as="span" v-bind="scrollMotion(0.1)" class="inline-block">
          {{ page.features.title }}
        </Motion>
      </template>

      <template #description>
        <Motion as="span" v-bind="scrollMotion(0.2)" class="inline-block">
          {{ page.features.description }}
        </Motion>
      </template>

      <div class="rounded-2xl border border-default bg-default overflow-hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
          <Motion v-for="(feature, index) in page.features.items" :key="feature.title" v-bind="staggerMotion(index)">
            <UPageCard
              :icon="feature.icon"
              :title="feature.title"
              :description="feature.description"
              class="rounded-none duration-300"
              :ui="{
                root: 'h-full',
                leading: 'mb-5 flex size-9 justify-center rounded-lg bg-primary/10',
                title: 'text-md tracking-tight',
                description: 'text-md leading-relaxed sm:line-clamp-2 lg:line-clamp-3 text-dimmed'
              }"
            />
          </Motion>
        </div>
      </div>
    </UPageSection>

    <!-- Insights -->
    <UPageSection
      id="insights"
      :ui="{
        root: 'py-24 sm:py-32 scroll-mt-(--ui-header-height)',
        container: 'max-w-5xl',
        headline: 'font-mono font-medium text-xs text-primary uppercase tracking-[0.12em] text-center',
        title: 'max-w-lg mx-auto',
        description: 'max-w-md mx-auto text-dimmed'
      }"
    >
      <template #headline>
        <Motion as="span" v-bind="scrollMotion()" class="inline-block">
          {{ page.metrics.headline }}
        </Motion>
      </template>

      <template #title>
        <Motion as="span" v-bind="scrollMotion(0.1)" class="inline-block">
          {{ page.metrics.title }}
        </Motion>
      </template>

      <template #description>
        <Motion as="span" v-bind="scrollMotion(0.2)" class="inline-block">
          {{ page.metrics.description }}
        </Motion>
      </template>

      <div class="rounded-2xl border border-default bg-default overflow-hidden">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-px">
          <Motion v-for="(metric, index) in page.metrics.items" :key="metric.label" v-bind="staggerMotion(index)">
            <UPageCard
              :title="metric.value"
              :description="metric.label"
              class="rounded-none duration-300"
              :ui="{
                root: 'text-center',
                wrapper: 'items-center',
                title: ['text-4xl font-bold tracking-tight leading-none', metric.class],
                description: 'font-mono text-xs uppercase tracking-[0.06em] text-dimmed mt-3'
              }"
            />
          </Motion>
        </div>
      </div>
    </UPageSection>

    <!-- CTA -->
    <UPageCTA
      variant="naked"
      :ui="{
        root: 'py-24 sm:py-32 bg-gradient-to-b rounded-none',
        container: 'max-w-3xl text-center',
        title: 'lg:text-5xl tracking-tighter whitespace-pre-line',
        description: 'leading-relaxed text-dimmed'
      }"
    >
      <template #top>
        <GradientGlow class="bottom-0 w-2/3 h-1/2" />
      </template>

      <template #title>
        <Motion as="span" v-bind="scrollMotion()" class="inline-block">
          {{ page.cta.title }}
        </Motion>
      </template>

      <template #description>
        <Motion as="span" v-bind="scrollMotion(0.1)" class="inline-block">
          {{ page.cta.description }}
        </Motion>
      </template>

      <template #links>
        <Motion class="flex flex-col sm:flex-row items-center justify-center gap-6" v-bind="scrollMotion(0.2)">
          <UButton v-for="link in page.cta.links" :key="link.label" v-bind="link" size="xl" />
        </Motion>
      </template>

      <HeroShaders class="absolute bottom-0 inset-x-0 opacity-20 dark:opacity-5 -z-10 h-[40vh] rotate-180" />
    </UPageCTA>
  </div>
</template>
