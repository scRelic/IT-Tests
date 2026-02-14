<script setup lang="ts">
import { computed, ref } from "vue";
import type { LastTests } from "~~/shared/types/test";
import { formatDateTime } from "~~/shared/utils";

const props = defineProps<{
  tests: LastTests[];
  loading: boolean;
  error?: unknown;
}>();

const allVisible = ref(false);

const visibleTests = computed(() => (allVisible.value ? props.tests : props.tests.slice(0, 3)));
</script>

<template>
  <section
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 220, damping: 22 },
    }"
    class="space-y-6 bg-[#1B2033] border border-[#262C45] rounded-xl p-5">
    <div class="flex justify-between mb-4">
      <h2 class="text-lg font-semibold">Last 10 tests</h2>
      <div class="text-[#6C7CFF] text-sm cursor-pointer flex gap-2 items-center hover:underline" @click="allVisible = !allVisible" v-if="tests.length > 3">
        <span>{{ allVisible ? "Hide" : "View all" }}</span>
        <Icon :name="allVisible ? 'material-symbols:arrow-back-rounded' : 'material-symbols:arrow-forward-rounded'" />
      </div>
    </div>

    <p v-if="loading" class="text-[#9AA3C7] text-sm text-center">Loading tests...</p>
    <p v-else-if="error" class="text-red-500 text-sm text-center p-2 border border-red-500/50 rounded-xl">An error occurred while loading tests.</p>

    <ul v-else-if="tests.length > 0">
      <li
        v-for="(test, index) in visibleTests"
        :key="test.id"
        v-motion
        :initial="allVisible ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }"
        :enter="
          allVisible
            ? {
                opacity: 1,
                y: 0,
                transition: {
                  delay: index * 80,
                  type: 'spring',
                  stiffness: 320,
                  damping: 26,
                },
              }
            : { opacity: 1, y: 0 }
        "
        class="bg-[#272B3D] rounded-xl px-4 py-3 mb-4">
        <div class="flex justify-between items-center">
          <div>
            <h4 class="font-semibold text-white mb-1">{{ test.title }}</h4>
            <p class="text-[#9AA3C7] text-sm mb-1">{{ test.description }}</p>
            <span class="text-[#9AA3C7] text-sm">{{ formatDateTime(test.finished_at) }}</span>
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/25"> {{ test.category_title }}</span>
            <span class="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              {{ Number(test.score) }} / {{ Number(test.total_questions) }}</span
            >
          </div>
        </div>
      </li>
    </ul>
    <div v-else>
      <p class="text-[#9AA3C7] text-sm text-center">You haven't taken the test yet.</p>
    </div>
  </section>
</template>
