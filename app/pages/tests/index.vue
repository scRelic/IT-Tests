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

const tests = computed(() => data.value?.tests ?? []);
const total = computed(() => data.value?.total ?? 0);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));

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
