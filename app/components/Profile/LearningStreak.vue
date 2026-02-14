<script setup lang="ts">
defineProps<{
  current_streak: number;
}>();
</script>

<template>
  <section>
    <div class="flex flex-col rounded-xl border border-[#262C45] bg-[#1B2033] p-5 gap-4 mb-4">
      <div class="flex items-center gap-2 text-[#9AA3C7]">
        <Icon name="material-symbols:whatshot" class="w-5 h-5" />
        <p class="text-sm">Learning streak</p>
      </div>
      <div class="flex items-center gap-2">
        <Icon name="material-symbols:trophy" class="text-orange-600 w-5 h-5" />
        <span
          >Your streak: <span class="text-orange-600 font-semibold">{{ current_streak }}</span> days</span
        >
      </div>
    </div>
  </section>
</template>
