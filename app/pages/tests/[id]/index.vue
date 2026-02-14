<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import type { Test, Question } from "@/../shared/types/test";
import { REWARD_EXP } from "@/../shared/constants";

definePageMeta({
  middleware: "auth",
});

type TestData = {
  test: Test;
  questions: Question[];
};

const selectedAnswers = reactive<Record<number, number | null>>({});
const result = ref<any>(null);

const route = useRoute();
const { expUp } = useLevel();

const payload = ref<
  {
    question_id: number;
    answer_id: number | null;
  }[]
>([]);

const {
  data: testData,
  pending,
  error,
} = useFetch<TestData>(() => `/api/tests/${route.params.id}`, {
  method: "GET",
  key: () => `test-${route.params.id}`,
  default: () => ({ test: {} as Test, questions: [] }),
});

const test = computed<Test | null>(() => testData.value?.test ?? null);
const questions = computed<Question[]>(() => testData.value?.questions ?? []);

const visibleResults = ref(false);
const currentQuestionIndex = ref(0);

const currentQuestion = computed<Question | null>(() => {
  return questions.value[currentQuestionIndex.value] || null;
});

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1;
  }
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    const q = currentQuestion.value;
    if (!q) return;
    const selected = selectedAnswers[q.id];
    if (selected == null) return;
    currentQuestionIndex.value += 1;
  }
};

const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1);

const canProceed = computed(() => {
  const q = currentQuestion.value;
  if (!q) return false;
  return selectedAnswers[q.id] != null;
});

const submitTest = async () => {
  try {
    payload.value = questions.value.map((q) => ({
      question_id: q.id,
      answer_id: selectedAnswers[q.id] ?? null,
    }));

    const res = await $fetch(`/api/test-result`, {
      method: "POST",
      body: { answers: payload.value, test_id: route.params.id },
    });

    result.value = res;
    visibleResults.value = true;

    expUp("complete_test");
  } catch (error: unknown) {
    console.error("Error submitting test:", error);
  }
};
</script>

<template>
  <main>
    <AppLoader v-if="pending" />
    <div v-else-if="error" class="text-red-400 text-center mt-32">Failed to load test.</div>
    <div v-else-if="!questions.length" class="text-slate-400 text-center">No questions.</div>
    <section v-else-if="!visibleResults" class="max-w-3xl mx-auto px-6 py-16">
      <div class="bg-[#1B2033] border border-[#262C45] rounded-2xl p-8">
        <h2 class="text-2xl font-semibold mb-2">{{ test?.title }}</h2>
        <p class="text-sm text-[#9AA3C7] mb-6">Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</p>

        <div class="w-full h-2 bg-[#141824] rounded-full mb-8 overflow-hidden">
          <div class="h-full bg-[#6C7CFF]" :style="{ width: ((currentQuestionIndex + 1) / questions.length) * 100 + '%' }"></div>
        </div>

        <div>
          <h3 class="text-lg font-medium mb-6">{{ currentQuestion?.question_text }}</h3>
        </div>

        <div class="space-y-3">
          <label
            v-for="answer in currentQuestion?.answers"
            :key="answer.answer_id ?? answer.id"
            class="flex items-center gap-3 bg-[#141824] border border-[#262C45] rounded-xl px-4 py-3 cursor-pointer hover:border-[#6C7CFF] duration-200 transition-colors">
            <input
              type="radio"
              :name="`q-${currentQuestion?.id}`"
              :value="answer.answer_id ?? answer.id"
              v-model.number="selectedAnswers[currentQuestion!.id]"
              class="accent-accent" />
            <span>{{ answer.text }}</span>
          </label>
        </div>

        <div class="flex justify-between mt-8">
          <button
            v-if="currentQuestionIndex > 0"
            @click="prevQuestion"
            class="px-6 py-3 rounded-xl border border-[#262C45] hover:border-[#6C7CFF] transition-colors duration-200">
            Back
          </button>
          <button
            v-if="!isLastQuestion"
            :disabled="!canProceed"
            @click="nextQuestion"
            class="px-6 py-3 rounded-xl bg-[#6C7CFF] font-semibold hover:bg-[#5a6ee6] transition-colors duration-200 ml-auto disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
          <button
            v-else
            :disabled="!canProceed"
            @click="submitTest"
            class="px-6 py-3 rounded-xl bg-[#6C7CFF] font-semibold hover:bg-[#5a6ee6] transition-colors duration-200 ml-auto disabled:opacity-50 disabled:cursor-not-allowed">
            Submit
          </button>
        </div>
      </div>
    </section>
    <TestResultTest
      v-else
      :title="test?.title"
      :score="result.score"
      :totalQuestions="result.totalQuestions"
      :percentage="result.percentage"
      :review="result.review" />
  </main>
</template>
