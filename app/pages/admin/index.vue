<script setup lang="ts">
import { computed } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type AdminDashboardData = {
  totalTests: number;
  totalQuestions: number;
  totalUsers: number;
  totalCategories: number;
};

const cardsStats = computed<Array<{ title: string; value: number; subtitle: string }>>(() => [
  {
    title: "Total tests",
    value: adminData.value?.totalTests || 0,
    subtitle: "+6 this week",
  },
  {
    title: "Questions",
    value: adminData.value?.totalQuestions || 0,
    subtitle: "Avg 25 / test",
  },
  {
    title: "Users",
    value: adminData.value?.totalUsers || 0,
    subtitle: "+1.2k in 30 days",
  },
  {
    title: "Categories",
    value: adminData.value?.totalCategories || 0,
    subtitle: "Need review",
  },
]);

const {
  data: adminData,
  pending: adminPending,
  error: adminError,
} = await useFetch<AdminDashboardData>("/api/admin", {
  key: "admin-dashboard",
  default: () => ({
    totalTests: 0,
    totalQuestions: 0,
    totalUsers: 0,
    totalCategories: 0,
  }),
});
</script>

<template>
  <main class="p-6 lg:p-10">
    <AppLoader v-if="adminPending" />

    <div v-else-if="adminError" class="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-200">
      <p class="text-sm font-semibold">Failed to load dashboard</p>
      <p class="mt-1 text-xs opacity-90">Please refresh the page or try again later.</p>
    </div>

    <template v-else>
      <div class="hidden lg:flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-semibold tracking-wide">Dashboard</h1>
          <p class="mt-1 text-sm text-[#9AA3C7]">Tests, questions, categories and users.</p>
        </div>

        <div class="flex items-center gap-3">
          <button class="rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-sm hover:bg-white/10 transition">🔔</button>
        </div>
      </div>

      <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div class="rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] p-5" v-for="card in cardsStats" :key="card.title">
          <p class="text-sm text-[#9AA3C7]">{{ card.title }}</p>
          <p class="mt-2 text-3xl font-semibold">{{ card.value }}</p>
          <p class="mt-2 text-xs text-[#9AA3C7]">{{ card.subtitle }}</p>
        </div>
      </section>
    </template>
  </main>
</template>
