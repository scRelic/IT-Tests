<script setup lang="ts">
import { computed } from "vue";
import { formatDateDdMmYy } from "~~/shared/utils";

const props = defineProps<{
  count_completed_tests: number;
  created_at: string;
  level: string;
}>();

const cardsInfo = computed(() => [
  { title: "Tests Passed", value: props.count_completed_tests ?? 0, icon: "mingcute:components-line" },
  { title: "Registration date", value: formatDateDdMmYy(props.created_at) ?? "", icon: "mingcute:calendar-2-fill" },
  { title: "Level", value: props.level ?? "", icon: "mingcute:arrows-up-fill", class: "text-[#6C7CFF]" },
]);
</script>

<template>
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    <div class="bg-[#1B2033] border border-[#262C45] rounded-xl p-4" v-for="card in cardsInfo" :key="card.title">
      <div class="flex items-center gap-1 text-[#9AA3C7] mb-2">
        <Icon :name="card.icon" v-if="card.icon" />
        <p class="text-[#9AA3C7] text-sm">{{ card.title }}</p>
      </div>
      <strong class="text-2xl" :class="card.class">{{ card.value }}</strong>
    </div>
  </section>
</template>
