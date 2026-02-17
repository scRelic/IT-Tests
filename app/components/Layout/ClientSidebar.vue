<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();
const { loggedIn, logout } = useAuth();
const { user } = useUser();

const { mobileOpen, closeMobile } = useSidebar();

const navItems = computed(() => [
  { name: "Tests", link: "/tests", icon: "✓" },
  { name: "Categories", link: "/categories", icon: "#" },
  ...(user.value?.role === "admin" ? [{ name: "Admin Panel", link: "/admin", icon: "⚙" }] : []),
]);

const activeItem = computed(() => navItems.value.find((item) => item.link === route.path));

const handleNavClick = () => {
  closeMobile();
};
</script>

<template>
  <Teleport to="body">
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
          class="absolute left-0 top-0 h-full w-72 border-r border-[#262C45] bg-[#0d0f14]/95 backdrop-blur overflow-hidden pointer-events-auto flex flex-col">
          <div class="px-6 py-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-xl bg-[#6C7CFF]/20 border border-[#262C45] flex items-center justify-center">
                <span class="text-[#6C7CFF] font-semibold">IT</span>
              </div>
              <div>
                <p class="text-sm font-semibold">IT Tests</p>
                <p class="text-xs text-[#9AA3C7]">Learning platform</p>
              </div>
            </div>
            <button
              type="button"
              class="rounded-lg border border-[#262C45] bg-white/5 p-2 text-sm hover:bg-white/10 transition"
              aria-label="Close menu"
              @click="closeMobile">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="loggedIn" class="px-6 mb-5">
            <div class="rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] p-4">
              <p class="text-xs text-[#9AA3C7]">Logged in as</p>
              <p class="mt-1 text-sm font-semibold">{{ user?.name ?? "User" }}</p>
              <div class="mt-3 flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span class="text-xs text-[#9AA3C7]">Ready to test</span>
              </div>
            </div>
          </div>

          <nav class="px-3 flex-1 min-h-0 overflow-y-auto">
            <div class="space-y-2">
              <NuxtLink
                v-for="item in navItems"
                :key="item.name"
                :to="item.link"
                class="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm border transition"
                :class="activeItem?.name === item.name ? 'border-[#6C7CFF]/40 bg-[#6C7CFF]/10' : 'border-transparent hover:border-[#262C45] hover:bg-white/5'"
                @click="handleNavClick">
                <span class="h-9 w-9 rounded-xl border border-[#262C45] bg-white/5 flex items-center justify-center text-[#9AA3C7] flex-shrink-0">
                  {{ item.icon }}
                </span>
                <span class="font-medium">{{ item.name }}</span>
              </NuxtLink>
            </div>
          </nav>

          <div class="mt-auto p-6 space-y-3 border-t border-[#262C45]">
            <NuxtLink
              v-if="!loggedIn"
              to="/auth/login"
              class="block w-full rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-sm text-center font-medium hover:bg-white/10 transition"
              @click="closeMobile">
              Log In
            </NuxtLink>

            <NuxtLink
              v-if="!loggedIn"
              to="/auth/register"
              class="block w-full rounded-xl bg-gradient-to-r from-[#6C7CFF] to-[#8A95FF] px-4 py-3 text-sm text-center font-medium hover:shadow-[0_0_24px_6px_rgba(108,124,255,0.35)] transition text-white"
              @click="closeMobile">
              Sign Up
            </NuxtLink>

            <NuxtLink
              v-else
              to="/profile"
              class="block w-full rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-sm text-center font-medium hover:bg-white/10 transition"
              @click="closeMobile">
              Profile
            </NuxtLink>

            <button
              v-if="loggedIn"
              @click="logout"
              class="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 transition">
              Logout
            </button>
          </div>
        </aside>
      </Transition>
    </div>
  </Teleport>
</template>
