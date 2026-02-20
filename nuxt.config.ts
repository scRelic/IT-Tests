export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-16',
      viewport: 'width=device-width, initial-scale=1',
      title: 'IT Tests - your road to IT',
      meta: [
        { name: 'description', content: 'Take IT tests, improve your skills, and prepare for interviews.' }
      ],
      htmlAttrs: { lang: 'en' }
    }
  },
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },
  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
    '@vueuse/motion',
    '@pinia/nuxt',
  ],
  css: ['@/assets/css/style.css'],
  typescript: {
    tsConfig: {
      include: ['types/**/*.d.ts'],
    },
  },
  ssr: true,
  nitro: {
    publicAssets: [
      { dir: '/data/uploads', baseURL: '/uploads' }
    ],
  },
  image: {
    format: ['webp'],
  }

})
