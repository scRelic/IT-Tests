<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  exp: number;
  level: string;
  nextLevel: string;
  nextLevelExp: number;
  progressPercent: number;
}>();
</script>

<template>
  <section class="md:col-span-2 space-y-6">
    <div class="bg-[#1B2033] border border-[#262C45] rounded-xl p-6 relative overflow-hidden h-full">
      <div class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#6C7CFF]/12 blur-[90px]"></div>

      <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
        <div>
          <p class="text-[#9AA3C7] text-sm">Level</p>
          <div class="flex items-baseline gap-3 mt-1">
            <h3 class="text-2xl font-semibold">{{ level }}</h3>
            <span class="text-xs px-3 py-1 rounded-full border border-[#262C45] bg-white/5 text-[#9AA3C7]"> {{ exp }} XP </span>
          </div>
          <p class="text-[#9AA3C7] text-sm mt-3 max-w-[520px]">Earn XP by completing tests. Improve weak topics to reach the next rank.</p>
        </div>

        <button
          class="px-6 py-2 rounded-xl font-semibold bg-[#262C45] hover:bg-[#3a3f5c] cursor-pointer transition-colors duration-200 ml-auto lg:ml-0"
          @click="$emit('update:isMoreInfo', true)">
          More Info
        </button>
      </div>

      <div>
        <div class="flex items-center justify-between text-xs text-[#9AA3C7] mb-2">
          <span> {{ nextLevel === "Lead" ? "Max Level" : `Progress to ${nextLevel}` }}</span>
          <span class="text-white/90 font-semibold"> {{ exp }} / {{ nextLevelExp }} XP ({{ progressPercent }}%) </span>
        </div>

        <div class="h-2 rounded-full bg-white/10 overflow-hidden">
          <div class="h-full bg-[#6C7CFF] rounded-full transition-all duration-300" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </div>
  </section>
</template>
