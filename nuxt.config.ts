// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt", 'pinia-plugin-persistedstate/nuxt'],
  runtimeConfig: {
    public: {
      apiToken: process.env.API_TOKEN
    }
  }
})
