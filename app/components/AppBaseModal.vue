<script setup lang="ts">
import { computed } from "vue";
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, VisuallyHidden } from "reka-ui";

const props = defineProps<{
  modelValue: boolean;
  title?: string;
  description?: string;
  maxWidthClass?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const contentClass = computed(() => {
  const width = props.maxWidthClass ?? "max-w-2xl";
  return `app-modal-card w-full ${width} overflow-hidden rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] shadow-2xl pointer-events-auto`;
});

const close = () => {
  emit("update:modelValue", false);
};
</script>

<template>
  <DialogRoot v-model:open="isOpen">
    <DialogPortal to="body">
      <DialogOverlay class="app-modal-overlay fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" />
      <DialogContent class="app-modal-shell fixed inset-0 z-50 flex items-center justify-center px-4 py-8 pointer-events-none">
        <div :class="contentClass">
          <VisuallyHidden>
            <DialogTitle v-if="title">{{ title }}</DialogTitle>
            <DialogDescription v-if="description">{{ description }}</DialogDescription>
          </VisuallyHidden>
          <div class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#6C7CFF]/12 blur-[90px]"></div>
          <div class="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-[#6C7CFF]/10 blur-[100px]"></div>

          <slot name="header" :close="close">
            <div class="relative z-10 flex items-start justify-between gap-4 border-b border-[#262C45] px-6 py-5">
              <div>
                <DialogTitle class="text-lg font-semibold text-white">
                  {{ title }}
                </DialogTitle>
                <DialogDescription v-if="description" class="mt-1 text-sm text-[#9AA3C7]">
                  {{ description }}
                </DialogDescription>
              </div>

              <DialogClose as-child>
                <button
                  type="button"
                  class="rounded-lg border border-[#262C45] bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 hover:border-[#6C7CFF]/40 transition">
                  Close
                </button>
              </DialogClose>
            </div>
          </slot>

          <div class="relative z-10 px-6 py-6">
            <slot />
          </div>

          <slot name="footer" :close="close" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
