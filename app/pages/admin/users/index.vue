<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { formatDateDdMmYy } from "~~/shared/utils";
import type { User } from "~~/shared/types/user";

useSeoMeta({
  title: "Admin Users Catalog",
  ogTitle: "Admin Users Catalog",
  description: "Browse and manage IT users to improve your skills.",
  ogDescription: "A platform with interactive users for developers.",
});

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const page = ref(1);
const limit = ref(10);

const sortBy = ref<"level" | "last_visit_date" | "created_at">("created_at");
const sortDir = ref<"desc" | "asc">("desc");

const roleFilter = ref<"all" | "admin" | "user">("all");
const roleQuery = computed(() => (roleFilter.value === "all" ? "" : roleFilter.value));

const sortByOptions = [
  { value: "created_at", label: "Registration date" },
  { value: "last_visit_date", label: "Last visit" },
  { value: "level", label: "Level" },
];

const searchInput = ref("");
const search = ref("");

watch([sortBy, sortDir], () => {
  page.value = 1;
});

watch(roleFilter, () => {
  page.value = 1;
});

type AdminUsersResponse = {
  users: User[];
  total: number;
  page: number;
  limit: number;
};

type AdminUserByIdResponse = {
  user: Partial<User>;
  testCount?: number;
};

const { data, pending, refresh } = await useFetch<AdminUsersResponse>("/api/admin/users", {
  query: { page, limit, search, sortBy, sortDir, role: roleQuery },
});

const { push } = useToast();
const { downloadFile, pending: downloadPending } = useExport();
const { toggleSidebar } = useSidebar();

const users = computed<User[]>(() => data.value?.users ?? []);
const total = computed(() => Number(data.value?.total ?? 0));
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const canPrev = computed(() => page.value > 1);
const canNext = computed(() => page.value < totalPages.value);

const showingStart = computed(() => {
  if (total.value === 0) return 0;
  return (page.value - 1) * limit.value + 1;
});

const showingEnd = computed(() => {
  if (total.value === 0) return 0;
  return Math.min(page.value * limit.value, total.value);
});

const goPrev = () => {
  if (canPrev.value) page.value -= 1;
};

const goNext = () => {
  if (canNext.value) page.value += 1;
};

const isUserInfoOpen = ref(false);
const selectedUser = ref<Partial<User> | null>(null);

const prevBodyOverflow = ref<string | null>(null);

const openUserInfo = async (u: { id: number }) => {
  try {
    const res = await $fetch<AdminUserByIdResponse>(`/api/admin/users/${u.id}`);
    selectedUser.value = {
      ...res.user,
      count_completed_tests: res.testCount ?? res.user?.count_completed_tests,
    };

    isUserInfoOpen.value = true;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
  }
};

const closeUserInfo = () => {
  isUserInfoOpen.value = false;
  selectedUser.value = null;
};

watch(search, () => {
  if (isUserInfoOpen.value) closeUserInfo();
});

watch(roleFilter, () => {
  if (isUserInfoOpen.value) closeUserInfo();
});

watch([sortBy, sortDir], () => {
  if (isUserInfoOpen.value) closeUserInfo();
});

const setRole = (value: "all" | "admin" | "user") => {
  roleFilter.value = value;
};

const handleSearch = () => {
  page.value = 1;
  search.value = searchInput.value.trim();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    handleSearch();
  }
};

const onChangeRole = async (payload: { userId?: number; role: User["role"] }) => {
  const oldRole = selectedUser.value?.role;

  if (selectedUser.value) {
    selectedUser.value.role = payload.role;
  }

  try {
    await $fetch(`/api/admin/users/${payload.userId}`, {
      method: "PATCH",
      body: { role: payload.role },
    });

    await refresh();
  } catch (error) {
    if (selectedUser.value) selectedUser.value.role = oldRole;
    console.error("Failed to update user role:", error);
    push({ title: "Error", description: "Failed to update user role", variant: "error", duration: 4000 });
  }
};

const deleteUser = async (userId: number) => {
  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });

    push({ title: "Success", description: "User deleted successfully", variant: "success", duration: 4000 });
    closeUserInfo();
    refresh();
  } catch (error) {
    console.error("Failed to delete user:", error);
    push({ title: "Error", description: "Failed to delete user", variant: "error", duration: 4000 });
  }
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") closeUserInfo();
};

const handleDownloadExcel = async () => {
  try {
    await downloadFile("/api/admin/users/export/users.xlsx", "users.xlsx");
  } catch (error) {
    console.error("Failed to download Excel:", error);
    push({ title: "Error", description: "Failed to download Excel file", variant: "info", duration: 4000 });
  }
};

watch(
  isUserInfoOpen,
  (open) => {
    if (typeof document === "undefined") return;

    if (open) {
      if (prevBodyOverflow.value === null) {
        prevBodyOverflow.value = document.body.style.overflow || "";
      }
      document.body.style.overflow = "hidden";
      return;
    }

    if (prevBodyOverflow.value !== null) {
      document.body.style.overflow = prevBodyOverflow.value;
      prevBodyOverflow.value = null;
    }
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);

  if (typeof document !== "undefined" && prevBodyOverflow.value !== null) {
    document.body.style.overflow = prevBodyOverflow.value;
    prevBodyOverflow.value = null;
  }
});
</script>

<template>
  <main class="p-6 max-[725px]:p-3">
    <div class="rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] overflow-hidden">
      <div class="p-5 max-[725px]:p-3 border-b border-[#262C45]">
        <div class="flex flex-row max-[725px]:flex-col items-start justify-between gap-4">
          <div class="flex gap-4 items-center">
            <button
              type="button"
              class="rounded-xl border border-[#262C45] bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition flex-shrink-0"
              aria-label="Toggle menu"
              @click="toggleSidebar">
              ☰
            </button>
            <div class="min-w-0">
              <p class="text-sm font-semibold">Users</p>
              <p class="text-xs text-[#9AA3C7] mt-1">Search by name/email. Filter by role, verification and status.</p>
            </div>
          </div>
          <button
            :disabled="downloadPending"
            @click="handleDownloadExcel"
            class="rounded-xl border border-[#262C45] bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition w-auto max-[725px]:w-full">
            {{ downloadPending ? "Exporting..." : "Export Excel" }}
          </button>
        </div>

        <div class="mt-4 w-full gap-3 relative">
          <Icon name="material-symbols:search-check-2-outline" class="absolute left-3 top-[16px] text-[#9AA3C7]" />
          <input
            v-model="searchInput"
            class="w-full rounded-xl border border-[#262C45] bg-white/5 pl-9 pr-24 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition"
            placeholder="Search users…"
            @keydown="handleKeyDown" />
          <button
            @click="handleSearch"
            type="button"
            class="absolute right-1 top-1 px-3 py-2 rounded-lg bg-gradient-to-r from-[#6C7CFF] to-[#8A95FF] text-white font-medium text-sm hover:shadow-[0_0_18px_4px_rgba(108,124,255,0.3)] transition">
            <span class="hidden sm:inline">Search</span>
            <Icon name="material-symbols:search" class="sm:hidden w-4 h-4" />
          </button>
        </div>

        <div class="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <div class="w-full sm:w-auto">
            <AppSelect v-model="sortBy" :options="sortByOptions" />
          </div>

          <button
            type="button"
            class="h-11 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm hover:bg-white/10 transition w-full sm:w-auto"
            @click="sortDir = sortDir === 'desc' ? 'asc' : 'desc'">
            <span class="hidden sm:inline">{{ sortDir === "desc" ? "DESC" : "ASC" }}</span>
            <span class="sm:hidden">Sort: {{ sortDir === "desc" ? "↓ DESC" : "↑ ASC" }}</span>
          </button>
        </div>

        <div class="mt-4 grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
          <button
            type="button"
            @click="setRole('all')"
            class="text-xs px-3 py-2 sm:py-1.5 rounded-full border transition text-center"
            :class="
              roleFilter === 'all' ? 'border-[#6C7CFF]/35 bg-[#6C7CFF]/10 text-[#6C7CFF]' : 'border-[#262C45] bg-white/5 text-[#9AA3C7] hover:bg-white/10'
            ">
            All
          </button>
          <button
            type="button"
            @click="setRole('admin')"
            class="text-xs px-3 py-2 sm:py-1.5 rounded-full border transition text-center"
            :class="
              roleFilter === 'admin' ? 'border-[#6C7CFF]/35 bg-[#6C7CFF]/10 text-[#6C7CFF]' : 'border-[#262C45] bg-white/5 text-[#9AA3C7] hover:bg-white/10'
            ">
            Admins
          </button>
          <button
            type="button"
            @click="setRole('user')"
            class="text-xs px-3 py-2 sm:py-1.5 rounded-full border transition text-center"
            :class="
              roleFilter === 'user' ? 'border-[#6C7CFF]/35 bg-[#6C7CFF]/10 text-[#6C7CFF]' : 'border-[#262C45] bg-white/5 text-[#9AA3C7] hover:bg-white/10'
            ">
            Users
          </button>
        </div>
      </div>

      <div class="grid grid-cols-[1.2fr_.8fr_.7fr_.7fr_.6fr] max-[725px]:hidden gap-4 px-5 py-3 text-[11px] text-[#9AA3C7] border-b border-[#262C45]">
        <span>User</span>
        <span>Role</span>
        <span>Level</span>
        <span>Last visit</span>
        <span class="text-right">Actions</span>
      </div>

      <div class="divide-y divide-[#262C45]">
        <div v-if="pending" class="px-5 py-10 text-center text-sm text-[#9AA3C7]">Loading users…</div>
        <div v-else-if="users.length === 0" class="px-5 py-10 text-center text-sm text-[#9AA3C7]">No users found.</div>

        <article
          v-else
          v-for="u in users"
          :key="u.id"
          class="px-5 max-[725px]:px-3 py-4 grid grid-cols-[1.2fr_.8fr_.7fr_.7fr_.6fr] max-[725px]:grid-cols-1 gap-4 max-[725px]:gap-3 items-center max-[725px]:items-start hover:bg-white/5 transition">
          <div class="flex items-start gap-3 min-w-0">
            <div
              class="h-12 w-12 flex-shrink-0 rounded-2xl border border-[#262C45] bg-white/5 flex items-center justify-center font-semibold text-base"
              :class="u.role === 'admin' ? 'bg-[#6C7CFF]/20 text-[#6C7CFF]' : ''">
              <img v-if="u.avatar_url" :src="u.avatar_url" alt="Avatar" class="h-full w-full object-cover rounded-2xl" />
              <span v-else>{{ (u.name?.[0] || u.email?.[0] || "?").toUpperCase() }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold truncate text-base">{{ u.name || "Unnamed" }}</p>
              <p class="text-xs text-[#9AA3C7] truncate">{{ u.email }}</p>
              <div class="mt-2 flex flex-wrap gap-2 hidden max-[725px]:flex">
                <span class="text-[11px] px-2 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">{{ u.role }}</span>
                <span v-if="u.level" class="text-[11px] px-2 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">{{ u.level }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 max-[725px]:hidden">
            <span
              class="text-[11px] px-2.5 py-1 rounded-full border bg-white/5"
              :class="u.role === 'admin' ? 'border-[#6C7CFF]/35 text-[#6C7CFF]' : 'border-[#262C45] text-[#9AA3C7]'">
              {{ u.role }}
            </span>
          </div>

          <div class="flex items-center gap-2 max-[725px]:hidden">
            <span class="text-[11px] px-2.5 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">{{ u.level || "—" }}</span>
          </div>

          <div class="text-sm text-[#9AA3C7] block max-[725px]:hidden">
            {{ u.last_visit_date ? formatDateDdMmYy(u.last_visit_date) : "—" }}
          </div>

          <div class="flex items-center gap-2 justify-end max-[725px]:justify-start">
            <button
              class="h-9 rounded-xl border border-[#262C45] bg-white/5 px-3 text-xs hover:bg-white/10 transition w-auto max-[725px]:w-full"
              @click="openUserInfo(u)">
              View
            </button>
          </div>
        </article>
      </div>

      <div
        class="pt-2 flex flex-row max-[725px]:flex-col items-center max-[725px]:items-stretch justify-between px-5 max-[725px]:px-3 py-4 gap-3 text-xs text-[#9AA3C7] border-t border-[#262C45]">
        <p class="text-xs text-[#9AA3C7] text-left max-[725px]:text-center">Showing {{ showingStart }}-{{ showingEnd }} of {{ total }}</p>
        <div class="flex items-center gap-2 justify-end max-[725px]:justify-center">
          <button
            class="rounded-xl border border-[#262C45] bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition disabled:opacity-60"
            :disabled="!canPrev"
            @click="goPrev">
            Prev
          </button>
          <button
            class="rounded-xl border border-[#262C45] bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition disabled:opacity-60"
            :disabled="!canNext"
            @click="goNext">
            Next
          </button>
        </div>
      </div>
    </div>
  </main>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isUserInfoOpen" class="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" @click.self="closeUserInfo" />
    </Transition>

    <Transition
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="opacity-0 translate-x-6"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-6">
      <div v-if="isUserInfoOpen" class="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] p-6">
        <AdminUserInfo :user="selectedUser" @close="closeUserInfo" @change-role="onChangeRole" @delete-user="deleteUser" />
      </div>
    </Transition>
  </Teleport>
</template>
