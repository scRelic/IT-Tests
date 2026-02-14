import type { RegisterCredentials, LoginCredentials } from "~~/shared/types/auth";

const getErrorMessage = (e: any, fallback: string) =>
  e?.data?.message || e?.message || fallback;

export const useAuth = () => {
  const { user, loggedIn, fetch: fetchSession, clear } = useUserSession();

  const pending = useState<boolean>("auth:pending", () => false);
  const error = useState<string | null>("auth:error", () => null);

  const login = async (payload: LoginCredentials) => {
    try {
      pending.value = true;
      error.value = null;

      await $fetch("/api/auth/login", { method: "POST", body: payload });
      await fetchSession();
    } catch (e: any) {
      error.value = getErrorMessage(e, "Login failed");
      throw e;
    } finally {
      pending.value = false;
    }
  };

  const register = async (payload: RegisterCredentials) => {
    try {
      pending.value = true;
      error.value = null;

      await $fetch("/api/auth/register", { method: "POST", body: payload });
    } catch (e: any) {
      error.value = getErrorMessage(e, "Register failed");
      throw e;
    } finally {
      pending.value = false;
    }
  };

  const logout = async () => {
    try {
      pending.value = true;
      error.value = null;

      await clear();
      await navigateTo("/");
    } finally {
      pending.value = false;
    }
  };

  return {
    user,
    loggedIn,
    pending,
    error,

    register,
    login,
    logout,
  };
};
