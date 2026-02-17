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

const { mobileOpen, toggleMobile } = useSidebar();

const cardsStats = computed<Array<{ title: string; value: number; link?: string; icon: string }>>(() => [
  {
    title: "Total tests",
    value: adminData.value?.totalTests || 0,
    link: "/admin/tests",
    icon: "✓",
  },
  {
    title: "Questions",
    value: adminData.value?.totalQuestions || 0,
    link: "/admin/tests",
    icon: "?",
  },
  {
    title: "Users",
    value: adminData.value?.totalUsers || 0,
    link: "/admin/users",
    icon: "👤",
  },
  {
    title: "Categories",
    value: adminData.value?.totalCategories || 0,
    link: "/admin/categories",
    icon: "#",
  },
]);

const quickActions = [
  { label: "Add Test", href: "/admin/tests/create", icon: "➕" },
  { label: "Add Category", href: "/admin/categories/create", icon: "🏷️" },
  { label: "View Users", href: "/admin/users", icon: "👥" },
];

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
      <!-- Mobile Header -->
      <div class="lg:hidden flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-semibold tracking-wide">Dashboard</h1>
          <p class="mt-1 text-sm text-[#9AA3C7]">Overview & stats</p>
        </div>
        <button
          class="p-2 rounded-lg border border-[#262C45] hover:border-[#6C7CFF]/50 hover:bg-white/5 transition"
          @click="toggleMobile"
          aria-label="Toggle menu">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Desktop Header -->
      <div class="hidden lg:flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-semibold tracking-wide">Dashboard</h1>
          <p class="mt-1 text-sm text-[#9AA3C7]">Tests, questions, categories and users.</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <NuxtLink
          v-for="card in cardsStats"
          :key="card.title"
          :to="card.link"
          class="group rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] p-5 hover:border-[#6C7CFF]/40 hover:bg-gradient-to-b hover:from-[#212d45] hover:to-[#1a2435] transition cursor-pointer">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-[#9AA3C7]">{{ card.title }}</p>
              <p class="mt-2 text-3xl font-semibold">{{ card.value }}</p>
            </div>
            <span class="text-xl opacity-60 group-hover:opacity-100 transition">{{ card.icon }}</span>
          </div>
        </NuxtLink>
      </section>

      <!-- Quick Actions -->
      <section class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Quick actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.href"
            class="flex items-center gap-3 rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 hover:border-[#6C7CFF]/50 hover:bg-[#6C7CFF]/10 transition">
            <span class="text-xl">{{ action.icon }}</span>
            <span class="text-sm font-medium">{{ action.label }}</span>
            <svg class="w-4 h-4 ml-auto opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </section>
    </template>
  </main>
</template>
