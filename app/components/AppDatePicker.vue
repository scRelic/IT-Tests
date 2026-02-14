<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  min?: string;
  max?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad = (value: number) => String(value).padStart(2, "0");

const toIso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const normalizeInput = (value: string) => {
  if (!value) return "";
  if (value.includes("T")) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
    }
  }
  return value.length >= 10 ? value.slice(0, 10) : value;
};

const parseIso = (value: string) => {
  if (!value) return null;
  const normalized = normalizeInput(value);
  const [year, month, day] = normalized.split("-").map((part) => Number(part));
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
};

const formatDisplay = (value: string) => {
  const date = parseIso(value);
  if (!date) return "";
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

const currentMonth = ref<Date>(parseIso(props.modelValue) ?? new Date());

watch(
  () => props.modelValue,
  (value) => {
    const parsed = parseIso(value);
    if (parsed) currentMonth.value = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  },
);

const monthLabel = computed(() => `${monthNames[currentMonth.value.getMonth()]} ${currentMonth.value.getFullYear()}`);

const minDate = computed(() => parseIso(props.min ?? ""));
const maxDate = computed(() => parseIso(props.max ?? ""));

const isDisabled = (date: Date) => {
  if (minDate.value && date < minDate.value) return true;
  if (maxDate.value && date > maxDate.value) return true;
  return false;
};

const days = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const grid: Array<{ date: Date; isCurrent: boolean }> = [];
  for (let i = 0; i < 42; i += 1) {
    if (i < firstWeekday) {
      const day = daysInPrevMonth - firstWeekday + i + 1;
      grid.push({ date: new Date(year, month - 1, day), isCurrent: false });
    } else if (i < firstWeekday + daysInMonth) {
      const day = i - firstWeekday + 1;
      grid.push({ date: new Date(year, month, day), isCurrent: true });
    } else {
      const day = i - (firstWeekday + daysInMonth) + 1;
      grid.push({ date: new Date(year, month + 1, day), isCurrent: false });
    }
  }
  return grid;
});

const selectedIso = computed(() => props.modelValue);
const displayValue = computed(() => formatDisplay(selectedIso.value));

const isSelected = (date: Date) => selectedIso.value && selectedIso.value === toIso(date);

const pickDate = (date: Date) => {
  if (isDisabled(date)) return;
  emit("update:modelValue", toIso(date));
  isOpen.value = false;
};

const clearValue = () => {
  emit("update:modelValue", "");
  isOpen.value = false;
};

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
};

const prevMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
};

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const onClickOutside = (event: MouseEvent) => {
  if (!rootRef.value) return;
  if (event.target instanceof Node && !rootRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="mt-2 w-full rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-left text-white outline-none transition focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20"
      @click.stop="toggleOpen">
      <span v-if="displayValue" class="text-white">{{ displayValue }}</span>
      <span v-else class="text-white/40">{{ placeholder ?? "Select date" }}</span>
    </button>

    <div v-if="isOpen" class="relative z-20 mt-2 w-full rounded-2xl border border-[#262C45] bg-[#1B2033] p-4 shadow-[0_20px_60px_rgba(12,14,30,0.7)] max-w-md">
      <div class="flex items-center justify-between">
        <button
          type="button"
          class="rounded-lg border border-[#262C45] bg-white/5 px-2 py-1 text-xs text-[#9AA3C7] hover:text-white transition"
          @click="prevMonth">
          Prev
        </button>
        <p class="text-sm font-semibold text-white">{{ monthLabel }}</p>
        <button
          type="button"
          class="rounded-lg border border-[#262C45] bg-white/5 px-2 py-1 text-xs text-[#9AA3C7] hover:text-white transition"
          @click="nextMonth">
          Next
        </button>
      </div>

      <div class="mt-3 grid grid-cols-7 gap-0.5 text-center text-xs text-[#9AA3C7]">
        <span v-for="day in weekdayLabels" :key="day">{{ day }}</span>
      </div>

      <div class="mt-2 grid grid-cols-7 gap-0.5 text-center text-sm">
        <button
          v-for="cell in days"
          :key="toIso(cell.date)"
          type="button"
          class="h-9 w-full rounded-lg border border-transparent transition"
          :class="[
            cell.isCurrent ? 'text-white' : 'text-white/30',
            isSelected(cell.date) ? 'bg-[#6C7CFF] text-white shadow-[0_0_16px_rgba(108,124,255,0.45)]' : 'hover:border-[#6C7CFF]/40 hover:bg-white/5',
            isDisabled(cell.date) ? 'opacity-40 pointer-events-none' : '',
          ]"
          @click="pickDate(cell.date)">
          {{ cell.date.getDate() }}
        </button>
      </div>

      <div class="mt-4 flex items-center justify-between text-xs">
        <span class="text-[#9AA3C7]">Choose a date</span>
        <button type="button" class="rounded-lg border border-[#262C45] bg-white/5 px-2 py-1 text-[#9AA3C7] hover:text-white transition" @click="clearValue">
          Clear
        </button>
      </div>
    </div>
  </div>
</template>
