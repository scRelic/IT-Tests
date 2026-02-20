<script setup>
import { ref, computed, watch } from "vue";

const route = useRoute();

const category = ref(route.query.category || "All");
const sort = ref("random");
const page = ref(1);
const pageSize = 15;

const { data: categoriesData } = await useFetch("/api/categories", {
  query: { limit: 1000, offset: 0 },
  default: () => [],
});

const categoriesOptions = computed(() => {
  const categories = Array.isArray(categoriesData.value) ? categoriesData.value : [];
  return [{ value: "All", label: "All Categories" }, ...categories.map((c) => ({ value: c.title, label: c.title }))];
});

const sortOptions = [
  { value: "random", label: "Random" },
  { value: "new", label: "Newest" },
  { value: "old", label: "Oldest" },
  { value: "most", label: "Most Questions" },
  { value: "fewest", label: "Fewest Questions" },
];

const filters = computed(() => ({
  category: category.value !== "All" ? category.value : undefined,
  sort: sort.value !== "random" ? sort.value : "random",
  limit: pageSize,
  page: page.value,
}));

const { data, pending } = useTest(filters);

const { data: activeSessionData } = await useFetch("/api/me/active-test-session", {
  key: "me-active-test-session",
  default: () => ({ hasActiveSession: false, testId: null, testTitle: null }),
});

const tests = computed(() => data.value?.tests ?? []);
const total = computed(() => data.value?.total ?? 0);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const activeSession = computed(() => {
  if (!activeSessionData.value?.hasActiveSession || !activeSessionData.value?.testId) return null;
  return {
    testId: Number(activeSessionData.value.testId),
    testTitle: activeSessionData.value.testTitle || null,
  };
});

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++;
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
  }
};

watch([category, sort], () => {
  page.value = 1;
});
</script>

<template>
  <main>
    <AppLoader v-if="pending" />
    <section v-else class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="text-3xl font-semibold mb-10">Test catalog</h2>

      <div
        v-if="activeSession"
        class="mb-6 rounded-2xl border border-yellow-600/40 bg-[#1B2033] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-[#9AA3C7]">You have an active test session</p>
          <p class="text-base font-medium">{{ activeSession.testTitle || `Test #${activeSession.testId}` }}</p>
        </div>
        <NuxtLink
          :to="`/tests/${activeSession.testId}`"
          class="inline-flex items-center justify-center rounded-xl bg-yellow-600 px-4 py-2 text-sm font-semibold hover:bg-yellow-500 transition-colors duration-200">
          Continue test
        </NuxtLink>
      </div>

      <div class="flex flex-wrap gap-4 mb-10">
        <FilterBlock v-model="category" :options="categoriesOptions" placeholder="Category" />
        <FilterBlock v-model="sort" :options="sortOptions" placeholder="Sort" />
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" v-if="tests.length > 0">
        <AppCardTest v-for="test in tests" :key="test.id" :test="test" />
      </div>
      <p v-else class="text-sm text-[#9AA3C7] text-center">No tests found.</p>

      <AppPagination :page="page" :totalPages="totalPages" :pending="pending" @next="nextPage" @prev="prevPage" />
    </section>
  </main>
</template>
