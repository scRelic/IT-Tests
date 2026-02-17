<script setup>
import { ref } from "vue";

const { loggedIn } = useAuth();
const { user } = useUser();
const { mobileOpen, toggleMobile, closeMobile } = useSidebar();

const activeNavItem = computed(() => {
  const path = useRoute().path;
  return navItems.value.find((item) => item.link === path)?.name || null;
});

const navItems = ref([
  { name: "Tests", link: "/tests" },
  { name: "Categories", link: "/categories" },
  { name: "Leaderboards", link: "/leaderboards" },
  { name: "Admin Panel", link: "/admin", rule: "admin" },
]);
</script>

<template>
  <header class="sticky top-0 z-10 bg-[#0d0f14]/85 backdrop-blur-[10px] border-b border-[#262C45] py-4">
    <div class="container">
      <div class="flex justify-between items-center">
        <button
          class="lg:hidden p-2 rounded-lg border border-[#262C45] hover:border-[#6C7CFF]/50 hover:bg-white/5 transition"
          @click="toggleMobile"
          aria-label="Toggle menu">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <NuxtLink to="/">
          <h1 class="text-[#6C7CFF] text-[20px] font-[700]">IT Tests</h1>
        </NuxtLink>

        <nav class="hidden lg:block">
          <ul class="flex justify-between items-center gap-7">
            <template v-for="item in navItems" :key="item.name">
              <li v-if="!item.rule || (item.rule === 'admin' && user?.role === 'admin')">
                <NuxtLink
                  :to="item.link"
                  class="text-[#9AA3C7] font-[500] hover:text-white transition duration-200"
                  :class="activeNavItem === item.name ? 'border-b-2 border-[#6C7CFF] pb-[22px]' : ''">
                  {{ item.name }}
                </NuxtLink>
              </li>
            </template>
          </ul>
        </nav>

        <NuxtLink
          to="/auth/login"
          class="px-4 py-2 rounded-lg border border-white/10 text-slate-200 hover:border-indigo-500/50 hover:text-white transition hidden md:block"
          v-if="!loggedIn">
          Log In
        </NuxtLink>

        <NuxtLink
          v-else
          to="/profile"
          class="flex gap-2 font-mono text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition max-[550px]:hidden">
          <span class="text-indigo-400">$</span>
          <span>{{ user?.name ?? "User" }}</span>
          <svg class="w-3 h-3 opacity-60" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M7.21 4.23a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06L10.94 10 7.21 6.29a.75.75 0 010-1.06z"
              clip-rule="evenodd" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
