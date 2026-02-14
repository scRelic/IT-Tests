export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, fetch } = useUserSession()

  if (process.server) {
    await fetch()
  }

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }
})
