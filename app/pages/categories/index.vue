<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import type { Category } from "~~/shared/types/category";

const PAGE_SIZE = 6;

const searchInput = ref("");
const search = ref("");
const isSearching = ref(false);
const searchDebounceMs = 350;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});

const {
  data: initialCategories,
  pending,
  error,
  refresh,
} = await useFetch<Category[]>("/api/categories", {
  query: { limit: PAGE_SIZE, offset: 0, search },
  default: () => [],
});

const categories = ref<Category[]>(initialCategories.value ?? []);
const lastBatchSize = ref(categories.value.length);
const isLoadingMore = ref(false);

const hasMore = computed(() => lastBatchSize.value === PAGE_SIZE);

const reloadCategories = async () => {
  if (isSearching.value) return;

  isSearching.value = true;
  try {
    const next = await $fetch<Category[]>("/api/categories", {
      query: { limit: PAGE_SIZE, offset: 0, search: search.value },
    });

    categories.value = next;
    lastBatchSize.value = next.length;
  } finally {
    isSearching.value = false;
  }
};

const loadMore = async () => {
  if (isLoadingMore.value || isSearching.value || !hasMore.value) return;

  isLoadingMore.value = true;
  try {
    const next = await $fetch<Category[]>("/api/categories", {
      query: { limit: PAGE_SIZE, offset: categories.value.length, search: search.value },
    });

    categories.value = categories.value.concat(next);
    lastBatchSize.value = next.length;
  } finally {
    isLoadingMore.value = false;
  }
};

watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);

  searchTimer = setTimeout(async () => {
    search.value = value.trim();
    await reloadCategories();
  }, searchDebounceMs);
});
</script>

<template>
  <main>
    <AppLoader v-if="pending || isSearching" />

    <section v-else class="max-w-7xl mx-auto px-6 py-24">
      <div class="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h2 class="text-3xl font-semibold mb-2">Areas of study</h2>
          <p class="text-[#9AA3C7] max-w-xl">Choose a direction and start taking tests grouped by level and technologies.</p>
        </div>
        <label class="relative w-full lg:w-[420px]">
          <Icon name="material-symbols:search-check-2-outline" class="absolute left-3 top-[16px] text-[#9AA3C7]" />
          <input
            v-model="searchInput"
            class="w-full rounded-xl border border-[#262C45] bg-white/5 pl-9 pr-3 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition"
            placeholder="Search categories…" />
        </label>
      </div>

      <div class="space-y-6" v-if="categories.length">
        <div
          v-for="(category, index) in categories"
          :key="category.id"
          v-motion
          :initial="{ opacity: 0, x: -50 }"
          :enter="{
            opacity: 1,
            x: 0,
            transition: {
              delay: index * 100,
              type: 'spring',
              stiffness: 250,
            },
          }"
          class="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#1B2033] border border-[#262C45] rounded-2xl p-6">
          <div class="lg:col-span-9">
            <h3 class="text-xl font-semibold">{{ category.title }}</h3>
            <p class="text-sm text-[#9AA3C7] mt-2">
              {{ category.description }}
            </p>

            <div class="mt-4 flex flex-wrap gap-3" v-if="(category.technologies || []).length">
              <span
                class="px-3 h-8 text-xs rounded-full bg-[#6C7CFF]/20 text-[#6C7CFF] flex justify-center items-center uppercase"
                v-for="tag in category.technologies || []"
                :key="tag"
                >{{ tag }}</span
              >
            </div>
          </div>
          <div class="lg:col-span-3 flex items-center justify-between lg:justify-end lg:gap-4">
            <span class="text-[#9AA3C7] text-sm">{{ category.tests_count }} tests</span>
            <RouterLink :to="`/tests?category=${encodeURIComponent(category.title)}`" class="btn">Go</RouterLink>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-sm text-red-400 text-center border border-red-400 p-4 rounded-xl">
        <span>Failed to load categories.</span>
        <button class="underline ml-2" @click="refresh()">Retry</button>
      </div>

      <div v-else-if="!categories.length" class="text-sm text-slate-500 text-center mt-10">No categories found.</div>

      <div v-if="hasMore" class="pt-12 flex justify-center">
        <button
          class="px-8 py-3 rounded-xl border border-[#262C45] text-[#9AA3C7] hover:text-white hover:border-[#6C7CFF] hover:bg-[#6C7CFF]/10 transition"
          :disabled="pending || isLoadingMore || isSearching"
          @click="loadMore">
          {{ isLoadingMore ? "Loading..." : "Load more" }}
        </button>
      </div>
    </section>
  </main>
</template>
