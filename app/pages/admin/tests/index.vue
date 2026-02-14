<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { formatDateTime } from "~~/shared/utils";
import type { Category } from "~~/shared/types/category";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const page = ref(1);
const limit = ref(10);

type CategoriesResponse = {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
};

const searchInput = ref("");
const search = ref("");
const searchDebounceMs = 350;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});

const sortBy = ref<"created_at">("created_at");
const sortDir = ref<"asc" | "desc">("desc");

const categoryFilter = ref<string>("All");

const { data: categoriesData } = await useFetch<CategoriesResponse>("/api/admin/categories", {
  key: "admin-categories-for-tests-list",
  query: { page: 1, limit: 100 },
});

const categoryOptions = computed(() => {
  const categories = categoriesData.value?.categories ?? [];
  return [{ label: "All", value: "All" }, ...categories.map((c) => ({ label: c.title, value: c.title }))];
});

const sortByOptions = [{ label: "Created date", value: "created_at" }];

const toggleSortDir = () => {
  sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
};

const { data, pending, refresh } = await useFetch("/api/admin/tests", {
  key: "admin-tests",
  query: { page, limit, search, sortBy, sortDir, category: categoryFilter },
  default: () => ({ tests: [], total: 0 }),
});

const { push } = useToast();

const tests = computed(() => data.value?.tests ?? []);
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

const deleteTest = async (id: number) => {
  try {
    await $fetch(`/api/admin/tests/${id}`, {
      method: "DELETE",
    });

    push({ title: "Success", description: "Test deleted successfully", variant: "success", duration: 4000 });
    refresh();
  } catch (e) {
    push({ title: "Error", description: "Failed to delete test", variant: "error", duration: 4000 });
    return;
  }
};

watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    page.value = 1;
    search.value = value.trim();
  }, searchDebounceMs);
});

watch([sortBy, sortDir], () => {
  page.value = 1;
});

watch(categoryFilter, () => {
  page.value = 1;
});
</script>

<template>
  <section class="p-6 lg:p-10 space-y-8">
    <div class="xl:col-span-2 rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] overflow-hidden">
      <div class="px-6 py-5 border-b border-[#262C45] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">Latest tests</h2>
          <p class="mt-1 text-sm text-[#9AA3C7]">Edit, publish or archive tests.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="rounded-xl border border-[#262C45] bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition">Export</button>
          <NuxtLink
            to="/admin/tests/create"
            class="rounded-xl px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#6C7CFF] to-[#8A95FF] hover:shadow-[0_0_18px_4px_rgba(108,124,255,0.3)] transition flex items-center justify-center">
            + New test
          </NuxtLink>
        </div>
      </div>

      <div class="px-6 py-4 border-b border-[#262C45]">
        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3">
          <label class="relative">
            <Icon name="material-symbols:search-check-2-outline" class="absolute left-3 top-[16px] text-[#9AA3C7]" />
            <input
              v-model="searchInput"
              class="w-full rounded-xl border border-[#262C45] bg-white/5 pl-9 pr-3 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition"
              placeholder="Search tests…" />
          </label>

          <AppSelect v-model="categoryFilter" :options="categoryOptions" />

          <AppSelect v-model="sortBy" :options="sortByOptions" />

          <button type="button" class="h-11 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm hover:bg-white/10 transition" @click="toggleSortDir">
            {{ sortDir === "asc" ? "Asc" : "Desc" }}
          </button>
        </div>
      </div>

      <div class="py-4">
        <div class="px-6 hidden md:grid grid-cols-[2fr_.7fr_.8fr_.4fr] gap-4 text-xs text-[#9AA3C7] pb-3 border-b border-[#262C45]">
          <div>Test</div>
          <div>Category</div>
          <div>Created</div>
          <div>Actions</div>
        </div>

        <div class="divide-y divide-[#262C45] px-6">
          <div class="mt-4">
            <div v-if="pending" class="py-8 text-sm text-[#9AA3C7]">Loading...</div>
            <div v-else-if="tests.length === 0" class="py-8 text-sm text-[#9AA3C7] text-center">No tests found.</div>

            <div v-else class="space-y-3">
              <div
                v-for="test in tests"
                :key="test.id"
                class="group rounded-2xl border border-[#262C45] p-4 md:p-0 md:bg-transparent md:border-0 md:rounded-none">
                <div
                  class="hidden md:grid md:grid-cols-[2fr_.7fr_.8fr_.3fr] gap-4 items-start px-3 py-4 border-b border-[#262C45] hover:bg-white/[0.03] transition">
                  <div class="min-w-0">
                    <p class="font-semibold truncate">{{ test.title ?? test.name ?? "Untitled" }}</p>
                    <p class="text-xs text-[#9AA3C7] mt-1">{{ test.questions_count ?? 0 }} questions</p>
                  </div>

                  <div>
                    <span class="inline-flex text-xs px-3 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]">
                      {{ test.category ?? "Uncategorized" }}
                    </span>
                  </div>

                  <div class="text-sm text-[#9AA3C7]">
                    {{ test.created_at ? formatDateTime(test.created_at) : "-" }}
                  </div>

                  <div class="flex gap-2">
                    <NuxtLink
                      :to="`/admin/tests/${test.id}`"
                      class="rounded-xl border border-[#262C45] bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition"
                      >Edit</NuxtLink
                    >
                    <button
                      @click="deleteTest(Number(test.id))"
                      class="rounded-xl border border-rose-500/10 bg-rose-500/10 px-3 py-2 text-xs hover:bg-rose-500/20 transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-5 border-t border-[#262C45] flex items-center justify-between">
        <p class="text-xs text-[#9AA3C7]">Showing {{ showingStart }}-{{ showingEnd }} of {{ total }}</p>
        <div class="flex gap-2">
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
</template>
