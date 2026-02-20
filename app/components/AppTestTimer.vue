<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

interface Props {
  testId: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{ expired: [] }>();

const remainingTime = ref(0);
const isExpired = ref(false);
const timeLimit = ref(0);
let interval: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed(() => {
  if (timeLimit.value === 0) return "No limit";

  const totalSeconds = Math.ceil(remainingTime.value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

const timerClass = computed(() => {
  if (timeLimit.value === 0) return "text-[#9AA3C7]";
  if (isExpired.value) return "text-red-500";
  if (remainingTime.value < 60000) return "text-orange-500";
  return "text-[#6C7CFF]";
});

const fetchTimerData = async () => {
  try {
    const response = await $fetch<{
      startTime: number;
      timeLimit: number;
      currentTime: number;
      remainingTime: number;
      isExpired: boolean;
    }>("/api/tests/session/timer", {
      method: "GET",
      query: { testId: props.testId },
    });

    timeLimit.value = response.timeLimit;
    remainingTime.value = response.remainingTime;
    isExpired.value = response.isExpired;

    if (isExpired.value) {
      emit("expired");
    }
  } catch (error) {
    console.error("Error fetching timer data:", error);
  }
};

onMounted(() => {
  fetchTimerData();

  interval = setInterval(() => {
    if (timeLimit.value === 0) return;

    remainingTime.value = Math.max(0, remainingTime.value - 1000);

    if (remainingTime.value === 0 && !isExpired.value) {
      isExpired.value = true;
      emit("expired");
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  }, 1000);
});

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
});
</script>

<template>
  <div class="flex items-center gap-3 text-sm">
    <svg class="w-5 h-5" :class="timerClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span :class="timerClass">{{ formattedTime }}</span>
  </div>
</template>
