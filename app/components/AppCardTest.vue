<script setup lang="ts">
import type { Test } from "~~/shared/types/test";

defineProps<{
  test: Test;
}>();
</script>

<template>
  <div
    class="group rounded-[18px] p-[1px] border border-transparent bg-[#262C45] hover:bg-gradient-to-r hover:from-indigo-500 hover:to-cyan-400 transition duration-200">
    <div class="h-64 flex flex-col gap-4 p-6 rounded-[16px] bg-gradient-to-b from-[#1b2033] to-[#14182a]">
      <span class="rounded-full text-[12px] font-[600] text-[#6C7CFF] px-3 py-2 bg-[rgba(108,124,255,0.15)] self-start">
        {{ test.category }}
      </span>

      <h3 class="text-[20px] font-semibold">{{ test.title }}</h3>

      <p class="text-[#9AA3C7] text-[14px] leading-normal">
        {{ test.description }}
      </p>

      <div class="flex justify-between items-center mt-auto">
        <span class="text-[13px] text-[#9AA3C7]"> {{ test.questions_count }} questions </span>
        <NuxtLink :to="`/tests/${test.id}`" class="btn"> Take </NuxtLink>
      </div>
    </div>
  </div>
</template>
