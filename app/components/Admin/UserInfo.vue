<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { User } from "~~/shared/types/user";
import { formatDateTime, formatDateDdMmYy } from "~~/shared/utils";

const props = defineProps<{
  user: Partial<User> | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "change-role", payload: { userId?: number; role: User["role"] }): void;
  (e: "delete-user", userId: number): void;
}>();

const role = computed(() => props.user?.role ?? "user");

const isRoleMenuOpen = ref(false);
const roleDraft = ref<"admin" | "user">("user");

const stats = ref([
  { label: "Completed tests", value: props.user?.count_completed_tests ?? "—" },
  { label: "Streak", value: props.user?.current_streak ?? "—" },
  { label: "Level", value: props.user?.level ?? "—" },
  { label: "Exp", value: props.user?.exp ?? "—" },
  { label: "Last visit", value: props.user?.last_visit_date ? formatDateTime(props.user.last_visit_date) : "—" },
  { label: "Date of birth", value: props.user?.birth_date ? formatDateDdMmYy(props.user.birth_date) : "—" },
  { label: "Registered", value: props.user?.created_at ? formatDateTime(props.user.created_at) : "—" },
  { label: "Role", value: props.user?.role ?? "—" },
]);

watch(
  () => props.user?.role,
  (newRole) => {
    roleDraft.value = (newRole === "admin" ? "admin" : "user") as "admin" | "user";
  },
  { immediate: true },
);

const openRoleMenu = () => {
  isRoleMenuOpen.value = true;
};

const closeRoleMenu = () => {
  isRoleMenuOpen.value = false;
};

const saveRole = () => {
  emit("change-role", { userId: props.user?.id, role: roleDraft.value as User["role"] });
  closeRoleMenu();
};
</script>

<template>
  <aside class="h-full rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] overflow-hidden">
    <div class="p-5 border-b border-[#262C45] flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold">User details</p>
        <p class="text-xs text-[#9AA3C7] mt-1">Quick actions & security overview.</p>
      </div>
      <button type="button" class="h-9 rounded-xl border border-[#262C45] bg-white/5 px-3 text-xs hover:bg-white/10 transition" @click="emit('close')">
        Close
      </button>
    </div>

    <div class="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-80px)]">
      <div class="flex items-start gap-3">
        <div
          class="h-11 w-11 rounded-2xl border border-[#262C45] bg-white/5 flex items-center justify-center font-semibold"
          :class="user?.role === 'admin' ? 'bg-[#6C7CFF]/20 text-[#6C7CFF]' : ''">
          <img v-if="user?.avatar_url" :src="user.avatar_url" alt="Avatar" class="h-full w-full object-cover rounded-2xl" />
          <span v-else>{{ (user?.name?.[0] || user?.email?.[0] || "?").toUpperCase() }}</span>
        </div>
        <div class="min-w-0">
          <p class="font-semibold truncate">{{ user?.name || "Unnamed" }}</p>
          <p class="text-xs text-[#9AA3C7] truncate">{{ user?.email || "—" }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-[#262C45] bg-white/5 p-2" v-for="stat in stats" :key="stat.label">
          <p class="text-xs text-[#9AA3C7]">{{ stat.label }}</p>
          <p class="text-xs font-semibold mt-1">{{ stat.value }}</p>
        </div>
      </div>

      <div class="rounded-xl border border-[#262C45] bg-white/5 p-4 h-full">
        <p class="text-sm font-semibold">Actions</p>
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
          <button
            type="button"
            class="h-10 rounded-xl border border-[#262C45] bg-white/5 text-sm hover:bg-white/10 transition"
            @click="isRoleMenuOpen ? closeRoleMenu() : openRoleMenu()">
            Change role
          </button>

          <button class="h-10 rounded-xl border border-orange-500/25 bg-orange-500/10 text-sm text-orange-300 hover:opacity-90 transition">Ban user</button>
          <button
            @click="emit('delete-user', user?.id!)"
            class="h-10 rounded-xl border border-rose-500/25 bg-rose-500/10 text-sm text-rose-300 hover:opacity-90 transition">
            Delete user
          </button>
        </div>
      </div>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-120 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1">
        <div v-if="isRoleMenuOpen" class="w-full rounded-2xl border border-[#262C45] bg-[#25293C] backdrop-blur overflow-hidden shadow-2xl">
          <div class="px-4 py-3 border-b border-[#262C45]">
            <p class="text-sm font-semibold">Change role</p>
            <p class="text-xs text-[#9AA3C7] mt-1">
              Current: <span class="text-white uppercase">{{ role }}</span>
            </p>
          </div>

          <div class="p-3 space-y-2">
            <button
              type="button"
              class="w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm transition"
              :class="roleDraft === 'user' ? 'border-[#6C7CFF]/40 bg-[#6C7CFF]/10' : 'border-[#262C45] bg-white/5 hover:bg-white/10'"
              @click="roleDraft = 'user'">
              <span>User</span>
              <span class="text-xs text-[#9AA3C7]">Default access</span>
            </button>

            <button
              type="button"
              class="w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm transition"
              :class="roleDraft === 'admin' ? 'border-[#6C7CFF]/40 bg-[#6C7CFF]/10' : 'border-[#262C45] bg-white/5 hover:bg-white/10'"
              @click="roleDraft = 'admin'">
              <span>Admin</span>
              <span class="text-xs text-[#9AA3C7]">Full access</span>
            </button>
          </div>

          <div class="px-4 py-3 border-t border-[#262C45] flex items-center justify-end gap-2">
            <button type="button" class="h-9 rounded-xl border border-[#262C45] bg-white/5 px-3 text-xs hover:bg-white/10 transition" @click="closeRoleMenu">
              Cancel
            </button>
            <button
              type="button"
              class="h-9 rounded-xl px-3 text-xs font-semibold bg-[#6C7CFF] hover:opacity-90 transition disabled:opacity-60"
              :disabled="roleDraft === role"
              @click="saveRole">
              Save
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </aside>
</template>
