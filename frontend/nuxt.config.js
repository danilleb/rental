// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    'vuetify-nuxt-module',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_API_BASE_URL
    }
  }
})