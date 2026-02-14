<script setup lang="ts">
import { ref } from "vue";
import { object, string, array } from "yup";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const { push } = useToast();

const categorySchema = object({
  title: string().trim().required().min(4).max(50),
  description: string().trim().required().min(6).max(100),
  technologies: array().of(string().trim().min(1)).notRequired().nullable(),
});

const formErrors = ref<Record<string, string>>({});

const router = useRouter();

const title = ref("");
const description = ref("");
const status = ref<"active" | "hidden">("active");
const technologies = ref<string[]>([]);
const technologyInput = ref("");

const isLoading = ref(false);

const onDescriptionInput = (e: Event) => {
  const el = e.target as HTMLTextAreaElement;
  if (!el) return;

  if (el.value.length > 100) {
    el.value = el.value.slice(0, 100);
  }
  description.value = el.value;
};

const addTechnology = () => {
  const t = technologyInput.value.trim();
  if (!t) return;
  if (!technologies.value.includes(t)) technologies.value.push(t);
  technologyInput.value = "";
};

const removeTechnology = (t: string) => {
  technologies.value = technologies.value.filter((x) => x !== t);
};

const validate = async () => {
  try {
    await categorySchema.validate(
      {
        title: title.value,
        description: description.value,
        technologies: technologies.value,
      },
      { abortEarly: false },
    );

    formErrors.value = {};
    return true;
  } catch (err: any) {
    if (err.inner) {
      const errors: { [key: string]: string } = {};
      err.inner.forEach((e: any) => {
        if (e.path) errors[e.path] = e.message;
      });
      formErrors.value = errors;
    }
    return false;
  }
};

const createCategory = async () => {
  if (isLoading.value) return;

  const isValid = await validate();
  if (!isValid) return;

  isLoading.value = true;
  try {
    await $fetch("/api/admin/categories", {
      method: "POST",
      body: {
        title: title.value,
        description: description.value,
        status: status.value,
        technologies: technologies.value,
      },
    });

    title.value = "";
    description.value = "";
    status.value = "active";
    technologies.value = [];
    technologyInput.value = "";

    router.push("/admin/categories");
    push({ title: "Success", description: "Category created successfully", variant: "success", duration: 4000 });
  } catch (error) {
    console.error("Failed to create category:", error);
    push({ title: "Error", description: "Failed to create category", variant: "error", duration: 4000 });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="px-6 my-6">
    <div class="mb-4">
      <div>
        <h1 class="text-2xl font-semibold mt-1">Create category</h1>
        <p class="text-sm text-[#9AA3C7] mt-2 max-w-xl">Create a new category to organize tests. Add tags for better filtering.</p>
      </div>
    </div>

    <section>
      <div class="relative rounded-2xl border border-[#262C45] bg-gradient-to-b from-[#1b2033] to-[#14182a] overflow-hidden">
        <div v-if="isLoading" class="absolute inset-0 z-10 bg-black/35 backdrop-blur-[2px] flex items-center justify-center">
          <div class="flex items-center gap-3 rounded-xl border border-[#262C45] bg-[#14182a]/80 px-4 py-3">
            <span class="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            <span class="text-sm text-white/90">Creating category…</span>
          </div>
        </div>

        <div class="p-5 border-b border-[#262C45] flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold">Category details</p>
            <p class="text-xs text-[#9AA3C7] mt-1">Title, slug, description, tags and visibility.</p>
          </div>
        </div>

        <div class="p-5 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-[#9AA3C7]">Title</label>
              <input
                v-model="title"
                :disabled="isLoading"
                maxlength="50"
                placeholder="Frontend"
                class="mt-2 h-11 w-full rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition disabled:opacity-60 disabled:cursor-not-allowed" />
              <p v-if="formErrors.title" class="mt-1 text-xs text-rose-300">{{ formErrors.title }}</p>
              <p v-else class="mt-2 text-xs text-[#9AA3C7]">Shown to users on the website.</p>
            </div>
          </div>

          <div>
            <label class="text-sm text-[#9AA3C7]">Description</label>
            <textarea
              v-model="description"
              :disabled="isLoading"
              maxlength="100"
              @input="onDescriptionInput"
              rows="4"
              placeholder="UI, browser, frameworks and tooling."
              class="mt-2 w-full rounded-xl border border-[#262C45] bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/20 resize-none focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition disabled:opacity-60 disabled:cursor-not-allowed" />
            <div class="mt-2 flex items-center justify-between text-xs text-[#9AA3C7]">
              <div>
                <p v-if="formErrors.description" class="mt-1 text-xs text-rose-300">{{ formErrors.description }}</p>
                <span v-else>Short and searchable description.</span>
              </div>

              <span>{{ description.length }}/100</span>
            </div>
          </div>

          <div>
            <label class="text-sm text-[#9AA3C7]">Technologies</label>

            <div class="mt-2 flex flex-col md:flex-row md:items-center gap-2">
              <input
                v-model="technologyInput"
                :disabled="isLoading"
                @keydown.enter.prevent="addTechnology"
                placeholder="Add technology (Enter)…"
                class="h-11 flex-1 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#6C7CFF] focus:ring-2 focus:ring-[#6C7CFF]/20 transition disabled:opacity-60 disabled:cursor-not-allowed" />
              <button
                type="button"
                @click="addTechnology"
                :disabled="isLoading"
                class="h-11 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed">
                Add
              </button>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="t in technologies"
                :key="t"
                type="button"
                @click="removeTechnology(t)"
                class="group inline-flex items-center gap-2 rounded-full border border-[#262C45] bg-white/5 px-3 py-1 text-xs text-[#9AA3C7] hover:bg-white/10 hover:text-white transition"
                title="Remove technology">
                <span>{{ t }}</span>
                <span class="opacity-60 group-hover:opacity-100">✕</span>
              </button>
              <span v-if="technologies.length === 0" class="text-xs text-[#9AA3C7]">No technologies yet.</span>
            </div>

            <p v-if="formErrors.technologies" class="mt-1 text-xs text-rose-300">{{ formErrors.technologies }}</p>
            <p v-else class="mt-2 text-xs text-[#9AA3C7]">Click technology to remove. Technologies help search and filtering.</p>
          </div>
        </div>

        <div class="p-5 border-t border-[#262C45] flex flex-col sm:flex-row gap-2 justify-end">
          <NuxtLink to="/admin/categories" class="py-2 rounded-xl border border-[#262C45] bg-white/5 px-4 text-sm hover:bg-white/10 transition">
            Cancel
          </NuxtLink>
          <button
            @click="createCategory"
            :disabled="isLoading"
            class="rounded-xl px-4 text-sm font-semibold bg-[#6C7CFF] hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed">
            Create category
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
