<script setup lang="ts">
import { computed, ref } from "vue";

const filterOptions = [
  { value: "All time", label: "All time" },
  { value: "This month", label: "This month" },
  { value: "This week", label: "This week" },
];

const filter = ref("All time");
const medals = ["🥇", "🥈", "🥉"];

const {
  data: leaderboardData,
  pending: isLoading,
  error,
} = useFetch("/api/leaderboards", {
  method: "GET",
  query: computed(() => ({ filter: filter.value })),
  default: () => [],
});

const topThree = computed(() => leaderboardData.value.slice(0, 3));
const restLeaderboard = computed(() => leaderboardData.value.slice(3));

const getInitial = (name?: string) => name?.charAt(0)?.toUpperCase() ?? "?";
</script>

<template>
  <main>
    <AppLoader v-if="isLoading" />

    <section class="max-w-7xl mx-auto px-6 pt-16 max-[1000px]:py-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-semibold mb-2">Top Users</h2>

        <FilterBlock v-model="filter" :options="filterOptions" placeholder="Sort" />
      </div>

      <div class="grid md:grid-cols-3 gap-4 mb-8">
        <div v-for="(user, index) in topThree" :key="user.id" class="bg-[#0b1430] border border-indigo-500/40 rounded-xl p-5 text-center">
          <div class="text-3xl mb-2">{{ medals[index] }}</div>
          <div class="font-semibold text-white">{{ user.name }}</div>
          <div class="mt-1 text-indigo-400 font-semibold text-lg">{{ user.tests_count }} tests</div>
        </div>
      </div>

      <div class="divide-y divide-slate-800">
        <div v-for="(user, index) in restLeaderboard" :key="user.id" class="flex items-center justify-between py-4">
          <div class="flex items-center gap-4">
            <span class="text-slate-500 w-6">{{ index + 4 }}</span>
            <div class="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-semibold text-indigo-300">
              <img v-if="user?.avatar_url" :src="user.avatar_url" alt="Avatar" class="h-full w-full object-cover rounded-full" />
              <span v-else>{{ getInitial(user.name) }}</span>
            </div>
            <div>
              <div class="text-sm font-medium">{{ user.name }}</div>
              <div class="text-xs text-slate-500">Participant</div>
            </div>
          </div>
          <div class="text-indigo-400 font-semibold">{{ user.tests_count }} tests</div>
        </div>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-400">Failed to load leaderboard.</p>
    </section>
  </main>
</template>
