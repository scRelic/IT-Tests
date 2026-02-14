import type { User } from "~~/shared/types/user";

export const useUser = () => {
  const user = useState<User | null>('auth:user', () => null)
  const pending = useState<boolean>('auth:user:pending', () => false)

  const fetchUser = async () => {
    if (pending.value) return
    pending.value = true
    try {
      const headers = process.server ? useRequestHeaders(['cookie']) : undefined
      const data = await $fetch<User>('/api/me', { headers })
      user.value = data
    } catch {
      user.value = null
    } finally {
      pending.value = false
    }
  }

  return { user, pending, fetchUser }
}
