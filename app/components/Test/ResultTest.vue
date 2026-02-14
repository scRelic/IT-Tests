<script setup lang="ts">
type Review = {
  answers: {
    answer_id?: number | string;
    id?: number | string;
    text: string;
  }[];
  correct_answer_id: number | string;
  is_correct: boolean;
  question_id: number;
  question_text: string;
  selected_answer_id: number | string;
};

const toId = (answer: { answer_id?: number | string; id?: number | string }) => Number(answer.answer_id ?? answer.id);
const toNum = (value: number | string) => Number(value);

defineProps<{
  score: number;
  totalQuestions: number;
  percentage: number;
  review: Review[];
  title?: string;
}>();
</script>

<template>
  <section class="max-w-3xl mx-auto my-12">
    <div class="relative overflow-hidden rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] p-8 mb-10">
      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div>
          <div class="flex items-center gap-3 mb-3">
            <span class="text-xs font-semibold px-3 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]"> Results </span>
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-[#6C7CFF]/15 text-[#6C7CFF]"> {{ percentage.toFixed(2) }}% </span>
          </div>

          <h1 class="text-3xl font-semibold tracking-wide">
            {{ title || "Test Results" }}
          </h1>

          <p class="mt-2 text-sm text-[#9AA3C7]">
            Your score: <span class="text-white font-semibold">{{ score }}</span> /
            <span class="text-white font-semibold">{{ totalQuestions }}</span>
            <span class="text-[#9AA3C7]"> ({{ percentage.toFixed(2) }}%)</span>
          </p>

          <div class="mt-5 w-full max-w-xl">
            <div class="h-2 rounded-full bg-white/10 overflow-hidden">
              <div class="h-full bg-[#6C7CFF] rounded-full transition-all duration-500" :style="{ width: `${Math.min(100, Math.max(0, percentage))}%` }"></div>
            </div>

            <div class="mt-2 flex justify-between text-xs text-[#9AA3C7]"><span>0%</span><span>50%</span><span>100%</span></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 min-w-[260px]">
          <div class="rounded-xl border border-[#262C45] bg-white/5 p-4">
            <p class="text-xs text-[#9AA3C7]">Correct</p>
            <p class="text-2xl font-semibold text-white mt-1">{{ score }}</p>
          </div>

          <div class="rounded-xl border border-[#262C45] bg-white/5 p-4">
            <p class="text-xs text-[#9AA3C7]">Wrong</p>
            <p class="text-2xl font-semibold text-white mt-1">{{ totalQuestions - score }}</p>
          </div>

          <NuxtLink :to="`/tests`" class="col-span-2 btn secondary justify-center"> All Tests </NuxtLink>
        </div>
      </div>
    </div>

    <div class="bg-[#1B2033] border border-[#262C45] rounded-2xl p-8 mb-6" v-for="(item, index) in review" :key="index">
      <div>
        <p class="text-sm text-[#9AA3C7] mb-6">Question {{ index + 1 }} of {{ totalQuestions }}</p>
        <h3 class="text-lg font-medium mb-6">{{ item?.question_text }}</h3>
        <div class="space-y-2">
          <div
            v-for="answer in item?.answers"
            :key="answer.answer_id ?? answer.id"
            :class="[
              'rounded-xl px-4 py-3',
              toId(answer) === toNum(item.correct_answer_id)
                ? 'bg-green-600 text-white'
                : toId(answer) === toNum(item.selected_answer_id) && !item.is_correct
                  ? 'bg-red-600 text-white'
                  : 'bg-[#262C45] text-white',
            ]">
            <p>{{ answer.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
