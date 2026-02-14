<script setup lang="ts">
import { object, ref as yupRef, string } from "yup";
import { ref } from "vue";

definePageMeta({
  layout: "auth",
});

const userSchema = object({
  email: string().email().required(),
  password: string().required().min(6).max(100),
});

const showPassword = ref(false);
const email = ref("");
const password = ref("");

const router = useRouter();
const { login, error: authError } = useAuth();

const formErrors = ref<Record<string, string>>({});

const validateForm = async () => {
  try {
    await userSchema.validate(
      {
        email: email.value,
        password: password.value,
      },
      { abortEarly: false },
    );

    formErrors.value = {};
    return true;
  } catch (err: any) {
    if (err.inner) {
      const errors: { [key: string]: string } = {};
      err.inner.forEach((e: any) => {
        if (e.path) errors[e.path] = e.message;
      });
      formErrors.value = errors;
    }
    return false;
  }
};

const handleLogin = async () => {
  const isValid = await validateForm();
  if (!isValid) return;

  try {
    await login({
      email: email.value,
      password: password.value,
    });

    await router.push("/");
  } catch (err) {
    console.error("Login failed:", err);
  }
};
</script>

<template>
  <main class="container">
    <div class="max-w-md mx-auto flex justify-center items-center min-h-[70vh]">
      <div class="w-full bg-[#1B2033] border border-[#262C45] rounded-2xl p-8 shadow-xl">
        <h1 class="text-2xl font-semibold mb-2 text-white">Log In</h1>
        <p class="text-[#9AA3C7] mb-6 text-sm">Access your account</p>

        <form class="space-y-4">
          <div>
            <label for="email" class="block text-sm text-[#9AA3C7] mb-1">Email</label>
            <div class="relative">
              <Icon name="material-symbols:mail-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                id="email"
                type="email"
                placeholder="test@example.com"
                class="w-full pl-10 px-4 py-3 rounded-xl bg-[#141824] border border-[#262C45] focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-white/50"
                v-model="email" />
            </div>
            <p v-if="formErrors.email" class="mt-1 text-xs text-rose-300">{{ formErrors.email }}</p>
          </div>

          <div class="relative">
            <label for="password" class="block text-sm text-[#9AA3C7] mb-1">Password</label>
            <div class="relative">
              <Icon name="material-symbols:lock-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password"
                class="w-full px-10 py-3 rounded-xl bg-[#141824] border border-[#262C45] focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-white/50"
                v-model="password" />
            </div>
            <button
              type="button"
              class="absolute right-3 top-[48px] -translate-y-1/2 flex items-center text-[#9AA3C7] hover:text-white transition duration-200"
              :aria-pressed="showPassword"
              :title="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword">
              <Icon name="material-symbols:visibility-outline" v-if="!showPassword" class="h-5 w-5" />
              <Icon name="material-symbols:visibility-off-outline" v-else class="h-5 w-5" />
            </button>
            <p v-if="formErrors.password" class="mt-1 text-xs text-rose-300">{{ formErrors.password }}</p>
          </div>
          <p v-if="authError" class="mt-2 text-xs text-rose-300">Invalid email or password. Please try again.</p>
          <button
            @click.prevent="handleLogin"
            class="w-full py-3 rounded-xl bg-[#6C7CFF] font-semibold hover:shadow-[0_0_24px_rgba(108,124,255,.4)] transition flex items-center justify-center gap-2">
            Log In
            <Icon name="material-symbols:rocket-launch-outline" />
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <span class="text-[#9AA3C7]">Don't have an account? </span>
          <NuxtLink to="/auth/register" class="text-[#6C7CFF] hover:underline">Sign Up</NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
