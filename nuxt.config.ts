export default defineNuxtConfig({
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

  auth: {
    session: {
      cookie: {
        secure: false,
        sameSite: 'lax',
        httpOnly: true,
      },
    },
  },

  runtimeConfig: {
    auth: {
      session: {
        cookie: {
          secure: false,
          sameSite: 'lax',
          httpOnly: true,
        },
      },
    },
  },
})
