<script setup lang="ts">
import { computed } from "vue";
import { SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport } from "reka-ui";
import { Icon } from "@iconify/vue";

const props = defineProps<{
  modelValue: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<template>
  <SelectRoot v-model="value">
    <SelectTrigger
      class="inline-flex items-center justify-between gap-2 rounded-xl px-4 py-2 w-[220px] bg-[#1B2033] text-white border border-[#242A41] hover:bg-[#2A3150] outline-none transition duration-200">
      <SelectValue :placeholder="props.placeholder" />
      <Icon icon="radix-icons:chevron-down" class="h-4 w-4 opacity-60" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        class="min-w-[220px] bg-[#1B2033] rounded-xl border border-[#242A41] p-1 shadow-xl z-50"
        side="bottom"
        align="start"
        :side-offset="4"
        position="popper">
        <SelectViewport class="p-1">
          <SelectItem
            v-for="opt in options"
            :key="opt.value"
            :value="opt.value"
            class="text-sm text-[#D6DBF5] rounded-lg flex items-center h-9 px-8 relative select-none cursor-pointer hover:bg-[#2A3150] data-[highlighted]:text-white">
            <SelectItemIndicator class="absolute left-2 w-6 inline-flex items-center justify-center">
              <Icon icon="radix-icons:check" />
            </SelectItemIndicator>
            <SelectItemText>{{ opt.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style></style>
