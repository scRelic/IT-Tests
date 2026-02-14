<script setup lang="ts">
const props = defineProps<{
  page: number;
  totalPages: number;
  pending: boolean;
}>();

const isFirstPage = computed(() => props.page === 1);
const isLastPage = computed(() => props.page >= props.totalPages);

const emit = defineEmits<{
  (e: "next"): void;
  (e: "prev"): void;
}>();
</script>

<template>
  <div class="flex flex-col items-center mt-12 gap-4" v-if="!props.pending && props.totalPages > 1">
    <div class="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
      <div class="h-full bg-indigo-500" :style="{ width: (props.page / props.totalPages) * 100 + '%' }"></div>
    </div>

    <div class="flex gap-3 text-sm text-slate-400">
      <span>Page {{ props.page }}</span>
      <span>/</span>
      <span>{{ props.totalPages }}</span>
    </div>

    <div class="flex gap-4 text-lg">
      <button class="text-slate-400 hover:text-white disabled:text-slate-600" :disabled="isFirstPage" @click="emit('prev')">‹ Prev</button>
      <button class="text-slate-400 hover:text-white disabled:text-slate-600" :disabled="isLastPage" @click="emit('next')">Next ›</button>
    </div>
  </div>
</template>
