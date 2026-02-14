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
      <section class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-16 md:pt-32 mb-20 md:mb-40">
        <div class="max-w-[560px]">
          <h2 class="text-3xl md:text-[44px] mb-5 tracking-wide leading-[1.1]">Test your IT skills and knowledge</h2>
          <p class="text-[18px] mb-8 text-[#9AA3C7] max-w-[520px]">
            Online tests on Frontend, Backend, DevOps, algorithms, and databases. Suitable for interview preparation.
          </p>

          <div class="flex gap-4 items-center">
            <NuxtLink to="/tests" class="btn btn-lg"> Start test </NuxtLink>
            <NuxtLink to="/categories" class="btn secondary"> View Categories </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-8 gap-4">
            <div
              class="border border-[#262c45] bg-[#1B2033] p-4 flex flex-col items-center rounded-xl overflow-hidden"
              v-for="stat in HERO_STATS"
              :key="stat.label">
              <strong class="text-[#6B7BFC] text-3xl mb-2">{{ stat.value }}</strong>
              <span class="text-[#9AA3C7]">{{ stat.label }}</span>
            </div>
          </div>
        </div>
        <div class="w-full">
          <div class="w-full aspect-[4/3] md:aspect-[16/11] rounded-xl overflow-hidden">
            <NuxtImg src="/images/pc_preview.png" alt="Preview" class="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section class="mb-32">
        <h3 class="text-2xl font-[600] mb-6">Random Tests</h3>

        <div v-if="error" class="text-sm text-red-400 text-center border border-red-400 p-4 rounded-xl">
          <span>Failed to load random tests.</span>
          <button class="underline ml-2" @click="refresh()">Retry</button>
        </div>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6" v-if="tests?.length">
          <div v-for="test in tests" :key="test.id">
            <AppCardTest :test="test" />
          </div>
        </div>

        <div v-else class="text-sm text-slate-500 text-center">No random tests yet.</div>
      </section>

      <HomeHowItWorksBlock class="mb-36" />
      <HomeWhatUsersSay class="mb-36" />
      <HomeStartTest class="mb-36" />
    </div>
  </main>
</template>
