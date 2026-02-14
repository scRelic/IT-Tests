<script setup lang="ts">
import { object, ref as yupRef, string } from "yup";
import { ref } from "vue";

definePageMeta({
  layout: "auth",
});

const userSchema = object({
  name: string().required().min(2).max(20),
  email: string().email().required(),
  password: string().required().min(6).max(100),
  confirmPassword: string()
    .oneOf([yupRef("password")], "Passwords must match")
    .required(),
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const formErrors = ref<Record<string, string>>({});

const { register, error: authError, pending } = useAuth();
const router = useRouter();

const validateForm = async () => {
  try {
    await userSchema.validate(
      {
        name: name.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
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

const handleRegister = async () => {
  const isValid = await validateForm();
  if (!isValid) return;

  try {
    await register({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    await router.push("/auth/login");
  } catch (error: any) {
    console.error("Registration error:", error);
  }
};
</script>

<template>
  <main class="container">
    <div class="max-w-md mx-auto flex justify-center items-center min-h-[90vh]">
      <div class="w-full bg-[#1B2033] border border-[#262C45] rounded-2xl p-8 shadow-xl">
        <h1 class="text-2xl font-semibold mb-2 text-white">Sign Up</h1>
        <p class="text-[#9AA3C7] mb-6 text-sm">Create a new account</p>

        <form class="space-y-4" @submit.prevent="handleRegister">
          <div>
            <label for="name" class="block text-sm text-[#9AA3C7] mb-1">Name</label>
            <div class="relative">
              <Icon name="material-symbols:person-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                v-model="name"
                id="name"
                type="text"
                placeholder="John Doe"
                class="w-full pl-10 px-4 py-3 rounded-xl bg-[#141824] border border-[#262C45] focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-white/50" />
            </div>
            <p v-if="formErrors.name" class="mt-1 text-xs text-rose-300">{{ formErrors.name }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm text-[#9AA3C7] mb-1">Email</label>
            <div class="relative">
              <Icon name="material-symbols:mail-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                v-model="email"
                id="email"
                type="email"
                placeholder="test@example.com"
                class="w-full pl-10 px-4 py-3 rounded-xl bg-[#141824] border border-[#262C45] focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-white/50" />
            </div>
            <p v-if="formErrors.email" class="mt-1 text-xs text-rose-300">{{ formErrors.email }}</p>
          </div>

          <div class="relative">
            <label for="password" class="block text-sm text-[#9AA3C7] mb-1">Password</label>
            <div class="relative">
              <Icon name="material-symbols:lock-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                v-model="password"
                id="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password"
                class="w-full px-10 py-3 rounded-xl bg-[#141824] border border-[#262C45] focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-white/50" />
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

          <div class="relative">
            <label for="confirmPassword" class="block text-sm text-[#9AA3C7] mb-1">Confirm Password</label>
            <div class="relative">
              <Icon name="material-symbols:lock-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                v-model="confirmPassword"
                id="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm password"
                class="w-full px-10 py-3 rounded-xl bg-[#141824] border border-[#262C45] focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-white/50" />
            </div>
            <button
              type="button"
              class="absolute right-3 top-[48px] -translate-y-1/2 flex items-center text-[#9AA3C7] hover:text-white transition duration-200"
              :aria-pressed="showConfirmPassword"
              :title="showConfirmPassword ? 'Hide password' : 'Show password'"
              @click="showConfirmPassword = !showConfirmPassword">
              <Icon name="material-symbols:visibility-outline" v-if="!showConfirmPassword" class="h-5 w-5" />
              <Icon name="material-symbols:visibility-off-outline" v-else class="h-5 w-5" />
            </button>
            <p v-if="formErrors.confirmPassword" class="mt-1 text-xs text-rose-300">{{ formErrors.confirmPassword }}</p>
          </div>
          <p v-if="authError" class="mt-2 text-xs text-rose-300">Invalid registration details. Please try again.</p>
          <div>
            <button
              type="submit"
              class="w-full py-3 rounded-xl bg-[#6C7CFF] font-semibold hover:shadow-[0_0_24px_rgba(108,124,255,.4)] transition flex items-center justify-center gap-2">
              Sign Up
              <Icon name="material-symbols:rocket-launch-outline" />
            </button>
          </div>
        </form>

        <div class="mt-6 text-center text-sm">
          <span class="text-[#9AA3C7]">Already have an account? </span>
          <NuxtLink to="/auth/login" class="text-[#6C7CFF] hover:underline">Log In</NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>
