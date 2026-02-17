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
const searchInput = ref("");
const search = ref("");

const sortBy = ref<"created_at" | "tests_count">("created_at");
const sortDir = ref<"asc" | "desc">("desc");

const sortByOptions = [
  { label: "Created date", value: "created_at" },
  { label: "Tests count", value: "tests_count" },
];

const toggleSortDir = () => {
  sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
};

type AdminCategory = Category & {
  created_at?: string | null;
};

type AdminCategoriesResponse = {
  categories: AdminCategory[];
  total: number;
  page: number;
  limit: number;
};

const { data, pending, error, refresh } = await useFetch<AdminCategoriesResponse>("/api/admin/categories", {
  query: { page, limit, search, sortBy, sortDir },
});

const { push } = useToast();
const { downloadFile, pending: downloadPending } = useExport();
const { toggleSidebar } = useSidebar();

const categories = computed<AdminCategory[]>(() => data.value?.categories ?? []);

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

const deleteCategory = async (id: number) => {
  try {
    await $fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });

    push({ title: "Success", description: "Category deleted successfully", variant: "success", duration: 4000 });
    refresh();
  } catch (e) {
    push({ title: "Error", description: "Failed to delete category", variant: "error", duration: 4000 });
    return;
  }
};

const handleDownloadExcel = async () => {
  try {
    await downloadFile("/api/admin/categories/export/categories.xlsx", "categories.xlsx");
  } catch (error) {
    console.error("Failed to download Excel:", error);
    push({ title: "Error", description: "Failed to download Excel file", variant: "info", duration: 4000 });
  }
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

watch([sortBy, sortDir], () => {
  page.value = 1;
});
</script>

<template>
  <section class="p-6 max-[700px]:p-3">
    <div class="rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] overflow-hidden">
      <div class="p-5 border-b border-[#262C45]">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div class="flex gap-4 items-center">
            <button
              type="button"
              class="rounded-xl border border-[#262C45] bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
              aria-label="Toggle menu"
              @click="toggleSidebar">
              ☰
            </button>
            <div>
              <p class="text-sm font-semibold">Latest categories</p>
              <p class="text-xs text-[#9AA3C7] mt-1">Pick a category to edit. Search by name or tag.</p>
            </div>
          </div>
          <button
            :disabled="downloadPending"
            @click="handleDownloadExcel"
            class="rounded-xl border border-[#262C45] bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition">
            {{ downloadPending ? "Exporting..." : "Export Excel" }}
          </button>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <label class="relative">
            <Icon name="material-symbols:search-check-2-outline" class="absolute left-3 top-[16px] text-[#9AA3C7]" />
            <input
              v-model="searchInput"
              class="w-full rounded-xl border border-[#262C45] bg-white/5 pl-9 pr-24 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition"
              placeholder="Search categories…"
              @keydown="handleKeyDown" />
            <button
              @click="handleSearch"
              type="button"
              class="absolute right-1 top-1 px-3 py-2 rounded-lg bg-gradient-to-r from-[#6C7CFF] to-[#8A95FF] text-white font-medium text-sm hover:shadow-[0_0_18px_4px_rgba(108,124,255,0.3)] transition">
              Search
            </button>
          </label>
          <NuxtLink to="/admin/categories/create" class="rounded-xl px-4 py-3 text-sm font-semibold bg-[#6C7CFF] hover:opacity-90 transition cursor-pointer"
            >+ New Category</NuxtLink
          >
        </div>

        <div class="mt-3 flex md:flex-row md:items-center gap-2">
          <AppSelect v-model="sortBy" :options="sortByOptions" />
          <button type="button" class="h-11 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm hover:bg-white/10 transition" @click="toggleSortDir">
            {{ sortDir === "asc" ? "Asc" : "Desc" }}
          </button>
        </div>
      </div>

      <div class="p-3 md:p-4 space-y-3">
        <div v-if="pending" class="px-2 py-10 text-center text-sm text-[#9AA3C7]">Loading categories…</div>
        <div v-else-if="error" class="px-2 py-10 text-center text-sm text-rose-200">Failed to load categories.</div>
        <div v-else-if="categories.length === 0" class="px-2 py-10 text-center text-sm text-[#9AA3C7]">No categories found.</div>

        <template v-else>
          <div
            class="rounded-2xl border border-[#262C45] bg-white/5 p-4 hover:bg-white/10 hover:border-[#6C7CFF]/30 transition"
            v-for="item in categories"
            :key="item.id">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  <h4 class="font-semibold truncate">{{ item.title ?? "Untitled" }}</h4>
                </div>
                <p class="mt-2 text-xs text-[#9AA3C7] mb-2">{{ item.description ?? "" }}</p>
                <p class="text-xs text-[#9AA3C7]">Created: {{ item.created_at ? formatDateTime(item.created_at) : "—" }}</p>
              </div>
              <div class="text-center shrink-0 rounded-xl bg-white/5 px-2 py-1">
                <span class="text-xs text-[#9AA3C7]">Tests: </span>
                <span class="text-xs font-semibold">{{ item.tests_count }}</span>
              </div>
            </div>

            <div class="mt-2 flex items-center justify-between max-[550px]:flex-col max-[550px]:items-start gap-3 max-[550px]:gap-5">
              <div class="mt-3 flex flex-wrap gap-2">
                <span class="text-[11px] px-2.5 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]" v-for="tech in item.technologies">{{
                  tech
                }}</span>
              </div>
              <div class="flex gap-2 max-[550px]:w-full">
                <NuxtLink
                  :to="`/admin/categories/${item.id}/edit`"
                  class="rounded-xl border border-[#6C7CFF] bg-[#6C7CFF] px-3 py-2 text-xs hover:opacity-90 transition max-[550px]:w-full max-[550px]:text-center"
                  >Edit</NuxtLink
                >
                <button
                  @click="deleteCategory(item.id)"
                  class="rounded-xl border border-red-700 bg-red-600/40 px-3 py-2 text-xs hover:bg-red-600/60 transition max-[550px]:w-full max-[550px]:text-center">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-between px-2 text-xs text-[#9AA3C7]">
            <p class="text-xs text-[#9AA3C7]">Showing {{ showingStart }}-{{ showingEnd }} of {{ total }}</p>
            <div class="flex items-center gap-2">
              <button
                class="rounded-xl border border-[#262C45] bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition disabled:opacity-60"
                :disabled="pending || !canPrev"
                @click="goPrev">
                Prev
              </button>
              <button
                class="rounded-xl border border-[#262C45] bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition disabled:opacity-60"
                :disabled="pending || !canNext"
                @click="goNext">
                Next
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
