<script setup lang="ts">
import { computed, ref } from "vue";
import type { Option } from "~~/shared/types/test";
import type { Category } from "~~/shared/types/category";

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

const router = useRouter();
const { push } = useToast();

const { data: categoriesData, pending: categoriesPending } = await useFetch<CategoriesResponse>("/api/admin/categories", {
  key: "admin-categories-for-tests-create",
  query: { page: 1, limit: 100 },
});

const categoryOptions = computed(() => {
  const categories = categoriesData.value?.categories ?? [];
  return categories.map((c) => ({ label: c.title, value: String(c.id) }));
});

const createEmptyQuestion = (): {
  id: number;
  question_text: string;
  answers: Option[];
  correct_answer_id: number | null;
} => {
  const baseAnswers: Option[] = [1, 2, 3, 4].map((idx) => ({
    id: idx,
    answer_id: idx,
    text: "",
  }));

  return {
    id: 0,
    question_text: "",
    answers: baseAnswers,
    correct_answer_id: null,
  };
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
}>({
  title: "",
  description: "",
  categoryId: "",
  questions: [createEmptyQuestion()],
});

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

const saving = ref(false);

const isFormValid = computed(() => {
  if (!form.value) return false;
  if (!form.value.questions || form.value.questions.length === 0) return false;

  if (!form.value.title.trim()) return false;

  for (const q of form.value.questions) {
    if (!q.question_text.trim()) return false;
    if (!Array.isArray(q.answers) || q.answers.length < 2) return false;

    const allowedIds = new Set(q.answers.map((a) => Number(a.answer_id ?? a.id ?? 0)).filter((n) => Number.isFinite(n) && n > 0));

    if (q.correct_answer_id == null) return false;

    const correctId = q.correct_answer_id;
    if (!Number.isInteger(correctId) || correctId <= 0) return false;
    if (!allowedIds.has(correctId)) return false;
  }

  return true;
});

const addQuestion = () => {
  if (!form.value) return;
  form.value.questions.push(createEmptyQuestion());
};

const addAnswer = (questionIndex: number) => {
  if (!form.value) return;
  const q = form.value.questions[questionIndex];
  if (!q) return;

  const currentMaxId = q.answers.reduce((max, a) => {
    const id = Number(a.answer_id ?? a.id ?? 0);
    return Number.isFinite(id) && id > max ? id : max;
  }, 0);

  const nextId = currentMaxId + 1;
  q.answers.push({ id: nextId, answer_id: nextId, text: "" });
};

const removeQuestion = (questionIndex: number) => {
  if (!form.value) return;
  if (questionIndex < 0 || questionIndex >= form.value.questions.length) return;

  form.value.questions.splice(questionIndex, 1);
};

const removeAnswer = (questionIndex: number, answerIndex: number) => {
  if (!form.value) return;
  const q = form.value.questions[questionIndex];
  if (!q) return;

  if (!Array.isArray(q.answers) || q.answers.length <= 1) return;

  const removed = q.answers.splice(answerIndex, 1)[0];

  if (removed && q.correct_answer_id === removed.answer_id) {
    const first = q.answers[0];
    q.correct_answer_id = first ? (first.answer_id ?? first.id ?? null) : null;
  }
};

const save = async () => {
  if (!form.value) return;
  if (saving.value) return;

  for (const q of form.value.questions) {
    q.answers = normalizeAnswers(q.answers);
  }

  try {
    saving.value = true;

    await $fetch("/api/admin/tests", {
      method: "POST",
      body: {
        title: form.value.title,
        description: form.value.description,
        category_id: form.value.categoryId ? Number(form.value.categoryId) : null,
        questions: form.value.questions.map((q) => ({
          question_text: q.question_text,
          answers: q.answers,
          correct_answer_id: q.correct_answer_id,
        })),
      },
    });

    push({ title: "Success", description: "Test created successfully", variant: "success", duration: 4000 });
    router.push("/admin/tests");
  } catch (e) {
    push({ title: "Error", description: "Failed to create test", variant: "error", duration: 4000 });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <section class="p-6 lg:p-10">
    <div class="max-w-5xl mx-auto space-y-6">
      <div v-if="categoriesPending" class="px-2 py-10 text-center text-sm text-[#9AA3C7]">Loading categories…</div>

      <div v-else>
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 class="text-2xl font-semibold">Create test</h1>
            <p class="mt-1 text-sm text-[#9AA3C7]">Fill in details and questions for the new test.</p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-xl border border-[#262C45] bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-60"
              :disabled="saving || !form || !isFormValid"
              @click="save">
              {{ saving ? "Saving…" : "Create" }}
            </button>
          </div>
        </div>

        <div v-if="form" class="rounded-2xl border border-[#262C45] bg-[#1B2033] p-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <label class="space-y-1">
              <span class="text-xs text-[#9AA3C7]">Title</span>
              <input
                v-model="form.title"
                class="w-full rounded-xl border border-[#262C45] bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition"
                placeholder="Test title" />
            </label>

            <label class="space-y-1 inline-block">
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
            <span class="text-xs px-3 py-1 rounded-full bg-white/5 border border-[#262C45]">{{ form.questions.length }} questions</span>
          </div>
        </div>

        <section v-if="form" class="space-y-4 mt-4">
          <div v-for="(q, qIdx) in form.questions" :key="qIdx" class="rounded-2xl border border-[#262C45] bg-[#1B2033] p-4 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <p class="text-xs text-[#9AA3C7]">Question #{{ qIdx + 1 }}</p>

              <button
                type="button"
                class="text-[11px] px-2 py-1 rounded-lg border border-rose-500/40 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition disabled:opacity-60"
                :disabled="saving || form.questions.length <= 1"
                @click="removeQuestion(qIdx)">
                Удалить вопрос
              </button>
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
                  :name="`correct-new-${qIdx}`"
                  :value="a.answer_id"
                  :checked="q.correct_answer_id === a.answer_id"
                  @change="q.correct_answer_id = a.answer_id" />
                <input v-model="a.text" class="w-full bg-transparent text-sm outline-none placeholder:text-white/20" placeholder="Answer text" />

                <button
                  type="button"
                  class="text-[11px] px-2 py-1 rounded-lg border border-[#262C45] text-[#9AA3C7] hover:bg-white/10 transition disabled:opacity-40"
                  :disabled="saving || q.answers.length <= 2"
                  @click="removeAnswer(qIdx, aIdx)">
                  Удалить
                </button>
              </div>

              <button
                type="button"
                class="mt-2 rounded-xl border border-[#262C45] bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition disabled:opacity-60"
                :disabled="saving"
                @click="addAnswer(qIdx)">
                Add answer
              </button>
            </div>
          </div>

          <div class="flex justify-end mb-2 gap-2">
            <button
              type="button"
              class="rounded-xl border border-[#262C45] bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-60"
              :disabled="saving || !form || !isFormValid"
              @click="save">
              {{ saving ? "Saving…" : "Create" }}
            </button>
            <button
              type="button"
              class="rounded-xl border border-[#262C45] bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-60"
              :disabled="saving"
              @click="addQuestion">
              Add question
            </button>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>
