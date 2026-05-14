// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxt/ui', '@vueuse/nuxt', 'motion-v/nuxt', '@nuxt/image', '@nuxtjs/turnstile'],

  runtimeConfig: {
    mailgun: {
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      sender: process.env.MAILGUN_SENDER,
      recipient: process.env.MAILGUN_RECIPIENT
    },
    turnstile: {
      secretKey: process.env.TURNSTILE_SECRET_KEY
    }
  },
  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY
  },
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    experimental: {
      sqliteConnector: 'native'
    }
  },

  mdc: {
    highlight: {
      noApiRoute: false
    }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  vite: {
    optimizeDeps: {
      include: ['shaders/vue']
    }
  }
})
