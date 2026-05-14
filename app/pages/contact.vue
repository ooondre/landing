<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

const name = ref('')
const email = ref('')
const message = ref('')
const loading = ref(false)
const toast = useToast()

const touchedName = ref(false)
const touchedEmail = ref(false)
const touchedMessage = ref(false)

const nameError = computed(() => {
  if (!touchedName.value) return ''
  if (!name.value.trim()) return 'Please enter your full name'
  return ''
})

const emailError = computed(() => {
  if (!touchedEmail.value) return ''
  if (!email.value.trim()) return 'Please enter your email address'
  if (!validateEmail(email.value)) return 'Please enter a valid email address'
  return ''
})

const messageError = computed(() => {
  if (!touchedMessage.value) return ''
  if (!message.value.trim()) return 'Please enter a message'
  return ''
})

function validateEmail(e: string) {
  return /\S+@\S+\.\S+/.test(e)
}

const token = ref('')

function enterMotion(delay: number = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay }
  }
}

function staggerMotion(index: number = 0) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay: index * 0.06 }
  }
}

async function onSubmit() {
  // mark fields as touched so validation messages appear if invalid
  touchedName.value = true
  touchedEmail.value = true
  touchedMessage.value = true

  // stop if there are validation errors
  if (nameError.value || emailError.value || messageError.value) {
    return
  }

  loading.value = true
  try {
    const response = await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        message: message.value,
        token: token.value
      }
    })

    // show toast confirmation
    toast.add({
      title: 'Thanks — your message was sent.',
      duration: 4500,
      color: 'primary'
    })
    name.value = ''
    email.value = ''
    message.value = ''
    // reset touched state so the form looks like a fresh page load
    touchedName.value = false
    touchedEmail.value = false
    touchedMessage.value = false
    // ensure UI updates after DOM updates
    await nextTick()
    touchedName.value = false
    touchedEmail.value = false
    touchedMessage.value = false
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Failed to send message.'
    toast.add({
      title: 'Failed to send message',
      description: msg,
      duration: 6000,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // reset touched flags after hydration to avoid any early validation/style flashes
  touchedName.value = false
  touchedEmail.value = false
  touchedMessage.value = false
  // ensure reset happens after any child components emit mount events
  nextTick(() => {
    touchedName.value = false
    touchedEmail.value = false
    touchedMessage.value = false
  })
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-8">
    <UPageHero
      :ui="{
        container: 'relative z-10 py-4 pt-16 sm:py-4 sm:pt-16 md:py-4 md:pt-16 lg:py-4 lg:pt-16 px-0 sm:px-0 lg:px-0',
        wrapper: 'flex flex-col items-start text-start',
        title: 'sm:text-5xl lg:text-5xl tracking-tight',
        description: 'mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-default'
      }"
    >
      <template #title>
        <Motion v-bind="enterMotion(0.06)" as="h1" class="font-bold">Contact</Motion>
      </template>
    </UPageHero>

    <Motion v-bind="enterMotion(0.05)" as="p" class="text-base mb-8">
      If you have questions or need help, send us a short message and we'll get back to you.
    </Motion>

    <!-- disable built-in validation events to avoid initial errors; we control errors via touched flags -->
    <UForm :validate-on="[]" @submit.prevent="onSubmit" class="space-y-4 max-w-150">
      <Motion class="stagger-children" as="div" v-bind="staggerMotion(0)">
        <UFormField label="Name" class="mb-4" :error="nameError || undefined" :eager-validation="false">
          <Motion as="div" v-bind="enterMotion(0.06)">
            <UInput
              v-model="name"
              type="text"
              size="lg"
              @blur="touchedName = true"
              :class="[
                'w-full rounded-md bg-gray-100 dark:bg-[#09090b] transition-colors border',
                nameError ? 'border-rose-600 ring-1 ring-rose-100' : 'border-neutral-200'
              ]"
              :aria-invalid="!!nameError"
            />
          </Motion>
        </UFormField>

        <UFormField label="Email" class="mb-4" :error="emailError || undefined" :eager-validation="false">
          <Motion as="div" v-bind="enterMotion(0.08)">
            <UInput
              v-model="email"
              type="email"
              size="lg"
              @blur="touchedEmail = true"
              :class="[
                'w-full rounded-md bg-gray-100 dark:bg-[#09090b] transition-colors border',
                emailError ? 'border-rose-600 ring-1 ring-rose-100' : 'border-neutral-200'
              ]"
              :aria-invalid="!!emailError"
            />
          </Motion>
        </UFormField>

        <UFormField label="Message" class="mb-4" :error="messageError || undefined" :eager-validation="false">
          <Motion as="div" v-bind="enterMotion(0.1)">
            <UTextarea
              v-model="message"
              :rows="6"
              size="lg"
              @blur="touchedMessage = true"
              :class="[
                'w-full rounded-md bg-gray-100 dark:bg-[#09090b] transition-colors border',
                messageError ? 'border-rose-600 ring-1 ring-rose-100' : 'border-neutral-200'
              ]"
              :aria-invalid="!!messageError"
            />
          </Motion>
        </UFormField>

        <NuxtTurnstile v-model="token" />

        <div class="flex items-center gap-3 mt-8">
          <Motion as="div" v-bind="enterMotion(0.12)">
            <UButton
              type="submit"
              :disabled="loading"
              class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white dark:text-[#09090b] transition-all duration-200 font-medium disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:bg-primary active:bg-primary shadow-[0_0_20px_var(--btn-glow)] hover:shadow-[0_0_30px_var(--btn-glow-hover)] hover:-translate-y-px active:translate-y-0 [--btn-glow:color-mix(in_oklch,var(--ui-primary)_25%,transparent)] [--btn-glow-hover:color-mix(in_oklch,var(--ui-primary)_35%,transparent)]"
            >
              <span v-if="!loading">Send message</span>
              <span v-else>Sending…</span>
            </UButton>
          </Motion>
        </div>
      </Motion>
    </UForm>
  </div>
  <HeroShaders class="absolute bottom-0 inset-x-0 opacity-20 dark:opacity-5 -z-10 h-[40vh] rotate-180" />
</template>
