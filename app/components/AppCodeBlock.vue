<script setup>
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  code: { type: String, required: true },
  language: { type: String },
});

const codeElement = ref(null);
const isCopied = ref(false);

const highlight = () => {
  if (codeElement.value) {
    codeElement.value.removeAttribute("data-highlighted");
    // eslint-disable-next-line
    // @ts-ignore - highlight.js safely handles syntax highlighting
    hljs.highlightElement(codeElement.value);
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    isCopied.value = true;

    // Через 2 секунды возвращаем текст кнопки обратно
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Ошибка при копировании:", err);
  }
};

const formattedCode = computed(() => {
  if (!props.code) return "";
  // Заменяем текстовый \n на реальный перенос строки
  return props.code.replace(/\\n/g, "\n");
});

onMounted(highlight);
watch(() => props.code, highlight);
</script>

<template>
  <div class="code-container group relative transition-all">
    <button
      @click="copyToClipboard"
      class="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 backdrop-blur-sm">
      <span v-if="!isCopied" class="flex items-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Copy
      </span>
      <span v-else class="flex items-center gap-1 text-green-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
      </span>
    </button>

    <pre class="overflow-hidden border border-[#262C45] rounded-xl"><code 
      ref="codeElement" 
      :class="[`language-${language}`, 'custom-scroll']"
    >{{ formattedCode }}</code></pre>
  </div>
</template>

<style scoped>
.code-container {
  margin: 1rem 0;
}

pre {
  max-width: 100%;
  max-height: 500px;
  overflow-x: auto;
  overflow-y: auto;
  white-space: pre;
}

pre::-webkit-scrollbar {
  height: 4px;
  width: 12px;
}

pre::-webkit-scrollbar-track {
  background: #1a1b26;
  border-radius: 0 0 12px 12px;
  width: 2px !important;
}

pre::-webkit-scrollbar-thumb {
  background: #333b5a;
  border-radius: 10px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #414868;
}

code {
  display: block;
  white-space: pre;
  tab-size: 4;
  -moz-tab-size: 4;
}

.custom-scroll::-webkit-scrollbar {
  height: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(194, 12, 12, 0.2);
}
</style>
