<script setup lang="ts">
import { USERS_REVIEWS } from "@/../shared/constants";
</script>

<template>
  <section>
    <div class="flex items-end justify-between gap-6 mb-10">
      <div>
        <h3 class="text-2xl font-semibold">What users say</h3>
        <p class="text-[#9AA3C7] text-sm mt-2">Reviews from users who use this product.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <figure
        v-for="review in USERS_REVIEWS"
        :key="`${review.name}-${review.role}`"
        class="rounded-[18px] border border-[#262C45] bg-white/5 p-6 flex flex-col justify-between transition hover:-translate-y-0.5 hover:border-[#6C7CFF]/40">
        <blockquote class="text-sm leading-relaxed text-white/90">“{{ review.review }}”</blockquote>

        <figcaption class="mt-5 flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full bg-[#6C7CFF]/20 border border-[#262C45] flex items-center justify-center text-[#6C7CFF] font-semibold"
            aria-hidden="true">
            {{ (review.name?.[0] ?? "?").toUpperCase() }}
          </div>

          <div class="text-sm">
            <div class="font-semibold">{{ review.name }}</div>
            <div class="text-[#9AA3C7] text-xs">{{ review.role }}</div>
          </div>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
