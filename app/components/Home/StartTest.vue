<script setup>
const { loggedIn } = useAuth();
const isLoggedIn = computed(() => !!loggedIn.value);
</script>

<template>
  <section>
    <div class="relative overflow-hidden rounded-2xl border border-[#262C45] bg-gradient-to-r from-[#1b2033] to-[#14182a] p-10">
      <div class="absolute -top-24 -right-24 w-[320px] h-[320px] bg-[#6C7CFF]/15 blur-[90px] rounded-full"></div>
      <div class="absolute -bottom-24 -left-24 w-[320px] h-[320px] bg-[#6C7CFF]/10 blur-[90px] rounded-full"></div>

      <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div class="max-w-xl">
          <h3 class="text-2xl font-semibold mb-3">Ready to level up?</h3>
          <p class="text-[#9AA3C7] text-sm">Start with a random test or create an account to track progress and achievements.</p>
        </div>

        <div class="flex gap-3">
          <NuxtLink to="/tests" class="btn btn-lg">Start test</NuxtLink>
          <NuxtLink v-if="!isLoggedIn" to="/auth/register" class="btn secondary">Create account</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
