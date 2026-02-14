<script setup lang="ts">
import { computed } from "vue";
import { ToastAction, ToastClose, ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from "reka-ui";

const { toasts, dismiss } = useToast();

const toneClass = computed(() => ({
  info: "border-blue-400/40",
  success: "border-emerald-400/40",
  error: "border-rose-400/40",
}));

const icons = {
  info: { info: "material-symbols:info-rounded", color: "text-blue-400" },
  success: { info: "material-symbols:verified-rounded", color: "text-emerald-400" },
  error: { info: "material-symbols:error-outline", color: "text-rose-400" },
};
</script>

<template>
  <ToastProvider :duration="5000">
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :duration="toast.duration"
      class="app-toast group w-full rounded-xl border bg-[#1b2033] p-4 text-white shadow-2xl backdrop-blur-sm min-h-[90px]"
      :class="toneClass[toast.variant || 'info']"
      @update:open="(open) => !open && dismiss(toast.id)">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex items-center gap-2">
          <Icon :name="icons[toast.variant || 'info'].info" class="w-6 h-6" :class="icons[toast.variant || 'info'].color" />
          <div>
            <ToastTitle class="text-sm font-semibold text-white mb-2">{{ toast.title }}</ToastTitle>
            <ToastDescription v-if="toast.description" class="mt-1 text-xs text-[#9AA3C7]">
              {{ toast.description }}
            </ToastDescription>
          </div>
        </div>

        <ToastClose as-child>
          <button class="rounded-lg border border-[#262C45] bg-white/5 px-2 py-1 text-xs text-white hover:bg-white/10 transition">Close</button>
        </ToastClose>
      </div>

      <div v-if="toast.actionLabel" class="mt-3">
        <ToastAction as-child alt-text="Toast action">
          <button
            type="button"
            class="rounded-lg border border-[#262C45] bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10 transition"
            @click="
              toast.onAction?.();
              dismiss(toast.id);
            ">
            {{ toast.actionLabel }}
          </button>
        </ToastAction>
      </div>
    </ToastRoot>

    <ToastViewport class="fixed bottom-4 right-4 z-[999] flex w-[360px] max-w-[90vw] flex-col gap-3 outline-none" />
  </ToastProvider>
</template>
