<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

const props = defineProps<{
  modelValue: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const selected = computed(() => props.options.find((o) => o.value === props.modelValue) ?? null);

const toggle = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const pick = (option: Option) => {
  if (props.disabled || option.disabled) return;
  close();
  emit("update:modelValue", option.value);
};

const onClickOutside = (event: MouseEvent) => {
  if (!rootRef.value) return;
  if (event.target instanceof Node && !rootRef.value.contains(event.target)) {
    close();
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return;
  if (event.key === "Escape") close();
};

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="h-11 min-w-[10rem] rounded-xl border border-[#262C45] bg-white/5 px-3 text-left text-sm text-white outline-none focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
      :disabled="disabled"
      @click.prevent.stop="toggle">
      <span v-if="selected" class="inline-flex items-center justify-between w-full gap-3">
        <span class="truncate">{{ selected.label }}</span>
        <Icon name="material-symbols:arrow-drop-down" class="text-[#9AA3C7]" />
      </span>
      <span v-else class="inline-flex items-center justify-between w-full gap-3">
        <span class="truncate text-white/40">{{ placeholder ?? "Select" }}</span>
        <Icon name="material-symbols:arrow-drop-down" class="text-[#9AA3C7]" />
      </span>
    </button>

    <div v-if="isOpen" class="absolute z-30 mt-2 min-w-[10rem] rounded-2xl border border-[#262C45] bg-[#14182a] overflow-hidden">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="w-full px-3 py-2 text-left text-sm transition"
        :class="[opt.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5', opt.value === modelValue ? 'bg-white/5 text-white' : 'text-[#9AA3C7]']"
        :disabled="disabled || opt.disabled"
        @click.prevent.stop="pick(opt)">
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>
