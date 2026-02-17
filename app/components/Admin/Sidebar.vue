<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

const { logout } = useAuth();

const { data } = await useFetch("/api/admin/overview", {
  key: "admin-overview",
  default: () => ({ testsCount: 0, categoriesCount: 0, usersCount: 0 }),
});

const tabs = computed(() => [
  { name: "Dashboard", href: "/admin", icon: "▦", description: "Overview & stats" },
  { name: "Tests", href: "/admin/tests", icon: "✓", description: "CRUD tests", count: data.value?.testsCount ?? 0 },
  { name: "Categories", href: "/admin/categories", icon: "#", description: "Tags & topics", count: data.value?.categoriesCount ?? 0 },
  { name: "Users", href: "/admin/users", icon: "👤", description: "Roles & bans", count: data.value?.usersCount ?? 0 },
  { name: "Main", href: "/", icon: "🏠", description: "Main site" },
]);

const activeTab = computed(() => tabs.value.find((tab) => tab.href === route.path) || null);

const { mobileOpen, desktopOpen, toggleMobile, closeMobile } = useSidebar();
</script>

<template>
  <div class="hidden lg:block shrink-0 overflow-hidden sticky top-0 h-screen transition-[width] duration-200 ease-out" :class="desktopOpen ? 'w-72' : 'w-0'">
    <aside
      class="w-72 h-full flex flex-col border-r border-[#262C45] bg-[#0d0f14]/70 backdrop-blur overflow-hidden transition-opacity duration-150"
      :class="desktopOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'">
      <div class="px-6 py-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-[#6C7CFF]/20 border border-[#262C45] flex items-center justify-center">
            <span class="text-[#6C7CFF] font-semibold">IT</span>
          </div>
          <div>
            <p class="text-sm font-semibold">IT Tests</p>
            <p class="text-xs text-[#9AA3C7]">Admin panel</p>
          </div>
        </div>
        <span class="text-[10px] px-2 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">v1.0</span>
      </div>

      <div class="px-6">
        <div class="rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] p-4">
          <p class="text-xs text-[#9AA3C7]">Signed in as</p>
          <p class="mt-1 text-sm font-semibold">Dima (Admin)</p>
          <div class="mt-3 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span class="text-xs text-[#9AA3C7]">System healthy</span>
          </div>
        </div>
      </div>

      <nav class="mt-5 px-3 flex-1 min-h-0 overflow-y-auto">
        <div class="mt-2 space-y-2" v-for="tab in tabs" :key="tab.name">
          <NuxtLink
            :to="tab.href"
            class="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm border transition"
            :class="
              activeTab && activeTab.name === tab.name ? 'border-[#6C7CFF]/40 bg-[#6C7CFF]/10' : 'border-transparent hover:border-[#262C45]  hover:bg-white/5'
            "
            @click="closeMobile">
            <span class="h-9 w-9 rounded-xl border border-[#262C45] bg-white/5 flex items-center justify-center text-[#9AA3C7]">{{ tab.icon }}</span>
            <div class="flex-1">
              <p class="font-semibold">{{ tab.name }}</p>
              <p class="text-xs text-[#9AA3C7]">{{ tab.description }}</p>
            </div>
            <span v-if="tab.count" class="text-xs px-2 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">{{ tab.count }}</span>
          </NuxtLink>
        </div>
      </nav>

      <div class="mt-auto p-6">
        <button @click="logout" class="w-full rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-sm hover:bg-white/10 transition">Logout</button>
      </div>
    </aside>
  </div>

  <Teleport to="body">
    <!-- Mobile drawer (fade overlay + slide panel) -->
    <div class="lg:hidden fixed inset-0 z-40 pointer-events-none">
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <button v-if="mobileOpen" type="button" class="absolute inset-0 bg-[#0d0f14]/70 pointer-events-auto" aria-label="Close menu" @click="closeMobile" />
      </Transition>

      <Transition
        enter-active-class="transition-transform duration-200 ease-out"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-150 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full">
        <aside
          v-if="mobileOpen"
          class="absolute left-0 top-0 h-full w-72 border-r border-[#262C45] bg-[#0d0f14]/95 backdrop-blur overflow-hidden pointer-events-auto">
          <div class="px-6 py-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-xl bg-[#6C7CFF]/20 border border-[#262C45] flex items-center justify-center">
                <span class="text-[#6C7CFF] font-semibold">IT</span>
              </div>
              <div>
                <p class="text-sm font-semibold">IT Tests</p>
                <p class="text-xs text-[#9AA3C7]">Admin panel</p>
              </div>
            </div>
            <button type="button" class="rounded-xl border border-[#262C45] bg-white/5 px-3 py-2 text-sm" aria-label="Close menu" @click="closeMobile">
              ✕
            </button>
          </div>

          <div class="px-6">
            <div class="rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] p-4">
              <p class="text-xs text-[#9AA3C7]">Signed in as</p>
              <p class="mt-1 text-sm font-semibold">Dima (Admin)</p>
              <div class="mt-3 flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span class="text-xs text-[#9AA3C7]">System healthy</span>
              </div>
            </div>
          </div>

          <nav class="mt-5 px-3 flex-1 min-h-0 overflow-y-auto">
            <div class="mt-2 space-y-2" v-for="tab in tabs" :key="tab.name">
              <NuxtLink
                :to="tab.href"
                class="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm border transition"
                :class="
                  activeTab && activeTab.name === tab.name
                    ? 'border-[#6C7CFF]/40 bg-[#6C7CFF]/10'
                    : 'border-transparent hover:border-[#262C45]  hover:bg-white/5'
                "
                @click="closeMobile">
                <span class="h-9 w-9 rounded-xl border border-[#262C45] bg-white/5 flex items-center justify-center text-[#9AA3C7]">{{ tab.icon }}</span>
                <div class="flex-1">
                  <p class="font-semibold">{{ tab.name }}</p>
                  <p class="text-xs text-[#9AA3C7]">{{ tab.description }}</p>
                </div>
                <span v-if="tab.count" class="text-xs px-2 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">{{ tab.count }}</span>
              </NuxtLink>
            </div>
          </nav>

          <div class="mt-auto p-6">
            <button @click="logout" class="w-full rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-sm hover:bg-white/10 transition">Logout</button>
          </div>
        </aside>
      </Transition>
    </div>
  </Teleport>
</template>
