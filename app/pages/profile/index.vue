<script setup lang="ts">
import { computed, ref } from "vue";
import type { EditProfileData } from "~~/shared/types/user";
import type { LastTests } from "~~/shared/types/test";

definePageMeta({ middleware: "auth" });

const { user, pending, fetchUser } = useUser();
const { logout } = useAuth();
const { push } = useToast();
const { nextLevelExp, nextLevel } = useLevel();

const isEdit = ref(false);
const isMoreInfo = ref(false);

const openEdit = () => {
  isEdit.value = true;
};

const saveEdit = async (data: EditProfileData) => {
  try {
    await $fetch("/api/me/update", { method: "PATCH", body: data });
    await fetchUser();

    push({
      title: "Success",
      description: "Profile updated successfully.",
      variant: "info",
      duration: 4000,
    });

    isEdit.value = false;
  } catch (error: any) {
    const message = error?.data?.message || error?.message || "Unknown error";
    push({ title: "Error", description: message, variant: "error", duration: 3000 });
  }
};

const handleAvatarUpdated = async () => {
  await fetchUser();
  push({ title: "Success", description: "Avatar updated successfully.", variant: "info", duration: 3000 });
};

const progressPercent = computed(() => {
  const exp = user.value?.exp ?? 0;
  const max = nextLevelExp.value ?? 0;
  if (max <= 0) return 0;
  return Math.min(100, Math.round((exp / max) * 100));
});

const handleLogout = async () => {
  await logout();
  push({ title: "Success", description: "You have been logged out.", variant: "info", duration: 3000 });
};

const {
  data: testsData,
  pending: testsPending,
  error: testsError,
} = useFetch<LastTests[]>("/api/test-result/last-questions", { method: "GET", key: "last-test-questions", default: () => [] });
</script>

<template>
  <main class="my-8">
    <div class="container">
      <AppLoader v-if="pending" />

      <div v-else>
        <section class="bg-[#1B2033] border border-[#262C45] rounded-2xl p-6 flex justify-between gap-6 items-center mb-6">
          <div class="flex gap-6">
            <div class="w-24 h-24 rounded-2xl bg-[#6C7CFF] flex items-center justify-center text-3xl font-bold overflow-hidden">
              <img v-if="user?.avatar_url" :src="user.avatar_url" alt="Avatar" class="h-full w-full object-cover" />
              <span v-else>{{ (user?.name?.[0] ?? "U").toUpperCase() }}</span>
            </div>

            <div class="flex-1 md:text-left">
              <h1 class="text-2xl font-semibold">{{ user?.name }}</h1>
              <p class="text-[#9AA3C7] text-sm mt-1">{{ user?.email }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button type="button" @click="openEdit" class="w-32 py-2 rounded-lg border border-[#262C45] hover:bg-[#262C45] transition-colors duration-200">
              Edit
            </button>
            <button type="button" @click="handleLogout" class="w-32 py-2 rounded-lg border border-[#262C45] hover:bg-[#262C45] transition-colors duration-200">
              Logout
            </button>
          </div>
        </section>

        <ProfileEditModal
          v-model:isEdit="isEdit"
          :name="user?.name ?? ''"
          :email="user?.email ?? ''"
          :avatar_url="user?.avatar_url"
          :birth_date="user?.birth_date"
          @save="saveEdit"
          @avatar-updated="handleAvatarUpdated" />

        <ProfileMoreInfoModal
          v-model:isMoreInfo="isMoreInfo"
          :exp="user?.exp ?? 0"
          :level="user?.level ?? 'Trainee'"
          :nextLevel="nextLevel"
          :nextLevelExp="nextLevelExp"
          :progressPercent="progressPercent" />

        <ProfileCardsInfo :count_completed_tests="user?.count_completed_tests ?? 0" :created_at="user?.created_at ?? ''" :level="user?.level ?? ''" />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ProfileLevelExpBlock
            :exp="user?.exp ?? 0"
            :level="user?.level ?? 'Trainee'"
            :nextLevel="nextLevel"
            :nextLevelExp="nextLevelExp"
            :progressPercent="progressPercent"
            v-model:isMoreInfo="isMoreInfo" />

          <ProfileLearningStreak :current_streak="user?.current_streak ?? 0" />
        </div>

        <ProfileLastTests :tests="testsData" :loading="testsPending" :error="testsError" />
      </div>
    </div>
  </main>
</template>
