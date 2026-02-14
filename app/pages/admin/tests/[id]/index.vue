<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Option, Question } from "~~/shared/types/test";
import type { Category } from "~~/shared/types/category";

type TestResponse = {
  test: {
    id: number;
    title: string;
    description: string;
    category: string | null;
    category_id: number | null;
  };
  questions: Array<
    Omit<Question, "answers"> & {
      answers: Option[];
      correct_answer_id: number | null;
    }
  >;
};

type CategoriesResponse = {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
};

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const route = useRoute();

const { push } = useToast();

const testId = computed(() => String(route.params.id ?? ""));

const { data, pending, error, refresh } = await useFetch<TestResponse>(`/api/admin/tests/${route.params.id}`, {
  key: `admin-test-${route.params.id}`,
});

const { data: categoriesData } = await useFetch<CategoriesResponse>("/api/admin/categories", {
  key: "admin-categories-for-tests",
  query: { page: 1, limit: 100 },
});

const categoryOptions = computed(() => {
  const categories = categoriesData.value?.categories ?? [];
  return categories.map((c) => ({ label: c.title, value: String(c.id) }));
});

const isInitialized = ref(false);

const normalizeAnswers = (answers: unknown) => {
  const list = Array.isArray(answers) ? answers : [];
  return list
    .map((a: any, idx: number) => {
      const fromAnswerId = Number.isInteger(Number(a?.answer_id)) ? Number(a.answer_id) : null;
      const fromId = Number.isInteger(Number(a?.id)) ? Number(a.id) : null;
      const normalized = (fromAnswerId && fromAnswerId > 0 ? fromAnswerId : null) ?? (fromId && fromId > 0 ? fromId : null) ?? idx + 1;

      return {
        ...a,
        answer_id: normalized,
        text: typeof a?.text === "string" ? a.text : "",
      } as Option;
    })
    .filter((a: any) => Number.isInteger(Number(a?.answer_id)) && Number(a.answer_id) > 0);
};

const form = ref<{
  title: string;
  description: string;
  categoryId: string;
  questions: Array<{
    id: number;
    question_text: string;
    answers: Option[];
    correct_answer_id: number | null;
  }>;
} | null>(null);

watch(
  data,
  (value) => {
    if (!value || isInitialized.value) return;

    form.value = {
      title: value.test.title ?? "",
      description: value.test.description ?? "",
      categoryId: value.test.category_id ? String(value.test.category_id) : "",
      questions: (value.questions ?? []).map((q) => ({
        id: q.id,
        question_text: q.question_text ?? "",
        answers: normalizeAnswers(q.answers),
        correct_answer_id: q.correct_answer_id ?? null,
      })),
    };

    isInitialized.value = true;
  },
  { immediate: true },
);

const saving = ref(false);

const save = async () => {
  if (!form.value) return;
  if (saving.value) return;

  // Ensure answers always have valid answer_id before save
  for (const q of form.value.questions) {
    q.answers = normalizeAnswers(q.answers);
  }

  try {
    saving.value = true;

    await $fetch(`/api/admin/tests/${route.params.id}`, {
      method: "PUT",
      body: {
        title: form.value.title,
        description: form.value.description,
        category_id: form.value.categoryId ? Number(form.value.categoryId) : null,
        questions: form.value.questions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          answers: q.answers,
          correct_answer_id: q.correct_answer_id,
        })),
      },
    });

    push({ title: "Success", description: "Test updated successfully", variant: "success", duration: 4000 });
    await refresh();
    isInitialized.value = false;
  } catch (e) {
    push({ title: "Error", description: "Failed to update test", variant: "error", duration: 4000 });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <section class="p-6 lg:p-10">
    <div class="max-w-5xl mx-auto space-y-6">
      <div v-if="pending" class="px-2 py-10 text-center text-sm text-[#9AA3C7]">Loading test…</div>
      <div v-else-if="error" class="px-2 py-10 text-center text-sm text-rose-200">Failed to load test.</div>
      <div v-else-if="!data" class="px-2 py-10 text-center text-sm text-[#9AA3C7]">Test not found.</div>

      <template v-else>
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold">Edit test</h1>
            <p class="mt-1 text-sm text-[#9AA3C7]">ID: {{ testId }}</p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-xl border border-[#262C45] bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-60"
              :disabled="saving || pending || !form"
              @click="save">
              {{ saving ? "Saving…" : "Save" }}
            </button>
          </div>
        </div>

        <div v-if="form" class="rounded-2xl border border-[#262C45] bg-[#1B2033] p-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label class="space-y-1">
              <span class="text-xs text-[#9AA3C7]">Title</span>
              <input
                v-model="form.title"
                class="w-full rounded-xl border border-[#262C45] bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition"
                placeholder="Test title" />
            </label>

            <label class="space-y-1">
              <span class="text-xs text-[#9AA3C7]">Category</span>
              <AppSelect v-model="form.categoryId" :options="categoryOptions" placeholder="Select category" />
            </label>
          </div>

          <label class="space-y-1">
            <span class="text-xs text-[#9AA3C7]">Description</span>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full rounded-xl border border-[#262C45] bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition"
              placeholder="Test description" />
          </label>

          <div class="flex flex-wrap gap-2">
            <span class="text-xs px-3 py-1 rounded-full bg-white/5 border border-[#262C45]">{{ data.test.category ?? "—" }}</span>
            <span class="text-xs px-3 py-1 rounded-full bg-white/5 border border-[#262C45]">{{ form.questions.length }} questions</span>
          </div>
        </div>

        <section v-if="form" class="space-y-4">
          <div v-for="(q, qIdx) in form.questions" :key="q.id" class="rounded-2xl border border-[#262C45] bg-[#1B2033] p-4 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <p class="text-xs text-[#9AA3C7]">Question #{{ qIdx + 1 }} (id {{ q.id }})</p>
            </div>

            <label class="space-y-1 block">
              <span class="text-xs text-[#9AA3C7]">Question text</span>
              <input
                v-model="q.question_text"
                class="w-full rounded-xl border border-[#262C45] bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition"
                placeholder="Question" />
            </label>

            <div class="space-y-2">
              <p class="text-xs text-[#9AA3C7]">Answers (pick correct)</p>

              <div
                v-for="(a, aIdx) in q.answers"
                :key="a.answer_id ?? a.id ?? aIdx"
                class="flex items-center gap-2 rounded-xl border border-[#262C45] bg-white/5 px-3 py-2">
                <input
                  type="radio"
                  :name="`correct-${q.id}`"
                  :value="a.answer_id"
                  :checked="q.correct_answer_id === a.answer_id"
                  @change="q.correct_answer_id = a.answer_id" />
                <input v-model="a.text" class="w-full bg-transparent text-sm outline-none placeholder:text-white/20" placeholder="Answer text" />
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </section>
</template>
