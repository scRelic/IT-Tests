<script setup lang="ts">
import { computed } from "vue";
import { LEVEL_UP_EXP } from "@/../shared/constants";

const props = defineProps<{
  isMoreInfo: boolean;
  exp: number;
  level: string;
  nextLevelExp: number;
  progressPercent: number;
}>();

const emit = defineEmits<{
  (e: "update:isMoreInfo", value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.isMoreInfo,
  set: (value: boolean) => emit("update:isMoreInfo", value),
});

const getStatus = (item: { level: string; exp: number }) => {
  if (item.level === props.level) return "current";
  if (props.exp >= item.exp) return "passed";
  return "locked";
};
</script>

<template>
  <AppBaseModal v-model="isOpen" title="Level info" description="How XP and ranks work">
    <div class="mb-4 pb-4 border-b border-[#262C45]">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-[#262C45] bg-white/5 px-3 py-1 text-xs text-[#9AA3C7]">
            <span class="h-1.5 w-1.5 rounded-full bg-[#6C7CFF]"></span>
            Level system
          </div>
          <h2 class="mt-2 text-lg font-semibold">How to level up</h2>
          <p class="mt-1 text-sm text-[#9AA3C7]">Earn EXP by passing tests and improving accuracy.</p>
        </div>
        <span class="text-xs px-3 py-1 rounded-full bg-[#6C7CFF]/15 text-[#6C7CFF] border border-[#262C45]">Current: {{ level }}</span>
      </div>
    </div>

    <div>
      <div class="rounded-xl border border-[#262C45] bg-white/5 p-4">
        <div class="flex items-center justify-between mb-1">
          <p class="text-sm text-[#9AA3C7]">Your EXP</p>
          <p class="text-sm">
            <span class="font-semibold text-white">{{ exp }}</span
            ><span class="text-[#9AA3C7]"> / {{ nextLevelExp }}</span>
          </p>
        </div>
        <div class="h-2 rounded-full bg-white/10 overflow-hidden">
          <div class="h-full bg-[#6C7CFF] rounded-full transition-all duration-300" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p class="mt-2 text-xs text-[#9AA3C7]">
          Next: <span class="text-white font-semibold">Middle</span> at <span class="text-white font-semibold">{{ nextLevelExp }}</span> EXP (need
          {{ nextLevelExp - exp }} exp more).
        </p>
      </div>

      <div class="mt-6 relative">
        <div class="absolute left-4 top-0 bottom-0 w-px bg-[#262C45]"></div>

        <div class="relative flex gap-4 pb-5" v-for="item in LEVEL_UP_EXP" :key="item.level">
          <div class="mt-1 h-8 w-8 rounded-full border border-[#262C45] bg-[#1b2033] flex items-center justify-center text-xs text-[#9AA3C7]">
            <Icon v-if="getStatus(item) === 'passed'" name="material-symbols:check-circle" class="text-[20px] text-green-500" />
            <Icon v-else-if="getStatus(item) === 'current'" name="material-symbols:bolt" class="text-[20px] animate-pulse text-yellow-500" />
            <Icon v-else name="material-symbols:lock" class="text-[20px] opacity-70" />
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <p class="font-semibold">{{ item.level }}</p>
              <span class="text-xs text-[#9AA3C7]">{{ item.exp }} EXP</span>
            </div>
            <p class="mt-1 text-xs text-[#9AA3C7]">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <RouterLink
          to="/tests"
          class="px-3 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6C7CFF] to-[#8A95FF] hover:shadow-[0_0_24px_6px_rgba(108,124,255,0.35)] transition">
          Go to tests
        </RouterLink>
      </div>
    </div>
  </AppBaseModal>
</template>
