<script setup lang="ts">
import type { Test } from "~~/shared/types/test";
import { HERO_STATS } from "~~/shared/constants";

const {
  data: tests,
  pending,
  error,
  refresh,
} = await useFetch<Test[]>("/api/tests/random", {
  key: "home-random-tests",
  default: () => [],
});
</script>

<template>
  <main class="container">
    <AppLoader v-if="pending" />
    <div v-else>
      <section
        class="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 gap-8 md:gap-10 items-center pt-10 sm:pt-14 md:pt-24 lg:pt-32 mb-14 sm:mb-20 md:mb-32 lg:mb-40">
        <div class="lg:max-w-[560px] mx-auto md:mx-0 text-center">
          <h2 class="text-[30px] sm:text-4xl md:text-[44px] mb-4 sm:mb-5 tracking-wide leading-[1.1]">Test your IT skills and knowledge</h2>
          <p class="text-base sm:text-[18px] mb-6 sm:mb-8 text-[#9AA3C7] max-w-[520px] mx-auto">
            Online tests on Frontend, Backend, DevOps, algorithms, and databases. Suitable for interview preparation.
          </p>

          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <NuxtLink to="/tests" class="btn btn-lg text-center sm:block sm:w-full"> Start test </NuxtLink>
            <NuxtLink to="/categories" class="btn secondary text-center sm:block sm:w-full"> View Categories </NuxtLink>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 mt-6 sm:mt-8 gap-3 sm:gap-4">
            <div
              class="border border-[#262c45] bg-[#1B2033] p-4 flex flex-col items-center rounded-xl overflow-hidden"
              v-for="stat in HERO_STATS"
              :key="stat.label">
              <strong class="text-[#6B7BFC] text-3xl mb-2">{{ stat.value }}</strong>
              <span class="text-[#9AA3C7] text-sm text-center">{{ stat.label }}</span>
            </div>
          </div>
        </div>
        <div class="w-full">
          <div class="w-full aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden">
            <NuxtImg src="/images/pc_preview.png" alt="Preview" class="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section class="mb-16 sm:mb-24 md:mb-32">
        <h3 class="text-xl sm:text-2xl font-[600] mb-5 sm:mb-6">Random Tests</h3>

        <div v-if="error" class="text-sm text-red-400 text-center border border-red-400 p-4 rounded-xl">
          <span>Failed to load random tests.</span>
          <button class="underline ml-2" @click="refresh()">Retry</button>
        </div>

        <div
          class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 sm:gap-6"
          v-if="tests?.length">
          <div v-for="test in tests" :key="test.id">
            <AppCardTest :test="test" />
          </div>
        </div>

        <div v-else class="text-sm text-slate-500 text-center mt-6">No random tests yet.</div>
      </section>

      <HomeHowItWorksBlock class="mb-20 sm:mb-28 md:mb-36" />
      <HomeWhatUsersSay class="mb-20 sm:mb-28 md:mb-36" />
      <HomeStartTest class="mb-20 sm:mb-28 md:mb-36" />
    </div>
  </main>
</template>
