<script setup lang="ts">
import { computed, ref } from "vue";
import type { Category } from "~~/shared/types/category";

const PAGE_SIZE = 6;

const { data: initialCategories, pending } = await useFetch<Category[]>("/api/categories", {
  query: { limit: PAGE_SIZE, offset: 0 },
  default: () => [],
});

const categories = ref<Category[]>(initialCategories.value ?? []);
const lastBatchSize = ref(categories.value.length);
const isLoadingMore = ref(false);

const hasMore = computed(() => lastBatchSize.value === PAGE_SIZE);

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return;

  isLoadingMore.value = true;
  try {
    const next = await $fetch<Category[]>("/api/categories", {
      query: { limit: PAGE_SIZE, offset: categories.value.length },
    });

    categories.value = categories.value.concat(next);
    lastBatchSize.value = next.length;
  } finally {
    isLoadingMore.value = false;
  }
};
</script>

<template>
  <main>
    <AppLoader v-if="pending" />
    <section v-else class="max-w-7xl mx-auto px-6 py-24">
      <div class="mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h2 class="text-3xl font-semibold mb-2">Areas of study</h2>
          <p class="text-[#9AA3C7] max-w-xl">Choose a direction and start taking tests grouped by level and technologies.</p>
        </div>
      </div>

      <div class="space-y-6">
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
          <div class="lg:col-span-3 max-w-md">
            <h3 class="text-xl font-semibold">{{ category.title }}</h3>
            <p class="text-sm text-[#9AA3C7] mt-2 line-clamp-2">
              {{ category.description }}
            </p>
          </div>
          <div class="lg:col-span-6 flex flex-wrap gap-3">
            <span
              class="px-3 h-8 text-xs rounded-full bg-[#6C7CFF]/20 text-[#6C7CFF] flex justify-center items-center uppercase"
              v-for="tag in category.technologies"
              :key="tag"
              >{{ tag }}</span
            >
          </div>
          <div class="lg:col-span-3 flex items-center justify-between">
            <span class="text-[#9AA3C7] text-sm">{{ category.tests_count }} tests</span>
            <RouterLink :to="`/tests?category=${encodeURIComponent(category.title)}`" class="btn">Go</RouterLink>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="pt-12 flex justify-center">
        <button
          class="px-8 py-3 rounded-xl border border-[#262C45] text-[#9AA3C7] hover:text-white hover:border-[#6C7CFF] hover:bg-[#6C7CFF]/10 transition"
          :disabled="pending || isLoadingMore"
          @click="loadMore">
          {{ isLoadingMore ? "Loading..." : "Load more" }}
        </button>
      </div>
    </section>
  </main>
</template>
