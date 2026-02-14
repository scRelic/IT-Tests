<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { formatDateTime } from "~~/shared/utils";
import type { User } from "~~/shared/types/user";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const page = ref(1);
const limit = ref(10);

const sortBy = ref<"level" | "last_visit_date" | "created_at">("created_at");
const sortDir = ref<"desc" | "asc">("desc");

const roleFilter = ref<"all" | "admin" | "user" | "banned">("all");
const roleQuery = computed(() => (roleFilter.value === "all" ? "" : roleFilter.value));

const sortByOptions = [
  { value: "created_at", label: "Registration date" },
  { value: "last_visit_date", label: "Last visit" },
  { value: "level", label: "Level" },
];

const searchInput = ref("");
const search = ref("");
const searchDebounceMs = 350;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

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

const setRole = (value: "all" | "admin" | "user" | "banned") => {
  roleFilter.value = value;
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

watch(searchInput, (newVal) => {
  const trimmed = newVal.trim();
  if (trimmed === search.value) return;

  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    search.value = trimmed;
  }, searchDebounceMs);
});

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);

  if (searchTimer) clearTimeout(searchTimer);

  if (typeof document !== "undefined" && prevBodyOverflow.value !== null) {
    document.body.style.overflow = prevBodyOverflow.value;
    prevBodyOverflow.value = null;
  }
});
</script>

<template>
  <div class="px-6">
    <div class="flex justify-between gap-4 my-6">
      <div>
        <h2 class="text-2xl font-semibold">Users</h2>
      </div>
      <div class="flex items-center gap-2">
        <button class="rounded-xl border border-[#262C45] bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition">Export</button>
      </div>
    </div>
  </div>

  <section class="gap-6 px-6">
    <div class="rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] overflow-hidden">
      <div class="p-5 border-b border-[#262C45]">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p class="text-sm font-semibold">Accounts</p>
            <p class="text-xs text-[#9AA3C7] mt-1">Search by name/email. Filter by role, verification and status.</p>
          </div>
          <!-- 
          <div class="flex items-center gap-2">
            <button class="h-9 rounded-xl border border-[#262C45] bg-white/5 px-3 text-xs hover:bg-white/10 transition">Filters</button>
            <button class="h-9 rounded-xl border border-[#262C45] bg-white/5 px-3 text-xs hover:bg-white/10 transition">Sort</button>
          </div> -->
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <label class="relative">
            <Icon name="material-symbols:search-check-2-outline" class="absolute left-3 top-[16px] text-[#9AA3C7]" />
            <input
              v-model="searchInput"
              class="w-full h-11 rounded-xl border border-[#262C45] bg-white/5 pl-9 pr-3 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition"
              placeholder="Search users…" />
          </label>
        </div>

        <div class="mt-3 flex flex-col md:flex-row md:items-center gap-2">
          <AppSelect v-model="sortBy" :options="sortByOptions" />

          <button
            type="button"
            class="h-11 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm hover:bg-white/10 transition"
            @click="sortDir = sortDir === 'desc' ? 'asc' : 'desc'">
            {{ sortDir === "desc" ? "DESC" : "ASC" }}
          </button>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            @click="setRole('all')"
            class="text-xs px-3 py-1.5 rounded-full border transition"
            :class="
              roleFilter === 'all' ? 'border-[#6C7CFF]/35 bg-[#6C7CFF]/10 text-[#6C7CFF]' : 'border-[#262C45] bg-white/5 text-[#9AA3C7] hover:bg-white/10'
            ">
            All
          </button>
          <button
            type="button"
            @click="setRole('admin')"
            class="text-xs px-3 py-1.5 rounded-full border transition"
            :class="
              roleFilter === 'admin' ? 'border-[#6C7CFF]/35 bg-[#6C7CFF]/10 text-[#6C7CFF]' : 'border-[#262C45] bg-white/5 text-[#9AA3C7] hover:bg-white/10'
            ">
            Admins
          </button>
          <button
            type="button"
            @click="setRole('user')"
            class="text-xs px-3 py-1.5 rounded-full border transition"
            :class="
              roleFilter === 'user' ? 'border-[#6C7CFF]/35 bg-[#6C7CFF]/10 text-[#6C7CFF]' : 'border-[#262C45] bg-white/5 text-[#9AA3C7] hover:bg-white/10'
            ">
            Users
          </button>
          <button
            type="button"
            @click="setRole('banned')"
            class="text-xs px-3 py-1.5 rounded-full border transition"
            :class="
              roleFilter === 'banned' ? 'border-rose-500/25 bg-rose-500/10 text-rose-300' : 'border-rose-500/25 bg-rose-500/10 text-rose-300 hover:opacity-90'
            ">
            Banned
          </button>
        </div>
      </div>

      <div class="hidden lg:grid grid-cols-[1.2fr_.8fr_.7fr_.7fr_.6fr] gap-4 px-5 py-3 text-[11px] text-[#9AA3C7] border-b border-[#262C45]">
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
          class="px-5 py-4 grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr_.7fr_.7fr_.6fr] gap-4 lg:items-center hover:bg-white/5 transition">
          <div class="flex items-start gap-3 min-w-0">
            <div
              class="h-11 w-11 rounded-2xl border border-[#262C45] bg-white/5 flex items-center justify-center font-semibold"
              :class="u.role === 'admin' ? 'bg-[#6C7CFF]/20 text-[#6C7CFF]' : ''">
              <img v-if="u.avatar_url" :src="u.avatar_url" alt="Avatar" class="h-full w-full object-cover rounded-2xl" />
              <span v-else>{{ (u.name?.[0] || u.email?.[0] || "?").toUpperCase() }}</span>
            </div>
            <div class="min-w-0">
              <p class="font-semibold truncate">{{ u.name || "Unnamed" }}</p>
              <p class="text-xs text-[#9AA3C7] truncate">{{ u.email }}</p>
              <div class="mt-2 flex flex-wrap gap-2 lg:hidden">
                <span class="text-[11px] px-2 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">{{ u.role }}</span>
                <span v-if="u.level" class="text-[11px] px-2 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">{{ u.level }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              class="text-[11px] px-2.5 py-1 rounded-full border bg-white/5"
              :class="u.role === 'admin' ? 'border-[#6C7CFF]/35 text-[#6C7CFF]' : 'border-[#262C45] text-[#9AA3C7]'">
              {{ u.role }}
            </span>
          </div>

          <div class="hidden lg:flex items-center gap-2">
            <span class="text-[11px] px-2.5 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">{{ u.level || "—" }}</span>
          </div>

          <div class="text-sm text-[#9AA3C7]">
            {{ u.last_visit_date ? formatDateTime(u.last_visit_date) : "—" }}
          </div>

          <div class="flex items-center gap-2 lg:justify-end">
            <button class="h-9 rounded-xl border border-[#262C45] bg-white/5 px-3 text-xs hover:bg-white/10 transition" @click="openUserInfo(u)">View</button>
          </div>
        </article>
      </div>

      <div class="pt-2 flex items-center justify-between px-5 py-4 text-xs text-[#9AA3C7] border-t border-[#262C45]">
        <p class="text-xs text-[#9AA3C7]">Showing {{ showingStart }}-{{ showingEnd }} of {{ total }}</p>
        <div class="flex items-center gap-2">
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
  </section>

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
      <div v-if="isUserInfoOpen" class="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] p-4 sm:p-6">
        <AdminUserInfo :user="selectedUser" @close="closeUserInfo" @change-role="onChangeRole" @delete-user="deleteUser" />
      </div>
    </Transition>
  </Teleport>
</template>
