<script setup lang="ts">
import { HOW_IT_WORKS_STEPS } from "~~/shared/constants";

const howStepMotion = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 450, delay: i * 120, ease: "easeOut" },
  },
});
</script>

<template>
  <section>
    <div class="text-center mb-14">
      <h3 class="text-2xl font-semibold mb-2">How It Works</h3>
      <p class="text-sm text-[#9AA3C7]">Simple steps to start testing your skills</p>
    </div>

    <div class="relative">
      <div
        class="hidden md:block absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6C7CFF]/50 to-transparent scale-x-0 origin-left animate-[lineGrow_1.2s_ease-out_forwards]" />

      <div class="grid grid-cols-1 md:grid-cols-4 gap-14">
        <div v-for="(step, i) in HOW_IT_WORKS_STEPS" :key="step.title" class="text-center max-w-[260px] mx-auto" v-motion="howStepMotion(i)">
          <div
            class="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center bg-[#1B2033] border border-[#262C45] text-[#6C7CFF] transition hover:shadow-[0_0_0_6px_rgba(108,124,255,0.12)] hover:-translate-y-0.5">
            <Icon :name="step.icon" size="32" />
          </div>

          <h4 class="font-semibold mb-1">{{ step.title }}</h4>
          <p class="text-sm text-[#9AA3C7]">{{ step.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
